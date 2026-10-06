/**
 * HBD — Product Matching & Comparison Engine
 * V20.0.0 — Connected Retail Catalog
 */

import type {
  RetailProductDto,
  RetailProductComparisonResultDto,
  RetailProductComparisonItemDto,
} from '@hbd/shared';

export class ProductMatchingEngine {
  /**
   * Normalizes product strings for robust comparison
   */
  static normalizeString(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Checks if two products match the same commercial item
   */
  static isMatch(p1: RetailProductDto, p2: RetailProductDto): { isMatch: boolean; confidence: number } {
    // 1. Exact SKU match across same brand
    if (p1.sku && p2.sku && p1.sku === p2.sku) {
      return { isMatch: true, confidence: 1.0 };
    }

    // 2. Exact Brand and Reference
    if (
      p1.brand &&
      p2.brand &&
      p1.brand.toLowerCase() === p2.brand.toLowerCase() &&
      p1.reference &&
      p2.reference &&
      p1.reference.toLowerCase() === p2.reference.toLowerCase()
    ) {
      return { isMatch: true, confidence: 0.98 };
    }

    // 3. Name and exact dimensions match
    const normName1 = this.normalizeString(p1.name);
    const normName2 = this.normalizeString(p2.name);

    const nameSim = normName1 === normName2 || normName1.includes(normName2) || normName2.includes(normName1);
    const dimMatch =
      Math.abs(p1.dimensions.widthM - p2.dimensions.widthM) < 0.02 &&
      Math.abs(p1.dimensions.depthM - p2.dimensions.depthM) < 0.02 &&
      Math.abs(p1.dimensions.heightM - p2.dimensions.heightM) < 0.02;

    if (nameSim && dimMatch) {
      return { isMatch: true, confidence: 0.9 };
    }

    return { isMatch: false, confidence: 0.0 };
  }

  /**
   * Generates a structured multi-product comparison matrix
   */
  static compareProducts(products: RetailProductDto[]): RetailProductComparisonResultDto {
    if (!products || products.length === 0) {
      return {
        items: [],
        comparisonMatrix: { prices: {}, dimensions: {}, availability: {}, delivery: {} },
      };
    }

    const minPrice = Math.min(...products.map((p) => p.price.amount));
    const comparisonItems: RetailProductComparisonItemDto[] = products.map((product) => {
      const isBestPrice = product.price.amount === minPrice;
      const pros: string[] = [];
      const cons: string[] = [];

      if (isBestPrice) pros.push('Precio más competitivo del grupo');
      if (product.availability.status === 'IN_STOCK') pros.push('En stock para entrega inmediata');
      if (product.dataQualityScore > 0.9) pros.push('Ficha técnica completa y verificada');

      if (product.availability.status === 'OUT_OF_STOCK') cons.push('Agotado temporalmente');
      if (product.availability.status === 'AVAILABLE_TO_ORDER') cons.push('Plazo de fabricación extendido');
      if (product.price.amount > minPrice * 1.5) cons.push('Precio superior a la media');

      return {
        product,
        score: parseFloat(((product.dataQualityScore * 50 + (isBestPrice ? 50 : 25))).toFixed(1)),
        pros,
        cons,
        isBestPrice,
        isBestFit: false,
      };
    });

    const pricesMap: Record<string, number> = {};
    const dimsMap: Record<string, string> = {};
    const availMap: Record<string, string> = {};
    const delivMap: Record<string, string> = {};

    products.forEach((p) => {
      pricesMap[p.id] = p.price.amount;
      dimsMap[p.id] = `${Math.round(p.dimensions.widthM * 100)} × ${Math.round(p.dimensions.depthM * 100)} × ${Math.round(p.dimensions.heightM * 100)} cm`;
      availMap[p.id] = p.availability.status;
      delivMap[p.id] = p.availability.deliveryEstimateFormatted || `${p.availability.deliveryEstimateDays || 3} días`;
    });

    const bestPriceProduct = products.find((p) => p.price.amount === minPrice);

    return {
      items: comparisonItems,
      bestPriceId: bestPriceProduct?.id,
      bestQualityId: products.reduce((prev, current) =>
        prev.dataQualityScore > current.dataQualityScore ? prev : current
      ).id,
      comparisonMatrix: {
        prices: pricesMap,
        dimensions: dimsMap,
        availability: availMap,
        delivery: delivMap,
      },
    };
  }
}
