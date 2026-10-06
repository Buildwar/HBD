/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Summary Cards Component — Key Purchasing & Sourcing Metrics
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { ProcurementSummaryDto, ProcurementPlanningDto } from '@hbd/shared';

interface ProcurementSummaryCardsProps {
  summary: ProcurementSummaryDto;
  planning?: ProcurementPlanningDto | null;
  onSyncPurchases: () => void;
  syncing?: boolean;
}

export const ProcurementSummaryCards: React.FC<ProcurementSummaryCardsProps> = ({
  summary,
  planning,
  onSyncPurchases,
  syncing = false,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  const completionPercent = summary.totalPurchasesCount > 0
    ? Math.round((summary.receivedPurchasesCount / summary.totalPurchasesCount) * 100)
    : 0;

  const criticalCount = planning?.criticalItems?.length || 0;

  return (
    <div className="space-y-4">
      {/* Top Banner: Dual Sourcing & Purchasing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Presupuestado en Compras */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Presupuesto Aprovisionamiento
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">
              {formatCurrency(summary.totalEstimatedPurchasingBudget)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{summary.totalPurchasesCount} partidas requeridas</span>
            <span className="text-slate-300 font-medium">
              {formatCurrency(summary.totalCommittedPurchasingCost)} comprometido
            </span>
          </div>
        </div>

        {/* Card 2: Importe Pendiente de Pedir */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Pendiente de Pedir
            </span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-300">
              {formatCurrency(summary.pendingToOrderAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{summary.pendingPurchasesCount} partidas por ordenar</span>
            <span className="text-amber-400/80 font-medium">Requiere acción</span>
          </div>
        </div>

        {/* Card 3: En Tránsito / Recepción */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              En Tránsito / Entregas
            </span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-blue-300">
              {summary.inTransitPurchasesCount}
            </span>
            <span className="text-sm font-normal text-slate-400 ml-2">pedidos activos</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Recibidos: {summary.receivedPurchasesCount}</span>
            <span className="text-emerald-400 font-medium">{completionPercent}% completado</span>
          </div>
        </div>

        {/* Card 4: Riesgos e Incidencias */}
        <div className={`border rounded-xl p-5 relative overflow-hidden shadow-lg ${
          criticalCount > 0 || summary.incidentsCount > 0
            ? 'bg-red-950/20 border-red-800/60'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Riesgo de Suministro
            </span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${
              criticalCount > 2 ? 'text-rose-400' :
              criticalCount > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {criticalCount}
            </span>
            <span className="text-xs text-slate-400">artículos críticos / retrasos</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Retrasados: {summary.delayedPurchasesCount}</span>
            {summary.incidentsCount > 0 ? (
              <span className="text-rose-400 font-bold">{summary.incidentsCount} incidencias</span>
            ) : (
              <span className="text-emerald-400 font-medium">Sin incidencias</span>
            )}
          </div>
        </div>
      </div>

      {/* Sync & Workflow Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-xs text-slate-300">
            Progreso de Aprovisionamiento: <strong className="text-white">{completionPercent}%</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSyncPurchases}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar V11/V15/V16'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
