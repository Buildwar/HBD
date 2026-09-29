/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Controlador de Renderizado y Escenas (RenderController)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
  SceneEngine,
  RenderEngine,
  ThreeDConversionEngine,
  STYLE_PRESETS,
  SceneDefinition,
} from '@hbd/shared';
import { logger } from '../utils/logger.js';

export const getFloorScenes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floorId } = req.params;

    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: {
        project: true,
        floorPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        walls: true,
        rooms: true,
        doors: true,
        windows: true,
        furniturePlacements: {
          include: {
            furniture: { include: { category: true } },
          },
        },
      },
    });

    if (!floor) {
      res.status(404).json({ success: false, message: 'Planta no encontrada.' });
      return;
    }

    const latestPlan = floor.floorPlans[0];
    const pixelsPerMeter = latestPlan?.scaleFactor || 50;

    const scene3D = ThreeDConversionEngine.convert2DTo3D(
      {
        floorId: floor.id,
        projectName: floor.project.name,
        floorName: floor.name,
        floorHeightM: floor.heightM,
        pixelsPerMeter,
        walls: floor.walls.map((w: any) => ({
          id: w.id,
          startX: w.startX,
          startY: w.startY,
          endX: w.endX,
          endY: w.endY,
          thicknessM: w.thicknessM,
          heightM: w.heightM,
          wallType: w.wallType,
        })),
        rooms: floor.rooms.map((r: any) => ({
          id: r.id,
          name: r.name,
          roomType: r.roomType || undefined,
          polygon: (r.polygon as any) || [],
          areaM2: r.areaM2,
          heightM: r.heightM,
        })),
        doors: floor.doors.map((d: any) => ({
          id: d.id,
          wallId: d.wallId,
          posX: d.posX,
          posY: d.posY,
          widthM: d.widthM,
          heightM: d.heightM,
          rotationDeg: d.rotationDeg,
          isOpen: d.isOpen,
        })),
        windows: floor.windows.map((w: any) => ({
          id: w.id,
          wallId: w.wallId,
          posX: w.posX,
          posY: w.posY,
          widthM: w.widthM,
          heightM: w.heightM,
          elevationM: w.elevationM,
          rotationDeg: w.rotationDeg,
        })),
        furniturePlacements: floor.furniturePlacements.map((fp: any) => ({
          id: fp.id,
          furnitureId: fp.furnitureId,
          name: fp.furniture.name,
          categorySlug: fp.furniture.category.slug,
          posX: fp.posX,
          posY: fp.posY,
          posZ: fp.posZ,
          rotationDeg: fp.rotationDeg,
          widthM: fp.widthM,
          depthM: fp.depthM,
          heightM: fp.heightM,
          model3dUrl: fp.furniture.model3dUrl || undefined,
        })),
      },
      'day'
    );

    // Generar escenas predeterminadas automáticas
    const scenes: SceneDefinition[] = [];

    // 1. Escena General
    scenes.push(SceneEngine.createDefaultScene(scene3D, 'Vista General de Día'));

    // 2. Escena Atardecer / Noche
    const nightScene = SceneEngine.createDefaultScene(scene3D, 'Ambiente Cálido de Noche');
    nightScene.lighting.mode = 'night';
    nightScene.lighting.timeOfDay = '20:00';
    nightScene.lighting.ambientColorHex = '#0f172a';
    nightScene.lighting.ambientIntensity = 0.3;
    scenes.push(nightScene);

    // 3. Escenas automáticas por cada habitación
    (scene3D.floors || []).forEach((room) => {
      scenes.push(SceneEngine.createDefaultScene(scene3D, `Perspectiva ${room.name}`, room.id));
    });

    res.json({
      success: true,
      data: {
        scenes,
        scene3D,
        presets: STYLE_PRESETS,
      },
    });
  } catch (error: any) {
    logger.error('SYSTEM', `Error al cargar escenas: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectRenders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const renders = await prisma.render.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: renders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveRenderResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, name, imageUrl, resolution, quality, metadata } = req.body;
    const userId = req.user?.id;

    const created = await prisma.render.create({
      data: {
        projectId,
        name: name || `Render ${new Date().toLocaleDateString('es-ES')}`,
        imageUrl,
        status: 'COMPLETED',
      },
    });

    if (userId) {
      await logger.audit('PROJECT', `Render generado y guardado: ${created.name} (${created.id})`, userId);
    }

    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRender = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.render.delete({ where: { id } });

    res.json({ success: true, message: 'Render eliminado con éxito.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStylePresets = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: STYLE_PRESETS });
};
