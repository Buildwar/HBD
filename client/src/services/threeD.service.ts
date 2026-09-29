/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Servicio de API 3D (ThreeDService)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { api } from './api.js';
import { Scene3DData, SceneLightingMode, SpatialValidationResult, FurniturePlacementDto } from '@hbd/shared';

export const threeDService = {
  /**
   * Obtiene la escena 3D completa generada por ThreeDConversionEngine a partir del plano 2D
   */
  async getScene3D(floorId: string, lightingMode: SceneLightingMode = 'day'): Promise<{ success: boolean; data: Scene3DData }> {
    return api.get<{ success: boolean; data: Scene3DData }>(`/3d/scene/${floorId}?lighting=${lightingMode}`);
  },

  /**
   * Sincroniza transformaciones de muebles realizadas en el entorno 3D hacia el modelo 2D
   */
  async syncFurniture3D(
    placementId: string,
    data: { posX: number; posY: number; posZ?: number; rotationDeg?: number }
  ): Promise<{
    success: boolean;
    data: {
      placement: FurniturePlacementDto;
      validation: SpatialValidationResult;
    };
  }> {
    return api.post<{
      success: boolean;
      data: {
        placement: FurniturePlacementDto;
        validation: SpatialValidationResult;
      };
    }>(`/3d/sync-furniture/${placementId}`, data);
  },
};
