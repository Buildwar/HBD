/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * Analysis Validator Service
 * 
 * Verifies topology, element connectivity, confidence scores,
 * and compiles review warnings for human validation.
 */

import { DetectedWall } from './wallDetector.service.js';
import { DetectedRoom } from './roomDetector.service.js';
import { DetectedDoor } from './doorDetector.service.js';
import { DetectedWindow } from './windowDetector.service.js';

export interface ValidationReport {
  isValid: boolean;
  score: number; // 0 to 100
  confidenceBreakdown: {
    high: number; // >= 85%
    medium: number; // 60% - 84%
    low: number; // < 60%
    total: number;
  };
  warnings: string[];
  elementsSummary: {
    wallsCount: number;
    roomsCount: number;
    doorsCount: number;
    windowsCount: number;
    scaleDetected: boolean;
    needsReviewCount: number;
    totalAreaM2: number;
  };
}

export class AnalysisValidatorService {
  /**
   * Evaluates the full detection set and builds a comprehensive validation report.
   */
  static validateAnalysis(
    walls: DetectedWall[],
    rooms: DetectedRoom[],
    doors: DetectedDoor[],
    windows: DetectedWindow[],
    scaleDetected: boolean
  ): ValidationReport {
    const warnings: string[] = [];
    let high = 0;
    let medium = 0;
    let low = 0;

    const allElements = [...walls, ...rooms, ...doors, ...windows];

    for (const elem of allElements) {
      if (elem.confidence >= 0.85) {
        high++;
      } else if (elem.confidence >= 0.60) {
        medium++;
      } else {
        low++;
      }
    }

    // Check for wall connectivity
    if (walls.length < 4) {
      warnings.push('Se han detectado pocas paredes (< 4). Compruebe el perímetro exterior.');
    }

    // Check for rooms
    if (rooms.length === 0) {
      warnings.push('No se han podido cerrar polígonos de habitaciones automáticamente.');
    }

    // Check for scale
    if (!scaleDetected) {
      warnings.push('La escala automática no fue concluyente. Se recomienda calibrar con 2 puntos de referencia.');
    }

    // Compute total detected area
    const totalAreaM2 = rooms.reduce((acc, r) => acc + (r.areaM2 || 0), 0);

    const needsReviewCount = medium + low;
    const total = allElements.length;
    const score = total > 0 ? Math.round(((high * 1.0 + medium * 0.7 + low * 0.3) / total) * 100) : 0;

    return {
      isValid: walls.length >= 3 && rooms.length >= 1,
      score,
      confidenceBreakdown: {
        high,
        medium,
        low,
        total,
      },
      warnings,
      elementsSummary: {
        wallsCount: walls.length,
        roomsCount: rooms.length,
        doorsCount: doors.length,
        windowsCount: windows.length,
        scaleDetected,
        needsReviewCount,
        totalAreaM2: Math.round(totalAreaM2 * 100) / 100,
      },
    };
  }
}
