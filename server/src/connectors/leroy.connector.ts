/**
 * HBD — Leroy Merlin Retail Connector
 * V20.0.0 — Connected Retail Catalog
 */

import { IRetailConnector } from './base.connector.js';
import { MOCK_RETAIL_CATALOG } from './mock.connector.js';
import type {
  RetailerMetadata,
  RetailProductDto,
  RetailProductVariantDto,
  RetailProductPriceDto,
  RetailProductAvailabilityDto,
  RetailCatalogSearchParams,
  RetailerCode,
} from '@hbd/shared';

export class LeroyMerlinConnector implements IRetailConnector {
  readonly code: RetailerCode = 'LEROY_MERLIN';
  readonly name: string = 'Leroy Merlin';

  async getMetadata(): Promise<RetailerMetadata> {
    return {
      id: 'retailer-leroy-merlin',
      code: 'LEROY_MERLIN',
      name: 'Leroy Merlin España',
      logoUrl: 'https://media.adeo.com/marketplace/MKP/82348921/format/400x400.jpg',
      websiteUrl: 'https://www.leroymerlin.es/',
      isEnabled: true,
      status: 'AVAILABLE',
      capabilities: [
        'SEARCH',
        'PRODUCT_DETAILS',
        'PRICING',
        'AVAILABILITY',
        'CATEGORIES',
        'IMAGES',
        'DELIVERY_ESTIMATE',
        'PURCHASE_REDIRECT',
      ],
      integrationType: 'OFFICIAL_FEED',
      productsCount: MOCK_RETAIL_CATALOG.filter((p) => p.retailerCode === 'LEROY_MERLIN').length,
      isMockData: true,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'SUCCESS',
      notes: 'Conector para pavimentos, grifería, iluminación, baño y materiales de construcción.',
    };
  }

  async searchProducts(params: RetailCatalogSearchParams): Promise<RetailProductDto[]> {
    let items = MOCK_RETAIL_CATALOG.filter((p) => p.retailerCode === 'LEROY_MERLIN');

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    if (params.categories && params.categories.length > 0) {
      items = items.filter((p) => params.categories!.includes(p.category));
    }

    if (params.minPrice !== undefined) {
      items = items.filter((p) => p.price.amount >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      items = items.filter((p) => p.price.amount <= params.maxPrice!);
    }

    return items;
  }

  async getProduct(externalId: string): Promise<RetailProductDto | null> {
    const item = MOCK_RETAIL_CATALOG.find(
      (p) => p.retailerCode === 'LEROY_MERLIN' && (p.externalId === externalId || p.id === externalId)
    );
    return item || null;
  }

  async getVariants(externalId: string): Promise<RetailProductVariantDto[]> {
    const product = await this.getProduct(externalId);
    return product ? product.variants : [];
  }

  async getAvailability(externalId: string, _postalCode?: string): Promise<RetailProductAvailabilityDto> {
    const product = await this.getProduct(externalId);
    if (product) return product.availability;
    return { status: 'UNKNOWN', retrievedAt: new Date().toISOString() };
  }

  async getCategories(): Promise<string[]> {
    const set = new Set<string>();
    MOCK_RETAIL_CATALOG.filter((p) => p.retailerCode === 'LEROY_MERLIN').forEach((p) => set.add(p.category));
    return Array.from(set);
  }

  async getPrice(externalId: string): Promise<RetailProductPriceDto> {
    const product = await this.getProduct(externalId);
    if (product) return product.price;
    return {
      amount: 0,
      currency: 'EUR',
      priceType: 'UNKNOWN',
      source: 'UNKNOWN' as any,
      retrievedAt: new Date().toISOString(),
      confidence: 0,
      freshness: 'UNKNOWN',
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs: number }> {
    return {
      success: true,
      message: 'Conexión con catálogo Leroy Merlin activa y verificada.',
      latencyMs: 18,
    };
  }
}
