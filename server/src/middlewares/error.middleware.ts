import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  logger.error('SYSTEM', `Error en endpoint ${req.method} ${req.url}: ${err.message}`, err);

  const statusCode = err.statusCode || 500;
  const userMessage = err.isCustom
    ? err.message
    : 'Ha ocurrido un error inesperado al procesar la solicitud.';

  res.status(statusCode).json({
    success: false,
    message: userMessage,
    ...(process.env.NODE_ENV === 'development' && { errorDetails: err.message }),
  });
};
