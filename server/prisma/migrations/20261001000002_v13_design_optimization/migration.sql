-- HBD V13.0.0 Migration: Intelligent Design Optimization Engine
-- CreateEnum
CREATE TYPE "OptimizationStrategy" AS ENUM ('RULE_BASED', 'PARAMETRIC', 'HEURISTIC', 'AI_ASSISTED', 'HYBRID');

-- CreateEnum
CREATE TYPE "OptimizationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AlternativeStatus" AS ENUM ('GENERATED', 'ANALYZING', 'VALID', 'WARNING', 'INVALID', 'REJECTED', 'SELECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "optimization_requests" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "baseScenarioId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Solicitud de Optimización',
    "objectives" JSONB NOT NULL DEFAULT '[]',
    "constraints" JSONB NOT NULL DEFAULT '[]',
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "strategy" "OptimizationStrategy" NOT NULL DEFAULT 'PARAMETRIC',
    "status" "OptimizationStatus" NOT NULL DEFAULT 'PENDING',
    "maxCandidates" INTEGER NOT NULL DEFAULT 4,
    "timeoutMs" INTEGER NOT NULL DEFAULT 15000,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "optimization_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_alternatives" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "scenarioId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "AlternativeStatus" NOT NULL DEFAULT 'GENERATED',
    "snapshotData" JSONB NOT NULL DEFAULT '{}',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "impacts" JSONB NOT NULL DEFAULT '{}',
    "validation" JSONB NOT NULL DEFAULT '{}',
    "explanations" JSONB NOT NULL DEFAULT '[]',
    "selectedBy" TEXT,
    "selectedAt" TIMESTAMP(3),
    "convertedScenarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_alternatives_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "optimization_requests" ADD CONSTRAINT "optimization_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimization_requests" ADD CONSTRAINT "optimization_requests_baseScenarioId_fkey" FOREIGN KEY ("baseScenarioId") REFERENCES "project_scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_alternatives" ADD CONSTRAINT "design_alternatives_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "optimization_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_alternatives" ADD CONSTRAINT "design_alternatives_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "project_scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
