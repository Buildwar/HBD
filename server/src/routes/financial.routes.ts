/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Routes — Project Investment & Total Cost Intelligence
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { FinancialController } from '../controllers/financial.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

export const financialRouter = Router();

// Resumen y Métricas Principales
financialRouter.get('/projects/:projectId/financial/summary', authenticateJwt, FinancialController.getSummary);
financialRouter.get('/projects/:projectId/financial/forecast', authenticateJwt, FinancialController.getForecast);

// Partidas de Coste (Cost Items)
financialRouter.get('/projects/:projectId/financial/items', authenticateJwt, FinancialController.getItems);
financialRouter.post('/projects/:projectId/financial/items', authenticateJwt, FinancialController.createItem);
financialRouter.put('/projects/:projectId/financial/items/:itemId', authenticateJwt, FinancialController.updateItem);
financialRouter.delete('/projects/:projectId/financial/items/:itemId', authenticateJwt, FinancialController.deleteItem);

// Sincronización Automática con V11, V15 y V16
financialRouter.post('/projects/:projectId/financial/sync', authenticateJwt, FinancialController.syncFinancials);

// Adquisición del Inmueble
financialRouter.get('/projects/:projectId/financial/acquisition', authenticateJwt, FinancialController.getAcquisition);
financialRouter.post('/projects/:projectId/financial/acquisition', authenticateJwt, FinancialController.saveAcquisition);
financialRouter.delete('/projects/:projectId/financial/acquisition', authenticateJwt, FinancialController.deleteAcquisition);

// Pagos y Desembolsos
financialRouter.get('/projects/:projectId/financial/payments', authenticateJwt, FinancialController.getPayments);
financialRouter.post('/projects/:projectId/financial/payments', authenticateJwt, FinancialController.createPayment);
financialRouter.delete('/projects/:projectId/financial/payments/:paymentId', authenticateJwt, FinancialController.deletePayment);

// Instantáneas Financieras (Snapshots)
financialRouter.get('/projects/:projectId/financial/snapshots', authenticateJwt, FinancialController.getSnapshots);
financialRouter.post('/projects/:projectId/financial/snapshots', authenticateJwt, FinancialController.createSnapshot);
