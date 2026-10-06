/**
 * AR Visualization Service (Phase V22 / v1.22.0)
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ARAnchorItem,
  ARCalibrationResult,
  ARCapabilityCheckResult,
  ARCollisionValidationResult,
  ARComparisonConfig,
  ARMeasurementItem,
  ARReferenceType,
  ARSceneConfig,
} from '@hbd/shared';

const API_BASE = '/api/ar';

export class ARVisualizationService {
  /**
   * Detects AR capabilities on client/browser.
   */
  static async detectCapabilities(features?: any): Promise<ARCapabilityCheckResult> {
    const res = await fetch(`${API_BASE}/detect-capabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features || {}),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Calibrates metric scale based on reference marker/type.
   */
  static async calibrate(
    referenceType: ARReferenceType,
    measuredPixelSpan: number,
    customKnownMeters?: number
  ): Promise<ARCalibrationResult> {
    const res = await fetch(`${API_BASE}/calibrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referenceType, measuredPixelSpan, customKnownMeters }),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Validates anchor placements and clearances.
   */
  static async validatePlacement(
    anchors: ARAnchorItem[],
    roomBounds?: { minX: number; maxX: number; minZ: number; maxZ: number; height: number }
  ): Promise<ARCollisionValidationResult> {
    const res = await fetch(`${API_BASE}/validate-placement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anchors, roomBounds }),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Measures 3D real distance.
   */
  static async measure(
    pointA: ARAnchorItem['position'],
    pointB: ARAnchorItem['position'],
    surfaceType?: string,
    label?: string
  ): Promise<ARMeasurementItem> {
    const res = await fetch(`${API_BASE}/measure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pointA, pointB, surfaceType, label }),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Gets scenes for a project.
   */
  static async getProjectScenes(projectId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/scenes`);
    const json = await res.json();
    return json.data || [];
  }

  /**
   * Creates an AR scene.
   */
  static async createScene(projectId: string, data: Partial<ARSceneConfig>): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Gets a specific AR scene.
   */
  static async getSceneById(sceneId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/scenes/${sceneId}`);
    const json = await res.json();
    return json.data;
  }

  /**
   * Updates an AR scene.
   */
  static async updateScene(sceneId: string, updates: any): Promise<any> {
    const res = await fetch(`${API_BASE}/scenes/${sceneId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Upserts an AR anchor.
   */
  static async upsertAnchor(sceneId: string, anchor: Partial<ARAnchorItem>): Promise<any> {
    const res = await fetch(`${API_BASE}/scenes/${sceneId}/anchors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(anchor),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Deletes an anchor.
   */
  static async deleteAnchor(anchorId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/anchors/${anchorId}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  }

  /**
   * Saves an AR photo capture.
   */
  static async createCapture(projectId: string, capture: {
    sceneId?: string;
    imageUrl: string;
    title?: string;
    caption?: string;
    cameraPose?: any;
    metadata?: any;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/captures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capture),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Gets captures for a project.
   */
  static async getProjectCaptures(projectId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/captures`);
    const json = await res.json();
    return json.data || [];
  }
}
