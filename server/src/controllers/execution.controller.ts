import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  ConstructionExecutionEngine,
  ProgressTrackingEngine,
  ExecutionCostEngine,
  MaterialExecutionEngine,
  SiteManagementEngine,
  ExecutionProjectDto,
  ExecutionTaskDto,
  WorkPackageDto,
  MaterialExecutionItemDto,
  MaterialDeliveryDto,
  PurchaseOrderDto,
  ExecutionInvoiceDto,
  SiteDailyLogDto,
  ConstructionIncidentDto,
  ConstructionChangeOrderDto,
  QualityInspectionDto,
  ExecutionMilestoneDto,
  SitePhotoDto,
  ProjectClosureDto,
} from '@hbd/shared';

// Helper de mapeo de Prisma a DTOs
function mapPrismaExecutionToDto(record: any, projectName?: string): ExecutionProjectDto {
  const workPackages: WorkPackageDto[] = (record.workPackages || []).map((wp: any) => ({
    id: wp.id,
    executionId: wp.executionId,
    phaseId: wp.phaseId,
    phaseName: wp.phase?.name || null,
    name: wp.name,
    description: wp.description,
    order: wp.order,
    status: wp.status,
    progress: wp.progress,
    tasks: (wp.tasks || []).map((t: any) => ({
      id: t.id,
      executionId: t.executionId,
      workPackageId: t.workPackageId,
      constructionTaskId: t.constructionTaskId,
      name: t.name,
      description: t.description,
      status: t.status,
      progress: t.progress,
      plannedDurationDays: t.plannedDurationDays,
      actualDurationDays: t.actualDurationDays,
      plannedStart: t.plannedStart ? t.plannedStart.toISOString() : null,
      actualStart: t.actualStart ? t.actualStart.toISOString() : null,
      plannedEnd: t.plannedEnd ? t.plannedEnd.toISOString() : null,
      actualEnd: t.actualEnd ? t.actualEnd.toISOString() : null,
      assigneeType: t.assigneeType,
      assigneeId: t.assigneeId,
      assigneeName: t.assigneeName,
      notes: t.notes,
      dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    createdAt: wp.createdAt.toISOString(),
    updatedAt: wp.updatedAt.toISOString(),
  }));

  const allTasks: ExecutionTaskDto[] = record.tasks && record.tasks.length > 0
    ? record.tasks.map((t: any) => ({
        id: t.id,
        executionId: t.executionId,
        workPackageId: t.workPackageId,
        constructionTaskId: t.constructionTaskId,
        name: t.name,
        description: t.description,
        status: t.status,
        progress: t.progress,
        plannedDurationDays: t.plannedDurationDays,
        actualDurationDays: t.actualDurationDays,
        plannedStart: t.plannedStart ? t.plannedStart.toISOString() : null,
        actualStart: t.actualStart ? t.actualStart.toISOString() : null,
        plannedEnd: t.plannedEnd ? t.plannedEnd.toISOString() : null,
        actualEnd: t.actualEnd ? t.actualEnd.toISOString() : null,
        assigneeType: t.assigneeType,
        assigneeId: t.assigneeId,
        assigneeName: t.assigneeName,
        notes: t.notes,
        dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    : workPackages.flatMap((wp) => wp.tasks);

  const rawMaterials: MaterialExecutionItemDto[] = (record.materials || []).map((m: any) => ({
    id: m.id,
    executionId: m.executionId,
    constructionItemId: m.constructionItemId,
    name: m.name,
    category: m.category,
    unit: m.unit,
    plannedQuantity: m.plannedQuantity,
    orderedQuantity: m.orderedQuantity,
    receivedQuantity: m.receivedQuantity,
    usedQuantity: m.usedQuantity,
    wasteQuantity: m.wasteQuantity,
    remainingQuantity: m.remainingQuantity,
    unitCost: m.unitCost,
    totalCommittedCost: m.totalCommittedCost,
    totalActualCost: m.totalActualCost,
    status: m.status,
    supplierId: m.supplierId,
    supplierName: m.supplier?.name || null,
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  const deliveries: MaterialDeliveryDto[] = (record.deliveries || []).map((d: any) => ({
    id: d.id,
    executionId: d.executionId,
    purchaseOrderId: d.purchaseOrderId,
    materialItemId: d.materialItemId,
    materialName: d.materialName,
    supplierId: d.supplierId,
    supplierName: d.supplier?.name || null,
    expectedDate: d.expectedDate.toISOString(),
    actualDate: d.actualDate ? d.actualDate.toISOString() : null,
    quantity: d.quantity,
    unit: d.unit,
    status: d.status,
    location: d.location,
    documentUrl: d.documentUrl,
    notes: d.notes,
    receivedBy: d.receivedBy,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  const materials = MaterialExecutionEngine.reconcileMaterialDeliveries(rawMaterials, deliveries);

  const purchaseOrders: PurchaseOrderDto[] = (record.purchaseOrders || []).map((po: any) => ({
    id: po.id,
    executionId: po.executionId,
    supplierId: po.supplierId,
    supplierName: po.supplier?.name || null,
    reference: po.reference,
    status: po.status,
    orderDate: po.orderDate.toISOString(),
    expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString() : null,
    actualDeliveryDate: po.actualDeliveryDate ? po.actualDeliveryDate.toISOString() : null,
    itemsSummary: po.itemsSummary,
    totalAmount: po.totalAmount,
    notes: po.notes,
    createdAt: po.createdAt.toISOString(),
    updatedAt: po.updatedAt.toISOString(),
  }));

  const invoices: ExecutionInvoiceDto[] = (record.invoices || []).map((inv: any) => ({
    id: inv.id,
    executionId: inv.executionId,
    purchaseOrderId: inv.purchaseOrderId,
    supplierId: inv.supplierId,
    supplierName: inv.supplier?.name || null,
    reference: inv.reference,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    amount: inv.amount,
    taxAmount: inv.taxAmount,
    totalAmount: inv.totalAmount,
    status: inv.status,
    documentUrl: inv.documentUrl,
    notes: inv.notes,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  }));

  const dailyLogs: SiteDailyLogDto[] = (record.dailyLogs || []).map((dl: any) => ({
    id: dl.id,
    executionId: dl.executionId,
    date: dl.date.toISOString(),
    weatherConditions: dl.weatherConditions,
    workersPresent: Array.isArray(dl.workersPresent) ? dl.workersPresent : [],
    tasksPerformed: Array.isArray(dl.tasksPerformed) ? dl.tasksPerformed : [],
    materialsReceived: Array.isArray(dl.materialsReceived) ? dl.materialsReceived : [],
    incidentNotes: dl.incidentNotes,
    observations: dl.observations,
    photos: Array.isArray(dl.photos) ? dl.photos : [],
    progressRecorded: dl.progressRecorded,
    createdById: dl.createdById,
    createdByName: dl.createdByName,
    createdAt: dl.createdAt.toISOString(),
    updatedAt: dl.updatedAt.toISOString(),
  }));

  const incidents: ConstructionIncidentDto[] = (record.incidents || []).map((inc: any) => ({
    id: inc.id,
    executionId: inc.executionId,
    title: inc.title,
    description: inc.description,
    type: inc.type,
    priority: inc.priority,
    status: inc.status,
    location: inc.location,
    phaseId: inc.phaseId,
    taskId: inc.taskId,
    responsibleAssignee: inc.responsibleAssignee,
    dateReported: inc.dateReported.toISOString(),
    resolutionDate: inc.resolutionDate ? inc.resolutionDate.toISOString() : null,
    resolutionNotes: inc.resolutionNotes,
    photos: Array.isArray(inc.photos) ? inc.photos : [],
    documents: Array.isArray(inc.documents) ? inc.documents : [],
    requiresProReview: inc.requiresProReview,
    proReviewNotes: inc.proReviewNotes,
    createdAt: inc.createdAt.toISOString(),
    updatedAt: inc.updatedAt.toISOString(),
  }));

  const changeOrders: ConstructionChangeOrderDto[] = (record.changeOrders || []).map((co: any) => ({
    id: co.id,
    executionId: co.executionId,
    code: co.code,
    title: co.title,
    description: co.description,
    reason: co.reason,
    status: co.status,
    impact: typeof co.impact === 'object' && co.impact ? co.impact : { costImpact: 0, timeImpactDays: 0 },
    requestedBy: co.requestedBy,
    requestDate: co.requestDate.toISOString(),
    approvals: (co.approvals || []).map((app: any) => ({
      id: app.id,
      changeOrderId: app.changeOrderId,
      requestedBy: app.requestedBy,
      approvedBy: app.approvedBy,
      decision: app.decision,
      decisionDate: app.decisionDate ? app.decisionDate.toISOString() : null,
      comments: app.comments,
      createdAt: app.createdAt.toISOString(),
    })),
    affectedTaskIds: Array.isArray(co.affectedTaskIds) ? co.affectedTaskIds : [],
    affectedItemIds: Array.isArray(co.affectedItemIds) ? co.affectedItemIds : [],
    documents: Array.isArray(co.documents) ? co.documents : [],
    createdAt: co.createdAt.toISOString(),
    updatedAt: co.updatedAt.toISOString(),
  }));

  const inspections: QualityInspectionDto[] = (record.inspections || []).map((qi: any) => ({
    id: qi.id,
    executionId: qi.executionId,
    element: qi.element,
    phaseName: qi.phaseName,
    taskId: qi.taskId,
    inspectionDate: qi.inspectionDate.toISOString(),
    inspectorName: qi.inspectorName,
    result: qi.result,
    observations: qi.observations,
    associatedIncidentId: qi.associatedIncidentId,
    photos: Array.isArray(qi.photos) ? qi.photos : [],
    documents: Array.isArray(qi.documents) ? qi.documents : [],
    createdAt: qi.createdAt.toISOString(),
    updatedAt: qi.updatedAt.toISOString(),
  }));

  const milestones: ExecutionMilestoneDto[] = (record.milestones || []).map((ms: any) => ({
    id: ms.id,
    executionId: ms.executionId,
    title: ms.title,
    description: ms.description,
    targetDate: ms.targetDate.toISOString(),
    actualDate: ms.actualDate ? ms.actualDate.toISOString() : null,
    status: ms.status,
    order: ms.order,
    createdAt: ms.createdAt.toISOString(),
    updatedAt: ms.updatedAt.toISOString(),
  }));

  const photos: SitePhotoDto[] = (record.photos || []).map((p: any) => ({
    id: p.id,
    executionId: p.executionId,
    photoUrl: p.photoUrl,
    caption: p.caption,
    photoType: p.photoType as any,
    stage: p.stage as any,
    takenAt: p.takenAt.toISOString(),
    phaseId: p.phaseId,
    taskId: p.taskId,
    incidentId: p.incidentId,
    inspectionId: p.inspectionId,
    milestoneId: p.milestoneId,
    location: p.location,
    createdAt: p.createdAt.toISOString(),
  }));

  const closure: ProjectClosureDto | null = record.closure
    ? {
        id: record.closure.id,
        executionId: record.closure.executionId,
        status: record.closure.status,
        closedAt: record.closure.closedAt ? record.closure.closedAt.toISOString() : null,
        closedBy: record.closure.closedBy,
        finalSummary: record.closure.finalSummary,
        checklist: typeof record.closure.checklist === 'object' && record.closure.checklist ? record.closure.checklist : ({} as any),
        finalReportDocumentId: record.closure.finalReportDocumentId,
        notes: record.closure.notes,
        createdAt: record.closure.createdAt.toISOString(),
        updatedAt: record.closure.updatedAt.toISOString(),
      }
    : null;

  const progress = ProgressTrackingEngine.calculateGlobalProgress({ tasks: allTasks, workPackages, milestones });

  const scheduleVariance = ProgressTrackingEngine.calculateScheduleVariance({
    startDate: record.startDate ? record.startDate.toISOString() : null,
    plannedEndDate: record.plannedEndDate ? record.plannedEndDate.toISOString() : null,
    actualEndDate: record.actualEndDate ? record.actualEndDate.toISOString() : null,
    tasks: allTasks,
  });

  const initialBudget = record.constructionProject?.grandTotalCost || 0;
  const costVariance = ExecutionCostEngine.calculateCostVariance({
    initialBudget,
    v11Budget: initialBudget,
    materials,
    purchaseOrders,
    invoices,
  });

  const health = ConstructionExecutionEngine.evaluateProjectHealth({
    schedule: scheduleVariance,
    cost: costVariance,
    incidents,
    inspections,
    materials,
    progress,
  });

  return {
    id: record.id,
    projectId: record.projectId,
    constructionProjectId: record.constructionProjectId,
    scenarioId: record.scenarioId,
    alternativeId: record.alternativeId,
    status: record.status,
    startDate: record.startDate ? record.startDate.toISOString() : null,
    plannedEndDate: record.plannedEndDate ? record.plannedEndDate.toISOString() : null,
    actualEndDate: record.actualEndDate ? record.actualEndDate.toISOString() : null,
    progress,
    notes: record.notes,
    workPackages,
    tasks: allTasks,
    materials,
    deliveries,
    purchaseOrders,
    invoices,
    dailyLogs,
    incidents,
    changeOrders,
    inspections,
    milestones,
    photos,
    closure,
    health,
    scheduleVariance,
    costVariance,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

const executionIncludeClause = {
  project: true,
  constructionProject: {
    include: {
      phases: {
        include: { tasks: true, checklists: true },
      },
      items: {
        include: { supplier: true },
      },
    },
  },
  workPackages: {
    orderBy: { order: 'asc' as const },
    include: {
      phase: true,
      tasks: { orderBy: { createdAt: 'asc' as const } },
    },
  },
  tasks: {
    orderBy: { createdAt: 'asc' as const },
  },
  materials: {
    orderBy: { createdAt: 'desc' as const },
    include: { supplier: true },
  },
  deliveries: {
    orderBy: { expectedDate: 'asc' as const },
    include: { supplier: true },
  },
  purchaseOrders: {
    orderBy: { createdAt: 'desc' as const },
    include: { supplier: true },
  },
  invoices: {
    orderBy: { createdAt: 'desc' as const },
    include: { supplier: true },
  },
  dailyLogs: {
    orderBy: { date: 'desc' as const },
  },
  incidents: {
    orderBy: { createdAt: 'desc' as const },
  },
  changeOrders: {
    orderBy: { createdAt: 'desc' as const },
    include: { approvals: true },
  },
  inspections: {
    orderBy: { inspectionDate: 'desc' as const },
  },
  milestones: {
    orderBy: { order: 'asc' as const },
  },
  photos: {
    orderBy: { takenAt: 'desc' as const },
  },
  closure: true,
};

/**
 * Obtiene o inicializa la ejecución de obra para un proyecto.
 */
export const getExecutionProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, executionId } = req.params;

    let execution = executionId
      ? await prisma.executionProject.findUnique({
          where: { id: executionId },
          include: executionIncludeClause,
        })
      : await prisma.executionProject.findFirst({
          where: { projectId },
          include: executionIncludeClause,
        });

    if (!execution && projectId) {
      // Buscar el constructionProject de V11
      const construction = await prisma.constructionProject.findUnique({
        where: { projectId },
        include: {
          phases: {
            orderBy: { order: 'asc' },
            include: { tasks: true, checklists: true },
          },
          items: {
            include: { supplier: true },
          },
        },
      });

      if (!construction) {
        res.status(404).json({ error: 'No se ha planificado la obra en V11 para este proyecto.' });
        return;
      }

      // Inicializar ExecutionProject
      const grandTotalCost = construction.items.reduce((acc, it) => acc + it.totalCost, 0);
      const phasesDto = construction.phases.map((p) => ({
        id: p.id,
        constructionId: p.constructionId,
        name: p.name,
        description: p.description,
        order: p.order,
        status: p.status,
        estimatedDurationDays: p.estimatedDurationDays,
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        dependencies: Array.isArray(p.dependencies) ? (p.dependencies as string[]) : [],
        tasks: p.tasks.map((t) => ({
          id: t.id,
          phaseId: t.phaseId,
          name: t.name,
          description: t.description,
          status: t.status,
          order: t.order,
          assigneeId: t.assigneeId,
          dependencies: Array.isArray(t.dependencies) ? (t.dependencies as string[]) : [],
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
        checklists: p.checklists.map((c) => ({
          id: c.id,
          phaseId: c.phaseId,
          label: c.label,
          isDone: c.isDone,
          notes: c.notes,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
        totalCost: 0,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));

      const itemsDto = construction.items.map((it) => ({
        id: it.id,
        constructionId: it.constructionId,
        spaceId: it.spaceId,
        category: it.category as any,
        operation: it.operation as any,
        name: it.name,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit as any,
        wastePercent: it.wastePercent,
        effectiveQuantity: it.quantity * (1 + it.wastePercent / 100),
        materialCost: it.materialCost,
        laborCost: it.laborCost,
        otherCost: it.otherCost,
        totalCost: it.totalCost,
        confidence: it.confidence as any,
        supplierId: it.supplierId,
        supplierName: it.supplier?.name || null,
        requiresProValidation: it.requiresProValidation,
        notes: it.notes,
        createdAt: it.createdAt.toISOString(),
        updatedAt: it.updatedAt.toISOString(),
      }));

      const constructionDto = {
        id: construction.id,
        projectId: construction.projectId,
        status: construction.status,
        notes: construction.notes,
        targetStartDate: construction.targetStartDate ? construction.targetStartDate.toISOString() : null,
        targetEndDate: construction.targetEndDate ? construction.targetEndDate.toISOString() : null,
        phases: phasesDto,
        items: itemsDto,
        documents: [],
        totalMaterialCost: 0,
        totalLaborCost: 0,
        totalOtherCost: 0,
        grandTotalCost,
        progressPercent: 0,
        proValidationWarningsCount: 0,
        createdAt: construction.createdAt.toISOString(),
        updatedAt: construction.updatedAt.toISOString(),
      };

      const initialExec = ConstructionExecutionEngine.createExecutionFromConstruction({
        projectId,
        construction: constructionDto,
      });

      // Crear ExecutionProject principal
      const created = await prisma.executionProject.create({
        data: {
          id: initialExec.id,
          projectId: initialExec.projectId,
          constructionProjectId: initialExec.constructionProjectId,
          status: 'READY',
          startDate: initialExec.startDate ? new Date(initialExec.startDate) : new Date(),
          plannedEndDate: initialExec.plannedEndDate ? new Date(initialExec.plannedEndDate) : null,
          progress: initialExec.progress,
          notes: initialExec.notes,
        },
      });

      // Crear WorkPackages y Tareas asociadas
      for (const wp of initialExec.workPackages) {
        await prisma.workPackage.create({
          data: {
            id: wp.id,
            executionId: created.id,
            phaseId: wp.phaseId,
            name: wp.name,
            description: wp.description,
            order: wp.order,
            status: wp.status,
            progress: wp.progress,
          },
        });

        for (const t of wp.tasks) {
          await prisma.executionTask.create({
            data: {
              id: t.id,
              executionId: created.id,
              workPackageId: wp.id,
              constructionTaskId: t.constructionTaskId,
              name: t.name,
              description: t.description,
              status: t.status,
              progress: t.progress,
              plannedDurationDays: t.plannedDurationDays,
              actualDurationDays: t.actualDurationDays,
              plannedStart: t.plannedStart ? new Date(t.plannedStart) : null,
              assigneeType: t.assigneeType,
              assigneeId: t.assigneeId,
              assigneeName: t.assigneeName,
              dependencies: t.dependencies || [],
            },
          });
        }
      }

      // Crear materiales
      for (const m of initialExec.materials) {
        await prisma.materialExecutionItem.create({
          data: {
            id: m.id,
            executionId: created.id,
            constructionItemId: m.constructionItemId,
            name: m.name,
            category: m.category,
            unit: m.unit,
            plannedQuantity: m.plannedQuantity,
            orderedQuantity: m.orderedQuantity,
            receivedQuantity: m.receivedQuantity,
            usedQuantity: m.usedQuantity,
            wasteQuantity: m.wasteQuantity,
            remainingQuantity: m.remainingQuantity,
            unitCost: m.unitCost,
            totalCommittedCost: m.totalCommittedCost,
            totalActualCost: m.totalActualCost,
            status: m.status,
            supplierId: m.supplierId,
            notes: m.notes,
          },
        });
      }

      // Crear hitos
      for (const ms of initialExec.milestones) {
        await prisma.executionMilestone.create({
          data: {
            id: ms.id,
            executionId: created.id,
            title: ms.title,
            description: ms.description,
            targetDate: new Date(ms.targetDate),
            status: ms.status,
            order: ms.order,
          },
        });
      }

      execution = await prisma.executionProject.findUnique({
        where: { id: created.id },
        include: executionIncludeClause,
      });
    }

    if (!execution) {
      res.status(404).json({ error: 'Ejecución de obra no encontrada' });
      return;
    }

    const dto = mapPrismaExecutionToDto(execution, (execution as any).project?.name);
    res.json({ success: true, data: dto });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al obtener ejecución de obra:', err);
    res.status(500).json({ error: 'Error al obtener la ejecución de obra' });
  }
};

/**
 * Actualiza los datos generales de la ejecución de obra.
 */
export const updateExecutionProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const { status, startDate, plannedEndDate, actualEndDate, notes } = req.body;

    const updated = await prisma.executionProject.update({
      where: { id: executionId },
      data: {
        status: status || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
        actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      include: executionIncludeClause,
    });

    const dto = mapPrismaExecutionToDto(updated, (updated as any).project?.name);
    res.json({ success: true, data: dto });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al actualizar ejecución:', err);
    res.status(500).json({ error: 'Error al actualizar la ejecución' });
  }
};

/**
 * Actualiza el progreso de una tarea de ejecución o recalcula globalmente.
 */
export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const { taskId, status, progress, actualDurationDays, actualStart, actualEnd } = req.body;

    if (taskId) {
      await prisma.executionTask.update({
        where: { id: taskId },
        data: {
          status: status || undefined,
          progress: progress !== undefined ? progress : undefined,
          actualDurationDays: actualDurationDays !== undefined ? actualDurationDays : undefined,
          actualStart: actualStart ? new Date(actualStart) : undefined,
          actualEnd: actualEnd ? new Date(actualEnd) : undefined,
        },
      });
    }

    // Recargar ejecución completa para recalcular progreso global
    const execution = await prisma.executionProject.findUnique({
      where: { id: executionId },
      include: executionIncludeClause,
    });

    if (!execution) {
      res.status(404).json({ error: 'Ejecución no encontrada' });
      return;
    }

    const dto = mapPrismaExecutionToDto(execution, (execution as any).project?.name);

    // Guardar nuevo progreso global calculado
    await prisma.executionProject.update({
      where: { id: executionId },
      data: { progress: dto.progress },
    });

    res.json({ success: true, data: dto });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al actualizar progreso:', err);
    res.status(500).json({ error: 'Error al actualizar progreso' });
  }
};

/**
 * Crea una entrada en el Diario de Obra (Site Daily Log).
 */
export const createDailyLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const {
      date,
      weatherConditions,
      workersPresent,
      tasksPerformed,
      materialsReceived,
      incidentNotes,
      observations,
      photos,
      progressRecorded,
    } = req.body;

    const newLog = await prisma.siteDailyLog.create({
      data: {
        executionId,
        date: date ? new Date(date) : new Date(),
        weatherConditions: weatherConditions || null,
        workersPresent: workersPresent || [],
        tasksPerformed: tasksPerformed || [],
        materialsReceived: materialsReceived || [],
        incidentNotes: incidentNotes || null,
        observations: observations || null,
        photos: photos || [],
        progressRecorded: progressRecorded || null,
        createdById: (req as any).user?.id || null,
        createdByName: (req as any).user?.name || null,
      },
    });

    res.status(201).json({ success: true, data: newLog });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al crear diario de obra:', err);
    res.status(500).json({ error: 'Error al registrar diario de obra' });
  }
};

/**
 * Obtiene el listado del diario de obra.
 */
export const getDailyLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const logs = await prisma.siteDailyLog.findMany({
      where: { executionId },
      orderBy: { date: 'desc' },
    });
    res.json({ success: true, data: logs });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al listar diarios de obra:', err);
    res.status(500).json({ error: 'Error al listar diario de obra' });
  }
};

/**
 * Registra una incidencia de obra.
 */
export const createIncident = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const processed = SiteManagementEngine.processIncident({
      ...req.body,
      executionId,
    });

    const newIncident = await prisma.constructionIncident.create({
      data: {
        id: processed.id,
        executionId,
        title: processed.title,
        description: processed.description,
        type: processed.type,
        priority: processed.priority,
        status: processed.status,
        location: processed.location,
        phaseId: processed.phaseId,
        taskId: processed.taskId,
        responsibleAssignee: processed.responsibleAssignee,
        dateReported: new Date(processed.dateReported),
        photos: processed.photos,
        documents: processed.documents,
        requiresProReview: processed.requiresProReview,
        proReviewNotes: processed.proReviewNotes,
      },
    });

    res.status(201).json({ success: true, data: newIncident });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al registrar incidencia:', err);
    res.status(500).json({ error: 'Error al registrar incidencia' });
  }
};

/**
 * Actualiza una incidencia (resolución, estado, notas).
 */
export const updateIncident = async (req: Request, res: Response): Promise<void> => {
  try {
    const { incidentId } = req.params;
    const { status, resolutionNotes, resolutionDate, priority } = req.body;

    const updated = await prisma.constructionIncident.update({
      where: { id: incidentId },
      data: {
        status: status || undefined,
        resolutionNotes: resolutionNotes || undefined,
        resolutionDate: resolutionDate ? new Date(resolutionDate) : (status === 'RESOLVED' || status === 'CLOSED' ? new Date() : undefined),
        priority: priority || undefined,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al actualizar incidencia:', err);
    res.status(500).json({ error: 'Error al actualizar incidencia' });
  }
};

/**
 * Registra una orden de cambio (Change Order).
 */
export const createChangeOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const { title, description, reason, costImpact, timeImpactDays, affectedTaskIds, affectedItemIds } = req.body;

    const impact = SiteManagementEngine.evaluateChangeOrderImpact({
      title,
      costImpact,
      timeImpactDays,
    });

    const code = `CO-${Date.now().toString().slice(-4)}`;

    const newChangeOrder = await prisma.constructionChangeOrder.create({
      data: {
        executionId,
        code,
        title,
        description,
        reason,
        status: 'PENDING_APPROVAL',
        impact: impact as any,
        requestedBy: (req as any).user?.name || 'Usuario',
        affectedTaskIds: affectedTaskIds || [],
        affectedItemIds: affectedItemIds || [],
      },
      include: { approvals: true },
    });

    res.status(201).json({ success: true, data: newChangeOrder });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al crear orden de cambio:', err);
    res.status(500).json({ error: 'Error al registrar orden de cambio' });
  }
};

/**
 * Actualiza una orden de cambio o procesa su aprobación/rechazo.
 */
export const updateChangeOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { changeOrderId } = req.params;
    const { decision, comments } = req.body;

    const changeOrder = await prisma.constructionChangeOrder.findUnique({
      where: { id: changeOrderId },
      include: { approvals: true },
    });

    if (!changeOrder) {
      res.status(404).json({ error: 'Orden de cambio no encontrada' });
      return;
    }

    if (decision) {
      const user = (req as any).user?.name || 'Administrador';
      await prisma.executionApproval.create({
        data: {
          changeOrderId,
          requestedBy: changeOrder.requestedBy,
          approvedBy: user,
          decision,
          comments: comments || null,
        },
      });

      const updatedCO = await prisma.constructionChangeOrder.update({
        where: { id: changeOrderId },
        data: {
          status: decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'CANCELLED',
        },
        include: { approvals: true },
      });

      res.json({ success: true, data: updatedCO });
      return;
    }

    res.json({ success: true, data: changeOrder });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al actualizar orden de cambio:', err);
    res.status(500).json({ error: 'Error al actualizar orden de cambio' });
  }
};

/**
 * Registra una inspección de calidad (Quality Inspection).
 */
export const createInspection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const { element, phaseName, taskId, inspectorName, result, observations, photos } = req.body;

    const newInspection = await prisma.qualityInspection.create({
      data: {
        executionId,
        element,
        phaseName: phaseName || null,
        taskId: taskId || null,
        inspectorName: inspectorName || (req as any).user?.name || 'Inspector Técnico',
        result: result || 'PASS',
        observations: observations || null,
        photos: photos || [],
      },
    });

    res.status(201).json({ success: true, data: newInspection });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al registrar inspección:', err);
    res.status(500).json({ error: 'Error al registrar inspección' });
  }
};

/**
 * Registra una entrega de material (Material Delivery).
 */
export const createDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const { materialName, supplierId, expectedDate, actualDate, quantity, unit, status, location, notes } = req.body;

    const newDelivery = await prisma.materialDelivery.create({
      data: {
        executionId,
        materialName,
        supplierId: supplierId || null,
        expectedDate: expectedDate ? new Date(expectedDate) : new Date(),
        actualDate: actualDate ? new Date(actualDate) : (status === 'DELIVERED' ? new Date() : null),
        quantity: quantity || 1,
        unit: unit || 'ud',
        status: status || 'EXPECTED',
        location: location || null,
        notes: notes || null,
        receivedBy: (req as any).user?.name || null,
      },
    });

    res.status(201).json({ success: true, data: newDelivery });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al registrar entrega de material:', err);
    res.status(500).json({ error: 'Error al registrar entrega' });
  }
};

/**
 * Registra una fotografía de obra (Site Photo).
 */
export const createPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const { photoUrl, caption, photoType, stage, phaseId, taskId, incidentId, inspectionId, location } = req.body;

    const newPhoto = await prisma.sitePhoto.create({
      data: {
        executionId,
        photoUrl,
        caption: caption || null,
        photoType: photoType || 'PROGRESS',
        stage: stage || 'DURING',
        phaseId: phaseId || null,
        taskId: taskId || null,
        incidentId: incidentId || null,
        inspectionId: inspectionId || null,
        location: location || null,
      },
    });

    res.status(201).json({ success: true, data: newPhoto });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al guardar fotografía:', err);
    res.status(500).json({ error: 'Error al registrar fotografía' });
  }
};

/**
 * Cierre definitivo de obra (Project Closure) con validación de requisitos.
 */
export const closeExecutionProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const { forceClose, notes } = req.body;

    const execution = await prisma.executionProject.findUnique({
      where: { id: executionId },
      include: executionIncludeClause,
    });

    if (!execution) {
      res.status(404).json({ error: 'Ejecución de obra no encontrada' });
      return;
    }

    const dto = mapPrismaExecutionToDto(execution, (execution as any).project?.name);
    const checklist = SiteManagementEngine.validateProjectClosure(dto);

    if (!checklist.canClose && !forceClose) {
      res.status(400).json({
        success: false,
        error: 'No es posible cerrar la obra debido a bloqueos pendientes.',
        checklist,
      });
      return;
    }

    const userName = (req as any).user?.name || 'Administrador';

    const closure = await prisma.projectClosure.upsert({
      where: { executionId },
      update: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userName,
        checklist: checklist as any,
        notes: notes || null,
      },
      create: {
        executionId,
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userName,
        checklist: checklist as any,
        notes: notes || null,
      },
    });

    await prisma.executionProject.update({
      where: { id: executionId },
      data: {
        status: 'CLOSED',
        actualEndDate: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Obra cerrada satisfactoriamente con verificación técnica.',
      data: closure,
    });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al cerrar obra:', err);
    res.status(500).json({ error: 'Error al cerrar la obra' });
  }
};

/**
 * Obtiene la vista protegida del cliente (Client View).
 */
export const getClientView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;

    const execution = await prisma.executionProject.findUnique({
      where: { id: executionId },
      include: executionIncludeClause,
    });

    if (!execution) {
      res.status(404).json({ error: 'Ejecución no encontrada' });
      return;
    }

    const dto = mapPrismaExecutionToDto(execution, (execution as any).project?.name);
    const clientView = ConstructionExecutionEngine.buildClientView(dto, (execution as any).project?.name || 'Proyecto');

    res.json({ success: true, data: clientView });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al obtener vista de cliente:', err);
    res.status(500).json({ error: 'Error al obtener vista de cliente' });
  }
};

/**
 * Obtiene la vista de contratista / operario (Contractor View).
 */
export const getContractorView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const userId = (req as any).user?.id;

    const execution = await prisma.executionProject.findUnique({
      where: { id: executionId },
      include: executionIncludeClause,
    });

    if (!execution) {
      res.status(404).json({ error: 'Ejecución no encontrada' });
      return;
    }

    const dto = mapPrismaExecutionToDto(execution, (execution as any).project?.name);
    const contractorView = ConstructionExecutionEngine.buildContractorView(dto, (execution as any).project?.name || 'Proyecto', userId);

    res.json({ success: true, data: contractorView });
  } catch (err: any) {
    logger.error('PROJECT', 'Error al obtener vista de contratista:', err);
    res.status(500).json({ error: 'Error al obtener vista de contratista' });
  }
};
