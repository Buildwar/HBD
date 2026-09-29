/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * Servicio de Cliente: API de Visión Artificial, Galería y Reconocimiento Inteligente
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { api } from './api.js';
import {
  ProjectImageDto,
  VisionAnalysisResult,
  VisionDiffResult,
  VisionReviewDto,
  ImageSourceType,
  VisionProviderConfig,
} from '@hbd/shared';

export const aiVisionService = {
  /**
   * Obtiene el estado del proveedor de Visión IA
   */
  async getProviderStatus(): Promise<{ success: boolean; data: VisionProviderConfig }> {
    return api.get<{ success: boolean; data: VisionProviderConfig }>('/ai/vision/status');
  },

  /**
   * Sube una imagen a la galería del proyecto
   */
  async uploadImage(params: {
    projectId: string;
    floorId?: string;
    roomId?: string;
    sourceType?: ImageSourceType;
    file: File;
  }): Promise<{ success: boolean; data: ProjectImageDto; message?: string }> {
    const formData = new FormData();
    formData.append('image', params.file);
    formData.append('projectId', params.projectId);
    if (params.floorId) formData.append('floorId', params.floorId);
    if (params.roomId) formData.append('roomId', params.roomId);
    if (params.sourceType) formData.append('sourceType', params.sourceType);

    return api.upload<{ success: boolean; data: ProjectImageDto; message?: string }>(
      '/ai/vision/upload',
      formData
    );
  },

  /**
   * Obtiene todas las imágenes de la galería de un proyecto
   */
  async getProjectImages(
    projectId: string,
    sourceType?: ImageSourceType
  ): Promise<{ success: boolean; data: ProjectImageDto[] }> {
    const query = sourceType ? `?sourceType=${encodeURIComponent(sourceType)}` : '';
    return api.get<{ success: boolean; data: ProjectImageDto[] }>(
      `/ai/vision/project/${projectId}${query}`
    );
  },

  /**
   * Obtiene una imagen por su ID con sus análisis
   */
  async getImageById(imageId: string): Promise<{ success: boolean; data: ProjectImageDto }> {
    return api.get<{ success: boolean; data: ProjectImageDto }>(`/ai/vision/image/${imageId}`);
  },

  /**
   * Elimina una imagen de la galería
   */
  async deleteImage(imageId: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/ai/vision/image/${imageId}`);
  },

  /**
   * Analiza una imagen mediante el motor de visión
   */
  async analyzeImage(imageId: string): Promise<{ success: boolean; data: VisionAnalysisResult; message?: string }> {
    return api.post<{ success: boolean; data: VisionAnalysisResult; message?: string }>(
      '/ai/vision/analyze',
      { imageId }
    );
  },

  /**
   * Compara una foto real analizada contra el modelo 2D/3D del proyecto
   */
  async compareWithProject(imageId: string): Promise<{ success: boolean; data: VisionDiffResult }> {
    return api.post<{ success: boolean; data: VisionDiffResult }>('/ai/vision/compare', { imageId });
  },

  /**
   * Confirma y aplica las detecciones revisadas por el usuario al modelo
   */
  async reviewAndApply(reviewDto: VisionReviewDto): Promise<{ success: boolean; data: any; message?: string }> {
    return api.post<{ success: boolean; data: any; message?: string }>(
      '/ai/vision/review-and-apply',
      reviewDto
    );
  },

  /**
   * Obtiene el historial de análisis de visión del proyecto
   */
  async getHistory(projectId: string): Promise<{ success: boolean; data: any[] }> {
    return api.get<{ success: boolean; data: any[] }>(`/ai/vision/history/${projectId}`);
  },
};
