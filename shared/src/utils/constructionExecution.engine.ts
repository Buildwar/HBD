/**
 * HBD — HOME BOARD DESIGNER (V15.0.0)
 * Construction Execution & Site Management Engine (Master Engine)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  ExecutionProjectDto,
  ExecutionStatus,
  WorkPackageDto,
  ExecutionTaskDto,
  MaterialExecutionItemDto,
  ProjectHealth,
  ExecutionDashboardDto,
  ClientViewDto,
  ContractorViewDto,
  ScheduleVariance,
  CostVariance,
  HealthStatus,
  ExecutionMilestoneDto,
} from '../types/execution.types.js';
import { ConstructionProjectDto } from '../types/construction.types.js';
import { ProgressTrackingEngine } from './progressTracking.engine.js';
import { ExecutionCostEngine } from './executionCost.engine.js';
import { MaterialExecutionEngine } from './materialExecution.engine.js';
import { SiteManagementEngine } from './siteManagement.engine.js';

export class ConstructionExecutionEngine {
  /**
   * Crea o inicializa un ExecutionProject a partir de un proyecto planificado en V11,
   * manteniendo trazabilidad con V12 (escenarios) y V13 (alternativas de diseño).
   */
  public static createExecutionFromConstruction(params: {
    projectId: string;
    construction: ConstructionProjectDto;
    scenarioId?: string | null;
    alternativeId?: string | null;
    startDate?: string | null;
    notes?: string | null;
  }): ExecutionProjectDto {
    const {
      projectId,
      construction,
      scenarioId = null,
      alternativeId = null,
      startDate = new Date().toISOString(),
      notes = null,
    } = params;

    const executionId = `exec-${Date.now()}`;

    // Convertir fases de V11 a WorkPackages de V15
    const workPackages: WorkPackageDto[] = (construction.phases || []).map((phase, pIdx) => {
      const wpId = `wp-${pIdx + 1}-${Date.now()}`;
      const tasks: ExecutionTaskDto[] = (phase.tasks || []).map((t, tIdx) => ({
        id: `etask-${pIdx + 1}-${tIdx + 1}-${Date.now()}`,
        executionId,
        workPackageId: wpId,
        constructionTaskId: t.id,
        name: t.name,
        description: t.description || null,
        status: t.status === 'DONE' ? 'COMPLETED' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'NOT_STARTED',
        progress: t.status === 'DONE' ? 100 : 0,
        plannedDurationDays: Math.max(1, Math.round((phase.estimatedDurationDays || 7) / Math.max(1, phase.tasks.length))),
        actualDurationDays: 0,
        plannedStart: phase.startDate || startDate,
        actualStart: null,
        plannedEnd: phase.endDate || null,
        actualEnd: null,
        assigneeType: 'WORKER',
        assigneeId: t.assigneeId || null,
        assigneeName: t.assigneeName || null,
        notes: null,
        dependencies: t.dependencies || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return {
        id: wpId,
        executionId,
        phaseId: phase.id,
        phaseName: phase.name,
        name: `Paquete: ${phase.name}`,
        description: phase.description || null,
        order: phase.order ?? pIdx,
        status: phase.status === 'DONE' ? 'COMPLETED' : phase.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'NOT_STARTED',
        progress: phase.status === 'DONE' ? 100 : 0,
        tasks,
        itemIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // Aplanar tareas
    const allTasks: ExecutionTaskDto[] = workPackages.flatMap((wp) => wp.tasks);

    // Convertir items de V11 a materiales/partidas de ejecución V15
    const materials: MaterialExecutionItemDto[] = (construction.items || []).map((item, idx) => ({
      id: `mat-${idx + 1}-${Date.now()}`,
      executionId,
      constructionItemId: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      plannedQuantity: item.effectiveQuantity || item.quantity,
      orderedQuantity: 0,
      receivedQuantity: 0,
      usedQuantity: 0,
      wasteQuantity: 0,
      remainingQuantity: item.effectiveQuantity || item.quantity,
      unitCost: item.quantity > 0 ? Number((item.totalCost / item.quantity).toFixed(2)) : 0,
      totalCommittedCost: 0,
      totalActualCost: 0,
      status: 'PLANNED',
      supplierId: item.supplierId || null,
      supplierName: item.supplierName || null,
      notes: item.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Hitos por defecto a partir de fases
    const milestones: ExecutionMilestoneDto[] = [
      {
        id: `ms-start-${Date.now()}`,
        executionId,
        title: 'Inicio y Replanteo de Obra',
        description: 'Acta de replanteo e inicio de trabajos materiales',
        targetDate: startDate || new Date().toISOString(),
        status: 'IN_PROGRESS',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...workPackages.map((wp, i) => ({
        id: `ms-wp-${i + 1}-${Date.now()}`,
        executionId,
        title: `Hito: Finalización ${wp.name}`,
        description: `Completar todos los trabajos del paquete ${wp.name}`,
        targetDate: wp.tasks[0]?.plannedEnd || new Date(Date.now() + (i + 1) * 7 * 86400000).toISOString(),
        status: 'PENDING' as const,
        order: i + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      {
        id: `ms-end-${Date.now()}`,
        executionId,
        title: 'Entrega y Cierre de Obra',
        description: 'Inspección final, limpieza y entrega al cliente',
        targetDate: construction.targetEndDate || new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'PENDING',
        order: workPackages.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const initialBudget = construction.grandTotalCost || 0;
    const progress = ProgressTrackingEngine.calculateGlobalProgress({ tasks: allTasks, workPackages });
    const scheduleVariance = ProgressTrackingEngine.calculateScheduleVariance({
      startDate,
      plannedEndDate: construction.targetEndDate,
      tasks: allTasks,
      phases: construction.phases?.map((p) => ({
        id: p.id,
        name: p.name,
        estimatedDurationDays: p.estimatedDurationDays,
        startDate: p.startDate,
        endDate: p.endDate,
      })),
    });

    const costVariance = ExecutionCostEngine.calculateCostVariance({
      initialBudget,
      v11Budget: initialBudget,
      materials,
    });

    const health = this.evaluateProjectHealth({
      schedule: scheduleVariance,
      cost: costVariance,
      incidents: [],
      inspections: [],
      materials,
      progress,
    });

    return {
      id: executionId,
      projectId,
      constructionProjectId: construction.id,
      scenarioId,
      alternativeId,
      status: 'READY',
      startDate,
      plannedEndDate: construction.targetEndDate || null,
      actualEndDate: null,
      progress,
      notes,
      workPackages,
      tasks: allTasks,
      materials,
      deliveries: [],
      purchaseOrders: [],
      invoices: [],
      dailyLogs: [],
      incidents: [],
      changeOrders: [],
      inspections: [],
      milestones,
      photos: [],
      closure: null,
      health,
      scheduleVariance,
      costVariance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evalúa los indicadores independientes de salud del proyecto.
   */
  public static evaluateProjectHealth(params: {
    schedule: ScheduleVariance;
    cost: CostVariance;
    incidents: any[];
    inspections: any[];
    materials: MaterialExecutionItemDto[];
    progress: number;
  }): ProjectHealth {
    const { schedule, cost, incidents, inspections, materials, progress } = params;

    // 1. Schedule
    const scheduleStatus: HealthStatus = schedule.status || 'ON_TRACK';

    // 2. Cost
    const costStatus: HealthStatus = cost.status || 'ON_TRACK';

    // 3. Progress
    let progressStatus: HealthStatus = 'ON_TRACK';
    if (progress === 0 && schedule.actualDurationDays > 5) {
      progressStatus = 'AT_RISK';
    } else if (scheduleStatus === 'DELAYED') {
      progressStatus = 'DELAYED';
    }

    // 4. Material
    let materialStatus: HealthStatus = 'ON_TRACK';
    const consumedWithoutDeliveries = materials.some(
      (m) => m.usedQuantity > 0 && m.receivedQuantity === 0 && m.plannedQuantity > 0
    );
    if (consumedWithoutDeliveries) {
      materialStatus = 'AT_RISK';
    }

    // 5. Incidents
    let incidentStatus: HealthStatus = 'ON_TRACK';
    const openCritical = incidents.filter((i) => (i.status === 'OPEN' || i.status === 'IN_PROGRESS') && i.priority === 'CRITICAL');
    const openCount = incidents.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
    if (openCritical.length > 0) {
      incidentStatus = 'DELAYED';
    } else if (openCount > 3) {
      incidentStatus = 'AT_RISK';
    }

    // 6. Quality
    let qualityStatus: HealthStatus = 'ON_TRACK';
    const failed = inspections.filter((i) => i.result === 'FAIL').length;
    const warnings = inspections.filter((i) => i.result === 'WARNING').length;
    if (failed > 0) {
      qualityStatus = 'DELAYED';
    } else if (warnings > 2) {
      qualityStatus = 'AT_RISK';
    }

    return {
      scheduleStatus,
      costStatus,
      progressStatus,
      materialStatus,
      incidentStatus,
      qualityStatus,
      explanations: {
        schedule:
          scheduleStatus === 'DELAYED'
            ? `Retraso proyectado de ${schedule.delayDays} días (${schedule.delayPercent}% sobre plazo).`
            : scheduleStatus === 'AT_RISK'
            ? `Riesgo de desviación temporal (${schedule.delayDays} días estimados).`
            : 'Planificación temporal dentro del margen previsto.',
        cost:
          costStatus === 'DELAYED'
            ? `Sobrecoste de ${cost.varianceAbsolute.toFixed(2)} € (+${cost.variancePercent}% sobre presupuesto).`
            : costStatus === 'AT_RISK'
            ? `Riesgo de sobrecoste (+${cost.variancePercent}% sobre presupuesto).`
            : 'Costes y compromisos controlados según presupuesto.',
        progress:
          progressStatus === 'DELAYED'
            ? 'Ritmo de avance significativamente inferior al cronograma.'
            : 'Avance adecuado de los paquetes de trabajo.',
        material:
          materialStatus === 'AT_RISK'
            ? 'Discrepancia entre consumos y recepciones de material.'
            : 'Aprovisionamiento y acopio de materiales en orden.',
        incident:
          incidentStatus === 'DELAYED'
            ? `Existen ${openCritical.length} incidencia(s) críticas abiertas en obra.`
            : `Incidencias registradas: ${openCount} abiertas.`,
        quality:
          qualityStatus === 'DELAYED'
            ? `Hay ${failed} inspección(es) con fallo de calidad.`
            : 'Inspecciones técnicas de calidad conformes.',
      },
    };
  }

  /**
   * Construye los datos agregados para el dashboard principal de ejecución.
   */
  public static buildExecutionDashboard(execution: ExecutionProjectDto): ExecutionDashboardDto {
    const pendingTasksCount = execution.tasks.filter((t) => t.status === 'NOT_STARTED' || t.status === 'IN_PROGRESS').length;
    const blockedTasksCount = execution.tasks.filter((t) => t.status === 'BLOCKED').length;
    const openIncidents = execution.incidents.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');
    const criticalIncidentsCount = openIncidents.filter((i) => i.priority === 'CRITICAL').length;
    const pendingApprovalsCount = execution.changeOrders.filter((c) => c.status === 'PENDING_APPROVAL').length;
    const pendingDeliveriesCount = execution.deliveries.filter((d) => d.status === 'EXPECTED' || d.status === 'IN_TRANSIT').length;

    const upcomingMilestones = execution.milestones
      .filter((m) => m.status !== 'COMPLETED')
      .slice(0, 4);

    const recentDailyLogs = [...execution.dailyLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const recentPhotos = [...execution.photos]
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())
      .slice(0, 6);

    return {
      executionId: execution.id,
      projectId: execution.projectId,
      status: execution.status,
      progress: execution.progress,
      health: execution.health,
      schedule: execution.scheduleVariance,
      cost: execution.costVariance,
      pendingTasksCount,
      blockedTasksCount,
      openIncidentsCount: openIncidents.length,
      criticalIncidentsCount,
      pendingApprovalsCount,
      pendingDeliveriesCount,
      upcomingMilestones,
      recentDailyLogs,
      recentPhotos,
    };
  }

  /**
   * Construye la vista protegida para el cliente (Client View).
   * Oculta detalles internos de costes de subcontratación o incidencias no pertinentes.
   */
  public static buildClientView(execution: ExecutionProjectDto, projectName: string): ClientViewDto {
    const completedMilestones = execution.milestones.filter((m) => m.status === 'COMPLETED');
    const upcomingMilestones = execution.milestones.filter((m) => m.status !== 'COMPLETED');
    const publicPhotos = execution.photos.filter((p) => p.photoType === 'PROGRESS' || p.photoType === 'BEFORE' || p.photoType === 'AFTER');

    const pendingClientApprovals = execution.changeOrders
      .filter((co) => co.status === 'PENDING_APPROVAL')
      .map((co) => ({
        id: co.id,
        title: co.title,
        description: co.description,
        costImpact: co.impact.costImpact,
        timeImpactDays: co.impact.timeImpactDays,
        requestDate: co.requestDate,
      }));

    const approvedChangesCost = execution.changeOrders
      .filter((co) => co.status === 'APPROVED' || co.status === 'IMPLEMENTED')
      .reduce((acc, co) => acc + (co.impact.costImpact || 0), 0);

    const initialBudget = execution.costVariance.v11Budget || execution.costVariance.initialBudget;

    return {
      projectName,
      status: execution.status,
      progress: execution.progress,
      startDate: execution.startDate,
      plannedEndDate: execution.plannedEndDate,
      completedMilestones,
      upcomingMilestones,
      recentPhotos: publicPhotos.slice(0, 12),
      pendingClientApprovals,
      budgetSummary: {
        initialBudget,
        approvedChanges: approvedChangesCost,
        currentTotal: initialBudget + approvedChangesCost,
        progressPercent: execution.progress,
      },
    };
  }

  /**
   * Construye la vista de operario / contratista en obra (Contractor View).
   */
  public static buildContractorView(
    execution: ExecutionProjectDto,
    projectName: string,
    assigneeId?: string
  ): ContractorViewDto {
    const assignedTasks = assigneeId
      ? execution.tasks.filter((t) => t.assigneeId === assigneeId)
      : execution.tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

    const upcomingDeliveries = execution.deliveries.filter(
      (d) => d.status === 'EXPECTED' || d.status === 'IN_TRANSIT' || d.status === 'DELAYED'
    );

    const assignedIncidents = execution.incidents.filter(
      (i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS'
    );

    const todayChecklist = execution.workPackages.flatMap((wp) =>
      wp.tasks.map((t) => ({
        id: t.id,
        label: `${wp.phaseName || wp.name}: ${t.name}`,
        isDone: t.status === 'COMPLETED',
        phaseName: wp.phaseName || wp.name,
      }))
    );

    return {
      projectName,
      assignedTasks,
      upcomingDeliveries,
      assignedIncidents,
      todayChecklist,
      recentPhotos: execution.photos.slice(0, 8),
    };
  }
}
