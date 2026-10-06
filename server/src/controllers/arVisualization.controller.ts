/**
 * AR Visualization Controller (Phase V22 / v1.22.0)
 * Handles AR scene persistence, capability analysis, calibrations, anchor placements, and measurements.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
  ARVisualizationEngine,
  ARCapabilityEngine,
  ARCalibrationEngine,
  ARAnchorEngine,
  ARMeasurementEngine,
  ARComparisonEngine,
  ARSceneConfig,
  ARAnchorItem,
  ARReferenceType,
} from '@hbd/shared';

export class ARVisualizationController {
  /**
   * Evaluates device capabilities and returns recommended AR mode.
   * POST /api/ar/detect-capabilities
   */
  static async detectCapabilities(req: Request, res: Response) {
    try {
      const features = req.body || {};
      const result = ARCapabilityEngine.evaluateCapabilities(features);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Calibrates metric scale based on reference type and pixel span.
   * POST /api/ar/calibrate
   */
  static async calibrateReference(req: Request, res: Response) {
    try {
      const { referenceType, measuredPixelSpan, customKnownMeters } = req.body;
      if (!referenceType || !measuredPixelSpan) {
        return res.status(400).json({ success: false, error: 'referenceType and measuredPixelSpan are required.' });
      }

      const result = ARCalibrationEngine.calibrateFromReference(
        referenceType as ARReferenceType,
        Number(measuredPixelSpan),
        customKnownMeters ? Number(customKnownMeters) : undefined
      );

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Validates anchor placement against bounds and existing anchors.
   * POST /api/ar/validate-placement
   */
  static async validatePlacement(req: Request, res: Response) {
    try {
      const { anchors, roomBounds } = req.body;
      if (!Array.isArray(anchors)) {
        return res.status(400).json({ success: false, error: 'anchors array is required.' });
      }

      const result = ARAnchorEngine.validateCollisions(anchors, roomBounds);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Calculates real distance between two 3D points.
   * POST /api/ar/measure
   */
  static async createMeasurement(req: Request, res: Response) {
    try {
      const { pointA, pointB, surfaceType, label, knownScaleConfidence } = req.body;
      if (!pointA || !pointB) {
        return res.status(400).json({ success: false, error: 'pointA and pointB are required.' });
      }

      const result = ARMeasurementEngine.createMeasurement(
        pointA,
        pointB,
        surfaceType || 'FLOOR',
        knownScaleConfidence || 0.85,
        label
      );

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Lists all AR scenes for a project.
   * GET /api/ar/projects/:projectId/scenes
   */
  static async getProjectScenes(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const scenes = await prisma.aRScene.findMany({
        where: { projectId },
        include: {
          anchors: true,
          scaleReferences: true,
          measurements: true,
          captures: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return res.json({ success: true, data: scenes });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Creates a new AR scene.
   * POST /api/ar/projects/:projectId/scenes
   */
  static async createScene(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { name, scenarioId, roomId, mode, initialAnchors, cameraSettings, comparisonConfig } = req.body;

      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      const sceneRecord = await prisma.aRScene.create({
        data: {
          projectId,
          scenarioId,
          roomId,
          name: name || 'Escena AR',
          mode: mode || 'AR_PREVIEW',
          trackingState: 'NOT_INITIALIZED',
          activeCapabilities: [],
          cameraSettings: cameraSettings || {},
          comparisonConfig: comparisonConfig || ARComparisonEngine.createDefaultConfig(),
        },
      });

      // If initial anchors supplied, create them
      if (Array.isArray(initialAnchors) && initialAnchors.length > 0) {
        await prisma.aRAnchor.createMany({
          data: initialAnchors.map((a: any) => ({
            sceneId: sceneRecord.id,
            targetType: a.targetType || 'FURNITURE',
            targetId: a.targetId,
            name: a.name || 'Elemento AR',
            surfaceType: a.surfaceType || 'FLOOR',
            posX: a.position?.x ?? a.posX ?? 0,
            posY: a.position?.y ?? a.posY ?? 0,
            posZ: a.position?.z ?? a.posZ ?? 0,
            rotPitch: a.rotation?.pitch ?? a.rotPitch ?? 0,
            rotYaw: a.rotation?.yaw ?? a.rotYaw ?? 0,
            rotRoll: a.rotation?.roll ?? a.rotRoll ?? 0,
            scaleX: a.scale?.x ?? a.scaleX ?? 1,
            scaleY: a.scale?.y ?? a.scaleY ?? 1,
            scaleZ: a.scale?.z ?? a.scaleZ ?? 1,
            isConfirmed: a.isConfirmed ?? false,
            provenance: a.provenance || 'PARAMETRIC_GENERATED',
            modelUrl: a.modelUrl,
            metadata: a.metadata || {},
          })),
        });
      }

      const fullScene = await prisma.aRScene.findUnique({
        where: { id: sceneRecord.id },
        include: {
          anchors: true,
          scaleReferences: true,
          measurements: true,
          captures: true,
        },
      });

      return res.status(201).json({ success: true, data: fullScene });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Retrieves an AR scene by ID.
   * GET /api/ar/scenes/:sceneId
   */
  static async getSceneById(req: Request, res: Response) {
    try {
      const { sceneId } = req.params;
      const scene = await prisma.aRScene.findUnique({
        where: { id: sceneId },
        include: {
          anchors: true,
          scaleReferences: true,
          measurements: true,
          captures: true,
          project: {
            select: {
              id: true,
              name: true,
              floors: {
                include: {
                  rooms: true,
                  walls: true,
                  furniturePlacements: true,
                  technicalElements: true,
                },
              },
            },
          },
        },
      });

      if (!scene) {
        return res.status(404).json({ success: false, error: 'AR scene not found.' });
      }

      return res.json({ success: true, data: scene });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Updates an AR scene.
   * PUT /api/ar/scenes/:sceneId
   */
  static async updateScene(req: Request, res: Response) {
    try {
      const { sceneId } = req.params;
      const { name, mode, trackingState, activeCapabilities, cameraSettings, lightingEstimate, comparisonConfig, metadata } = req.body;

      const updated = await prisma.aRScene.update({
        where: { id: sceneId },
        data: {
          ...(name ? { name } : {}),
          ...(mode ? { mode } : {}),
          ...(trackingState ? { trackingState } : {}),
          ...(activeCapabilities ? { activeCapabilities } : {}),
          ...(cameraSettings ? { cameraSettings } : {}),
          ...(lightingEstimate ? { lightingEstimate } : {}),
          ...(comparisonConfig ? { comparisonConfig } : {}),
          ...(metadata ? { metadata } : {}),
        },
        include: {
          anchors: true,
          scaleReferences: true,
          measurements: true,
          captures: true,
        },
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Adds or updates an AR anchor inside a scene.
   * POST /api/ar/scenes/:sceneId/anchors
   */
  static async upsertAnchor(req: Request, res: Response) {
    try {
      const { sceneId } = req.params;
      const {
        id,
        targetType,
        targetId,
        name,
        surfaceType,
        position,
        rotation,
        scale,
        isConfirmed,
        provenance,
        modelUrl,
        metadata,
      } = req.body;

      const scene = await prisma.aRScene.findUnique({ where: { id: sceneId } });
      if (!scene) {
        return res.status(404).json({ success: false, error: 'AR Scene not found.' });
      }

      let anchor;
      if (id) {
        anchor = await prisma.aRAnchor.upsert({
          where: { id },
          create: {
            id,
            sceneId,
            targetType: targetType || 'FURNITURE',
            targetId,
            name: name || 'Elemento AR',
            surfaceType: surfaceType || 'FLOOR',
            posX: position?.x ?? 0,
            posY: position?.y ?? 0,
            posZ: position?.z ?? 0,
            rotPitch: rotation?.pitch ?? 0,
            rotYaw: rotation?.yaw ?? 0,
            rotRoll: rotation?.roll ?? 0,
            scaleX: scale?.x ?? 1,
            scaleY: scale?.y ?? 1,
            scaleZ: scale?.z ?? 1,
            isConfirmed: isConfirmed ?? false,
            provenance: provenance || 'PARAMETRIC_GENERATED',
            modelUrl,
            metadata: metadata || {},
          },
          update: {
            ...(targetType ? { targetType } : {}),
            ...(targetId !== undefined ? { targetId } : {}),
            ...(name ? { name } : {}),
            ...(surfaceType ? { surfaceType } : {}),
            ...(position?.x !== undefined ? { posX: position.x } : {}),
            ...(position?.y !== undefined ? { posY: position.y } : {}),
            ...(position?.z !== undefined ? { posZ: position.z } : {}),
            ...(rotation?.pitch !== undefined ? { rotPitch: rotation.pitch } : {}),
            ...(rotation?.yaw !== undefined ? { rotYaw: rotation.yaw } : {}),
            ...(rotation?.roll !== undefined ? { rotRoll: rotation.roll } : {}),
            ...(scale?.x !== undefined ? { scaleX: scale.x } : {}),
            ...(scale?.y !== undefined ? { scaleY: scale.y } : {}),
            ...(scale?.z !== undefined ? { scaleZ: scale.z } : {}),
            ...(typeof isConfirmed === 'boolean' ? { isConfirmed } : {}),
            ...(provenance ? { provenance } : {}),
            ...(modelUrl !== undefined ? { modelUrl } : {}),
            ...(metadata ? { metadata } : {}),
          },
        });
      } else {
        anchor = await prisma.aRAnchor.create({
          data: {
            sceneId,
            targetType: targetType || 'FURNITURE',
            targetId,
            name: name || 'Elemento AR',
            surfaceType: surfaceType || 'FLOOR',
            posX: position?.x ?? 0,
            posY: position?.y ?? 0,
            posZ: position?.z ?? 0,
            rotPitch: rotation?.pitch ?? 0,
            rotYaw: rotation?.yaw ?? 0,
            rotRoll: rotation?.roll ?? 0,
            scaleX: scale?.x ?? 1,
            scaleY: scale?.y ?? 1,
            scaleZ: scale?.z ?? 1,
            isConfirmed: isConfirmed ?? false,
            provenance: provenance || 'PARAMETRIC_GENERATED',
            modelUrl,
            metadata: metadata || {},
          },
        });
      }

      return res.json({ success: true, data: anchor });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Deletes an anchor.
   * DELETE /api/ar/anchors/:anchorId
   */
  static async deleteAnchor(req: Request, res: Response) {
    try {
      const { anchorId } = req.params;
      await prisma.aRAnchor.delete({ where: { id: anchorId } });
      return res.json({ success: true, message: 'Anchor deleted successfully.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Saves an AR photo capture.
   * POST /api/ar/projects/:projectId/captures
   */
  static async createCapture(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { sceneId, imageUrl, title, caption, cameraPose, metadata } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ success: false, error: 'imageUrl is required.' });
      }

      const capture = await prisma.aRCapture.create({
        data: {
          projectId,
          sceneId,
          imageUrl,
          title: title || 'Captura AR',
          caption,
          cameraPose: cameraPose || {},
          metadata: metadata || {},
        },
      });

      return res.status(201).json({ success: true, data: capture });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Lists AR captures for a project.
   * GET /api/ar/projects/:projectId/captures
   */
  static async getProjectCaptures(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const captures = await prisma.aRCapture.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: captures });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
