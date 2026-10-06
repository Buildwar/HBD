/**
 * AR Comparison Engine (Phase V22 / v1.22.0)
 * Handles comparison modes (Side-by-side, Before/After slider, Opacity overlay)
 * between physical space photos and projected HBD 3D models.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { ARComparisonConfig } from '../types/arVisualization.types';

export class ARComparisonEngine {
  /**
   * Initializes default comparison configuration.
   */
  static createDefaultConfig(overrides?: Partial<ARComparisonConfig>): ARComparisonConfig {
    return {
      mode: 'BEFORE_AFTER_SLIDER',
      sliderPosition: 50,
      overlayOpacity: 0.85,
      showWireframeOverlay: false,
      showTechnicalInfrastructure: true,
      ...(overrides || {}),
    };
  }

  /**
   * Updates slider position clamped between 0 and 100%.
   */
  static updateSliderPosition(config: ARComparisonConfig, positionPercentage: number): ARComparisonConfig {
    const clamped = Math.max(0, Math.min(100, Math.round(positionPercentage)));
    return {
      ...config,
      sliderPosition: clamped,
    };
  }

  /**
   * Updates overlay opacity clamped between 0 and 1.
   */
  static updateOpacity(config: ARComparisonConfig, opacity: number): ARComparisonConfig {
    const clamped = Math.max(0, Math.min(1.0, Number(opacity.toFixed(2))));
    return {
      ...config,
      overlayOpacity: clamped,
    };
  }

  /**
   * Evaluates comparison readiness.
   */
  static validateComparisonReadiness(config: ARComparisonConfig): {
    isReady: boolean;
    missingElements: string[];
  } {
    const missing: string[] = [];
    if (!config.realSpaceImageUrl) {
      missing.push('Fotografía del espacio real');
    }
    if (!config.renderedSceneImageUrl) {
      missing.push('Render o proyección del modelo 3D');
    }

    return {
      isReady: missing.length === 0,
      missingElements: missing,
    };
  }
}
