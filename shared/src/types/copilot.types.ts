/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Types & Data Contracts for AI Copilot, Orchestration, Tools, Actions, Context & Execution
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { DataSourceType, ConfidenceLevel } from './propertyIntelligence.types.js';

// ============================================================
// 1. INTENTS & CONVERSATION MODES
// ============================================================

export type AICopilotIntent =
  | 'ANALYZE'
  | 'DESIGN'
  | 'REDESIGN'
  | 'FURNISH'
  | 'SEARCH_PRODUCT'
  | 'COMPARE_PRODUCTS'
  | 'CHECK_FIT'
  | 'BUDGET'
  | 'OPTIMIZE'
  | 'RENOVATE'
  | 'TECHNICAL_DESIGN'
  | 'SCENARIO'
  | 'COMPARE_SCENARIOS'
  | 'CONSTRUCTION'
  | 'PROCUREMENT'
  | 'EXECUTION'
  | 'DOCUMENT'
  | 'RENDER'
  | 'AR'
  | 'PROPERTY_INTELLIGENCE'
  | 'EXPLAIN'
  | 'SUMMARIZE'
  | 'GENERAL_QUERY';

export type AICopilotConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AIActionStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'EXECUTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'FAILED';

export type AICopilotPriceSource =
  | 'RETAIL_CATALOG'
  | 'FINANCIAL_ENGINE'
  | 'PROCUREMENT'
  | 'SUPPLIER_QUOTE'
  | 'USER_PROVIDED'
  | 'HISTORICAL'
  | 'AI_ESTIMATED'
  | 'UNKNOWN';

// ============================================================
// 2. CONTEXT & MULTI-LAYER PROJECTION
// ============================================================

export interface AIProjectContextLayers {
  level1_summary?: {
    projectId: string;
    projectName: string;
    propertyId?: string;
    status: string;
    totalAreaM2: number;
    floorsCount: number;
    roomsCount: number;
    createdAt: string;
  };
  level2_room?: {
    roomId: string;
    roomName: string;
    roomType: string;
    areaM2: number;
    perimeterM: number;
    heightM: number;
  };
  level3_geometry?: {
    wallsCount: number;
    openingsCount: number;
    freeWallSegments?: Array<{ wallId: string; lengthCm: number; orientation: string }>;
  };
  level4_furniture?: {
    furnitureCount: number;
    items: Array<{ id: string; name: string; category: string; widthCm: number; depthCm: number; heightCm: number; price?: number }>;
  };
  level5_technical?: {
    elementsCount: number;
    connectionsCount: number;
    summaryByType: Record<string, number>;
  };
  level6_products?: {
    assignedProductsCount: number;
    catalogHighlights?: Array<{ id: string; name: string; retailer: string; priceEur: number; inStock: boolean }>;
  };
  level7_financial?: {
    budgetTotalEur?: number;
    committedEur?: number;
    estimatedTotalEur?: number;
    costItemsSummary?: Record<string, number>;
  };
  level8_construction?: {
    phasesCount: number;
    tasksCount: number;
    activePhase?: string;
  };
  level9_execution?: {
    overallProgressPercent: number;
    openIncidentsCount: number;
  };
}

export interface AIProjectContext {
  projectId?: string;
  propertyId?: string;
  activeScenarioId?: string;
  activeRoomId?: string;
  activeFloorId?: string;
  selectedFurnitureIds?: string[];
  selectedTechnicalElementIds?: string[];
  selectedProductIds?: string[];
  budget?: {
    totalBudget?: number;
    targetRoomBudget?: number;
    maxBudget?: number;
    currency?: string;
  };
  designPreferences?: {
    style?: string; // 'nordic', 'modern', 'industrial', 'minimalist', 'classic'
    colors?: string[];
    materials?: string[];
    constraints?: string[];
    priorities?: string[]; // 'STORAGE', 'COMFORT', 'CIRCULATION', 'BUDGET', 'AESTHETICS'
  };
  layers?: AIProjectContextLayers;
  userLocale?: string;
}

// ============================================================
// 3. TOOL DEFINITIONS & EXECUTION
// ============================================================

export interface AIToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
  default?: any;
}

export interface AIToolDefinition {
  name: string;
  category:
    | 'GEOMETRY'
    | 'FURNITURE'
    | 'RETAIL'
    | 'FINANCIAL'
    | 'PROCUREMENT'
    | 'CONSTRUCTION'
    | 'EXECUTION'
    | 'TECHNICAL'
    | 'SCENARIO'
    | 'PROPERTY'
    | 'DOCUMENTATION'
    | 'VISUALIZATION'
    | 'SYSTEM';
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, AIToolParameter>;
    required?: string[];
  };
  outputSchema?: Record<string, any>;
  permissions: string[];
  riskLevel: AIRiskLevel;
  requiresConfirmation: boolean;
}

export interface AIToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  thought?: string;
}

export interface AIToolResult {
  toolCallId?: string;
  toolName: string;
  success: boolean;
  data?: any;
  error?: string;
  durationMs: number;
  source?: string;
  isEstimated?: boolean;
  dataFreshness?: 'REALTIME' | 'CACHED' | 'STALE' | 'OFFLINE';
}

// ============================================================
// 4. STRUCTURED ACTIONS & CONFIRMATION
// ============================================================

export type AICopilotActionType =
  | 'ADD_FURNITURE'
  | 'MOVE_FURNITURE'
  | 'REMOVE_FURNITURE'
  | 'ADD_TECHNICAL_ELEMENT'
  | 'MOVE_TECHNICAL_ELEMENT'
  | 'REMOVE_TECHNICAL_ELEMENT'
  | 'CREATE_SCENARIO'
  | 'APPLY_SCENARIO'
  | 'ADD_PRODUCT'
  | 'REMOVE_PRODUCT'
  | 'CHANGE_MATERIAL'
  | 'CHANGE_LAYOUT'
  | 'CREATE_PURCHASE_REQUIREMENT'
  | 'CREATE_CONSTRUCTION_TASK'
  | 'GENERATE_DOCUMENT'
  | 'GENERATE_RENDER'
  | 'PREPARE_AR_SESSION'
  | 'UPDATE_BUDGET';

export interface AICopilotAction {
  id: string;
  conversationId?: string;
  projectId?: string;
  propertyId?: string;
  type: AICopilotActionType;
  entityType?: 'FURNITURE' | 'TECHNICAL_ELEMENT' | 'SCENARIO' | 'PRODUCT' | 'TASK' | 'DOCUMENT' | 'RENDER' | 'AR' | 'FINANCIAL';
  entityId?: string;
  parameters: Record<string, any>;
  reason: string;
  confidence: AICopilotConfidence;
  riskLevel: AIRiskLevel;
  requiresConfirmation: boolean;
  status: AIActionStatus;
  result?: any;
  executedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// 5. STRUCTURED COPILOT PAYLOADS
// ============================================================

export interface BudgetItemBreakdown {
  category: string;
  name: string;
  amount: number;
  source: AICopilotPriceSource;
  isEstimated: boolean;
  currency: string;
  notes?: string;
}

export interface BudgetEstimationPayload {
  knownTotal: number;
  estimatedTotal: number;
  estimatedRange?: { min: number; max: number };
  unknownCategories?: string[];
  totalEstimate: number;
  currency: string;
  items: BudgetItemBreakdown[];
  disclaimer: string;
}

export interface ProductFitResultPayload {
  productId: string;
  productName: string;
  retailer: string;
  priceEur: number;
  fits: boolean;
  roomName: string;
  availableWidthCm: number;
  availableDepthCm: number;
  productWidthCm: number;
  productDepthCm: number;
  productHeightCm: number;
  clearanceCirculationCm: number;
  explanations: string[];
}

export interface DesignAlternativePayload {
  id: string;
  title: string;
  description: string;
  style: string;
  estimatedCostEur: number;
  itemsCount: number;
  highlights: string[];
  tradeOffs: Array<{ advantage: string; drawback: string; costImpact?: number }>;
  actions: AICopilotAction[];
}

export interface AIMessageStructuredPayload {
  cardType?:
    | 'PRODUCT_MATCH'
    | 'BUDGET_BREAKDOWN'
    | 'ALTERNATIVE_COMPARISON'
    | 'SCENARIO_PROPOSAL'
    | 'FIT_CHECK'
    | 'CONSTRUCTION_PLAN'
    | 'RISK_ALERT'
    | 'SMART_HOME_PLAN'
    | 'AR_PREVIEW'
    | 'DOCUMENT_SUMMARY';
  products?: Array<{
    id: string;
    name: string;
    retailer: string;
    category: string;
    priceEur: number;
    inStock: boolean;
    dimensionsCm?: { width: number; depth: number; height: number };
    imageUrl?: string;
    deepLinkUrl?: string;
  }>;
  budgetBreakdown?: BudgetEstimationPayload;
  fitCheckResult?: ProductFitResultPayload;
  alternatives?: DesignAlternativePayload[];
  tradeOffs?: Array<{ advantage: string; drawback: string; costImpact?: number }>;
  actions?: AICopilotAction[];
  missingInformation?: string[];
  explanations?: string[];
  sources?: Array<{ type: string; title: string; confidence: AICopilotConfidence; sourceDetail: string }>;
  suggestedPrompts?: string[];
}

// ============================================================
// 6. CHAT & CONVERSATION MODELS
// ============================================================

export interface AIMessage {
  id: string;
  conversationId: string;
  sender: 'USER' | 'COPILOT' | 'SYSTEM';
  content: string;
  intent?: AICopilotIntent;
  structuredPayload?: AIMessageStructuredPayload;
  toolCalls?: AIToolCall[];
  confidence?: AICopilotConfidence;
  tokens?: number;
  latencyMs?: number;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  projectId?: string;
  propertyId?: string;
  title: string;
  context?: AIProjectContext;
  isPinned: boolean;
  messages?: AIMessage[];
  actions?: AICopilotAction[];
  createdAt: string;
  updatedAt: string;
}

export interface AICopilotChatRequest {
  conversationId?: string;
  projectId?: string;
  propertyId?: string;
  message: string;
  context?: Partial<AIProjectContext>;
}

export interface AICopilotChatResponse {
  conversation: AIConversation;
  message: AIMessage;
  proposedActions?: AICopilotAction[];
  usage?: {
    tokens: number;
    latencyMs: number;
    provider: string;
    model: string;
  };
}

// ============================================================
// 7. PROVIDER INTERFACES
// ============================================================

export interface AICopilotProviderResponse {
  content: string;
  intent: AICopilotIntent;
  toolCalls?: AIToolCall[];
  structuredPayload?: AIMessageStructuredPayload;
  proposedActions?: AICopilotAction[];
  confidence: AICopilotConfidence;
  tokensUsed: { prompt: number; completion: number; total: number };
}

export interface AICopilotProvider {
  id: string;
  name: string;
  isMock: boolean;
  processQuery(
    query: string,
    context: AIProjectContext,
    tools: AIToolDefinition[],
    toolResults?: AIToolResult[]
  ): Promise<AICopilotProviderResponse>;
}

// ============================================================
// 8. AUDIT & USAGE TRACKING
// ============================================================

export interface AIInteractionLog {
  id: string;
  userId: string;
  projectId?: string;
  propertyId?: string;
  conversationId?: string;
  intent: string;
  toolName?: string;
  inputSummary?: Record<string, any>;
  outputSummary?: Record<string, any>;
  status: 'SUCCESS' | 'FAILED' | 'REJECTED' | 'CANCELLED';
  latencyMs?: number;
  requiresConfirmation: boolean;
  createdAt: string;
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalEstimatedCostEur: number;
  averageLatencyMs: number;
  requestsByIntent: Record<string, number>;
  requestsByProvider: Record<string, number>;
}
