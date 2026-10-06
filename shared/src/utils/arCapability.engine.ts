/**
 * AR Capability Detection Engine (Phase V22 / v1.22.0)
 * Evaluates hardware and browser capabilities to determine available AR modes and fallbacks.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { ARCapability, ARCapabilityCheckResult, ARMode } from '../types/arVisualization.types';

export class ARCapabilityEngine {
  /**
   * Evaluates available device capabilities and returns recommended AR operational mode.
   */
  static evaluateCapabilities(features: {
    hasWebXR?: boolean;
    hasImmersiveAR?: boolean;
    hasCamera?: boolean;
    hasPlaneDetection?: boolean;
    hasLightEstimation?: boolean;
    hasDepthSensing?: boolean;
    hasGyroscope?: boolean;
    hasHitTest?: boolean;
  }): ARCapabilityCheckResult {
    const availableCapabilities: ARCapability[] = [];
    const missingCapabilities: ARCapability[] = [];
    const notes: string[] = [];

    if (features.hasWebXR && features.hasImmersiveAR) {
      availableCapabilities.push('WEBXR_SUPPORTED');
    } else {
      missingCapabilities.push('WEBXR_SUPPORTED');
    }

    if (features.hasCamera) {
      availableCapabilities.push('CAMERA_SUPPORTED');
    } else {
      missingCapabilities.push('CAMERA_SUPPORTED');
    }

    if (features.hasPlaneDetection) {
      availableCapabilities.push('PLANE_DETECTION');
    } else {
      missingCapabilities.push('PLANE_DETECTION');
    }

    if (features.hasLightEstimation) {
      availableCapabilities.push('LIGHT_ESTIMATION');
    } else {
      missingCapabilities.push('LIGHT_ESTIMATION');
    }

    if (features.hasDepthSensing) {
      availableCapabilities.push('DEPTH_SUPPORTED');
    } else {
      missingCapabilities.push('DEPTH_SUPPORTED');
    }

    if (features.hasGyroscope) {
      availableCapabilities.push('GYROSCOPE_SUPPORTED');
    } else {
      missingCapabilities.push('GYROSCOPE_SUPPORTED');
    }

    if (features.hasHitTest) {
      availableCapabilities.push('HIT_TEST_SUPPORTED');
    } else {
      missingCapabilities.push('HIT_TEST_SUPPORTED');
    }

    let recommendedMode: ARMode = 'AR_PREVIEW';

    if (availableCapabilities.includes('WEBXR_SUPPORTED') && availableCapabilities.includes('HIT_TEST_SUPPORTED')) {
      recommendedMode = 'WEBXR_IMMERSIVE';
      notes.push('WebXR Immersive AR fully supported with surface hit-testing.');
    } else if (availableCapabilities.includes('CAMERA_SUPPORTED') && availableCapabilities.includes('GYROSCOPE_SUPPORTED')) {
      recommendedMode = 'CAMERA_TRACKED';
      notes.push('Camera tracking available with device orientation sensor fallback.');
    } else if (availableCapabilities.includes('CAMERA_SUPPORTED')) {
      recommendedMode = 'PHOTO_AR';
      notes.push('Camera available for photo capture and overlay projection.');
    } else {
      recommendedMode = 'AR_PREVIEW';
      notes.push('Interactive 3D canvas AR simulator and preview mode active.');
    }

    return {
      isSupported: availableCapabilities.length > 0,
      recommendedMode,
      availableCapabilities,
      missingCapabilities,
      notes,
    };
  }

  /**
   * Helper to inspect browser navigator in a client environment safely.
   */
  static async detectBrowserCapabilities(): Promise<ARCapabilityCheckResult> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return this.evaluateCapabilities({});
    }

    const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasGyroscope = typeof window.DeviceOrientationEvent !== 'undefined';
    let hasWebXR = false;
    let hasImmersiveAR = false;
    let hasHitTest = false;

    if ('xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      try {
        hasWebXR = true;
        hasImmersiveAR = await (navigator as any).xr.isSessionSupported('immersive-ar');
        hasHitTest = hasImmersiveAR; // Generally paired in modern browsers
      } catch {
        hasImmersiveAR = false;
      }
    }

    return this.evaluateCapabilities({
      hasWebXR,
      hasImmersiveAR,
      hasCamera,
      hasGyroscope,
      hasHitTest,
      hasPlaneDetection: hasImmersiveAR,
      hasLightEstimation: hasImmersiveAR,
      hasDepthSensing: false,
    });
  }
}
