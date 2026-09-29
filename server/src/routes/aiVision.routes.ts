/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * Rutas REST: AI Vision & Smart Recognition Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { AIVisionController } from '../controllers/aiVision.controller.js';
import { ENV } from '../config/env.js';

const router = Router();

const uploadTempDir = path.resolve(ENV.UPLOAD_DIR, 'temp');
if (!fs.existsSync(uploadTempDir)) {
  fs.mkdirSync(uploadTempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadTempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `vision-upload-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Se aceptan imágenes JPG, PNG y WEBP.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

// Todas las rutas requieren autenticación JWT
router.use(authenticateJwt);

// Estado del proveedor
router.get('/status', AIVisionController.getProviderStatus);

// Subida de imagen a la galería
router.post('/upload', upload.single('image'), AIVisionController.uploadImage);

// Listado de imágenes de proyecto
router.get('/project/:projectId', AIVisionController.getProjectImages);

// Obtener detalle de imagen
router.get('/image/:imageId', AIVisionController.getImageById);

// Eliminar imagen
router.delete('/image/:imageId', AIVisionController.deleteImage);

// Analizar imagen con IA de Visión
router.post('/analyze', AIVisionController.analyzeImage);

// Comparar fotografía real con modelo 3D/2D del proyecto
router.post('/compare', AIVisionController.compareWithProject);

// Revisar detecciones humanas y aplicar a planta
router.post('/review-and-apply', AIVisionController.reviewAndApply);

// Historial de visión
router.get('/history/:projectId', AIVisionController.getHistory);

export default router;
