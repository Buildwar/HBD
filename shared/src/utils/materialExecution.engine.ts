/**
 * HBD — HOME BOARD DESIGNER (V15.0.0)
 * Material Execution & Procurement Reconciliation Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  MaterialExecutionItemDto,
  MaterialDeliveryDto,
  MaterialExecutionStatus,
} from '../types/execution.types.js';

export interface MaterialMetrics {
  totalPlanned: number;
  totalOrdered: number;
  totalReceived: number;
  totalUsed: number;
  totalWaste: number;
  wasteRatePercent: number;
  pendingDeliveriesCount: number;
  delayedDeliveriesCount: number;
}

export class MaterialExecutionEngine {
  /**
   * Reconcilia las entregas recibidas con las cantidades de inventario de materiales en obra.
   */
  public static reconcileMaterialDeliveries(
    materials: MaterialExecutionItemDto[],
    deliveries: MaterialDeliveryDto[]
  ): MaterialExecutionItemDto[] {
    return materials.map((mat) => {
      // Entregas asociadas al material
      const matDeliveries = deliveries.filter(
        (d) => d.materialItemId === mat.id || d.materialName.toLowerCase() === mat.name.toLowerCase()
      );

      const orderedQty = matDeliveries
        .filter((d) => d.status !== 'CANCELLED')
        .reduce((sum, d) => sum + (d.quantity || 0), 0);

      const receivedQty = matDeliveries
        .filter((d) => d.status === 'DELIVERED')
        .reduce((sum, d) => sum + (d.quantity || 0), 0);

      const used = mat.usedQuantity || 0;
      const waste = mat.wasteQuantity || 0;
      const remaining = Math.max(0, receivedQty - used - waste);

      let status: MaterialExecutionStatus = 'PLANNED';
      if (used + waste >= mat.plannedQuantity && mat.plannedQuantity > 0) {
        status = 'CONSUMED';
      } else if (used > 0) {
        status = 'IN_USE';
      } else if (receivedQty >= orderedQty && orderedQty > 0) {
        status = 'RECEIVED';
      } else if (receivedQty > 0) {
        status = 'PARTIALLY_RECEIVED';
      } else if (orderedQty > 0) {
        status = 'ORDERED';
      }

      return {
        ...mat,
        orderedQuantity: orderedQty > 0 ? orderedQty : mat.orderedQuantity,
        receivedQuantity: receivedQty > 0 ? receivedQty : mat.receivedQuantity,
        remainingQuantity: remaining,
        status,
        totalCommittedCost: (orderedQty > 0 ? orderedQty : mat.orderedQuantity) * mat.unitCost,
        totalActualCost: (used + waste) * mat.unitCost,
      };
    });
  }

  /**
   * Calcula métricas agregadas de materiales y pedidos.
   */
  public static calculateMaterialMetrics(
    materials: MaterialExecutionItemDto[],
    deliveries: MaterialDeliveryDto[] = []
  ): MaterialMetrics {
    let totalPlanned = 0;
    let totalOrdered = 0;
    let totalReceived = 0;
    let totalUsed = 0;
    let totalWaste = 0;

    for (const m of materials) {
      totalPlanned += m.plannedQuantity || 0;
      totalOrdered += m.orderedQuantity || 0;
      totalReceived += m.receivedQuantity || 0;
      totalUsed += m.usedQuantity || 0;
      totalWaste += m.wasteQuantity || 0;
    }

    const totalProcessed = totalUsed + totalWaste;
    const wasteRatePercent = totalProcessed > 0
      ? Number(((totalWaste / totalProcessed) * 100).toFixed(1))
      : 0;

    const pendingDeliveriesCount = deliveries.filter(
      (d) => d.status === 'EXPECTED' || d.status === 'ORDERED' || d.status === 'IN_TRANSIT'
    ).length;

    const delayedDeliveriesCount = deliveries.filter((d) => d.status === 'DELAYED').length;

    return {
      totalPlanned: Number(totalPlanned.toFixed(2)),
      totalOrdered: Number(totalOrdered.toFixed(2)),
      totalReceived: Number(totalReceived.toFixed(2)),
      totalUsed: Number(totalUsed.toFixed(2)),
      totalWaste: Number(totalWaste.toFixed(2)),
      wasteRatePercent,
      pendingDeliveriesCount,
      delayedDeliveriesCount,
    };
  }
}
