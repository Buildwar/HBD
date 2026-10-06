/**
 * HBD — HOME BOARD DESIGNER
 * Technical Infrastructure Express Routes (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { TechnicalInfrastructureController } from '../controllers/technicalInfrastructure.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

export const technicalInfrastructureRouter = Router();

technicalInfrastructureRouter.use(authenticateJwt);

// Elements CRUD
technicalInfrastructureRouter.get('/projects/:projectId/elements', TechnicalInfrastructureController.getElements);
technicalInfrastructureRouter.post('/projects/:projectId/elements', TechnicalInfrastructureController.createElement);
technicalInfrastructureRouter.put('/elements/:id', TechnicalInfrastructureController.updateElement);
technicalInfrastructureRouter.delete('/elements/:id', TechnicalInfrastructureController.deleteElement);
technicalInfrastructureRouter.post('/elements/:id/sync', TechnicalInfrastructureController.syncElement);

// Connections CRUD
technicalInfrastructureRouter.get('/projects/:projectId/connections', TechnicalInfrastructureController.getConnections);
technicalInfrastructureRouter.post('/projects/:projectId/connections', TechnicalInfrastructureController.createConnection);
technicalInfrastructureRouter.delete('/connections/:id', TechnicalInfrastructureController.deleteConnection);

// Zones / Panels CRUD
technicalInfrastructureRouter.get('/projects/:projectId/zones', TechnicalInfrastructureController.getZones);
technicalInfrastructureRouter.post('/projects/:projectId/zones', TechnicalInfrastructureController.createZone);
technicalInfrastructureRouter.delete('/zones/:id', TechnicalInfrastructureController.deleteZone);

// Calculations, Simulation & Validation
technicalInfrastructureRouter.get('/projects/:projectId/summary', TechnicalInfrastructureController.getSummary);
technicalInfrastructureRouter.get('/projects/:projectId/wifi-heatmap', TechnicalInfrastructureController.simulateWiFi);
technicalInfrastructureRouter.get('/projects/:projectId/validate', TechnicalInfrastructureController.validate);
