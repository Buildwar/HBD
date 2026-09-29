/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * Core Geometry Engine
 * 
 * Centralized, pure mathematical and geometric calculations for:
 * - Pixel <-> Meter conversions with calibration
 * - Euclidean distances
 * - Polygon surface area (Shoelace algorithm) in m²
 * - Angles, wall orientations & intersection tests
 * - Grid and angular snapping
 * - Centroids and bounding boxes
 * 
 * Strict Principle: Vision/AI detects elements, GeometryEngine calculates metrics.
 */

import { Point2D } from '../types/geometry.types.js';

export class GeometryEngine {
  /**
   * Converts a pixel dimension to real-world meters given a scale factor (pixels per meter).
   */
  static pixelsToMeters(pixels: number, pixelsPerMeter: number): number {
    if (!pixelsPerMeter || pixelsPerMeter <= 0) return pixels;
    return Math.round((pixels / pixelsPerMeter) * 1000) / 1000;
  }

  /**
   * Converts a real-world meter dimension to canvas pixels given a scale factor.
   */
  static metersToPixels(meters: number, pixelsPerMeter: number): number {
    if (!pixelsPerMeter || pixelsPerMeter <= 0) return meters;
    return Math.round(meters * pixelsPerMeter * 100) / 100;
  }

  /**
   * Calculates the scale factor (pixels per meter) given a measured pixel distance and its real-world distance in meters.
   * e.g., 1000 pixels = 2.0 meters => 500 pixels/meter.
   */
  static calculateScaleFactor(pixelDistance: number, realMeters: number): number {
    if (realMeters <= 0 || pixelDistance <= 0) {
      throw new Error('Distance in pixels and meters must be greater than zero.');
    }
    return Math.round((pixelDistance / realMeters) * 1000) / 1000;
  }

  /**
   * Computes Euclidean distance between two 2D points.
   * If pixelsPerMeter is supplied, distance is returned in meters, otherwise in coordinate units.
   */
  static calculateDistance(p1: Point2D, p2: Point2D, pixelsPerMeter?: number): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const rawDist = Math.sqrt(dx * dx + dy * dy);
    if (pixelsPerMeter && pixelsPerMeter > 0) {
      return this.pixelsToMeters(rawDist, pixelsPerMeter);
    }
    return Math.round(rawDist * 1000) / 1000;
  }

  /**
   * Calculates the area of a 2D closed polygon using the Shoelace (Gauss's area) formula.
   * If pixelsPerMeter is supplied, the result is in square meters (m²), otherwise square coordinate units.
   */
  static calculatePolygonArea(points: Point2D[], pixelsPerMeter?: number): number {
    if (!points || points.length < 3) return 0;

    let area = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }

    const rawArea = Math.abs(area) / 2;

    if (pixelsPerMeter && pixelsPerMeter > 0) {
      // Area in m² = rawArea / (pixelsPerMeter ^ 2)
      const areaM2 = rawArea / (pixelsPerMeter * pixelsPerMeter);
      return Math.round(areaM2 * 100) / 100;
    }

    return Math.round(rawArea * 100) / 100;
  }

  /**
   * Calculates the angle in degrees between two points (from p1 to p2), normalized to [0, 360).
   */
  static calculateAngle(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    let degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (degrees < 0) {
      degrees += 360;
    }
    return Math.round(degrees * 100) / 100;
  }

  /**
   * Checks if two line segments (p1-p2 and p3-p4) intersect and returns the intersection point if any.
   */
  static checkIntersection(
    p1: Point2D,
    p2: Point2D,
    p3: Point2D,
    p4: Point2D
  ): { intersects: boolean; point?: Point2D } {
    const det = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if (det === 0) {
      return { intersects: false }; // Parallel or collinear
    }

    const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
    const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

    const intersects = 0 <= lambda && lambda <= 1 && 0 <= gamma && gamma <= 1;
    if (!intersects) return { intersects: false };

    return {
      intersects: true,
      point: {
        x: Math.round((p1.x + lambda * (p2.x - p1.x)) * 100) / 100,
        y: Math.round((p1.y + lambda * (p2.y - p1.y)) * 100) / 100,
      },
    };
  }

  /**
   * Snaps a coordinate point to the nearest grid increment.
   */
  static snapPointToGrid(point: Point2D, gridSize: number, snapEnabled = true): Point2D {
    if (!snapEnabled || gridSize <= 0) return { ...point };
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  }

  /**
   * Snaps an end point to standard orthogonal and diagonal angles (0°, 45°, 90°, 135°, 180°, etc.)
   * relative to a starting anchor point.
   */
  static snapPointToAngle(
    start: Point2D,
    current: Point2D,
    snapAngles: number[] = [0, 45, 90, 135, 180, 225, 270, 315, 360],
    thresholdDeg = 5
  ): Point2D {
    const rawAngle = this.calculateAngle(start, current);
    const distance = Math.sqrt(Math.pow(current.x - start.x, 2) + Math.pow(current.y - start.y, 2));

    for (const targetAngle of snapAngles) {
      const diff = Math.abs(rawAngle - targetAngle);
      if (diff <= thresholdDeg || Math.abs(diff - 360) <= thresholdDeg) {
        const rad = (targetAngle * Math.PI) / 180;
        return {
          x: Math.round((start.x + distance * Math.cos(rad)) * 100) / 100,
          y: Math.round((start.y + distance * Math.sin(rad)) * 100) / 100,
        };
      }
    }

    return { ...current };
  }

  /**
   * Calculates the geometric centroid (center of mass) of a polygon.
   */
  static findPolygonCentroid(points: Point2D[]): Point2D {
    if (!points || points.length === 0) return { x: 0, y: 0 };
    if (points.length === 1) return { ...points[0] };

    let signedArea = 0;
    let cx = 0;
    let cy = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const factor = points[i].x * points[j].y - points[j].x * points[i].y;
      signedArea += factor;
      cx += (points[i].x + points[j].x) * factor;
      cy += (points[i].y + points[j].y) * factor;
    }

    signedArea *= 0.5;
    if (Math.abs(signedArea) < 1e-6) {
      // Fallback to arithmetic mean for degenerate polygons
      const sumX = points.reduce((acc, p) => acc + p.x, 0);
      const sumY = points.reduce((acc, p) => acc + p.y, 0);
      return {
        x: Math.round((sumX / n) * 100) / 100,
        y: Math.round((sumY / n) * 100) / 100,
      };
    }

    cx /= 6 * signedArea;
    cy /= 6 * signedArea;

    return {
      x: Math.round(cx * 100) / 100,
      y: Math.round(cy * 100) / 100,
    };
  }

  /**
   * Checks if a point is inside a polygon using ray casting algorithm.
   */
  static isPointInsidePolygon(point: Point2D, polygon: Point2D[]): boolean {
    let inside = false;
    const n = polygon.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
}
