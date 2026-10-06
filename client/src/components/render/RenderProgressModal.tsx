/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Modal de Progreso del Render Arquitectónico (RenderProgressModal)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { RenderQuality, RenderResolution } from '@hbd/shared';

interface RenderProgressModalProps {
  isOpen: boolean;
  progress: number;
  stageName: string;
  resolutionName: string;
  qualityName: string;
  onCancel: () => void;
}

export const RenderProgressModal: React.FC<RenderProgressModalProps> = ({
  isOpen,
  progress,
  stageName,
  resolutionName,
  qualityName,
  onCancel,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const steps = [
    { label: t('render.stepGeom'), min: 0, max: 25 },
    { label: t('render.stepLight'), min: 25, max: 55 },
    { label: t('render.stepPbr'), min: 55, max: 85 },
    { label: t('render.stepPost'), min: 85, max: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-950">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-base font-semibold text-white mb-1">
          {t('render.progressTitle')}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {t('render.resolution')} <span className="text-slate-200 font-medium">{resolutionName}</span> · {t('render.quality')}{' '}
          <span className="text-emerald-400 font-medium">{qualityName}</span>
        </p>

        {/* Barra de Progreso */}
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-2 border border-slate-700/60 p-0.5">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-md"
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          />
        </div>

        <div className="w-full flex justify-between text-[11px] text-slate-400 mb-6">
          <span className="font-medium text-slate-300">{stageName}</span>
          <span className="font-mono text-emerald-400 font-semibold">{Math.round(progress)}%</span>
        </div>

        {/* Pasos */}
        <div className="w-full space-y-2 text-left text-xs mb-6 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          {steps.map((s, idx) => {
            const isDone = progress >= s.max;
            const isCurrent = progress >= s.min && progress < s.max;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 text-[11px] transition-colors ${
                  isDone
                    ? 'text-emerald-400 font-medium'
                    : isCurrent
                    ? 'text-white font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                )}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          {t('render.cancelRender')}
        </button>
      </div>
    </div>
  );
};
