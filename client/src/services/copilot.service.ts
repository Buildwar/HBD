/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Client API Service for Copilot Chat, Conversations, Actions & Audit
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  AICopilotChatRequest,
  AICopilotChatResponse,
  AIConversation,
  AIInteractionLog,
  AIUsageStats,
  AIToolDefinition,
  AICopilotAction,
} from '@hbd/shared';

const API_BASE = '/api/ai';

export const copilotService = {
  async chat(request: AICopilotChatRequest): Promise<AICopilotChatResponse> {
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al comunicarse con el Copiloto.');
    }
    return json.data;
  },

  async getConversations(projectId?: string, propertyId?: string): Promise<AIConversation[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (propertyId) params.append('propertyId', propertyId);

    const res = await fetch(`${API_BASE}/conversations?${params.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al obtener conversaciones.');
    }
    return json.data;
  },

  async getConversation(id: string): Promise<AIConversation> {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al obtener la conversación.');
    }
    return json.data;
  },

  async createConversation(projectId?: string, propertyId?: string, title?: string): Promise<AIConversation> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, propertyId, title }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al crear conversación.');
    }
    return json.data;
  },

  async deleteConversation(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al eliminar conversación.');
    }
  },

  async confirmAction(actionId: string): Promise<AICopilotAction> {
    const res = await fetch(`${API_BASE}/actions/${actionId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al confirmar la acción.');
    }
    return json.data;
  },

  async cancelAction(actionId: string): Promise<AICopilotAction> {
    const res = await fetch(`${API_BASE}/actions/${actionId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al cancelar la acción.');
    }
    return json.data;
  },

  async getInteractions(projectId?: string, propertyId?: string): Promise<AIInteractionLog[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (propertyId) params.append('propertyId', propertyId);

    const res = await fetch(`${API_BASE}/interactions?${params.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al obtener interacciones de auditoría.');
    }
    return json.data;
  },

  async getUsage(): Promise<AIUsageStats> {
    const res = await fetch(`${API_BASE}/usage`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al obtener estadísticas de uso.');
    }
    return json.data;
  },

  async getTools(): Promise<AIToolDefinition[]> {
    const res = await fetch(`${API_BASE}/tools`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Error al obtener herramientas.');
    }
    return json.data;
  },
};
