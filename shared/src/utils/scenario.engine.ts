/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * MOTOR DE ESCENARIOS Y ACCIONES ESTRUCTURADAS
 * SCENARIO ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProjectScenarioDto,
  ScenarioActionDto,
  ScenarioActionType,
  CreateScenarioInput,
  ScenarioSnapshotData,
} from '../types/scenario.types.js';

export class ScenarioEngine {
  /**
   * Crea un nuevo escenario inicializando su estado y snapshot base
   */
  public static createScenario(
    input: CreateScenarioInput,
    baseSnapshot?: ScenarioSnapshotData
  ): ProjectScenarioDto {
    const timestamp = new Date().toISOString();
    const id = `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const initialSnapshot: ScenarioSnapshotData = baseSnapshot
      ? JSON.parse(JSON.stringify(baseSnapshot))
      : {
          walls: [],
          doors: [],
          windows: [],
          rooms: [],
          spaces: [],
          zones: [],
          furniture: [],
          constructionItems: [],
        };

    return {
      id,
      projectId: input.projectId,
      name: input.name,
      description: input.description || null,
      type: input.type || 'MANUAL',
      status: 'DRAFT',
      baseScenarioId: input.baseScenarioId || null,
      snapshotData: initialSnapshot,
      metrics: null,
      budgetSummary: null,
      actions: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  /**
   * Duplica un escenario existente conservando el snapshot y las acciones
   */
  public static duplicateScenario(
    scenario: ProjectScenarioDto,
    newName?: string
  ): ProjectScenarioDto {
    const timestamp = new Date().toISOString();
    const clonedId = `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return {
      ...JSON.parse(JSON.stringify(scenario)),
      id: clonedId,
      name: newName || `${scenario.name} (Copia)`,
      baseScenarioId: scenario.id,
      status: 'DRAFT',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  /**
   * Aplica una acción estructurada sobre el escenario, registrándola en el historial
   */
  public static applyAction(
    scenario: ProjectScenarioDto,
    actionType: ScenarioActionType,
    payload: Record<string, any>,
    userId?: string
  ): { scenario: ProjectScenarioDto; action: ScenarioActionDto } {
    const timestamp = new Date().toISOString();
    const actionId = `action-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const currentActions = scenario.actions || [];
    const sequence = currentActions.length + 1;

    // Obtener estado previo del elemento afectado para reversibilidad
    const previousState = this.extractPreviousState(scenario.snapshotData, actionType, payload);

    const newAction: ScenarioActionDto = {
      id: actionId,
      scenarioId: scenario.id,
      actionType,
      payload: JSON.parse(JSON.stringify(payload)),
      previousState,
      isReverted: false,
      sequence,
      createdBy: userId,
      createdAt: timestamp,
    };

    const updatedSnapshot = this.applyActionToSnapshot(scenario.snapshotData || {}, actionType, payload);

    const updatedScenario: ProjectScenarioDto = {
      ...scenario,
      snapshotData: updatedSnapshot,
      actions: [...currentActions, newAction],
      updatedAt: timestamp,
    };

    return {
      scenario: updatedScenario,
      action: newAction,
    };
  }

  /**
   * Revierte una acción estructurada registrada en el escenario
   */
  public static revertAction(
    scenario: ProjectScenarioDto,
    actionId: string
  ): ProjectScenarioDto {
    const timestamp = new Date().toISOString();
    const actions = (scenario.actions || []).map((a) => {
      if (a.id === actionId) {
        return { ...a, isReverted: !a.isReverted };
      }
      return a;
    });

    // Reconstruir snapshot desde el estado base re-ejecutando solo las acciones no revertidas
    // O revertir directamente usando previousState
    const targetAction = (scenario.actions || []).find((a) => a.id === actionId);
    let updatedSnapshot = scenario.snapshotData || {};

    if (targetAction && targetAction.previousState) {
      updatedSnapshot = this.restorePreviousState(
        updatedSnapshot,
        targetAction.actionType,
        targetAction.payload,
        targetAction.previousState
      );
    }

    return {
      ...scenario,
      snapshotData: updatedSnapshot,
      actions,
      updatedAt: timestamp,
    };
  }

  /**
   * Extrae el estado previo de un elemento antes de aplicar una modificación o borrado
   */
  private static extractPreviousState(
    snapshot: ScenarioSnapshotData | null | undefined,
    actionType: ScenarioActionType,
    payload: Record<string, any>
  ): Record<string, any> | null {
    if (!snapshot) return null;

    switch (actionType) {
      case 'MODIFY_WALL':
      case 'DELETE_WALL':
      case 'MOVE_WALL':
        return snapshot.walls?.find((w) => w.id === payload.id) || null;

      case 'MODIFY_SPACE':
      case 'DELETE_SPACE':
        return snapshot.spaces?.find((s) => s.id === payload.id) || null;

      case 'MODIFY_ZONE':
      case 'DELETE_ZONE':
        return snapshot.zones?.find((z) => z.id === payload.id) || null;

      case 'MODIFY_FURNITURE':
      case 'REMOVE_FURNITURE':
      case 'MOVE_FURNITURE':
        return snapshot.furniture?.find((f) => f.id === payload.id) || null;

      case 'MODIFY_CONSTRUCTION_ITEM':
      case 'REMOVE_CONSTRUCTION_ITEM':
        return snapshot.constructionItems?.find((c) => c.id === payload.id) || null;

      default:
        return null;
    }
  }

  /**
   * Aplica la modificación directamente sobre la estructura en memoria del snapshot
   */
  private static applyActionToSnapshot(
    snapshot: ScenarioSnapshotData,
    actionType: ScenarioActionType,
    payload: Record<string, any>
  ): ScenarioSnapshotData {
    const s: ScenarioSnapshotData = JSON.parse(JSON.stringify(snapshot));
    s.walls = s.walls || [];
    s.doors = s.doors || [];
    s.windows = s.windows || [];
    s.rooms = s.rooms || [];
    s.spaces = s.spaces || [];
    s.zones = s.zones || [];
    s.furniture = s.furniture || [];
    s.constructionItems = s.constructionItems || [];

    switch (actionType) {
      case 'CREATE_WALL':
        s.walls.push(payload as any);
        break;
      case 'DELETE_WALL':
        s.walls = s.walls.filter((w) => w.id !== payload.id);
        break;
      case 'MODIFY_WALL':
      case 'MOVE_WALL':
        s.walls = s.walls.map((w) => (w.id === payload.id ? { ...w, ...payload } : w));
        break;

      case 'CREATE_DOOR':
        s.doors.push(payload as any);
        break;
      case 'DELETE_DOOR':
        s.doors = s.doors.filter((d) => d.id !== payload.id);
        break;
      case 'MOVE_DOOR':
      case 'MODIFY_DOOR':
        s.doors = s.doors.map((d) => (d.id === payload.id ? { ...d, ...payload } : d));
        break;

      case 'CREATE_WINDOW':
        s.windows.push(payload as any);
        break;
      case 'DELETE_WINDOW':
        s.windows = s.windows.filter((w) => w.id !== payload.id);
        break;
      case 'MOVE_WINDOW':
      case 'MODIFY_WINDOW':
        s.windows = s.windows.map((w) => (w.id === payload.id ? { ...w, ...payload } : w));
        break;

      case 'CREATE_SPACE':
        s.spaces.push(payload as any);
        break;
      case 'DELETE_SPACE':
        s.spaces = s.spaces.filter((sp) => sp.id !== payload.id);
        break;
      case 'MODIFY_SPACE':
        s.spaces = s.spaces.map((sp) => (sp.id === payload.id ? { ...sp, ...payload } : sp));
        break;

      case 'CREATE_ZONE':
        s.zones.push(payload as any);
        break;
      case 'DELETE_ZONE':
        s.zones = s.zones.filter((z) => z.id !== payload.id);
        break;
      case 'MODIFY_ZONE':
        s.zones = s.zones.map((z) => (z.id === payload.id ? { ...z, ...payload } : z));
        break;

      case 'ADD_FURNITURE':
        s.furniture.push(payload as any);
        break;
      case 'REMOVE_FURNITURE':
        s.furniture = s.furniture.filter((f) => f.id !== payload.id);
        break;
      case 'MOVE_FURNITURE':
      case 'MODIFY_FURNITURE':
        s.furniture = s.furniture.map((f) => (f.id === payload.id ? { ...f, ...payload } : f));
        break;

      case 'ADD_CONSTRUCTION_ITEM':
        s.constructionItems.push(payload as any);
        break;
      case 'REMOVE_CONSTRUCTION_ITEM':
        s.constructionItems = s.constructionItems.filter((c) => c.id !== payload.id);
        break;
      case 'MODIFY_CONSTRUCTION_ITEM':
        s.constructionItems = s.constructionItems.map((c) => (c.id === payload.id ? { ...c, ...payload } : c));
        break;
    }

    return s;
  }

  /**
   * Restaura el estado previo para una reversión
   */
  private static restorePreviousState(
    snapshot: ScenarioSnapshotData,
    actionType: ScenarioActionType,
    payload: Record<string, any>,
    previousState: Record<string, any>
  ): ScenarioSnapshotData {
    const s: ScenarioSnapshotData = JSON.parse(JSON.stringify(snapshot));

    if (actionType.startsWith('CREATE_') || actionType.startsWith('ADD_')) {
      // Revertir creación = eliminar
      if (actionType === 'CREATE_WALL') s.walls = (s.walls || []).filter((w) => w.id !== payload.id);
      if (actionType === 'CREATE_SPACE') s.spaces = (s.spaces || []).filter((sp) => sp.id !== payload.id);
      if (actionType === 'CREATE_ZONE') s.zones = (s.zones || []).filter((z) => z.id !== payload.id);
      if (actionType === 'ADD_FURNITURE') s.furniture = (s.furniture || []).filter((f) => f.id !== payload.id);
      if (actionType === 'ADD_CONSTRUCTION_ITEM') s.constructionItems = (s.constructionItems || []).filter((c) => c.id !== payload.id);
    } else if (actionType.startsWith('DELETE_') || actionType.startsWith('REMOVE_')) {
      // Revertir eliminación = restaurar estado previo
      if (actionType === 'DELETE_WALL') s.walls = [...(s.walls || []), previousState as any];
      if (actionType === 'DELETE_SPACE') s.spaces = [...(s.spaces || []), previousState as any];
      if (actionType === 'DELETE_ZONE') s.zones = [...(s.zones || []), previousState as any];
      if (actionType === 'REMOVE_FURNITURE') s.furniture = [...(s.furniture || []), previousState as any];
      if (actionType === 'REMOVE_CONSTRUCTION_ITEM') s.constructionItems = [...(s.constructionItems || []), previousState as any];
    } else {
      // Revertir modificación = restaurar propiedades previas
      if (actionType.includes('WALL')) s.walls = (s.walls || []).map((w) => (w.id === payload.id ? { ...previousState } as any : w));
      if (actionType.includes('SPACE')) s.spaces = (s.spaces || []).map((sp) => (sp.id === payload.id ? { ...previousState } as any : sp));
      if (actionType.includes('ZONE')) s.zones = (s.zones || []).map((z) => (z.id === payload.id ? { ...previousState } as any : z));
      if (actionType.includes('FURNITURE')) s.furniture = (s.furniture || []).map((f) => (f.id === payload.id ? { ...previousState } as any : f));
      if (actionType.includes('CONSTRUCTION')) s.constructionItems = (s.constructionItems || []).map((c) => (c.id === payload.id ? { ...previousState } as any : c));
    }

    return s;
  }
}
