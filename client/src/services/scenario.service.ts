/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * SERVICIO FRONTEND DE ESCENARIOS Y PLANIFICACIÓN
 * SCENARIO SERVICE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProjectScenarioDto,
  ScenarioComparisonDto,
  ScenarioValidationDto,
  CreateScenarioInput,
  ScenarioActionType,
} from '@hbd/shared';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('hbd_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const scenarioService = {
  /**
   * Obtiene todos los escenarios de un proyecto
   */
  async getScenariosByProject(projectId: string): Promise<ProjectScenarioDto[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/scenarios`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener escenarios');
    return json.data;
  },

  /**
   * Crea un nuevo escenario para el proyecto
   */
  async createScenario(projectId: string, input: Partial<CreateScenarioInput>): Promise<ProjectScenarioDto> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/scenarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al crear escenario');
    return json.data;
  },

  /**
   * Obtiene el detalle de un escenario (con impacto y validación en tiempo real)
   */
  async getScenario(scenarioId: string): Promise<ProjectScenarioDto & { validation?: ScenarioValidationDto; impact?: any }> {
    const res = await fetch(`${API_BASE}/scenarios/${scenarioId}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener detalle del escenario');
    return json.data;
  },

  /**
   * Actualiza los datos o estado de un escenario
   */
  async updateScenario(scenarioId: string, data: Partial<ProjectScenarioDto>): Promise<ProjectScenarioDto> {
    const res = await fetch(`${API_BASE}/scenarios/${scenarioId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al actualizar escenario');
    return json.data;
  },

  /**
   * Archiva (elimina lógicamente) un escenario
   */
  async deleteScenario(scenarioId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/scenarios/${scenarioId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al eliminar escenario');
  },

  /**
   * Duplica un escenario existente
   */
  async duplicateScenario(scenarioId: string, name?: string): Promise<ProjectScenarioDto> {
    const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al duplicar escenario');
    return json.data;
  },

  /**
   * Aplica una acción estructurada sobre el escenario
   */
  async applyAction(scenarioId: string, actionType: ScenarioActionType, payload: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/actions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ actionType, payload }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al aplicar acción');
    return json.data;
  },

  /**
   * Revierte una acción estructurada registrada
   */
  async revertAction(scenarioId: string, actionId: string): Promise<ProjectScenarioDto> {
    const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/actions/${actionId}/revert`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al revertir acción');
    return json.data;
  },

  /**
   * Valida técnicamente un escenario
   */
  async validateScenario(scenarioId: string): Promise<ScenarioValidationDto> {
    const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al validar escenario');
    return json.data;
  },

  /**
   * Compara objetivamente de 2 a 4 escenarios de un proyecto
   */
  async compareScenarios(projectId: string, scenarioIds: string[], baseScenarioId?: string): Promise<ScenarioComparisonDto> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/scenarios/compare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scenarioIds, baseScenarioId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al comparar escenarios');
    return json.data;
  },
};
