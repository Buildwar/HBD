/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Risk Engine — Delay Detection & Lead Time Risk Analysis
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  ProcurementItemDto,
  ProcurementRiskItemDto,
  ProcurementRiskLevel,
} from '../types/procurement.types.js';

export class ProcurementRiskEngine {
  /**
   * Analyzes an individual procurement item for delay or delivery risk
   */
  public static analyzeItemRisk(
    item: ProcurementItemDto,
    referenceDate = new Date()
  ): ProcurementRiskItemDto | null {
    if (['COMPLETED', 'INSTALLED', 'CANCELLED'].includes(item.status)) {
      return null;
    }

    if (!item.requiredDate) {
      return {
        procurementItemId: item.id,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        requiredDate: null,
        estimatedDeliveryDate: null,
        delayDays: 0,
        riskLevel: 'UNKNOWN',
        riskReason: 'Fecha de necesidad en obra no especificada.',
        mitigationSuggestion: 'Asignar fecha límite requerida para sincronizar con el calendario de obra.',
        taskId: item.taskId,
        taskName: item.taskName,
      };
    }

    const reqDate = new Date(item.requiredDate);
    const now = referenceDate.getTime();
    const isReceived = ['RECEIVED', 'INSPECTED'].includes(item.status);
    const isOrdered = ['ORDERED', 'CONFIRMED', 'SHIPPED', 'PARTIALLY_SHIPPED'].includes(item.status);

    // Case 1: Delivery date is already in the past and item not received
    if (reqDate.getTime() < now && !isReceived) {
      const delayDays = Math.ceil((now - reqDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        procurementItemId: item.id,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        requiredDate: item.requiredDate,
        estimatedDeliveryDate: null,
        delayDays,
        riskLevel: 'CRITICAL',
        riskReason: `La fecha de necesidad (${reqDate.toLocaleDateString('es-ES')}) ha vencido con ${delayDays} días de retraso.`,
        mitigationSuggestion: 'Contactar de urgencia al proveedor o buscar suministro alternativo en stock local.',
        taskId: item.taskId,
        taskName: item.taskName,
      };
    }

    // Case 2: Lead time exceeds time remaining until required date and item is not yet ordered
    const leadTime = item.leadTimeDays || 7;
    const remainingDays = Math.ceil((reqDate.getTime() - now) / (1000 * 60 * 60 * 24));

    if (!isOrdered && !isReceived && remainingDays < leadTime) {
      const deficitDays = leadTime - remainingDays;
      return {
        procurementItemId: item.id,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        requiredDate: item.requiredDate,
        estimatedDeliveryDate: null,
        delayDays: deficitDays,
        riskLevel: item.priority === 'CRITICAL' || deficitDays > 5 ? 'CRITICAL' : 'AT_RISK',
        riskReason: `Plazo de entrega del proveedor (${leadTime} días) superior a los días restantes (${remainingDays} días).`,
        mitigationSuggestion: `Formalizar el pedido inmediatamente o solicitar servicio de transporte exprés.`,
        taskId: item.taskId,
        taskName: item.taskName,
      };
    }

    // Case 3: Approaching deadline without assigned supplier
    if (!item.supplierId && remainingDays <= 14) {
      return {
        procurementItemId: item.id,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        requiredDate: item.requiredDate,
        estimatedDeliveryDate: null,
        delayDays: 0,
        riskLevel: 'WARNING',
        riskReason: 'No hay proveedor asignado y la fecha de necesidad es próxima.',
        mitigationSuggestion: 'Comparar presupuestos y seleccionar proveedor para emitir pedido.',
        taskId: item.taskId,
        taskName: item.taskName,
      };
    }

    // Case 4: Safe
    return {
      procurementItemId: item.id,
      description: item.description,
      category: item.category,
      priority: item.priority,
      status: item.status,
      requiredDate: item.requiredDate,
      estimatedDeliveryDate: null,
      delayDays: 0,
      riskLevel: 'SAFE',
      riskReason: 'Planificación en plazo.',
      mitigationSuggestion: 'Mantener seguimiento ordinario del calendario de compras.',
      taskId: item.taskId,
      taskName: item.taskName,
    };
  }

  /**
   * Evaluates global procurement risk for the entire project
   */
  public static evaluateProjectRisks(
    items: ProcurementItemDto[],
    referenceDate = new Date()
  ): {
    overallRisk: ProcurementRiskLevel;
    criticalRisks: ProcurementRiskItemDto[];
    atRiskItems: ProcurementRiskItemDto[];
    warningItems: ProcurementRiskItemDto[];
    safeItems: ProcurementRiskItemDto[];
    allRiskItems: ProcurementRiskItemDto[];
  } {
    const criticalRisks: ProcurementRiskItemDto[] = [];
    const atRiskItems: ProcurementRiskItemDto[] = [];
    const warningItems: ProcurementRiskItemDto[] = [];
    const safeItems: ProcurementRiskItemDto[] = [];
    const allRiskItems: ProcurementRiskItemDto[] = [];

    for (const item of items) {
      const risk = this.analyzeItemRisk(item, referenceDate);
      if (!risk) continue;

      allRiskItems.push(risk);
      if (risk.riskLevel === 'CRITICAL') criticalRisks.push(risk);
      else if (risk.riskLevel === 'AT_RISK') atRiskItems.push(risk);
      else if (risk.riskLevel === 'WARNING') warningItems.push(risk);
      else if (risk.riskLevel === 'SAFE') safeItems.push(risk);
    }

    let overallRisk: ProcurementRiskLevel = 'SAFE';
    if (criticalRisks.length > 0) {
      overallRisk = 'CRITICAL';
    } else if (atRiskItems.length > 0) {
      overallRisk = 'AT_RISK';
    } else if (warningItems.length > 0) {
      overallRisk = 'WARNING';
    }

    return {
      overallRisk,
      criticalRisks,
      atRiskItems,
      warningItems,
      safeItems,
      allRiskItems,
    };
  }
}
