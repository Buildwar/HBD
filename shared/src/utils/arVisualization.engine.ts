/**
 * AR Visualization Engine (Phase V22 / v1.22.0)
 * Master facade orchestrating real space visual projections, anchors, calibration, and comparisons.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ARAnchorItem,
  ARCalibrationResult,
  ARCapabilityCheckResult,
  ARCollisionValidationResult,
  ARComparisonConfig,
  ARMeasurementItem,
  ARMode,
  ARReferenceType,
  ARScaleReferenceItem,
  ARSceneConfig,
  ARSurfaceType,
  ARTrackingState,
} from '../types/arVisualization.types';
import { ARCapabilityEngine } from './arCapability.engine';
import { ARCalibrationEngine } from './arCalibration.engine';
import { ARAnchorEngine } from './arAnchor.engine';
import { ARMeasurementEngine } from './arMeasurement.engine';
import { ARComparisonEngine } from './arComparison.engine';

export class ARVisualizationEngine {
  /**
   * Initializes a new AR Scene configuration.
   */
  static createScene(
    projectId: string,
    name: string,
    options?: {
      scenarioId?: string;
      roomId?: string;
      mode?: ARMode;
      initialAnchors?: ARAnchorItem[];
    }
  ): ARSceneConfig {
    return {
      id: `ar_scene_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      scenarioId: options?.scenarioId,
      roomId: options?.roomId,
      name,
      mode: options?.mode || 'AR_PREVIEW',
      trackingState: 'NOT_INITIALIZED',
      activeCapabilities: [],
      anchors: options?.initialAnchors || [],
      references: [],
      measurements: [],
      comparison: ARComparisonEngine.createDefaultConfig(),
      cameraSettings: {
        fov: 60,
        aspectRatio: 16 / 9,
        near: 0.1,
        far: 100,
      },
      lightingEstimate: {
        ambientIntensity: 0.7,
        colorTemperature: 5500,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluates hardware and updates scene mode and tracking state.
   */
  static evaluateSceneCapabilities(
    scene: ARSceneConfig,
    features: Parameters<typeof ARCapabilityEngine.evaluateCapabilities>[0]
  ): { scene: ARSceneConfig; capabilities: ARCapabilityCheckResult } {
    const result = ARCapabilityEngine.evaluateCapabilities(features);
    const updatedScene: ARSceneConfig = {
      ...scene,
      mode: result.recommendedMode,
      activeCapabilities: result.availableCapabilities,
      trackingState: result.isSupported ? 'TRACKING' : 'FALLBACK_MANUAL',
      updatedAt: new Date().toISOString(),
    };
    return { scene: updatedScene, capabilities: result };
  }

  /**
   * Adds an anchor to the scene with collision validation.
   */
  static addAnchor(
    scene: ARSceneConfig,
    anchor: ARAnchorItem,
    roomBounds?: { minX: number; maxX: number; minZ: number; maxZ: number; height: number }
  ): { scene: ARSceneConfig; collisions: ARCollisionValidationResult } {
    const updatedAnchors = [...scene.anchors, anchor];
    const collisions = ARAnchorEngine.validateCollisions(updatedAnchors, roomBounds);

    const validatedAnchors = updatedAnchors.map((a) => ({
      ...a,
      hasCollisions: collisions.conflictingAnchors.includes(a.id) || collisions.wallViolations.includes(a.id),
      collisionWarning: collisions.warnings.find((w) => w.includes(a.name)),
    }));

    return {
      scene: {
        ...scene,
        anchors: validatedAnchors,
        updatedAt: new Date().toISOString(),
      },
      collisions,
    };
  }

  /**
   * Calibrates scene metric scale using a reference marker or dimension.
   */
  static calibrateScene(
    scene: ARSceneConfig,
    referenceType: ARReferenceType,
    measuredPixelSpan: number,
    customKnownMeters?: number
  ): { scene: ARSceneConfig; calibration: ARCalibrationResult } {
    const calibration = ARCalibrationEngine.calibrateFromReference(
      referenceType,
      measuredPixelSpan,
      customKnownMeters
    );

    const refItem = ARCalibrationEngine.createReferenceItem(
      referenceType,
      customKnownMeters || 1.0,
      measuredPixelSpan
    );

    return {
      scene: {
        ...scene,
        references: [...scene.references, refItem],
        updatedAt: new Date().toISOString(),
      },
      calibration,
    };
  }

  /**
   * Adds an in-AR distance measurement to the scene.
   */
  static addMeasurement(
    scene: ARSceneConfig,
    pointA: ARAnchorItem['position'],
    pointB: ARAnchorItem['position'],
    surfaceType: ARSurfaceType = 'FLOOR',
    label?: string
  ): { scene: ARSceneConfig; measurement: ARMeasurementItem } {
    const measurement = ARMeasurementEngine.createMeasurement(pointA, pointB, surfaceType, 0.85, label);

    return {
      scene: {
        ...scene,
        measurements: [...scene.measurements, measurement],
        updatedAt: new Date().toISOString(),
      },
      measurement,
    };
  }

  /**
   * Updates comparison slider and mode.
   */
  static updateComparison(scene: ARSceneConfig, comparisonUpdates: Partial<ARComparisonConfig>): ARSceneConfig {
    const current = scene.comparison || ARComparisonEngine.createDefaultConfig();
    return {
      ...scene,
      comparison: {
        ...current,
        ...comparisonUpdates,
      },
      updatedAt: new Date().toISOString(),
    };
  }
}

export {
  ARCapabilityEngine,
  ARCalibrationEngine,
  ARAnchorEngine,
  ARMeasurementEngine,
  ARComparisonEngine,
};
