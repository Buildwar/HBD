/**
 * HBD — Base Retail Connector Contract
 * V20.0.0 — Connected Retail Catalog
 */

import type {
  RetailerMetadata,
  RetailProductDto,
  RetailProductVariantDto,
  RetailProductPriceDto,
  RetailProductAvailabilityDto,
  RetailCatalogSearchParams,
  RetailerCode,
} from '@hbd/shared';

export interface IRetailConnector {
  readonly code: RetailerCode;
  readonly name: string;

  getMetadata(): Promise<RetailerMetadata>;
  searchProducts(params: RetailCatalogSearchParams): Promise<RetailProductDto[]>;
  getProduct(externalId: string): Promise<RetailProductDto | null>;
  getVariants(externalId: string): Promise<RetailProductVariantDto[]>;
  getAvailability(externalId: string, postalCode?: string): Promise<RetailProductAvailabilityDto>;
  getCategories(): Promise<string[]>;
  getPrice(externalId: string, variantId?: string): Promise<RetailProductPriceDto>;
  testConnection(): Promise<{ success: boolean; message: string; latencyMs: number }>;
}
