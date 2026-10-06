/**
 * Types & Enums for Property Intelligence (Phase V23 / v1.23.0)
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'DUPLEX'
  | 'PENTHOUSE'
  | 'STUDIO'
  | 'TOWNHOUSE'
  | 'VILLA'
  | 'OFFICE'
  | 'COMMERCIAL'
  | 'OTHER';

export type PropertyCondition =
  | 'NEW'
  | 'GOOD'
  | 'NEEDS_UPDATE'
  | 'RENOVATION_REQUIRED'
  | 'PARTIAL_RENOVATION'
  | 'FULL_RENOVATION'
  | 'UNKNOWN';

export type PropertyStatus =
  | 'ACTIVE'
  | 'IN_PLANNING'
  | 'UNDER_RENOVATION'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'DRAFT';

export type OccupancyStatus =
  | 'VACANT'
  | 'OCCUPIED_OWNER'
  | 'OCCUPIED_TENANT'
  | 'UNDER_CONSTRUCTION'
  | 'UNKNOWN';

export type DataSourceType =
  | 'OFFICIAL'
  | 'USER_PROVIDED'
  | 'DOCUMENT'
  | 'PLAN'
  | 'IMAGE'
  | 'VISION'
  | 'CATALOG'
  | 'MEASURED'
  | 'CALCULATED'
  | 'IMPORTED'
  | 'AI_ESTIMATED'
  | 'MANUAL'
  | 'UNKNOWN';

export type ConfidenceLevel =
  | 'CONFIRMED'
  | 'ESTIMATED'
  | 'CALCULATED'
  | 'UNKNOWN';

export type ImprovementPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type ImprovementCategory =
  | 'REDISTRIBUTION'
  | 'OPEN_CONCEPT'
  | 'STORAGE'
  | 'LIGHTING'
  | 'HVAC'
  | 'NETWORK_WIFI'
  | 'SMART_HOME'
  | 'SECURITY'
  | 'KITCHEN_RENOVATION'
  | 'BATHROOM_RENOVATION'
  | 'INSULATION'
  | 'ENERGY_EFFICIENCY'
  | 'ACCESSIBILITY'
  | 'FINISHES';

export type RiskCategory =
  | 'STRUCTURAL'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'HVAC'
  | 'NETWORK'
  | 'SECURITY'
  | 'MOISTURE'
  | 'SPACE'
  | 'COST'
  | 'SCHEDULE'
  | 'SUPPLY'
  | 'UNKNOWN';

export type RiskSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'
  | 'UNKNOWN';

export type PropertySnapshotStateType =
  | 'INITIAL_EXISTING'
  | 'PROPOSED_DESIGN'
  | 'DURING_RENOVATION'
  | 'EXECUTED_FINAL'
  | 'CUSTOM';

export interface PropertyValuedField<T = any> {
  value: T;
  source: DataSourceType;
  confidence: ConfidenceLevel;
  notes?: string;
  updatedAt?: string;
}

export interface PropertyAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  cadastralReference?: string;
}

export interface PropertyAdjacencyItem {
  fromRoomId: string;
  fromRoomName: string;
  toRoomId: string;
  toRoomName: string;
  adjacencyType: 'DIRECT_DOOR' | 'OPEN_PASSAGE' | 'SHARED_WALL' | 'CORRIDOR_LINK';
  distanceMeters?: number;
  quality: 'OPTIMAL' | 'ACCEPTABLE' | 'NEEDS_OPTIMIZATION';
}

export interface PropertySpatialSummary {
  totalBuiltSurfaceM2: number;
  totalUsableSurfaceM2: number;
  plotSurfaceM2?: number;
  roomsCount: number;
  bathroomsCount: number;
  bedroomsCount: number;
  floorsCount: number;
  circulationSurfaceM2: number;
  circulationRatio: number; // circulation / usable
  storageSurfaceM2: number;
  spacesBreakdown: Array<{
    id: string;
    name: string;
    type: string;
    areaM2: number;
    perimeterM: number;
    confidence: ConfidenceLevel;
  }>;
  adjacencies: PropertyAdjacencyItem[];
}

export interface PropertyOpportunityItem {
  id: string;
  propertyId: string;
  projectId?: string;
  title: string;
  description: string;
  category: ImprovementCategory;
  priority: ImprovementPriority;
  estimatedCostEur?: number;
  impactScore: number; // 0 to 100
  potentialSavingsEur?: number;
  dependencies?: string[];
  source: DataSourceType;
  confidence: ConfidenceLevel;
  status: 'IDENTIFIED' | 'PLANNED' | 'DISMISSED' | 'IMPLEMENTED';
  metadata?: Record<string, any>;
}

export interface PropertyRiskItem {
  id: string;
  propertyId: string;
  projectId?: string;
  title: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  isPotential: boolean; // True if inferred by AI / heuristics
  requiresProfessionalReview: boolean; // Flags that a qualified architect/engineer should inspect
  mitigationSuggestion?: string;
  source: DataSourceType;
  confidence: ConfidenceLevel;
  status: 'OPEN' | 'IN_REVIEW' | 'MITIGATED' | 'ACCEPTED';
  metadata?: Record<string, any>;
}

export interface PropertyDataQualityDto {
  completionPercentage: number; // 0 to 100
  confirmedFieldsCount: number;
  estimatedFieldsCount: number;
  calculatedFieldsCount: number;
  unknownFieldsCount: number;
  totalEvaluatedFields: number;
  missingKeyFields: string[];
  freshnessScore: number; // 0 to 100
  recommendations: string[];
}

export interface PropertyTotalInvestmentDto {
  acquisitionCost?: {
    amount: number;
    isProvided: boolean;
    source: DataSourceType;
  };
  renovationCost: number;
  furnitureCost: number;
  technicalInfrastructureCost: number;
  procurementCost: number;
  executionCost: number;
  otherCosts: number;
  totalCommittedInvestment: number;
  totalEstimatedInvestment: number;
  costPerM2: number;
}

export interface PropertyDto {
  id: string;
  name: string;
  description?: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  condition: PropertyCondition;
  occupancyStatus: OccupancyStatus;
  address?: PropertyAddress;
  builtSurfaceM2?: number;
  usableSurfaceM2?: number;
  plotSurfaceM2?: number;
  roomsCount?: number;
  bathroomsCount?: number;
  bedroomsCount?: number;
  floorNumber?: number;
  totalFloors?: number;
  constructionYear?: number;
  renovationYear?: number;
  orientation?: string; // 'N', 'S', 'E', 'W', 'NE', etc.
  energyRating?: string; // 'A', 'B', 'C', 'D', 'E', 'F', 'G'
  projectsCount?: number;
  source: DataSourceType;
  confidence: ConfidenceLevel;
  dataQuality?: PropertyDataQualityDto;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertySnapshotDto {
  id: string;
  propertyId: string;
  name: string;
  stateType: PropertySnapshotStateType;
  description?: string;
  snapshotData: {
    property: Partial<PropertyDto>;
    spatial?: PropertySpatialSummary;
    opportunities?: PropertyOpportunityItem[];
    risks?: PropertyRiskItem[];
    investment?: PropertyTotalInvestmentDto;
    metadata?: Record<string, any>;
  };
  metricsSummary?: Record<string, any>;
  createdAt: string;
}

export interface PropertyIntelligenceReportDto {
  property: PropertyDto;
  spatial: PropertySpatialSummary;
  opportunities: PropertyOpportunityItem[];
  risks: PropertyRiskItem[];
  dataQuality: PropertyDataQualityDto;
  investment: PropertyTotalInvestmentDto;
  technicalSummary?: {
    totalPowerKW: number;
    totalCircuits: number;
    hasWifiAnalysis: boolean;
    smartHomeProtocolCount: number;
    securityFixturesCount: number;
  };
  furnitureSummary?: {
    totalItems: number;
    furnitureTwinsCount: number;
    retailProductsCount: number;
  };
  scenariosComparison?: Array<{
    scenarioId: string;
    scenarioName: string;
    estimatedCost: number;
    modificationsCount: number;
  }>;
  alerts: string[];
}
