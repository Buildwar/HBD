/**
 * HBD — Retail Search & Discovery Engine
 * V20.0.0 — Connected Retail Catalog
 */

import { RetailerRegistry } from '../connectors/retailer.registry.js';
import { ProductMatchingEngine } from './productMatching.engine.js';
import type {
  RetailCatalogSearchParams,
  RetailCatalogSearchResult,
  RetailProductDto,
  RetailerMetadata,
} from '@hbd/shared';

export class RetailSearchEngine {
  /**
   * Main search execution across connected retailers with normalization and faceted filtering
   */
  static async search(params: RetailCatalogSearchParams): Promise<RetailCatalogSearchResult> {
    const registry = RetailerRegistry.getInstance();

    // 1. Fetch products and metadata
    const [{ products, totalQueried }, retailers] = await Promise.all([
      registry.searchAllRetailers(params),
      registry.getRetailersMetadata(),
    ]);

    let filtered = [...products];

    // 2. Filter by Category
    if (params.category) {
      const targetCat = ProductMatchingEngine.normalizeString(params.category);
      filtered = filtered.filter(
        (p) =>
          ProductMatchingEngine.normalizeString(p.category).includes(targetCat) ||
          (p.subcategory && ProductMatchingEngine.normalizeString(p.subcategory).includes(targetCat))
      );
    }

    // 3. Price range filtering
    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price.amount >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price.amount <= params.maxPrice!);
    }

    // 4. In-stock only filtering
    if (params.inStockOnly) {
      filtered = filtered.filter(
        (p) => p.availability.status === 'IN_STOCK' || (p.availability as any).inStock === true
      );
    }

    // 5. Free-text matching with normalization
    if (params.query) {
      const normalizedQuery = ProductMatchingEngine.normalizeString(params.query);
      const queryTokens = normalizedQuery.split(' ').filter((t) => t.length > 1);

      filtered = filtered.filter((product) => {
        const searchableText = ProductMatchingEngine.normalizeString(
          `${product.name} ${product.brand || ''} ${product.category} ${product.subcategory || ''} ${product.description || ''} ${product.sku || ''} ${product.colors.join(' ')} ${product.materials.join(' ')}`
        );

        // Every token should match or whole phrase should match
        return (
          searchableText.includes(normalizedQuery) ||
          queryTokens.every((token) => searchableText.includes(token))
        );
      });
    }

    // 6. Color & Material exact/containment filter
    if (params.color) {
      const targetColor = params.color.toLowerCase();
      filtered = filtered.filter((p) =>
        p.colors.some((c) => c.toLowerCase().includes(targetColor))
      );
    }
    if (params.material) {
      const targetMat = params.material.toLowerCase();
      filtered = filtered.filter((p) =>
        p.materials.some((m) => m.toLowerCase().includes(targetMat))
      );
    }

    // 4. Fit to zone constraint (Space-aware & Wall-aware search)
    if (params.fitToZone) {
      const { availableWidthM, availableDepthM, availableHeightM } = params.fitToZone;
      filtered = filtered.filter((p) => {
        const fitsWidth = p.dimensions.widthM <= availableWidthM;
        const fitsDepth = p.dimensions.depthM <= availableDepthM;
        const fitsHeight = availableHeightM ? p.dimensions.heightM <= availableHeightM : true;
        return fitsWidth && fitsDepth && fitsHeight;
      });
    }

    // 5. Facets Aggregation
    const categoriesSet = new Set<string>();
    const colorsSet = new Set<string>();
    const materialsSet = new Set<string>();

    filtered.forEach((p) => {
      if (p.category) categoriesSet.add(p.category);
      p.colors.forEach((c) => colorsSet.add(c));
      p.materials.forEach((m) => materialsSet.add(m));
    });

    const retailersSummary = retailers.map((r) => ({
      code: r.code,
      name: r.name,
      count: filtered.filter((p) => p.retailerCode === r.code).length,
      status: r.status,
    }));

    // 6. Sorting
    const sortBy = params.sortBy || 'relevance';
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'quality':
        filtered.sort((a, b) => b.dataQualityScore - a.dataQualityScore);
        break;
      case 'dimensions':
        filtered.sort((a, b) => a.dimensions.widthM - b.dimensions.widthM);
        break;
      case 'availability':
        filtered.sort((a, b) => (a.availability.status === 'IN_STOCK' ? -1 : 1));
        break;
      case 'relevance':
      default:
        // Prioritize in-stock and higher quality score
        filtered.sort((a, b) => {
          if (a.availability.status === 'IN_STOCK' && b.availability.status !== 'IN_STOCK') return -1;
          if (b.availability.status === 'IN_STOCK' && a.availability.status !== 'IN_STOCK') return 1;
          return b.dataQualityScore - a.dataQualityScore;
        });
        break;
    }

    // 7. Pagination
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      totalCount,
      page,
      totalPages,
      limit,
      retailersSummary,
      availableCategories: Array.from(categoriesSet),
      availableColors: Array.from(colorsSet),
      availableMaterials: Array.from(materialsSet),
      queryNormalized: params.query ? ProductMatchingEngine.normalizeString(params.query) : undefined,
      totalRetailersQueried: totalQueried,
    };
  }
}
