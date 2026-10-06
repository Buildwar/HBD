/**
 * AR Visualization Routes (Phase V22 / v1.22.0)
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { ARVisualizationController } from '../controllers/arVisualization.controller.js';

const router = Router();

// Capabilities & Diagnostics
router.post('/detect-capabilities', ARVisualizationController.detectCapabilities);

// Calibration & Real Space Metric Scaling
router.post('/calibrate', ARVisualizationController.calibrateReference);

// Placement & Clearance Validation
router.post('/validate-placement', ARVisualizationController.validatePlacement);

// Point-to-Point Measurement
router.post('/measure', ARVisualizationController.createMeasurement);

// Scene Management
router.get('/projects/:projectId/scenes', ARVisualizationController.getProjectScenes);
router.post('/projects/:projectId/scenes', ARVisualizationController.createScene);
router.get('/scenes/:sceneId', ARVisualizationController.getSceneById);
router.put('/scenes/:sceneId', ARVisualizationController.updateScene);

// Anchors
router.post('/scenes/:sceneId/anchors', ARVisualizationController.upsertAnchor);
router.delete('/anchors/:anchorId', ARVisualizationController.deleteAnchor);

// Captures / Snapshots
router.get('/projects/:projectId/captures', ARVisualizationController.getProjectCaptures);
router.post('/projects/:projectId/captures', ARVisualizationController.createCapture);

export default router;
