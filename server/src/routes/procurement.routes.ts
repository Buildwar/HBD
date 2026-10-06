/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Routes — Purchasing & Acquisition Intelligence
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { ProcurementController } from '../controllers/procurement.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

export const procurementRouter = Router();

// Resumen, Auditoría de Riesgos y Planificación
procurementRouter.get('/projects/:projectId/procurement/summary', authenticateJwt, ProcurementController.getSummary);
procurementRouter.get('/projects/:projectId/procurement/risks', authenticateJwt, ProcurementController.getRisks);
procurementRouter.get('/projects/:projectId/procurement/planning', authenticateJwt, ProcurementController.getPlanning);

// Partidas de Compra y Necesidades
procurementRouter.get('/projects/:projectId/procurement/items', authenticateJwt, ProcurementController.getItems);
procurementRouter.post('/projects/:projectId/procurement/items', authenticateJwt, ProcurementController.createItem);
procurementRouter.get('/projects/:projectId/procurement/items/:id', authenticateJwt, ProcurementController.getItemById);
procurementRouter.put('/projects/:projectId/procurement/items/:id', authenticateJwt, ProcurementController.updateItem);
procurementRouter.delete('/projects/:projectId/procurement/items/:id', authenticateJwt, ProcurementController.deleteItem);

// Sincronización de necesidades de compra con V11, V15 y V16 (respetando DESIGN_ONLY)
procurementRouter.post('/projects/:projectId/procurement/sync', authenticateJwt, ProcurementController.syncProcurement);

// Ofertas de Proveedor
procurementRouter.post('/projects/:projectId/procurement/quotes', authenticateJwt, ProcurementController.createQuote);
procurementRouter.put('/projects/:projectId/procurement/quotes/:id/select', authenticateJwt, ProcurementController.selectQuote);

// Pedidos a Proveedor y Recepción
procurementRouter.get('/projects/:projectId/procurement/orders', authenticateJwt, ProcurementController.getOrders);
procurementRouter.post('/projects/:projectId/procurement/orders', authenticateJwt, ProcurementController.createOrder);
procurementRouter.post('/projects/:projectId/procurement/orders/:id/receive', authenticateJwt, ProcurementController.receiveOrder);

// Incidencias y Devoluciones
procurementRouter.post('/projects/:projectId/procurement/incidents', authenticateJwt, ProcurementController.createIncident);
procurementRouter.post('/projects/:projectId/procurement/returns', authenticateJwt, ProcurementController.createReturn);
