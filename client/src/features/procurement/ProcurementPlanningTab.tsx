/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Planning & Schedule Tab Component
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ProcurementPlanningDto,
  MaterialRequirementDto,
} from '@hbd/shared';

interface ProcurementPlanningTabProps {
  planning?: ProcurementPlanningDto | null;
  materialRequirements?: MaterialRequirementDto[];
  onSelectItem?: (itemId: string) => void;
}

export const ProcurementPlanningTab: React.FC<ProcurementPlanningTabProps> = ({
  planning,
  materialRequirements = [],
  onSelectItem,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val || 0);

  const criticalItems = planning?.criticalItems || [];
  const weeks = planning?.upcomingOrdersByWeek || [];

  return (
    <div className="space-y-6">
      {/* Risk Alert & Critical Warnings */}
      {criticalItems.length > 0 && (
        <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Artículos Críticos o con Riesgo de Retraso ({criticalItems.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {criticalItems.map((item) => (
              <div
                key={item.procurementItemId}
                className="bg-slate-900/90 border border-red-900/50 rounded-lg p-3 text-xs flex justify-between items-start"
              >
                <div>
                  <div className="font-semibold text-white">{item.description}</div>
                  <div className="text-slate-400 mt-1">
                    Motivo: <strong className="text-amber-300">{item.riskReason}</strong>
                  </div>
                  {item.taskName && (
                    <div className="text-rose-400 font-medium text-[11px] mt-0.5">
                      ⚠️ Bloquea tarea: {item.taskName}
                    </div>
                  )}
                  {item.mitigationSuggestion && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      Sugerencia: {item.mitigationSuggestion}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.riskLevel === 'CRITICAL' ? 'bg-rose-900 text-rose-200' : 'bg-amber-900 text-amber-200'
                  }`}>
                    {item.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchasing Schedule by Weekly Timeframes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              Cronograma de Compras por Semanas (Procurement Planning)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {weeks.length} tramos planificados
          </span>
        </div>

        {weeks.length === 0 ? (
          <div className="text-slate-500 text-xs text-center py-8">
            No hay compras programadas en el calendario. Sincroniza o asigna fechas estimadas a tus partidas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeks.map((week, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 shadow"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-700">
                  <span className="font-semibold text-white text-xs">{week.weekLabel}</span>
                  <span className="text-xs text-emerald-400 font-bold">
                    {formatCurrency(week.estimatedCost)}
                  </span>
                </div>
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {week.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-xs"
                    >
                      <div className="font-medium text-slate-200 flex justify-between">
                        <span className="truncate max-w-[160px]">{item.description}</span>
                        <span className="text-emerald-400 font-semibold">
                          {formatCurrency(item.selectedTotalCost ?? item.estimatedTotalCost)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between mt-0.5">
                        <span>{item.quantity} {item.unit}</span>
                        <span>{item.supplierName || 'Sin proveedor'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Material Requirements & Waste Factor (V11 Construction Integration) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              Cálculo de Requisitos de Materiales & Mermas (V11 + V18)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {materialRequirements.length} materiales computados
          </span>
        </div>

        {materialRequirements.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No se han sincronizado requisitos de materiales de obra. Usa el botón "Sincronizar V11/V15/V16" para importar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Material</th>
                  <th className="py-2.5 px-3">Cant. Neta</th>
                  <th className="py-2.5 px-3">Merma (%)</th>
                  <th className="py-2.5 px-3">Total Requerido</th>
                  <th className="py-2.5 px-3">Cant. Comprada</th>
                  <th className="py-2.5 px-3">Faltante</th>
                  <th className="py-2.5 px-3">Estado Cobertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {materialRequirements.map((mat) => {
                  return (
                    <tr key={mat.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">{mat.materialName}</td>
                      <td className="py-2.5 px-3">{mat.requiredQuantity} {mat.unit}</td>
                      <td className="py-2.5 px-3 text-amber-400">+{mat.wastePercent}%</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-300">{mat.totalCalculatedNeed} {mat.unit}</td>
                      <td className="py-2.5 px-3">{mat.purchasedQuantity} {mat.unit}</td>
                      <td className="py-2.5 px-3">
                        {mat.missingQuantity > 0 ? (
                          <span className="text-rose-400 font-semibold">{mat.missingQuantity} {mat.unit}</span>
                        ) : (
                          <span className="text-emerald-400">0 {mat.unit}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {mat.isCovered ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Cubierto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                            <Clock className="w-3.5 h-3.5" /> Pendiente Compra
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
