/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Purchase Planning Engine — Requirement Calculations, Waste & Timing Intelligence
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  ProcurementItemDto,
  MaterialRequirementDto,
  ProcurementPlanningDto,
} from '../types/procurement.types.js';

export class PurchasePlanningEngine {
  /**
   * Calculates precise material requirement taking waste into account
   */
  public static calculateMaterialRequirement(params: {
    id?: string;
    projectId: string;
    taskId?: string | null;
    taskName?: string | null;
    materialName: string;
    requiredQuantity: number;
    purchasedQuantity: number;
    unit?: string;
    wastePercent?: number;
  }): MaterialRequirementDto {
    const waste = params.wastePercent || 0;
    const totalCalculatedNeed = Number((params.requiredQuantity * (1 + waste / 100)).toFixed(2));
    const purchased = params.purchasedQuantity || 0;
    const missingQuantity = Number(Math.max(0, totalCalculatedNeed - purchased).toFixed(2));
    const surplusQuantity = Number(Math.max(0, purchased - totalCalculatedNeed).toFixed(2));
    const isCovered = missingQuantity <= 0;

    return {
      id: params.id || 'mat-req',
      projectId: params.projectId,
      taskId: params.taskId || null,
      taskName: params.taskName || null,
      materialName: params.materialName,
      requiredQuantity: params.requiredQuantity,
      purchasedQuantity: purchased,
      unit: params.unit || 'ud',
      wastePercent: waste,
      totalCalculatedNeed,
      surplusQuantity,
      missingQuantity,
      isCovered,
    };
  }

  /**
   * Evaluates recommended purchase timing and creates weekly procurement schedule
   */
  public static generatePlanning(
    projectId: string,
    items: ProcurementItemDto[],
    criticalRisks: any[] = []
  ): ProcurementPlanningDto {
    const activeItems = items.filter((i) => i.status !== 'CANCELLED');
    const now = new Date();

    // Items that need to be ordered immediately (within next 14 days or leadTime > remaining days)
    const recommendedPurchasesToStart = activeItems.filter((item) => {
      const isPending = ['DRAFT', 'NEEDED', 'REQUESTED', 'QUOTED', 'APPROVAL_PENDING', 'APPROVED'].includes(item.status);
      if (!isPending) return false;

      if (item.priority === 'CRITICAL' || item.priority === 'HIGH') return true;

      if (item.requiredDate) {
        const reqDate = new Date(item.requiredDate);
        const diffDays = Math.ceil((reqDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const leadTime = item.leadTimeDays || 7;
        return diffDays <= leadTime + 5;
      }
      return false;
    });

    // Group items into weekly tranches
    const weekMap = new Map<string, { itemsCount: number; estimatedCost: number; items: ProcurementItemDto[] }>();

    for (const item of activeItems) {
      let weekKey = 'Sin Fecha / Pendiente';
      if (item.requiredDate) {
        const reqDate = new Date(item.requiredDate);
        const startOfYear = new Date(reqDate.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((reqDate.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
        weekKey = `Semana ${weekNo} (${reqDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })})`;
      }

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          itemsCount: 0,
          estimatedCost: 0,
          items: [],
        });
      }

      const tranche = weekMap.get(weekKey)!;
      tranche.itemsCount++;
      tranche.estimatedCost += item.selectedTotalCost ?? item.estimatedTotalCost ?? 0;
      tranche.items.push(item);
    }

    const upcomingOrdersByWeek = Array.from(weekMap.entries()).map(([weekLabel, data]) => ({
      weekLabel,
      ...data,
    }));

    const pendingDefinitionCount = activeItems.filter((i) => !i.supplierId || !i.estimatedUnitCost).length;

    return {
      projectId,
      criticalItems: criticalRisks,
      recommendedPurchasesToStart,
      upcomingOrdersByWeek,
      totalPurchasesCount: activeItems.length,
      pendingDefinitionCount,
    };
  }
}
