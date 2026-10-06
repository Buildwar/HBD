-- ============================================================
-- HBD — V14.0.0 MIGRATION: PROFESSIONAL PROJECT DOCUMENTATION & PRESENTATION
-- ============================================================

-- CreateEnums
CREATE TYPE "DocumentType" AS ENUM (
    'PROJECT_DOSSIER',
    'DESIGN_PRESENTATION',
    'TECHNICAL_REPORT',
    'RENOVATION_REPORT',
    'BUDGET_REPORT',
    'FURNITURE_SCHEDULE',
    'MATERIAL_SCHEDULE',
    'SCENARIO_COMPARISON',
    'CLIENT_PRESENTATION',
    'CUSTOM'
);

CREATE TYPE "DocumentStatus" AS ENUM (
    'DRAFT',
    'GENERATING',
    'READY',
    'WARNING',
    'FAILED',
    'ARCHIVED'
);

CREATE TYPE "DocumentOrientation" AS ENUM (
    'PORTRAIT',
    'LANDSCAPE'
);

CREATE TYPE "DocumentPageSize" AS ENUM (
    'A4',
    'A3'
);

CREATE TYPE "DocumentSectionType" AS ENUM (
    'COVER',
    'PROJECT_SUMMARY',
    'PROJECT_DATA',
    'EXISTING_PLAN',
    'PROPOSED_PLAN',
    'SPACE_ANALYSIS',
    'FUNCTIONAL_ZONES',
    'MEASUREMENTS',
    'FURNITURE',
    'MATERIALS',
    'LIGHTING',
    'CONSTRUCTION',
    'BUDGET',
    'SCENARIO_COMPARISON',
    'OPTIMIZATION',
    'VALIDATIONS',
    'RENDERS',
    'THREE_D_VIEWS',
    'CONCLUSIONS',
    'NOTES',
    'DISCLAIMER'
);

-- CreateTable: project_documents
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "scenarioId" TEXT,
    "alternativeId" TEXT,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL DEFAULT 'PROJECT_DOSSIER',
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "language" TEXT NOT NULL DEFAULT 'es',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "orientation" "DocumentOrientation" NOT NULL DEFAULT 'PORTRAIT',
    "pageSize" "DocumentPageSize" NOT NULL DEFAULT 'A4',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable: document_sections
CREATE TABLE "document_sections" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "type" "DocumentSectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL DEFAULT '{}',
    "contentData" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'READY',
    "warnings" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable: document_templates
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL DEFAULT 'PROJECT_DOSSIER',
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "defaultOrientation" "DocumentOrientation" NOT NULL DEFAULT 'PORTRAIT',
    "defaultPageSize" "DocumentPageSize" NOT NULL DEFAULT 'A4',
    "sectionsConfig" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: document_histories
CREATE TABLE "document_histories" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_sections" ADD CONSTRAINT "document_sections_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "project_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_histories" ADD CONSTRAINT "document_histories_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "project_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
