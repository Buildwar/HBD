/**
 * HBD — HOME BOARD DESIGNER (V10.0.0)
 * Types and Interfaces for Spatial Rules Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { MeasurementConfidence, DetailedGeometricMetricsDto } from './space.types.js';
import { DoorDto, WindowDto } from './geometry.types.js';

export type RuleSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type RuleEvaluationStatus = 'VALID' | 'WARNING' | 'INVALID' | 'UNKNOWN';

export type SpatialRuleCategory =
  | 'CLEARANCE'
  | 'HABITABILITY'
  | 'CIRCULATION'
  | 'VENTILATION_LIGHTING'
  | 'DIMENSIONS'
  | 'ACCESSIBILITY'
  | 'SAFETY';

export interface SpatialRule {
  id: string;
  code: string;
  name: string;
  category: SpatialRuleCategory;
  description: string;
  value: number | string | Record<string, any>;
  unit: string;
  severity: RuleSeverity;
  source: string; // e.g., 'REFERENTIAL_CTE', 'HABITABILITY_RECOMMENDATION', 'CUSTOM'
  jurisdiction?: string; // e.g., 'ES_CTE', 'GENERAL_EU', 'CUSTOM'
  enabled: boolean;
  requiresProValidation: boolean;
}

export interface SpatialRuleEvaluationResult {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  category: SpatialRuleCategory;
  status: RuleEvaluationStatus;
  severity: RuleSeverity;
  actualValue: any;
  expectedValue: any;
  unit: string;
  message: string;
  source: string;
  confidence: MeasurementConfidence;
  requiresProValidation: boolean;
  context?: {
    spaceId?: string;
    spaceName?: string;
    roomType?: string;
    elementId?: string;
  };
}

export interface SpatialRuleEvaluationSummary {
  totalRules: number;
  validCount: number;
  warningCount: number;
  invalidCount: number;
  unknownCount: number;
  complianceScore: number; // 0 to 100
  requiresProValidation: boolean;
  results: SpatialRuleEvaluationResult[];
  evaluatedAt: string;
}

export interface SpaceEvaluationContext {
  id?: string;
  name?: string;
  roomType?: string;
  metrics?: DetailedGeometricMetricsDto;
  heightM?: number;
  doors?: DoorDto[];
  windows?: WindowDto[];
  passageWidthsM?: number[];
  isDoubleBedroom?: boolean;
}
