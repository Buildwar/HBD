/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Multi-layer Progressive Context Builder & Privacy Sanitizer
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { AIProjectContext, AICopilotIntent } from '../types/copilot.types.js';

export class CopilotContextEngine {
  /**
   * Sanitizes any context to remove credentials, passwords, JWT tokens and unnecessary secrets.
   */
  static sanitizeContext<T extends Record<string, any>>(rawContext: T): T {
    if (!rawContext || typeof rawContext !== 'object') return rawContext;

    const sanitized: Record<string, any> = Array.isArray(rawContext) ? [] : {};

    for (const [key, value] of Object.entries(rawContext)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('jwt') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('apikey') ||
        lowerKey.includes('hash') ||
        lowerKey.includes('auth')
      ) {
        continue; // Strip out sensitive keys
      }

      if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized as T;
  }

  /**
   * Builds the progressive context payload tailored to the user's intent to avoid sending oversized prompts.
   */
  static filterContextForIntent(fullContext: AIProjectContext, intent: AICopilotIntent): AIProjectContext {
    const sanitized = this.sanitizeContext(fullContext);
    const layers = sanitized.layers || {};

    const targetedLayers: Record<string, any> = {
      level1_summary: layers.level1_summary, // Level 1 is always included
    };

    switch (intent) {
      case 'DESIGN':
      case 'REDESIGN':
      case 'FURNISH':
      case 'CHECK_FIT':
      case 'SEARCH_PRODUCT':
        targetedLayers.level2_room = layers.level2_room;
        targetedLayers.level3_geometry = layers.level3_geometry;
        targetedLayers.level4_furniture = layers.level4_furniture;
        targetedLayers.level6_products = layers.level6_products;
        targetedLayers.level7_financial = layers.level7_financial;
        break;

      case 'BUDGET':
        targetedLayers.level7_financial = layers.level7_financial;
        targetedLayers.level6_products = layers.level6_products;
        targetedLayers.level8_construction = layers.level8_construction;
        break;

      case 'CONSTRUCTION':
        targetedLayers.level2_room = layers.level2_room;
        targetedLayers.level3_geometry = layers.level3_geometry;
        targetedLayers.level8_construction = layers.level8_construction;
        targetedLayers.level7_financial = layers.level7_financial;
        break;

      case 'EXECUTION':
        targetedLayers.level8_construction = layers.level8_construction;
        targetedLayers.level9_execution = layers.level9_execution;
        break;

      case 'PROCUREMENT':
        targetedLayers.level6_products = layers.level6_products;
        targetedLayers.level7_financial = layers.level7_financial;
        break;

      case 'TECHNICAL_DESIGN':
        targetedLayers.level2_room = layers.level2_room;
        targetedLayers.level3_geometry = layers.level3_geometry;
        targetedLayers.level5_technical = layers.level5_technical;
        break;

      case 'PROPERTY_INTELLIGENCE':
        targetedLayers.level1_summary = layers.level1_summary;
        targetedLayers.level2_room = layers.level2_room;
        targetedLayers.level7_financial = layers.level7_financial;
        break;

      default:
        // Include levels 1, 2, 4 by default
        targetedLayers.level2_room = layers.level2_room;
        targetedLayers.level4_furniture = layers.level4_furniture;
        break;
    }

    return {
      projectId: sanitized.projectId,
      propertyId: sanitized.propertyId,
      activeScenarioId: sanitized.activeScenarioId,
      activeRoomId: sanitized.activeRoomId,
      activeFloorId: sanitized.activeFloorId,
      selectedFurnitureIds: sanitized.selectedFurnitureIds,
      selectedTechnicalElementIds: sanitized.selectedTechnicalElementIds,
      selectedProductIds: sanitized.selectedProductIds,
      budget: sanitized.budget,
      designPreferences: sanitized.designPreferences,
      userLocale: sanitized.userLocale || 'es',
      layers: targetedLayers,
    };
  }
}
