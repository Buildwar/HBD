/**
 * HBD — HOME BOARD DESIGNER (V10.0.0 / V11.0.0)
 * SpaceClientService — Servicio Frontend para Espacios, Zonas Funcionales e Inteligencia Espacial
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { api } from './api.js';
import {
  SpaceDto,
  FunctionalZoneDto,
  ProjectIntelligenceDto,
} from '@hbd/shared';

export const spaceService = {
  async getProjectIntelligence(projectId: string): Promise<{ success: boolean; data: ProjectIntelligenceDto }> {
    return api.get<{ success: boolean; data: ProjectIntelligenceDto }>(`/projects/${projectId}/intelligence`);
  },

  async getSpacesByFloor(projectId: string, floorId: string): Promise<{ success: boolean; data: SpaceDto[] }> {
    return api.get<{ success: boolean; data: SpaceDto[] }>(`/projects/${projectId}/floors/${floorId}/spaces`);
  },

  async createSpace(
    projectId: string,
    floorId: string,
    data: {
      name: string;
      type?: string;
      description?: string;
      polygon?: Array<{ x: number; y: number }>;
      heightM?: number;
      color?: string;
      roomIds?: string[];
    }
  ): Promise<{ success: boolean; data: SpaceDto }> {
    return api.post<{ success: boolean; data: SpaceDto }>(`/projects/${projectId}/floors/${floorId}/spaces`, data);
  },

  async updateSpace(
    spaceId: string,
    data: {
      name?: string;
      type?: string;
      description?: string;
      polygon?: Array<{ x: number; y: number }>;
      heightM?: number;
      color?: string;
      roomIds?: string[];
    }
  ): Promise<{ success: boolean; data: SpaceDto }> {
    return api.patch<{ success: boolean; data: SpaceDto }>(`/spaces/${spaceId}`, data);
  },

  async deleteSpace(spaceId: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/spaces/${spaceId}`);
  },

  async createFunctionalZone(
    spaceId: string,
    data: {
      name: string;
      type: string;
      polygon?: Array<{ x: number; y: number }>;
      areaM2?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<{ success: boolean; data: FunctionalZoneDto }> {
    return api.post<{ success: boolean; data: FunctionalZoneDto }>(`/spaces/${spaceId}/zones`, data);
  },

  async updateFunctionalZone(
    zoneId: string,
    data: {
      name?: string;
      type?: string;
      polygon?: Array<{ x: number; y: number }>;
      areaM2?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<{ success: boolean; data: FunctionalZoneDto }> {
    return api.patch<{ success: boolean; data: FunctionalZoneDto }>(`/zones/${zoneId}`, data);
  },

  async deleteFunctionalZone(zoneId: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/zones/${zoneId}`);
  },
};
