import { Router } from 'express';
import {
  getSpacesByFloor,
  createSpace,
  updateSpace,
  deleteSpace,
  createFunctionalZone,
  updateFunctionalZone,
  deleteFunctionalZone,
  getProjectIntelligence,
} from '../controllers/space.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Intelligence & Spaces endpoints
router.get('/projects/:projectId/intelligence', getProjectIntelligence);
router.get('/projects/:projectId/floors/:floorId/spaces', getSpacesByFloor);
router.post('/projects/:projectId/floors/:floorId/spaces', createSpace);
router.patch('/spaces/:spaceId', updateSpace);
router.delete('/spaces/:spaceId', deleteSpace);

// Functional Zones endpoints
router.post('/spaces/:spaceId/zones', createFunctionalZone);
router.patch('/zones/:zoneId', updateFunctionalZone);
router.delete('/zones/:zoneId', deleteFunctionalZone);

export default router;
