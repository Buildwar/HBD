/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Types and Interfaces for Procurement & Project Purchasing Intelligence
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

export type ProcurementCategory =
  | 'RENOVATION_MATERIAL'
  | 'FURNITURE'
  | 'APPLIANCE'
  | 'EQUIPMENT'
  | 'LIGHTING'
  | 'DECORATION'
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'CARPENTRY'
  | 'FLOORING'
  | 'PAINT'
  | 'TOOLS'
  | 'SAFETY'
  | 'LOGISTICS'
  | 'OTHER';

export type ProcurementStatus =
  | 'DRAFT'
  | 'NEEDED'
  | 'REQUESTED'
  | 'QUOTED'
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'ORDERED'
  | 'CONFIRMED'
  | 'PARTIALLY_SHIPPED'
  | 'SHIPPED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'INSPECTED'
  | 'INSTALLED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'INCIDENT'
  | 'UNKNOWN';

export type ProcurementPriority =
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'CRITICAL';

export type ProcurementSource =
  | 'MANUAL'
  | 'V11_CONSTRUCTION'
  | 'V15_EXECUTION'
  | 'V16_PRODUCT'
  | 'V17_FINANCIAL'
  | 'SCENARIO'
  | 'OPTIMIZATION'
  | 'SYSTEM'
  | 'USER_CONFIRMED';

export type SupplierQuoteStatus =
  | 'DRAFT'
  | 'RECEIVED'
  | 'SELECTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type ProcurementOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'PARTIALLY_SHIPPED'
  | 'SHIPPED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'CLOSED';

export type ProcurementDeliveryStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'FAILED'
  | 'RETURNED'
  | 'UNKNOWN';

export type ProcurementIncidentType =
  | 'DAMAGED'
  | 'MISSING'
  | 'WRONG_PRODUCT'
  | 'WRONG_VARIANT'
  | 'DELAY'
  | 'QUALITY'
  | 'QUANTITY'
  | 'OTHER';

export type ProcurementReturnStatus =
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED'
  | 'PARTIAL_REFUND';

export type ProcurementRiskLevel =
  | 'SAFE'
  | 'WARNING'
  | 'AT_RISK'
  | 'CRITICAL'
  | 'UNKNOWN';

export interface ProcurementItemDto {
  id: string;
  projectId: string;
  description: string;
  category: ProcurementCategory;
  subcategory?: string | null;
  quantity: number;
  unit: string;
  requiredDate?: string | null; // "Needed on site by this date"
  preferredDate?: string | null;
  roomId?: string | null;
  roomName?: string | null;
  spaceId?: string | null;
  phaseId?: string | null;
  phaseName?: string | null;
  taskId?: string | null;
  taskName?: string | null;
  productId?: string | null;
  productVariantId?: string | null;
  furnitureTwinId?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  selectedUnitCost?: number | null;
  selectedTotalCost?: number | null;
  currency: string;
  priority: ProcurementPriority;
  status: ProcurementStatus;
  source: ProcurementSource;
  sourceReference?: string | null;
  notes?: string | null;
  orderedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
  pendingQuantity: number;
  leadTimeDays?: number | null;
  quotesCount?: number;
  selectedQuoteId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierQuoteDto {
  id: string;
  projectId: string;
  procurementItemId: string;
  procurementItemDescription?: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  validUntil?: string | null;
  estimatedDeliveryDays: number;
  estimatedDeliveryDate?: string | null;
  shippingCost: number;
  installationCost: number;
  totalWithServices: number;
  notes?: string | null;
  status: SupplierQuoteStatus;
  createdAt: string;
}

export interface ProcurementOrderLineDto {
  id: string;
  orderId: string;
  procurementItemId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  damagedQuantity: number;
  notes?: string | null;
}

export interface ProcurementOrderDto {
  id: string;
  projectId: string;
  supplierId: string;
  supplierName: string;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  status: ProcurementOrderStatus;
  currency: string;
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
  paidAmount: number;
  pendingAmount: number;
  notes?: string | null;
  lines: ProcurementOrderLineDto[];
  deliveries?: ProcurementDeliveryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementDeliveryDto {
  id: string;
  projectId: string;
  orderId?: string | null;
  orderNumber?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippedAt?: string | null;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  status: ProcurementDeliveryStatus;
  receivedBy?: string | null;
  itemsSummary?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ProcurementIncidentDto {
  id: string;
  projectId: string;
  procurementItemId?: string | null;
  orderId?: string | null;
  title: string;
  description: string;
  type: ProcurementIncidentType;
  quantityAffected: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  costImpact: number;
  timeImpactDays: number;
  reportedDate: string;
  resolutionDate?: string | null;
  resolutionNotes?: string | null;
  photos: string[];
  createdAt: string;
}

export interface ProcurementReturnDto {
  id: string;
  projectId: string;
  procurementItemId: string;
  orderId?: string | null;
  quantity: number;
  reason: string;
  requestedDate: string;
  processedDate?: string | null;
  status: ProcurementReturnStatus;
  refundAmount: number;
  currency: string;
  notes?: string | null;
  createdAt: string;
}

export interface MaterialRequirementDto {
  id: string;
  projectId: string;
  taskId?: string | null;
  taskName?: string | null;
  materialName: string;
  requiredQuantity: number;
  purchasedQuantity: number;
  unit: string;
  wastePercent: number;
  totalCalculatedNeed: number;
  surplusQuantity: number;
  missingQuantity: number;
  isCovered: boolean;
}

export interface ProcurementRiskItemDto {
  procurementItemId: string;
  description: string;
  category: ProcurementCategory;
  priority: ProcurementPriority;
  status: ProcurementStatus;
  requiredDate?: string | null;
  estimatedDeliveryDate?: string | null;
  delayDays: number;
  riskLevel: ProcurementRiskLevel;
  riskReason: string;
  mitigationSuggestion: string;
  taskId?: string | null;
  taskName?: string | null;
}

export interface ProcurementPlanningDto {
  projectId: string;
  criticalItems: ProcurementRiskItemDto[];
  recommendedPurchasesToStart: ProcurementItemDto[];
  upcomingOrdersByWeek: Array<{
    weekLabel: string;
    itemsCount: number;
    estimatedCost: number;
    items: ProcurementItemDto[];
  }>;
  totalPurchasesCount: number;
  pendingDefinitionCount: number;
}

export interface ProcurementSummaryDto {
  projectId: string;
  totalPurchasesCount: number;
  pendingPurchasesCount: number;
  orderedPurchasesCount: number;
  inTransitPurchasesCount: number;
  receivedPurchasesCount: number;
  delayedPurchasesCount: number;
  incidentsCount: number;

  // Financial amounts
  totalEstimatedPurchasingBudget: number;
  totalCommittedPurchasingCost: number;
  totalActualPurchasedCost: number;
  totalPaidPurchasingAmount: number;
  pendingToOrderAmount: number;
  pendingToPayAmount: number;

  // Key Category Breakdown
  categories: Array<{
    category: ProcurementCategory;
    itemsCount: number;
    totalEstimatedCost: number;
    totalCommittedCost: number;
    pendingQuantity: number;
    receivedQuantity: number;
  }>;

  // Room Breakdown
  roomsSummary: Array<{
    roomId?: string | null;
    roomName: string;
    itemsCount: number;
    totalCost: number;
    pendingCount: number;
  }>;

  // Overall Risk
  overallRiskLevel: ProcurementRiskLevel;
  generatedAt: string;
}

export interface CreateProcurementItemInput {
  projectId: string;
  description: string;
  category: ProcurementCategory;
  subcategory?: string;
  quantity: number;
  unit?: string;
  requiredDate?: string;
  preferredDate?: string;
  roomId?: string;
  roomName?: string;
  spaceId?: string;
  phaseId?: string;
  phaseName?: string;
  taskId?: string;
  taskName?: string;
  productId?: string;
  productVariantId?: string;
  furnitureTwinId?: string;
  supplierId?: string;
  supplierName?: string;
  estimatedUnitCost?: number;
  estimatedTotalCost: number;
  selectedUnitCost?: number;
  selectedTotalCost?: number;
  currency?: string;
  priority?: ProcurementPriority;
  status?: ProcurementStatus;
  source?: ProcurementSource;
  sourceReference?: string;
  notes?: string;
  leadTimeDays?: number;
}

export interface UpdateProcurementItemInput {
  description?: string;
  category?: ProcurementCategory;
  subcategory?: string;
  quantity?: number;
  unit?: string;
  requiredDate?: string | null;
  preferredDate?: string | null;
  roomId?: string | null;
  roomName?: string | null;
  spaceId?: string | null;
  phaseId?: string | null;
  phaseName?: string | null;
  taskId?: string | null;
  taskName?: string | null;
  productId?: string | null;
  productVariantId?: string | null;
  furnitureTwinId?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  estimatedUnitCost?: number;
  estimatedTotalCost?: number;
  selectedUnitCost?: number | null;
  selectedTotalCost?: number | null;
  priority?: ProcurementPriority;
  status?: ProcurementStatus;
  notes?: string | null;
  orderedQuantity?: number;
  receivedQuantity?: number;
  damagedQuantity?: number;
  missingQuantity?: number;
  leadTimeDays?: number | null;
}

export interface CreateSupplierQuoteInput {
  projectId: string;
  procurementItemId: string;
  supplierId: string;
  supplierName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency?: string;
  validUntil?: string;
  estimatedDeliveryDays: number;
  shippingCost?: number;
  installationCost?: number;
  notes?: string;
}

export interface CreateProcurementOrderInput {
  projectId: string;
  supplierId: string;
  orderNumber?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  currency?: string;
  shipping?: number;
  taxes?: number;
  notes?: string;
  lines: Array<{
    procurementItemId?: string;
    description: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>;
}

export interface ReceiveProcurementOrderInput {
  orderId: string;
  deliveryDate?: string;
  receivedBy?: string;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  linesReceived: Array<{
    lineId: string;
    procurementItemId?: string;
    quantityReceivedNow: number;
    quantityDamagedNow?: number;
    quantityMissingNow?: number;
    notes?: string;
  }>;
}

export interface CreateProcurementIncidentInput {
  projectId: string;
  procurementItemId?: string;
  orderId?: string;
  title: string;
  description: string;
  type: ProcurementIncidentType;
  quantityAffected?: number;
  costImpact?: number;
  timeImpactDays?: number;
  photos?: string[];
}

export interface CreateProcurementReturnInput {
  projectId: string;
  procurementItemId: string;
  orderId?: string;
  quantity: number;
  reason: string;
  refundAmount?: number;
  notes?: string;
}

export interface ProcurementSyncOptions {
  includeV11Materials?: boolean;
  includeV15Tasks?: boolean;
  includeV16Products?: boolean;
  excludeDesignOnly?: boolean; // strictly respect DESIGN_ONLY
}
