/**
 * HBD — HOME BOARD DESIGNER (V11.0.0)
 * Construction Comparison Engine (Comparador de Obra: Actual vs Propuesto)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  ConstructionComparisonResult,
  ConstructionComparisonMetric,
} from '../types/construction.types.js';
import { PRO_VALIDATION_NOTICE } from './constructionIntelligence.engine.js';

export interface RoomGeometryData {
  id: string;
  name: string;
  areaM2: number;
}

export interface WallGeometryData {
  id: string;
  lengthM?: number;
  wallType?: string;
  isDemolition?: boolean;
}

export interface FloorDataSummary {
  rooms: RoomGeometryData[];
  walls: WallGeometryData[];
  doorsCount: number;
  windowsCount: number;
  furnitureCount: number;
}

export class ConstructionComparisonEngine {
  /**
   * Compara el estado actual (EXISTING) contra el estado propuesto (PROPOSED) de forma cuantitativa y objetiva.
   */
  static compareStates(params: {
    projectId: string;
    existing: FloorDataSummary;
    proposed: FloorDataSummary;
    demolishedWallsCount?: number;
    newWallsCount?: number;
  }): ConstructionComparisonResult {
    const existingArea = params.existing.rooms.reduce((acc, r) => acc + (r.areaM2 || 0), 0);
    const proposedArea = params.proposed.rooms.reduce((acc, r) => acc + (r.areaM2 || 0), 0);

    const metrics: ConstructionComparisonMetric[] = [
      {
        category: 'Estancias / Habitaciones',
        existingValue: params.existing.rooms.length,
        proposedValue: params.proposed.rooms.length,
        difference: params.proposed.rooms.length - params.existing.rooms.length,
        unit: 'estancias',
        interpretation:
          params.proposed.rooms.length < params.existing.rooms.length
            ? 'Espacio más diáfano e integrado'
            : params.proposed.rooms.length > params.existing.rooms.length
            ? 'Mayor compartimentación de estancias'
            : 'Misma distribución cuantitativa de estancias',
      },
      {
        category: 'Superficie Útil de Habitaciones',
        existingValue: Number(existingArea.toFixed(1)),
        proposedValue: Number(proposedArea.toFixed(1)),
        difference: Number((proposedArea - existingArea).toFixed(1)),
        unit: 'm²',
        interpretation:
          proposedArea > existingArea
            ? 'Ganancia neta de superficie útil aprovechable'
            : 'Superficie útil optimizada con tabiquería',
      },
      {
        category: 'Paredes y Tabiquería',
        existingValue: params.existing.walls.length,
        proposedValue: params.proposed.walls.length,
        difference: params.proposed.walls.length - params.existing.walls.length,
        unit: 'muros',
      },
      {
        category: 'Puertas de Paso',
        existingValue: params.existing.doorsCount,
        proposedValue: params.proposed.doorsCount,
        difference: params.proposed.doorsCount - params.existing.doorsCount,
        unit: 'puertas',
      },
      {
        category: 'Huecos de Ventana',
        existingValue: params.existing.windowsCount,
        proposedValue: params.proposed.windowsCount,
        difference: params.proposed.windowsCount - params.existing.windowsCount,
        unit: 'ventanas',
      },
      {
        category: 'Elementos de Mobiliario',
        existingValue: params.existing.furnitureCount,
        proposedValue: params.proposed.furnitureCount,
        difference: params.proposed.furnitureCount - params.existing.furnitureCount,
        unit: 'piezas',
      },
    ];

    const wallsToDemolish = params.demolishedWallsCount ?? Math.max(0, params.existing.walls.length - params.proposed.walls.length);
    const newWalls = params.newWallsCount ?? Math.max(0, params.proposed.walls.length - params.existing.walls.length);

    const proNotes: string[] = [];
    if (wallsToDemolish > 0) {
      proNotes.push(
        `Se han proyectado ${wallsToDemolish} demoliciones de tabiquería. ${PRO_VALIDATION_NOTICE}`
      );
    }
    if (params.proposed.windowsCount !== params.existing.windowsCount) {
      proNotes.push(
        'La modificación de huecos de fachada/ventanas requiere autorización comunitaria y validación técnica.'
      );
    }

    return {
      projectId: params.projectId,
      existingSummary: {
        roomCount: params.existing.rooms.length,
        totalAreaM2: Number(existingArea.toFixed(1)),
        wallCount: params.existing.walls.length,
        doorCount: params.existing.doorsCount,
        windowCount: params.existing.windowsCount,
        furnitureCount: params.existing.furnitureCount,
      },
      proposedSummary: {
        roomCount: params.proposed.rooms.length,
        totalAreaM2: Number(proposedArea.toFixed(1)),
        wallCount: params.proposed.walls.length,
        doorCount: params.proposed.doorsCount,
        windowCount: params.proposed.windowsCount,
        furnitureCount: params.proposed.furnitureCount,
      },
      demolitions: {
        wallsToDemolishCount: wallsToDemolish,
        doorsToDemolishCount: Math.max(0, params.existing.doorsCount - params.proposed.doorsCount),
        windowsToDemolishCount: Math.max(0, params.existing.windowsCount - params.proposed.windowsCount),
        estimatedDemolitionAreaM2: Number((wallsToDemolish * 3.2).toFixed(1)), // Estimación de m2 de muro a demoler
        requiresProValidation: wallsToDemolish > 0,
      },
      newConstructions: {
        newWallsCount: newWalls,
        newDoorsCount: Math.max(0, params.proposed.doorsCount - params.existing.doorsCount),
        newWindowsCount: Math.max(0, params.proposed.windowsCount - params.existing.windowsCount),
        newFurnitureCount: Math.max(0, params.proposed.furnitureCount - params.existing.furnitureCount),
      },
      metrics,
      proValidationNotes: proNotes,
    };
  }
}
