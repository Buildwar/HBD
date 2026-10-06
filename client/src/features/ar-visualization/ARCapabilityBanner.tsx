/**
 * AR Capability Banner (Phase V22 / v1.22.0)
 * Displays current AR hardware mode, tracking state, and fallback diagnostic information.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { ARCapabilityCheckResult, ARMode } from '@hbd/shared';
import { Sparkles, Camera, Smartphone, Eye, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface ARCapabilityBannerProps {
  capabilities: ARCapabilityCheckResult | null;
  currentMode: ARMode;
  onModeSelect: (mode: ARMode) => void;
  onRefreshCapabilities: () => void;
}

export const ARCapabilityBanner: React.FC<ARCapabilityBannerProps> = ({
  capabilities,
  currentMode,
  onModeSelect,
  onRefreshCapabilities,
}) => {
  const modes: { id: ARMode; label: string; icon: any; description: string }[] = [
    {
      id: 'WEBXR_IMMERSIVE',
      label: 'WebXR Inmersivo',
      icon: Eye,
      description: 'AR completa con detección de superficies y tracking 6DoF',
    },
    {
      id: 'CAMERA_TRACKED',
      label: 'Cámara + Giroscopio',
      icon: Smartphone,
      description: 'Superposición con sensores de orientación del dispositivo',
    },
    {
      id: 'PHOTO_AR',
      label: 'Foto AR / Proyección',
      icon: Camera,
      description: 'Superposición sobre fotografía del espacio real',
    },
    {
      id: 'AR_PREVIEW',
      label: 'Simulador 3D AR',
      icon: Sparkles,
      description: 'Vista previa interactiva en canvas 3D con plano de referencia',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Modo de Visualización AR & Espacio Real
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Detección de hardware: {capabilities?.recommendedMode ? capabilities.recommendedMode.replace('_', ' ') : 'Simulador listo'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {capabilities?.isSupported ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Hardware Compatible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" /> Modo Simulación / Foto AR
            </span>
          )}
          <button
            onClick={onRefreshCapabilities}
            className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Redetectar sensores"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeSelect(m.id)}
              className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-850'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-800 dark:text-gray-200'}`}>
                  {m.label}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                {m.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
