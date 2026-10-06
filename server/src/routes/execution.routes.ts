import { Router } from 'express';
import {
  getExecutionProject,
  updateExecutionProject,
  updateProgress,
  getDailyLogs,
  createDailyLog,
  createIncident,
  updateIncident,
  createChangeOrder,
  updateChangeOrder,
  createInspection,
  createDelivery,
  createPhoto,
  closeExecutionProject,
  getClientView,
  getContractorView,
} from '../controllers/execution.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

export const executionRouter = Router();

// Todas las rutas requieren JWT
executionRouter.use(authenticateJwt);

// Proyectos y Estado General de Ejecución
executionRouter.get('/projects/:projectId/execution', getExecutionProject);
executionRouter.post('/projects/:projectId/execution', getExecutionProject);
executionRouter.get('/execution/:executionId', getExecutionProject);
executionRouter.put('/execution/:executionId', updateExecutionProject);

// Progreso y Cronograma Real
executionRouter.post('/execution/:executionId/progress', updateProgress);

// Diario de Obra (Site Daily Logs)
executionRouter.get('/execution/:executionId/daily-logs', getDailyLogs);
executionRouter.post('/execution/:executionId/daily-logs', createDailyLog);

// Incidencias
executionRouter.post('/execution/:executionId/incidents', createIncident);
executionRouter.put('/incidents/:incidentId', updateIncident);

// Órdenes de Cambio (Change Orders)
executionRouter.post('/execution/:executionId/change-orders', createChangeOrder);
executionRouter.put('/change-orders/:changeOrderId', updateChangeOrder);

// Inspecciones de Calidad
executionRouter.post('/execution/:executionId/inspections', createInspection);

// Aprovisionamiento y Entregas
executionRouter.post('/execution/:executionId/deliveries', createDelivery);

// Fotografías y Evidencias
executionRouter.post('/execution/:executionId/photos', createPhoto);

// Cierre Definitivo de Obra
executionRouter.post('/execution/:executionId/close', closeExecutionProject);

// Vistas Especiales
executionRouter.get('/execution/:executionId/client-view', getClientView);
executionRouter.get('/execution/:executionId/contractor-view', getContractorView);

export default executionRouter;
