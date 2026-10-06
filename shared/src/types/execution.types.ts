/**
 * HBD — HOME BOARD DESIGNER (V15.0.0)
 * Types and Interfaces for Construction Execution & Site Management
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

export type ExecutionStatus =
  | 'PLANNED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CLOSED';

export type ExecutionTaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED';

export type AssigneeType = 'USER' | 'WORKER' | 'COMPANY' | 'SUPPLIER';

export interface ExecutionAssignee {
  id: string;
  type: AssigneeType;
  name: string;
  role?: string | null;
  contact?: string | null;
  companyName?: string | null;
  userId?: string | null;
  supplierId?: string | null;
}

export interface WorkPackageDto {
  id: string;
  executionId: string;
  phaseId?: string | null;
  phaseName?: string | null;
  name: string;
  description?: string | null;
  order: number;
  status: ExecutionTaskStatus;
  progress: number; // 0-100
  tasks: ExecutionTaskDto[];
  itemIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionTaskDto {
  id: string;
  executionId: string;
  workPackageId?: string | null;
  constructionTaskId?: string | null;
  name: string;
  description?: string | null;
  status: ExecutionTaskStatus;
  progress: number; // 0-100
  plannedDurationDays: number;
  actualDurationDays: number;
  plannedStart?: string | null;
  actualStart?: string | null;
  plannedEnd?: string | null;
  actualEnd?: string | null;
  assigneeType: AssigneeType;
  assigneeId?: string | null;
  assigneeName?: string | null;
  notes?: string | null;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export type MaterialExecutionStatus =
  | 'PLANNED'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'IN_USE'
  | 'CONSUMED'
  | 'CANCELLED';

export interface MaterialExecutionItemDto {
  id: string;
  executionId: string;
  constructionItemId?: string | null;
  name: string;
  category: string;
  unit: string;
  plannedQuantity: number;
  orderedQuantity: number;
  receivedQuantity: number;
  usedQuantity: number;
  wasteQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  totalCommittedCost: number;
  totalActualCost: number;
  status: MaterialExecutionStatus;
  supplierId?: string | null;
  supplierName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MaterialDeliveryStatus =
  | 'EXPECTED'
  | 'ORDERED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'PARTIAL'
  | 'DELAYED'
  | 'CANCELLED';

export interface MaterialDeliveryDto {
  id: string;
  executionId: string;
  purchaseOrderId?: string | null;
  materialItemId?: string | null;
  materialName: string;
  supplierId?: string | null;
  supplierName?: string | null;
  expectedDate: string;
  actualDate?: string | null;
  quantity: number;
  unit: string;
  status: MaterialDeliveryStatus;
  location?: string | null;
  documentUrl?: string | null;
  notes?: string | null;
  receivedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderDto {
  id: string;
  executionId: string;
  supplierId?: string | null;
  supplierName?: string | null;
  reference: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  itemsSummary?: string | null;
  totalAmount: number;
  notes?: string | null;
  deliveries?: MaterialDeliveryDto[];
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus =
  | 'RECEIVED'
  | 'PENDING'
  | 'APPROVED'
  | 'PAID'
  | 'CANCELLED';

export interface ExecutionInvoiceDto {
  id: string;
  executionId: string;
  purchaseOrderId?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  reference: string;
  issueDate: string;
  dueDate?: string | null;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  documentUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteDailyLogDto {
  id: string;
  executionId: string;
  date: string;
  weatherConditions?: string | null;
  workersPresent: string[];
  tasksPerformed: string[];
  materialsReceived: string[];
  incidentNotes?: string | null;
  observations?: string | null;
  photos: string[];
  progressRecorded?: number | null;
  createdById?: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type IncidentType =
  | 'DELAY'
  | 'QUALITY'
  | 'MATERIAL'
  | 'SAFETY'
  | 'DESIGN'
  | 'STRUCTURAL'
  | 'INSTALLATION'
  | 'SUPPLIER'
  | 'ACCESS'
  | 'OTHER';

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export interface ConstructionIncidentDto {
  id: string;
  executionId: string;
  title: string;
  description: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  location?: string | null;
  phaseId?: string | null;
  taskId?: string | null;
  responsibleAssignee?: string | null;
  dateReported: string;
  resolutionDate?: string | null;
  resolutionNotes?: string | null;
  photos: string[];
  documents: string[];
  requiresProReview: boolean;
  proReviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ChangeOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'IMPLEMENTED'
  | 'CANCELLED';

export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ExecutionApprovalDto {
  id: string;
  changeOrderId: string;
  requestedBy: string;
  approvedBy?: string | null;
  decision: ApprovalDecision;
  decisionDate?: string | null;
  comments?: string | null;
  createdAt: string;
}

export interface ChangeOrderImpact {
  costImpact: number; // EUR difference (+/-)
  timeImpactDays: number; // Days difference (+/-)
  geometricImpact?: string | null;
  constructiveImpact?: string | null;
  documentaryImpact?: string | null;
}

export interface ConstructionChangeOrderDto {
  id: string;
  executionId: string;
  code: string;
  title: string;
  description: string;
  reason: string;
  status: ChangeOrderStatus;
  impact: ChangeOrderImpact;
  requestedBy: string;
  requestDate: string;
  approvals: ExecutionApprovalDto[];
  affectedTaskIds: string[];
  affectedItemIds: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export type InspectionResult = 'PASS' | 'WARNING' | 'FAIL' | 'NOT_INSPECTED';

export interface QualityInspectionDto {
  id: string;
  executionId: string;
  element: string;
  phaseName?: string | null;
  taskId?: string | null;
  inspectionDate: string;
  inspectorName: string;
  result: InspectionResult;
  observations?: string | null;
  associatedIncidentId?: string | null;
  photos: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface ExecutionMilestoneDto {
  id: string;
  executionId: string;
  title: string;
  description?: string | null;
  targetDate: string;
  actualDate?: string | null;
  status: MilestoneStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type SitePhotoType =
  | 'PROGRESS'
  | 'INCIDENT'
  | 'QUALITY'
  | 'DELIVERY'
  | 'BEFORE'
  | 'AFTER'
  | 'OTHER';

export interface SitePhotoDto {
  id: string;
  executionId: string;
  photoUrl: string;
  caption?: string | null;
  photoType: SitePhotoType;
  stage: 'BEFORE' | 'DURING' | 'AFTER';
  takenAt: string;
  phaseId?: string | null;
  taskId?: string | null;
  incidentId?: string | null;
  inspectionId?: string | null;
  milestoneId?: string | null;
  location?: string | null;
  createdAt: string;
}

export type HealthStatus = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'UNKNOWN';

export interface ProjectHealth {
  scheduleStatus: HealthStatus;
  costStatus: HealthStatus;
  progressStatus: HealthStatus;
  materialStatus: HealthStatus;
  incidentStatus: HealthStatus;
  qualityStatus: HealthStatus;
  explanations: {
    schedule: string;
    cost: string;
    progress: string;
    material: string;
    incident: string;
    quality: string;
  };
}

export interface ScheduleVariance {
  plannedDurationDays: number;
  actualDurationDays: number;
  remainingDurationDays: number;
  delayDays: number;
  delayPercent: number;
  status: HealthStatus;
  phaseVariances: Array<{
    phaseId?: string;
    phaseName: string;
    plannedDays: number;
    actualDays: number;
    delayDays: number;
  }>;
}

export interface CostVariance {
  initialBudget: number;
  v11Budget: number;
  committedCost: number;
  invoicedCost: number;
  paidCost: number;
  actualCost: number;
  remainingCost: number;
  varianceAbsolute: number;
  variancePercent: number;
  status: HealthStatus;
  byCategory: Array<{
    category: string;
    budget: number;
    committed: number;
    actual: number;
    variance: number;
  }>;
  bySupplier: Array<{
    supplierId?: string | null;
    supplierName: string;
    committed: number;
    invoiced: number;
    paid: number;
  }>;
}

export type ClosureStatus = 'OPEN' | 'READY_TO_CLOSE' | 'CLOSED';

export interface ProjectClosureChecklist {
  tasksCompleted: boolean;
  incidentsClosed: boolean;
  inspectionsPassed: boolean;
  materialsAccounted: boolean;
  documentsComplete: boolean;
  costsLogged: boolean;
  finalPhotosRecorded: boolean;
  milestonesCompleted: boolean;
  criticalBlockersCount: number;
  blockers: string[];
  canClose: boolean;
}

export interface ProjectClosureDto {
  id: string;
  executionId: string;
  status: ClosureStatus;
  closedAt?: string | null;
  closedBy?: string | null;
  finalSummary?: string | null;
  checklist: ProjectClosureChecklist;
  finalReportDocumentId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionProjectDto {
  id: string;
  projectId: string;
  constructionProjectId?: string | null;
  scenarioId?: string | null;
  alternativeId?: string | null;
  status: ExecutionStatus;
  startDate?: string | null;
  plannedEndDate?: string | null;
  actualEndDate?: string | null;
  progress: number;
  notes?: string | null;
  workPackages: WorkPackageDto[];
  tasks: ExecutionTaskDto[];
  materials: MaterialExecutionItemDto[];
  deliveries: MaterialDeliveryDto[];
  purchaseOrders: PurchaseOrderDto[];
  invoices: ExecutionInvoiceDto[];
  dailyLogs: SiteDailyLogDto[];
  incidents: ConstructionIncidentDto[];
  changeOrders: ConstructionChangeOrderDto[];
  inspections: QualityInspectionDto[];
  milestones: ExecutionMilestoneDto[];
  photos: SitePhotoDto[];
  closure?: ProjectClosureDto | null;
  health: ProjectHealth;
  scheduleVariance: ScheduleVariance;
  costVariance: CostVariance;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionDashboardDto {
  executionId: string;
  projectId: string;
  status: ExecutionStatus;
  progress: number;
  health: ProjectHealth;
  schedule: ScheduleVariance;
  cost: CostVariance;
  pendingTasksCount: number;
  blockedTasksCount: number;
  openIncidentsCount: number;
  criticalIncidentsCount: number;
  pendingApprovalsCount: number;
  pendingDeliveriesCount: number;
  upcomingMilestones: ExecutionMilestoneDto[];
  recentDailyLogs: SiteDailyLogDto[];
  recentPhotos: SitePhotoDto[];
}

export interface ClientViewDto {
  projectName: string;
  status: ExecutionStatus;
  progress: number;
  startDate?: string | null;
  plannedEndDate?: string | null;
  completedMilestones: ExecutionMilestoneDto[];
  upcomingMilestones: ExecutionMilestoneDto[];
  recentPhotos: SitePhotoDto[];
  pendingClientApprovals: Array<{
    id: string;
    title: string;
    description: string;
    costImpact: number;
    timeImpactDays: number;
    requestDate: string;
  }>;
  budgetSummary?: {
    initialBudget: number;
    approvedChanges: number;
    currentTotal: number;
    progressPercent: number;
  };
}

export interface ContractorViewDto {
  projectName: string;
  assignedTasks: ExecutionTaskDto[];
  upcomingDeliveries: MaterialDeliveryDto[];
  assignedIncidents: ConstructionIncidentDto[];
  todayChecklist: Array<{
    id: string;
    label: string;
    isDone: boolean;
    phaseName?: string;
  }>;
  recentPhotos: SitePhotoDto[];
}
