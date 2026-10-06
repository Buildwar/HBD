/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * TIPOS Y DEFINICIONES PARA EL MOTOR DE ESCENARIOS Y PLANIFICACIÓN
 * INTELLIGENT PROJECT PLANNING & SCENARIO ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { SpaceDto, FunctionalZoneDto } from './space.types.js';
import { ConstructionItemDto, ConstructionPhaseDto } from './construction.types.js';

export type ScenarioType =
  | 'CURRENT'
  | 'MANUAL'
  | 'AI_GENERATED'
  | 'AI_OPTIMIZED'
  | 'DESIGN_VARIANT'
  | 'RENOVATION'
  | 'CUSTOM';

export type ScenarioStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'VALID'
  | 'WARNING'
  | 'INVALID'
  | 'ARCHIVED';

export type ScenarioActionType =
  | 'CREATE_SPACE'
  | 'DELETE_SPACE'
  | 'MODIFY_SPACE'
  | 'CREATE_ZONE'
  | 'DELETE_ZONE'
  | 'MODIFY_ZONE'
  | 'MOVE_WALL'
  | 'CREATE_WALL'
  | 'DELETE_WALL'
  | 'MODIFY_WALL'
  | 'MOVE_DOOR'
  | 'CREATE_DOOR'
  | 'DELETE_DOOR'
  | 'MODIFY_DOOR'
  | 'MOVE_WINDOW'
  | 'CREATE_WINDOW'
  | 'DELETE_WINDOW'
  | 'MODIFY_WINDOW'
  | 'ADD_FURNITURE'
  | 'REMOVE_FURNITURE'
  | 'MOVE_FURNITURE'
  | 'MODIFY_FURNITURE'
  | 'CHANGE_MATERIAL'
  | 'CHANGE_FINISH'
  | 'CHANGE_LIGHTING'
  | 'ADD_CONSTRUCTION_ITEM'
  | 'REMOVE_CONSTRUCTION_ITEM'
  | 'MODIFY_CONSTRUCTION_ITEM';

export interface ScenarioActionDto {
  id: string;
  scenarioId: string;
  actionType: ScenarioActionType;
  payload: Record<string, any>;
  previousState?: Record<string, any> | null;
  isReverted: boolean;
  sequence: number;
  createdBy?: string;
  createdAt: string;
}

export interface ScenarioSnapshotData {
  walls?: Array<{ id: string; startX: number; startY: number; endX: number; endY: number; thickness: number; isStructural?: boolean }>;
  doors?: Array<{ id: string; wallId?: string; widthM: number; position: { x: number; y: number } }>;
  windows?: Array<{ id: string; wallId?: string; widthM: number; heightM?: number; position: { x: number; y: number } }>;
  rooms?: Array<{ id: string; name: string; areaM2: number; perimeterM?: number; heightM?: number; spaceId?: string }>;
  spaces?: SpaceDto[];
  zones?: FunctionalZoneDto[];
  furniture?: Array<{ id: string; furnitureId: string; name?: string; x: number; y: number; rotation?: number }>;
  constructionItems?: ConstructionItemDto[];
  customMetadata?: Record<string, any>;
}

export interface ProjectScenarioDto {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  type: ScenarioType;
  status: ScenarioStatus;
  baseScenarioId?: string | null;
  snapshotData?: ScenarioSnapshotData | null;
  metrics?: Record<string, any> | null;
  budgetSummary?: Record<string, any> | null;
  actions?: ScenarioActionDto[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScenarioInput {
  projectId: string;
  name: string;
  description?: string;
  type?: ScenarioType;
  baseScenarioId?: string;
  snapshotData?: ScenarioSnapshotData;
}

export interface ScenarioIssueDto {
  id: string;
  category: 'GEOMETRY' | 'SPATIAL' | 'FURNITURE' | 'CONSTRUCTION' | 'CIRCULATION' | 'STRUCTURE' | 'INSTALLATION';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  targetElement?: string;
  explanation: string;
  origin: string;
  recommendedAction: string;
  requiresProfessionalValidation: boolean;
}

export interface ScenarioValidationDto {
  scenarioId: string;
  status: 'VALID' | 'WARNING' | 'INVALID' | 'UNKNOWN' | 'REQUIRES_PRO_VALIDATION';
  requiresProfessionalValidation: boolean;
  issues: ScenarioIssueDto[];
  complianceScore: number;
  timestamp: string;
  notes?: string;
}

export interface ScenarioImpactDto {
  scenarioId: string;
  scenarioName: string;
  geometricImpact: {
    usefulAreaDeltaM2: number;
    grossAreaDeltaM2: number;
    perimeterDeltaM: number;
    wallsAdded: number;
    wallsRemoved: number;
    openingsDelta: number;
    openSpaceRatioDelta: number;
  };
  spatialImpact: {
    roomsCountDelta: number;
    spacesCountDelta: number;
    zonesCountDelta: number;
    affectedSpaces: string[];
  };
  furnitureImpact: {
    addedCount: number;
    removedCount: number;
    movedCount: number;
    potentialCollisions: number;
    clearanceIssues: number;
  };
  constructionImpact: {
    demolitionCount: number;
    newBuildCount: number;
    affectedPhases: string[];
    requiresStructuralPro: boolean;
    technicalWarnings: string[];
  };
  economicImpact: {
    currentCostEur: number;
    scenarioCostEur: number;
    costDeltaEur: number;
    materialCostEur: number;
    laborCostEur: number;
    wasteCostEur: number;
    isEstimated: boolean;
  };
  validationImpact: {
    status: 'VALID' | 'WARNING' | 'INVALID' | 'UNKNOWN' | 'REQUIRES_PRO_VALIDATION';
    requiresProfessionalValidation: boolean;
    issuesCount: number;
    criticalIssues: number;
    warningIssues: number;
  };
}

export interface ScenarioComparisonDto {
  baseScenario: {
    id: string;
    name: string;
    type: ScenarioType;
    metrics?: Record<string, any>;
    cost?: number;
  };
  scenarios: Array<{
    id: string;
    name: string;
    type: ScenarioType;
    metrics?: Record<string, any>;
    cost?: number;
    impact: ScenarioImpactDto;
    validation: ScenarioValidationDto;
  }>;
  comparisonMatrix: {
    geometry: Array<{ metric: string; values: Record<string, number | string> }>;
    spaces: Array<{ metric: string; values: Record<string, number | string> }>;
    furniture: Array<{ metric: string; values: Record<string, number | string> }>;
    construction: Array<{ metric: string; values: Record<string, number | string> }>;
    economy: Array<{ metric: string; values: Record<string, number | string> }>;
    validation: Array<{ metric: string; values: Record<string, string> }>;
  };
  professionalNotice: string;
}
