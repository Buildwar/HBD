import { Router } from 'express';
import {
  getConstructionProject,
  updateConstructionProject,
  createPhase,
  createTask,
  updateTask,
  toggleChecklistItem,
  createItem,
  deleteItem,
  getComparison,
  getReport,
} from '../controllers/construction.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de obra requieren autenticación
router.use(authenticateJwt);

router.get('/projects/:projectId', getConstructionProject);
router.patch('/projects/:projectId', updateConstructionProject);
router.post('/projects/:projectId/phases', createPhase);
router.post('/phases/:phaseId/tasks', createTask);
router.patch('/tasks/:taskId', updateTask);
router.patch('/checklists/:checklistId', toggleChecklistItem);
router.post('/projects/:projectId/items', createItem);
router.delete('/items/:itemId', deleteItem);
router.get('/projects/:projectId/comparison', getComparison);
router.get('/projects/:projectId/report', getReport);

export default router;
