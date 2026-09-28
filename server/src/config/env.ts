import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CLIENT_PORT: parseInt(process.env.CLIENT_PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://hbd_user:hbd_secure_password@localhost:5432/hbd_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'hbd_default_super_secret_jwt_key_development_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  UPLOAD_DIR: process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(process.cwd(), '../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  
  // Metadatos de la aplicación
  APP_NAME: process.env.APP_NAME || 'HBD — Home Board Designer',
  APP_TAGLINE: process.env.APP_TAGLINE || 'Diseña, mide y visualiza tu vivienda.',
  APP_AUTHOR: process.env.APP_AUTHOR || 'apalma',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  APP_COPYRIGHT: process.env.APP_COPYRIGHT || '© 2026 HBD — Home Board Designer',

  // Semilla inicial
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@hbd.local',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin1234!',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Administrador del Sistema',
};
