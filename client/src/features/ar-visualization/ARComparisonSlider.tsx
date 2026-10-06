/**
 * AR Comparison Slider & Overlay Component (Phase V22 / v1.22.0)
 * Visual comparison between real physical space capture and virtual HBD model projection.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { ARComparisonConfig } from '@hbd/shared';
import { Columns, Sliders, Layers, Eye } from 'lucide-react';

interface ARComparisonSliderProps {
  config: ARComparisonConfig;
  onChange: (updates: Partial<ARComparisonConfig>) => void;
  realImageUrl?: string;
  virtualRenderUrl?: string;
}

export const ARComparisonSlider: React.FC<ARComparisonSliderProps> = ({
  config,
  onChange,
  realImageUrl,
  virtualRenderUrl,
}) => {
  const modes: { id: ARComparisonConfig['mode']; label: string; icon: any }[] = [
    { id: 'BEFORE_AFTER_SLIDER', label: 'Deslizador Dividido', icon: Sliders },
    { id: 'SIDE_BY_SIDE', label: 'Lado a Lado', icon: Columns },
    { id: 'OPACITY_OVERLAY', label: 'Transparencia / Fusión', icon: Layers },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60 mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Comparativa Espacio Real vs Proyecto HBD
        </h4>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = config.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onChange({ mode: m.id })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Comparison Viewport */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700 select-none">
        {config.mode === 'SIDE_BY_SIDE' ? (
          <div className="grid grid-cols-2 w-full h-full">
            <div className="relative h-full border-r border-gray-700/60 overflow-hidden bg-slate-800 flex items-center justify-center">
              {realImageUrl ? (
                <img src={realImageUrl} alt="Espacio Real" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <div className="text-xs font-medium text-gray-400">Espacio Físico Real</div>
                  <div className="text-[11px] text-gray-500 mt-1">Sin fotografía cargada</div>
                </div>
              )}
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                Realidad (Antes)
              </span>
            </div>

            <div className="relative h-full overflow-hidden bg-indigo-950/40 flex items-center justify-center">
              {virtualRenderUrl ? (
                <img src={virtualRenderUrl} alt="Virtual HBD" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <div className="text-xs font-medium text-indigo-300">Proyecto HBD 3D</div>
                  <div className="text-[11px] text-indigo-400 mt-1">Render / Gemelo Digital</div>
                </div>
              )}
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-indigo-900/80 text-white text-[10px] font-semibold">
                Proyecto HBD (Después)
              </span>
            </div>
          </div>
        ) : config.mode === 'OPACITY_OVERLAY' ? (
          <div className="relative w-full h-full">
            {/* Base physical photo */}
            {realImageUrl ? (
              <img src={realImageUrl} alt="Espacio Real" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-400 text-xs">
                Fondo Espacio Físico
              </div>
            )}

            {/* Virtual overlay with variable opacity */}
            <div
              className="absolute inset-0 transition-opacity duration-75 flex items-center justify-center"
              style={{ opacity: config.overlayOpacity }}
            >
              {virtualRenderUrl ? (
                <img src={virtualRenderUrl} alt="Virtual HBD" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-950/70 backdrop-blur-[1px] flex items-center justify-center text-indigo-200 text-xs">
                  Capa de Mobiliario & Geometría HBD
                </div>
              )}
            </div>

            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
              Superposición Fusionada ({(config.overlayOpacity * 100).toFixed(0)}%)
            </span>
          </div>
        ) : (
          /* BEFORE_AFTER_SLIDER */
          <div className="relative w-full h-full overflow-hidden">
            {/* Background Virtual */}
            {virtualRenderUrl ? (
              <img src={virtualRenderUrl} alt="Virtual HBD" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <div className="w-full h-full bg-indigo-950/60 flex items-center justify-center text-indigo-200 text-xs absolute inset-0">
                Proyecto HBD 3D (Después)
              </div>
            )}

            {/* Foreground Real Clip */}
            <div
              className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-2xl"
              style={{ width: `${config.sliderPosition}%` }}
            >
              {realImageUrl ? (
                <img
                  src={realImageUrl}
                  alt="Espacio Real"
                  className="absolute inset-0 h-full object-cover"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-400 text-xs">
                  Espacio Físico Real (Antes)
                </div>
              )}
            </div>

            {/* Splitter Line Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center -ml-0.5 pointer-events-none"
              style={{ left: `${config.sliderPosition}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 font-bold text-xs border border-gray-300">
                ↔
              </div>
            </div>

            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
              Real
            </span>
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-indigo-900/80 text-white text-[10px] font-semibold">
              Proyecto HBD
            </span>
          </div>
        )}
      </div>

      {/* Interactive Controls */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        {config.mode === 'BEFORE_AFTER_SLIDER' && (
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 font-medium">
              Posición Deslizador ({config.sliderPosition}%)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={config.sliderPosition}
              onChange={(e) => onChange({ sliderPosition: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        )}

        {config.mode === 'OPACITY_OVERLAY' && (
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 font-medium">
              Opacidad Virtual ({Math.round(config.overlayOpacity * 100)}%)
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.overlayOpacity}
              onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        )}

        <div className="flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showTechnicalInfrastructure ?? true}
              onChange={(e) => onChange({ showTechnicalInfrastructure: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Instalaciones V21
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showWireframeOverlay ?? false}
              onChange={(e) => onChange({ showWireframeOverlay: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Modo Malla
          </label>
        </div>
      </div>
    </div>
  );
};
