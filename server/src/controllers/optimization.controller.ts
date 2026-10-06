/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * CONTROLADOR DE OPTIMIZACIÓN DE DISEÑO ARQUITECTÓNICO
 * DESIGN OPTIMIZATION CONTROLLER
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  DesignOptimizationEngine,
  ScenarioComparisonEngine,
  ScenarioEngine,
  CreateOptimizationInput,
  DesignObjectiveType,
  DesignConstraint,
  OptimizationStrategy,
} from '@hbd/shared';

const runOptimizationSchema = z.object({
  baseScenarioId: z.string().optional().nullable(),
  name: z.string().optional().default('Optimización de Diseño'),
  brief: z
    .object({
      text: z.string().optional(),
      minBedrooms: z.number().optional(),
      minBathrooms: z.number().optional(),
      preserveKitchen: z.boolean().optional(),
      preserveStructuralWalls: z.boolean().optional(),
      maxBudgetEur: z.number().optional(),
      minUsableAreaM2: z.number().optional(),
      minPassageWidthM: z.number().optional(),
      targetStyle: z.string().optional(),
      workZoneRequired: z.boolean().optional(),
      storageBoostRequired: z.boolean().optional(),
      customRequirements: z.array(z.string()).optional(),
    })
    .optional(),
  objectives: z.array(z.string()).optional(),
  constraints: z.array(z.any()).optional(),
  preferences: z.record(z.any()).optional(),
  strategy: z.enum(['RULE_BASED', 'PARAMETRIC', 'HEURISTIC', 'AI_ASSISTED', 'HYBRID']).default('PARAMETRIC'),
  maxCandidates: z.number().min(1).max(8).default(4),
  timeoutMs: z.number().min(1000).max(30000).default(15000),
});

const compareAlternativesSchema = z.object({
  alternativeIds: z.array(z.string()).min(1).max(4),
});

/**
 * Ejecuta una optimización de diseño y genera alternativas explicables
 */
export const runOptimization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const validatedData = runOptimizationSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        floors: {
          include: {
            walls: true,
            doors: true,
            windows: true,
            rooms: true,
            spaces: { include: { functionalZones: true } },
            furniturePlacements: true,
          },
        },
        scenarios: true,
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
      return;
    }

    let baseSnapshot: any = null;

    if (validatedData.baseScenarioId) {
      const scenario = project.scenarios.find((s) => s.id === validatedData.baseScenarioId);
      if (scenario && scenario.snapshotData) {
        baseSnapshot = scenario.snapshotData;
      }
    }

    // Si no hay escenario base especificado, construir snapshot a partir del proyecto
    if (!baseSnapshot) {
      const allWalls = project.floors.flatMap((f) => f.walls);
      const allDoors = project.floors.flatMap((f) => f.doors);
      const allWindows = project.floors.flatMap((f) => f.windows);
      const allRooms = project.floors.flatMap((f) => f.rooms);
      const allSpaces = project.floors.flatMap((f) => f.spaces);
      const allFurniture = project.floors.flatMap((f) => f.furniturePlacements);

      baseSnapshot = {
        walls: allWalls.map((w) => ({
          id: w.id,
          startX: w.startX,
          startY: w.startY,
          endX: w.endX,
          endY: w.endY,
          thickness: w.thicknessM,
          isStructural: w.wallType === 'LOAD_BEARING',
        })),
        doors: allDoors.map((d) => ({
          id: d.id,
          wallId: d.wallId,
          widthM: d.widthM,
          position: { x: d.posX, y: d.posY },
        })),
        windows: allWindows.map((wi) => ({
          id: wi.id,
          wallId: wi.wallId,
          widthM: wi.widthM,
          heightM: wi.heightM,
          position: { x: wi.posX, y: wi.posY },
        })),
        rooms: allRooms.map((r) => ({
          id: r.id,
          name: r.name,
          areaM2: r.areaM2,
          heightM: r.heightM,
          spaceId: r.spaceId || undefined,
        })),
        spaces: allSpaces.map((s) => ({
          id: s.id,
          floorId: s.floorId,
          name: s.name,
          type: s.type,
          areaM2: s.areaM2 || 0,
          heightM: s.heightM,
        })),
        furniture: allFurniture.map((fu) => ({
          id: fu.id,
          furnitureId: fu.furnitureId,
          x: fu.posX,
          y: fu.posY,
          rotation: fu.rotationDeg,
        })),
      };
    }

    const input: CreateOptimizationInput = {
      projectId,
      baseScenarioId: validatedData.baseScenarioId || undefined,
      name: validatedData.name,
      brief: validatedData.brief,
      objectives: validatedData.objectives as DesignObjectiveType[],
      constraints: validatedData.constraints as DesignConstraint[],
      preferences: validatedData.preferences,
      strategy: validatedData.strategy as OptimizationStrategy,
      maxCandidates: validatedData.maxCandidates,
      timeoutMs: validatedData.timeoutMs,
    };

    // Ejecutar Motor de Optimización
    const result = await DesignOptimizationEngine.optimizeDesign(input, baseSnapshot);

    const userId = (req as any).user?.id || null;

    // Persistir Solicitud en DB
    const createdRequest = await prisma.optimizationRequest.create({
      data: {
        projectId,
        baseScenarioId: validatedData.baseScenarioId || null,
        name: result.request.name,
        objectives: result.request.objectives as any,
        constraints: result.request.constraints as any,
        preferences: result.request.preferences as any,
        strategy: result.request.strategy as any,
        status: 'COMPLETED',
        maxCandidates: result.request.maxCandidates,
        timeoutMs: result.request.timeoutMs,
        executionTimeMs: result.request.executionTimeMs,
        createdBy: userId,
      },
    });

    // Persistir Alternativas Generadas en DB
    const savedAlternatives = await Promise.all(
      result.alternatives.map((alt) =>
        prisma.designAlternative.create({
          data: {
            requestId: createdRequest.id,
            name: alt.name,
            description: alt.description || null,
            status: alt.status as any,
            snapshotData: alt.snapshotData as any,
            metrics: alt.metrics as any,
            impacts: alt.impacts as any,
            validation: alt.validation as any,
            explanations: alt.explanations as any,
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      data: {
        ...result,
        request: {
          ...result.request,
          id: createdRequest.id,
        },
        alternatives: savedAlternatives,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Parámetros de optimización inválidos',
        errors: error.errors,
      });
      return;
    }
    logger.error('PROJECT', 'Error al ejecutar optimización de diseño', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la optimización de diseño',
    });
  }
};

/**
 * Obtiene todas las solicitudes de optimización de un proyecto
 */
export const getOptimizationRequestsByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const requests = await prisma.optimizationRequest.findMany({
      where: { projectId },
      include: {
        alternatives: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al obtener solicitudes de optimización', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar las solicitudes de optimización',
    });
  }
};

/**
 * Obtiene el detalle de una solicitud de optimización
 */
export const getOptimizationRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    const request = await prisma.optimizationRequest.findUnique({
      where: { id: requestId },
      include: {
        alternatives: true,
        baseScenario: true,
      },
    });

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Solicitud de optimización no encontrada',
      });
      return;
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al obtener detalle de la optimización', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar la solicitud de optimización',
    });
  }
};

/**
 * Obtiene las alternativas de una solicitud
 */
export const getAlternativesByRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    const alternatives = await prisma.designAlternative.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: alternatives,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al obtener alternativas de diseño', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar las alternativas',
    });
  }
};

/**
 * Obtiene el detalle de una alternativa de diseño
 */
export const getAlternativeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alternativeId } = req.params;

    const alternative = await prisma.designAlternative.findUnique({
      where: { id: alternativeId },
      include: {
        request: true,
      },
    });

    if (!alternative) {
      res.status(404).json({
        success: false,
        message: 'Alternativa no encontrada',
      });
      return;
    }

    res.json({
      success: true,
      data: alternative,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al obtener alternativa', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar la alternativa',
    });
  }
};

/**
 * Registra la selección de una alternativa por parte del usuario (SELECTED)
 */
export const selectAlternative = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alternativeId } = req.params;
    const userId = (req as any).user?.id || 'user-active';
    const timestamp = new Date();

    const alternative = await prisma.designAlternative.findUnique({
      where: { id: alternativeId },
    });

    if (!alternative) {
      res.status(404).json({
        success: false,
        message: 'Alternativa no encontrada',
      });
      return;
    }

    const updated = await prisma.designAlternative.update({
      where: { id: alternativeId },
      data: {
        status: 'SELECTED',
        selectedBy: userId,
        selectedAt: timestamp,
      },
    });

    res.json({
      success: true,
      message: 'Alternativa seleccionada por el usuario con éxito',
      data: updated,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al seleccionar alternativa', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la selección de la alternativa',
    });
  }
};

/**
 * Convierte una alternativa validada en un ProjectScenario de V12
 */
export const convertAlternativeToScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alternativeId } = req.params;
    const { name } = req.body;
    const userId = (req as any).user?.id || null;

    const alternative = await prisma.designAlternative.findUnique({
      where: { id: alternativeId },
      include: { request: true },
    });

    if (!alternative) {
      res.status(404).json({
        success: false,
        message: 'Alternativa no encontrada',
      });
      return;
    }

    // Crear ProjectScenario en DB a partir del snapshot de la alternativa
    const createdScenario = await prisma.projectScenario.create({
      data: {
        projectId: alternative.request.projectId,
        name: name || `Escenario: ${alternative.name}`,
        description: alternative.description,
        type: 'AI_GENERATED',
        status: 'VALID',
        baseScenarioId: alternative.request.baseScenarioId,
        snapshotData: alternative.snapshotData as any,
        metrics: alternative.metrics as any,
        createdBy: userId,
      },
    });

    // Actualizar alternativa con el escenario resultante
    const updatedAlternative = await prisma.designAlternative.update({
      where: { id: alternativeId },
      data: {
        scenarioId: createdScenario.id,
        convertedScenarioId: createdScenario.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Alternativa convertida en Escenario de Proyecto con éxito',
      data: {
        scenario: createdScenario,
        alternative: updatedAlternative,
      },
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al convertir alternativa a escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al convertir la alternativa en escenario',
    });
  }
};

/**
 * Compara objetivamente de 2 a 4 alternativas seleccionadas
 */
export const compareAlternatives = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alternativeIds } = compareAlternativesSchema.parse(req.body);

    const alternatives = await prisma.designAlternative.findMany({
      where: { id: { in: alternativeIds } },
    });

    if (alternatives.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No se encontraron las alternativas seleccionadas',
      });
      return;
    }

    // Mapear alternativas a ProjectScenarioDto para reutilizar ScenarioComparisonEngine
    const scenariosMock = alternatives.map((alt) => ({
      id: alt.id,
      projectId: 'proj',
      name: alt.name,
      description: alt.description,
      type: 'MANUAL' as any,
      status: 'VALID' as any,
      snapshotData: alt.snapshotData as any,
      metrics: alt.metrics as any,
      actions: [],
      createdAt: alt.createdAt.toISOString(),
      updatedAt: alt.updatedAt.toISOString(),
    }));

    const comparison = ScenarioComparisonEngine.compareScenarios(scenariosMock as any);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Parámetros de comparación inválidos',
        errors: error.errors,
      });
      return;
    }
    logger.error('PROJECT', 'Error al comparar alternativas', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la comparación de alternativas',
    });
  }
};
