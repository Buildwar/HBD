/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * AIDesignEngine — Orquestador de IA de Diseño, Validación Geométrica y Variantes
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  DesignContext,
  DesignPreferences,
  AIDesignProposal,
  RoomContextData,
} from '../types/aiDesign.types.js';
import {
  FurniturePlacementDto,
  SpatialValidationResult,
  SpatialValidationStatus,
  DimensionSource,
} from '../types/furniture.types.js';
import { DesignVariant } from '../types/render.types.js';
import { SpatialValidationEngine } from './spatialValidation.engine.js';
import { GeometryEngine } from './geometry.engine.js';

export const DEFAULT_DESIGN_PREFERENCES: DesignPreferences = {
  style: 'modern',
  atmosphere: 'warm',
  colorPalette: 'neutral',
  goal: 'more_space',
  budgetLevel: 'MEDIUM',
  numberOfProposals: 2,
  preserveExistingFurniture: false,
};

export class AIDesignEngine {
  /**
   * Construye un contexto de diseño estructurado a partir del estado de la planta
   */
  static buildDesignContext(params: {
    project: { id: string; name: string; propertyType?: string };
    floor: {
      id: string;
      name: string;
      level: number;
      walls?: any[];
      rooms?: any[];
      doors?: any[];
      windows?: any[];
      measurements?: any[];
      furniturePlacements?: any[];
    };
    scaleFactor?: number;
    targetRoomId?: string;
    furnitureCatalog?: any[];
    userPreferences?: Partial<DesignPreferences>;
    existingVariants?: DesignVariant[];
  }): DesignContext {
    const scaleFactor = params.scaleFactor || 100;
    const floor = params.floor;

    const rooms: RoomContextData[] = (floor.rooms || []).map((r) => {
      const roomPolygon = Array.isArray(r.polygon) ? r.polygon : [];
      const roomWalls = floor.walls || [];
      const roomDoors = floor.doors || [];
      const roomWindows = floor.windows || [];
      const roomFurniture = (floor.furniturePlacements || []).filter((fp: any) => {
        return GeometryEngine.isPointInsidePolygon({ x: fp.posX, y: fp.posY }, roomPolygon);
      });

      return {
        id: r.id,
        name: r.name,
        roomType: r.roomType,
        areaM2: r.areaM2 || 12.0,
        widthM: r.widthM,
        lengthM: r.lengthM,
        heightM: r.heightM || 2.5,
        color: r.color,
        polygon: roomPolygon,
        walls: roomWalls.map((w: any) => ({
          id: w.id,
          startX: w.startX,
          startY: w.startY,
          endX: w.endX,
          endY: w.endY,
          thicknessM: w.thicknessM || 0.15,
          heightM: w.heightM || 2.5,
          wallType: w.wallType || 'INTERIOR',
        })),
        doors: roomDoors.map((d: any) => ({
          id: d.id,
          wallId: d.wallId,
          posX: d.posX,
          posY: d.posY,
          widthM: d.widthM || 0.8,
          heightM: d.heightM || 2.1,
          rotationDeg: d.rotationDeg || 0,
          swingDirection: d.swingDirection || 'INWARD_RIGHT',
        })),
        windows: roomWindows.map((w: any) => ({
          id: w.id,
          wallId: w.wallId,
          posX: w.posX,
          posY: w.posY,
          widthM: w.widthM || 1.2,
          heightM: w.heightM || 1.2,
          elevationM: w.elevationM || 0.9,
          rotationDeg: w.rotationDeg || 0,
        })),
        currentFurniture: roomFurniture,
      };
    });

    return {
      projectId: params.project.id,
      projectName: params.project.name,
      propertyType: params.project.propertyType,
      floorId: floor.id,
      floorName: floor.name,
      floorLevel: floor.level,
      scaleFactor,
      rooms,
      targetRoomId: params.targetRoomId,
      furnitureCatalog: params.furnitureCatalog || [],
      userPreferences: {
        ...DEFAULT_DESIGN_PREFERENCES,
        ...params.userPreferences,
      },
      existingVariants: params.existingVariants || [],
    };
  }

  /**
   * Ejecuta la validación geométrica y espacial estricta de una propuesta de IA
   */
  static validateAIProposal(
    proposal: AIDesignProposal,
    context: DesignContext
  ): { isValid: boolean; validation: SpatialValidationResult; errors: string[] } {
    const errors: string[] = [];
    const scaleFactor = context.scaleFactor || 100;

    for (const change of proposal.furnitureChanges) {
      if (change.type === 'removed') continue;

      const targetRoom = context.rooms.find((r) =>
        GeometryEngine.isPointInsidePolygon({ x: change.newPosX, y: change.newPosY }, r.polygon)
      );

      const walls = targetRoom ? targetRoom.walls : context.rooms.flatMap((r) => r.walls);
      const doors = targetRoom ? targetRoom.doors : context.rooms.flatMap((r) => r.doors);

      const validation = SpatialValidationEngine.validatePlacement({
        furnitureId: change.furnitureId,
        furnitureName: change.furnitureName,
        posX: change.newPosX,
        posY: change.newPosY,
        widthM: change.dimensions.widthM,
        depthM: change.dimensions.depthM,
        heightM: change.dimensions.heightM,
        rotationDeg: change.newRotationDeg,
        scaleFactor,
        room: targetRoom ? { id: targetRoom.id, name: targetRoom.name, polygon: targetRoom.polygon } : null,
        walls,
        doors,
      });

      if (!validation.isCompatible) {
        errors.push(
          `Pieza "${change.furnitureName}" en (${change.newPosX}, ${change.newPosY}) presenta colisión o bloqueo.`
        );
      }
    }

    const isValid = errors.length === 0;
    const finalValidation: SpatialValidationResult = {
      isCompatible: isValid,
      status: isValid ? SpatialValidationStatus.VALID : SpatialValidationStatus.INVALID,
      dimensionsCm: { width: 0, depth: 0, height: 0 },
      margins: { leftCm: 70, rightCm: 70, topCm: 70, bottomCm: 70 },
      collisions: [],
      blockedDoors: [],
      blockedWindows: [],
      clearanceWarnings: isValid ? [] : errors,
      messages: isValid
        ? ['Propuesta de IA físicamente compatible con la geometría real.']
        : [`Propuesta de IA rechazada por inviabilidad geométrica: ${errors.join('; ')}`],
    };

    return {
      isValid,
      validation: finalValidation,
      errors,
    };
  }

  /**
   * Aplica las modificaciones de mobiliario de una propuesta sobre la lista actual de colocaciones
   */
  static applyProposalToPlacements(
    proposal: AIDesignProposal,
    currentPlacements: FurniturePlacementDto[],
    scaleFactor: number = 100
  ): FurniturePlacementDto[] {
    let result = [...currentPlacements];

    for (const change of proposal.furnitureChanges) {
      if (change.type === 'removed') {
        if (change.placementId) {
          result = result.filter((p) => p.id !== change.placementId);
        }
      } else if (change.type === 'moved' || change.type === 'adjusted') {
        result = result.map((p) => {
          if (p.id === change.placementId || p.furnitureId === change.furnitureId) {
            return {
              ...p,
              posX: change.newPosX,
              posY: change.newPosY,
              posZ: change.newPosZ || 0,
              rotationDeg: change.newRotationDeg,
              widthM: change.dimensions.widthM,
              depthM: change.dimensions.depthM,
              heightM: change.dimensions.heightM,
              validationStatus: SpatialValidationStatus.VALID,
            };
          }
          return p;
        });
      } else if (change.type === 'added') {
        const newPlacement: FurniturePlacementDto = {
          id: change.placementId || `placed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          floorId: '',
          furnitureId: change.furnitureId,
          furniture: {
            id: change.furnitureId,
            name: change.furnitureName,
            categoryId: change.categorySlug,
            defaultWidthM: change.dimensions.widthM,
            defaultDepthM: change.dimensions.depthM,
            defaultHeightM: change.dimensions.heightM,
            isCustom: false,
            dimensionSource: DimensionSource.ESTIMATED,
            createdAt: new Date().toISOString(),
          },
          posX: change.newPosX,
          posY: change.newPosY,
          posZ: change.newPosZ || 0,
          rotationDeg: change.newRotationDeg,
          scale: 1,
          widthM: change.dimensions.widthM,
          depthM: change.dimensions.depthM,
          heightM: change.dimensions.heightM,
          validationStatus: SpatialValidationStatus.VALID,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        result.push(newPlacement);
      }
    }

    return result;
  }

  /**
   * Convierte una propuesta de IA en una variante de diseño (DesignVariant) compatible con el sistema de Render V7
   */
  static convertProposalToDesignVariant(
    proposal: AIDesignProposal,
    existingVariantsCount: number = 0
  ): DesignVariant {
    return {
      id: proposal.variantId || `var-ai-${Date.now()}`,
      name: proposal.name || `Variante IA ${String.fromCharCode(65 + existingVariantsCount)}`,
      description: proposal.summary,
      isDefault: false,
      materialOverrides: proposal.materialOverrides || {},
      furnitureOverrides: {
        proposalId: proposal.id,
        style: proposal.style,
        atmosphere: proposal.atmosphere,
        furnitureChanges: proposal.furnitureChanges,
        lighting: proposal.lightingOverrides,
      },
      createdAt: new Date().toISOString(),
    };
  }
}
