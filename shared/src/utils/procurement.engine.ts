/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Engine — Purchasing & Acquisition Intelligence
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  ProcurementItemDto,
  ProcurementSummaryDto,
  ProcurementCategory,
  ProcurementStatus,
  ProcurementRiskLevel,
  SupplierQuoteDto,
} from '../types/procurement.types.js';

export class ProcurementEngine {
  /**
   * All procurement categories
   */
  public static readonly ALL_CATEGORIES: ProcurementCategory[] = [
    'RENOVATION_MATERIAL',
    'FURNITURE',
    'APPLIANCE',
    'EQUIPMENT',
    'LIGHTING',
    'DECORATION',
    'PLUMBING',
    'ELECTRICAL',
    'CARPENTRY',
    'FLOORING',
    'PAINT',
    'TOOLS',
    'SAFETY',
    'LOGISTICS',
    'OTHER',
  ];

  /**
   * Calculates pending quantity on a procurement item
   */
  public static calculatePendingQuantity(item: {
    quantity: number;
    receivedQuantity?: number;
  }): number {
    const received = item.receivedQuantity || 0;
    return Math.max(0, item.quantity - received);
  }

  /**
   * Evaluates and infers updated status based on quantities and delivery
   */
  public static evaluateItemStatus(item: {
    status: ProcurementStatus;
    quantity: number;
    orderedQuantity: number;
    receivedQuantity: number;
    damagedQuantity?: number;
    hasIncident?: boolean;
  }): ProcurementStatus {
    if (item.hasIncident) return 'INCIDENT';
    if (item.status === 'CANCELLED' || item.status === 'RETURNED' || item.status === 'INSTALLED') {
      return item.status;
    }

    if (item.receivedQuantity >= item.quantity && item.quantity > 0) {
      return 'RECEIVED';
    }
    if (item.receivedQuantity > 0 && item.receivedQuantity < item.quantity) {
      return 'PARTIALLY_RECEIVED';
    }
    if (item.orderedQuantity >= item.quantity && item.quantity > 0) {
      return 'ORDERED';
    }
    if (item.orderedQuantity > 0 && item.orderedQuantity < item.quantity) {
      return 'CONFIRMED';
    }
    return item.status;
  }

  /**
   * Compare supplier quotes objectively
   */
  public static compareQuotes(quotes: SupplierQuoteDto[]): {
    quotes: Array<SupplierQuoteDto & { isBestPrice: boolean; isFastest: boolean }>;
    bestPriceQuoteId?: string;
    fastestDeliveryQuoteId?: string;
  } {
    if (!quotes || quotes.length === 0) {
      return { quotes: [] };
    }

    let minTotal = Infinity;
    let bestPriceQuoteId: string | undefined;
    let minDays = Infinity;
    let fastestDeliveryQuoteId: string | undefined;

    for (const q of quotes) {
      const total = q.totalWithServices || q.totalPrice + q.shippingCost + q.installationCost;
      if (total < minTotal) {
        minTotal = total;
        bestPriceQuoteId = q.id;
      }
      if (q.estimatedDeliveryDays < minDays && q.estimatedDeliveryDays > 0) {
        minDays = q.estimatedDeliveryDays;
        fastestDeliveryQuoteId = q.id;
      }
    }

    const enhanced = quotes.map((q) => {
      const total = q.totalWithServices || q.totalPrice + q.shippingCost + q.installationCost;
      return {
        ...q,
        totalWithServices: total,
        isBestPrice: q.id === bestPriceQuoteId,
        isFastest: q.id === fastestDeliveryQuoteId,
      };
    });

    return {
      quotes: enhanced,
      bestPriceQuoteId,
      fastestDeliveryQuoteId,
    };
  }

  /**
   * Generates complete consolidated procurement summary
   */
  public static generateSummary(
    projectId: string,
    items: ProcurementItemDto[],
    overallRisk: ProcurementRiskLevel = 'SAFE',
    incidentsCount = 0
  ): ProcurementSummaryDto {
    const activeItems = items.filter((i) => i.status !== 'CANCELLED');

    let totalEstimatedPurchasingBudget = 0;
    let totalCommittedPurchasingCost = 0;
    let totalActualPurchasedCost = 0;
    let totalPaidPurchasingAmount = 0;
    let pendingToOrderAmount = 0;

    let pendingPurchasesCount = 0;
    let orderedPurchasesCount = 0;
    let inTransitPurchasesCount = 0;
    let receivedPurchasesCount = 0;
    let delayedPurchasesCount = 0;

    // Category aggregation map
    const categoryMap = new Map<
      ProcurementCategory,
      {
        itemsCount: number;
        totalEstimatedCost: number;
        totalCommittedCost: number;
        pendingQuantity: number;
        receivedQuantity: number;
      }
    >();

    for (const cat of this.ALL_CATEGORIES) {
      categoryMap.set(cat, {
        itemsCount: 0,
        totalEstimatedCost: 0,
        totalCommittedCost: 0,
        pendingQuantity: 0,
        receivedQuantity: 0,
      });
    }

    // Room aggregation map
    const roomMap = new Map<
      string,
      {
        roomId?: string | null;
        roomName: string;
        itemsCount: number;
        totalCost: number;
        pendingCount: number;
      }
    >();

    const now = new Date().getTime();

    for (const item of activeItems) {
      const est = item.estimatedTotalCost || item.estimatedUnitCost * item.quantity || 0;
      const committed = item.selectedTotalCost ?? item.estimatedTotalCost;
      const isOrdered = ['ORDERED', 'CONFIRMED', 'SHIPPED', 'PARTIALLY_SHIPPED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'INSPECTED', 'INSTALLED', 'COMPLETED'].includes(item.status);
      const isReceived = ['RECEIVED', 'INSPECTED', 'INSTALLED', 'COMPLETED'].includes(item.status);
      const isTransit = ['SHIPPED', 'PARTIALLY_SHIPPED'].includes(item.status);
      const isPending = ['DRAFT', 'NEEDED', 'REQUESTED', 'QUOTED', 'APPROVAL_PENDING', 'APPROVED'].includes(item.status);

      totalEstimatedPurchasingBudget += est;

      if (isOrdered) {
        totalCommittedPurchasingCost += committed;
        orderedPurchasesCount++;
      } else {
        pendingToOrderAmount += est;
      }

      if (isPending) pendingPurchasesCount++;
      if (isTransit) inTransitPurchasesCount++;
      if (isReceived) {
        receivedPurchasesCount++;
        totalActualPurchasedCost += committed;
      }

      // Delay check
      if (item.requiredDate) {
        const reqTime = new Date(item.requiredDate).getTime();
        if (reqTime < now && !isReceived) {
          delayedPurchasesCount++;
        }
      }

      // Update category map
      if (categoryMap.has(item.category)) {
        const catStats = categoryMap.get(item.category)!;
        catStats.itemsCount++;
        catStats.totalEstimatedCost += est;
        catStats.totalCommittedCost += isOrdered ? committed : 0;
        catStats.pendingQuantity += this.calculatePendingQuantity(item);
        catStats.receivedQuantity += item.receivedQuantity || 0;
      }

      // Update room map
      const roomKey = item.roomId || item.roomName || 'general';
      const roomName = item.roomName || 'General / Sin Habitación';
      if (!roomMap.has(roomKey)) {
        roomMap.set(roomKey, {
          roomId: item.roomId || null,
          roomName,
          itemsCount: 0,
          totalCost: 0,
          pendingCount: 0,
        });
      }
      const roomStats = roomMap.get(roomKey)!;
      roomStats.itemsCount++;
      roomStats.totalCost += committed;
      if (isPending) roomStats.pendingCount++;
    }

    const categories = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats,
    }));

    const roomsSummary = Array.from(roomMap.values()).sort((a, b) => b.totalCost - a.totalCost);

    const pendingToPayAmount = Math.max(0, totalCommittedPurchasingCost - totalPaidPurchasingAmount);

    return {
      projectId,
      totalPurchasesCount: activeItems.length,
      pendingPurchasesCount,
      orderedPurchasesCount,
      inTransitPurchasesCount,
      receivedPurchasesCount,
      delayedPurchasesCount,
      incidentsCount,
      totalEstimatedPurchasingBudget,
      totalCommittedPurchasingCost,
      totalActualPurchasedCost,
      totalPaidPurchasingAmount,
      pendingToOrderAmount,
      pendingToPayAmount,
      categories,
      roomsSummary,
      overallRiskLevel: overallRisk,
      generatedAt: new Date().toISOString(),
    };
  }
}
