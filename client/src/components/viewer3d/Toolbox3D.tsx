/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Barra de Herramientas y Controles 3D (Toolbox3D)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState } from 'react';
import {
  MousePointer,
  Move,
  RotateCw,
  Ruler,
  Footprints,
  Sun,
  Moon,
  Layers,
  Camera,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Eye,
  EyeOff,
  Boxes,
} from 'lucide-react';
import { CameraPreset, SceneLightingMode, Scene3DLayerVisibility } from '@hbd/shared';

export type Tool3D = 'select' | 'move' | 'rotate' | 'measure' | 'walkthrough';

interface Toolbox3DProps {
  activeTool: Tool3D;
  onSelectTool: (tool: Tool3D) => void;
  lightingMode: SceneLightingMode;
  onToggleLighting: () => void;
  cameraPresets: CameraPreset[];
  activePresetId?: string;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  layerVisibility: Scene3DLayerVisibility;
  onToggleLayer: (layer: keyof Scene3DLayerVisibility) => void;
  onResetCamera: () => void;
  onCaptureSnapshot: () => void;
}

export const Toolbox3D: React.FC<Toolbox3DProps> = ({
  activeTool,
  onSelectTool,
  lightingMode,
  onToggleLighting,
  cameraPresets,
  activePresetId,
  onSelectCameraPreset,
  layerVisibility,
  onToggleLayer,
  onResetCamera,
  onCaptureSnapshot,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  const activePreset = cameraPresets.find((p) => p.id === activePresetId) || cameraPresets[0];

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
      {/* Grupo 1: Herramientas Principales */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-2xl flex items-center gap-1">
        <button
          title="Seleccionar elemento (Pared, Suelo, Mueble, etc.)"
          onClick={() => onSelectTool('select')}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
            activeTool === 'select'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <MousePointer className="w-4 h-4" />
          <span className="hidden sm:inline">Seleccionar</span>
        </button>

        <button
          title="Gizmo de Mover Muebles (X/Z)"
          onClick={() => onSelectTool('move')}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
            activeTool === 'move'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Move className="w-4 h-4" />
          <span className="hidden sm:inline">Mover</span>
        </button>

        <button
          title="Gizmo de Rotar Muebles (Eje Y)"
          onClick={() => onSelectTool('rotate')}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
            activeTool === 'rotate'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          <span className="hidden sm:inline">Rotar</span>
        </button>

        <button
          title="Medir distancia láser 3D entre 2 puntos"
          onClick={() => onSelectTool('measure')}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
            activeTool === 'measure'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span className="hidden sm:inline">Medir</span>
        </button>

        <button
          title="Modo Recorrido en Primera Persona (WASD + Ratón)"
          onClick={() => onSelectTool('walkthrough')}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
            activeTool === 'walkthrough'
              ? 'bg-amber-600 text-white shadow-md animate-pulse'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>Recorrido</span>
        </button>
      </div>

      {/* Grupo 2: Selector de Vistas / Cámaras */}
      <div className="relative">
        <button
          onClick={() => {
            setShowPresetsMenu(!showPresetsMenu);
            setShowLayersMenu(false);
          }}
          className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 shadow-2xl flex items-center gap-2 transition-colors"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>{activePreset ? activePreset.name : 'Vistas 3D'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showPresetsMenu && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 flex flex-col gap-1 max-h-80 overflow-y-auto">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Vistas Principales
            </div>
            {cameraPresets.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectCameraPreset(p);
                  setShowPresetsMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  activePresetId === p.id
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] text-slate-500">{p.description}</span>
              </button>
            ))}

            {cameraPresets.length > 4 && (
              <>
                <div className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-t border-slate-800">
                  Enfocar Estancias
                </div>
                {cameraPresets.slice(4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectCameraPreset(p);
                      setShowPresetsMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      activePresetId === p.id
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Grupo 3: Capas 3D */}
      <div className="relative">
        <button
          onClick={() => {
            setShowLayersMenu(!showLayersMenu);
            setShowPresetsMenu(false);
          }}
          className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 shadow-2xl flex items-center gap-2 transition-colors"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="hidden md:inline">Capas 3D</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showLayersMenu && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 flex flex-col gap-1.5">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Visibilidad de Elementos
            </div>
            {(
              [
                { key: 'walls', label: '🧱 Paredes' },
                { key: 'floors', label: '🪵 Suelos' },
                { key: 'ceilings', label: '🏠 Techos' },
                { key: 'doors', label: '🚪 Puertas' },
                { key: 'windows', label: '🪟 Ventanas' },
                { key: 'furniture', label: '🛋️ Mobiliario' },
                { key: 'dimensions3D', label: '📐 Cotas 3D' },
                { key: 'wireframe', label: '🕸️ Modo Estructura' },
              ] as const
            ).map(({ key, label }) => {
              const visible = layerVisibility[key];
              return (
                <button
                  key={key}
                  onClick={() => onToggleLayer(key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    visible
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{label}</span>
                  {visible ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grupo 4: Iluminación Día / Noche */}
      <button
        onClick={onToggleLighting}
        title={`Cambiar a modo ${lightingMode === 'day' ? 'Noche' : 'Día'}`}
        className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 shadow-2xl flex items-center gap-2 transition-colors"
      >
        {lightingMode === 'day' ? (
          <>
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Día</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Noche</span>
          </>
        )}
      </button>

      {/* Grupo 5: Captura y Reset */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-2xl flex items-center gap-1">
        <button
          onClick={onCaptureSnapshot}
          title="Capturar imagen renderizada de la vista 3D"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onResetCamera}
          title="Centrar vista de cámara"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
