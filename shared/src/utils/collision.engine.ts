/**
 * HBD — HOME BOARD DESIGNER V5.0.0
 * Collision Engine
 * 
 * Pure mathematical collision detection decoupled from UI:
 * - Separating Axis Theorem (SAT) for rotated polygon/furniture collisions
 * - Segment-polygon intersections for furniture vs wall collisions
 * - Room boundary containment verification
 * - Door swing and window clearance zone intersections
 * - Exact distance calculations to nearest surrounding walls
 */

import { Point2D, WallDto, RoomDto, DoorDto, WindowDto } from '../types/geometry.types.js';
import { CollisionDetail, ClearanceMargins } from '../types/furniture.types.js';
import { GeometryEngine } from './geometry.engine.js';
import { FurnitureEngine, OrientedBoundingBox2D } from './furniture.engine.js';

export class CollisionEngine {
  /**
   * Tests for polygon overlap using the Separating Axis Theorem (SAT).
   * Returns true if polyA and polyB intersect.
   */
  static testPolygonOverlap(polyA: Point2D[], polyB: Point2D[]): boolean {
    const polygons = [polyA, polyB];

    for (let p = 0; p < polygons.length; p++) {
      const polygon = polygons[p];
      const n = polygon.length;

      for (let i1 = 0; i1 < n; i1++) {
        const i2 = (i1 + 1) % n;
        const p1 = polygon[i1];
        const p2 = polygon[i2];

        // Normal perpendicular vector to the edge
        const normal = {
          x: -(p2.y - p1.y),
          y: p2.x - p1.x,
        };

        // Project both polygons onto the normal
        let [minA, maxA] = this.projectPolygon(polyA, normal);
        let [minB, maxB] = this.projectPolygon(polyB, normal);

        // If projections do not overlap, a separating axis exists => no collision
        if (maxA < minB || maxB < minA) {
          return false;
        }
      }
    }

    return true; // Overlap on all axes => collision
  }

  private static projectPolygon(poly: Point2D[], axis: Point2D): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const p of poly) {
      const dot = p.x * axis.x + p.y * axis.y;
      if (dot < min) min = dot;
      if (dot > max) max = dot;
    }

    return [min, max];
  }

  /**
   * Checks collision between a furniture OBB and walls on the floor.
   */
  static checkWallCollisions(
    obb: OrientedBoundingBox2D,
    walls: Array<{ id: string; startX: number; startY: number; endX: number; endY: number; thicknessM?: number }>,
    scaleFactor = 100
  ): CollisionDetail[] {
    const collisions: CollisionDetail[] = [];
    const furnitureEdges = [
      [obb.vertices[0], obb.vertices[1]],
      [obb.vertices[1], obb.vertices[2]],
      [obb.vertices[2], obb.vertices[3]],
      [obb.vertices[3], obb.vertices[0]],
    ];

    for (const wall of walls) {
      const p1 = { x: wall.startX, y: wall.startY };
      const p2 = { x: wall.endX, y: wall.endY };

      let hasInter = false;
      for (const edge of furnitureEdges) {
        const inter = GeometryEngine.checkIntersection(edge[0], edge[1], p1, p2);
        if (inter.intersects) {
          hasInter = true;
          break;
        }
      }

      if (hasInter) {
        // Estimate penetration distance
        const distToWallM = this.distancePointToSegment(obb.center, p1, p2, scaleFactor);
        const halfSizeM = (obb.width + obb.depth) / 4 / (scaleFactor || 100);
        const penetrationM = Math.max(0.05, halfSizeM - distToWallM);
        const penetrationCm = Math.round(penetrationM * 100);

        collisions.push({
          type: 'WALL',
          entityId: wall.id,
          penetrationCm,
          message: `El mueble invade una pared (${penetrationCm} cm)`,
        });
      }
    }

    return collisions;
  }

  /**
   * Checks collisions between this furniture piece and other placed furniture items.
   */
  static checkFurnitureCollisions(
    currentId: string,
    currentObb: OrientedBoundingBox2D,
    otherPlacements: Array<{ id: string; name?: string; posX: number; posY: number; widthM: number; depthM: number; rotationDeg: number }>,
    scaleFactor = 100
  ): CollisionDetail[] {
    const collisions: CollisionDetail[] = [];

    for (const other of otherPlacements) {
      if (other.id === currentId) continue;

      const otherWidthPx = other.widthM * (scaleFactor || 100);
      const otherDepthPx = other.depthM * (scaleFactor || 100);
      const otherObb = FurnitureEngine.computeOrientedBoundingBox(
        { x: other.posX, y: other.posY },
        otherWidthPx,
        otherDepthPx,
        other.rotationDeg || 0
      );

      if (this.testPolygonOverlap(currentObb.vertices, otherObb.vertices)) {
        const centerDistM = GeometryEngine.calculateDistance(currentObb.center, otherObb.center, scaleFactor);
        const expectedMinDistM = (currentObb.width + otherObb.width) / 2 / (scaleFactor || 100);
        const overlapCm = Math.max(5, Math.round((expectedMinDistM - centerDistM) * 100));

        collisions.push({
          type: 'FURNITURE',
          entityId: other.id,
          entityName: other.name || 'Mueble',
          penetrationCm: overlapCm,
          message: `Superposición con ${other.name || 'otro mueble'} (${overlapCm} cm)`,
        });
      }
    }

    return collisions;
  }

  /**
   * Checks if furniture is completely contained inside its target room polygon.
   */
  static checkRoomContainment(
    obb: OrientedBoundingBox2D,
    roomPolygon: Point2D[]
  ): { isFullyInside: boolean; outsideCornersCount: number } {
    if (!roomPolygon || roomPolygon.length < 3) {
      return { isFullyInside: true, outsideCornersCount: 0 };
    }

    let outsideCount = 0;
    for (const vertex of obb.vertices) {
      if (!GeometryEngine.isPointInsidePolygon(vertex, roomPolygon)) {
        outsideCount++;
      }
    }

    return {
      isFullyInside: outsideCount === 0,
      outsideCornersCount: outsideCount,
    };
  }

  /**
   * Checks if furniture obstructs a door's opening swing area.
   */
  static checkDoorSwingClearance(
    obb: OrientedBoundingBox2D,
    doors: Array<{ id: string; posX: number; posY: number; widthM?: number }>,
    scaleFactor = 100
  ): Array<{ doorId: string; message: string }> {
    const blocked: Array<{ doorId: string; message: string }> = [];

    for (const door of doors) {
      const doorRadiusPx = (door.widthM || 0.80) * (scaleFactor || 100);
      const distToCenter = GeometryEngine.calculateDistance(obb.center, { x: door.posX, y: door.posY });

      // If distance from furniture center to door hinge is within radius + half dimension
      const halfDiagonal = Math.sqrt(Math.pow(obb.width / 2, 2) + Math.pow(obb.depth / 2, 2));
      if (distToCenter < doorRadiusPx + halfDiagonal * 0.7) {
        blocked.push({
          doorId: door.id,
          message: `Bloqueo de zona de apertura de puerta (${Math.round((door.widthM || 0.8) * 100)} cm)`,
        });
      }
    }

    return blocked;
  }

  /**
   * Checks if furniture obstructs a window access.
   */
  static checkWindowClearance(
    obb: OrientedBoundingBox2D,
    windows: Array<{ id: string; posX: number; posY: number; widthM?: number }>,
    scaleFactor = 100
  ): Array<{ windowId: string; message: string }> {
    const blocked: Array<{ windowId: string; message: string }> = [];

    for (const win of windows) {
      const winClearancePx = ((win.widthM || 1.20) / 2 + 0.30) * (scaleFactor || 100);
      const dist = GeometryEngine.calculateDistance(obb.center, { x: win.posX, y: win.posY });

      if (dist < winClearancePx) {
        blocked.push({
          windowId: win.id,
          message: 'Mueble ubicado frente al área de acceso de una ventana',
        });
      }
    }

    return blocked;
  }

  /**
   * Calculates perpendicular distances in cm from furniture edges to surrounding walls/room bounds.
   */
  static calculateClearanceMargins(
    obb: OrientedBoundingBox2D,
    roomPolygon: Point2D[],
    scaleFactor = 100
  ): ClearanceMargins {
    if (!roomPolygon || roomPolygon.length < 3) {
      return { leftCm: 50, rightCm: 50, topCm: 50, bottomCm: 50 };
    }

    const xs = roomPolygon.map((p) => p.x);
    const ys = roomPolygon.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const ppm = scaleFactor || 100;
    const leftCm = Math.max(0, Math.round(((obb.minX - minX) / ppm) * 100));
    const rightCm = Math.max(0, Math.round(((maxX - obb.maxX) / ppm) * 100));
    const topCm = Math.max(0, Math.round(((obb.minY - minY) / ppm) * 100));
    const bottomCm = Math.max(0, Math.round(((maxY - obb.maxY) / ppm) * 100));

    return {
      leftCm,
      rightCm,
      topCm,
      bottomCm,
    };
  }

  private static distancePointToSegment(p: Point2D, p1: Point2D, p2: Point2D, scaleFactor = 100): number {
    const l2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
    if (l2 === 0) return GeometryEngine.calculateDistance(p, p1, scaleFactor);
    let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
    return GeometryEngine.calculateDistance(p, proj, scaleFactor);
  }
}
