/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * RUTAS DE ESCENARIOS Y PLANIFICACIÓN DE PROYECTO
 * SCENARIO ROUTES
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import {
  getScenariosByProject,
  createScenario,
  getScenarioById,
  updateScenario,
  deleteScenario,
  duplicateScenario,
  applyAction,
  revertAction,
  validateScenario,
  compareScenarios,
} from '../controllers/scenario.controller.js';

const router = Router();

// Escenarios a nivel de Proyecto
router.get('/projects/:projectId/scenarios', authenticateJwt, getScenariosByProject);
router.post('/projects/:projectId/scenarios', authenticateJwt, createScenario);
router.post('/projects/:projectId/scenarios/compare', authenticateJwt, compareScenarios);

// Gestión individual de Escenarios
router.get('/scenarios/:scenarioId', authenticateJwt, getScenarioById);
router.put('/scenarios/:scenarioId', authenticateJwt, updateScenario);
router.delete('/scenarios/:scenarioId', authenticateJwt, deleteScenario);
router.post('/scenarios/:scenarioId/duplicate', authenticateJwt, duplicateScenario);

// Acciones estructuradas del Escenario
router.post('/scenarios/:scenarioId/actions', authenticateJwt, applyAction);
router.post('/scenarios/:scenarioId/actions/:actionId/revert', authenticateJwt, revertAction);

// Validación técnica del Escenario
router.post('/scenarios/:scenarioId/validate', authenticateJwt, validateScenario);

export default router;
