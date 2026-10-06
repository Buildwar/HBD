/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Transformation Chart — Visual Allocation of Budget & Investment
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { FinancialSummaryDto, CostCategory } from '@hbd/shared';

interface FinancialTransformationChartProps {
  summary: FinancialSummaryDto;
}

const CATEGORY_COLORS: Record<CostCategory, string> = {
  PROPERTY_ACQUISITION: '#3b82f6', // blue
  RENOVATION: '#10b981', // emerald
  FURNITURE: '#f59e0b', // amber
  APPLIANCES: '#8b5cf6', // purple
  EQUIPMENT: '#06b6d4', // cyan
  PROFESSIONAL_SERVICES: '#ec4899', // pink
  LOGISTICS: '#64748b', // slate
  PERMITS: '#f97316', // orange
  CONTINGENCY: '#eab308', // yellow
  OTHER: '#a855f7', // violet
};

const CATEGORY_LABELS: Record<CostCategory, string> = {
  PROPERTY_ACQUISITION: 'Adquisición Inmueble',
  RENOVATION: 'Reforma & Obra',
  FURNITURE: 'Mobiliario',
  APPLIANCES: 'Electrodomésticos',
  EQUIPMENT: 'Equipamiento & Clima',
  PROFESSIONAL_SERVICES: 'Servicios Profesionales',
  LOGISTICS: 'Logística & Montaje',
  PERMITS: 'Licencias & Tasas',
  CONTINGENCY: 'Contingencia / Colchón',
  OTHER: 'Otros Costes',
};

export const FinancialTransformationChart: React.FC<FinancialTransformationChartProps> = ({
  summary,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  const activeCategories = summary.categories.filter((c) => c.effectiveAmount > 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Distribución Presupuestaria de Transformación
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ponderación por pilares de coste excluyendo adquisición inmobiliaria
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Total Transformación</div>
          <div className="text-base font-bold text-emerald-400">
            {formatCurrency(summary.totalTransformationCost)}
          </div>
        </div>
      </div>

      {/* Multi-segmented Progress Bar */}
      <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        {activeCategories
          .filter((c) => c.category !== 'PROPERTY_ACQUISITION')
          .map((cat) => {
            const width = cat.percentageOfTransformation;
            if (width <= 0) return null;
            return (
              <div
                key={cat.category}
                title={`${CATEGORY_LABELS[cat.category]}: ${formatCurrency(cat.effectiveAmount)} (${width}%)`}
                style={{
                  width: `${width}%`,
                  backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8',
                }}
                className="h-full transition-all duration-300 hover:opacity-80 relative group cursor-pointer"
              />
            );
          })}
      </div>

      {/* Legend & Breakdown List */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
        {activeCategories
          .filter((c) => c.category !== 'PROPERTY_ACQUISITION')
          .map((cat) => (
            <div key={cat.category} className="flex items-start space-x-2.5">
              <span
                className="w-3 h-3 rounded-sm mt-0.5 shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-300 truncate">
                  {CATEGORY_LABELS[cat.category]}
                </div>
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{formatCurrency(cat.effectiveAmount)}</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {cat.percentageOfTransformation}%
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
