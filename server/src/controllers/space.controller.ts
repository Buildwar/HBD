import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  GeometricMetricsEngine,
  SpatialRulesEngine,
  FunctionalZoneType,
  ProjectIntelligenceDto,
  SpaceDto,
  FunctionalZoneDto,
  PRO_VALIDATION_NOTICE,
} from '@hbd/shared';

const createSpaceSchema = z.object({
  name: z.string().min(1, 'El nombre del espacio es obligatorio'),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  polygon: z.array(z.object({ x: z.number(), y: z.number() })).optional().nullable(),
  heightM: z.number().min(0.5).default(2.50),
  color: z.string().optional().default('#10b981'),
  roomIds: z.array(z.string()).optional().default([]),
});

const updateSpaceSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  polygon: z.array(z.object({ x: z.number(), y: z.number() })).optional().nullable(),
  heightM: z.number().min(0.5).optional(),
  color: z.string().optional(),
  roomIds: z.array(z.string()).optional(),
});

const createZoneSchema = z.object({
  name: z.string().min(1, 'El nombre de la zona es obligatorio'),
  type: z.enum([
    'LIVING',
    'DINING',
    'KITCHEN',
    'BEDROOM',
    'BATHROOM',
    'WORKSPACE',
    'CIRCULATION',
    'STORAGE',
    'TERRACE',
    'OTHER',
  ]).default('OTHER'),
  polygon: z.array(z.object({ x: z.number(), y: z.number() })).optional().nullable(),
  areaM2: z.number().min(0).default(0),
  metadata: z.record(z.any()).optional().default({}),
});

/**
 * Obtiene todos los espacios y zonas funcionales de una planta.
 */
export const getSpacesByFloor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floorId } = req.params;

    const spaces = await prisma.space.findMany({
      where: { floorId },
      include: {
        functionalZones: { orderBy: { createdAt: 'asc' } },
        rooms: { select: { id: true, name: true, areaM2: true, roomType: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formattedSpaces: SpaceDto[] = spaces.map((space) => {
      const polygon = (space.polygon as any) || [];
      const metrics = GeometricMetricsEngine.calculateSpaceMetrics({
        name: space.name,
        polygon,
        heightM: space.heightM,
      });

      return {
        id: space.id,
        floorId: space.floorId,
        name: space.name,
        roomType: space.type,
        polygon,
        metrics,
        heightM: space.heightM,
        color: space.color,
        functionalZones: space.functionalZones.map((z) => ({
          id: z.id,
          parentSpaceId: z.spaceId,
          name: z.name,
          type: z.type as FunctionalZoneType,
          polygon: (z.polygon as any) || null,
          areaM2: {
            value: z.areaM2,
            unit: 'm²',
            source: 'GEOMETRY_CALCULATED',
          },
        })),
        roomIds: space.rooms.map((r) => r.id),
        createdAt: space.createdAt.toISOString(),
        updatedAt: space.updatedAt.toISOString(),
      };
    });

    res.json({ success: true, data: formattedSpaces });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al obtener espacios de la planta:', error);
    res.status(500).json({ success: false, message: 'Error interno al consultar espacios' });
  }
};

/**
 * Crea un nuevo espacio funcional.
 */
export const createSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floorId } = req.params;
    const parse = createSpaceSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, errors: parse.error.format() });
      return;
    }

    const polygon = parse.data.polygon || [];
    const metrics = GeometricMetricsEngine.calculateSpaceMetrics({
      name: parse.data.name,
      polygon,
      heightM: parse.data.heightM,
    });

    const space = await prisma.space.create({
      data: {
        floorId,
        name: parse.data.name,
        type: parse.data.type || null,
        description: parse.data.description || null,
        polygon: polygon as any,
        areaM2: metrics.usableAreaM2.value,
        heightM: parse.data.heightM,
        color: parse.data.color || '#10b981',
      },
      include: { functionalZones: true, rooms: true },
    });

    // Si se especificaron habitaciones para asociar a este espacio
    if (parse.data.roomIds && parse.data.roomIds.length > 0) {
      await prisma.room.updateMany({
        where: { id: { in: parse.data.roomIds } },
        data: { spaceId: space.id },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        ...space,
        metrics,
      },
    });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al crear espacio:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear el espacio' });
  }
};

/**
 * Actualiza un espacio funcional.
 */
export const updateSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { spaceId } = req.params;
    const parse = updateSpaceSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, errors: parse.error.format() });
      return;
    }

    const current = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!current) {
      res.status(404).json({ success: false, message: 'Espacio no encontrado' });
      return;
    }

    const polygon = parse.data.polygon !== undefined ? parse.data.polygon || [] : ((current.polygon as any) || []);
    const heightM = parse.data.heightM !== undefined ? parse.data.heightM : current.heightM;
    const metrics = GeometricMetricsEngine.calculateSpaceMetrics({
      name: parse.data.name || current.name,
      polygon,
      heightM,
    });

    const space = await prisma.space.update({
      where: { id: spaceId },
      data: {
        name: parse.data.name || undefined,
        type: parse.data.type !== undefined ? parse.data.type : undefined,
        description: parse.data.description !== undefined ? parse.data.description : undefined,
        polygon: parse.data.polygon !== undefined ? (polygon as any) : undefined,
        areaM2: metrics.usableAreaM2.value,
        heightM: parse.data.heightM || undefined,
        color: parse.data.color || undefined,
      },
      include: { functionalZones: true, rooms: true },
    });

    if (parse.data.roomIds !== undefined) {
      // Desasociar habitaciones no presentes
      await prisma.room.updateMany({
        where: { spaceId, id: { notIn: parse.data.roomIds } },
        data: { spaceId: null },
      });
      // Asociar nuevas
      if (parse.data.roomIds.length > 0) {
        await prisma.room.updateMany({
          where: { id: { in: parse.data.roomIds } },
          data: { spaceId },
        });
      }
    }

    res.json({ success: true, data: { ...space, metrics } });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al actualizar espacio:', error);
    res.status(500).json({ success: false, message: 'Error interno al actualizar el espacio' });
  }
};

/**
 * Elimina un espacio (manteniendo las habitaciones intactas mediante set null).
 */
export const deleteSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { spaceId } = req.params;
    await prisma.space.delete({ where: { id: spaceId } });
    res.json({ success: true, message: 'Espacio eliminado correctamente' });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al eliminar espacio:', error);
    res.status(500).json({ success: false, message: 'Error interno al eliminar el espacio' });
  }
};

/**
 * Crea una zona funcional dentro de un espacio.
 */
export const createFunctionalZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { spaceId } = req.params;
    const parse = createZoneSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, errors: parse.error.format() });
      return;
    }

    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      res.status(404).json({ success: false, message: 'Espacio padre no encontrado' });
      return;
    }

    let calculatedArea = parse.data.areaM2;
    if (parse.data.polygon && parse.data.polygon.length >= 3) {
      const pMetrics = GeometricMetricsEngine.calculateSpaceMetrics({
        polygon: parse.data.polygon,
      });
      calculatedArea = pMetrics.usableAreaM2.value;
    }

    const zone = await prisma.functionalZone.create({
      data: {
        spaceId,
        name: parse.data.name,
        type: parse.data.type as any,
        polygon: (parse.data.polygon as any) || null,
        areaM2: calculatedArea,
        metadata: parse.data.metadata || {},
      },
    });

    res.status(201).json({ success: true, data: zone });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al crear zona funcional:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear zona funcional' });
  }
};

/**
 * Actualiza una zona funcional.
 */
export const updateFunctionalZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zoneId } = req.params;
    const { name, type, polygon, areaM2, metadata } = req.body;

    const zone = await prisma.functionalZone.update({
      where: { id: zoneId },
      data: {
        name: name || undefined,
        type: type || undefined,
        polygon: polygon !== undefined ? polygon : undefined,
        areaM2: areaM2 !== undefined ? areaM2 : undefined,
        metadata: metadata !== undefined ? metadata : undefined,
      },
    });

    res.json({ success: true, data: zone });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al actualizar zona funcional:', error);
    res.status(500).json({ success: false, message: 'Error interno al actualizar zona' });
  }
};

/**
 * Elimina una zona funcional.
 */
export const deleteFunctionalZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zoneId } = req.params;
    await prisma.functionalZone.delete({ where: { id: zoneId } });
    res.json({ success: true, message: 'Zona funcional eliminada correctamente' });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al eliminar zona funcional:', error);
    res.status(500).json({ success: false, message: 'Error interno al eliminar zona' });
  }
};

/**
 * Genera el análisis integral de inteligencia del proyecto (Project Intelligence V10/V11).
 */
export const getProjectIntelligence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        floors: {
          include: {
            rooms: true,
            spaces: {
              include: { functionalZones: true, rooms: true },
            },
            walls: true,
            doors: true,
            windows: true,
            furniturePlacements: true,
          },
        },
        constructionProject: {
          include: {
            items: true,
            phases: { include: { tasks: true } },
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
      return;
    }

    let totalGrossAreaM2 = 0;
    let totalUsableAreaM2 = 0;
    let totalBuiltAreaM2 = 0;
    let totalVolumeM3 = 0;
    let totalPerimeterM = 0;
    let totalOpeningsAreaM2 = 0;
    let roomsCount = 0;
    let spacesCount = 0;
    let functionalZonesCount = 0;

    const allSpatialRuleResults: any[] = [];
    const proValidationNotes: string[] = [];
    const formattedSpaces: SpaceDto[] = [];

    for (const floor of project.floors) {
      roomsCount += floor.rooms.length;
      spacesCount += floor.spaces.length;

      // Calcular métricas de habitaciones existentes (retrocompatibilidad)
      for (const room of floor.rooms) {
        const poly = (room.polygon as any) || [];
        const rDoors = floor.doors;
        const rWindows = floor.windows;

        const metrics = GeometricMetricsEngine.calculateSpaceMetrics({
          name: room.name,
          polygon: poly,
          heightM: room.heightM || 2.50,
          doors: rDoors as any,
          windows: rWindows as any,
        });

        totalGrossAreaM2 += metrics.grossAreaM2.value;
        totalUsableAreaM2 += metrics.usableAreaM2.value;
        totalBuiltAreaM2 += metrics.builtAreaM2.value;
        totalVolumeM3 += metrics.volumeM3.value;
        totalPerimeterM += metrics.perimeterM.value;
        totalOpeningsAreaM2 += metrics.openingsAreaM2.value;

        // Evaluar reglas espaciales V10 para cada estancia
        const rulesEval = SpatialRulesEngine.evaluateSpace({
          id: room.id,
          name: room.name,
          roomType: room.roomType || undefined,
          heightM: room.heightM,
          metrics,
          doors: rDoors as any,
          windows: rWindows as any,
        });

        allSpatialRuleResults.push(...rulesEval.results);
      }

      // Procesar espacios V10/V11 y sus zonas funcionales
      for (const space of floor.spaces) {
        functionalZonesCount += space.functionalZones.length;
        const sPoly = (space.polygon as any) || [];
        const sMetrics = GeometricMetricsEngine.calculateSpaceMetrics({
          name: space.name,
          polygon: sPoly,
          heightM: space.heightM,
        });

        formattedSpaces.push({
          id: space.id,
          floorId: space.floorId,
          name: space.name,
          roomType: space.type,
          polygon: sPoly,
          metrics: sMetrics,
          heightM: space.heightM,
          color: space.color,
          functionalZones: space.functionalZones.map((z) => ({
            id: z.id,
            parentSpaceId: z.spaceId,
            name: z.name,
            type: z.type as FunctionalZoneType,
            polygon: (z.polygon as any) || null,
            areaM2: {
              value: z.areaM2,
              unit: 'm²',
              source: 'GEOMETRY_CALCULATED',
            },
          })),
          roomIds: space.rooms.map((r) => r.id),
        });
      }
    }

    // Calcular score global de cumplimiento
    const validRules = allSpatialRuleResults.filter((r) => r.status === 'VALID').length;
    const warningRules = allSpatialRuleResults.filter((r) => r.status === 'WARNING').length;
    const invalidRules = allSpatialRuleResults.filter((r) => r.status === 'INVALID').length;
    const evaluable = validRules + warningRules + invalidRules;
    const complianceScore = evaluable > 0 ? Math.round(((validRules * 1.0 + warningRules * 0.5) / evaluable) * 100) : 100;

    if (allSpatialRuleResults.some((r) => r.requiresProValidation)) {
      proValidationNotes.push(PRO_VALIDATION_NOTICE);
    }

    const intelligence: ProjectIntelligenceDto = {
      projectId: project.id,
      projectName: project.name,
      floorsCount: project.floors.length,
      roomsCount,
      spacesCount,
      functionalZonesCount,
      totalGrossAreaM2: Number(totalGrossAreaM2.toFixed(2)),
      totalUsableAreaM2: Number(totalUsableAreaM2.toFixed(2)),
      totalBuiltAreaM2: Number(totalBuiltAreaM2.toFixed(2)),
      totalVolumeM3: Number(totalVolumeM3.toFixed(2)),
      totalPerimeterM: Number(totalPerimeterM.toFixed(2)),
      totalOpeningsAreaM2: Number(totalOpeningsAreaM2.toFixed(2)),
      complianceScore,
      requiresProValidation: true,
      proValidationNotes,
      spaces: formattedSpaces,
      generatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: intelligence });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al obtener Project Intelligence:', error);
    res.status(500).json({ success: false, message: 'Error interno al generar Project Intelligence' });
  }
};
