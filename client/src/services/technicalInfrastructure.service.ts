/**
 * HBD — HOME BOARD DESIGNER
 * Technical Infrastructure Client API Service (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { api } from './api.js';
import {
  TechnicalElementDto,
  TechnicalConnectionDto,
  TechnicalZoneDto,
  TechnicalSummaryDto,
  WiFiCoverageAnalysisDto,
  TechnicalValidationResultDto,
  CreateTechnicalElementInput,
  CreateTechnicalConnectionInput,
  CreateTechnicalZoneInput
} from '@hbd/shared';

export const technicalInfrastructureService = {
  // Elementos
  async getElements(projectId: string): Promise<TechnicalElementDto[]> {
    const res = await api.get<{ success: boolean; data: TechnicalElementDto[] }>(
      `/technical/projects/${projectId}/elements`
    );
    return res.data || [];
  },

  async createElement(projectId: string, input: CreateTechnicalElementInput & { autoSync?: boolean; estimatedCost?: number }): Promise<TechnicalElementDto> {
    const res = await api.post<{ success: boolean; data: TechnicalElementDto }>(
      `/technical/projects/${projectId}/elements`,
      input
    );
    return res.data;
  },

  async updateElement(id: string, input: Partial<CreateTechnicalElementInput>): Promise<TechnicalElementDto> {
    const res = await api.put<{ success: boolean; data: TechnicalElementDto }>(
      `/technical/elements/${id}`,
      input
    );
    return res.data;
  },

  async deleteElement(id: string): Promise<void> {
    await api.delete(`/technical/elements/${id}`);
  },

  async syncElement(id: string): Promise<any> {
    const res = await api.post<{ success: boolean; data: any }>(`/technical/elements/${id}/sync`);
    return res.data;
  },

  // Conexiones
  async getConnections(projectId: string): Promise<TechnicalConnectionDto[]> {
    const res = await api.get<{ success: boolean; data: TechnicalConnectionDto[] }>(
      `/technical/projects/${projectId}/connections`
    );
    return res.data || [];
  },

  async createConnection(projectId: string, input: CreateTechnicalConnectionInput): Promise<TechnicalConnectionDto> {
    const res = await api.post<{ success: boolean; data: TechnicalConnectionDto }>(
      `/technical/projects/${projectId}/connections`,
      input
    );
    return res.data;
  },

  async deleteConnection(id: string): Promise<void> {
    await api.delete(`/technical/connections/${id}`);
  },

  // Zonas / Cuadros
  async getZones(projectId: string): Promise<TechnicalZoneDto[]> {
    const res = await api.get<{ success: boolean; data: TechnicalZoneDto[] }>(
      `/technical/projects/${projectId}/zones`
    );
    return res.data || [];
  },

  async createZone(projectId: string, input: CreateTechnicalZoneInput): Promise<TechnicalZoneDto> {
    const res = await api.post<{ success: boolean; data: TechnicalZoneDto }>(
      `/technical/projects/${projectId}/zones`,
      input
    );
    return res.data;
  },

  async deleteZone(id: string): Promise<void> {
    await api.delete(`/technical/zones/${id}`);
  },

  // Resumen, Simulación Wi-Fi y Validación
  async getSummary(projectId: string): Promise<TechnicalSummaryDto> {
    const res = await api.get<{ success: boolean; data: TechnicalSummaryDto }>(
      `/technical/projects/${projectId}/summary`
    );
    return res.data;
  },

  async simulateWiFiHeatmap(projectId: string): Promise<WiFiCoverageAnalysisDto> {
    const res = await api.get<{ success: boolean; data: WiFiCoverageAnalysisDto }>(
      `/technical/projects/${projectId}/wifi-heatmap`
    );
    return res.data;
  },

  async validateInfrastructure(projectId: string): Promise<TechnicalValidationResultDto> {
    const res = await api.get<{ success: boolean; data: TechnicalValidationResultDto }>(
      `/technical/projects/${projectId}/validate`
    );
    return res.data;
  }
};
