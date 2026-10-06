-- ============================================================
-- HBD V16.0.0 — REAL PRODUCT IMPORT & DIGITAL FURNITURE TWIN
-- INCREMENTAL MIGRATION
-- ============================================================

-- CreateEnum
CREATE TYPE "ProductProvenance" AS ENUM ('OFFICIAL_3D', 'OFFICIAL_PRODUCT_DATA', 'USER_PROVIDED', 'IMPORTED', 'AI_RECONSTRUCTED', 'PARAMETRIC', 'ESTIMATED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ProductVerificationStatus" AS ENUM ('SYSTEM_EXTRACTED', 'AI_DETECTED', 'USER_CONFIRMED', 'USER_EDITED', 'CUSTOMIZED', 'REVIEW_REQUIRED', 'INVALID');

-- CreateEnum
CREATE TYPE "ProductImageType" AS ENUM ('PRIMARY', 'GALLERY', 'DETAIL', 'MATERIAL', 'VARIANT', 'LIFESTYLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Product3DAssetType" AS ENUM ('OFFICIAL_3D', 'USER_UPLOADED', 'IMPORTED', 'AI_RECONSTRUCTED', 'PARAMETRIC', 'PRIMITIVE');

-- CreateEnum
CREATE TYPE "ProjectProductStatus" AS ENUM ('PLANNED', 'SHORTLISTED', 'ORDERED', 'DELIVERED', 'INSTALLED', 'CANCELLED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "manufacturer" TEXT,
    "productCode" TEXT,
    "sku" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Mobiliario',
    "description" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceDomain" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "price" DOUBLE PRECISION,
    "availability" TEXT,
    "productPageTitle" TEXT,
    "provenance" "ProductProvenance" NOT NULL DEFAULT 'IMPORTED',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "confidenceLevel" TEXT NOT NULL DEFAULT 'HIGH',
    "verificationStatus" "ProductVerificationStatus" NOT NULL DEFAULT 'SYSTEM_EXTRACTED',
    "rawStructuredData" JSONB,
    "furnitureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_dimensions" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "widthM" DOUBLE PRECISION NOT NULL,
    "depthM" DOUBLE PRECISION NOT NULL,
    "heightM" DOUBLE PRECISION NOT NULL,
    "diameterM" DOUBLE PRECISION,
    "thicknessM" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "rawWidth" DOUBLE PRECISION,
    "rawDepth" DOUBLE PRECISION,
    "rawHeight" DOUBLE PRECISION,
    "rawUnit" TEXT DEFAULT 'cm',
    "provenance" "ProductProvenance" NOT NULL DEFAULT 'OFFICIAL_PRODUCT_DATA',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "isCustomized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_materials" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'wood',
    "name" TEXT NOT NULL,
    "finish" TEXT,
    "color" TEXT,
    "colorHex" TEXT,
    "textureUrl" TEXT,
    "provenance" "ProductProvenance" NOT NULL DEFAULT 'OFFICIAL_PRODUCT_DATA',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "color" TEXT,
    "colorCode" TEXT,
    "material" TEXT,
    "finish" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'EUR',
    "imageUrl" TEXT,
    "dimensions" JSONB,
    "provenance" "ProductProvenance" NOT NULL DEFAULT 'OFFICIAL_PRODUCT_DATA',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_images_catalog" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ProductImageType" NOT NULL DEFAULT 'PRIMARY',
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_3d_assets" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "type" "Product3DAssetType" NOT NULL DEFAULT 'PARAMETRIC',
    "format" TEXT NOT NULL DEFAULT 'parametric_box',
    "modelUrl" TEXT,
    "geometryConfig" JSONB,
    "provenance" "ProductProvenance" NOT NULL DEFAULT 'PARAMETRIC',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "isEstimatedAi" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_3d_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_price_histories" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceUrl" TEXT,

    CONSTRAINT "product_price_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "furniture_twins" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "furnitureId" TEXT,
    "name" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL,
    "geometry" JSONB NOT NULL,
    "materials" JSONB NOT NULL,
    "asset3dId" TEXT,
    "transform" JSONB,
    "provenance" "ProductProvenance" NOT NULL DEFAULT 'IMPORTED',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "verificationStatus" "ProductVerificationStatus" NOT NULL DEFAULT 'SYSTEM_EXTRACTED',
    "lockRealDimensions" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "furniture_twins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "project_products" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "floorId" TEXT,
    "roomId" TEXT,
    "roomName" TEXT,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "furnitureTwinId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "ProjectProductStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "placed2d" BOOLEAN NOT NULL DEFAULT false,
    "posX" DOUBLE PRECISION,
    "posY" DOUBLE PRECISION,
    "posZ" DOUBLE PRECISION,
    "rotationDeg" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "shopping_list_items" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brand" TEXT,
    "sku" TEXT,
    "sourceUrl" TEXT,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Mobiliario',
    "targetRoomName" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "ProjectProductStatus" NOT NULL DEFAULT 'PLANNED',
    "availability" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "product_dimensions_productId_key" ON "product_dimensions"("productId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_furnitureId_fkey" FOREIGN KEY ("furnitureId") REFERENCES "furniture"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_dimensions" ADD CONSTRAINT "product_dimensions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_images_catalog" ADD CONSTRAINT "product_images_catalog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_3d_assets" ADD CONSTRAINT "product_3d_assets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_price_histories" ADD CONSTRAINT "product_price_histories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "furniture_twins" ADD CONSTRAINT "furniture_twins_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "furniture_twins" ADD CONSTRAINT "furniture_twins_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "furniture_twins" ADD CONSTRAINT "furniture_twins_asset3dId_fkey" FOREIGN KEY ("asset3dId") REFERENCES "product_3d_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_products" ADD CONSTRAINT "project_products_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_products" ADD CONSTRAINT "project_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_products" ADD CONSTRAINT "project_products_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_products" ADD CONSTRAINT "project_products_furnitureTwinId_fkey" FOREIGN KEY ("furnitureTwinId") REFERENCES "furniture_twins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
