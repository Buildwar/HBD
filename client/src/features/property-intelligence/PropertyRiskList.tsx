/**
 * Property Risk List Component (Phase V23 / v1.23.0)
 * Displays potential risks, safety compliance flags, and professional review requirements.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { PropertyRiskItem } from '@hbd/shared';
import { ShieldAlert, AlertTriangle, CheckCircle, ShieldCheck, Wrench } from 'lucide-react';

interface PropertyRiskListProps {
  risks: PropertyRiskItem[];
  onGenerateMore?: () => void;
}

export const PropertyRiskList: React.FC<PropertyRiskListProps> = ({ risks, onGenerateMore }) => {
  const getSeverityBadge = (severity: PropertyRiskItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Crítico</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Alto</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300">Medio</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Bajo</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          Riesgos Detectados & Puntos de Atención ({risks.length})
        </h3>
        {onGenerateMore && (
          <button
            onClick={onGenerateMore}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Evaluar Riesgos
          </button>
        )}
      </div>

      <div className="space-y-3">
        {risks.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-400 flex flex-col items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <span>No se han detectado riesgos potenciales en el análisis actual.</span>
          </div>
        ) : (
          risks.map((risk) => (
            <div
              key={risk.id}
              className={`p-4 rounded-xl border transition-colors ${
                risk.severity === 'CRITICAL' || risk.severity === 'HIGH'
                  ? 'border-rose-200 dark:border-rose-900/80 bg-rose-50/40 dark:bg-rose-950/20'
                  : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {risk.title}
                    </span>
                    {getSeverityBadge(risk.severity)}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase">
                      {risk.category}
                    </span>
                    {risk.isPotential && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 font-medium">
                        Potencial
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {risk.description}
                  </p>

                  {risk.requiresProfessionalReview && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Requiere revisión o validación por técnico / profesional competente.</span>
                    </div>
                  )}

                  {risk.mitigationSuggestion && (
                    <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1">
                      <Wrench className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Propuesta: {risk.mitigationSuggestion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
