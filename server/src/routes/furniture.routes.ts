/**
 * HBD — HOME BOARD DESIGNER V5.0.0
 * Furniture & Placement Routes
 */

import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import {
  getCategories,
  getFurnitureList,
  createFurniture,
  updateFurniture,
  deleteFurniture,
  getFloorPlacements,
  createPlacement,
  updatePlacement,
  deletePlacement,
  duplicatePlacement,
  validatePlacementSpatial,
} from '../controllers/furniture.controller.js';

export const furnitureRouter = Router();

furnitureRouter.use(authenticateJwt);

// Furniture Catalog & Custom Library
furnitureRouter.get('/categories', getCategories);
furnitureRouter.get('/', getFurnitureList);
furnitureRouter.post('/', createFurniture);
furnitureRouter.put('/:id', updateFurniture);
furnitureRouter.delete('/:id', deleteFurniture);

// Furniture Placements on Floors
furnitureRouter.get('/floors/:floorId/placements', getFloorPlacements);
furnitureRouter.post('/floors/:floorId/placements', createPlacement);
furnitureRouter.put('/placements/:id', updatePlacement);
furnitureRouter.delete('/placements/:id', deletePlacement);
furnitureRouter.post('/placements/:id/duplicate', duplicatePlacement);

// Spatial Validation ("¿Cabe aquí?")
furnitureRouter.post('/placements/validate', validatePlacementSpatial);
