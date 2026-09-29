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

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/about', aboutRouter);
apiRouter.use('/furniture', furnitureRouter);
apiRouter.use('/3d', threeDRouter);
apiRouter.use('/render', renderRouter);
apiRouter.use('/ai/design', aiDesignRoutes);
apiRouter.use('/ai/vision', aiVisionRoutes);
apiRouter.use('/', furnitureRouter);
apiRouter.use('/', floorplanRouter);

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
