-- ============================================================
-- HBD — HOME BOARD DESIGNER (V11.0.0)
-- Formal Database Migration: Construction, Renovation, Spaces & Functional Zones
-- ============================================================

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'DESIGNER', 'USER', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "WallType" AS ENUM ('EXTERIOR', 'INTERIOR', 'PARTITION', 'LOAD_BEARING');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "FloorPlanStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'ANALYZED', 'VALIDATED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'DEBUG');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ConstructionProjectStatus" AS ENUM ('DRAFT', 'PLANNING', 'READY_FOR_REVIEW', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ConstructionOperationType" AS ENUM ('DEMOLITION', 'CONSTRUCTION', 'INSTALLATION', 'REPLACEMENT', 'FINISHING', 'FURNISHING', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ConstructionTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "FunctionalZoneType" AS ENUM ('LIVING', 'DINING', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'WORKSPACE', 'CIRCULATION', 'STORAGE', 'TERRACE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS "roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");

CREATE TABLE IF NOT EXISTS "permissions" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "permissions_code_key" ON "permissions"("code");

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "avatar" TEXT,
  "language" TEXT NOT NULL DEFAULT 'es',
  "themePreferences" JSONB NOT NULL DEFAULT '{"themeMode":"dark","accentColor":"#10b981","borderRadius":"0.75rem","density":"normal"}',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "roleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

CREATE TABLE IF NOT EXISTS "projects" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "address" TEXT,
  "propertyType" TEXT DEFAULT 'residential',
  "userId" TEXT NOT NULL,
  "isArchived" BOOLEAN NOT NULL DEFAULT false,
  "thumbnail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "floors" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  "heightM" DOUBLE PRECISION NOT NULL DEFAULT 2.50,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "floor_plans" (
  "id" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "originalFileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "widthPx" INTEGER,
  "heightPx" INTEGER,
  "scaleFactor" DOUBLE PRECISION,
  "status" "FloorPlanStatus" NOT NULL DEFAULT 'UPLOADED',
  "detectedElementsSummary" JSONB,
  "analysisData" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "floor_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "walls" (
  "id" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "startX" DOUBLE PRECISION NOT NULL,
  "startY" DOUBLE PRECISION NOT NULL,
  "endX" DOUBLE PRECISION NOT NULL,
  "endY" DOUBLE PRECISION NOT NULL,
  "thicknessM" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
  "heightM" DOUBLE PRECISION NOT NULL DEFAULT 2.50,
  "wallType" "WallType" NOT NULL DEFAULT 'INTERIOR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "walls_pkey" PRIMARY KEY ("id")
);

-- 3. Spaces and Functional Zones (V10 / V11)
CREATE TABLE IF NOT EXISTS "spaces" (
  "id" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT,
  "description" TEXT,
  "polygon" JSONB,
  "areaM2" DOUBLE PRECISION DEFAULT 0,
  "heightM" DOUBLE PRECISION NOT NULL DEFAULT 2.50,
  "color" TEXT DEFAULT '#10b981',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "functional_zones" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "FunctionalZoneType" NOT NULL DEFAULT 'OTHER',
  "polygon" JSONB,
  "areaM2" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "functional_zones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "rooms" (
  "id" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "spaceId" TEXT,
  "name" TEXT NOT NULL,
  "roomType" TEXT,
  "polygon" JSONB NOT NULL,
  "areaM2" DOUBLE PRECISION NOT NULL,
  "widthM" DOUBLE PRECISION,
  "lengthM" DOUBLE PRECISION,
  "heightM" DOUBLE PRECISION NOT NULL DEFAULT 2.50,
  "color" TEXT DEFAULT '#3b82f6',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- Add spaceId column to rooms if table already existed without it
DO $$ BEGIN
  ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "spaceId" TEXT;
EXCEPTION WHEN undefined_column THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "doors" (
  "id" TEXT NOT NULL,
  "wallId" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "posX" DOUBLE PRECISION NOT NULL,
  "posY" DOUBLE PRECISION NOT NULL,
  "widthM" DOUBLE PRECISION NOT NULL DEFAULT 0.80,
  "heightM" DOUBLE PRECISION NOT NULL DEFAULT 2.10,
  "rotationDeg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "swingDirection" TEXT NOT NULL DEFAULT 'INWARD_RIGHT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "doors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "windows" (
  "id" TEXT NOT NULL,
  "wallId" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "posX" DOUBLE PRECISION NOT NULL,
  "posY" DOUBLE PRECISION NOT NULL,
  "widthM" DOUBLE PRECISION NOT NULL DEFAULT 1.20,
  "heightM" DOUBLE PRECISION NOT NULL DEFAULT 1.20,
  "elevationM" DOUBLE PRECISION NOT NULL DEFAULT 0.90,
  "rotationDeg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "windows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "measurements" (
  "id" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "startX" DOUBLE PRECISION NOT NULL,
  "startY" DOUBLE PRECISION NOT NULL,
  "endX" DOUBLE PRECISION NOT NULL,
  "endY" DOUBLE PRECISION NOT NULL,
  "distanceM" DOUBLE PRECISION NOT NULL,
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "furniture_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "icon" TEXT,
  "description" TEXT,
  CONSTRAINT "furniture_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "furniture_categories_slug_key" ON "furniture_categories"("slug");

CREATE TABLE IF NOT EXISTS "furniture" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "defaultWidthM" DOUBLE PRECISION NOT NULL,
  "defaultDepthM" DOUBLE PRECISION NOT NULL,
  "defaultHeightM" DOUBLE PRECISION NOT NULL,
  "model3dUrl" TEXT,
  "imageUrl" TEXT,
  "isCustom" BOOLEAN NOT NULL DEFAULT false,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "furniture_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "furniture_placements" (
  "id" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "furnitureId" TEXT NOT NULL,
  "posX" DOUBLE PRECISION NOT NULL,
  "posY" DOUBLE PRECISION NOT NULL,
  "posZ" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "rotationDeg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "widthM" DOUBLE PRECISION NOT NULL,
  "depthM" DOUBLE PRECISION NOT NULL,
  "heightM" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "furniture_placements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "renders" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "renders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "app_settings" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "app_settings_key_key" ON "app_settings"("key");

CREATE TABLE IF NOT EXISTS "system_logs" (
  "id" TEXT NOT NULL,
  "level" "LogLevel" NOT NULL DEFAULT 'INFO',
  "module" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_design_histories" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "roomId" TEXT,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'mock',
  "prompt" TEXT,
  "preferences" JSONB NOT NULL,
  "proposals" JSONB NOT NULL,
  "selectedProposalId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'GENERATED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_design_histories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "design_variants" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "floorId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "materialOverrides" JSONB NOT NULL DEFAULT '{}',
  "furnitureOverrides" JSONB NOT NULL DEFAULT '{}',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "design_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "project_images" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "floorId" TEXT,
  "roomId" TEXT,
  "sourceType" TEXT NOT NULL DEFAULT 'UPLOAD',
  "filename" TEXT NOT NULL,
  "originalFilename" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'UPLOADED',
  "provider" TEXT DEFAULT 'mock',
  "analysisData" JSONB,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "analyzedAt" TIMESTAMP(3),
  CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- 4. Construction System Tables (V11)
CREATE TABLE IF NOT EXISTS "construction_projects" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "status" "ConstructionProjectStatus" NOT NULL DEFAULT 'PLANNING',
  "notes" TEXT,
  "targetStartDate" TIMESTAMP(3),
  "targetEndDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "construction_projects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "construction_projects_projectId_key" ON "construction_projects"("projectId");

CREATE TABLE IF NOT EXISTS "construction_phases" (
  "id" TEXT NOT NULL,
  "constructionId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "status" "ConstructionTaskStatus" NOT NULL DEFAULT 'TODO',
  "estimatedDurationDays" INTEGER NOT NULL DEFAULT 7,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "dependencies" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "construction_phases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "construction_tasks" (
  "id" TEXT NOT NULL,
  "phaseId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "ConstructionTaskStatus" NOT NULL DEFAULT 'TODO',
  "order" INTEGER NOT NULL DEFAULT 0,
  "assigneeId" TEXT,
  "dependencies" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "construction_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "suppliers" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contact" TEXT,
  "website" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "construction_items" (
  "id" TEXT NOT NULL,
  "constructionId" TEXT NOT NULL,
  "spaceId" TEXT,
  "category" TEXT NOT NULL,
  "operation" "ConstructionOperationType" NOT NULL DEFAULT 'CONSTRUCTION',
  "name" TEXT NOT NULL,
  "description" TEXT,
  "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "unit" TEXT NOT NULL DEFAULT 'ud',
  "wastePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "materialCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "laborCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "otherCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "confidence" TEXT NOT NULL DEFAULT 'GEOMETRY_CALCULATED',
  "supplierId" TEXT,
  "requiresProValidation" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "construction_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "checklist_items" (
  "id" TEXT NOT NULL,
  "phaseId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "isDone" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "construction_documents" (
  "id" TEXT NOT NULL,
  "constructionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "docType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "construction_documents_pkey" PRIMARY KEY ("id")
);

-- 5. Foreign Key Constraints (Protected with DO blocks to prevent duplicates)
DO $$ BEGIN
  ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "floors" ADD CONSTRAINT "floors_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "walls" ADD CONSTRAINT "walls_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "spaces" ADD CONSTRAINT "spaces_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "functional_zones" ADD CONSTRAINT "functional_zones_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "rooms" ADD CONSTRAINT "rooms_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "rooms" ADD CONSTRAINT "rooms_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "doors" ADD CONSTRAINT "doors_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "walls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "doors" ADD CONSTRAINT "doors_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "windows" ADD CONSTRAINT "windows_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "walls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "windows" ADD CONSTRAINT "windows_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "measurements" ADD CONSTRAINT "measurements_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "furniture" ADD CONSTRAINT "furniture_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "furniture_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "furniture" ADD CONSTRAINT "furniture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "furniture_placements" ADD CONSTRAINT "furniture_placements_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "furniture_placements" ADD CONSTRAINT "furniture_placements_furnitureId_fkey" FOREIGN KEY ("furnitureId") REFERENCES "furniture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "renders" ADD CONSTRAINT "renders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ai_design_histories" ADD CONSTRAINT "ai_design_histories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ai_design_histories" ADD CONSTRAINT "ai_design_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "design_variants" ADD CONSTRAINT "design_variants_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "project_images" ADD CONSTRAINT "project_images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "project_images" ADD CONSTRAINT "project_images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "construction_projects" ADD CONSTRAINT "construction_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "construction_phases" ADD CONSTRAINT "construction_phases_constructionId_fkey" FOREIGN KEY ("constructionId") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "construction_tasks" ADD CONSTRAINT "construction_tasks_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "construction_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "construction_tasks" ADD CONSTRAINT "construction_tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "construction_items" ADD CONSTRAINT "construction_items_constructionId_fkey" FOREIGN KEY ("constructionId") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "construction_items" ADD CONSTRAINT "construction_items_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "construction_items" ADD CONSTRAINT "construction_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "construction_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "construction_documents" ADD CONSTRAINT "construction_documents_constructionId_fkey" FOREIGN KEY ("constructionId") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
