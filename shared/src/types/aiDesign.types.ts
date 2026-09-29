/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * Tipos e Interfaces para el Motor de IA de Diseño e Interiorismo (AIDesignEngine)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { WallType } from './geometry.types.js';
import { FurnitureDto, FurniturePlacementDto, SpatialValidationResult } from './furniture.types.js';
import { DesignVariant } from './render.types.js';

export type DesignStyle =
  | 'modern'
  | 'minimalist'
  | 'nordic'
  | 'industrial'
  | 'classic'
  | 'contemporary'
  | 'japandi'
  | 'mediterranean'
  | 'rustic'
  | 'mid_century'
  | 'art_deco';

export type DesignAtmosphere =
  | 'luminous'
  | 'warm'
  | 'elegant'
  | 'minimal'
  | 'cozy'
  | 'sophisticated'
  | 'natural'
  | 'industrial'
  | 'technological';

export type ColorPalettePreference =
  | 'light'
  | 'dark'
  | 'neutral'
  | 'warm'
  | 'cool'
  | 'earth'
  | 'green'
  | 'blue'
  | 'gray'
  | 'custom';

export type BudgetLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CUSTOM';

export type DesignGoal =
  | 'more_space'
  | 'maximize_storage'
  | 'ergonomic_flow'
  | 'entertaining'
  | 'cozy_relaxation'
  | 'work_from_home'
  | 'balanced';

export interface DesignPreferences {
  style: DesignStyle;
  atmosphere: DesignAtmosphere;
  colorPalette: ColorPalettePreference;
  customColorHex?: string;
  goal: DesignGoal;
  budgetLevel: BudgetLevel;
  numberOfProposals: 1 | 2 | 3;
  preserveExistingFurniture?: boolean;
  priorityFurnitureCategories?: string[];
  specialConstraints?: string;
}

export interface RoomContextData {
  id: string;
  name: string;
  roomType?: string;
  areaM2: number;
  widthM?: number;
  lengthM?: number;
  heightM: number;
  color?: string;
  polygon: Array<{ x: number; y: number }>;
  walls: Array<{
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    thicknessM: number;
    heightM: number;
    wallType: WallType;
  }>;
  doors: Array<{
    id: string;
    wallId: string;
    posX: number;
    posY: number;
    widthM: number;
    heightM: number;
    rotationDeg: number;
    swingDirection: string;
  }>;
  windows: Array<{
    id: string;
    wallId: string;
    posX: number;
    posY: number;
    widthM: number;
    heightM: number;
    elevationM: number;
    rotationDeg: number;
  }>;
  currentFurniture: FurniturePlacementDto[];
}

export interface DesignContext {
  projectId: string;
  projectName: string;
  propertyType?: string;
  floorId: string;
  floorName: string;
  floorLevel: number;
  scaleFactor: number;
  rooms: RoomContextData[];
  targetRoomId?: string; // Si se diseña una habitación específica, o undefined para toda la planta
  furnitureCatalog: FurnitureDto[];
  userPreferences: DesignPreferences;
  existingVariants?: DesignVariant[];
}

export type AIActionType =
  | 'MOVE_FURNITURE'
  | 'ROTATE_FURNITURE'
  | 'ADD_FURNITURE'
  | 'REMOVE_FURNITURE'
  | 'CHANGE_MATERIAL'
  | 'CHANGE_COLOR'
  | 'CHANGE_LIGHTING'
  | 'CHANGE_STYLE'
  | 'CREATE_VARIANT';

export interface AIAction {
  id: string;
  type: AIActionType;
  entityId?: string; // furniturePlacementId, roomId, wallId, etc.
  target?: {
    wallId?: string;
    roomId?: string;
    x?: number;
    y?: number;
    z?: number;
    rotationDeg?: number;
  };
  params?: {
    furnitureId?: string;
    furnitureName?: string;
    categorySlug?: string;
    dimensions?: { widthM: number; depthM: number; heightM: number };
    materialId?: string;
    colorHex?: string;
    lightMode?: string;
    colorTempK?: number;
    intensity?: number;
    styleName?: string;
    variantName?: string;
  };
  reason: string;
}

export interface FurnitureChangeProposal {
  type: 'added' | 'moved' | 'removed' | 'adjusted';
  placementId?: string;
  furnitureId: string;
  furnitureName: string;
  categorySlug: string;
  newPosX: number;
  newPosY: number;
  newPosZ?: number;
  newRotationDeg: number;
  dimensions: { widthM: number; depthM: number; heightM: number };
  clearanceMm?: number;
  reason: string;
}

export interface AIDesignProposal {
  id: string;
  variantId: string;
  proposalIndex: number;
  name: string;
  style: DesignStyle;
  atmosphere: DesignAtmosphere;
  summary: string;
  rationale: string;
  roomInsights: string[];
  actions: AIAction[];
  furnitureChanges: FurnitureChangeProposal[];
  materialOverrides: Record<string, string>; // surfaceId/roomId -> materialName o colorHex
  lightingOverrides: {
    timeOfDay?: string;
    colorTempK?: number;
    sunIntensity?: number;
    ambientColorHex?: string;
  };
  validationResult: SpatialValidationResult;
  status: 'GENERATED' | 'VALIDATED' | 'APPLIED' | 'DISCARDED' | 'INVALID';
  createdAt: string;
}

export interface RoomAnalysisInsight {
  roomId: string;
  roomName: string;
  areaM2: number;
  functionalRole: string;
  lightingPotential: string;
  trafficFlowAssessment: string;
  strengths: string[];
  constraints: string[];
  opportunities: string[];
  suggestedStyles: DesignStyle[];
  recommendedFurniture: Array<{
    categorySlug: string;
    name: string;
    priority: 'essential' | 'recommended' | 'optional';
    suggestedDimensions: { widthM: number; depthM: number; heightM: number };
    idealPlacementZone: string;
  }>;
}

export interface ProjectDesignAnalysis {
  projectId: string;
  floorId: string;
  totalAreaM2: number;
  roomsAnalyzed: RoomAnalysisInsight[];
  architecturalCoherenceScore: number; // 0 a 100
  globalSuggestions: string[];
  recommendedAtmosphere: DesignAtmosphere;
  dominantStyles: DesignStyle[];
}

export interface AICopilotCommandRequest {
  prompt: string;
  projectId: string;
  floorId: string;
  targetRoomId?: string;
  currentPlacements: FurniturePlacementDto[];
}

export interface AICopilotCommandResponse {
  interpretedIntent: string;
  action: AIAction | null;
  spatialValidation?: SpatialValidationResult;
  proposedChangesSummary: string;
  canAutoApply: boolean;
  explanation: string;
}

export interface AIDesignHistoryItem {
  id: string;
  projectId: string;
  floorId: string;
  roomId?: string;
  userId: string;
  provider: string;
  prompt?: string;
  preferences: DesignPreferences;
  proposals: AIDesignProposal[];
  selectedProposalId?: string;
  status: 'GENERATED' | 'VALIDATED' | 'APPLIED' | 'DISCARDED' | 'ERROR';
  createdAt: string;
}

export interface AIProviderConfig {
  providerName: 'mock' | 'openai' | 'anthropic' | 'custom';
  isConfigured: boolean;
  isMockMode: boolean;
  availableModels: string[];
  activeModel: string;
  supportsImageVision: boolean;
  rateLimitPerMinute: number;
}

export interface DesignAIProvider {
  getProviderConfig(): AIProviderConfig;
  analyzeRoom(room: RoomContextData, context: DesignContext): Promise<RoomAnalysisInsight>;
  analyzeProject(context: DesignContext): Promise<ProjectDesignAnalysis>;
  generateDesignProposals(context: DesignContext): Promise<AIDesignProposal[]>;
  processCopilotCommand(
    request: AICopilotCommandRequest,
    context: DesignContext
  ): Promise<AICopilotCommandResponse>;
}
