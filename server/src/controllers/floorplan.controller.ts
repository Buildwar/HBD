/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * FloorPlan Controller
 * 
 * Endpoints for:
 * - Uploading architectural floor plans (PDF, PNG, JPG, JPEG)
 * - Triggering modular analysis pipeline (walls, rooms, doors, windows, scale)
 * - Calibrating scale factor (pixels per meter)
 * - Confirming & saving digital geometry into the database
 * - Real-time 2D geometry updates
 */

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { FloorplanEngineService } from '../services/floorplan/floorplanEngine.service.js';
import { FloorPlanStatus, WallType, GeometryEngine } from '@hbd/shared';

export const uploadFloorPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, floorId } = req.params;
    const userId = req.user!.id;

    // Verify floor and project ownership
    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: { project: true },
    });

    if (!floor || floor.projectId !== projectId) {
      res.status(404).json({ success: false, message: 'Planta no encontrada en este proyecto.' });
      return;
    }

    if (floor.project.userId !== userId && req.user!.roleName !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'No tienes permisos para modificar este proyecto.' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No se ha proporcionado ningún archivo.' });
      return;
    }

    const fileUrl = `/uploads/${file.filename}`;

    const floorPlan = await prisma.floorPlan.create({
      data: {
        floorId,
        originalFileName: file.originalname,
        fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        status: FloorPlanStatus.UPLOADED,
      },
    });

    await logger.audit(
      'PLAN',
      `Plano subido para planta ${floor.name}: ${file.originalname}`,
      userId
    );

    res.status(201).json({
      success: true,
      data: floorPlan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFloorPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id },
      include: {
        floor: {
          include: {
            project: true,
            walls: { include: { doors: true, windows: true } },
            rooms: true,
            doors: true,
            windows: true,
            measurements: true,
          },
        },
      },
    });

    if (!floorPlan) {
      res.status(404).json({ success: false, message: 'Plano no encontrado.' });
      return;
    }

    if (floorPlan.floor.project.userId !== userId && req.user!.roleName !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Acceso no autorizado a este plano.' });
      return;
    }

    res.json({ success: true, data: floorPlan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const analyzeFloorPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { manualScale } = req.body;
    const userId = req.user!.id;

    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id },
      include: { floor: { include: { project: true } } },
    });

    if (!floorPlan) {
      res.status(404).json({ success: false, message: 'Plano no encontrado.' });
      return;
    }

    if (floorPlan.floor.project.userId !== userId && req.user!.roleName !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      return;
    }

    // Set status to PROCESSING
    await prisma.floorPlan.update({
      where: { id },
      data: { status: FloorPlanStatus.PROCESSING },
    });

    // Run modular analysis pipeline
    const localFilePath = path.resolve(process.cwd(), `.${floorPlan.fileUrl}`);
    const analysisResult = await FloorplanEngineService.analyzePlan(
      localFilePath,
      floorPlan.originalFileName,
      floorPlan.mimeType,
      manualScale
    );

    // Save analysis output in DB
    const updatedPlan = await prisma.floorPlan.update({
      where: { id },
      data: {
        status: FloorPlanStatus.ANALYZED,
        widthPx: analysisResult.meta.widthPx,
        heightPx: analysisResult.meta.heightPx,
        scaleFactor: analysisResult.scale.scaleFactor,
        detectedElementsSummary: analysisResult.validation.elementsSummary as any,
        analysisData: analysisResult as any,
      },
    });

    await logger.audit(
      'PLAN',
      `Plano analizado (${id}): ${analysisResult.walls.length} paredes, ${analysisResult.rooms.length} habitaciones detectadas`,
      userId
    );

    res.json({
      success: true,
      data: {
        floorPlan: updatedPlan,
        analysis: analysisResult,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const calibrateScale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { p1, p2, realMeters } = req.body;
    const userId = req.user!.id;

    if (!p1 || !p2 || !realMeters || realMeters <= 0) {
      res.status(400).json({ success: false, message: 'Se requieren 2 puntos de referencia y la distancia en metros.' });
      return;
    }

    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id },
      include: { floor: { include: { project: true } } },
    });

    if (!floorPlan) {
      res.status(404).json({ success: false, message: 'Plano no encontrado.' });
      return;
    }

    const pixelDist = GeometryEngine.calculateDistance(p1, p2);
    const newScaleFactor = GeometryEngine.calculateScaleFactor(pixelDist, realMeters);

    const updatedPlan = await prisma.floorPlan.update({
      where: { id },
      data: {
        scaleFactor: newScaleFactor,
      },
    });

    res.json({
      success: true,
      data: {
        floorPlan: updatedPlan,
        scaleFactor: newScaleFactor,
        pixelDistance: pixelDist,
        realMeters,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmAndImportGeometry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { walls, rooms, doors, windows } = req.body;
    const userId = req.user!.id;

    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id },
      include: { floor: { include: { project: true } } },
    });

    if (!floorPlan) {
      res.status(404).json({ success: false, message: 'Plano no encontrado.' });
      return;
    }

    const floorId = floorPlan.floorId;

    // Use transaction to atomically replace existing geometry for this floor
    await prisma.$transaction(async (tx) => {
      // Clean existing items
      await tx.door.deleteMany({ where: { floorId } });
      await tx.window.deleteMany({ where: { floorId } });
      await tx.room.deleteMany({ where: { floorId } });
      await tx.wall.deleteMany({ where: { floorId } });

      // Create walls
      const wallIdMap = new Map<string, string>();
      if (Array.isArray(walls)) {
        for (const w of walls) {
          const createdWall = await tx.wall.create({
            data: {
              floorId,
              startX: Number(w.startX),
              startY: Number(w.startY),
              endX: Number(w.endX),
              endY: Number(w.endY),
              thicknessM: Number(w.thicknessM) || 0.15,
              heightM: Number(w.heightM) || 2.50,
              wallType: (w.wallType as WallType) || WallType.INTERIOR,
            },
          });
          if (w.id) {
            wallIdMap.set(w.id, createdWall.id);
          }
        }
      }

      // Create rooms
      if (Array.isArray(rooms)) {
        for (const r of rooms) {
          await tx.room.create({
            data: {
              floorId,
              name: r.name || 'Habitación',
              roomType: r.roomType || 'ROOM',
              polygon: r.polygon,
              areaM2: Number(r.areaM2) || 0,
              widthM: r.widthM ? Number(r.widthM) : null,
              lengthM: r.lengthM ? Number(r.lengthM) : null,
              heightM: Number(r.heightM) || 2.50,
              color: r.color || '#3b82f6',
            },
          });
        }
      }

      // Create doors
      if (Array.isArray(doors)) {
        const firstWall = await tx.wall.findFirst({ where: { floorId } });
        for (const d of doors) {
          const targetWallId = wallIdMap.get(d.wallId) || firstWall?.id;
          if (targetWallId) {
            await tx.door.create({
              data: {
                floorId,
                wallId: targetWallId,
                posX: Number(d.posX),
                posY: Number(d.posY),
                widthM: Number(d.widthM) || 0.80,
                heightM: Number(d.heightM) || 2.10,
                rotationDeg: Number(d.rotationDeg) || 0,
                swingDirection: d.swingDirection || 'INWARD_RIGHT',
              },
            });
          }
        }
      }

      // Create windows
      if (Array.isArray(windows)) {
        const firstWall = await tx.wall.findFirst({ where: { floorId } });
        for (const win of windows) {
          const targetWallId = wallIdMap.get(win.wallId) || firstWall?.id;
          if (targetWallId) {
            await tx.window.create({
              data: {
                floorId,
                wallId: targetWallId,
                posX: Number(win.posX),
                posY: Number(win.posY),
                widthM: Number(win.widthM) || 1.20,
                heightM: Number(win.heightM) || 1.20,
                elevationM: Number(win.elevationM) || 0.90,
                rotationDeg: Number(win.rotationDeg) || 0,
              },
            });
          }
        }
      }

      // Mark floor plan as VALIDATED
      await tx.floorPlan.update({
        where: { id },
        data: { status: FloorPlanStatus.VALIDATED },
      });
    });

    await logger.audit(
      'PLAN',
      `Geometría digital confirmada para plano ${id} (${walls?.length || 0} paredes)`,
      userId
    );

    res.json({
      success: true,
      message: 'Plano digital confirmado e importado correctamente.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveFloorGeometry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floorId } = req.params;
    const { walls, rooms, doors, windows, measurements } = req.body;
    const userId = req.user!.id;

    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: { project: true },
    });

    if (!floor) {
      res.status(404).json({ success: false, message: 'Planta no encontrada.' });
      return;
    }

    if (floor.project.userId !== userId && req.user!.roleName !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.measurement.deleteMany({ where: { floorId } });
      await tx.door.deleteMany({ where: { floorId } });
      await tx.window.deleteMany({ where: { floorId } });
      await tx.room.deleteMany({ where: { floorId } });
      await tx.wall.deleteMany({ where: { floorId } });

      const wallIdMap = new Map<string, string>();
      if (Array.isArray(walls)) {
        for (const w of walls) {
          const createdWall = await tx.wall.create({
            data: {
              floorId,
              startX: Number(w.startX),
              startY: Number(w.startY),
              endX: Number(w.endX),
              endY: Number(w.endY),
              thicknessM: Number(w.thicknessM) || 0.15,
              heightM: Number(w.heightM) || 2.50,
              wallType: (w.wallType as WallType) || WallType.INTERIOR,
            },
          });
          if (w.id) wallIdMap.set(w.id, createdWall.id);
        }
      }

      if (Array.isArray(rooms)) {
        for (const r of rooms) {
          await tx.room.create({
            data: {
              floorId,
              name: r.name || 'Habitación',
              roomType: r.roomType || 'ROOM',
              polygon: r.polygon,
              areaM2: Number(r.areaM2) || 0,
              widthM: r.widthM ? Number(r.widthM) : null,
              lengthM: r.lengthM ? Number(r.lengthM) : null,
              heightM: Number(r.heightM) || 2.50,
              color: r.color || '#3b82f6',
            },
          });
        }
      }

      const firstWall = await tx.wall.findFirst({ where: { floorId } });

      if (Array.isArray(doors)) {
        for (const d of doors) {
          const targetWallId = wallIdMap.get(d.wallId) || firstWall?.id;
          if (targetWallId) {
            await tx.door.create({
              data: {
                floorId,
                wallId: targetWallId,
                posX: Number(d.posX),
                posY: Number(d.posY),
                widthM: Number(d.widthM) || 0.80,
                heightM: Number(d.heightM) || 2.10,
                rotationDeg: Number(d.rotationDeg) || 0,
                swingDirection: d.swingDirection || 'INWARD_RIGHT',
              },
            });
          }
        }
      }

      if (Array.isArray(windows)) {
        for (const win of windows) {
          const targetWallId = wallIdMap.get(win.wallId) || firstWall?.id;
          if (targetWallId) {
            await tx.window.create({
              data: {
                floorId,
                wallId: targetWallId,
                posX: Number(win.posX),
                posY: Number(win.posY),
                widthM: Number(win.widthM) || 1.20,
                heightM: Number(win.heightM) || 1.20,
                elevationM: Number(win.elevationM) || 0.90,
                rotationDeg: Number(win.rotationDeg) || 0,
              },
            });
          }
        }
      }

      if (Array.isArray(measurements)) {
        for (const m of measurements) {
          await tx.measurement.create({
            data: {
              floorId,
              startX: Number(m.startX),
              startY: Number(m.startY),
              endX: Number(m.endX),
              endY: Number(m.endY),
              distanceM: Number(m.distanceM) || 0,
              label: m.label || null,
            },
          });
        }
      }
    });

    res.json({ success: true, message: 'Geometría 2D guardada correctamente.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
