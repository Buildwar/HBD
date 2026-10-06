/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT & DIGITAL TWIN SERVICE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { apiClient } from './api.js';
import {
  ProductDto,
  ProductImportResultDto,
  ProjectProductDto,
  ShoppingListItemDto,
} from '@hbd/shared';

export interface ProductListParams {
  projectId?: string;
  brand?: string;
  category?: string;
  search?: string;
}

export interface ShoppingListResponse {
  items: ShoppingListItemDto[];
  summary: {
    totalAmount: number;
    totalItemsCount: number;
    currency: string;
  };
}

export class ProductService {
  /**
   * Analiza una URL externa e infiere los datos del producto
   */
  static async importFromUrl(
    url: string,
    projectId?: string,
    aiAssisted = true
  ): Promise<ProductImportResultDto> {
    const res = await apiClient.post<{ success: boolean; data: ProductImportResultDto }>(
      '/products/import',
      { url, projectId, aiAssisted }
    );
    return res.data;
  }

  /**
   * Guarda formalmente el producto confirmado y genera su Gemelo Digital
   */
  static async confirmAndSave(
    product: Partial<ProductDto>,
    createFurnitureTwin = true
  ): Promise<{ product: ProductDto; furnitureTwin?: any; furniture?: any }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { product: ProductDto; furnitureTwin?: any; furniture?: any };
    }>('/products/confirm', { product, createFurnitureTwin });
    return res.data;
  }

  /**
   * Obtiene la lista de productos del catálogo
   */
  static async getProducts(params?: ProductListParams): Promise<ProductDto[]> {
    const query = new URLSearchParams();
    if (params?.projectId) query.append('projectId', params.projectId);
    if (params?.brand) query.append('brand', params.brand);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<{ success: boolean; data: ProductDto[] }>(`/products${queryString}`);
    return res.data;
  }

  /**
   * Obtiene el detalle de un producto por ID
   */
  static async getProductById(id: string): Promise<ProductDto> {
    const res = await apiClient.get<{ success: boolean; data: ProductDto }>(`/products/${id}`);
    return res.data;
  }

  /**
   * Elimina un producto
   */
  static async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  /**
   * Obtiene los productos asignados a un proyecto
   */
  static async getProjectProducts(projectId: string): Promise<ProjectProductDto[]> {
    const res = await apiClient.get<{ success: boolean; data: ProjectProductDto[] }>(
      `/products/project/${projectId}`
    );
    return res.data;
  }

  /**
   * Asigna un producto a una estancia del proyecto
   */
  static async addProductToProject(
    projectId: string,
    data: {
      productId: string;
      variantId?: string;
      roomId?: string;
      roomName?: string;
      floorId?: string;
      quantity?: number;
      unitPrice?: number;
      notes?: string;
    }
  ): Promise<ProjectProductDto> {
    const res = await apiClient.post<{ success: boolean; data: ProjectProductDto }>(
      `/products/project/${projectId}`,
      data
    );
    return res.data;
  }

  /**
   * Elimina un producto del proyecto
   */
  static async removeProjectProduct(projectProductId: string): Promise<void> {
    await apiClient.delete(`/products/project/item/${projectProductId}`);
  }

  /**
   * Obtiene la lista de compras del proyecto
   */
  static async getProjectShoppingList(projectId: string): Promise<ShoppingListResponse> {
    const res = await apiClient.get<{ success: boolean; data: ShoppingListResponse }>(
      `/products/project/${projectId}/shopping-list`
    );
    return res.data;
  }
}
