/**
 * HBD — HOME BOARD DESIGNER (V10.0.0)
 * Geometric Intelligence Engine (geometricMetrics.engine.ts)
 * 
 * Centralized, pure mathematical surface and metric calculations:
 * - Gross area, usable area, built area
 * - Gross wall surface, net wall surface (deducting door and window openings)
 * - Openings area (doors, windows, passages)
 * - Ceiling area, volume
 * - Outer perimeter, usable perimeter and skirting board length
 * 
 * Strict Principle:
 * - Does not invent geometry.
 * - If geometry is missing or invalid (< 3 points), returns UNKNOWN and explicit warnings.
 * - Retains unit consistency (m, m², m³).
 * 
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Point2D, WallDto, DoorDto, WindowDto } from '../types/geometry.types.js';
import {
  DetailedGeometricMetricsDto,
  MetricValue,
  MeasurementConfidence,
  SpaceGeometricInput,
} from '../types/space.types.js';
import { GeometryEngine } from './geometry.engine.js';

export class GeometricMetricsEngine {
  /**
   * Helper to build a MetricValue object.
   */
  private static makeMetric<T>(
    value: T,
    unit: string,
    source: MeasurementConfidence = 'GEOMETRY_CALCULATED',
    confidencePercent = 100,
    notes: string | null = null
  ): MetricValue<T> {
    return {
      value,
      unit,
      source,
      confidencePercent,
      notes,
    };
  }

  /**
   * Calculates detailed geometric metrics for a single space or room.
   */
  static calculateSpaceMetrics(input: SpaceGeometricInput): DetailedGeometricMetricsDto {
    const warnings: string[] = [];
    const source: MeasurementConfidence = input.source || 'GEOMETRY_CALCULATED';
    const heightM = input.heightM && input.heightM > 0 ? input.heightM : 2.5;
    const wallThicknessM = input.wallThicknessM && input.wallThicknessM > 0 ? input.wallThicknessM : 0.15;
    const polygon = input.polygon || [];

    const isPolygonValid = polygon && polygon.length >= 3;

    if (!isPolygonValid) {
      warnings.push('Polígono inválido o incompleto (menos de 3 vértices). Métricas de superficie no calculables.');
      return this.createEmptyMetrics('UNKNOWN', warnings);
    }

    // 1. Base polygon area and perimeter
    const grossArea = GeometryEngine.calculatePolygonArea(polygon, input.pixelsPerMeter);
    const perimeter = this.calculatePolygonPerimeter(polygon, input.pixelsPerMeter);

    // 2. Openings (Doors and Windows)
    const doors = input.doors || [];
    const windows = input.windows || [];

    let totalDoorsArea = 0;
    let totalDoorWidths = 0;
    for (const d of doors) {
      const w = d.widthM > 0 ? d.widthM : 0.8;
      const h = d.heightM > 0 ? d.heightM : 2.1;
      totalDoorsArea += w * h;
      totalDoorWidths += w;
    }

    let totalWindowsArea = 0;
    for (const win of windows) {
      const w = win.widthM > 0 ? win.widthM : 1.2;
      const h = win.heightM > 0 ? win.heightM : 1.2;
      totalWindowsArea += w * h;
    }

    const totalOpeningsArea = totalDoorsArea + totalWindowsArea;

    // 3. Wall surfaces (Gross and Net)
    let grossWallArea = 0;
    if (input.walls && input.walls.length > 0) {
      for (const wall of input.walls) {
        const wallLen =
          wall.lengthM && wall.lengthM > 0
            ? wall.lengthM
            : GeometryEngine.calculateDistance(
                { x: wall.startX, y: wall.startY },
                { x: wall.endX, y: wall.endY },
                input.pixelsPerMeter
              );
        const wallH = wall.heightM && wall.heightM > 0 ? wall.heightM : heightM;
        grossWallArea += wallLen * wallH;
      }
    } else {
      // Derived from perimeter and space height
      grossWallArea = perimeter * heightM;
    }

    const netWallArea = Math.max(0, grossWallArea - totalOpeningsArea);

    // 4. Usable area (superficie útil) and Built area (superficie construida)
    // Usable area is the net interior polygon area.
    const usableArea = grossArea;
    // Built area includes proportional partition thickness around perimeter.
    const builtArea = grossArea + (perimeter * wallThicknessM) / 2;

    // 5. Usable perimeter and Skirting board (Rodapié)
    const usablePerimeter = Math.max(0, perimeter - totalDoorWidths);
    const skirtingBoardM = usablePerimeter;

    // 6. Ceiling and Volume
    const ceilingArea = usableArea;
    const volumeM3 = usableArea * heightM;

    return {
      grossAreaM2: this.makeMetric(this.round(grossArea), 'm²', source),
      usableAreaM2: this.makeMetric(this.round(usableArea), 'm²', source),
      builtAreaM2: this.makeMetric(this.round(builtArea), 'm²', source),
      grossWallAreaM2: this.makeMetric(this.round(grossWallArea), 'm²', source),
      netWallAreaM2: this.makeMetric(this.round(netWallArea), 'm²', source),
      openingsAreaM2: this.makeMetric(this.round(totalOpeningsArea), 'm²', source),
      doorsAreaM2: this.makeMetric(this.round(totalDoorsArea), 'm²', source),
      windowsAreaM2: this.makeMetric(this.round(totalWindowsArea), 'm²', source),
      ceilingAreaM2: this.makeMetric(this.round(ceilingArea), 'm²', source),
      perimeterM: this.makeMetric(this.round(perimeter), 'm', source),
      usablePerimeterM: this.makeMetric(this.round(usablePerimeter), 'm', source),
      skirtingBoardM: this.makeMetric(this.round(skirtingBoardM), 'm', source),
      volumeM3: this.makeMetric(this.round(volumeM3), 'm³', source),
      wallCount: input.walls ? input.walls.length : polygon.length,
      doorCount: doors.length,
      windowCount: windows.length,
      warnings,
      isComplete: true,
    };
  }

  /**
   * Calculates the perimeter of a 2D closed polygon.
   */
  static calculatePolygonPerimeter(points: Point2D[], pixelsPerMeter?: number): number {
    if (!points || points.length < 2) return 0;
    let perimeter = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      perimeter += GeometryEngine.calculateDistance(points[i], points[next], pixelsPerMeter);
    }
    return Math.round(perimeter * 1000) / 1000;
  }

  /**
   * Creates an empty metric representation with specified confidence and warnings.
   */
  static createEmptyMetrics(
    source: MeasurementConfidence = 'UNKNOWN',
    warnings: string[] = []
  ): DetailedGeometricMetricsDto {
    const zero = (unit: string) => this.makeMetric(0, unit, source, 0);
    return {
      grossAreaM2: zero('m²'),
      usableAreaM2: zero('m²'),
      builtAreaM2: zero('m²'),
      grossWallAreaM2: zero('m²'),
      netWallAreaM2: zero('m²'),
      openingsAreaM2: zero('m²'),
      doorsAreaM2: zero('m²'),
      windowsAreaM2: zero('m²'),
      ceilingAreaM2: zero('m²'),
      perimeterM: zero('m'),
      usablePerimeterM: zero('m'),
      skirtingBoardM: zero('m'),
      volumeM3: zero('m³'),
      wallCount: 0,
      doorCount: 0,
      windowCount: 0,
      warnings,
      isComplete: false,
    };
  }

  /**
   * Helper rounding to 2 decimal places.
   */
  private static round(val: number): number {
    return Math.round(val * 100) / 100;
  }
}
