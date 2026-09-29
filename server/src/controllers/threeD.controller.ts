/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Controlador 3D (ThreeDController)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { ThreeDConversionEngine, SpatialValidationEngine, SceneLightingMode } from '@hbd/shared';
import { logger } from '../utils/logger.js';

export const getFloor3DScene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floorId } = req.params;
    const lightingMode = (req.query.lighting as SceneLightingMode) || 'day';

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
            furniture: {
              include: { category: true },
            },
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

    const conversionInput = {
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
    };

    const scene3D = ThreeDConversionEngine.convert2DTo3D(conversionInput, lightingMode);

    res.json({ success: true, data: scene3D });
  } catch (error: any) {
    logger.error('SYSTEM', `Error al generar la escena 3D: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncFurniture3DTo2D = async (req: Request, res: Response): Promise<void> => {
  try {
    const { placementId } = req.params;
    const { posX, posY, posZ, rotationDeg } = req.body;
    const userId = req.user?.id;

    const existing = await prisma.furniturePlacement.findUnique({
      where: { id: placementId },
      include: {
        floor: {
          include: {
            walls: true,
            rooms: true,
            doors: true,
            windows: true,
          },
        },
        furniture: true,
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Colocación de mueble no encontrada.' });
      return;
    }

    const updated = await prisma.furniturePlacement.update({
      where: { id: placementId },
      data: {
        ...(posX !== undefined && { posX: Number(posX) }),
        ...(posY !== undefined && { posY: Number(posY) }),
        ...(posZ !== undefined && { posZ: Number(posZ) }),
        ...(rotationDeg !== undefined && { rotationDeg: Number(rotationDeg) }),
      },
      include: {
        furniture: { include: { category: true } },
      },
    });

    // Validar espacialmente la nueva posición
    const validation = SpatialValidationEngine.validatePlacement({
      furnitureId: updated.furnitureId,
      furnitureName: updated.furniture.name,
      posX: updated.posX,
      posY: updated.posY,
      rotationDeg: updated.rotationDeg,
      widthM: updated.widthM,
      depthM: updated.depthM,
      heightM: updated.heightM,
      walls: existing.floor.walls.map((w: any) => ({
        id: w.id,
        startX: w.startX,
        startY: w.startY,
        endX: w.endX,
        endY: w.endY,
        thicknessM: w.thicknessM,
      })),
      doors: existing.floor.doors.map((d: any) => ({
        id: d.id,
        posX: d.posX,
        posY: d.posY,
        widthM: d.widthM,
      })),
      windows: existing.floor.windows.map((w: any) => ({
        id: w.id,
        posX: w.posX,
        posY: w.posY,
        widthM: w.widthM,
      })),
    });

    if (userId) {
      await logger.audit('FURNITURE', `Mueble sincronizado desde 3D: ${updated.furniture.name} (${updated.id})`, userId);
    }

    res.json({
      success: true,
      data: {
        placement: updated,
        validation,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
