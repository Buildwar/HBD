/**
 * Property Intelligence Routes (Phase V23 / v1.23.0)
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller.js';

export const propertyRouter = Router();

// Property CRUD
propertyRouter.get('/', PropertyController.getProperties);
propertyRouter.post('/', PropertyController.createProperty);
propertyRouter.get('/:id', PropertyController.getPropertyById);
propertyRouter.put('/:id', PropertyController.updateProperty);
propertyRouter.delete('/:id', PropertyController.deleteProperty);

// Project Link / Unlink
propertyRouter.post('/:id/link-project', PropertyController.linkProject);
propertyRouter.post('/:id/unlink-project', PropertyController.unlinkProject);

// Analysis & Intelligence Report
propertyRouter.get('/:id/analysis', PropertyController.getAnalysisReport);
propertyRouter.get('/:id/summary', PropertyController.getAnalysisReport);
propertyRouter.get('/:id/data-quality', PropertyController.getDataQuality);

// Opportunities
propertyRouter.get('/:id/opportunities', PropertyController.getOpportunities);
propertyRouter.post('/:id/opportunities', PropertyController.generateOpportunities);

// Risks
propertyRouter.get('/:id/risks', PropertyController.getRisks);
propertyRouter.post('/:id/risks', PropertyController.generateRisks);

// Snapshots
propertyRouter.get('/:id/snapshots', PropertyController.getSnapshots);
propertyRouter.post('/:id/snapshots', PropertyController.createSnapshot);
propertyRouter.get('/:id/snapshots/compare', PropertyController.compareSnapshots);

export default propertyRouter;
