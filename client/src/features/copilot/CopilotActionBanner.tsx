/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Action Confirmation Banner Component
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import { AICopilotAction } from '@hbd/shared';
import { AlertTriangle, Check, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  action: AICopilotAction;
  onConfirm: (actionId: string) => void;
  onCancel: (actionId: string) => void;
}

export const CopilotActionBanner: React.FC<Props> = ({ action, onConfirm, onCancel }) => {
  const isPending = action.status === 'PENDING';
  const isExecuted = action.status === 'EXECUTED';
  const isCancelled = action.status === 'CANCELLED' || action.status === 'REJECTED';

  return (
    <div
      className={`mt-3 p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
        isExecuted
          ? 'bg-emerald-950/20 border-emerald-800/60'
          : isCancelled
          ? 'bg-slate-900/60 border-slate-800 opacity-70'
          : action.riskLevel === 'HIGH'
          ? 'bg-amber-950/30 border-amber-600/60'
          : 'bg-indigo-950/30 border-indigo-700/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isExecuted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : action.riskLevel === 'HIGH' ? (
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          )}
          <span className="font-semibold text-slate-100">
            {action.type.replace(/_/g, ' ')}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
            isExecuted
              ? 'bg-emerald-500/20 text-emerald-300'
              : isCancelled
              ? 'bg-slate-700/40 text-slate-400'
              : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {action.status}
        </span>
      </div>

      <p className="text-slate-300 text-xs">{action.reason}</p>

      {isPending && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onCancel(action.id)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Descartar</span>
          </button>
          <button
            type="button"
            onClick={() => onConfirm(action.id)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirmar y Aplicar</span>
          </button>
        </div>
      )}
    </div>
  );
};
