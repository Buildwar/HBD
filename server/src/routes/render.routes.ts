/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Rutas de la API de Render y Escenas (Render Routes)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Router } from 'express';
import {
  getFloorScenes,
  getProjectRenders,
  saveRenderResult,
  deleteRender,
  getStylePresets,
} from '../controllers/render.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateJwt);

router.get('/scenes/:floorId', getFloorScenes);
router.get('/gallery/:projectId', getProjectRenders);
router.post('/gallery', saveRenderResult);
router.delete('/gallery/:id', deleteRender);
router.get('/presets', getStylePresets);

export default router;
