/**
 * HBD — HOME BOARD DESIGNER (V15.0.0)
 * Site Management, Quality, Changes & Closure Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  ConstructionIncidentDto,
  ConstructionChangeOrderDto,
  ExecutionApprovalDto,
  ApprovalDecision,
  ChangeOrderImpact,
  QualityInspectionDto,
  ProjectClosureChecklist,
  ExecutionProjectDto,
} from '../types/execution.types.js';

export class SiteManagementEngine {
  /**
   * Evalúa y valida una incidencia de obra.
   * Si es de tipo SAFETY o STRUCTURAL, marca `requiresProReview = true`.
   */
  public static processIncident(
    incident: Partial<ConstructionIncidentDto>
  ): ConstructionIncidentDto {
    const isSafetyOrStructural =
      incident.type === 'SAFETY' || incident.type === 'STRUCTURAL';

    let requiresProReview = Boolean(incident.requiresProReview || isSafetyOrStructural);
    let proReviewNotes = incident.proReviewNotes || null;

    if (isSafetyOrStructural && !proReviewNotes) {
      proReviewNotes =
        'Incidencia de seguridad/estructura: Requiere supervisión técnica presencial por arquitecto/aparejador colegiado antes de reanudar trabajos.';
    }

    return {
      id: incident.id || `inc-${Date.now()}`,
      executionId: incident.executionId || '',
      title: incident.title || 'Incidencia de Obra',
      description: incident.description || '',
      type: incident.type || 'OTHER',
      priority: incident.priority || 'MEDIUM',
      status: incident.status || 'OPEN',
      location: incident.location || null,
      phaseId: incident.phaseId || null,
      taskId: incident.taskId || null,
      responsibleAssignee: incident.responsibleAssignee || null,
      dateReported: incident.dateReported || new Date().toISOString(),
      resolutionDate: incident.resolutionDate || null,
      resolutionNotes: incident.resolutionNotes || null,
      photos: incident.photos || [],
      documents: incident.documents || [],
      requiresProReview,
      proReviewNotes,
      createdAt: incident.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evalúa el impacto económico, temporal y constructivo de una orden de cambio.
   */
  public static evaluateChangeOrderImpact(params: {
    title: string;
    costImpact?: number;
    timeImpactDays?: number;
    geometricImpact?: string | null;
    constructiveImpact?: string | null;
    documentaryImpact?: string | null;
  }): ChangeOrderImpact {
    const {
      costImpact = 0,
      timeImpactDays = 0,
      geometricImpact = null,
      constructiveImpact = null,
      documentaryImpact = null,
    } = params;

    return {
      costImpact: Number(costImpact.toFixed(2)),
      timeImpactDays: Math.round(timeImpactDays),
      geometricImpact: geometricImpact || 'Sin modificación volumétrica principal',
      constructiveImpact: constructiveImpact || 'Ajuste de ejecución de partidas',
      documentaryImpact: documentaryImpact || 'Actualización requerida en memoria y presupuesto final',
    };
  }

  /**
   * Aplica la decisión de una aprobación a una orden de cambio.
   */
  public static processApprovalDecision(
    changeOrder: ConstructionChangeOrderDto,
    approvalData: {
      requestedBy: string;
      approvedBy: string;
      decision: ApprovalDecision;
      comments?: string;
    }
  ): {
    updatedChangeOrder: ConstructionChangeOrderDto;
    newApproval: ExecutionApprovalDto;
  } {
    const newApproval: ExecutionApprovalDto = {
      id: `appr-${Date.now()}`,
      changeOrderId: changeOrder.id,
      requestedBy: approvalData.requestedBy,
      approvedBy: approvalData.approvedBy,
      decision: approvalData.decision,
      decisionDate: new Date().toISOString(),
      comments: approvalData.comments || null,
      createdAt: new Date().toISOString(),
    };

    let newStatus = changeOrder.status;
    if (approvalData.decision === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (approvalData.decision === 'REJECTED') {
      newStatus = 'REJECTED';
    } else if (approvalData.decision === 'CANCELLED') {
      newStatus = 'CANCELLED';
    }

    const updatedApprovals = [...(changeOrder.approvals || []), newApproval];

    const updatedChangeOrder: ConstructionChangeOrderDto = {
      ...changeOrder,
      status: newStatus,
      approvals: updatedApprovals,
      updatedAt: new Date().toISOString(),
    };

    return { updatedChangeOrder, newApproval };
  }

  /**
   * Valida exhaustivamente si una obra cumple todas las condiciones para el cierre definitivo.
   */
  public static validateProjectClosure(
    execution: ExecutionProjectDto
  ): ProjectClosureChecklist {
    const blockers: string[] = [];

    // 1. Tareas completadas o canceladas
    const pendingTasks = execution.tasks.filter(
      (t) => t.status === 'IN_PROGRESS' || t.status === 'BLOCKED' || t.status === 'NOT_STARTED'
    );
    const tasksCompleted = pendingTasks.length === 0;
    if (!tasksCompleted) {
      blockers.push(`Hay ${pendingTasks.length} tarea(s) de ejecución sin finalizar.`);
    }

    // 2. Incidencias abiertas o críticas
    const openIncidents = execution.incidents.filter(
      (i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS'
    );
    const criticalOpenIncidents = openIncidents.filter((i) => i.priority === 'CRITICAL');
    const incidentsClosed = openIncidents.length === 0;
    if (criticalOpenIncidents.length > 0) {
      blockers.push(`Hay ${criticalOpenIncidents.length} incidencia(s) CRÍTICA(S) sin resolver.`);
    } else if (openIncidents.length > 0) {
      blockers.push(`Hay ${openIncidents.length} incidencia(s) abiertas pendientes de cierre.`);
    }

    // 3. Inspecciones realizadas sin fallos críticos
    const failedInspections = execution.inspections.filter((i) => i.result === 'FAIL');
    const inspectionsPassed = failedInspections.length === 0;
    if (!inspectionsPassed) {
      blockers.push(`Hay ${failedInspections.length} inspección(es) con resultado NO APTO (FAIL).`);
    }

    // 4. Órdenes de cambio pendientes
    const pendingChanges = execution.changeOrders.filter(
      (co) => co.status === 'PENDING_APPROVAL' || co.status === 'DRAFT'
    );
    if (pendingChanges.length > 0) {
      blockers.push(`Hay ${pendingChanges.length} orden(es) de cambio pendientes de resolución.`);
    }

    // 5. Materiales recibidos y contabilizados
    const pendingDeliveries = execution.deliveries.filter(
      (d) => d.status === 'EXPECTED' || d.status === 'IN_TRANSIT' || d.status === 'DELAYED'
    );
    const materialsAccounted = pendingDeliveries.length === 0;
    if (!materialsAccounted) {
      blockers.push(`Hay ${pendingDeliveries.length} entrega(s) de material aún pendientes.`);
    }

    // 6. Costes y Facturas pendientes de aprobación/pago
    const pendingInvoices = execution.invoices.filter(
      (inv) => inv.status === 'PENDING' || inv.status === 'RECEIVED'
    );
    const costsLogged = pendingInvoices.length === 0;
    if (!costsLogged) {
      blockers.push(`Hay ${pendingInvoices.length} factura(s) en estado recibido/pendiente.`);
    }

    // 7. Fotografías finales y evidencias registradas
    const finalPhotos = execution.photos.filter((p) => p.stage === 'AFTER');
    const finalPhotosRecorded = finalPhotos.length > 0 || execution.photos.length > 0;

    // 8. Hitos completados
    const pendingMilestones = execution.milestones.filter(
      (m) => m.status === 'PENDING' || m.status === 'IN_PROGRESS' || m.status === 'DELAYED'
    );
    const milestonesCompleted = pendingMilestones.length === 0;
    if (!milestonesCompleted) {
      blockers.push(`Hay ${pendingMilestones.length} hito(s) del proyecto sin completar.`);
    }

    const documentsComplete = blockers.length === 0;
    const criticalBlockersCount = criticalOpenIncidents.length + failedInspections.length;
    const canClose = blockers.length === 0;

    return {
      tasksCompleted,
      incidentsClosed,
      inspectionsPassed,
      materialsAccounted,
      documentsComplete,
      costsLogged,
      finalPhotosRecorded,
      milestonesCompleted,
      criticalBlockersCount,
      blockers,
      canClose,
    };
  }

  /**
   * Prepara los datos estructurados para el informe final de obra (V14 DocumentEngine).
   */
  public static buildFinalReportPayload(params: {
    execution: ExecutionProjectDto;
    projectName: string;
    projectAddress?: string | null;
    authorName: string;
  }) {
    const { execution, projectName, projectAddress, authorName } = params;

    return {
      title: `Informe Final de Cierre de Obra — ${projectName}`,
      projectTitle: projectName,
      projectAddress: projectAddress || 'N/D',
      author: authorName,
      generatedAt: new Date().toISOString(),
      status: execution.status,
      startDate: execution.startDate || 'N/D',
      actualEndDate: execution.actualEndDate || new Date().toISOString().split('T')[0],
      progress: execution.progress,
      costSummary: {
        budget: execution.costVariance.v11Budget || execution.costVariance.initialBudget,
        actualCost: execution.costVariance.actualCost,
        variance: execution.costVariance.varianceAbsolute,
        variancePercent: execution.costVariance.variancePercent,
      },
      scheduleSummary: {
        plannedDays: execution.scheduleVariance.plannedDurationDays,
        actualDays: execution.scheduleVariance.actualDurationDays,
        delayDays: execution.scheduleVariance.delayDays,
      },
      workPackagesCount: execution.workPackages.length,
      tasksCount: execution.tasks.length,
      incidentsResolvedCount: execution.incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length,
      changesImplementedCount: execution.changeOrders.filter((c) => c.status === 'IMPLEMENTED' || c.status === 'APPROVED').length,
      inspectionsPassedCount: execution.inspections.filter((i) => i.result === 'PASS').length,
      photosCount: execution.photos.length,
      legalDisclaimer:
        'HBD — Documento de seguimiento de ejecución material. Las recepciones y liquidaciones contractuales oficiales deben formalizarse según la LOE / normativa aplicable con los técnicos competentes.',
    };
  }
}
