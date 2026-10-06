/**
 * Property Data Quality Gauge Component (Phase V23 / v1.23.0)
 * Displays data completeness, source reliability, and field audit status.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { PropertyDataQualityDto } from '@hbd/shared';
import { Award, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';

interface PropertyDataQualityGaugeProps {
  quality: PropertyDataQualityDto;
}

export const PropertyDataQualityGauge: React.FC<PropertyDataQualityGaugeProps> = ({ quality }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Calidad y Completitud del Dato
        </h3>
        <span className={`text-sm font-bold ${getScoreColor(quality.completionPercentage)}`}>
          {quality.completionPercentage}% Completo
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full ${getProgressColor(quality.completionPercentage)} transition-all duration-500`}
          style={{ width: `${quality.completionPercentage}%` }}
        />
      </div>

      {/* Breakdown counters */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
          <div className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">
            {quality.confirmedFieldsCount}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Confirmados</div>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
          <div className="font-bold text-blue-800 dark:text-blue-200 text-sm">
            {quality.calculatedFieldsCount}
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400">Calculados</div>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
          <div className="font-bold text-amber-800 dark:text-amber-200 text-sm">
            {quality.estimatedFieldsCount}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400">Estimados</div>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
          <div className="font-bold text-gray-700 dark:text-gray-300 text-sm">
            {quality.unknownFieldsCount}
          </div>
          <div className="text-[10px] text-gray-500">Desconocidos</div>
        </div>
      </div>

      {/* Recommendations */}
      {quality.recommendations.length > 0 && (
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
            Recomendaciones para mejorar el análisis:
          </span>
          <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400 list-disc list-inside">
            {quality.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
