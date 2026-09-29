/**
 * HBD — HOME BOARD DESIGNER V5.0.0
 * Spatial Validation Engine ("¿CABE AQUÍ?")
 * 
 * Evaluates spatial feasibility, available room space, clearances,
 * and produces structured validation results with actionable diagnostics.
 */

import { Point2D, WallDto, RoomDto, DoorDto, WindowDto } from '../types/geometry.types.js';
import {
  SpatialValidationStatus,
  SpatialValidationResult,
  ClearanceRulesConfig,
  CollisionDetail,
} from '../types/furniture.types.js';
import { FurnitureEngine, OrientedBoundingBox2D } from './furniture.engine.js';
import { CollisionEngine } from './collision.engine.js';
import { GeometryEngine } from './geometry.engine.js';

export const DEFAULT_CLEARANCE_RULES: ClearanceRulesConfig = {
  minPassageWidthM: 0.70, // 70 cm minimum comfortable passage
  minWallMarginM: 0.05,    // 5 cm minimum wall clearance
  minDoorClearanceM: 0.80, // 80 cm door swing radius
  minFurnitureGapM: 0.15,  // 15 cm between distinct furniture pieces
};

export class SpatialValidationEngine {
  /**
   * Evaluates if a furniture piece fits at the specified coordinates on a floor plan: "¿CABE AQUÍ?".
   */
  static validatePlacement(params: {
    furnitureId: string;
    furnitureName?: string;
    posX: number;
    posY: number;
    widthM: number;
    depthM: number;
    heightM: number;
    rotationDeg: number;
    scaleFactor?: number;
    room?: { id: string; name: string; polygon: Point2D[]; areaM2?: number } | null;
    walls?: Array<{ id: string; startX: number; startY: number; endX: number; endY: number; thicknessM?: number }>;
    otherPlacements?: Array<{ id: string; name?: string; posX: number; posY: number; widthM: number; depthM: number; rotationDeg: number }>;
    doors?: Array<{ id: string; posX: number; posY: number; widthM?: number }>;
    windows?: Array<{ id: string; posX: number; posY: number; widthM?: number }>;
    rules?: Partial<ClearanceRulesConfig>;
  }): SpatialValidationResult {
    const scaleFactor = params.scaleFactor || 100;
    const rules = { ...DEFAULT_CLEARANCE_RULES, ...params.rules };

    const widthPx = params.widthM * scaleFactor;
    const depthPx = params.depthM * scaleFactor;

    // 1. Calculate OBB
    const obb = FurnitureEngine.computeOrientedBoundingBox(
      { x: params.posX, y: params.posY },
      widthPx,
      depthPx,
      params.rotationDeg || 0
    );

    const collisions: CollisionDetail[] = [];
    const clearanceWarnings: string[] = [];
    const messages: string[] = [];

    // 2. Check Room Containment
    if (params.room?.polygon && params.room.polygon.length >= 3) {
      const containment = CollisionEngine.checkRoomContainment(obb, params.room.polygon);
      if (!containment.isFullyInside) {
        collisions.push({
          type: 'OUTSIDE_ROOM',
          entityId: params.room.id,
          entityName: params.room.name,
          message: `El mueble sobrepasa los límites de la estancia (${params.room.name})`,
        });
      }
    }

    // 3. Check Wall Collisions
    if (params.walls && params.walls.length > 0) {
      const wallCollisions = CollisionEngine.checkWallCollisions(obb, params.walls, scaleFactor);
      collisions.push(...wallCollisions);
    }

    // 4. Check Other Placed Furniture Collisions
    if (params.otherPlacements && params.otherPlacements.length > 0) {
      const furnCollisions = CollisionEngine.checkFurnitureCollisions(
        params.furnitureId,
        obb,
        params.otherPlacements,
        scaleFactor
      );
      collisions.push(...furnCollisions);
    }

    // 5. Check Door Swing Zone Clearances
    const blockedDoors = params.doors
      ? CollisionEngine.checkDoorSwingClearance(obb, params.doors, scaleFactor)
      : [];

    // 6. Check Window Access Clearances
    const blockedWindows = params.windows
      ? CollisionEngine.checkWindowClearance(obb, params.windows, scaleFactor)
      : [];

    // 7. Calculate Clearance Margins to Room Bounds
    const margins = CollisionEngine.calculateClearanceMargins(
      obb,
      params.room?.polygon || [],
      scaleFactor
    );

    // Check passage width warnings (e.g. passage < 70cm)
    const minPassageCm = Math.round(rules.minPassageWidthM * 100);
    if (margins.leftCm > 0 && margins.leftCm < minPassageCm) {
      clearanceWarnings.push(`Paso lateral izquierdo reducido (${margins.leftCm} cm < ${minPassageCm} cm recomendado)`);
    }
    if (margins.rightCm > 0 && margins.rightCm < minPassageCm) {
      clearanceWarnings.push(`Paso lateral derecho reducido (${margins.rightCm} cm < ${minPassageCm} cm recomendado)`);
    }
    if (margins.bottomCm > 0 && margins.bottomCm < minPassageCm) {
      clearanceWarnings.push(`Paso frontal reducido (${margins.bottomCm} cm < ${minPassageCm} cm recomendado)`);
    }

    // 8. Determine Final Status
    let status = SpatialValidationStatus.VALID;

    if (collisions.length > 0) {
      status = SpatialValidationStatus.INVALID;
      messages.push(`✕ No cabe: Se detectaron ${collisions.length} colisiones activas.`);
    } else if (blockedDoors.length > 0) {
      status = SpatialValidationStatus.INVALID;
      messages.push('✕ No válido: El mueble bloquea el abatimiento de una puerta.');
    } else if (blockedWindows.length > 0 || clearanceWarnings.length > 0) {
      status = SpatialValidationStatus.WARNING;
      messages.push('⚠ Revisar: El mueble cabe físicamente pero el espacio de circulación es reducido.');
    } else {
      status = SpatialValidationStatus.VALID;
      messages.push('✓ Compatible: El mueble cabe perfectamente con holgura de paso adecuada.');
    }

    // Estimate available space dimensions
    let availableSpaceCm;
    if (params.room?.polygon && params.room.polygon.length >= 3) {
      const xs = params.room.polygon.map((p) => p.x);
      const ys = params.room.polygon.map((p) => p.y);
      const wM = GeometryEngine.pixelsToMeters(Math.max(...xs) - Math.min(...xs), scaleFactor);
      const dM = GeometryEngine.pixelsToMeters(Math.max(...ys) - Math.min(...ys), scaleFactor);
      availableSpaceCm = {
        width: Math.round(wM * 100),
        depth: Math.round(dM * 100),
      };
    }

    return {
      status,
      isCompatible: status === SpatialValidationStatus.VALID || status === SpatialValidationStatus.WARNING,
      dimensionsCm: {
        width: Math.round(params.widthM * 100),
        depth: Math.round(params.depthM * 100),
        height: Math.round(params.heightM * 100),
      },
      availableSpaceCm,
      margins,
      collisions,
      blockedDoors,
      blockedWindows,
      clearanceWarnings,
      messages,
    };
  }
}
