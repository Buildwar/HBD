/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * VisionImageViewer — Visor Interactivo de Imágenes con Detecciones y Bounding Boxes
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Armchair,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import {
  ProjectImageDto,
  VisionAnalysisResult,
  FurnitureDetection,
} from '@hbd/shared';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

interface VisionImageViewerProps {
  image: ProjectImageDto;
  analysis?: VisionAnalysisResult | null;
  selectedDetectionId?: string | null;
  onSelectDetection?: (detection: FurnitureDetection | null) => void;
}

export const VisionImageViewer: React.FC<VisionImageViewerProps> = ({
  image,
  analysis,
  selectedDetectionId,
  onSelectDetection,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showOverlays, setShowOverlays] = useState(true);
  const [hoveredDetectionId, setHoveredDetectionId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const detections = analysis?.detectedObjects || [];

  return (
    <div className="relative w-full h-[520px] bg-slate-950/90 rounded-2xl border border-dark-border overflow-hidden flex flex-col select-none">
      {/* Barra de Controles Superior */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            {analysis ? 'Análisis de Visión Activo' : 'Imagen de Galería'}
          </span>
          {analysis && (
            <Badge variant="brand">
              {Math.round(analysis.confidenceScore * 100)}% Confianza
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
              showOverlays
                ? 'bg-brand-500/20 text-brand-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mostrar / Ocultar Bounding Boxes"
          >
            {showOverlays ? <Eye size={15} /> : <EyeOff size={15} />}
            <span className="text-[11px] hidden sm:inline">Detecciones</span>
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Acercar"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Alejar"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Restablecer vista"
          >
            <Maximize size={15} />
          </button>
        </div>
      </div>

      {/* Área del Canvas / Imagen */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative flex-1 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative inline-block max-w-full max-h-full"
        >
          {/* Imagen Base */}
          <img
            src={image.url}
            alt={image.originalFilename}
            className="max-w-[700px] max-h-[440px] object-contain rounded-xl shadow-2xl pointer-events-none"
          />

          {/* Capa de Bounding Boxes (SVG Overlay) */}
          {showOverlays && detections.length > 0 && (
            <div className="absolute inset-0 pointer-events-auto">
              {detections.map((det) => {
                const isSelected = selectedDetectionId === det.id;
                const isHovered = hoveredDetectionId === det.id;

                const left = `${det.boundingBox.x * 100}%`;
                const top = `${det.boundingBox.y * 100}%`;
                const width = `${det.boundingBox.width * 100}%`;
                const height = `${det.boundingBox.height * 100}%`;

                return (
                  <div
                    key={det.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDetection?.(isSelected ? null : det);
                    }}
                    onMouseEnter={() => setHoveredDetectionId(det.id)}
                    onMouseLeave={() => setHoveredDetectionId(null)}
                    style={{ left, top, width, height }}
                    className={`absolute cursor-pointer transition-all rounded-lg border-2 ${
                      isSelected
                        ? 'border-brand-400 bg-brand-500/20 shadow-lg shadow-brand-500/30'
                        : isHovered
                        ? 'border-amber-400 bg-amber-500/15'
                        : 'border-indigo-400/80 bg-indigo-500/10 hover:border-amber-400 hover:bg-amber-500/15'
                    }`}
                  >
                    {/* Etiqueta Flotante sobre el Bounding Box */}
                    <div
                      className={`absolute -top-7 left-0 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider whitespace-nowrap shadow-md flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white'
                          : isHovered
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900/90 text-indigo-200 border border-indigo-500/40'
                      }`}
                    >
                      <Armchair size={11} />
                      <span>{det.label}</span>
                      <span className="opacity-80">({Math.round(det.confidence * 100)}%)</span>
                    </div>

                    {/* Dimensiones Estimadas */}
                    {(isSelected || isHovered) && (
                      <div className="absolute -bottom-6 left-0 px-1.5 py-0.5 rounded bg-slate-900/95 text-[9px] text-slate-300 border border-slate-700 shadow-md">
                        {det.estimatedDimensions.widthM}m × {det.estimatedDimensions.depthM}m (Estimada)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Resumen Inferior de Detecciones */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
            Detectados ({detections.length}):
          </span>
          {detections.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDetection?.(selectedDetectionId === d.id ? null : d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedDetectionId === d.id
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Armchair size={12} />
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Validación Humana Requerida</span>
        </div>
      </div>
    </div>
  );
};
