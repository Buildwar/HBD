/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Servicio de Cliente para Render y Escenas (RenderService)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { api } from './api.js';
import {
  SceneDefinition,
  RenderRecord,
  StylePresetDefinition,
  Scene3DData,
} from '@hbd/shared';

export const renderService = {
  /**
   * Obtiene las escenas y configuraciones 3D para una planta
   */
  async getFloorScenes(floorId: string): Promise<{
    success: boolean;
    data: {
      scenes: SceneDefinition[];
      scene3D: Scene3DData;
      presets: StylePresetDefinition[];
    };
  }> {
    return api.get<{
      success: boolean;
      data: {
        scenes: SceneDefinition[];
        scene3D: Scene3DData;
        presets: StylePresetDefinition[];
      };
    }>(`/render/scenes/${floorId}`);
  },

  /**
   * Obtiene la galería de renders guardados para un proyecto
   */
  async getProjectRenders(projectId: string): Promise<{ success: boolean; data: RenderRecord[] }> {
    return api.get<{ success: boolean; data: RenderRecord[] }>(`/render/gallery/${projectId}`);
  },

  /**
   * Guarda un nuevo render generado en la galería del proyecto
   */
  async saveRender(data: {
    projectId: string;
    name: string;
    imageUrl: string;
    resolution?: string;
    quality?: string;
    metadata?: any;
  }): Promise<{ success: boolean; data: RenderRecord }> {
    return api.post<{ success: boolean; data: RenderRecord }>('/render/gallery', data);
  },

  /**
   * Elimina un render de la galería
   */
  async deleteRender(renderId: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/render/gallery/${renderId}`);
  },

  /**
   * Obtiene la lista de presets de estilo arquitectónico
   */
  async getPresets(): Promise<{ success: boolean; data: StylePresetDefinition[] }> {
    return api.get<{ success: boolean; data: StylePresetDefinition[] }>('/render/presets');
  },
};
