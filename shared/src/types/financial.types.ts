/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Types and Interfaces for Project Investment & Total Cost Intelligence
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

export type CostCategory =
  | 'PROPERTY_ACQUISITION'
  | 'RENOVATION'
  | 'FURNITURE'
  | 'APPLIANCES'
  | 'EQUIPMENT'
  | 'PROFESSIONAL_SERVICES'
  | 'LOGISTICS'
  | 'PERMITS'
  | 'CONTINGENCY'
  | 'OTHER';

export type CostSubcategory =
  // Property Acquisition
  | 'PURCHASE_PRICE'
  | 'NOTARY_FEE'
  | 'REGISTRY_FEE'
  | 'PROPERTY_TAX'
  | 'AGENCY_FEE'
  | 'LEGAL_FEE'
  | 'VALUATION_FEE'
  // Renovation (V11/V15)
  | 'DEMOLITION'
  | 'MASONRY'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'HVAC'
  | 'CARPENTRY'
  | 'FLOORING'
  | 'PAINTING'
  | 'BATHROOM_FITOUT'
  | 'KITCHEN_FITOUT'
  | 'WINDOWS_DOORS'
  | 'INSULATION'
  | 'STRUCTURAL'
  | 'WATERPROOFING'
  | 'TILING'
  // Furniture (V5/V16)
  | 'SOFAS'
  | 'TABLES'
  | 'CHAIRS'
  | 'BEDS'
  | 'WARDROBES'
  | 'SHELVING'
  | 'TV_FURNITURE'
  | 'DESKS'
  | 'OUTDOOR_FURNITURE'
  | 'CUSTOM_FURNITURE'
  | 'DECORATIVE_ACCENTS'
  // Appliances
  | 'REFRIGERATOR'
  | 'OVEN'
  | 'MICROWAVE'
  | 'DISHWASHER'
  | 'WASHING_MACHINE'
  | 'DRYER'
  | 'HOB'
  | 'HOOD'
  | 'TV'
  | 'SMALL_APPLIANCES'
  // Equipment
  | 'AIR_CONDITIONING'
  | 'HEATING'
  | 'SMART_HOME'
  | 'SECURITY'
  | 'NETWORK'
  | 'LIGHTING'
  | 'TECHNICAL_EQUIPMENT'
  | 'AUDIO_VIDEO'
  // Professional Services
  | 'ARCHITECT_FEE'
  | 'INTERIOR_DESIGN_FEE'
  | 'ENGINEERING_FEE'
  | 'PROJECT_MANAGEMENT_FEE'
  | 'LEGAL_ADVISORY'
  | 'TECHNICAL_INSPECTION'
  | 'HEALTH_SAFETY_COORDINATION'
  // Logistics
  | 'DELIVERY_SHIPPING'
  | 'TRANSPORT'
  | 'STORAGE'
  | 'ASSEMBLY_INSTALLATION'
  | 'WASTE_MANAGEMENT'
  | 'CRANE_LIFT_SERVICE'
  // Permits & Taxes
  | 'BUILDING_PERMIT'
  | 'MUNICIPAL_TAX'
  | 'ACTIVITY_LICENSE'
  | 'OCCUPATION_FEE'
  | 'CERTIFICATE_OF_OCCUPANCY'
  // Contingency & Other
  | 'UNFORESEEN_WORKS'
  | 'PRICE_BUFFER'
  | 'MISCELLANEOUS';

export type CostStatus =
  | 'ESTIMATED'
  | 'QUOTED'
  | 'APPROVED'
  | 'COMMITTED'
  | 'PAID'
  | 'CANCELLED';

export type CostSource =
  | 'MANUAL'
  | 'CONSTRUCTION_V11'
  | 'EXECUTION_V15'
  | 'PRODUCT_V16'
  | 'FURNITURE_V5'
  | 'ACQUISITION';

export type PaymentStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE';

export type BudgetVarianceStatus =
  | 'UNDER_BUDGET'
  | 'ON_BUDGET'
  | 'OVER_BUDGET';

export type ProductCostMode =
  | 'INCLUDE_IN_BUDGET'
  | 'DESIGN_ONLY';

export interface PropertyAcquisitionDto {
  id?: string;
  projectId: string;
  purchasePrice: number;
  notaryFees: number;
  registryFees: number;
  transferTax: number;
  agencyFees: number;
  legalFees: number;
  renovationTax: number;
  valuationFees: number;
  otherAcquisitionFees: number;
  totalAcquisitionCost: number;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CostItemDto {
  id: string;
  projectId: string;
  category: CostCategory;
  subcategory: CostSubcategory;
  name: string;
  description?: string | null;
  unit: string;
  quantity: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  actualUnitCost?: number | null;
  actualTotalCost?: number | null;
  paidAmount: number;
  pendingAmount: number;
  status: CostStatus;
  source: CostSource;
  sourceReference?: string | null; // e.g. "v11_item:id", "v15_task:id", "product:id" to prevent duplicate calculation
  spaceId?: string | null;
  roomName?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  invoiceRef?: string | null;
  paymentDueDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPaymentDto {
  id: string;
  projectId: string;
  costItemId?: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: 'TRANSFER' | 'CREDIT_CARD' | 'CASH' | 'CHECK' | 'FINANCING' | 'OTHER';
  reference?: string | null;
  payee?: string | null;
  invoiceRef?: string | null;
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface BudgetRevisionDto {
  id: string;
  projectId: string;
  revisionNumber: number;
  description: string;
  baselineTransformationCost: number;
  newTransformationCost: number;
  changeAmount: number;
  reason?: string | null;
  approvedBy?: string | null;
  createdAt: string;
}

export interface FinancialSnapshotDto {
  id: string;
  projectId: string;
  title: string;
  totalTransformationCost: number;
  totalInvestment: number;
  propertyAcquisitionCost: number;
  renovationCost: number;
  furnitureCost: number;
  appliancesCost: number;
  equipmentCost: number;
  professionalServicesCost: number;
  logisticsCost: number;
  permitsCost: number;
  contingencyCost: number;
  otherCost: number;
  paidAmount: number;
  pendingAmount: number;
  notes?: string | null;
  createdAt: string;
}

export interface CategoryBreakdownDto {
  category: CostCategory;
  estimatedAmount: number;
  actualAmount: number;
  effectiveAmount: number; // actual if defined and > 0, else estimated
  paidAmount: number;
  pendingAmount: number;
  percentageOfTransformation: number;
  percentageOfTotalInvestment: number;
  itemsCount: number;
  varianceAmount: number;
  variancePercentage: number;
  status: BudgetVarianceStatus;
}

export interface RoomCostBreakdownDto {
  spaceId?: string | null;
  roomName: string;
  floor?: number | null;
  areaSquareMeters: number;
  totalEstimated: number;
  totalActual: number;
  totalEffective: number;
  totalPaid: number;
  totalPending: number;
  costPerSquareMeter: number;
  itemsCount: number;
  categoryBreakdown: Partial<Record<CostCategory, number>>;
}

export interface FinancialSummaryDto {
  projectId: string;
  // Core Dual Totals
  totalTransformationCost: number; // Renovation + Furniture + Appliances + Equipment + Professional + Logistics + Permits + Contingency + Other
  totalInvestment: number; // Property Acquisition (if any) + totalTransformationCost

  // Breakdown by Category Amounts (Effective)
  propertyAcquisitionCost: number;
  renovationCost: number;
  furnitureCost: number;
  appliancesCost: number;
  equipmentCost: number;
  professionalServicesCost: number;
  logisticsCost: number;
  permitsCost: number;
  contingencyCost: number;
  otherCost: number;

  // Comparison Metrics
  totalEstimatedTransformationCost: number;
  totalActualTransformationCost: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  totalBudgetVariance: number;
  variancePercentage: number;
  varianceStatus: BudgetVarianceStatus;

  // Unit Metrics
  projectAreaSquareMeters: number;
  costPerSquareMeterTransformation: number;
  costPerSquareMeterTotalInvestment: number;

  // Detailed Breakdowns
  categories: CategoryBreakdownDto[];
  roomBreakdown: RoomCostBreakdownDto[];
  paymentProgressPercentage: number;

  // Counts & Timestamp
  totalItemsCount: number;
  hasAcquisitionData: boolean;
  generatedAt: string;
}

export interface FinancialForecastDto {
  projectId: string;
  baselineBudget: number;
  actualSpent: number;
  committedRemaining: number;
  uncommittedEstimatedRemaining: number;
  forecastFinalCost: number;
  projectedVariance: number;
  projectedVariancePercentage: number;
  suggestedContingencyBuffer: number;
  confidenceScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: BudgetVarianceStatus;
  keyDrivers: string[];
  recommendations: string[];
}

export interface CreateCostItemInput {
  projectId: string;
  category: CostCategory;
  subcategory: CostSubcategory;
  name: string;
  description?: string;
  unit?: string;
  quantity?: number;
  estimatedUnitCost?: number;
  estimatedTotalCost: number;
  actualUnitCost?: number;
  actualTotalCost?: number;
  paidAmount?: number;
  status?: CostStatus;
  source?: CostSource;
  sourceReference?: string;
  spaceId?: string;
  roomName?: string;
  supplierId?: string;
  supplierName?: string;
  invoiceRef?: string;
  paymentDueDate?: string;
  notes?: string;
}

export interface UpdateCostItemInput {
  category?: CostCategory;
  subcategory?: CostSubcategory;
  name?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  estimatedUnitCost?: number;
  estimatedTotalCost?: number;
  actualUnitCost?: number;
  actualTotalCost?: number;
  paidAmount?: number;
  status?: CostStatus;
  sourceReference?: string;
  spaceId?: string;
  roomName?: string;
  supplierId?: string;
  supplierName?: string;
  invoiceRef?: string;
  paymentDueDate?: string;
  notes?: string;
}

export interface CreatePaymentInput {
  projectId: string;
  costItemId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'TRANSFER' | 'CREDIT_CARD' | 'CASH' | 'CHECK' | 'FINANCING' | 'OTHER';
  reference?: string;
  payee?: string;
  invoiceRef?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface CreateBudgetRevisionInput {
  projectId: string;
  description: string;
  newTransformationCost: number;
  reason?: string;
  approvedBy?: string;
}

export interface SavePropertyAcquisitionInput {
  projectId: string;
  purchasePrice: number;
  notaryFees?: number;
  registryFees?: number;
  transferTax?: number;
  agencyFees?: number;
  legalFees?: number;
  renovationTax?: number;
  valuationFees?: number;
  otherAcquisitionFees?: number;
  notes?: string;
}

export interface FinancialSyncOptions {
  includeV11Construction?: boolean;
  includeV15Execution?: boolean;
  includeV16Products?: boolean;
  includeV5Furniture?: boolean;
  clearExistingSyncedOnly?: boolean;
}
