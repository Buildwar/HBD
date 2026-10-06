/**
 * HBD — HOME BOARD DESIGNER (V11.0.0)
 * Types and Interfaces for Construction & Renovation Intelligence
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

export type ConstructionProjectStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'READY_FOR_REVIEW'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type ConstructionOperationType =
  | 'DEMOLITION'
  | 'CONSTRUCTION'
  | 'INSTALLATION'
  | 'REPLACEMENT'
  | 'FINISHING'
  | 'FURNISHING'
  | 'OTHER';

export type ConstructionTaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';

export type PlanState = 'EXISTING' | 'PROPOSED';

export type MeasurementUnit = 'm2' | 'm' | 'ud' | 'kg' | 'm3' | 'l' | 'pack';

import type { MeasurementConfidence } from './space.types.js';
export type { MeasurementConfidence };

export type ConstructionCategory =
  | 'DEMOLITION'
  | 'MASONRY'
  | 'FLOORING'
  | 'WALL_FINISH'
  | 'CEILING'
  | 'DOORS'
  | 'WINDOWS'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'HVAC'
  | 'LIGHTING'
  | 'FURNITURE'
  | 'DECORATION'
  | 'OTHER';

export interface ConstructionItemDto {
  id: string;
  constructionId: string;
  spaceId?: string | null;
  spaceName?: string | null;
  category: ConstructionCategory;
  operation: ConstructionOperationType;
  name: string;
  description?: string | null;
  quantity: number;
  unit: MeasurementUnit;
  wastePercent: number; // Porcentaje de merma (e.g. 5, 8, 10)
  effectiveQuantity: number; // quantity * (1 + wastePercent / 100)
  materialCost: number;
  laborCost: number;
  otherCost: number;
  totalCost: number;
  confidence: MeasurementConfidence;
  supplierId?: string | null;
  supplierName?: string | null;
  requiresProValidation: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItemDto {
  id: string;
  phaseId: string;
  label: string;
  isDone: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionTaskDto {
  id: string;
  phaseId: string;
  name: string;
  description?: string | null;
  status: ConstructionTaskStatus;
  order: number;
  assigneeId?: string | null;
  assigneeName?: string | null;
  dependencies: string[]; // IDs de tareas requeridas
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionPhaseDto {
  id: string;
  constructionId: string;
  name: string;
  description?: string | null;
  order: number;
  status: ConstructionTaskStatus;
  estimatedDurationDays: number;
  startDate?: string | null;
  endDate?: string | null;
  dependencies: string[]; // IDs de fases previas
  tasks: ConstructionTaskDto[];
  checklists: ChecklistItemDto[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierDto {
  id: string;
  name: string;
  contact?: string | null;
  website?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ConstructionDocumentDto {
  id: string;
  constructionId: string;
  title: string;
  docType: 'PLAN' | 'MEASUREMENT' | 'BUDGET' | 'MEMORY' | 'PHOTO' | 'INVOICE' | 'EXTERNAL';
  fileUrl: string;
  notes?: string | null;
  createdAt: string;
}

export interface ConstructionProjectDto {
  id: string;
  projectId: string;
  status: ConstructionProjectStatus;
  notes?: string | null;
  targetStartDate?: string | null;
  targetEndDate?: string | null;
  phases: ConstructionPhaseDto[];
  items: ConstructionItemDto[];
  documents: ConstructionDocumentDto[];
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOtherCost: number;
  grandTotalCost: number;
  progressPercent: number;
  proValidationWarningsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionComparisonMetric {
  category: string;
  existingValue: number;
  proposedValue: number;
  difference: number;
  unit: string;
  interpretation?: string;
}

export interface ConstructionComparisonResult {
  projectId: string;
  existingSummary: {
    roomCount: number;
    totalAreaM2: number;
    wallCount: number;
    doorCount: number;
    windowCount: number;
    furnitureCount: number;
  };
  proposedSummary: {
    roomCount: number;
    totalAreaM2: number;
    wallCount: number;
    doorCount: number;
    windowCount: number;
    furnitureCount: number;
  };
  demolitions: {
    wallsToDemolishCount: number;
    doorsToDemolishCount: number;
    windowsToDemolishCount: number;
    estimatedDemolitionAreaM2: number;
    requiresProValidation: boolean;
  };
  newConstructions: {
    newWallsCount: number;
    newDoorsCount: number;
    newWindowsCount: number;
    newFurnitureCount: number;
  };
  metrics: ConstructionComparisonMetric[];
  proValidationNotes: string[];
}

export interface ConstructionReportDto {
  projectName: string;
  projectAddress?: string | null;
  author: string;
  generatedAt: string;
  status: ConstructionProjectStatus;
  comparison: ConstructionComparisonResult;
  budgetSummary: {
    totalMaterial: number;
    totalLabor: number;
    totalOther: number;
    grandTotal: number;
    byCategory: Array<{ category: ConstructionCategory; total: number; percentage: number }>;
    bySpace: Array<{ spaceName: string; total: number; percentage: number }>;
  };
  phasesSummary: Array<{
    name: string;
    durationDays: number;
    taskCount: number;
    completedCount: number;
    status: ConstructionTaskStatus;
  }>;
  legalDisclaimer: string;
}
