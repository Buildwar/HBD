/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Rutas de la API 3D (ThreeD Routes)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Router } from 'express';
import { getFloor3DScene, syncFurniture3DTo2D } from '../controllers/threeD.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateJwt);

router.get('/scene/:floorId', getFloor3DScene);
router.post('/sync-furniture/:placementId', syncFurniture3DTo2D);

export default router;
