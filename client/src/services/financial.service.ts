/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Service — Project Investment & Total Cost Intelligence
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { apiClient } from './api.js';
import {
  FinancialSummaryDto,
  FinancialForecastDto,
  CostItemDto,
  PropertyAcquisitionDto,
  ProjectPaymentDto,
  FinancialSnapshotDto,
  CreateCostItemInput,
  UpdateCostItemInput,
  CreatePaymentInput,
  SavePropertyAcquisitionInput,
  FinancialSyncOptions,
} from '@hbd/shared';

export class FinancialService {
  /**
   * Obtiene el resumen financiero consolidado del proyecto
   */
  static async getSummary(projectId: string): Promise<FinancialSummaryDto> {
    const res = await apiClient.get<{ success: boolean; data: FinancialSummaryDto }>(
      `/projects/${projectId}/financial/summary`
    );
    return res.data;
  }

  /**
   * Obtiene la proyección financiera y salud del proyecto
   */
  static async getForecast(projectId: string, baseline?: number): Promise<FinancialForecastDto> {
    const query = baseline ? `?baseline=${baseline}` : '';
    const res = await apiClient.get<{ success: boolean; data: FinancialForecastDto }>(
      `/projects/${projectId}/financial/forecast${query}`
    );
    return res.data;
  }

  /**
   * Lista todas las partidas de coste del proyecto
   */
  static async getItems(
    projectId: string,
    filters?: { category?: string; status?: string }
  ): Promise<CostItemDto[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    const q = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient.get<{ success: boolean; data: CostItemDto[] }>(
      `/projects/${projectId}/financial/items${q}`
    );
    return res.data;
  }

  /**
   * Crea una nueva partida de coste manual
   */
  static async createItem(projectId: string, data: CreateCostItemInput): Promise<CostItemDto> {
    const res = await apiClient.post<{ success: boolean; data: CostItemDto }>(
      `/projects/${projectId}/financial/items`,
      data
    );
    return res.data;
  }

  /**
   * Actualiza una partida de coste existente
   */
  static async updateItem(
    projectId: string,
    itemId: string,
    data: UpdateCostItemInput
  ): Promise<CostItemDto> {
    const res = await apiClient.put<{ success: boolean; data: CostItemDto }>(
      `/projects/${projectId}/financial/items/${itemId}`,
      data
    );
    return res.data;
  }

  /**
   * Elimina una partida de coste
   */
  static async deleteItem(projectId: string, itemId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/projects/${projectId}/financial/items/${itemId}`
    );
    return res;
  }

  /**
   * Sincroniza partidas desde V11, V15 y V16 evitando duplicidades
   */
  static async syncFinancials(
    projectId: string,
    options?: FinancialSyncOptions
  ): Promise<{ success: boolean; message: string; createdCount: number; updatedCount: number }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      createdCount: number;
      updatedCount: number;
    }>(`/projects/${projectId}/financial/sync`, options || {});
    return res;
  }

  /**
   * Obtiene datos de adquisición del inmueble
   */
  static async getAcquisition(projectId: string): Promise<PropertyAcquisitionDto | null> {
    const res = await apiClient.get<{ success: boolean; data: PropertyAcquisitionDto | null }>(
      `/projects/${projectId}/financial/acquisition`
    );
    return res.data;
  }

  /**
   * Guarda o actualiza los datos de adquisición
   */
  static async saveAcquisition(
    projectId: string,
    data: SavePropertyAcquisitionInput
  ): Promise<PropertyAcquisitionDto> {
    const res = await apiClient.post<{ success: boolean; data: PropertyAcquisitionDto }>(
      `/projects/${projectId}/financial/acquisition`,
      data
    );
    return res.data;
  }

  /**
   * Elimina los datos de adquisición del proyecto
   */
  static async deleteAcquisition(projectId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/projects/${projectId}/financial/acquisition`
    );
    return res;
  }

  /**
   * Obtiene todos los pagos registrados
   */
  static async getPayments(projectId: string): Promise<ProjectPaymentDto[]> {
    const res = await apiClient.get<{ success: boolean; data: ProjectPaymentDto[] }>(
      `/projects/${projectId}/financial/payments`
    );
    return res.data;
  }

  /**
   * Registra un nuevo pago
   */
  static async createPayment(projectId: string, data: CreatePaymentInput): Promise<ProjectPaymentDto> {
    const res = await apiClient.post<{ success: boolean; data: ProjectPaymentDto }>(
      `/projects/${projectId}/financial/payments`,
      data
    );
    return res.data;
  }

  /**
   * Elimina un pago registrado
   */
  static async deletePayment(projectId: string, paymentId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/projects/${projectId}/financial/payments/${paymentId}`
    );
    return res;
  }

  /**
   * Obtiene instantáneas financieras
   */
  static async getSnapshots(projectId: string): Promise<FinancialSnapshotDto[]> {
    const res = await apiClient.get<{ success: boolean; data: FinancialSnapshotDto[] }>(
      `/projects/${projectId}/financial/snapshots`
    );
    return res.data;
  }

  /**
   * Crea una instantánea financiera del estado actual
   */
  static async createSnapshot(
    projectId: string,
    data: { title?: string; notes?: string }
  ): Promise<FinancialSnapshotDto> {
    const res = await apiClient.post<{ success: boolean; data: FinancialSnapshotDto }>(
      `/projects/${projectId}/financial/snapshots`,
      data
    );
    return res.data;
  }
}
