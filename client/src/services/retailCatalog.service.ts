/**
 * HBD — Retail Catalog Client Service
 * V20.0.0 — Connected Retail Catalog & Product Placement
 */

import { api } from './api.js';
import type {
  RetailCatalogSearchParams,
  RetailCatalogSearchResult,
  RetailProductDto,
  RetailerMetadata,
  RetailProductComparisonResultDto,
  AddRetailProductToProjectInput,
  AddRetailProductToProjectResult,
  ConnectorConfigDto,
} from '@hbd/shared';

export const retailCatalogService = {
  async search(params: RetailCatalogSearchParams = {}): Promise<{ success: boolean; data: RetailCatalogSearchResult }> {
    const queryParts: string[] = [];

    if (params.query) queryParts.push(`q=${encodeURIComponent(params.query)}`);
    if (params.retailerCodes && params.retailerCodes.length > 0) {
      queryParts.push(`retailers=${encodeURIComponent(params.retailerCodes.join(','))}`);
    }
    if (params.categories && params.categories.length > 0) {
      queryParts.push(`categories=${encodeURIComponent(params.categories.join(','))}`);
    }
    if (params.minPrice !== undefined) queryParts.push(`minPrice=${params.minPrice}`);
    if (params.maxPrice !== undefined) queryParts.push(`maxPrice=${params.maxPrice}`);
    if (params.inStockOnly) queryParts.push(`inStock=true`);
    if (params.roomType) queryParts.push(`roomType=${encodeURIComponent(params.roomType)}`);
    if (params.color) queryParts.push(`color=${encodeURIComponent(params.color)}`);
    if (params.material) queryParts.push(`material=${encodeURIComponent(params.material)}`);
    if (params.maxWidth !== undefined) queryParts.push(`maxWidth=${params.maxWidth}`);
    if (params.maxDepth !== undefined) queryParts.push(`maxDepth=${params.maxDepth}`);
    if (params.maxHeight !== undefined) queryParts.push(`maxHeight=${params.maxHeight}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.page !== undefined) queryParts.push(`page=${params.page}`);
    if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);

    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api.get<{ success: boolean; data: RetailCatalogSearchResult }>(`/catalog/search${qs}`);
  },

  async getProduct(id: string): Promise<{ success: boolean; data: RetailProductDto }> {
    return api.get<{ success: boolean; data: RetailProductDto }>(`/catalog/products/${id}`);
  },

  async getRetailers(): Promise<{ success: boolean; data: RetailerMetadata[] }> {
    return api.get<{ success: boolean; data: RetailerMetadata[] }>('/catalog/retailers');
  },

  async testRetailerConnection(code: string): Promise<{ success: boolean; data: { success: boolean; message: string; latencyMs: number } }> {
    return api.post<{ success: boolean; data: { success: boolean; message: string; latencyMs: number } }>(`/catalog/retailers/${code}/test`);
  },

  async updateRetailerConfig(code: string, config: Partial<ConnectorConfigDto>): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(`/catalog/retailers/${code}/config`, config);
  },

  async syncCatalog(retailerCode?: string): Promise<{ success: boolean; data: any; message: string }> {
    return api.post<{ success: boolean; data: any; message: string }>('/catalog/retailers/sync', { retailerCode });
  },

  async compareProducts(productIds: string[]): Promise<{ success: boolean; data: RetailProductComparisonResultDto }> {
    return api.post<{ success: boolean; data: RetailProductComparisonResultDto }>('/catalog/compare', { productIds });
  },

  async addProductToProject(
    projectId: string,
    input: Omit<AddRetailProductToProjectInput, 'projectId'>
  ): Promise<{ success: boolean; data: AddRetailProductToProjectResult }> {
    return api.post<{ success: boolean; data: AddRetailProductToProjectResult }>(
      `/catalog/projects/${projectId}/add`,
      input
    );
  },

  async toggleFavorite(productId: string): Promise<{ success: boolean; isFavorite: boolean; message: string }> {
    return api.post<{ success: boolean; isFavorite: boolean; message: string }>(`/catalog/products/${productId}/favorite`);
  },
};
