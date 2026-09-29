import dotenv from 'dotenv';
import path from 'path';
import { APP_METADATA } from '@hbd/shared';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CLIENT_PORT: parseInt(process.env.CLIENT_PORT || '3003', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://hbd_user:hbd_secure_password@localhost:5432/hbd_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'hbd_default_super_secret_jwt_key_development_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3003',
  UPLOAD_DIR: process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(process.cwd(), '../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  
  // Metadatos centralizados de la aplicación
  APP_NAME: process.env.APP_NAME || APP_METADATA.displayName,
  APP_TAGLINE: process.env.APP_TAGLINE || APP_METADATA.tagline,
  APP_AUTHOR: process.env.APP_AUTHOR || APP_METADATA.author,
  APP_VERSION: process.env.APP_VERSION || APP_METADATA.version,
  APP_COPYRIGHT: process.env.APP_COPYRIGHT || APP_METADATA.copyright,

  // Semilla inicial
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@hbd.local',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin_HBD',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Administrador del Sistema',

  // Configuración de IA de Diseño (V8.0.0)
  AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4o',

  // Configuración de IA de Visión Artificial (V9.0.0)
  AI_VISION_PROVIDER: process.env.AI_VISION_PROVIDER || 'mock',
  AI_VISION_API_KEY: process.env.AI_VISION_API_KEY || '',
  AI_VISION_MODEL: process.env.AI_VISION_MODEL || 'gpt-4o',
};
