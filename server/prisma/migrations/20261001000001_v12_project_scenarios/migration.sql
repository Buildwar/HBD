-- HBD V12.0.0 Migration: Intelligent Project Planning & Scenario Engine
-- CreateEnum
CREATE TYPE "ScenarioType" AS ENUM ('CURRENT', 'MANUAL', 'AI_GENERATED', 'DESIGN_VARIANT', 'RENOVATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ScenarioStatus" AS ENUM ('DRAFT', 'ANALYZING', 'VALID', 'WARNING', 'INVALID', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScenarioActionType" AS ENUM ('CREATE_SPACE', 'DELETE_SPACE', 'MODIFY_SPACE', 'CREATE_ZONE', 'DELETE_ZONE', 'MODIFY_ZONE', 'MOVE_WALL', 'CREATE_WALL', 'DELETE_WALL', 'MODIFY_WALL', 'MOVE_DOOR', 'CREATE_DOOR', 'DELETE_DOOR', 'MODIFY_DOOR', 'MOVE_WINDOW', 'CREATE_WINDOW', 'DELETE_WINDOW', 'MODIFY_WINDOW', 'ADD_FURNITURE', 'REMOVE_FURNITURE', 'MOVE_FURNITURE', 'MODIFY_FURNITURE', 'CHANGE_MATERIAL', 'CHANGE_FINISH', 'CHANGE_LIGHTING', 'ADD_CONSTRUCTION_ITEM', 'REMOVE_CONSTRUCTION_ITEM', 'MODIFY_CONSTRUCTION_ITEM');

-- CreateTable
CREATE TABLE "project_scenarios" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ScenarioType" NOT NULL DEFAULT 'MANUAL',
    "status" "ScenarioStatus" NOT NULL DEFAULT 'DRAFT',
    "baseScenarioId" TEXT,
    "snapshotData" JSONB DEFAULT '{}',
    "metrics" JSONB DEFAULT '{}',
    "budgetSummary" JSONB DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_actions" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "actionType" "ScenarioActionType" NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "previousState" JSONB,
    "isReverted" BOOLEAN NOT NULL DEFAULT false,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenario_actions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_scenarios" ADD CONSTRAINT "project_scenarios_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_scenarios" ADD CONSTRAINT "project_scenarios_baseScenarioId_fkey" FOREIGN KEY ("baseScenarioId") REFERENCES "project_scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_actions" ADD CONSTRAINT "scenario_actions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "project_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
