/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * RUTAS DE OPTIMIZACIÓN DE DISEÑO ARQUITECTÓNICO
 * DESIGN OPTIMIZATION ROUTES
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import {
  runOptimization,
  getOptimizationRequestsByProject,
  getOptimizationRequestById,
  getAlternativesByRequest,
  compareAlternatives,
  getAlternativeById,
  selectAlternative,
  convertAlternativeToScenario,
} from '../controllers/optimization.controller.js';

const router = Router();

// Optimización a nivel de Proyecto
router.post('/projects/:projectId/optimization', authenticateJwt, runOptimization);
router.get('/projects/:projectId/optimization/requests', authenticateJwt, getOptimizationRequestsByProject);

// Solicitudes de Optimización
router.get('/optimization/:requestId', authenticateJwt, getOptimizationRequestById);
router.get('/optimization/:requestId/alternatives', authenticateJwt, getAlternativesByRequest);
router.post('/optimization/:requestId/compare', authenticateJwt, compareAlternatives);

// Gestión de Alternativas de Diseño
router.get('/alternatives/:alternativeId', authenticateJwt, getAlternativeById);
router.post('/alternatives/:alternativeId/select', authenticateJwt, selectAlternative);
router.post('/alternatives/:alternativeId/convert-to-scenario', authenticateJwt, convertAlternativeToScenario);

export default router;
