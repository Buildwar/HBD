/**
 * Property Opportunity List Component (Phase V23 / v1.23.0)
 * Displays identified improvement potential, estimated costs, impact scores, and AI suggestions.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { PropertyOpportunityItem } from '@hbd/shared';
import { Lightbulb, Sparkles, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

interface PropertyOpportunityListProps {
  opportunities: PropertyOpportunityItem[];
  onGenerateMore?: () => void;
}

export const PropertyOpportunityList: React.FC<PropertyOpportunityListProps> = ({
  opportunities,
  onGenerateMore,
}) => {
  const getPriorityBadge = (priority: PropertyOpportunityItem['priority']) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Alta Prioridad</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">Media</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Baja</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Oportunidades de Mejora & Potencial ({opportunities.length})
        </h3>
        {onGenerateMore && (
          <button
            onClick={onGenerateMore}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Detectar Mejoras
          </button>
        )}
      </div>

      <div className="space-y-3">
        {opportunities.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-400">
            No se han generado oportunidades de mejora para este inmueble.
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-750/40 hover:border-amber-200 dark:hover:border-amber-800/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {opp.title}
                    </span>
                    {getPriorityBadge(opp.priority)}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase">
                      {opp.category}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Fuente: {opp.source}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    {opp.estimatedCostEur && (
                      <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                        <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                        Coste estimado: {opp.estimatedCostEur.toLocaleString()} €
                      </span>
                    )}
                    {opp.potentialSavingsEur && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Ahorro estimado: {opp.potentialSavingsEur.toLocaleString()} €/año
                      </span>
                    )}
                    <span className="text-[11px]">
                      Impacto: {opp.impactScore}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
