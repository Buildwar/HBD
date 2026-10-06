/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Project Financial Engine — Total Cost & Investment Intelligence
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  CostCategory,
  CostItemDto,
  CategoryBreakdownDto,
  RoomCostBreakdownDto,
  FinancialSummaryDto,
  BudgetVarianceStatus,
  PropertyAcquisitionDto,
} from '../types/financial.types.js';

export class ProjectFinancialEngine {
  /**
   * Transformation categories (exclude PROPERTY_ACQUISITION)
   */
  public static readonly TRANSFORMATION_CATEGORIES: CostCategory[] = [
    'RENOVATION',
    'FURNITURE',
    'APPLIANCES',
    'EQUIPMENT',
    'PROFESSIONAL_SERVICES',
    'LOGISTICS',
    'PERMITS',
    'CONTINGENCY',
    'OTHER',
  ];

  /**
   * Calculate effective cost of a single cost item:
   * Uses actualTotalCost if present and > 0, otherwise estimatedTotalCost
   */
  public static getEffectiveCost(item: CostItemDto): number {
    if (item.status === 'CANCELLED') return 0;
    if (typeof item.actualTotalCost === 'number' && item.actualTotalCost >= 0) {
      return item.actualTotalCost;
    }
    return item.estimatedTotalCost || 0;
  }

  /**
   * Calculate total transformation cost (all non-acquisition active items)
   */
  public static calculateTransformationCost(items: CostItemDto[]): number {
    return items
      .filter((item) => item.category !== 'PROPERTY_ACQUISITION' && item.status !== 'CANCELLED')
      .reduce((sum, item) => sum + this.getEffectiveCost(item), 0);
  }

  /**
   * Calculate total investment:
   * Property acquisition (if any) + total transformation cost
   */
  public static calculateTotalInvestment(
    transformationCost: number,
    acquisition?: PropertyAcquisitionDto | null
  ): number {
    const acquisitionTotal = acquisition ? acquisition.totalAcquisitionCost || 0 : 0;
    return acquisitionTotal + transformationCost;
  }

  /**
   * Calculate total estimated transformation cost
   */
  public static calculateEstimatedTransformationCost(items: CostItemDto[]): number {
    return items
      .filter((item) => item.category !== 'PROPERTY_ACQUISITION' && item.status !== 'CANCELLED')
      .reduce((sum, item) => sum + (item.estimatedTotalCost || 0), 0);
  }

  /**
   * Calculate total actual transformation cost for items that have actual cost recorded
   */
  public static calculateActualTransformationCost(items: CostItemDto[]): number {
    return items
      .filter((item) => item.category !== 'PROPERTY_ACQUISITION' && item.status !== 'CANCELLED')
      .reduce((sum, item) => {
        if (typeof item.actualTotalCost === 'number' && item.actualTotalCost >= 0) {
          return sum + item.actualTotalCost;
        }
        return sum + (item.estimatedTotalCost || 0);
      }, 0);
  }

  /**
   * Calculate total paid amount
   */
  public static calculateTotalPaid(
    items: CostItemDto[],
    acquisition?: PropertyAcquisitionDto | null
  ): number {
    const itemsPaid = items
      .filter((item) => item.status !== 'CANCELLED')
      .reduce((sum, item) => sum + (item.paidAmount || 0), 0);
    // If acquisition is fully paid/registered, we assume itemsPaid covers item payments
    return itemsPaid;
  }

  /**
   * Group and calculate metrics by category
   */
  public static calculateCategoryBreakdowns(
    items: CostItemDto[],
    totalTransformation: number,
    totalInvestment: number
  ): CategoryBreakdownDto[] {
    const allCategories: CostCategory[] = [
      'PROPERTY_ACQUISITION',
      ...this.TRANSFORMATION_CATEGORIES,
    ];

    return allCategories.map((category) => {
      const categoryItems = items.filter(
        (i) => i.category === category && i.status !== 'CANCELLED'
      );

      const estimatedAmount = categoryItems.reduce(
        (sum, i) => sum + (i.estimatedTotalCost || 0),
        0
      );

      const actualAmount = categoryItems.reduce(
        (sum, i) => sum + (i.actualTotalCost ?? i.estimatedTotalCost ?? 0),
        0
      );

      const effectiveAmount = categoryItems.reduce(
        (sum, i) => sum + this.getEffectiveCost(i),
        0
      );

      const paidAmount = categoryItems.reduce(
        (sum, i) => sum + (i.paidAmount || 0),
        0
      );

      const pendingAmount = Math.max(0, effectiveAmount - paidAmount);

      const varianceAmount = actualAmount - estimatedAmount;
      const variancePercentage =
        estimatedAmount > 0
          ? Number(((varianceAmount / estimatedAmount) * 100).toFixed(2))
          : 0;

      let status: BudgetVarianceStatus = 'ON_BUDGET';
      if (varianceAmount > 0.01) {
        status = 'OVER_BUDGET';
      } else if (varianceAmount < -0.01) {
        status = 'UNDER_BUDGET';
      }

      const percentageOfTransformation =
        category === 'PROPERTY_ACQUISITION'
          ? 0
          : totalTransformation > 0
          ? Number(((effectiveAmount / totalTransformation) * 100).toFixed(2))
          : 0;

      const percentageOfTotalInvestment =
        totalInvestment > 0
          ? Number(((effectiveAmount / totalInvestment) * 100).toFixed(2))
          : 0;

      return {
        category,
        estimatedAmount,
        actualAmount,
        effectiveAmount,
        paidAmount,
        pendingAmount,
        percentageOfTransformation,
        percentageOfTotalInvestment,
        itemsCount: categoryItems.length,
        varianceAmount,
        variancePercentage,
        status,
      };
    });
  }

  /**
   * Group and calculate costs per room/space
   */
  public static calculateRoomBreakdowns(
    items: CostItemDto[],
    spaces: Array<{ id: string; name: string; floor?: number | null; area?: number | null }> = []
  ): RoomCostBreakdownDto[] {
    const spaceMap = new Map<string, { name: string; floor?: number | null; area: number }>();
    for (const space of spaces) {
      spaceMap.set(space.id, {
        name: space.name,
        floor: space.floor ?? 0,
        area: space.area && space.area > 0 ? space.area : 0,
      });
    }

    const roomGroups = new Map<
      string,
      {
        spaceId?: string | null;
        roomName: string;
        floor?: number | null;
        area: number;
        items: CostItemDto[];
      }
    >();

    // Process all items assigned to rooms or general
    for (const item of items) {
      if (item.status === 'CANCELLED') continue;

      let key = 'general';
      let name = 'General / Sin Habitación';
      let floor: number | null = null;
      let area = 0;

      if (item.spaceId && spaceMap.has(item.spaceId)) {
        key = `space:${item.spaceId}`;
        const s = spaceMap.get(item.spaceId)!;
        name = s.name;
        floor = s.floor ?? 0;
        area = s.area;
      } else if (item.roomName && item.roomName.trim() !== '') {
        key = `room:${item.roomName.trim().toLowerCase()}`;
        name = item.roomName.trim();
      }

      if (!roomGroups.has(key)) {
        roomGroups.set(key, {
          spaceId: item.spaceId || null,
          roomName: name,
          floor,
          area,
          items: [],
        });
      }

      roomGroups.get(key)!.items.push(item);
    }

    // Also include any space from the project that might not have items yet
    for (const space of spaces) {
      const key = `space:${space.id}`;
      if (!roomGroups.has(key)) {
        roomGroups.set(key, {
          spaceId: space.id,
          roomName: space.name,
          floor: space.floor ?? 0,
          area: space.area && space.area > 0 ? space.area : 0,
          items: [],
        });
      }
    }

    const result: RoomCostBreakdownDto[] = [];

    for (const group of roomGroups.values()) {
      const totalEstimated = group.items.reduce(
        (sum, i) => sum + (i.estimatedTotalCost || 0),
        0
      );
      const totalActual = group.items.reduce(
        (sum, i) => sum + (i.actualTotalCost ?? i.estimatedTotalCost ?? 0),
        0
      );
      const totalEffective = group.items.reduce(
        (sum, i) => sum + this.getEffectiveCost(i),
        0
      );
      const totalPaid = group.items.reduce(
        (sum, i) => sum + (i.paidAmount || 0),
        0
      );
      const totalPending = Math.max(0, totalEffective - totalPaid);

      const categoryBreakdown: Partial<Record<CostCategory, number>> = {};
      for (const item of group.items) {
        categoryBreakdown[item.category] =
          (categoryBreakdown[item.category] || 0) + this.getEffectiveCost(item);
      }

      const costPerSquareMeter =
        group.area > 0 ? Number((totalEffective / group.area).toFixed(2)) : 0;

      result.push({
        spaceId: group.spaceId,
        roomName: group.roomName,
        floor: group.floor,
        areaSquareMeters: group.area,
        totalEstimated,
        totalActual,
        totalEffective,
        totalPaid,
        totalPending,
        costPerSquareMeter,
        itemsCount: group.items.length,
        categoryBreakdown,
      });
    }

    return result.sort((a, b) => b.totalEffective - a.totalEffective);
  }

  /**
   * Generate complete consolidated financial summary
   */
  public static generateSummary(
    projectId: string,
    items: CostItemDto[],
    acquisition?: PropertyAcquisitionDto | null,
    projectArea = 0,
    spaces: Array<{ id: string; name: string; floor?: number | null; area?: number | null }> = []
  ): FinancialSummaryDto {
    const activeItems = items.filter((i) => i.status !== 'CANCELLED');

    // Build acquisition item if present and not already in items
    let allItems = [...activeItems];
    if (acquisition && acquisition.totalAcquisitionCost > 0) {
      const existingAcq = allItems.find((i) => i.category === 'PROPERTY_ACQUISITION');
      if (!existingAcq) {
        allItems.push({
          id: acquisition.id || 'acq-synthetic',
          projectId,
          category: 'PROPERTY_ACQUISITION',
          subcategory: 'PURCHASE_PRICE',
          name: 'Adquisición de Inmueble y Gastos Asociados',
          unit: 'ud',
          quantity: 1,
          estimatedUnitCost: acquisition.totalAcquisitionCost,
          estimatedTotalCost: acquisition.totalAcquisitionCost,
          actualUnitCost: acquisition.totalAcquisitionCost,
          actualTotalCost: acquisition.totalAcquisitionCost,
          paidAmount: acquisition.totalAcquisitionCost,
          pendingAmount: 0,
          status: 'COMMITTED',
          source: 'ACQUISITION',
          createdAt: acquisition.createdAt || new Date().toISOString(),
          updatedAt: acquisition.updatedAt || new Date().toISOString(),
        });
      }
    }

    const totalTransformationCost = this.calculateTransformationCost(allItems);
    const totalInvestment = this.calculateTotalInvestment(totalTransformationCost, acquisition);
    const totalEstimatedTransformationCost = this.calculateEstimatedTransformationCost(allItems);
    const totalActualTransformationCost = this.calculateActualTransformationCost(allItems);

    const categories = this.calculateCategoryBreakdowns(
      allItems,
      totalTransformationCost,
      totalInvestment
    );

    const propertyAcquisitionCost = acquisition
      ? acquisition.totalAcquisitionCost
      : categories.find((c) => c.category === 'PROPERTY_ACQUISITION')?.effectiveAmount || 0;

    const renovationCost =
      categories.find((c) => c.category === 'RENOVATION')?.effectiveAmount || 0;
    const furnitureCost =
      categories.find((c) => c.category === 'FURNITURE')?.effectiveAmount || 0;
    const appliancesCost =
      categories.find((c) => c.category === 'APPLIANCES')?.effectiveAmount || 0;
    const equipmentCost =
      categories.find((c) => c.category === 'EQUIPMENT')?.effectiveAmount || 0;
    const professionalServicesCost =
      categories.find((c) => c.category === 'PROFESSIONAL_SERVICES')?.effectiveAmount || 0;
    const logisticsCost =
      categories.find((c) => c.category === 'LOGISTICS')?.effectiveAmount || 0;
    const permitsCost =
      categories.find((c) => c.category === 'PERMITS')?.effectiveAmount || 0;
    const contingencyCost =
      categories.find((c) => c.category === 'CONTINGENCY')?.effectiveAmount || 0;
    const otherCost =
      categories.find((c) => c.category === 'OTHER')?.effectiveAmount || 0;

    const totalPaidAmount = allItems.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const totalPendingAmount = Math.max(0, totalInvestment - totalPaidAmount);

    const totalBudgetVariance = totalActualTransformationCost - totalEstimatedTransformationCost;
    const variancePercentage =
      totalEstimatedTransformationCost > 0
        ? Number(((totalBudgetVariance / totalEstimatedTransformationCost) * 100).toFixed(2))
        : 0;

    let varianceStatus: BudgetVarianceStatus = 'ON_BUDGET';
    if (totalBudgetVariance > 0.01) {
      varianceStatus = 'OVER_BUDGET';
    } else if (totalBudgetVariance < -0.01) {
      varianceStatus = 'UNDER_BUDGET';
    }

    const costPerSquareMeterTransformation =
      projectArea > 0
        ? Number((totalTransformationCost / projectArea).toFixed(2))
        : 0;

    const costPerSquareMeterTotalInvestment =
      projectArea > 0
        ? Number((totalInvestment / projectArea).toFixed(2))
        : 0;

    const roomBreakdown = this.calculateRoomBreakdowns(allItems, spaces);

    const paymentProgressPercentage =
      totalInvestment > 0
        ? Number(Math.min(100, (totalPaidAmount / totalInvestment) * 100).toFixed(2))
        : 0;

    return {
      projectId,
      totalTransformationCost,
      totalInvestment,
      propertyAcquisitionCost,
      renovationCost,
      furnitureCost,
      appliancesCost,
      equipmentCost,
      professionalServicesCost,
      logisticsCost,
      permitsCost,
      contingencyCost,
      otherCost,
      totalEstimatedTransformationCost,
      totalActualTransformationCost,
      totalPaidAmount,
      totalPendingAmount,
      totalBudgetVariance,
      variancePercentage,
      varianceStatus,
      projectAreaSquareMeters: projectArea,
      costPerSquareMeterTransformation,
      costPerSquareMeterTotalInvestment,
      categories,
      roomBreakdown,
      paymentProgressPercentage,
      totalItemsCount: allItems.length,
      hasAcquisitionData: Boolean(acquisition && acquisition.totalAcquisitionCost > 0),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Helper to calculate total acquisition from individual fee components
   */
  public static calculateTotalAcquisition(fees: {
    purchasePrice: number;
    notaryFees?: number;
    registryFees?: number;
    transferTax?: number;
    agencyFees?: number;
    legalFees?: number;
    renovationTax?: number;
    valuationFees?: number;
    otherAcquisitionFees?: number;
  }): number {
    return (
      (fees.purchasePrice || 0) +
      (fees.notaryFees || 0) +
      (fees.registryFees || 0) +
      (fees.transferTax || 0) +
      (fees.agencyFees || 0) +
      (fees.legalFees || 0) +
      (fees.renovationTax || 0) +
      (fees.valuationFees || 0) +
      (fees.otherAcquisitionFees || 0)
    );
  }
}
