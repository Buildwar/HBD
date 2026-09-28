import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { projectRouter } from './project.routes.js';
import { usersRouter } from './users.routes.js';
import { settingsRouter } from './settings.routes.js';
import { aboutRouter } from './about.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/about', aboutRouter);

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
