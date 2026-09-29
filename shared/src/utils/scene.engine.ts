/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Motor de Escenas y Composición (SceneEngine)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  SceneDefinition,
  CameraSetting3D,
  LightingSetting3D,
  PostProcessingSetting3D,
  DesignVariant,
  TimeOfDay,
  ColorTemperatureK,
  StylePresetDefinition,
  DesignStylePreset,
} from '../types/render.types.js';
import { Vector3D, Floor3D, Scene3DData } from '../types/threeD.types.js';

export const STYLE_PRESETS: StylePresetDefinition[] = [
  {
    id: 'modern',
    name: 'Moderno Elegante',
    description: 'Tonos neutros, maderas claras, contrastes equilibrados y acabados mate.',
    icon: 'Sparkles',
    palette: {
      wallColor: '#f8fafc',
      floorColor: '#b48a60',
      ceilingColor: '#ffffff',
      furnitureColor: '#334155',
    },
    lightingDefaults: {
      mode: 'day',
      timeOfDay: '12:00',
      sunIntensity: 1.2,
      colorTempK: 4000,
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalista Puro',
    description: 'Líneas puras, blanco absoluto, pavimentos continuos y acentos negros.',
    icon: 'Maximize2',
    palette: {
      wallColor: '#ffffff',
      floorColor: '#9ca3af',
      ceilingColor: '#ffffff',
      furnitureColor: '#0f172a',
    },
    lightingDefaults: {
      mode: 'day',
      timeOfDay: '12:00',
      sunIntensity: 1.3,
      colorTempK: 5000,
    },
  },
  {
    id: 'industrial',
    name: 'Industrial Loft',
    description: 'Hormigón visto, metales oscuros, maderas recuperadas y cueros nobles.',
    icon: 'Building2',
    palette: {
      wallColor: '#cbd5e1',
      floorColor: '#64748b',
      ceilingColor: '#e2e8f0',
      furnitureColor: '#1e293b',
    },
    lightingDefaults: {
      mode: 'sunset',
      timeOfDay: '16:00',
      sunIntensity: 1.1,
      colorTempK: 3000,
    },
  },
  {
    id: 'nordic',
    name: 'Nórdico Escandinavo',
    description: 'Madera natural, textiles cálidos, tonos arena y luz natural envolvente.',
    icon: 'Compass',
    palette: {
      wallColor: '#f5f5f0',
      floorColor: '#d6b88d',
      ceilingColor: '#ffffff',
      furnitureColor: '#fef3c7',
    },
    lightingDefaults: {
      mode: 'day',
      timeOfDay: '08:00',
      sunIntensity: 1.0,
      colorTempK: 3500,
    },
  },
  {
    id: 'classic',
    name: 'Clásico Contemporáneo',
    description: 'Parquet en espiga de nogal, molduras, blancos rotos y tonos dorados.',
    icon: 'Crown',
    palette: {
      wallColor: '#fefce8',
      floorColor: '#5c4033',
      ceilingColor: '#ffffff',
      furnitureColor: '#92400e',
    },
    lightingDefaults: {
      mode: 'sunset',
      timeOfDay: '20:00',
      sunIntensity: 0.9,
      colorTempK: 2700,
    },
  },
];

export class SceneEngine {
  /**
   * Crea una escena predeterminada a partir de los datos 3D de la planta
   */
  public static createDefaultScene(
    scene3D: Scene3DData,
    name = 'Vista General',
    roomId?: string
  ): SceneDefinition {
    const floorId = scene3D.floorId;
    let cameraConfig: CameraSetting3D;

    if (roomId) {
      const room = scene3D.floors.find((f) => f.id === roomId);
      if (room) {
        cameraConfig = this.createRoomFocusCamera(room.polygonVertices3D, room.heightM, 1.50);
      } else {
        cameraConfig = this.createOverviewCamera(scene3D.bounds);
      }
    } else {
      cameraConfig = this.createOverviewCamera(scene3D.bounds);
    }

    const defaultVariantA: DesignVariant = {
      id: `var_${Date.now()}_a`,
      name: 'Variante A (Estándar)',
      description: 'Configuración original de acabados',
      isDefault: true,
      materialOverrides: {},
      createdAt: new Date().toISOString(),
    };

    const defaultVariantB: DesignVariant = {
      id: `var_${Date.now()}_b`,
      name: 'Variante B (Alternativa)',
      description: 'Propuesta de materiales alternativos para comparación',
      isDefault: false,
      materialOverrides: {
        all_walls: '#f5f5f0',
        all_floors: '#5c4033',
      },
      createdAt: new Date().toISOString(),
    };

    return {
      id: `scene_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      floorId,
      roomId,
      isFavorite: false,
      camera: cameraConfig,
      lighting: {
        mode: 'day',
        timeOfDay: '12:00',
        sunIntensity: 1.2,
        sunElevationDeg: 65,
        sunAzimuthDeg: 180,
        ambientIntensity: 0.75,
        ambientColorHex: '#f8fafc',
        artificialLights: (scene3D.floors || []).map((fl, idx) => ({
          id: `art_light_${fl.id}`,
          name: `Luz ${fl.name}`,
          type: 'point',
          position: { x: fl.center3D.x, y: fl.heightM - 0.25, z: fl.center3D.z },
          colorHex: idx % 2 === 0 ? '#fff7ed' : '#fefce8',
          colorTempK: 3000,
          intensity: 1.0,
          distanceM: 8.0,
          castShadow: true,
        })),
      },
      postProcessing: {
        exposure: 0.0,
        contrast: 1.05,
        brightness: 0.0,
        saturation: 1.0,
        temperature: 0,
        vignette: 0.12,
        ambientOcclusion: true,
      },
      activeVariantId: defaultVariantA.id,
      designVariants: [defaultVariantA, defaultVariantB],
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Calcula la posición y enfoque óptimos de cámara para una habitación
   */
  public static createRoomFocusCamera(
    polygonVertices3D: Vector3D[],
    roomHeightM = 2.50,
    eyeHeightM = 1.50
  ): CameraSetting3D {
    if (!polygonVertices3D || polygonVertices3D.length < 3) {
      return {
        position: { x: 3, y: eyeHeightM, z: 3 },
        target: { x: 0, y: eyeHeightM * 0.7, z: 0 },
        fov: 50,
        heightM: eyeHeightM,
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    let cx = 0;
    let cz = 0;

    polygonVertices3D.forEach((v) => {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minZ = Math.min(minZ, v.z);
      maxZ = Math.max(maxZ, v.z);
      cx += v.x;
      cz += v.z;
    });

    cx /= polygonVertices3D.length;
    cz /= polygonVertices3D.length;

    const width = maxX - minX;
    const length = maxZ - minZ;
    const diag = Math.hypot(width, length);

    // Posicionar la cámara en una esquina de la estancia orientada hacia el centro
    const camX = minX + 0.35;
    const camZ = minZ + 0.35;
    const camY = Math.min(roomHeightM - 0.2, Math.max(0.8, eyeHeightM));

    return {
      position: { x: camX, y: camY, z: camZ },
      target: { x: cx, y: eyeHeightM * 0.7, z: cz },
      fov: Math.min(65, Math.max(45, 55 + diag * 2)),
      heightM: eyeHeightM,
      focalLengthMm: 35,
    };
  }

  /**
   * Cámara de vista general para toda la vivienda
   */
  private static createOverviewCamera(bounds: { widthM: number; lengthM: number }): CameraSetting3D {
    const maxDim = Math.max(bounds.widthM, bounds.lengthM, 6);
    return {
      position: { x: maxDim * 0.85, y: maxDim * 1.0, z: maxDim * 0.85 },
      target: { x: 0, y: 0.8, z: 0 },
      fov: 45,
      heightM: maxDim * 1.0,
      focalLengthMm: 50,
    };
  }

  /**
   * Calcula la posición y azimut del sol según la hora del día
   */
  public static calculateSunPosition(timeOfDay: TimeOfDay, orientationDeg = 0): {
    elevationDeg: number;
    azimuthDeg: number;
    intensity: number;
    colorHex: string;
  } {
    switch (timeOfDay) {
      case '08:00':
        return {
          elevationDeg: 22,
          azimuthDeg: (75 + orientationDeg) % 360,
          intensity: 0.95,
          colorHex: '#ffeed6', // Luz matutina suave y dorada
        };
      case '12:00':
        return {
          elevationDeg: 72,
          azimuthDeg: (180 + orientationDeg) % 360,
          intensity: 1.3,
          colorHex: '#ffffff', // Luz cenital clara
        };
      case '16:00':
        return {
          elevationDeg: 38,
          azimuthDeg: (235 + orientationDeg) % 360,
          intensity: 1.15,
          colorHex: '#fff7ed', // Tarde cálida
        };
      case '20:00':
        return {
          elevationDeg: 8,
          azimuthDeg: (290 + orientationDeg) % 360,
          intensity: 0.75,
          colorHex: '#fdba74', // Atardecer anaranjado
        };
      case '23:00':
      default:
        return {
          elevationDeg: -25,
          azimuthDeg: (0 + orientationDeg) % 360,
          intensity: 0.15,
          colorHex: '#93c5fd', // Luz nocturna azulada
        };
    }
  }

  /**
   * Convierte temperatura de color en Kelvin a Color Hexadecimal
   */
  public static colorTempToHex(kelvin: ColorTemperatureK): string {
    switch (kelvin) {
      case 2700:
        return '#ffc988'; // Muy cálida (Incandescente)
      case 3000:
        return '#ffdcb0'; // Cálida acogedora
      case 3500:
        return '#ffeed6'; // Blanco suave
      case 4000:
        return '#ffffff'; // Blanco neutro (Luz natural estándar)
      case 5000:
        return '#f0f5ff'; // Luz de día pura
      case 6500:
        return '#d6e6ff'; // Blanco frío
      default:
        return '#ffffff';
    }
  }

  /**
   * Aplica un Preset de Estilo Arquitectónico sobre una escena existente
   */
  public static applyStylePreset(scene: SceneDefinition, presetId: DesignStylePreset): SceneDefinition {
    const preset = STYLE_PRESETS.find((p) => p.id === presetId) || STYLE_PRESETS[0];

    const updatedVariants = scene.designVariants.map((v) => {
      if (v.id === scene.activeVariantId) {
        return {
          ...v,
          materialOverrides: {
            ...v.materialOverrides,
            all_walls: preset.palette.wallColor,
            all_floors: preset.palette.floorColor,
            all_ceilings: preset.palette.ceilingColor,
            all_furniture: preset.palette.furnitureColor,
          },
        };
      }
      return v;
    });

    const sunPos = this.calculateSunPosition(preset.lightingDefaults.timeOfDay);

    return {
      ...scene,
      lighting: {
        ...scene.lighting,
        mode: preset.lightingDefaults.mode,
        timeOfDay: preset.lightingDefaults.timeOfDay,
        sunIntensity: preset.lightingDefaults.sunIntensity,
        sunElevationDeg: sunPos.elevationDeg,
        sunAzimuthDeg: sunPos.azimuthDeg,
      },
      designVariants: updatedVariants,
      updatedAt: new Date().toISOString(),
    };
  }
}
