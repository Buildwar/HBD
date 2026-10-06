/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * TIPOS Y DEFINICIONES PARA EL MOTOR DE DOCUMENTACIÓN Y PRESENTACIÓN
 * PROFESSIONAL PROJECT DOCUMENTATION & PRESENTATION
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

export type DocumentType =
  | 'PROJECT_DOSSIER'
  | 'DESIGN_PRESENTATION'
  | 'TECHNICAL_REPORT'
  | 'RENOVATION_REPORT'
  | 'BUDGET_REPORT'
  | 'FURNITURE_SCHEDULE'
  | 'MATERIAL_SCHEDULE'
  | 'SCENARIO_COMPARISON'
  | 'CLIENT_PRESENTATION'
  | 'CUSTOM';

export type DocumentStatus =
  | 'DRAFT'
  | 'GENERATING'
  | 'READY'
  | 'WARNING'
  | 'FAILED'
  | 'ARCHIVED';

export type DocumentOrientation = 'PORTRAIT' | 'LANDSCAPE';

export type DocumentPageSize = 'A4' | 'A3';

export type DocumentSectionType =
  | 'COVER'
  | 'PROJECT_SUMMARY'
  | 'PROJECT_DATA'
  | 'EXISTING_PLAN'
  | 'PROPOSED_PLAN'
  | 'SPACE_ANALYSIS'
  | 'FUNCTIONAL_ZONES'
  | 'MEASUREMENTS'
  | 'FURNITURE'
  | 'MATERIALS'
  | 'LIGHTING'
  | 'CONSTRUCTION'
  | 'BUDGET'
  | 'SCENARIO_COMPARISON'
  | 'OPTIMIZATION'
  | 'VALIDATIONS'
  | 'RENDERS'
  | 'THREE_D_VIEWS'
  | 'CONCLUSIONS'
  | 'NOTES'
  | 'DISCLAIMER';

export interface DocumentSectionConfig {
  type: DocumentSectionType;
  title: string;
  order: number;
  isEnabled: boolean;
  pageBreakBefore?: boolean;
  hideInClientPresentation?: boolean;
  customSettings?: Record<string, any>;
}

export interface DocumentSectionDto {
  id: string;
  documentId: string;
  type: DocumentSectionType;
  title: string;
  order: number;
  isEnabled: boolean;
  config: DocumentSectionConfig | Record<string, any>;
  contentData: Record<string, any>;
  status: 'READY' | 'WARNING' | 'FAILED' | 'UNKNOWN';
  warnings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentHistoryDto {
  id: string;
  documentId: string;
  action: 'CREATED' | 'GENERATED' | 'EXPORTED' | 'REGENERATED' | 'ARCHIVED' | string;
  version: string;
  snapshotData: Record<string, any>;
  userId?: string | null;
  createdAt: string;
}

export interface ProjectDocumentDto {
  id: string;
  projectId: string;
  scenarioId?: string | null;
  alternativeId?: string | null;
  templateId?: string | null;
  name: string;
  description?: string | null;
  type: DocumentType;
  status: DocumentStatus;
  language: string;
  version: string;
  orientation: DocumentOrientation;
  pageSize: DocumentPageSize;
  metadata: {
    clientName?: string;
    author?: string;
    targetDate?: string;
    coverImageUrl?: string;
    primaryRenderUrl?: string;
    notes?: string;
    generatedAt?: string;
    totalPages?: number;
  } & Record<string, any>;
  sections?: DocumentSectionDto[];
  history?: DocumentHistoryDto[];
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplateDto {
  id: string;
  name: string;
  description?: string | null;
  type: DocumentType;
  isSystem: boolean;
  defaultOrientation: DocumentOrientation;
  defaultPageSize: DocumentPageSize;
  sectionsConfig: DocumentSectionConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  projectId: string;
  scenarioId?: string | null;
  alternativeId?: string | null;
  templateId?: string | null;
  templateType?: DocumentType;
  name: string;
  description?: string;
  language?: string;
  orientation?: DocumentOrientation;
  pageSize?: DocumentPageSize;
  customSections?: DocumentSectionConfig[];
  metadata?: Record<string, any>;
}

export interface DocumentExportOptions {
  format: 'PDF' | 'PRINT' | 'JSON' | 'CSV';
  orientation?: DocumentOrientation;
  pageSize?: DocumentPageSize;
  includeCover?: boolean;
  includeIndex?: boolean;
  includePageNumbers?: boolean;
  includeHeaderFooter?: boolean;
  theme?: 'dark' | 'light' | 'print';
}

export interface DocumentExportResult {
  format: 'PDF' | 'PRINT' | 'JSON' | 'CSV';
  filename: string;
  contentType: string;
  content: string; // Base64 or HTML or JSON text
  exportedAt: string;
  sizeBytes?: number;
}
