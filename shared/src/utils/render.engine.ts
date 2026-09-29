/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Motor de Renderizado Arquitectónico (RenderEngine)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  RenderQuality,
  RenderResolution,
  ResolutionConfig,
  QualityConfig,
  SceneDefinition,
} from '../types/render.types.js';
import { Scene3DData } from '../types/threeD.types.js';

export const RESOLUTION_PRESETS: ResolutionConfig[] = [
  {
    id: 'preview_720p',
    name: 'Previsualización Rápida (720p)',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    description: 'Borrador inmediato para evaluar encuadre y luces.',
  },
  {
    id: 'hd_1080p',
    name: 'Full HD (1080p)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'Resolución estándar óptima para pantallas y presentaciones.',
  },
  {
    id: '2k_1440p',
    name: '2K Quad HD (1440p)',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    description: 'Alta definición con nitidez superior y detalle de materiales.',
  },
  {
    id: '4k_uhd',
    name: '4K Ultra HD (2160p)',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    description: 'Máxima resolución para visualizaciones e impresiones de gran formato.',
  },
];

export const QUALITY_CONFIGS: QualityConfig[] = [
  {
    id: 'draft',
    name: 'Borrador (Draft)',
    description: 'Render instantáneo sin muestreo complejo.',
    shadowMapSize: 1024,
    antialiasSamples: 1,
    toneMappingExposure: 1.0,
    useSoftShadows: false,
  },
  {
    id: 'medium',
    name: 'Equilibrado (Medium)',
    description: 'Equilibrio entre velocidad y calidad visual.',
    shadowMapSize: 2048,
    antialiasSamples: 2,
    toneMappingExposure: 1.05,
    useSoftShadows: true,
  },
  {
    id: 'high',
    name: 'Alta Calidad (High)',
    description: 'Sombras de alta definición y postprocesado completo.',
    shadowMapSize: 4096,
    antialiasSamples: 4,
    toneMappingExposure: 1.1,
    useSoftShadows: true,
  },
  {
    id: 'ultra',
    name: 'Ultra Fotorrealista (Ultra)',
    description: 'Máxima fidelidad lumínica, oclusión ambiental y nitidez extrema.',
    shadowMapSize: 4096,
    antialiasSamples: 8,
    toneMappingExposure: 1.15,
    useSoftShadows: true,
  },
];

export class RenderEngine {
  /**
   * Obtiene la configuración de resolución correspondiente al identificador
   */
  public static getResolutionConfig(resId: RenderResolution): ResolutionConfig {
    return RESOLUTION_PRESETS.find((r) => r.id === resId) || RESOLUTION_PRESETS[1];
  }

  /**
   * Obtiene la configuración de calidad correspondiente
   */
  public static getQualityConfig(qualityId: RenderQuality): QualityConfig {
    return QUALITY_CONFIGS.find((q) => q.id === qualityId) || QUALITY_CONFIGS[2];
  }

  /**
   * Valida que la escena y la geometría sean consistentes antes de iniciar el renderizado
   */
  public static validateSceneForRender(
    scene: SceneDefinition,
    scene3D: Scene3DData
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!scene.camera || !scene.camera.position || !scene.camera.target) {
      errors.push('La configuración de cámara no es válida.');
    }

    if (!scene3D.walls || scene3D.walls.length === 0) {
      errors.push('La escena 3D no contiene paredes definidas.');
    }

    if (!scene3D.floors || scene3D.floors.length === 0) {
      errors.push('La escena 3D no contiene habitaciones ni suelos definidos.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Estima la duración de cálculo aproximada en milisegundos
   */
  public static estimateRenderDurationMs(quality: RenderQuality, resolution: RenderResolution): number {
    const resWeight = resolution === '4k_uhd' ? 4 : resolution === '2k_1440p' ? 2 : 1;
    const qualWeight = quality === 'ultra' ? 1200 : quality === 'high' ? 800 : quality === 'medium' ? 400 : 150;

    return Math.round(resWeight * qualWeight);
  }
}
