/**
 * AR Calibration Engine (Phase V22 / v1.22.0)
 * Handles metric spatial calibration, scale reference points, and pixel-to-meter conversion.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { ARCalibrationResult, ARMeasurementQuality, ARReferenceType, ARScaleReferenceItem } from '../types/arVisualization.types';

export const STANDARD_REFERENCE_DIMENSIONS: Record<ARReferenceType, { defaultMeters: number; quality: ARMeasurementQuality; description: string }> = {
  DOOR_STANDARD: {
    defaultMeters: 2.03, // Standard interior door height in meters (Spain/EU ~203cm)
    quality: 'HIGH',
    description: 'Puerta interior estándar (2.03m de altura)',
  },
  WINDOW_STANDARD: {
    defaultMeters: 1.20, // Standard window height
    quality: 'MEDIUM',
    description: 'Ventana estándar (~1.20m de altura)',
  },
  WALL_MEASUREMENT: {
    defaultMeters: 2.50, // Standard ceiling height
    quality: 'HIGH',
    description: 'Medida directa de plano o pared conocida',
  },
  FURNITURE_KNOWN: {
    defaultMeters: 0.90, // Standard kitchen counter height or table
    quality: 'MEDIUM',
    description: 'Mueble con dimensiones de catálogo conocidas',
  },
  A4_PAPER_MARKER: {
    defaultMeters: 0.297, // A4 length (29.7cm)
    quality: 'HIGH',
    description: 'Hoja de papel A4 (29.7cm de largo)',
  },
  USER_MANUAL_CALIBRATION: {
    defaultMeters: 1.00,
    quality: 'MEDIUM',
    description: 'Calibración manual por el usuario',
  },
  ROOM_CORNER: {
    defaultMeters: 2.40,
    quality: 'LOW',
    description: 'Esquina de habitación estimada',
  },
};

export class ARCalibrationEngine {
  /**
   * Calibrates scale factor based on measured pixel size vs known real-world dimension.
   */
  static calibrateFromReference(
    referenceType: ARReferenceType,
    measuredPixelSpan: number,
    customKnownMeters?: number
  ): ARCalibrationResult {
    if (measuredPixelSpan <= 0) {
      return {
        isValid: false,
        scaleFactor: 0,
        quality: 'ESTIMATED_UNKNOWN',
        confidence: 0,
        appliedReferenceType: referenceType,
        message: 'Invalid measured pixel span (must be greater than zero).',
      };
    }

    const standard = STANDARD_REFERENCE_DIMENSIONS[referenceType];
    const knownMeters = customKnownMeters && customKnownMeters > 0 ? customKnownMeters : standard.defaultMeters;
    
    // Scale factor = meters per pixel
    const scaleFactor = knownMeters / measuredPixelSpan;

    let confidence = 0.5;
    if (standard.quality === 'HIGH') confidence = 0.9;
    else if (standard.quality === 'MEDIUM') confidence = 0.75;
    else if (standard.quality === 'LOW') confidence = 0.4;

    if (customKnownMeters && customKnownMeters > 0) {
      confidence = Math.min(1.0, confidence + 0.1);
    }

    return {
      isValid: true,
      scaleFactor,
      quality: standard.quality,
      confidence,
      appliedReferenceType: referenceType,
      message: `Calibración exitosa usando ${standard.description}. 1 px = ${(scaleFactor * 100).toFixed(2)} cm.`,
    };
  }

  /**
   * Builds an ARScaleReferenceItem.
   */
  static createReferenceItem(
    type: ARReferenceType,
    knownRealSizeMeters: number,
    measuredPixelSize?: number,
    notes?: string
  ): ARScaleReferenceItem {
    const calibration = measuredPixelSize && measuredPixelSize > 0 
      ? this.calibrateFromReference(type, measuredPixelSize, knownRealSizeMeters)
      : null;

    return {
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      knownRealSizeMeters,
      measuredPixelSize,
      calibrationRatioMetersPerPixel: calibration ? calibration.scaleFactor : undefined,
      quality: calibration ? calibration.quality : STANDARD_REFERENCE_DIMENSIONS[type]?.quality || 'ESTIMATED_UNKNOWN',
      notes,
    };
  }

  /**
   * Converts a measured pixel distance to real-world meters using the calibration ratio.
   */
  static pixelsToMeters(pixelDistance: number, scaleFactor: number): number {
    if (pixelDistance <= 0 || scaleFactor <= 0) return 0;
    return Number((pixelDistance * scaleFactor).toFixed(3));
  }

  /**
   * Converts real-world meters to pixel distance on the AR projection canvas.
   */
  static metersToPixels(meters: number, scaleFactor: number): number {
    if (meters <= 0 || scaleFactor <= 0) return 0;
    return Math.round(meters / scaleFactor);
  }
}
