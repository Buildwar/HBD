/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Budget Breakdown Card Component
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import { BudgetEstimationPayload } from '@hbd/shared';
import { Calculator, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface Props {
  payload: BudgetEstimationPayload;
}

export const CopilotBudgetCard: React.FC<Props> = ({ payload }) => {
  return (
    <div className="mt-3 p-4 bg-slate-900/80 border border-slate-700/80 rounded-xl space-y-3 text-sm">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Calculator className="w-4 h-4" />
          <span>Desglose Estimado de Presupuesto</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total Estimado:</span>
          <span className="ml-1 text-base font-bold text-white">
            {payload.totalEstimate.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {payload.currency}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tarifas Confirmadas</span>
          </div>
          <p className="text-base font-bold text-emerald-200 mt-0.5">
            {payload.knownTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {payload.currency}
          </p>
        </div>

        <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded-lg">
          <div className="flex items-center gap-1 text-amber-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Mano de Obra Estimada</span>
          </div>
          <p className="text-base font-bold text-amber-200 mt-0.5">
            {payload.estimatedTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {payload.currency}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        {payload.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1.5 px-2 bg-slate-800/60 rounded border border-slate-700/40 text-xs"
          >
            <div className="flex flex-col">
              <span className="font-medium text-slate-200">{item.name}</span>
              <span className="text-[10px] text-slate-400">
                {item.category} • {item.notes || item.source}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">
                {item.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {item.currency}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                  item.isEstimated
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {item.isEstimated ? 'ESTIMATED' : 'CONFIRMED'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {payload.disclaimer && (
        <div className="flex items-start gap-1.5 text-[11px] text-slate-400 bg-slate-800/40 p-2 rounded border border-slate-700/30">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <span>{payload.disclaimer}</span>
        </div>
      )}
    </div>
  );
};
