/**
 * HBD — HOME BOARD DESIGNER V5.0.0
 * Furniture Engine
 * 
 * Mathematical model and bounding geometry for furniture pieces:
 * - Oriented Bounding Box (OBB) & 4-point vertex computation with arbitrary rotation
 * - Precise metric unit conversion (m, cm, mm)
 * - Validation of physical dimensions
 */

import { Point2D } from '../types/geometry.types.js';
import { DimensionUnit, DimensionSource } from '../types/furniture.types.js';

export interface OrientedBoundingBox2D {
  center: Point2D;
  width: number;
  depth: number;
  rotationDeg: number;
  vertices: Point2D[]; // 4 corners: top-left, top-right, bottom-right, bottom-left
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class FurnitureEngine {
  /**
   * Converts dimensions between units (cm, mm, m).
   */
  static convertUnit(value: number, from: DimensionUnit, to: DimensionUnit): number {
    if (value <= 0) return 0;
    // Normalize to meters first
    let meters = value;
    if (from === 'cm') meters = value / 100;
    if (from === 'mm') meters = value / 1000;

    // Convert from meters to target
    if (to === 'm') return Math.round(meters * 1000) / 1000;
    if (to === 'cm') return Math.round(meters * 100 * 10) / 10;
    if (to === 'mm') return Math.round(meters * 1000);
    return meters;
  }

  /**
   * Validates that furniture dimensions are physically sound.
   */
  static validateDimensions(widthM: number, depthM: number, heightM: number): { isValid: boolean; error?: string } {
    if (widthM <= 0 || depthM <= 0 || heightM <= 0) {
      return { isValid: false, error: 'Las dimensiones (ancho, fondo, alto) deben ser mayores que cero.' };
    }
    if (widthM > 20 || depthM > 20 || heightM > 10) {
      return { isValid: false, error: 'Las dimensiones exceden el rango residencial estándar (> 20m).' };
    }
    return { isValid: true };
  }

  /**
   * Computes the 4 oriented corners (vertices) of a rotated 2D rectangular furniture piece.
   * @param center Center coordinate (x, y)
   * @param width Width along local X
   * @param depth Depth along local Y
   * @param rotationDeg Rotation angle in degrees (clockwise)
   */
  static computeOrientedBoundingBox(
    center: Point2D,
    width: number,
    depth: number,
    rotationDeg = 0
  ): OrientedBoundingBox2D {
    const halfW = width / 2;
    const halfD = depth / 2;
    const rad = (rotationDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Local 4 offsets relative to center
    const localCorners = [
      { x: -halfW, y: -halfD }, // Top-Left
      { x: halfW, y: -halfD },  // Top-Right
      { x: halfW, y: halfD },   // Bottom-Right
      { x: -halfW, y: halfD },  // Bottom-Left
    ];

    // Rotate and translate to world space
    const vertices: Point2D[] = localCorners.map((p) => ({
      x: Math.round((center.x + p.x * cos - p.y * sin) * 100) / 100,
      y: Math.round((center.y + p.x * sin + p.y * cos) * 100) / 100,
    }));

    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);

    return {
      center,
      width,
      depth,
      rotationDeg,
      vertices,
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  /**
   * Formats dimensions string in human-readable CM notation (e.g. "240 × 95 × 85 cm").
   */
  static formatDimensionsCm(widthM: number, depthM: number, heightM: number): string {
    const wCm = Math.round(widthM * 100);
    const dCm = Math.round(depthM * 100);
    const hCm = Math.round(heightM * 100);
    return `${wCm} × ${dCm} × ${hCm} cm`;
  }
}
