/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * AI Copilot Orchestration Engine
 * 
 * Pipeline:
 * User Request -> Context Filtering -> Intent Resolution -> Tool Execution Planning
 * -> Tool Execution -> Provider Abstraction -> Validation -> Response & Actions
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  AIProjectContext,
  AICopilotProvider,
  AIToolResult,
  AICopilotChatResponse,
  AIConversation,
  AIMessage,
} from '../types/copilot.types.js';
import { CopilotToolRegistry } from './copilotToolRegistry.js';
import { CopilotContextEngine } from './copilotContext.engine.js';
import { CopilotIntentEngine } from './copilotIntent.engine.js';
import { MockCopilotAIProvider } from './mockCopilotAI.provider.js';

export class CopilotOrchestratorEngine {
  private static provider: AICopilotProvider = new MockCopilotAIProvider();

  public static setProvider(customProvider: AICopilotProvider): void {
    this.provider = customProvider;
  }

  public static getProvider(): AICopilotProvider {
    return this.provider;
  }

  /**
   * Main orchestration pipeline for a user message.
   */
  public static async processMessage(params: {
    userMessage: string;
    conversation: AIConversation;
    context?: AIProjectContext;
    userPermissions?: string[];
  }): Promise<AICopilotChatResponse> {
    const startTime = Date.now();
    const permissions = params.userPermissions || ['ai.read', 'ai.use', 'ai.execute'];
    const baseContext = params.context || params.conversation.context || {};

    // 1. Detect Intent
    const intent = CopilotIntentEngine.detectIntent(params.userMessage, baseContext);

    // 2. Filter progressive context for the intent
    const filteredContext = CopilotContextEngine.filterContextForIntent(baseContext, intent);

    // 3. Obtain available tools allowed for user permissions
    const availableTools = CopilotToolRegistry.getAllTools().filter((tool) => {
      return tool.permissions.every((p) => permissions.includes(p) || permissions.includes('*'));
    });

    // 4. Execute planning & generation with provider
    const providerResult = await this.provider.processQuery(
      params.userMessage,
      filteredContext,
      availableTools
    );

    // 5. Simulate tool execution data validation
    const toolResults: AIToolResult[] = (providerResult.toolCalls || []).map((tc) => {
      const validation = CopilotToolRegistry.validateToolCall(tc.toolName, tc.parameters, permissions);
      return {
        toolCallId: tc.id,
        toolName: tc.toolName,
        success: validation.valid,
        error: validation.error,
        durationMs: Math.floor(Math.random() * 20) + 5,
        source: 'HBD_ENGINE',
      };
    });

    const latencyMs = Date.now() - startTime;

    // 6. Assemble AIMessage
    const assistantMessage: AIMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: params.conversation.id,
      sender: 'COPILOT',
      content: providerResult.content,
      intent,
      toolCalls: providerResult.toolCalls,
      structuredPayload: providerResult.structuredPayload,
      confidence: providerResult.confidence,
      tokens: providerResult.tokensUsed.total,
      latencyMs,
      createdAt: new Date().toISOString(),
    };

    // 7. Update conversation
    const updatedMessages = [...(params.conversation.messages || []), assistantMessage];
    const updatedActions = [
      ...(params.conversation.actions || []),
      ...(providerResult.proposedActions || []),
    ];

    const updatedConversation: AIConversation = {
      ...params.conversation,
      messages: updatedMessages,
      actions: updatedActions,
      context: filteredContext,
      updatedAt: new Date().toISOString(),
    };

    return {
      conversation: updatedConversation,
      message: assistantMessage,
      proposedActions: providerResult.proposedActions,
      usage: {
        tokens: providerResult.tokensUsed.total,
        latencyMs,
        provider: this.provider.name,
        model: this.provider.id,
      },
    };
  }
}
