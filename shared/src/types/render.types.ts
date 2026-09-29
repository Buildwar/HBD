/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Tipos y Definiciones para Visualización Arquitectónica, Escenas y Render Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Vector3D, SceneLightingMode } from './threeD.types.js';

export type RenderQuality = 'draft' | 'medium' | 'high' | 'ultra';

export type RenderResolution = 'hd_1080p' | '2k_1440p' | '4k_uhd' | 'preview_720p';

export type TimeOfDay = '08:00' | '12:00' | '16:00' | '20:00' | '23:00';

export type ColorTemperatureK = 2700 | 3000 | 3500 | 4000 | 5000 | 6500;

export type DesignStylePreset = 'modern' | 'minimalist' | 'industrial' | 'nordic' | 'classic';

export interface ResolutionConfig {
  id: RenderResolution;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export interface QualityConfig {
  id: RenderQuality;
  name: string;
  description: string;
  shadowMapSize: number;
  antialiasSamples: number;
  toneMappingExposure: number;
  useSoftShadows: boolean;
}

export interface CameraSetting3D {
  position: Vector3D;
  target: Vector3D;
  fov: number;
  heightM: number;
  focalLengthMm?: number;
  depthOfFieldEnabled?: boolean;
  focalDistanceM?: number;
  aperture?: number;
}

export interface ArtificialLight3D {
  id: string;
  name: string;
  type: 'point' | 'spot' | 'ambient';
  position: Vector3D;
  colorHex: string;
  colorTempK: ColorTemperatureK;
  intensity: number;
  distanceM: number;
  spotAngleDeg?: number;
  castShadow?: boolean;
}

export interface LightingSetting3D {
  mode: SceneLightingMode | 'sunset';
  timeOfDay: TimeOfDay;
  sunIntensity: number;
  sunElevationDeg: number;
  sunAzimuthDeg: number;
  ambientIntensity: number;
  ambientColorHex: string;
  artificialLights: ArtificialLight3D[];
}

export interface PostProcessingSetting3D {
  exposure: number;      // -2.0 a +2.0 (default 0)
  contrast: number;      // 0.5 a 1.5 (default 1.0)
  brightness: number;    // -0.5 a 0.5 (default 0)
  saturation: number;    // 0.0 a 2.0 (default 1.0)
  temperature: number;   // -100 a +100 (cálido a frío)
  vignette: number;      // 0.0 a 1.0 (default 0.1)
  ambientOcclusion: boolean;
}

export interface DesignVariant {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  materialOverrides: Record<string, string>; // entityId / surfaceId -> materialColor / materialId
  furnitureOverrides?: Record<string, any>;
  createdAt: string;
}

export interface SceneDefinition {
  id: string;
  name: string;
  floorId: string;
  roomId?: string;
  isFavorite?: boolean;
  camera: CameraSetting3D;
  lighting: LightingSetting3D;
  postProcessing: PostProcessingSetting3D;
  activeVariantId?: string;
  designVariants: DesignVariant[];
  createdAt: string;
  updatedAt?: string;
}

export interface RenderRecord {
  id: string;
  projectId: string;
  floorId?: string;
  name?: string;
  sceneId?: string;
  sceneName?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  resolution: string;
  resolutionWidth: number;
  resolutionHeight: number;
  quality: RenderQuality;
  durationMs: number;
  variantName?: string;
  metadata?: {
    camera?: CameraSetting3D;
    lighting?: LightingSetting3D;
    timeOfDay?: string;
  };
  createdAt: string;
}

export interface StylePresetDefinition {
  id: DesignStylePreset;
  name: string;
  description: string;
  icon: string;
  palette: {
    wallColor: string;
    floorColor: string;
    ceilingColor: string;
    furnitureColor: string;
  };
  lightingDefaults: {
    mode: SceneLightingMode | 'sunset';
    timeOfDay: TimeOfDay;
    sunIntensity: number;
    colorTempK: ColorTemperatureK;
  };
}
