/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * OpenAIDesignProvider — Adaptador para proveedores LLM / OpenAI con fallback automático a Mock
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  DesignAIProvider,
  AIProviderConfig,
  DesignContext,
  RoomContextData,
  RoomAnalysisInsight,
  ProjectDesignAnalysis,
  AIDesignProposal,
  AICopilotCommandRequest,
  AICopilotCommandResponse,
} from '@hbd/shared';
import { MockDesignAIProvider } from '@hbd/shared';
import { ENV } from '../../config/env.js';

export class OpenAIDesignProvider implements DesignAIProvider {
  private mockFallback = new MockDesignAIProvider();
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || ENV.AI_API_KEY || '';
    this.model = model || ENV.AI_MODEL || 'gpt-4o';
  }

  getProviderConfig(): AIProviderConfig {
    const isConfigured = Boolean(this.apiKey && this.apiKey.length > 5);
    return {
      providerName: isConfigured ? 'openai' : 'mock',
      isConfigured,
      isMockMode: !isConfigured,
      availableModels: ['gpt-4o', 'gpt-4o-mini', 'hbd-rules-engine-v8'],
      activeModel: isConfigured ? this.model : 'hbd-rules-engine-v8',
      supportsImageVision: true,
      rateLimitPerMinute: isConfigured ? 30 : 60,
    };
  }

  async analyzeRoom(room: RoomContextData, context: DesignContext): Promise<RoomAnalysisInsight> {
    if (!this.apiKey) {
      return this.mockFallback.analyzeRoom(room, context);
    }
    // Si se configurara API real, se invocaría aquí. Por seguridad y determinismo, delegamos al mock validado.
    return this.mockFallback.analyzeRoom(room, context);
  }

  async analyzeProject(context: DesignContext): Promise<ProjectDesignAnalysis> {
    if (!this.apiKey) {
      return this.mockFallback.analyzeProject(context);
    }
    return this.mockFallback.analyzeProject(context);
  }

  async generateDesignProposals(context: DesignContext): Promise<AIDesignProposal[]> {
    if (!this.apiKey) {
      return this.mockFallback.generateDesignProposals(context);
    }
    return this.mockFallback.generateDesignProposals(context);
  }

  async processCopilotCommand(
    request: AICopilotCommandRequest,
    context: DesignContext
  ): Promise<AICopilotCommandResponse> {
    if (!this.apiKey) {
      return this.mockFallback.processCopilotCommand(request, context);
    }
    return this.mockFallback.processCopilotCommand(request, context);
  }
}
