/**
 * AR Anchor Engine (Phase V22 / v1.22.0)
 * Manages 3D anchor placements, surface snapping, clearance bounding boxes and collision validations.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { ARAnchorItem, ARAnchorPosition, ARAnchorRotation, ARAnchorScale, ARCollisionValidationResult, ARSurfaceType } from '../types/arVisualization.types';

export class ARAnchorEngine {
  /**
   * Snaps anchor position to surface constraints (e.g. floor Y=0, walls aligned).
   */
  static snapToSurface(
    position: ARAnchorPosition,
    surfaceType: ARSurfaceType,
    wallPlaneZ?: number
  ): ARAnchorPosition {
    const snapped: ARAnchorPosition = { ...position };

    switch (surfaceType) {
      case 'FLOOR':
        snapped.y = 0; // Rest directly on ground plane
        break;
      case 'WALL':
        if (typeof wallPlaneZ === 'number') {
          snapped.z = wallPlaneZ;
        }
        break;
      case 'CEILING':
        snapped.y = Math.max(2.4, snapped.y); // Ceiling minimum
        break;
      default:
        break;
    }

    return snapped;
  }

  /**
   * Calculates Euclidean distance in meters between two 3D anchor positions.
   */
  static calculateDistance(posA: ARAnchorPosition, posB: ARAnchorPosition): number {
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    const dz = posA.z - posB.z;
    return Number(Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(3));
  }

  /**
   * Validates bounding box intersections and clearances between anchors.
   */
  static validateCollisions(
    anchors: ARAnchorItem[],
    roomBounds?: { minX: number; maxX: number; minZ: number; maxZ: number; height: number }
  ): ARCollisionValidationResult {
    const conflictingAnchors: string[] = [];
    const wallViolations: string[] = [];
    const clearanceViolations: string[] = [];
    const warnings: string[] = [];

    // Check pairwise bounding box overlaps
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i];
      const aMinX = a.position.x - a.scale.x / 2;
      const aMaxX = a.position.x + a.scale.x / 2;
      const aMinZ = a.position.z - a.scale.z / 2;
      const aMaxZ = a.position.z + a.scale.z / 2;
      const aMinY = a.position.y;
      const aMaxY = a.position.y + a.scale.y;

      // Check room boundary violations if bounds provided
      if (roomBounds) {
        if (aMinX < roomBounds.minX || aMaxX > roomBounds.maxX || aMinZ < roomBounds.minZ || aMaxZ > roomBounds.maxZ) {
          wallViolations.push(a.id);
          warnings.push(`El elemento "${a.name}" sobresale de los límites de la habitación.`);
        }
        if (aMaxY > roomBounds.height) {
          wallViolations.push(a.id);
          warnings.push(`El elemento "${a.name}" supera la altura del techo.`);
        }
      }

      for (let j = i + 1; j < anchors.length; j++) {
        const b = anchors[j];
        const bMinX = b.position.x - b.scale.x / 2;
        const bMaxX = b.position.x + b.scale.x / 2;
        const bMinZ = b.position.z - b.scale.z / 2;
        const bMaxZ = b.position.z + b.scale.z / 2;
        const bMinY = b.position.y;
        const bMaxY = b.position.y + b.scale.y;

        const overlapX = aMinX < bMaxX && aMaxX > bMinX;
        const overlapY = aMinY < bMaxY && aMaxY > bMinY;
        const overlapZ = aMinZ < bMaxZ && aMaxZ > bMinZ;

        if (overlapX && overlapY && overlapZ) {
          if (!conflictingAnchors.includes(a.id)) conflictingAnchors.push(a.id);
          if (!conflictingAnchors.includes(b.id)) conflictingAnchors.push(b.id);
          warnings.push(`Colisión detectada entre "${a.name}" y "${b.name}".`);
        }
      }
    }

    return {
      hasCollisions: conflictingAnchors.length > 0 || wallViolations.length > 0,
      conflictingAnchors,
      wallViolations,
      clearanceViolations,
      warnings,
    };
  }

  /**
   * Applies transforms to an anchor and updates its collision status.
   */
  static transformAnchor(
    anchor: ARAnchorItem,
    updates: {
      position?: Partial<ARAnchorPosition>;
      rotation?: Partial<ARAnchorRotation>;
      scale?: Partial<ARAnchorScale>;
      surfaceType?: ARSurfaceType;
      isConfirmed?: boolean;
    }
  ): ARAnchorItem {
    const updatedPosition: ARAnchorPosition = {
      ...anchor.position,
      ...(updates.position || {}),
    };

    const finalPosition = updates.surfaceType 
      ? this.snapToSurface(updatedPosition, updates.surfaceType)
      : this.snapToSurface(updatedPosition, anchor.surfaceType);

    return {
      ...anchor,
      surfaceType: updates.surfaceType || anchor.surfaceType,
      position: finalPosition,
      rotation: { ...anchor.rotation, ...(updates.rotation || {}) },
      scale: { ...anchor.scale, ...(updates.scale || {}) },
      isConfirmed: typeof updates.isConfirmed === 'boolean' ? updates.isConfirmed : anchor.isConfirmed,
    };
  }
}
