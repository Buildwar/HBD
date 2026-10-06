/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * SERVICIO FRONTEND DE OPTIMIZACIÓN DE DISEÑO
 * DESIGN OPTIMIZATION SERVICE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  OptimizationResultDto,
  OptimizationRequestDto,
  DesignAlternativeDto,
  CreateOptimizationInput,
  ScenarioComparisonDto,
} from '@hbd/shared';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('hbd_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const optimizationService = {
  /**
   * Ejecuta una optimización de diseño para el proyecto
   */
  async runOptimization(projectId: string, input: Partial<CreateOptimizationInput>): Promise<OptimizationResultDto> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/optimization`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al ejecutar optimización');
    return json.data;
  },

  /**
   * Obtiene todas las solicitudes de optimización de un proyecto
   */
  async getOptimizationRequests(projectId: string): Promise<OptimizationRequestDto[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/optimization/requests`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener solicitudes de optimización');
    return json.data;
  },

  /**
   * Obtiene el detalle de una solicitud de optimización
   */
  async getOptimizationRequest(requestId: string): Promise<OptimizationRequestDto> {
    const res = await fetch(`${API_BASE}/optimization/${requestId}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener detalle de la optimización');
    return json.data;
  },

  /**
   * Obtiene las alternativas generadas en una solicitud
   */
  async getAlternatives(requestId: string): Promise<DesignAlternativeDto[]> {
    const res = await fetch(`${API_BASE}/optimization/${requestId}/alternatives`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener alternativas');
    return json.data;
  },

  /**
   * Compara de 2 a 4 alternativas seleccionadas
   */
  async compareAlternatives(requestId: string, alternativeIds: string[]): Promise<ScenarioComparisonDto> {
    const res = await fetch(`${API_BASE}/optimization/${requestId}/compare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ alternativeIds }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al comparar alternativas');
    return json.data;
  },

  /**
   * Obtiene el detalle de una alternativa individual
   */
  async getAlternative(alternativeId: string): Promise<DesignAlternativeDto> {
    const res = await fetch(`${API_BASE}/alternatives/${alternativeId}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener alternativa');
    return json.data;
  },

  /**
   * Registra la selección de una alternativa por el usuario (SELECTED)
   */
  async selectAlternative(alternativeId: string): Promise<DesignAlternativeDto> {
    const res = await fetch(`${API_BASE}/alternatives/${alternativeId}/select`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al seleccionar alternativa');
    return json.data;
  },

  /**
   * Convierte una alternativa validada en un ProjectScenario de V12
   */
  async convertAlternativeToScenario(alternativeId: string, name?: string): Promise<{ scenario: any; alternative: DesignAlternativeDto }> {
    const res = await fetch(`${API_BASE}/alternatives/${alternativeId}/convert-to-scenario`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al convertir alternativa a escenario');
    return json.data;
  },
};
