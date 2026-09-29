/**
 * HBD — HOME BOARD DESIGNER V5.0.0
 * Furniture & Placement Client Service
 */

import { api } from './api.js';
import {
  FurnitureCategoryDto,
  FurnitureDto,
  FurniturePlacementDto,
  SpatialValidationResult,
} from '@hbd/shared';

export const furnitureService = {
  async getCategories(): Promise<{ success: boolean; data: FurnitureCategoryDto[] }> {
    return api.get<{ success: boolean; data: FurnitureCategoryDto[] }>('/furniture/categories');
  },

  async getFurniture(params?: { categoryId?: string; search?: string; customOnly?: boolean }): Promise<{ success: boolean; data: FurnitureDto[] }> {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    if (params?.customOnly) query.append('customOnly', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ success: boolean; data: FurnitureDto[] }>(`/furniture${queryString}`);
  },

  async createFurniture(data: {
    name: string;
    categoryId: string;
    widthM: number;
    depthM: number;
    heightM: number;
    description?: string;
    imageUrl?: string;
  }): Promise<{ success: boolean; data: FurnitureDto }> {
    return api.post<{ success: boolean; data: FurnitureDto }>('/furniture', data);
  },

  async updateFurniture(id: string, data: Partial<FurnitureDto>): Promise<{ success: boolean; data: FurnitureDto }> {
    return api.put<{ success: boolean; data: FurnitureDto }>(`/furniture/${id}`, data);
  },

  async deleteFurniture(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/furniture/${id}`);
  },

  async getFloorPlacements(floorId: string): Promise<{ success: boolean; data: FurniturePlacementDto[] }> {
    return api.get<{ success: boolean; data: FurniturePlacementDto[] }>(`/floors/${floorId}/placements`);
  },

  async createPlacement(floorId: string, data: {
    furnitureId: string;
    posX: number;
    posY: number;
    posZ?: number;
    rotationDeg?: number;
    widthM?: number;
    depthM?: number;
    heightM?: number;
    roomId?: string;
  }): Promise<{ success: boolean; data: FurniturePlacementDto }> {
    return api.post<{ success: boolean; data: FurniturePlacementDto }>(`/floors/${floorId}/placements`, data);
  },

  async updatePlacement(id: string, data: Partial<FurniturePlacementDto>): Promise<{ success: boolean; data: FurniturePlacementDto }> {
    return api.put<{ success: boolean; data: FurniturePlacementDto }>(`/placements/${id}`, data);
  },

  async deletePlacement(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/placements/${id}`);
  },

  async duplicatePlacement(id: string): Promise<{ success: boolean; data: FurniturePlacementDto }> {
    return api.post<{ success: boolean; data: FurniturePlacementDto }>(`/placements/${id}/duplicate`);
  },

  async validatePlacement(data: any): Promise<{ success: boolean; data: SpatialValidationResult }> {
    return api.post<{ success: boolean; data: SpatialValidationResult }>('/placements/validate', data);
  },
};
