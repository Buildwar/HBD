-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('PROPERTY_ACQUISITION', 'RENOVATION', 'FURNITURE', 'APPLIANCES', 'EQUIPMENT', 'PROFESSIONAL_SERVICES', 'LOGISTICS', 'PERMITS', 'CONTINGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "CostStatus" AS ENUM ('ESTIMATED', 'QUOTED', 'APPROVED', 'COMMITTED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CostSource" AS ENUM ('MANUAL', 'CONSTRUCTION_V11', 'EXECUTION_V15', 'PRODUCT_V16', 'FURNITURE_V5', 'ACQUISITION');

-- CreateTable
CREATE TABLE "property_acquisitions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notaryFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "registryFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transferTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agencyFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "legalFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "renovationTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valuationFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherAcquisitionFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAcquisitionCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_acquisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_items" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "CostCategory" NOT NULL,
    "subcategory" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'ud',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "estimatedUnitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedTotalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualUnitCost" DOUBLE PRECISION,
    "actualTotalCost" DOUBLE PRECISION,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CostStatus" NOT NULL DEFAULT 'ESTIMATED',
    "source" "CostSource" NOT NULL DEFAULT 'MANUAL',
    "sourceReference" TEXT,
    "spaceId" TEXT,
    "roomName" TEXT,
    "supplierId" TEXT,
    "supplierName" TEXT,
    "invoiceRef" TEXT,
    "paymentDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_payments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "costItemId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL DEFAULT 'TRANSFER',
    "reference" TEXT,
    "payee" TEXT,
    "invoiceRef" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_revisions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "baselineTransformationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newTransformationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reason" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_snapshots" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalTransformationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalInvestment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "propertyAcquisitionCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "renovationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "furnitureCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "appliancesCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equipmentCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "professionalServicesCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "logisticsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "permitsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contingencyCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_acquisitions_projectId_key" ON "property_acquisitions"("projectId");

-- AddForeignKey
ALTER TABLE "property_acquisitions" ADD CONSTRAINT "property_acquisitions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_items" ADD CONSTRAINT "cost_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_items" ADD CONSTRAINT "cost_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_payments" ADD CONSTRAINT "project_payments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_payments" ADD CONSTRAINT "project_payments_costItemId_fkey" FOREIGN KEY ("costItemId") REFERENCES "cost_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_revisions" ADD CONSTRAINT "budget_revisions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_snapshots" ADD CONSTRAINT "financial_snapshots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
