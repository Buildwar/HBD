import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { projectRouter } from './project.routes.js';
import { usersRouter } from './users.routes.js';
import { settingsRouter } from './settings.routes.js';
import { aboutRouter } from './about.routes.js';
import floorplanRouter from './floorplan.routes.js';
import { furnitureRouter } from './furniture.routes.js';
import threeDRouter from './threeD.routes.js';
import renderRouter from './render.routes.js';
import { aiDesignRoutes } from './aiDesign.routes.js';
import aiVisionRoutes from './aiVision.routes.js';
import constructionRouter from './construction.routes.js';
import spaceRouter from './space.routes.js';
import scenarioRouter from './scenario.routes.js';
import optimizationRouter from './optimization.routes.js';
import { documentRouter } from './document.routes.js';
import { executionRouter } from './execution.routes.js';
import { productRouter } from './product.routes.js';
import { financialRouter } from './financial.routes.js';
import { procurementRouter } from './procurement.routes.js';
import { retailCatalogRouter } from './retailCatalog.routes.js';
import { technicalInfrastructureRouter } from './technicalInfrastructure.routes.js';
import arVisualizationRouter from './arVisualization.routes.js';
import propertyRouter from './property.routes.js';
import copilotRouter from './copilot.routes.js';

export const apiRouter = Router();

// Endpoint público de verificación de salud
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/ai', copilotRouter);
apiRouter.use('/properties', propertyRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/about', aboutRouter);
apiRouter.use('/furniture', furnitureRouter);
apiRouter.use('/3d', threeDRouter);
apiRouter.use('/render', renderRouter);
apiRouter.use('/ai/design', aiDesignRoutes);
apiRouter.use('/ai/vision', aiVisionRoutes);
apiRouter.use('/construction', constructionRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/catalog', retailCatalogRouter);
apiRouter.use('/technical', technicalInfrastructureRouter);
apiRouter.use('/ar', arVisualizationRouter);
apiRouter.use('/', copilotRouter);
apiRouter.use('/', propertyRouter);
apiRouter.use('/', arVisualizationRouter);
apiRouter.use('/', technicalInfrastructureRouter);
apiRouter.use('/', procurementRouter);
apiRouter.use('/', financialRouter);
apiRouter.use('/', spaceRouter);
apiRouter.use('/', scenarioRouter);
apiRouter.use('/', optimizationRouter);
apiRouter.use('/', documentRouter);
apiRouter.use('/', executionRouter);
apiRouter.use('/', furnitureRouter);
apiRouter.use('/', floorplanRouter);



