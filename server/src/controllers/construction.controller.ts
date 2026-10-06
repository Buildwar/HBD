import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  ConstructionIntelligenceEngine,
  ConstructionComparisonEngine,
  ConstructionCategory,
  ConstructionOperationType,
  PRO_VALIDATION_NOTICE,
} from '@hbd/shared';

const createPhaseSchema = z.object({
  name: z.string().min(1, 'El nombre de la fase es obligatorio'),
  description: z.string().optional().nullable(),
  estimatedDurationDays: z.number().min(1).default(7),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  dependencies: z.array(z.string()).optional().default([]),
});

const createTaskSchema = z.object({
  name: z.string().min(1, 'El nombre de la tarea es obligatorio'),
  description: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  dependencies: z.array(z.string()).optional().default([]),
});

const createItemSchema = z.object({
  spaceId: z.string().optional().nullable(),
  category: z.string().default('MASONRY'),
  operation: z.enum(['DEMOLITION', 'CONSTRUCTION', 'INSTALLATION', 'REPLACEMENT', 'FINISHING', 'FURNISHING', 'OTHER']).default('CONSTRUCTION'),
  name: z.string().min(1, 'El nombre de la partida es obligatorio'),
  description: z.string().optional().nullable(),
  quantity: z.number().min(0.01).default(1),
  unit: z.string().default('m2'),
  wastePercent: z.number().min(0).max(100).default(5),
  materialCost: z.number().min(0).default(0),
  laborCost: z.number().min(0).default(0),
  otherCost: z.number().min(0).default(0),
  confidence: z.string().default('GEOMETRY_CALCULATED'),
  supplierId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Obtiene o inicializa la planificación de obra de un proyecto.
 */
export const getConstructionProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    let construction = await prisma.constructionProject.findUnique({
      where: { projectId },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: { assignee: { select: { id: true, name: true, email: true } } },
            },
            checklists: { orderBy: { createdAt: 'asc' } },
          },
        },
        items: {
          orderBy: { createdAt: 'desc' },
          include: { supplier: true },
        },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Auto-inicializar si no existe todavía
    if (!construction) {
      const defaultPhases = ConstructionIntelligenceEngine.generateDefaultPhases();
      construction = await prisma.constructionProject.create({
        data: {
          projectId,
          status: 'PLANNING',
          phases: {
            create: defaultPhases.map((phase) => ({
              name: phase.name,
              description: phase.description,
              order: phase.order,
              estimatedDurationDays: phase.estimatedDurationDays,
              tasks: {
                create: phase.defaultTasks.map((tName, tIdx) => ({
                  name: tName,
                  order: tIdx + 1,
                  status: 'TODO',
                })),
              },
              checklists: {
                create: phase.defaultChecklist.map((cLabel) => ({
                  label: cLabel,
                  isDone: false,
                })),
              },
            })),
          },
        },
        include: {
          phases: {
            orderBy: { order: 'asc' },
            include: {
              tasks: {
                orderBy: { order: 'asc' },
                include: { assignee: { select: { id: true, name: true, email: true } } },
              },
              checklists: { orderBy: { createdAt: 'asc' } },
            },
          },
          items: {
            orderBy: { createdAt: 'desc' },
            include: { supplier: true },
          },
          documents: { orderBy: { createdAt: 'desc' } },
        },
      });
    }

    // Calcular métricas agregadas de costes y progreso
    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    let totalOtherCost = 0;
    let proValidationWarningsCount = 0;

    const formattedItems = construction.items.map((item) => {
      const calc = ConstructionIntelligenceEngine.computeItemTotalCost({
        quantity: item.quantity,
        wastePercent: item.wastePercent,
        materialCost: item.materialCost,
        laborCost: item.laborCost,
        otherCost: item.otherCost,
      });

      totalMaterialCost += calc.materialCost;
      totalLaborCost += calc.laborCost;
      totalOtherCost += calc.otherCost;

      if (item.requiresProValidation) {
        proValidationWarningsCount++;
      }

      return {
        ...item,
        effectiveQuantity: calc.effectiveQuantity,
        totalCost: calc.totalCost,
      };
    });

    const grandTotalCost = Number((totalMaterialCost + totalLaborCost + totalOtherCost).toFixed(2));
    const progressPercent = ConstructionIntelligenceEngine.calculateProjectProgress(construction.phases as any);

    res.json({
      success: true,
      data: {
        ...construction,
        items: formattedItems,
        totalMaterialCost: Number(totalMaterialCost.toFixed(2)),
        totalLaborCost: Number(totalLaborCost.toFixed(2)),
        totalOtherCost: Number(totalOtherCost.toFixed(2)),
        grandTotalCost,
        progressPercent,
        proValidationWarningsCount,
      },
    });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al obtener el proyecto de obra:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Actualiza los datos generales de la obra (estado, fechas, notas).
 */
export const updateConstructionProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { status, notes, targetStartDate, targetEndDate } = req.body;

    const updated = await prisma.constructionProject.update({
      where: { projectId },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        targetStartDate: targetStartDate ? new Date(targetStartDate) : undefined,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : undefined,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al actualizar obra:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el estado de la obra' });
  }
};

/**
 * Crea una nueva fase de obra.
 */
export const createPhase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const parse = createPhaseSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, errors: parse.error.format() });
      return;
    }

    const construction = await prisma.constructionProject.findUnique({ where: { projectId } });
    if (!construction) {
      res.status(404).json({ success: false, message: 'Proyecto de obra no encontrado' });
      return;
    }

    const count = await prisma.constructionPhase.count({ where: { constructionId: construction.id } });

    const phase = await prisma.constructionPhase.create({
      data: {
        constructionId: construction.id,
        name: parse.data.name,
        description: parse.data.description,
        order: count + 1,
        estimatedDurationDays: parse.data.estimatedDurationDays,
        startDate: parse.data.startDate ? new Date(parse.data.startDate) : null,
        endDate: parse.data.endDate ? new Date(parse.data.endDate) : null,
        dependencies: parse.data.dependencies || [],
      },
      include: { tasks: true, checklists: true },
    });

    res.status(201).json({ success: true, data: phase });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al crear fase de obra:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear fase' });
  }
};

/**
 * Crea una tarea dentro de una fase de obra.
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phaseId } = req.params;
    const parse = createTaskSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, errors: parse.error.format() });
      return;
    }

    const count = await prisma.constructionTask.count({ where: { phaseId } });

    const task = await prisma.constructionTask.create({
      data: {
        phaseId,
        name: parse.data.name,
        description: parse.data.description,
        order: count + 1,
        assigneeId: parse.data.assigneeId || null,
        dependencies: parse.data.dependencies || [],
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al crear tarea de obra:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear tarea' });
  }
};

/**
 * Actualiza el estado o datos de una tarea.
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { name, description, status, assigneeId, dependencies } = req.body;

    const task = await prisma.constructionTask.update({
      where: { id: taskId },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        status: status || undefined,
        assigneeId: assigneeId !== undefined ? assigneeId : undefined,
        dependencies: dependencies !== undefined ? dependencies : undefined,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });

    res.json({ success: true, data: task });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al actualizar tarea:', error);
    res.status(500).json({ success: false, message: 'Error interno al actualizar tarea' });
  }
};

/**
 * Marca o desmarca un elemento del checklist de fase.
 */
export const toggleChecklistItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { checklistId } = req.params;
    const { isDone, notes } = req.body;

    const item = await prisma.checklistItem.update({
      where: { id: checklistId },
      data: {
        isDone: isDone !== undefined ? isDone : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    res.json({ success: true, data: item });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al actualizar checklist:', error);
    res.status(500).json({ success: false, message: 'Error interno al actualizar checklist' });
  }
};

/**
 * Añade una partida o medición de obra con cálculo de merma y costes.
 */
export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const parse = createItemSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, errors: parse.error.format() });
      return;
    }

    const construction = await prisma.constructionProject.findUnique({ where: { projectId } });
    if (!construction) {
      res.status(404).json({ success: false, message: 'Proyecto de obra no encontrado' });
      return;
    }

    const calc = ConstructionIntelligenceEngine.computeItemTotalCost({
      quantity: parse.data.quantity,
      wastePercent: parse.data.wastePercent,
      materialCost: parse.data.materialCost,
      laborCost: parse.data.laborCost,
      otherCost: parse.data.otherCost,
    });

    const requiresProValidation = ConstructionIntelligenceEngine.checkRequiresProValidation(
      parse.data.category as ConstructionCategory,
      parse.data.operation as ConstructionOperationType,
      parse.data.name
    );

    const item = await prisma.constructionItem.create({
      data: {
        constructionId: construction.id,
        spaceId: parse.data.spaceId || null,
        category: parse.data.category,
        operation: parse.data.operation,
        name: parse.data.name,
        description: parse.data.description,
        quantity: parse.data.quantity,
        unit: parse.data.unit,
        wastePercent: parse.data.wastePercent,
        materialCost: parse.data.materialCost,
        laborCost: parse.data.laborCost,
        otherCost: parse.data.otherCost,
        totalCost: calc.totalCost,
        confidence: parse.data.confidence,
        supplierId: parse.data.supplierId || null,
        requiresProValidation,
        notes: parse.data.notes,
      },
      include: { supplier: true },
    });

    res.status(201).json({
      success: true,
      data: {
        ...item,
        effectiveQuantity: calc.effectiveQuantity,
      },
    });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al crear partida de obra:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear partida' });
  }
};

/**
 * Elimina una partida de obra.
 */
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    await prisma.constructionItem.delete({ where: { id: itemId } });
    res.json({ success: true, message: 'Partida eliminada correctamente' });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al eliminar partida:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la partida' });
  }
};

/**
 * Compara el estado actual (EXISTING) con el estado propuesto (PROPOSED).
 */
export const getComparison = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        floors: {
          include: {
            rooms: true,
            walls: true,
            doors: true,
            windows: true,
            furniturePlacements: true,
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
      return;
    }

    const firstFloor = project.floors[0];
    const existingRooms = (firstFloor?.rooms || []).map((r) => ({ id: r.id, name: r.name, areaM2: r.areaM2 }));
    const existingWalls = (firstFloor?.walls || []).map((w) => ({ id: w.id, wallType: w.wallType }));

    // Simular o derivar estado propuesto a partir de las variantes o modificaciones
    const comparison = ConstructionComparisonEngine.compareStates({
      projectId,
      existing: {
        rooms: existingRooms,
        walls: existingWalls,
        doorsCount: firstFloor?.doors?.length || 0,
        windowsCount: firstFloor?.windows?.length || 0,
        furnitureCount: firstFloor?.furniturePlacements?.length || 0,
      },
      proposed: {
        rooms: existingRooms,
        walls: existingWalls,
        doorsCount: firstFloor?.doors?.length || 0,
        windowsCount: firstFloor?.windows?.length || 0,
        furnitureCount: (firstFloor?.furniturePlacements?.length || 0) + 2,
      },
    });

    res.json({ success: true, data: comparison });
  } catch (error: any) {
    logger.error('PROJECT', 'Error en comparador de obra:', error);
    res.status(500).json({ success: false, message: 'Error al comparar estados de obra' });
  }
};

/**
 * Genera el informe técnico de obra.
 */
export const getReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        constructionProject: {
          include: {
            phases: { include: { tasks: true } },
            items: true,
          },
        },
        floors: {
          include: {
            rooms: true,
            walls: true,
            doors: true,
            windows: true,
            furniturePlacements: true,
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
      return;
    }

    const firstFloor = project.floors[0];
    const comparison = ConstructionComparisonEngine.compareStates({
      projectId,
      existing: {
        rooms: (firstFloor?.rooms || []).map((r) => ({ id: r.id, name: r.name, areaM2: r.areaM2 })),
        walls: (firstFloor?.walls || []).map((w) => ({ id: w.id })),
        doorsCount: firstFloor?.doors?.length || 0,
        windowsCount: firstFloor?.windows?.length || 0,
        furnitureCount: firstFloor?.furniturePlacements?.length || 0,
      },
      proposed: {
        rooms: (firstFloor?.rooms || []).map((r) => ({ id: r.id, name: r.name, areaM2: r.areaM2 })),
        walls: (firstFloor?.walls || []).map((w) => ({ id: w.id })),
        doorsCount: firstFloor?.doors?.length || 0,
        windowsCount: firstFloor?.windows?.length || 0,
        furnitureCount: firstFloor?.furniturePlacements?.length || 0,
      },
    });

    const items = project.constructionProject?.items || [];
    const totalMaterial = items.reduce((sum, i) => sum + i.materialCost * i.quantity * (1 + i.wastePercent / 100), 0);
    const totalLabor = items.reduce((sum, i) => sum + i.laborCost * i.quantity, 0);
    const totalOther = items.reduce((sum, i) => sum + i.otherCost, 0);
    const grandTotal = totalMaterial + totalLabor + totalOther;

    const report = {
      projectName: project.name,
      projectAddress: project.address,
      author: 'Adrián Palma',
      generatedAt: new Date().toISOString(),
      status: project.constructionProject?.status || 'PLANNING',
      comparison,
      budgetSummary: {
        totalMaterial: Number(totalMaterial.toFixed(2)),
        totalLabor: Number(totalLabor.toFixed(2)),
        totalOther: Number(totalOther.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
        byCategory: [],
        bySpace: [],
      },
      phasesSummary: (project.constructionProject?.phases || []).map((ph) => ({
        name: ph.name,
        durationDays: ph.estimatedDurationDays,
        taskCount: ph.tasks.length,
        completedCount: ph.tasks.filter((t) => t.status === 'DONE').length,
        status: ph.status,
      })),
      legalDisclaimer: PRO_VALIDATION_NOTICE,
    };

    res.json({ success: true, data: report });
  } catch (error: any) {
    logger.error('PROJECT', 'Error al generar informe de obra:', error);
    res.status(500).json({ success: false, message: 'Error al generar informe técnico' });
  }
};
