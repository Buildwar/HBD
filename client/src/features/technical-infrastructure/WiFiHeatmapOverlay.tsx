/**
 * HBD — HOME BOARD DESIGNER
 * Wi-Fi Heatmap & Coverage Visualizer Component (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useRef, useEffect } from 'react';
import { WiFiCoverageAnalysisDto, TechnicalElementDto } from '@hbd/shared';
import { Wifi, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

interface WiFiHeatmapOverlayProps {
  coverageData: WiFiCoverageAnalysisDto | null;
  elements: TechnicalElementDto[];
  width?: number;
  height?: number;
  onRefresh: () => void;
}

export const WiFiHeatmapOverlay: React.FC<WiFiHeatmapOverlayProps> = ({
  coverageData,
  elements,
  width = 600,
  height = 450,
  onRefresh
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !coverageData || !coverageData.heatmapPoints.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Encontrar límites de la simulación
    const xs = coverageData.heatmapPoints.map((p) => p.x);
    const ys = coverageData.heatmapPoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);

    const scaleX = (width - 40) / spanX;
    const scaleY = (height - 40) / spanY;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = 20 + (width - 40 - spanX * scale) / 2;
    const offsetY = 20 + (height - 40 - spanY * scale) / 2;

    // Dibujar cuadrícula de calor
    const pointSize = Math.max(4, Math.ceil(coverageData.gridResolutionMeters * scale * 1.2));

    for (const pt of coverageData.heatmapPoints) {
      const cx = offsetX + (pt.x - minX) * scale;
      const cy = offsetY + (pt.y - minY) * scale;

      // Asignar color por RSSI
      let color = 'rgba(239, 68, 68, 0.4)'; // Red (No signal / Poor)
      if (pt.rssiDbm >= -55) {
        color = 'rgba(16, 185, 129, 0.7)'; // Emerald (Excellent)
      } else if (pt.rssiDbm >= -67) {
        color = 'rgba(59, 130, 246, 0.6)'; // Blue (Good)
      } else if (pt.rssiDbm >= -75) {
        color = 'rgba(234, 179, 8, 0.5)'; // Yellow (Fair)
      } else if (pt.rssiDbm >= -85) {
        color = 'rgba(249, 115, 22, 0.45)'; // Orange (Poor)
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, pointSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dibujar Puntos de Acceso Wi-Fi
    const aps = elements.filter(
      (e) => e.category === 'WIFI' || (e.category === 'NETWORK' && e.name.toLowerCase().includes('ap'))
    );

    for (const ap of aps) {
      const apx = offsetX + (ap.position.x - minX) * scale;
      const apy = offsetY + (ap.position.y - minY) * scale;

      // Ondas concéntricas de radiofrecuencia
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(apx, apy, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.arc(apx, apy, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Icono de AP
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(apx, apy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(ap.code || 'AP', apx + 10, apy - 8);
    }
  }, [coverageData, elements, width, height]);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Simulación de Cobertura Wi-Fi 2.4/5/6 GHz</h3>
            <p className="text-[11px] text-slate-400">Propagación RF con atenuación por muros</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium transition-colors"
        >
          Recalcular Mapa
        </button>
      </div>

      {coverageData ? (
        <div className="space-y-3">
          {/* Métricas clave */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Cobertura Total</span>
              <span className={`text-base font-bold font-mono ${coverageData.coveragePercentage >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {coverageData.coveragePercentage}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Superficie Cubierta</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {coverageData.coveredAreaM2} m²
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Puntos de Acceso</span>
              <span className="text-base font-bold font-mono text-slate-200">
                {coverageData.accessPointsCount} APs
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Zonas Muertas</span>
              <span className={`text-base font-bold font-mono ${coverageData.deadZonesCount === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {coverageData.deadZonesCount}
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
            <canvas ref={canvasRef} width={width} height={height} className="max-w-full h-auto" />

            {/* Leyenda de colores */}
            <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-sm p-2 rounded-md border border-slate-800 text-[10px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-300">Excelente (&gt; -55 dBm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span className="text-slate-300">Bueno (-55 a -67 dBm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                <span className="text-slate-300">Aceptable (-67 a -75 dBm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="text-slate-300">Zona Muerta (&lt; -75 dBm)</span>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          {coverageData.recommendations.length > 0 && (
            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 space-y-1">
              <p className="font-semibold text-cyan-200">Recomendaciones de ingeniería:</p>
              {coverageData.recommendations.map((rec, i) => (
                <p key={i} className="text-[11px] text-cyan-300/90">• {rec}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-xs">
          Haz clic en "Recalcular Mapa" para simular la propagación RF del proyecto.
        </div>
      )}
    </div>
  );
};
