/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * AIDesignClientService — Servicio Frontend para IA de Diseño e Interiorismo
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { api } from './api.js';
import {
  DesignPreferences,
  AIDesignProposal,
  RoomAnalysisInsight,
  ProjectDesignAnalysis,
  AICopilotCommandResponse,
  AIProviderConfig,
  AIDesignHistoryItem,
} from '@hbd/shared';

export const aiDesignService = {
  async getProviderStatus(): Promise<{ success: boolean; data: AIProviderConfig }> {
    return api.get<{ success: boolean; data: AIProviderConfig }>('/ai/design/provider-status');
  },

  async analyzeRoom(
    projectId: string,
    floorId: string,
    roomId: string
  ): Promise<{ success: boolean; data: RoomAnalysisInsight }> {
    return api.post<{ success: boolean; data: RoomAnalysisInsight }>('/ai/design/analyze-room', {
      projectId,
      floorId,
      roomId,
    });
  },

  async analyzeProject(
    projectId: string,
    floorId: string
  ): Promise<{ success: boolean; data: ProjectDesignAnalysis }> {
    return api.post<{ success: boolean; data: ProjectDesignAnalysis }>('/ai/design/analyze-project', {
      projectId,
      floorId,
    });
  },

  async generateProposals(
    projectId: string,
    floorId: string,
    targetRoomId?: string,
    preferences?: Partial<DesignPreferences>
  ): Promise<{ success: boolean; data: { proposals: AIDesignProposal[]; historyId: string } }> {
    return api.post<{ success: boolean; data: { proposals: AIDesignProposal[]; historyId: string } }>(
      '/ai/design/proposals',
      {
        projectId,
        floorId,
        targetRoomId,
        preferences,
      }
    );
  },

  async processCopilotCommand(
    projectId: string,
    floorId: string,
    prompt: string,
    targetRoomId?: string
  ): Promise<{ success: boolean; data: AICopilotCommandResponse }> {
    return api.post<{ success: boolean; data: AICopilotCommandResponse }>('/ai/design/copilot', {
      projectId,
      floorId,
      prompt,
      targetRoomId,
    });
  },

  async applyProposal(
    projectId: string,
    floorId: string,
    proposalId: string,
    historyId: string
  ): Promise<{ success: boolean; data: { success: boolean; appliedCount: number; message: string } }> {
    return api.post<{ success: boolean; data: { success: boolean; appliedCount: number; message: string } }>(
      '/ai/design/apply',
      {
        projectId,
        floorId,
        proposalId,
        historyId,
      }
    );
  },

  async saveProposalAsVariant(
    projectId: string,
    floorId: string,
    proposalId: string,
    historyId: string,
    variantName?: string
  ): Promise<{ success: boolean; data: { success: boolean; variantId: string } }> {
    return api.post<{ success: boolean; data: { success: boolean; variantId: string } }>(
      '/ai/design/save-variant',
      {
        projectId,
        floorId,
        proposalId,
        historyId,
        variantName,
      }
    );
  },

  async getProjectHistory(
    projectId: string
  ): Promise<{ success: boolean; data: AIDesignHistoryItem[] }> {
    return api.get<{ success: boolean; data: AIDesignHistoryItem[] }>(
      `/ai/design/history/${projectId}`
    );
  },
};
