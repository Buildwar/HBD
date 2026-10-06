-- ============================================================
-- HBD — V15.0.0 MIGRATION: CONSTRUCTION EXECUTION & SITE MANAGEMENT
-- ============================================================

-- CreateEnums
CREATE TYPE "ExecutionStatus" AS ENUM ('PLANNED', 'READY', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'CLOSED');
CREATE TYPE "ExecutionTaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AssigneeType" AS ENUM ('USER', 'WORKER', 'COMPANY', 'SUPPLIER');
CREATE TYPE "MaterialExecutionStatus" AS ENUM ('PLANNED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'IN_USE', 'CONSUMED', 'CANCELLED');
CREATE TYPE "MaterialDeliveryStatus" AS ENUM ('EXPECTED', 'ORDERED', 'IN_TRANSIT', 'DELIVERED', 'PARTIAL', 'DELAYED', 'CANCELLED');
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');
CREATE TYPE "ExecutionInvoiceStatus" AS ENUM ('RECEIVED', 'PENDING', 'APPROVED', 'PAID', 'CANCELLED');
CREATE TYPE "IncidentType" AS ENUM ('DELAY', 'QUALITY', 'MATERIAL', 'SAFETY', 'DESIGN', 'STRUCTURAL', 'INSTALLATION', 'SUPPLIER', 'ACCESS', 'OTHER');
CREATE TYPE "IncidentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED');
CREATE TYPE "ChangeOrderStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'CANCELLED');
CREATE TYPE "ApprovalDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "InspectionResult" AS ENUM ('PASS', 'WARNING', 'FAIL', 'NOT_INSPECTED');
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED');
CREATE TYPE "ClosureStatus" AS ENUM ('OPEN', 'READY_TO_CLOSE', 'CLOSED');

-- CreateTable
CREATE TABLE "execution_projects" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "constructionProjectId" TEXT,
    "scenarioId" TEXT,
    "alternativeId" TEXT,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'READY',
    "startDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_packages" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "phaseId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ExecutionTaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_tasks" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "workPackageId" TEXT,
    "constructionTaskId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ExecutionTaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plannedDurationDays" INTEGER NOT NULL DEFAULT 1,
    "actualDurationDays" INTEGER NOT NULL DEFAULT 0,
    "plannedStart" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "plannedEnd" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "assigneeType" "AssigneeType" NOT NULL DEFAULT 'WORKER',
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "notes" TEXT,
    "dependencies" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_execution_items" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "constructionItemId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "unit" TEXT NOT NULL DEFAULT 'ud',
    "plannedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receivedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wasteQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCommittedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalActualCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "MaterialExecutionStatus" NOT NULL DEFAULT 'PLANNED',
    "supplierId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "supplierId" TEXT,
    "reference" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "itemsSummary" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_deliveries" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "materialItemId" TEXT,
    "materialName" TEXT NOT NULL,
    "supplierId" TEXT,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'ud',
    "status" "MaterialDeliveryStatus" NOT NULL DEFAULT 'EXPECTED',
    "location" TEXT,
    "documentUrl" TEXT,
    "notes" TEXT,
    "receivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_invoices" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "supplierId" TEXT,
    "reference" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ExecutionInvoiceStatus" NOT NULL DEFAULT 'RECEIVED',
    "documentUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_daily_logs" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weatherConditions" TEXT,
    "workersPresent" JSONB NOT NULL DEFAULT '[]',
    "tasksPerformed" JSONB NOT NULL DEFAULT '[]',
    "materialsReceived" JSONB NOT NULL DEFAULT '[]',
    "incidentNotes" TEXT,
    "observations" TEXT,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "progressRecorded" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_incidents" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL DEFAULT 'OTHER',
    "priority" "IncidentPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "location" TEXT,
    "phaseId" TEXT,
    "taskId" TEXT,
    "responsibleAssignee" TEXT,
    "dateReported" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolutionDate" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "requiresProReview" BOOLEAN NOT NULL DEFAULT false,
    "proReviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_change_orders" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ChangeOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "impact" JSONB NOT NULL DEFAULT '{"costImpact":0,"timeImpactDays":0}',
    "requestedBy" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "affectedTaskIds" JSONB NOT NULL DEFAULT '[]',
    "affectedItemIds" JSONB NOT NULL DEFAULT '[]',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_change_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_approvals" (
    "id" TEXT NOT NULL,
    "changeOrderId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "decision" "ApprovalDecision" NOT NULL DEFAULT 'PENDING',
    "decisionDate" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_inspections" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "phaseName" TEXT,
    "taskId" TEXT,
    "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectorName" TEXT NOT NULL,
    "result" "InspectionResult" NOT NULL DEFAULT 'PASS',
    "observations" TEXT,
    "associatedIncidentId" TEXT,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_milestones" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_photos" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "caption" TEXT,
    "photoType" TEXT NOT NULL DEFAULT 'PROGRESS',
    "stage" TEXT NOT NULL DEFAULT 'DURING',
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phaseId" TEXT,
    "taskId" TEXT,
    "incidentId" TEXT,
    "inspectionId" TEXT,
    "milestoneId" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_closures" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "status" "ClosureStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "finalSummary" TEXT,
    "checklist" JSONB NOT NULL DEFAULT '{}',
    "finalReportDocumentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_closures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_closures_executionId_key" ON "project_closures"("executionId");

-- AddForeignKey
ALTER TABLE "execution_projects" ADD CONSTRAINT "execution_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "execution_projects" ADD CONSTRAINT "execution_projects_constructionProjectId_fkey" FOREIGN KEY ("constructionProjectId") REFERENCES "construction_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "execution_projects" ADD CONSTRAINT "execution_projects_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "project_scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "construction_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_tasks" ADD CONSTRAINT "execution_tasks_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "execution_tasks" ADD CONSTRAINT "execution_tasks_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "execution_tasks" ADD CONSTRAINT "execution_tasks_constructionTaskId_fkey" FOREIGN KEY ("constructionTaskId") REFERENCES "construction_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_execution_items" ADD CONSTRAINT "material_execution_items_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "material_execution_items" ADD CONSTRAINT "material_execution_items_constructionItemId_fkey" FOREIGN KEY ("constructionItemId") REFERENCES "construction_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "material_execution_items" ADD CONSTRAINT "material_execution_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_deliveries" ADD CONSTRAINT "material_deliveries_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "material_deliveries" ADD CONSTRAINT "material_deliveries_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "material_deliveries" ADD CONSTRAINT "material_deliveries_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_invoices" ADD CONSTRAINT "execution_invoices_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "execution_invoices" ADD CONSTRAINT "execution_invoices_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "execution_invoices" ADD CONSTRAINT "execution_invoices_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_daily_logs" ADD CONSTRAINT "site_daily_logs_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_incidents" ADD CONSTRAINT "construction_incidents_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_change_orders" ADD CONSTRAINT "construction_change_orders_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_approvals" ADD CONSTRAINT "execution_approvals_changeOrderId_fkey" FOREIGN KEY ("changeOrderId") REFERENCES "construction_change_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_milestones" ADD CONSTRAINT "execution_milestones_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_closures" ADD CONSTRAINT "project_closures_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
