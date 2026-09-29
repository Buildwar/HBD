import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

const createProjectSchema = z.object({
  name: z.string().min(2, 'El nombre del proyecto es obligatorio'),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  propertyType: z.string().optional().default('residential'),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  propertyType: z.string().optional(),
  isArchived: z.boolean().optional(),
  thumbnail: z.string().optional().nullable(),
});

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.roleName === 'ADMIN';

    // Admins pueden ver todos si lo solicitan, usuarios normales ven los suyos
    const whereClause = isAdmin && req.query.all === 'true' ? {} : { userId };

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        floors: {
          include: {
            _count: {
              select: {
                walls: true,
                rooms: true,
                furniturePlacements: true,
                floorPlans: true,
              },
            },
            rooms: {
              select: { areaM2: true },
            },
          },
        },
        _count: {
          select: {
            floors: true,
            renders: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedProjects = projects.map((p) => {
      let totalAreaM2 = 0;
      let totalRooms = 0;
      p.floors.forEach((f) => {
        totalRooms += f._count.rooms;
        f.rooms.forEach((r) => {
          totalAreaM2 += r.areaM2;
        });
      });

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        address: p.address,
        propertyType: p.propertyType,
        userId: p.userId,
        isArchived: p.isArchived,
        thumbnail: p.thumbnail,
        floorsCount: p._count.floors,
        roomsCount: totalRooms,
        totalAreaM2: Math.round(totalAreaM2 * 100) / 100,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    res.json({ success: true, data: formattedProjects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.roleName === 'ADMIN';

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        floors: {
          orderBy: { order: 'asc' },
          include: {
            floorPlans: true,
            walls: {
              include: {
                doors: true,
                windows: true,
              },
            },
            rooms: true,
            doors: true,
            windows: true,
            measurements: true,
            furniturePlacements: {
              include: { furniture: true },
            },
          },
        },
        renders: true,
      },
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado.' });
      return;
    }

    if (project.userId !== userId && !isAdmin) {
      res.status(403).json({ success: false, message: 'No tienes acceso a este proyecto.' });
      return;
    }

    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createProjectSchema.parse(req.body);
    const userId = req.user!.id;

    // Crear proyecto con una planta inicial por defecto ("Planta Principal")
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        propertyType: data.propertyType || 'residential',
        userId,
        floors: {
          create: {
            name: 'Planta Principal',
            level: 0,
            order: 0,
            heightM: 2.50,
          },
        },
      },
      include: {
        floors: true,
      },
    });

    await logger.audit('PROJECT', `Proyecto creado: ${project.name} (${project.id})`, userId);

    res.status(201).json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        address: project.address,
        propertyType: project.propertyType,
        userId: project.userId,
        isArchived: project.isArchived,
        floorsCount: project.floors.length,
        roomsCount: 0,
        totalAreaM2: 0,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        floors: project.floors,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateProjectSchema.parse(req.body);
    const userId = req.user!.id;
    const isAdmin = req.user!.roleName === 'ADMIN';

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado.' });
      return;
    }

    if (existing.userId !== userId && !isAdmin) {
      res.status(403).json({ success: false, message: 'No tienes permiso para modificar este proyecto.' });
      return;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.propertyType && { propertyType: data.propertyType }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.roleName === 'ADMIN';

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado.' });
      return;
    }

    if (existing.userId !== userId && !isAdmin) {
      res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este proyecto.' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    await logger.audit('PROJECT', `Proyecto eliminado: ${existing.name} (${id})`, userId);

    res.json({ success: true, message: 'Proyecto eliminado correctamente.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFloor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const { name, level, heightM } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'El nombre de la planta es obligatorio.' });
      return;
    }

    const highestOrder = await prisma.floor.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    });

    const newOrder = (highestOrder?.order ?? -1) + 1;

    const floor = await prisma.floor.create({
      data: {
        projectId,
        name,
        level: level !== undefined ? Number(level) : newOrder,
        order: newOrder,
        heightM: heightM ? Number(heightM) : 2.50,
      },
    });

    res.status(201).json({ success: true, data: floor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.roleName === 'ADMIN';

    const source = await prisma.project.findUnique({
      where: { id },
      include: {
        floors: {
          include: {
            rooms: true,
            walls: true,
          },
        },
      },
    });

    if (!source) {
      res.status(404).json({ success: false, message: 'Proyecto original no encontrado.' });
      return;
    }

    if (source.userId !== userId && !isAdmin) {
      res.status(403).json({ success: false, message: 'No tienes permiso para duplicar este proyecto.' });
      return;
    }

    const duplicated = await prisma.project.create({
      data: {
        name: `${source.name} (Copia)`,
        description: source.description,
        address: source.address,
        propertyType: source.propertyType,
        userId,
        floors: {
          create: source.floors.map((f) => ({
            name: f.name,
            level: f.level,
            order: f.order,
            heightM: f.heightM,
          })),
        },
      },
      include: {
        floors: true,
      },
    });

    await logger.audit('PROJECT', `Proyecto duplicado: ${duplicated.name} (${duplicated.id}) desde ${id}`, userId);

    res.status(201).json({
      success: true,
      data: {
        id: duplicated.id,
        name: duplicated.name,
        description: duplicated.description,
        address: duplicated.address,
        propertyType: duplicated.propertyType,
        userId: duplicated.userId,
        isArchived: duplicated.isArchived,
        floorsCount: duplicated.floors.length,
        roomsCount: 0,
        totalAreaM2: 0,
        createdAt: duplicated.createdAt.toISOString(),
        updatedAt: duplicated.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
