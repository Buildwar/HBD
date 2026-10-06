/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Summary Cards Component — Dual Totals & Key Financial Metrics
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Hammer,
  Sofa,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  PieChart,
} from 'lucide-react';
import { FinancialSummaryDto } from '@hbd/shared';

interface FinancialSummaryCardsProps {
  summary: FinancialSummaryDto;
  onOpenAcquisitionModal: () => void;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  summary,
  onOpenAcquisitionModal,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  const isOverBudget = summary.varianceStatus === 'OVER_BUDGET';
  const isUnderBudget = summary.varianceStatus === 'UNDER_BUDGET';

  return (
    <div className="space-y-4">
      {/* Top Banner: Dual Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Coste del Proyecto (Transformación) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Coste del Proyecto (Transformación)
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Hammer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">
              {formatCurrency(summary.totalTransformationCost)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Estimado inicial: {formatCurrency(summary.totalEstimatedTransformationCost)}</span>
            {summary.projectAreaSquareMeters > 0 && (
              <span className="text-slate-300 font-medium">
                {formatCurrency(summary.costPerSquareMeterTransformation)} / m²
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Inversión Total (Incluyendo Adquisición) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Inversión Total
            </span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">
              {formatCurrency(summary.totalInvestment)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            {summary.hasAcquisitionData ? (
              <span className="text-slate-400">
                Inmueble: {formatCurrency(summary.propertyAcquisitionCost)}
              </span>
            ) : (
              <button
                onClick={onOpenAcquisitionModal}
                className="text-blue-400 hover:text-blue-300 font-medium hover:underline text-xs"
              >
                + Añadir compra del inmueble
              </button>
            )}
            {summary.projectAreaSquareMeters > 0 && (
              <span className="text-slate-300 font-medium">
                {formatCurrency(summary.costPerSquareMeterTotalInvestment)} / m²
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Estado de Tesorería & Pagos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Tesorería & Desembolsos
            </span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-white">
                {formatCurrency(summary.totalPaidAmount)}
              </span>
              <span className="text-xs text-slate-400 ml-1">pagado</span>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              {summary.paymentProgressPercentage}%
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.paymentProgressPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Pendiente:</span>
              <span className="font-semibold text-slate-200">
                {formatCurrency(summary.totalPendingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Desviación Presupuestaria */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Control de Desviación
            </span>
            <div
              className={`p-2 rounded-lg ${
                isOverBudget
                  ? 'bg-red-500/10 text-red-400'
                  : isUnderBudget
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-purple-500/10 text-purple-400'
              }`}
            >
              {isOverBudget ? (
                <AlertTriangle className="w-5 h-5" />
              ) : isUnderBudget ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-3xl font-black ${
                isOverBudget
                  ? 'text-red-400'
                  : isUnderBudget
                  ? 'text-emerald-400'
                  : 'text-purple-400'
              }`}
            >
              {summary.totalBudgetVariance > 0 ? '+' : ''}
              {formatCurrency(summary.totalBudgetVariance)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {isOverBudget
                ? 'Sobrecoste registrado'
                : isUnderBudget
                ? 'Ahorro sobre estimación'
                : 'Presupuesto equilibrado'}
            </span>
            <span
              className={`font-bold ${
                isOverBudget
                  ? 'text-red-400'
                  : isUnderBudget
                  ? 'text-emerald-400'
                  : 'text-purple-400'
              }`}
            >
              {summary.variancePercentage > 0 ? '+' : ''}
              {summary.variancePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Mini Pillar Strip: Core segregated breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-400">Reforma & Obra</div>
          <div className="text-base font-bold text-white mt-1">
            {formatCurrency(summary.renovationCost)}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-400">Mobiliario</div>
          <div className="text-base font-bold text-white mt-1">
            {formatCurrency(summary.furnitureCost)}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-400">Electrodomésticos</div>
          <div className="text-base font-bold text-white mt-1">
            {formatCurrency(summary.appliancesCost)}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-400">Equipamiento</div>
          <div className="text-base font-bold text-white mt-1">
            {formatCurrency(summary.equipmentCost)}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-400">Profesionales</div>
          <div className="text-base font-bold text-white mt-1">
            {formatCurrency(summary.professionalServicesCost)}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-400">Logística & Tasas</div>
          <div className="text-base font-bold text-white mt-1">
            {formatCurrency(summary.logisticsCost + summary.permitsCost + summary.contingencyCost + summary.otherCost)}
          </div>
        </div>
      </div>
    </div>
  );
};
