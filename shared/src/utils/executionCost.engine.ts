/**
 * HBD — HOME BOARD DESIGNER (V15.0.0)
 * Execution Cost Engine & Variance Control
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  MaterialExecutionItemDto,
  PurchaseOrderDto,
  ExecutionInvoiceDto,
  CostVariance,
  HealthStatus,
} from '../types/execution.types.js';

export class ExecutionCostEngine {
  /**
   * Calcula el estado económico completo de la obra:
   * Budget vs Committed vs Invoiced vs Paid vs Actual vs Remaining.
   */
  public static calculateCostVariance(params: {
    initialBudget?: number;
    v11Budget?: number;
    materials?: MaterialExecutionItemDto[];
    purchaseOrders?: PurchaseOrderDto[];
    invoices?: ExecutionInvoiceDto[];
  }): CostVariance {
    const {
      initialBudget = 0,
      v11Budget = 0,
      materials = [],
      purchaseOrders = [],
      invoices = [],
    } = params;

    const baseBudget = v11Budget > 0 ? v11Budget : initialBudget;

    // Committed: Total de órdenes de compra confirmadas / activas
    const committedCost = purchaseOrders
      .filter((po) => po.status !== 'CANCELLED')
      .reduce((acc, po) => acc + (po.totalAmount || 0), 0);

    // Invoiced: Facturas recibidas y aprobadas/pagadas
    const invoicedCost = invoices
      .filter((inv) => inv.status !== 'CANCELLED')
      .reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);

    // Paid: Facturas efectivamente pagadas
    const paidCost = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);

    // Actual Cost: Suma de materiales consumidos/usados + mano de obra registrada
    const actualMaterialCost = materials.reduce((acc, mat) => {
      const consumedCost = (mat.usedQuantity + mat.wasteQuantity) * mat.unitCost;
      return acc + (mat.totalActualCost > 0 ? mat.totalActualCost : consumedCost);
    }, 0);

    // Si tenemos facturas pagadas o registradas, el coste real es el máximo de facturas o materiales
    const actualCost = Math.max(invoicedCost, actualMaterialCost, paidCost);

    // Coste pendiente proyectado
    const remainingCost = Math.max(0, baseBudget - actualCost);

    // Desviación absoluta: actual + comprometido pendiente vs baseBudget
    const projectedTotalCost = Math.max(baseBudget, actualCost + Math.max(0, committedCost - invoicedCost));
    const varianceAbsolute = projectedTotalCost - baseBudget;
    const variancePercent = baseBudget > 0
      ? Number(((varianceAbsolute / baseBudget) * 100).toFixed(2))
      : 0;

    let status: HealthStatus = 'ON_TRACK';
    if (baseBudget <= 0 && actualCost === 0) {
      status = 'UNKNOWN';
    } else if (variancePercent > 15) {
      status = 'DELAYED'; // Major cost overrun
    } else if (variancePercent > 5) {
      status = 'AT_RISK';
    }

    // Agrupación por categoría constructiva
    const categoryMap = new Map<string, { budget: number; committed: number; actual: number }>();
    for (const m of materials) {
      const cat = m.category || 'OTHER';
      const curr = categoryMap.get(cat) || { budget: 0, committed: 0, actual: 0 };
      const matBudget = m.plannedQuantity * m.unitCost;
      const matCommitted = m.orderedQuantity * m.unitCost;
      const matActual = (m.usedQuantity + m.wasteQuantity) * m.unitCost;
      categoryMap.set(cat, {
        budget: curr.budget + matBudget,
        committed: curr.committed + matCommitted,
        actual: curr.actual + matActual,
      });
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, vals]) => ({
      category,
      budget: Number(vals.budget.toFixed(2)),
      committed: Number(vals.committed.toFixed(2)),
      actual: Number(vals.actual.toFixed(2)),
      variance: Number((vals.actual - vals.budget).toFixed(2)),
    }));

    // Agrupación por proveedor
    const supplierMap = new Map<
      string,
      { supplierName: string; committed: number; invoiced: number; paid: number }
    >();

    for (const po of purchaseOrders) {
      const supName = po.supplierName || 'Sin Proveedor';
      const supKey = po.supplierId || supName;
      const curr = supplierMap.get(supKey) || {
        supplierName: supName,
        committed: 0,
        invoiced: 0,
        paid: 0,
      };
      if (po.status !== 'CANCELLED') {
        curr.committed += po.totalAmount;
      }
      supplierMap.set(supKey, curr);
    }

    for (const inv of invoices) {
      const supName = inv.supplierName || 'Sin Proveedor';
      const supKey = inv.supplierId || supName;
      const curr = supplierMap.get(supKey) || {
        supplierName: supName,
        committed: 0,
        invoiced: 0,
        paid: 0,
      };
      if (inv.status !== 'CANCELLED') {
        curr.invoiced += inv.totalAmount;
      }
      if (inv.status === 'PAID') {
        curr.paid += inv.totalAmount;
      }
      supplierMap.set(supKey, curr);
    }

    const bySupplier = Array.from(supplierMap.entries()).map(([supplierId, vals]) => ({
      supplierId: supplierId.startsWith('Sin Proveedor') ? null : supplierId,
      supplierName: vals.supplierName,
      committed: Number(vals.committed.toFixed(2)),
      invoiced: Number(vals.invoiced.toFixed(2)),
      paid: Number(vals.paid.toFixed(2)),
    }));

    return {
      initialBudget: Number(initialBudget.toFixed(2)),
      v11Budget: Number(v11Budget.toFixed(2)),
      committedCost: Number(committedCost.toFixed(2)),
      invoicedCost: Number(invoicedCost.toFixed(2)),
      paidCost: Number(paidCost.toFixed(2)),
      actualCost: Number(actualCost.toFixed(2)),
      remainingCost: Number(remainingCost.toFixed(2)),
      varianceAbsolute: Number(varianceAbsolute.toFixed(2)),
      variancePercent,
      status,
      byCategory,
      bySupplier,
    };
  }
}
