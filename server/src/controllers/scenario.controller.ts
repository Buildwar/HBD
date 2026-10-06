/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * CONTROLADOR DE ESCENARIOS Y PLANIFICACIÓN DE PROYECTO
 * SCENARIO CONTROLLER
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  ScenarioEngine,
  ScenarioValidationEngine,
  ScenarioImpactEngine,
  ScenarioComparisonEngine,
  ProjectScenarioDto,
  ScenarioActionType,
} from '@hbd/shared';

const createScenarioSchema = z.object({
  name: z.string().min(1, 'El nombre del escenario es obligatorio'),
  description: z.string().optional().nullable(),
  type: z.enum(['CURRENT', 'MANUAL', 'AI_GENERATED', 'DESIGN_VARIANT', 'RENOVATION', 'CUSTOM']).default('MANUAL'),
  baseScenarioId: z.string().optional().nullable(),
  snapshotData: z.record(z.any()).optional().nullable(),
});

const updateScenarioSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ANALYZING', 'VALID', 'WARNING', 'INVALID', 'ARCHIVED']).optional(),
  snapshotData: z.record(z.any()).optional().nullable(),
  metrics: z.record(z.any()).optional().nullable(),
  budgetSummary: z.record(z.any()).optional().nullable(),
});

const applyActionSchema = z.object({
  actionType: z.string().min(1),
  payload: z.record(z.any()),
});

const compareScenariosSchema = z.object({
  scenarioIds: z.array(z.string()).min(1, 'Debe especificar al menos un escenario').max(4, 'Máximo 4 escenarios para comparación simultánea'),
  baseScenarioId: z.string().optional().nullable(),
});

/**
 * Obtiene todos los escenarios de un proyecto
 */
export const getScenariosByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const scenarios = await prisma.projectScenario.findMany({
      where: {
        projectId,
        status: { not: 'ARCHIVED' },
      },
      include: {
        actions: {
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: scenarios,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al obtener escenarios del proyecto', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar los escenarios del proyecto',
    });
  }
};

/**
 * Crea un nuevo escenario para el proyecto
 */
export const createScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const validatedData = createScenarioSchema.parse(req.body);

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
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
      return;
    }

    let initialSnapshot = validatedData.snapshotData;

    // Si no se suministró snapshot, generar a partir del estado actual del proyecto
    if (!initialSnapshot) {
      const allWalls = project.floors.flatMap((f) => f.walls);
      const allDoors = project.floors.flatMap((f) => f.doors);
      const allWindows = project.floors.flatMap((f) => f.windows);
      const allRooms = project.floors.flatMap((f) => f.rooms);
      const allSpaces = project.floors.flatMap((f) => f.spaces);
      const allFurniture = project.floors.flatMap((f) => f.furniturePlacements);

      initialSnapshot = {
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

    const created = await prisma.projectScenario.create({
      data: {
        projectId,
        name: validatedData.name,
        description: validatedData.description || null,
        type: validatedData.type as any,
        baseScenarioId: validatedData.baseScenarioId || null,
        snapshotData: initialSnapshot as any,
        createdBy: (req as any).user?.id || null,
      },
      include: {
        actions: true,
      },
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Datos de creación de escenario inválidos',
        errors: error.errors,
      });
      return;
    }
    logger.error('PROJECT', 'Error al crear escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el escenario',
    });
  }
};

/**
 * Obtiene el detalle de un escenario con su impacto y validación
 */
export const getScenarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.params;

    const scenario = await prisma.projectScenario.findUnique({
      where: { id: scenarioId },
      include: {
        actions: {
          orderBy: { sequence: 'asc' },
        },
        baseScenario: true,
      },
    });

    if (!scenario) {
      res.status(404).json({
        success: false,
        message: 'Escenario no encontrado',
      });
      return;
    }

    // Calcular impacto y validación en tiempo real
    const validation = ScenarioValidationEngine.validateScenario(
      scenario.id,
      scenario.snapshotData as any
    );

    const impact = ScenarioImpactEngine.calculateScenarioImpact(
      scenario as any,
      scenario.baseScenario as any
    );

    res.json({
      success: true,
      data: {
        ...scenario,
        validation,
        impact,
      },
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al obtener detalle del escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar el escenario',
    });
  }
};

/**
 * Actualiza los datos generales o estado de un escenario
 */
export const updateScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.params;
    const validatedData = updateScenarioSchema.parse(req.body);

    const updated = await prisma.projectScenario.update({
      where: { id: scenarioId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.status && { status: validatedData.status as any }),
        ...(validatedData.snapshotData && { snapshotData: validatedData.snapshotData as any }),
        ...(validatedData.metrics && { metrics: validatedData.metrics as any }),
        ...(validatedData.budgetSummary && { budgetSummary: validatedData.budgetSummary as any }),
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Datos de actualización inválidos',
        errors: error.errors,
      });
      return;
    }
    logger.error('PROJECT', 'Error al actualizar escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el escenario',
    });
  }
};

/**
 * Archiva (borrado lógico) un escenario
 */
export const deleteScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.params;

    await prisma.projectScenario.update({
      where: { id: scenarioId },
      data: { status: 'ARCHIVED' },
    });

    res.json({
      success: true,
      message: 'Escenario archivado correctamente',
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al archivar escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar/archivar el escenario',
    });
  }
};

/**
 * Duplica un escenario existente
 */
export const duplicateScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.params;
    const { name } = req.body;

    const source = await prisma.projectScenario.findUnique({
      where: { id: scenarioId },
      include: { actions: true },
    });

    if (!source) {
      res.status(404).json({
        success: false,
        message: 'Escenario original no encontrado',
      });
      return;
    }

    const duplicated = await prisma.projectScenario.create({
      data: {
        projectId: source.projectId,
        name: name || `${source.name} (Copia)`,
        description: source.description,
        type: source.type,
        status: 'DRAFT',
        baseScenarioId: source.id,
        snapshotData: source.snapshotData as any,
        metrics: source.metrics as any,
        budgetSummary: source.budgetSummary as any,
        createdBy: (req as any).user?.id || null,
      },
    });

    res.status(201).json({
      success: true,
      data: duplicated,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al duplicar escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al duplicar el escenario',
    });
  }
};

/**
 * Aplica una acción estructurada a un escenario
 */
export const applyAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.params;
    const { actionType, payload } = applyActionSchema.parse(req.body);

    const scenario = await prisma.projectScenario.findUnique({
      where: { id: scenarioId },
      include: { actions: true },
    });

    if (!scenario) {
      res.status(404).json({
        success: false,
        message: 'Escenario no encontrado',
      });
      return;
    }

    const userId = (req as any).user?.id;
    const { scenario: updatedInMemory, action: newAction } = ScenarioEngine.applyAction(
      scenario as any,
      actionType as ScenarioActionType,
      payload,
      userId
    );

    // Persistir acción en base de datos
    const createdAction = await prisma.scenarioAction.create({
      data: {
        scenarioId,
        actionType: actionType as any,
        payload: newAction.payload as any,
        previousState: newAction.previousState as any,
        sequence: newAction.sequence,
        createdBy: userId || null,
      },
    });

    // Actualizar snapshot del escenario en DB
    const updatedScenario = await prisma.projectScenario.update({
      where: { id: scenarioId },
      data: {
        snapshotData: updatedInMemory.snapshotData as any,
      },
      include: {
        actions: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        action: createdAction,
        scenario: updatedScenario,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Acción de escenario inválida',
        errors: error.errors,
      });
      return;
    }
    logger.error('PROJECT', 'Error al aplicar acción sobre el escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la acción del escenario',
    });
  }
};

/**
 * Revierte una acción estructurada de un escenario
 */
export const revertAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId, actionId } = req.params;

    const scenario = await prisma.projectScenario.findUnique({
      where: { id: scenarioId },
      include: { actions: true },
    });

    if (!scenario) {
      res.status(404).json({
        success: false,
        message: 'Escenario no encontrado',
      });
      return;
    }

    const updatedInMemory = ScenarioEngine.revertAction(scenario as any, actionId);

    // Actualizar estado de reversión en DB
    await prisma.scenarioAction.update({
      where: { id: actionId },
      data: { isReverted: true },
    });

    const updatedScenario = await prisma.projectScenario.update({
      where: { id: scenarioId },
      data: {
        snapshotData: updatedInMemory.snapshotData as any,
      },
      include: {
        actions: true,
      },
    });

    res.json({
      success: true,
      data: updatedScenario,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al revertir acción del escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al revertir la acción',
    });
  }
};

/**
 * Valida un escenario y retorna incidencias y score
 */
export const validateScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.params;

    const scenario = await prisma.projectScenario.findUnique({
      where: { id: scenarioId },
    });

    if (!scenario) {
      res.status(404).json({
        success: false,
        message: 'Escenario no encontrado',
      });
      return;
    }

    const validation = ScenarioValidationEngine.validateScenario(
      scenario.id,
      scenario.snapshotData as any
    );

    // Actualizar el status del escenario según la validación
    await prisma.projectScenario.update({
      where: { id: scenarioId },
      data: {
        status: validation.status === 'VALID' ? 'VALID' : validation.status === 'INVALID' ? 'INVALID' : 'WARNING',
      },
    });

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    logger.error('PROJECT', 'Error al validar escenario', error);
    res.status(500).json({
      success: false,
      message: 'Error al evaluar la validación del escenario',
    });
  }
};

/**
 * Compara objetivamente de 2 a 4 escenarios de un proyecto
 */
export const compareScenarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioIds, baseScenarioId } = compareScenariosSchema.parse(req.body);

    const scenarios = await prisma.projectScenario.findMany({
      where: {
        id: { in: scenarioIds },
      },
      include: {
        actions: true,
      },
    });

    if (scenarios.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No se encontraron los escenarios seleccionados',
      });
      return;
    }

    const comparison = ScenarioComparisonEngine.compareScenarios(
      scenarios as any,
      baseScenarioId || undefined
    );

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
    logger.error('PROJECT', 'Error al comparar escenarios', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la matriz comparativa de escenarios',
    });
  }
};
