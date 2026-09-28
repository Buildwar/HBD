import express from 'express';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: '*',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Archivos estáticos subidos
  app.use('/uploads', express.static(ENV.UPLOAD_DIR));

  // Rutas de API
  app.use('/api', apiRouter);

  // Manejador centralizado de errores
  app.use(errorHandler);

  return app;
};
