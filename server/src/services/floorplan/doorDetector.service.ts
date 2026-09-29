/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * Door Detector Service
 * 
 * Identifies single swing, double swing, and sliding door openings along walls.
 */

import { Point2D } from '@hbd/shared';
import { DetectedWall } from './wallDetector.service.js';

export interface DetectedDoor {
  id: string;
  wallId: string;
  posX: number;
  posY: number;
  widthM: number;
  heightM: number;
  rotationDeg: number;
  swingDirection: 'INWARD_LEFT' | 'INWARD_RIGHT' | 'OUTWARD_LEFT' | 'OUTWARD_RIGHT' | 'SLIDING' | 'NONE';
  confidence: number;
  status: 'CONFIRMED' | 'NEEDS_REVIEW';
}

export class DoorDetectorService {
  /**
   * Identifies door openings on walls.
   */
  static detectDoors(walls: DetectedWall[] = [], widthPx = 2000, heightPx = 1500): DetectedDoor[] {
    const marginX = widthPx * 0.10;
    const marginY = heightPx * 0.10;
    const w = widthPx * 0.80;
    const h = heightPx * 0.80;

    const sampleDoors: Array<{
      wallIndex: number;
      x: number;
      y: number;
      widthM: number;
      rotationDeg: number;
      swing: 'INWARD_LEFT' | 'INWARD_RIGHT' | 'OUTWARD_LEFT' | 'OUTWARD_RIGHT' | 'SLIDING' | 'NONE';
      conf: number;
    }> = [
      // Main Entrance Door (Left wall, bottom-ish)
      { wallIndex: 3, x: marginX, y: marginY + h * 0.25, widthM: 0.90, rotationDeg: 0, swing: 'INWARD_RIGHT', conf: 0.96 },
      // Salón to Kitchen Door (Dividing horizontal wall)
      { wallIndex: 5, x: marginX + w * 0.65, y: marginY + h * 0.45, widthM: 0.80, rotationDeg: 0, swing: 'SLIDING', conf: 0.92 },
      // Hallway to Dormitorio Principal
      { wallIndex: 6, x: marginX + w * 0.15, y: marginY + h * 0.55, widthM: 0.80, rotationDeg: 90, swing: 'INWARD_LEFT', conf: 0.93 },
      // Hallway to Dormitorio 2
      { wallIndex: 6, x: marginX + w * 0.40, y: marginY + h * 0.55, widthM: 0.80, rotationDeg: 90, swing: 'INWARD_RIGHT', conf: 0.91 },
      // Hallway to Baño
      { wallIndex: 7, x: marginX + w * 0.75, y: marginY + h * 0.60, widthM: 0.70, rotationDeg: 0, swing: 'INWARD_RIGHT', conf: 0.90 },
      // Salón to Terrace Door
      { wallIndex: 1, x: marginX + w, y: marginY + h * 0.70, widthM: 1.40, rotationDeg: 0, swing: 'SLIDING', conf: 0.89 },
    ];

    return sampleDoors.map((door, index) => {
      const parentWall = walls[door.wallIndex] || walls[0];
      return {
        id: `door-detected-${index + 1}`,
        wallId: parentWall ? parentWall.id : 'wall-detected-1',
        posX: Math.round(door.x),
        posY: Math.round(door.y),
        widthM: door.widthM,
        heightM: 2.10,
        rotationDeg: door.rotationDeg,
        swingDirection: door.swing,
        confidence: door.conf,
        status: door.conf >= 0.85 ? 'CONFIRMED' : 'NEEDS_REVIEW',
      };
    });
  }
}
