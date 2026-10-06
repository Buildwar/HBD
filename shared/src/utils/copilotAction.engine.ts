/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Action Lifecycle, Validation & Confirmation Engine
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { AICopilotAction, AICopilotActionType, AIRiskLevel, AIActionStatus } from '../types/copilot.types.js';

export class CopilotActionEngine {
  /**
   * Determines default risk level and confirmation requirement for an action type.
   */
  static assessActionRisk(type: AICopilotActionType): { riskLevel: AIRiskLevel; requiresConfirmation: boolean } {
    switch (type) {
      case 'REMOVE_FURNITURE':
      case 'REMOVE_TECHNICAL_ELEMENT':
      case 'REMOVE_PRODUCT':
      case 'APPLY_SCENARIO':
      case 'UPDATE_BUDGET':
        return { riskLevel: 'HIGH', requiresConfirmation: true };

      case 'ADD_FURNITURE':
      case 'MOVE_FURNITURE':
      case 'ADD_TECHNICAL_ELEMENT':
      case 'MOVE_TECHNICAL_ELEMENT':
      case 'CREATE_SCENARIO':
      case 'ADD_PRODUCT':
      case 'CHANGE_MATERIAL':
      case 'CHANGE_LAYOUT':
      case 'CREATE_PURCHASE_REQUIREMENT':
      case 'CREATE_CONSTRUCTION_TASK':
        return { riskLevel: 'MEDIUM', requiresConfirmation: true };

      case 'GENERATE_DOCUMENT':
      case 'GENERATE_RENDER':
      case 'PREPARE_AR_SESSION':
      default:
        return { riskLevel: 'LOW', requiresConfirmation: false };
    }
  }

  /**
   * Creates a structured AI action with proper risk categorization.
   */
  static createAction(params: {
    type: AICopilotActionType;
    reason: string;
    projectId?: string;
    propertyId?: string;
    conversationId?: string;
    entityType?: AICopilotAction['entityType'];
    entityId?: string;
    parameters?: Record<string, any>;
    customRisk?: AIRiskLevel;
  }): AICopilotAction {
    const riskAssessment = this.assessActionRisk(params.type);
    const riskLevel = params.customRisk || riskAssessment.riskLevel;

    return {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId: params.conversationId,
      projectId: params.projectId,
      propertyId: params.propertyId,
      type: params.type,
      entityType: params.entityType,
      entityId: params.entityId,
      parameters: params.parameters || {},
      reason: params.reason,
      confidence: 'HIGH',
      riskLevel,
      requiresConfirmation: riskAssessment.requiresConfirmation,
      status: riskAssessment.requiresConfirmation ? 'PENDING' : 'EXECUTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Validates and transitions the status of an AI action.
   */
  static transitionActionStatus(
    action: AICopilotAction,
    newStatus: AIActionStatus,
    executionResult?: any
  ): { success: boolean; action: AICopilotAction; error?: string } {
    if (action.status === 'EXECUTED' || action.status === 'CANCELLED' || action.status === 'REJECTED') {
      return {
        success: false,
        action,
        error: `No se puede modificar una acción que ya se encuentra en estado final "${action.status}".`,
      };
    }

    const updated: AICopilotAction = {
      ...action,
      status: newStatus,
      result: executionResult !== undefined ? executionResult : action.result,
      executedAt: newStatus === 'EXECUTED' ? new Date().toISOString() : action.executedAt,
      updatedAt: new Date().toISOString(),
    };

    return { success: true, action: updated };
  }
}
