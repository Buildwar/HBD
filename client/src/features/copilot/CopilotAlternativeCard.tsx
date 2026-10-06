/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Design Alternative Comparison Card Component
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import { DesignAlternativePayload, AICopilotAction } from '@hbd/shared';
import { Layers, Sparkles, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface Props {
  alternatives: DesignAlternativePayload[];
  onApplyAlternative?: (action: AICopilotAction) => void;
}

export const CopilotAlternativeCard: React.FC<Props> = ({ alternatives, onApplyAlternative }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
        <Layers className="w-3.5 h-3.5" />
        <span>Propuestas y Alternativas de Diseño</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {alternatives.map((alt) => (
          <div
            key={alt.id}
            className="p-3.5 bg-slate-900/80 border border-slate-700/80 rounded-xl space-y-2.5 text-xs hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{alt.title}</h4>
                <p className="text-slate-400 text-xs mt-0.5">{alt.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block">Inversión Estimada:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {alt.estimatedCostEur.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                </span>
              </div>
            </div>

            {alt.highlights && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {alt.highlights.map((hl, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-purple-950/40 border border-purple-800/40 text-purple-300 rounded-full text-[10px]"
                  >
                    ✦ {hl}
                  </span>
                ))}
              </div>
            )}

            {alt.tradeOffs && alt.tradeOffs.length > 0 && (
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/40 space-y-1 text-[11px]">
                <span className="font-semibold text-slate-300">Compromisos & Trade-offs:</span>
                {alt.tradeOffs.map((to, j) => (
                  <div key={j} className="space-y-0.5">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>{to.advantage}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <TrendingDown className="w-3 h-3" />
                      <span>{to.drawback}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {alt.actions && alt.actions.length > 0 && onApplyAlternative && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => onApplyAlternative(alt.actions[0])}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>Crear Escenario de Trabajo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
