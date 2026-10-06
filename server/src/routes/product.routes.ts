/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT IMPORT & DIGITAL TWIN ROUTES
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

export const productRouter = Router();

// Rutas de importación y catálogo
productRouter.post('/import', authenticateJwt, ProductController.importFromUrl);
productRouter.post('/confirm', authenticateJwt, ProductController.confirmAndSave);
productRouter.get('/', authenticateJwt, ProductController.getProducts);
productRouter.get('/:id', authenticateJwt, ProductController.getProductById);
productRouter.delete('/:id', authenticateJwt, ProductController.deleteProduct);

// Rutas de productos asignados al proyecto
productRouter.get('/project/:projectId', authenticateJwt, ProductController.getProjectProducts);
productRouter.post('/project/:projectId', authenticateJwt, ProductController.addProductToProject);
productRouter.delete('/project/item/:id', authenticateJwt, ProductController.removeProjectProduct);
productRouter.get('/project/:projectId/shopping-list', authenticateJwt, ProductController.getProjectShoppingList);
