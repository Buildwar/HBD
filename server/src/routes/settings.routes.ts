import { Router } from 'express';
import { getPublicSettings, getAllSettings, updateSetting } from '../controllers/settings.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

export const settingsRouter = Router();

settingsRouter.get('/public', getPublicSettings);
settingsRouter.get('/', authenticateJwt, requireRole(['ADMIN']), getAllSettings);
settingsRouter.post('/:key', authenticateJwt, requireRole(['ADMIN']), updateSetting);
