import { Router } from 'express';
import {
  getPublicSettings,
  getAllSettings,
  updateSetting,
  getGeneralSettings,
  updateGeneralSettings,
  getProjectSettings,
  updateProjectSettings,
  getAISettings,
  updateAISettings,
  getStorageSummary,
  cleanupStorage,
  getSecuritySettings,
  updateSecuritySettings,
  getAuditLogs,
  getSystemHealth,
  runSystemDiagnostics,
  resetSectionSettings,
} from '../controllers/settings.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

export const settingsRouter = Router();

// Public configuration
settingsRouter.get('/public', getPublicSettings);

// Authenticated general endpoints
settingsRouter.get('/general', authenticateJwt, getGeneralSettings);
settingsRouter.patch('/general', authenticateJwt, requireRole(['ADMIN']), updateGeneralSettings);

settingsRouter.get('/projects', authenticateJwt, getProjectSettings);
settingsRouter.patch('/projects', authenticateJwt, requireRole(['ADMIN', 'DESIGNER']), updateProjectSettings);

settingsRouter.get('/ai', authenticateJwt, getAISettings);
settingsRouter.patch('/ai', authenticateJwt, requireRole(['ADMIN']), updateAISettings);

settingsRouter.get('/storage', authenticateJwt, requireRole(['ADMIN']), getStorageSummary);
settingsRouter.post('/storage/cleanup', authenticateJwt, requireRole(['ADMIN']), cleanupStorage);

settingsRouter.get('/security', authenticateJwt, requireRole(['ADMIN']), getSecuritySettings);
settingsRouter.patch('/security', authenticateJwt, requireRole(['ADMIN']), updateSecuritySettings);

settingsRouter.get('/audit-logs', authenticateJwt, requireRole(['ADMIN']), getAuditLogs);

settingsRouter.get('/health', authenticateJwt, getSystemHealth);
settingsRouter.post('/diagnostics', authenticateJwt, requireRole(['ADMIN']), runSystemDiagnostics);

settingsRouter.post('/reset/:section', authenticateJwt, requireRole(['ADMIN']), resetSectionSettings);

// Generic key-value fallback endpoints
settingsRouter.get('/', authenticateJwt, requireRole(['ADMIN']), getAllSettings);
settingsRouter.post('/:key', authenticateJwt, requireRole(['ADMIN']), updateSetting);
