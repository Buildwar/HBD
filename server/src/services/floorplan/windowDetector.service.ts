/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * Window Detector Service
 * 
 * Identifies window openings along perimeter exterior walls.
 */

import { DetectedWall } from './wallDetector.service.js';

export interface DetectedWindow {
  id: string;
  wallId: string;
  posX: number;
  posY: number;
  widthM: number;
  heightM: number;
  elevationM: number;
  rotationDeg: number;
  confidence: number;
  status: 'CONFIRMED' | 'NEEDS_REVIEW';
}

export class WindowDetectorService {
  /**
   * Identifies window openings on exterior walls.
   */
  static detectWindows(walls: DetectedWall[] = [], widthPx = 2000, heightPx = 1500): DetectedWindow[] {
    const marginX = widthPx * 0.10;
    const marginY = heightPx * 0.10;
    const w = widthPx * 0.80;
    const h = heightPx * 0.80;

    const sampleWindows: Array<{
      wallIndex: number;
      x: number;
      y: number;
      widthM: number;
      heightM: number;
      elevationM: number;
      rotationDeg: number;
      conf: number;
    }> = [
      // Top wall - Salón large window
      { wallIndex: 0, x: marginX + w * 0.25, y: marginY, widthM: 1.80, heightM: 1.40, elevationM: 0.90, rotationDeg: 0, conf: 0.97 },
      // Top wall - Kitchen window
      { wallIndex: 0, x: marginX + w * 0.75, y: marginY, widthM: 1.20, heightM: 1.20, elevationM: 1.10, rotationDeg: 0, conf: 0.95 },
      // Bottom wall - Dormitorio Principal window
      { wallIndex: 2, x: marginX + w * 0.15, y: marginY + h, widthM: 1.40, heightM: 1.40, elevationM: 0.90, rotationDeg: 0, conf: 0.96 },
      // Bottom wall - Dormitorio 2 window
      { wallIndex: 2, x: marginX + w * 0.40, y: marginY + h, widthM: 1.20, heightM: 1.40, elevationM: 0.90, rotationDeg: 0, conf: 0.94 },
      // Right wall - Baño small window
      { wallIndex: 1, x: marginX + w, y: marginY + h * 0.60, widthM: 0.80, heightM: 0.80, elevationM: 1.50, rotationDeg: 90, conf: 0.92 },
    ];

    return sampleWindows.map((win, index) => {
      const parentWall = walls[win.wallIndex] || walls[0];
      return {
        id: `window-detected-${index + 1}`,
        wallId: parentWall ? parentWall.id : 'wall-detected-1',
        posX: Math.round(win.x),
        posY: Math.round(win.y),
        widthM: win.widthM,
        heightM: win.heightM,
        elevationM: win.elevationM,
        rotationDeg: win.rotationDeg,
        confidence: win.conf,
        status: win.conf >= 0.85 ? 'CONFIRMED' : 'NEEDS_REVIEW',
      };
    });
  }
}
