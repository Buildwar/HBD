-- CreateEnum
CREATE TYPE "ProcurementCategory" AS ENUM ('RENOVATION_MATERIAL', 'FURNITURE', 'APPLIANCE', 'EQUIPMENT', 'LIGHTING', 'DECORATION', 'PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'FLOORING', 'PAINT', 'TOOLS', 'SAFETY', 'LOGISTICS', 'OTHER');

-- CreateEnum
CREATE TYPE "ProcurementStatus" AS ENUM ('DRAFT', 'NEEDED', 'REQUESTED', 'QUOTED', 'APPROVAL_PENDING', 'APPROVED', 'ORDERED', 'CONFIRMED', 'PARTIALLY_SHIPPED', 'SHIPPED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'INSPECTED', 'INSTALLED', 'COMPLETED', 'CANCELLED', 'RETURNED', 'INCIDENT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ProcurementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ProcurementSource" AS ENUM ('MANUAL', 'V11_CONSTRUCTION', 'V15_EXECUTION', 'V16_PRODUCT', 'V17_FINANCIAL', 'SCENARIO', 'OPTIMIZATION', 'SYSTEM', 'USER_CONFIRMED');

-- CreateEnum
CREATE TYPE "SupplierQuoteStatus" AS ENUM ('DRAFT', 'RECEIVED', 'SELECTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProcurementDeliveryStatus" AS ENUM ('PENDING', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'FAILED', 'RETURNED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ProcurementIncidentType" AS ENUM ('DAMAGED', 'MISSING', 'WRONG_PRODUCT', 'WRONG_VARIANT', 'DELAY', 'QUALITY', 'QUANTITY', 'OTHER');

-- CreateEnum
CREATE TYPE "ProcurementReturnStatus" AS ENUM ('RETURN_REQUESTED', 'RETURNED', 'REFUNDED', 'PARTIAL_REFUND');

-- CreateTable
CREATE TABLE "procurement_items" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProcurementCategory" NOT NULL DEFAULT 'OTHER',
    "subcategory" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'ud',
    "requiredDate" TIMESTAMP(3),
    "preferredDate" TIMESTAMP(3),
    "roomId" TEXT,
    "roomName" TEXT,
    "spaceId" TEXT,
    "phaseId" TEXT,
    "phaseName" TEXT,
    "taskId" TEXT,
    "taskName" TEXT,
    "productId" TEXT,
    "productVariantId" TEXT,
    "furnitureTwinId" TEXT,
    "supplierId" TEXT,
    "supplierName" TEXT,
    "estimatedUnitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedTotalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "selectedUnitCost" DOUBLE PRECISION,
    "selectedTotalCost" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "priority" "ProcurementPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "ProcurementStatus" NOT NULL DEFAULT 'NEEDED',
    "source" "ProcurementSource" NOT NULL DEFAULT 'MANUAL',
    "sourceReference" TEXT,
    "notes" TEXT,
    "orderedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receivedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "damagedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "missingQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leadTimeDays" INTEGER DEFAULT 7,
    "selectedQuoteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_quotes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "procurementItemId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "validUntil" TIMESTAMP(3),
    "estimatedDeliveryDays" INTEGER NOT NULL DEFAULT 7,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "installationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" "SupplierQuoteStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_orders" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_order_lines" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "procurementItemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'ud',
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receivedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "damagedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "procurement_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_deliveries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "orderId" TEXT,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "shippedAt" TIMESTAMP(3),
    "estimatedDelivery" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "status" "ProcurementDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "receivedBy" TEXT,
    "itemsSummary" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_incidents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "procurementItemId" TEXT,
    "orderId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ProcurementIncidentType" NOT NULL DEFAULT 'OTHER',
    "quantityAffected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "costImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeImpactDays" INTEGER NOT NULL DEFAULT 0,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolutionDate" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_returns" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "procurementItemId" TEXT NOT NULL,
    "orderId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDate" TIMESTAMP(3),
    "status" "ProcurementReturnStatus" NOT NULL DEFAULT 'RETURN_REQUESTED',
    "refundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_requirements" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "taskName" TEXT,
    "materialName" TEXT NOT NULL,
    "requiredQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purchasedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'ud',
    "wastePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCalculatedNeed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surplusQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "missingQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isCovered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_requirements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotes" ADD CONSTRAINT "supplier_quotes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotes" ADD CONSTRAINT "supplier_quotes_procurementItemId_fkey" FOREIGN KEY ("procurementItemId") REFERENCES "procurement_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotes" ADD CONSTRAINT "supplier_quotes_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_order_lines" ADD CONSTRAINT "procurement_order_lines_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "procurement_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_order_lines" ADD CONSTRAINT "procurement_order_lines_procurementItemId_fkey" FOREIGN KEY ("procurementItemId") REFERENCES "procurement_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_deliveries" ADD CONSTRAINT "procurement_deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "procurement_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_incidents" ADD CONSTRAINT "procurement_incidents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_incidents" ADD CONSTRAINT "procurement_incidents_procurementItemId_fkey" FOREIGN KEY ("procurementItemId") REFERENCES "procurement_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_returns" ADD CONSTRAINT "procurement_returns_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_returns" ADD CONSTRAINT "procurement_returns_procurementItemId_fkey" FOREIGN KEY ("procurementItemId") REFERENCES "procurement_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirements" ADD CONSTRAINT "material_requirements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
