import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileCheck,
  Building,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { ExecutionProjectDto } from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

interface ExecutionCostTabProps {
  execution: ExecutionProjectDto;
}

export const ExecutionCostTab: React.FC<ExecutionCostTabProps> = ({ execution }) => {
  const { t } = useTranslation();
  const { costVariance } = execution;

  const isOverBudget = costVariance.varianceAbsolute > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('execution.cost.title', 'Control Económico y Desviación de Costes Reales')}
          </h3>
          <p className="text-xs text-gray-400">
            Comparativa transparente entre presupuesto planificado, compras comprometidas y facturación real.
          </p>
        </div>
      </div>

      {/* 5 Columnas Económicas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            1. Presupuesto Base
          </span>
          <p className="text-xl font-black text-white mt-1">
            {costVariance.v11Budget.toFixed(2)} €
          </p>
          <p className="text-[10px] text-gray-500">Partidas estimadas V11</p>
        </Card>

        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
            2. Comprometido
          </span>
          <p className="text-xl font-black text-sky-400 mt-1">
            {costVariance.committedCost.toFixed(2)} €
          </p>
          <p className="text-[10px] text-gray-500">Órdenes de compra emitidas</p>
        </Card>

        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            3. Facturado
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {costVariance.invoicedCost.toFixed(2)} €
          </p>
          <p className="text-[10px] text-gray-500">Facturas recibidas</p>
        </Card>

        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            4. Coste Real
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {costVariance.actualCost.toFixed(2)} €
          </p>
          <p className="text-[10px] text-gray-500">Material y MO ejecutada</p>
        </Card>

        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>5. Desviación</span>
            {isOverBudget ? (
              <ArrowUpRight size={13} className="text-red-400" />
            ) : (
              <ArrowDownRight size={13} className="text-emerald-400" />
            )}
          </span>
          <p className={`text-xl font-black mt-1 ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOverBudget ? '+' : ''}{costVariance.varianceAbsolute.toFixed(2)} €
          </p>
          <p className="text-[10px] text-gray-500">
            {costVariance.variancePercent >= 0 ? '+' : ''}{costVariance.variancePercent}% sobre plan
          </p>
        </Card>
      </div>

      {/* Desglose por Categorías Constructivas & Proveedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desglose por Categoría */}
        <Card className="p-5 bg-dark-surface border-dark-border space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-dark-border/60 pb-3">
            <DollarSign size={14} className="text-brand-400" /> Desglose por Partidas y Categorías
          </h4>

          <div className="space-y-2">
            {costVariance.byCategory.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">No hay partidas registradas.</p>
            ) : (
              costVariance.byCategory.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border/60 text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-200">{cat.category}</p>
                    <p className="text-[11px] text-gray-400">
                      Presupuesto: {cat.budget.toFixed(2)} € • Comprometido: {cat.committed.toFixed(2)} €
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-white">{cat.actual.toFixed(2)} €</p>
                    <span
                      className={`text-[10px] font-semibold ${
                        cat.variance > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {cat.variance >= 0 ? '+' : ''}{cat.variance.toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Desglose por Proveedores */}
        <Card className="p-5 bg-dark-surface border-dark-border space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-dark-border/60 pb-3">
            <Building size={14} className="text-sky-400" /> Control por Proveedor / Subcontrata
          </h4>

          <div className="space-y-2">
            {costVariance.bySupplier.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">No hay proveedores asignados.</p>
            ) : (
              costVariance.bySupplier.map((sup, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border/60 text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-200">{sup.supplierName}</p>
                    <p className="text-[11px] text-gray-400">
                      Comprometido: {sup.committed.toFixed(2)} € • Facturado: {sup.invoiced.toFixed(2)} €
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-400">{sup.paid.toFixed(2)} €</p>
                    <span className="text-[10px] text-gray-400">Pagado</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
