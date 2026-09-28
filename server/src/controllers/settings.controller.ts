import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

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
