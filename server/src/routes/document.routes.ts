/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * RUTAS DE API PARA DOCUMENTACIÓN Y PRESENTACIÓN
 * DOCUMENT ROUTES
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

export const documentRouter = Router();

// Rutas autenticadas de documentos
documentRouter.use(authenticateJwt);

// Plantillas de documentos
documentRouter.get('/documents/templates', DocumentController.getTemplates);

// Documentos por Proyecto
documentRouter.get('/projects/:projectId/documents', DocumentController.getProjectDocuments);
documentRouter.post('/projects/:projectId/documents', DocumentController.createDocument);

// Operaciones individuales de Documento
documentRouter.get('/documents/:id', DocumentController.getDocumentById);
documentRouter.post('/documents/:id/regenerate', DocumentController.regenerateDocument);
documentRouter.post('/documents/:id/export', DocumentController.exportDocument);
documentRouter.delete('/documents/:id', DocumentController.deleteDocument);
