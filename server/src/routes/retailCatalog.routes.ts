/**
 * HBD — Retail Catalog Routes
 * V20.0.0 — Connected Retail Catalog & Product Placement
 */

import { Router } from 'express';
import {
  searchCatalog,
  getProductDetails,
  getRetailers,
  testRetailerConnection,
  updateRetailerConfig,
  syncCatalog,
  compareProducts,
  addProductToProject,
  toggleFavorite,
} from '../controllers/retailCatalog.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

export const retailCatalogRouter = Router();

retailCatalogRouter.use(authenticateJwt);

// Catalog Search & Details
retailCatalogRouter.get('/search', searchCatalog);
retailCatalogRouter.get('/products/:id', getProductDetails);
retailCatalogRouter.post('/compare', compareProducts);
retailCatalogRouter.post('/products/:id/favorite', toggleFavorite);

// Retailers Management & Connectors
retailCatalogRouter.get('/retailers', getRetailers);
retailCatalogRouter.post('/retailers/:code/test', requireRole(['ADMIN']), testRetailerConnection);
retailCatalogRouter.post('/retailers/:code/config', requireRole(['ADMIN']), updateRetailerConfig);
retailCatalogRouter.post('/retailers/sync', requireRole(['ADMIN']), syncCatalog);

// Placement to Project
retailCatalogRouter.post('/projects/:projectId/add', addProductToProject);
