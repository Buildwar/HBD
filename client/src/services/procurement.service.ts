/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Service — Purchasing & Project Acquisition Intelligence
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { apiClient } from './api.js';
import {
  ProcurementSummaryDto,
  ProcurementItemDto,
  SupplierQuoteDto,
  ProcurementOrderDto,
  ProcurementIncidentDto,
  ProcurementReturnDto,
  ProcurementPlanningDto,
  CreateProcurementItemInput,
  UpdateProcurementItemInput,
  CreateSupplierQuoteInput,
  CreateProcurementOrderInput,
  ReceiveProcurementOrderInput,
  CreateProcurementIncidentInput,
  CreateProcurementReturnInput,
  ProcurementSyncOptions,
} from '@hbd/shared';

export class ProcurementService {
  /**
   * Obtiene el resumen global de compras, pedidos y riesgos del proyecto
   */
  static async getSummary(projectId: string): Promise<ProcurementSummaryDto> {
    const res = await apiClient.get<{ success: boolean; data: ProcurementSummaryDto }>(
      `/projects/${projectId}/procurement/summary`
    );
    return res.data;
  }

  /**
   * Lista las partidas de compra filtrables
   */
  static async getItems(
    projectId: string,
    filters?: { category?: string; status?: string; priority?: string; supplierId?: string; roomId?: string }
  ): Promise<ProcurementItemDto[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.supplierId) params.append('supplierId', filters.supplierId);
    if (filters?.roomId) params.append('roomId', filters.roomId);
    const q = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient.get<{ success: boolean; data: ProcurementItemDto[] }>(
      `/projects/${projectId}/procurement/items${q}`
    );
    return res.data;
  }

  /**
   * Obtiene el detalle de una partida de compra con ofertas, pedidos e incidencias
   */
  static async getItemById(projectId: string, id: string): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      `/projects/${projectId}/procurement/items/${id}`
    );
    return res.data;
  }

  /**
   * Crea una nueva partida de compra manual
   */
  static async createItem(
    projectId: string,
    data: CreateProcurementItemInput
  ): Promise<ProcurementItemDto> {
    const res = await apiClient.post<{ success: boolean; data: ProcurementItemDto }>(
      `/projects/${projectId}/procurement/items`,
      data
    );
    return res.data;
  }

  /**
   * Actualiza una partida de compra
   */
  static async updateItem(
    projectId: string,
    id: string,
    data: UpdateProcurementItemInput
  ): Promise<ProcurementItemDto> {
    const res = await apiClient.put<{ success: boolean; data: ProcurementItemDto }>(
      `/projects/${projectId}/procurement/items/${id}`,
      data
    );
    return res.data;
  }

  /**
   * Elimina una partida de compra
   */
  static async deleteItem(projectId: string, id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/projects/${projectId}/procurement/items/${id}`
    );
    return res;
  }

  /**
   * Sincroniza necesidades de compra desde V11, V15 y V16
   */
  static async syncProcurement(
    projectId: string,
    options?: ProcurementSyncOptions
  ): Promise<{ success: boolean; message: string; createdCount: number; updatedCount: number }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      createdCount: number;
      updatedCount: number;
    }>(`/projects/${projectId}/procurement/sync`, options || {});
    return res;
  }

  /**
   * Registra oferta de proveedor
   */
  static async createQuote(
    projectId: string,
    data: CreateSupplierQuoteInput
  ): Promise<SupplierQuoteDto> {
    const res = await apiClient.post<{ success: boolean; data: SupplierQuoteDto }>(
      `/projects/${projectId}/procurement/quotes`,
      data
    );
    return res.data;
  }

  /**
   * Selecciona una oferta ganadora
   */
  static async selectQuote(projectId: string, quoteId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.put<{ success: boolean; message: string }>(
      `/projects/${projectId}/procurement/quotes/${quoteId}/select`,
      {}
    );
    return res;
  }

  /**
   * Obtiene pedidos emitidos a proveedores
   */
  static async getOrders(projectId: string): Promise<ProcurementOrderDto[]> {
    const res = await apiClient.get<{ success: boolean; data: ProcurementOrderDto[] }>(
      `/projects/${projectId}/procurement/orders`
    );
    return res.data;
  }

  /**
   * Crea un nuevo pedido a proveedor
   */
  static async createOrder(
    projectId: string,
    data: CreateProcurementOrderInput
  ): Promise<ProcurementOrderDto> {
    const res = await apiClient.post<{ success: boolean; data: ProcurementOrderDto }>(
      `/projects/${projectId}/procurement/orders`,
      data
    );
    return res.data;
  }

  /**
   * Registra la recepción de una entrega
   */
  static async receiveOrder(
    projectId: string,
    orderId: string,
    data: ReceiveProcurementOrderInput
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/projects/${projectId}/procurement/orders/${orderId}/receive`,
      data
    );
    return res;
  }

  /**
   * Obtiene la auditoría de riesgos de compra y retrasos
   */
  static async getRisks(projectId: string): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      `/projects/${projectId}/procurement/risks`
    );
    return res.data;
  }

  /**
   * Obtiene el plan de compras y tramos semanales
   */
  static async getPlanning(projectId: string): Promise<ProcurementPlanningDto> {
    const res = await apiClient.get<{ success: boolean; data: ProcurementPlanningDto }>(
      `/projects/${projectId}/procurement/planning`
    );
    return res.data;
  }

  /**
   * Abre una incidencia de producto o entrega
   */
  static async createIncident(
    projectId: string,
    data: CreateProcurementIncidentInput
  ): Promise<ProcurementIncidentDto> {
    const res = await apiClient.post<{ success: boolean; data: ProcurementIncidentDto }>(
      `/projects/${projectId}/procurement/incidents`,
      data
    );
    return res.data;
  }

  /**
   * Solicita una devolución de producto
   */
  static async createReturn(
    projectId: string,
    data: CreateProcurementReturnInput
  ): Promise<ProcurementReturnDto> {
    const res = await apiClient.post<{ success: boolean; data: ProcurementReturnDto }>(
      `/projects/${projectId}/procurement/returns`,
      data
    );
    return res.data;
  }
}
