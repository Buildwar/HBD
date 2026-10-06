/**
 * HBD — HOME BOARD DESIGNER (V11.0.0)
 * ConstructionClientService — Servicio Frontend para Reforma y Planificación de Obra
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { api } from './api.js';
import {
  ConstructionProjectDto,
  ConstructionPhaseDto,
  ConstructionTaskDto,
  ConstructionItemDto,
  ConstructionComparisonResult,
  ConstructionReportDto,
} from '@hbd/shared';

export const constructionService = {
  async getConstructionProject(projectId: string): Promise<{ success: boolean; data: ConstructionProjectDto }> {
    return api.get<{ success: boolean; data: ConstructionProjectDto }>(`/construction/projects/${projectId}`);
  },

  async updateConstructionProject(
    projectId: string,
    data: { status?: string; notes?: string; targetStartDate?: string; targetEndDate?: string }
  ): Promise<{ success: boolean; data: any }> {
    return api.patch<{ success: boolean; data: any }>(`/construction/projects/${projectId}`, data);
  },

  async createPhase(
    projectId: string,
    data: { name: string; description?: string; estimatedDurationDays: number; startDate?: string; endDate?: string }
  ): Promise<{ success: boolean; data: ConstructionPhaseDto }> {
    return api.post<{ success: boolean; data: ConstructionPhaseDto }>(`/construction/projects/${projectId}/phases`, data);
  },

  async createTask(
    phaseId: string,
    data: { name: string; description?: string; assigneeId?: string; dependencies?: string[] }
  ): Promise<{ success: boolean; data: ConstructionTaskDto }> {
    return api.post<{ success: boolean; data: ConstructionTaskDto }>(`/construction/phases/${phaseId}/tasks`, data);
  },

  async updateTask(
    taskId: string,
    data: { name?: string; description?: string; status?: string; assigneeId?: string; dependencies?: string[] }
  ): Promise<{ success: boolean; data: ConstructionTaskDto }> {
    return api.patch<{ success: boolean; data: ConstructionTaskDto }>(`/construction/tasks/${taskId}`, data);
  },

  async toggleChecklistItem(
    checklistId: string,
    data: { isDone: boolean; notes?: string }
  ): Promise<{ success: boolean; data: any }> {
    return api.patch<{ success: boolean; data: any }>(`/construction/checklists/${checklistId}`, data);
  },

  async createItem(
    projectId: string,
    data: {
      name: string;
      category: string;
      operation: string;
      quantity: number;
      unit: string;
      wastePercent: number;
      materialCost: number;
      laborCost: number;
      otherCost: number;
      confidence?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; data: ConstructionItemDto }> {
    return api.post<{ success: boolean; data: ConstructionItemDto }>(`/construction/projects/${projectId}/items`, data);
  },

  async deleteItem(itemId: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/construction/items/${itemId}`);
  },

  async getComparison(projectId: string): Promise<{ success: boolean; data: ConstructionComparisonResult }> {
    return api.get<{ success: boolean; data: ConstructionComparisonResult }>(`/construction/projects/${projectId}/comparison`);
  },

  async getReport(projectId: string): Promise<{ success: boolean; data: ConstructionReportDto }> {
    return api.get<{ success: boolean; data: ConstructionReportDto }>(`/construction/projects/${projectId}/report`);
  },
};
