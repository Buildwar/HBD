/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * FloorPlan Routes
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import {
  uploadFloorPlan,
  getFloorPlanById,
  analyzeFloorPlan,
  calibrateScale,
  confirmAndImportGeometry,
  saveFloorGeometry,
} from '../controllers/floorplan.controller.js';
import { ENV } from '../config/env.js';

const router = Router();

// Ensure uploads directory exists
if (!fs.existsSync(ENV.UPLOAD_DIR)) {
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ENV.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `plan-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/tiff',
  ];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Se admiten PDF, PNG, JPG, JPEG, WEBP y TIFF.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: ENV.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter,
});

router.use(authenticateJwt);

// Upload plan file for a floor
router.post('/projects/:projectId/floors/:floorId/plans/upload', upload.single('plan'), uploadFloorPlan);

// Get single floorplan
router.get('/plans/:id', getFloorPlanById);

// Analyze floorplan
router.post('/plans/:id/analyze', analyzeFloorPlan);

// Calibrate scale
router.post('/plans/:id/calibrate-scale', calibrateScale);

// Confirm and import geometry into database
router.post('/plans/:id/confirm-import', confirmAndImportGeometry);

// Save real-time 2D geometry for a floor
router.put('/floors/:floorId/geometry', saveFloorGeometry);

export default router;
