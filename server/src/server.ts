import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/prisma.js';

const app = createApp();

const startServer = async () => {
  try {
    // Probar conexión a la base de datos de manera resiliente
    try {
      await prisma.$connect();
      logger.info('SYSTEM', 'Conexión a PostgreSQL establecida con éxito.');
    } catch (dbErr: any) {
      logger.warn('SYSTEM', `PostgreSQL aún no disponible o en inicialización: ${dbErr.message}`);
    }

    app.listen(ENV.PORT, () => {
      logger.info('SYSTEM', `Servidor HBD ejecutándose en el puerto ${ENV.PORT} (${ENV.NODE_ENV})`);
      logger.info('SYSTEM', `Versión: ${ENV.APP_VERSION} | Autor: ${ENV.APP_AUTHOR}`);
    });
  } catch (error) {
    logger.error('SYSTEM', 'Error al iniciar el servidor HBD', error);
    process.exit(1);
  }
};

startServer();
