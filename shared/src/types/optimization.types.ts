/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * TIPOS Y DEFINICIONES PARA EL MOTOR DE OPTIMIZACIÓN DE DISEÑO
 * INTELLIGENT DESIGN OPTIMIZATION ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { ScenarioSnapshotData, ScenarioImpactDto, ScenarioValidationDto } from './scenario.types.js';

export type DesignObjectiveType =
  | 'MAXIMIZE_USABLE_AREA'
  | 'MINIMIZE_CONSTRUCTION_COST'
  | 'MINIMIZE_CONSTRUCTION_WORK'
  | 'MAXIMIZE_FREE_SPACE'
  | 'MAXIMIZE_STORAGE'
  | 'MAXIMIZE_NATURAL_LIGHT'
  | 'MAXIMIZE_CIRCULATION'
  | 'MAXIMIZE_ROOM_SIZE'
  | 'MINIMIZE_FURNITURE_CONFLICTS'
  | 'MINIMIZE_STRUCTURAL_CHANGES'
  | 'MINIMIZE_WALL_CHANGES'
  | 'PRESERVE_EXISTING_LAYOUT'
  | 'MAXIMIZE_FUNCTIONAL_ZONES';

export type DesignConstraintType = 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';

export interface DesignConstraint {
  id: string;
  type: DesignConstraintType;
  category: 'STRUCTURE' | 'PROGRAM' | 'BUDGET' | 'DIMENSIONS' | 'FURNITURE' | 'PRESERVATION';
  description: string;
  targetElement?: string;
  targetValue?: any;
  isSatisfied?: 'SATISFIED' | 'PARTIALLY_SATISFIED' | 'NOT_SATISFIED';
  explanation?: string;
}

export interface DesignBrief {
  text?: string;
  minBedrooms?: number;
  minBathrooms?: number;
  preserveKitchen?: boolean;
  preserveStructuralWalls?: boolean;
  maxBudgetEur?: number;
  minUsableAreaM2?: number;
  minPassageWidthM?: number;
  targetStyle?: string;
  workZoneRequired?: boolean;
  storageBoostRequired?: boolean;
  customRequirements?: string[];
}

export type OptimizationStrategy =
  | 'RULE_BASED'
  | 'PARAMETRIC'
  | 'HEURISTIC'
  | 'AI_ASSISTED'
  | 'HYBRID';

export type OptimizationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type AlternativeStatus =
  | 'GENERATED'
  | 'ANALYZING'
  | 'VALID'
  | 'WARNING'
  | 'INVALID'
  | 'REJECTED'
  | 'SELECTED'
  | 'ARCHIVED';

export interface AlternativeExplanationDto {
  whatChanged: string;
  whyChanged: string;
  objectiveTargeted: DesignObjectiveType | string;
  satisfiedConstraints: string[];
  unsatisfiedConstraints: string[];
  impactSummary: string;
}

export interface DesignAlternativeDto {
  id: string;
  requestId: string;
  scenarioId?: string | null;
  name: string;
  description?: string | null;
  status: AlternativeStatus;
  snapshotData: ScenarioSnapshotData;
  metrics: {
    usableAreaM2: number;
    estimatedCostEur: number;
    roomsCount: number;
    openSpaceRatio: number;
    modificationsCount: number;
    complianceScore: number;
  };
  impacts: ScenarioImpactDto;
  validation: ScenarioValidationDto;
  explanations: AlternativeExplanationDto[];
  constraintsStatus: Array<{
    constraintId: string;
    description: string;
    type: DesignConstraintType;
    status: 'SATISFIED' | 'PARTIALLY_SATISFIED' | 'NOT_SATISFIED';
    notes?: string;
  }>;
  selectedBy?: string | null;
  selectedAt?: string | null;
  convertedScenarioId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationRequestDto {
  id: string;
  projectId: string;
  baseScenarioId?: string | null;
  name: string;
  objectives: DesignObjectiveType[];
  constraints: DesignConstraint[];
  preferences: Record<string, any>;
  strategy: OptimizationStrategy;
  status: OptimizationStatus;
  maxCandidates: number;
  timeoutMs: number;
  executionTimeMs: number;
  alternatives?: DesignAlternativeDto[];
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationResultDto {
  request: OptimizationRequestDto;
  alternatives: DesignAlternativeDto[];
  rejectedCandidates: Array<{
    candidateId: string;
    name: string;
    reason: string;
    failedConstraint?: string;
  }>;
  metrics: {
    totalCandidatesEvaluated: number;
    validAlternativesCount: number;
    rejectedCount: number;
    executionTimeMs: number;
  };
  warnings: string[];
  strategy: OptimizationStrategy;
  generatedAt: string;
  objectiveNotice: string;
}

export interface CreateOptimizationInput {
  projectId: string;
  baseScenarioId?: string;
  name?: string;
  brief?: DesignBrief;
  objectives?: DesignObjectiveType[];
  constraints?: DesignConstraint[];
  preferences?: Record<string, any>;
  strategy?: OptimizationStrategy;
  maxCandidates?: number;
  timeoutMs?: number;
}
