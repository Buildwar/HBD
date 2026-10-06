/**
 * AR Measurement Engine (Phase V22 / v1.22.0)
 * Handles in-AR point-to-point real spatial measurements, confidence scores and quality validation.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { ARAnchorPosition, ARMeasurementItem, ARMeasurementQuality, ARSurfaceType } from '../types/arVisualization.types';
import { ARAnchorEngine } from './arAnchor.engine';

export class ARMeasurementEngine {
  /**
   * Creates a verified measurement item between two 3D spatial points.
   */
  static createMeasurement(
    pointA: ARAnchorPosition,
    pointB: ARAnchorPosition,
    surfaceType: ARSurfaceType = 'FLOOR',
    knownScaleConfidence = 0.8,
    label?: string
  ): ARMeasurementItem {
    const distanceMeters = ARAnchorEngine.calculateDistance(pointA, pointB);

    let quality: ARMeasurementQuality = 'ESTIMATED_UNKNOWN';
    let confidenceScore = Math.max(0.1, Math.min(1.0, knownScaleConfidence));

    if (confidenceScore >= 0.85) {
      quality = 'HIGH';
    } else if (confidenceScore >= 0.65) {
      quality = 'MEDIUM';
    } else if (confidenceScore >= 0.4) {
      quality = 'LOW';
    }

    return {
      id: `meas_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pointA,
      pointB,
      distanceMeters,
      surfaceType,
      quality,
      confidenceScore,
      label: label || `Distancia: ${distanceMeters} m`,
    };
  }

  /**
   * Formats distance with human readable unit strings (meters, centimeters).
   */
  static formatDistance(meters: number): string {
    if (meters < 1.0) {
      return `${Math.round(meters * 100)} cm`;
    }
    return `${meters.toFixed(2)} m`;
  }

  /**
   * Validates if a measured space fits a specific target furniture bounding box.
   */
  static checkFitsInMeasuredSpace(
    measuredSpanMeters: number,
    itemSizeMeters: number,
    toleranceMeters = 0.05
  ): { fits: boolean; differenceMeters: number; message: string } {
    const diff = measuredSpanMeters - itemSizeMeters;
    const fits = diff >= -toleranceMeters;

    let message = '';
    if (diff >= 0.1) {
      message = `Espacio holgado: sobran ${(diff * 100).toFixed(0)} cm.`;
    } else if (fits) {
      message = `Ajuste óptimo en el espacio medido (margen de ${(diff * 100).toFixed(0)} cm).`;
    } else {
      message = `No cabe: faltan ${(Math.abs(diff) * 100).toFixed(0)} cm para alojar el elemento.`;
    }

    return {
      fits,
      differenceMeters: Number(diff.toFixed(3)),
      message,
    };
  }
}
