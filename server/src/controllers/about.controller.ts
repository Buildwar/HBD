import { Request, Response } from 'express';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';

export const getAboutInfo = async (_req: Request, res: Response): Promise<void> => {
  try {
    let dbConnected = true;
    let usersCount = 0;
    let projectsCount = 0;
    let floorPlansCount = 0;

    try {
      [usersCount, projectsCount, floorPlansCount] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.floorPlan.count(),
      ]);
    } catch {
      dbConnected = false;
    }

    res.json({
      success: true,
      data: {
        appName: ENV.APP_NAME,
        tagline: ENV.APP_TAGLINE,
        author: ENV.APP_AUTHOR,
        version: ENV.APP_VERSION,
        copyright: ENV.APP_COPYRIGHT,
        environment: ENV.NODE_ENV,
        uptimeSeconds: Math.floor(process.uptime()),
        databaseConnected: dbConnected,
        stats: {
          usersCount,
          projectsCount,
          floorPlansCount,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
