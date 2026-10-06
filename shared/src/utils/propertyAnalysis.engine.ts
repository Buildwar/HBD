/**
 * Property Spatial & Distribution Analysis Engine (Phase V23 / v1.23.0)
 * Analyzes room distributions, circulation ratios, room adjacencies, and spatial metrics.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  PropertyAdjacencyItem,
  PropertySpatialSummary,
  ConfidenceLevel,
} from '../types/propertyIntelligence.types';

export class PropertyAnalysisEngine {
  /**
   * Generates a spatial summary from room and floor definitions.
   */
  static analyzeSpatialProfile(
    rooms: Array<{
      id: string;
      name: string;
      type: string;
      widthM?: number;
      lengthM?: number;
      areaM2?: number;
      perimeterM?: number;
    }>,
    floorsCount = 1,
    plotSurfaceM2?: number
  ): PropertySpatialSummary {
    let totalBuiltSurface = 0;
    let totalUsableSurface = 0;
    let circulationSurface = 0;
    let storageSurface = 0;
    let bathroomsCount = 0;
    let bedroomsCount = 0;

    const spacesBreakdown = rooms.map((room) => {
      const area = room.areaM2 || (room.widthM && room.lengthM ? room.widthM * room.lengthM : 12.0);
      const perimeter = room.perimeterM || (room.widthM && room.lengthM ? (room.widthM + room.lengthM) * 2 : 14.0);
      const lowerName = room.name.toLowerCase();
      const lowerType = (room.type || '').toLowerCase();

      totalUsableSurface += area;

      if (lowerName.includes('baño') || lowerType.includes('bath') || lowerName.includes('aseo')) {
        bathroomsCount++;
      } else if (lowerName.includes('dormitorio') || lowerType.includes('bed') || lowerName.includes('habitación')) {
        bedroomsCount++;
      } else if (lowerName.includes('pasillo') || lowerName.includes('distribuidor') || lowerName.includes('hall') || lowerType.includes('corridor')) {
        circulationSurface += area;
      } else if (lowerName.includes('trastero') || lowerName.includes('armario') || lowerName.includes('despensa') || lowerType.includes('storage')) {
        storageSurface += area;
      }

      return {
        id: room.id,
        name: room.name,
        type: room.type || 'ROOM',
        areaM2: Number(area.toFixed(2)),
        perimeterM: Number(perimeter.toFixed(2)),
        confidence: 'CALCULATED' as ConfidenceLevel,
      };
    });

    // Built surface typically 10-15% higher than usable surface due to partition walls
    totalBuiltSurface = totalUsableSurface > 0 ? Number((totalUsableSurface * 1.15).toFixed(2)) : 0;
    const circulationRatio = totalUsableSurface > 0 ? Number((circulationSurface / totalUsableSurface).toFixed(3)) : 0;

    // Build room adjacencies
    const adjacencies = this.computeAdjacencies(spacesBreakdown);

    return {
      totalBuiltSurfaceM2: totalBuiltSurface,
      totalUsableSurfaceM2: Number(totalUsableSurface.toFixed(2)),
      plotSurfaceM2,
      roomsCount: rooms.length,
      bathroomsCount,
      bedroomsCount,
      floorsCount,
      circulationSurfaceM2: Number(circulationSurface.toFixed(2)),
      circulationRatio,
      storageSurfaceM2: Number(storageSurface.toFixed(2)),
      spacesBreakdown,
      adjacencies,
    };
  }

  /**
   * Computes adjacent functional relationships between rooms.
   */
  static computeAdjacencies(
    rooms: Array<{ id: string; name: string; type: string; areaM2: number }>
  ): PropertyAdjacencyItem[] {
    const adjacencies: PropertyAdjacencyItem[] = [];

    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const rA = rooms[i];
        const rB = rooms[j];
        const nameA = rA.name.toLowerCase();
        const nameB = rB.name.toLowerCase();

        let relationshipType: PropertyAdjacencyItem['adjacencyType'] = 'SHARED_WALL';
        let quality: PropertyAdjacencyItem['quality'] = 'ACCEPTABLE';

        if ((nameA.includes('cocina') && nameB.includes('salón')) || (nameA.includes('salón') && nameB.includes('cocina'))) {
          relationshipType = 'DIRECT_DOOR';
          quality = 'OPTIMAL';
        } else if ((nameA.includes('dormitorio') && nameB.includes('baño')) || (nameA.includes('baño') && nameB.includes('dormitorio'))) {
          relationshipType = 'CORRIDOR_LINK';
          quality = 'OPTIMAL';
        } else if (nameA.includes('pasillo') || nameB.includes('pasillo')) {
          relationshipType = 'OPEN_PASSAGE';
          quality = 'OPTIMAL';
        }

        adjacencies.push({
          fromRoomId: rA.id,
          fromRoomName: rA.name,
          toRoomId: rB.id,
          toRoomName: rB.name,
          adjacencyType: relationshipType,
          quality,
        });
      }
    }

    return adjacencies;
  }
}
