import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { SettingsService } from '../services/settings.service.js';

// --- Backwards compatible generic settings endpoints ---

export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.appSetting.findMany({
      where: { isPublic: true },
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({ success: true, data: settingsMap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.appSetting.findMany({
      orderBy: { key: 'asc' },
    });
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value, description, isPublic } = req.body;

    const setting = await prisma.appSetting.upsert({
      where: { key },
      update: {
        value,
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
      create: {
        key,
        value,
        description,
        isPublic: isPublic ?? false,
      },
    });

    await logger.audit('SYSTEM', `Ajuste de sistema actualizado: ${key}`, req.user?.id);

    res.json({ success: true, data: setting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- V19.0.0 Modular Settings Endpoints ---

export const getGeneralSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.getGeneralSettings();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGeneralSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.updateGeneralSettings(req.body, req.user?.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.getProjectSettings();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProjectSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.updateProjectSettings(req.body, req.user?.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAISettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.getAISettings();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAISettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.updateAISettings(req.body, req.user?.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStorageSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.getStorageSummary();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cleanupStorage = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await SettingsService.cleanupScratchStorage(req.user?.id);
    res.json({ success: true, data: result, message: `Se han eliminado ${result.cleanedFiles} archivos temporales.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSecuritySettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.getSecuritySettings();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSecuritySettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.updateSecuritySettings(req.body, req.user?.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const data = await SettingsService.getAuditLogs(limit);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSystemHealth = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.getSystemHealth();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const runSystemDiagnostics = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await SettingsService.runSystemDiagnostics(req.user?.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetSectionSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const success = await SettingsService.resetSection(section, req.user?.id);
    if (success) {
      res.json({ success: true, message: `Ajustes de la sección '${section}' restablecidos con éxito.` });
    } else {
      res.status(400).json({ success: false, message: `Sección '${section}' no válida para restablecimiento.` });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
