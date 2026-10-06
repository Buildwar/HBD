/**
 * HBD — Product Data Quality Service
 * V20.0.0 — Connected Retail Catalog
 */

import type { RetailProductDto } from '@hbd/shared';

export class ProductDataQualityService {
  /**
   * Calculates a data quality score between 0.0 and 1.0 (0% - 100%)
   * based on completeness of dimensions, pricing, imagery, materials, and provenance.
   */
  static calculateQualityScore(product: Partial<RetailProductDto>): number {
    let score = 0;

    // 1. Dimensions completeness (30%)
    if (
      product.dimensions &&
      product.dimensions.widthM > 0 &&
      product.dimensions.depthM > 0 &&
      product.dimensions.heightM > 0
    ) {
      score += 0.3;
    } else if (product.dimensions && product.dimensions.widthM > 0) {
      score += 0.15;
    }

    // 2. Price completeness & type (20%)
    if (product.price && product.price.amount > 0 && product.price.currency) {
      score += 0.2;
    }

    // 3. Imagery and visual assets (20%)
    if (product.primaryImageUrl && product.primaryImageUrl.startsWith('http')) {
      score += 0.15;
    }
    if (product.assets && product.assets.length > 1) {
      score += 0.05;
    }

    // 4. SKU, Brand and Description (15%)
    if (product.sku || product.reference) {
      score += 0.05;
    }
    if (product.brand) {
      score += 0.05;
    }
    if (product.description && product.description.length > 20) {
      score += 0.05;
    }

    // 5. Materials & Color details (15%)
    if (product.materials && product.materials.length > 0) {
      score += 0.075;
    }
    if (product.colors && product.colors.length > 0) {
      score += 0.075;
    }

    return Math.min(1.0, parseFloat(score.toFixed(2)));
  }
}
