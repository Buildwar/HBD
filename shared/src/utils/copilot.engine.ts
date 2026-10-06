/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Master Copilot Engine Facade
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  AIProjectContext,
  AICopilotChatRequest,
  AICopilotChatResponse,
  AIConversation,
  AIMessage,
  AICopilotAction,
  AIActionStatus,
} from '../types/copilot.types.js';
import { CopilotOrchestratorEngine } from './copilotOrchestrator.engine.js';
import { CopilotActionEngine } from './copilotAction.engine.js';
import { CopilotToolRegistry } from './copilotToolRegistry.js';
import { CopilotContextEngine } from './copilotContext.engine.js';
import { CopilotIntentEngine } from './copilotIntent.engine.js';

export class AICopilotEngine {
  /**
   * Processes a full chat request with the Copilot.
   */
  public static async chat(
    request: AICopilotChatRequest,
    userPermissions: string[] = ['ai.read', 'ai.use', 'ai.execute']
  ): Promise<AICopilotChatResponse> {
    const userMessageObj: AIMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: request.conversationId || `conv_${Date.now()}`,
      sender: 'USER',
      content: request.message,
      createdAt: new Date().toISOString(),
    };

    const initialConv: AIConversation = {
      id: request.conversationId || `conv_${Date.now()}`,
      userId: 'current_user',
      projectId: request.projectId,
      propertyId: request.propertyId,
      title: request.message.slice(0, 40) + '...',
      context: request.context as AIProjectContext,
      isPinned: false,
      messages: [userMessageObj],
      actions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return CopilotOrchestratorEngine.processMessage({
      userMessage: request.message,
      conversation: initialConv,
      context: request.context as AIProjectContext,
      userPermissions,
    });
  }

  /**
   * Confirms or rejects a pending AI action.
   */
  public static handleActionConfirmation(
    action: AICopilotAction,
    confirmed: boolean,
    executionResult?: any
  ): { success: boolean; action: AICopilotAction; error?: string } {
    const targetStatus: AIActionStatus = confirmed ? 'EXECUTED' : 'REJECTED';
    return CopilotActionEngine.transitionActionStatus(action, targetStatus, executionResult);
  }

  /**
   * Helper accessors
   */
  public static getToolRegistry() {
    return CopilotToolRegistry;
  }

  public static getContextEngine() {
    return CopilotContextEngine;
  }

  public static getIntentEngine() {
    return CopilotIntentEngine;
  }

  public static getActionEngine() {
    return CopilotActionEngine;
  }
}
