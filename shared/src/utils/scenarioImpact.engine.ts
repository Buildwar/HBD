/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * MOTOR DE CÁLCULO DE IMPACTO DE ESCENARIOS
 * SCENARIO IMPACT ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ScenarioImpactDto,
  ScenarioSnapshotData,
  ProjectScenarioDto,
} from '../types/scenario.types.js';
import { ScenarioValidationEngine } from './scenarioValidation.engine.js';
import { ConstructionIntelligenceEngine } from './constructionIntelligence.engine.js';

export class ScenarioImpactEngine {
  /**
   * Calcula el impacto integral de un escenario frente a un estado base
   */
  public static calculateScenarioImpact(
    scenario: ProjectScenarioDto,
    baseScenario?: ProjectScenarioDto | null
  ): ScenarioImpactDto {
    const baseSnap: ScenarioSnapshotData = baseScenario?.snapshotData || {
      walls: [],
      doors: [],
      windows: [],
      rooms: [],
      spaces: [],
      zones: [],
      furniture: [],
      constructionItems: [],
    };

    const targetSnap: ScenarioSnapshotData = scenario.snapshotData || {
      walls: [],
      doors: [],
      windows: [],
      rooms: [],
      spaces: [],
      zones: [],
      furniture: [],
      constructionItems: [],
    };

    // 1. Impacto Geométrico
    const baseUsefulArea = (baseSnap.rooms || []).reduce((acc, r) => acc + (r.areaM2 || 0), 0);
    const targetUsefulArea = (targetSnap.rooms || []).reduce((acc, r) => acc + (r.areaM2 || 0), 0);
    const usefulAreaDeltaM2 = Number((targetUsefulArea - baseUsefulArea).toFixed(2));

    const basePerimeter = (baseSnap.rooms || []).reduce((acc, r) => acc + (r.perimeterM || 0), 0);
    const targetPerimeter = (targetSnap.rooms || []).reduce((acc, r) => acc + (r.perimeterM || 0), 0);
    const perimeterDeltaM = Number((targetPerimeter - basePerimeter).toFixed(2));

    const baseWallsCount = baseSnap.walls?.length || 0;
    const targetWallsCount = targetSnap.walls?.length || 0;
    const wallsAdded = Math.max(0, targetWallsCount - baseWallsCount);
    const wallsRemoved = Math.max(0, baseWallsCount - targetWallsCount);

    const baseOpenings = (baseSnap.doors?.length || 0) + (baseSnap.windows?.length || 0);
    const targetOpenings = (targetSnap.doors?.length || 0) + (targetSnap.windows?.length || 0);
    const openingsDelta = targetOpenings - baseOpenings;

    // 2. Impacto Espacial
    const roomsCountDelta = (targetSnap.rooms?.length || 0) - (baseSnap.rooms?.length || 0);
    const spacesCountDelta = (targetSnap.spaces?.length || 0) - (baseSnap.spaces?.length || 0);
    const zonesCountDelta = (targetSnap.zones?.length || 0) - (baseSnap.zones?.length || 0);
    const affectedSpaces = (targetSnap.spaces || []).map((s) => s.name);

    // 3. Impacto de Mobiliario
    const baseFurnCount = baseSnap.furniture?.length || 0;
    const targetFurnCount = targetSnap.furniture?.length || 0;
    const addedCount = Math.max(0, targetFurnCount - baseFurnCount);
    const removedCount = Math.max(0, baseFurnCount - targetFurnCount);

    // 4. Impacto Constructivo (V11 Integration)
    const constructionItems = targetSnap.constructionItems || [];
    const demolitionCount = constructionItems.filter((c) => c.category === 'DEMOLITION').length;
    const newBuildCount = constructionItems.filter((c) => c.category === 'FLOORING' || c.category === 'WALL_FINISH' || c.category === 'DOORS' || c.category === 'WINDOWS').length;
    const hasStructuralPro = (targetSnap.walls || []).some((w) => w.isStructural) || demolitionCount > 0;

    const technicalWarnings: string[] = [];
    if (demolitionCount > 0) {
      technicalWarnings.push('Demoliciones detectadas: requiere supervisión de acometidas y elementos portantes.');
    }
    if (hasStructuralPro) {
      technicalWarnings.push('Modificaciones estructurales potenciales: validación técnica profesional requerida.');
    }

    // 5. Impacto Económico (V11 Costing Integration)
    const baseItems = baseSnap.constructionItems || [];
    const baseCostSummary = this.computeItemsCost(baseItems);
    const targetCostSummary = this.computeItemsCost(constructionItems);

    const costDeltaEur = Number((targetCostSummary.total - baseCostSummary.total).toFixed(2));

    // 6. Impacto de Validación
    const validation = ScenarioValidationEngine.validateScenario(scenario.id, targetSnap);
    const criticalIssues = validation.issues.filter((i) => i.severity === 'CRITICAL').length;
    const warningIssues = validation.issues.filter((i) => i.severity === 'WARNING').length;

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      geometricImpact: {
        usefulAreaDeltaM2,
        grossAreaDeltaM2: usefulAreaDeltaM2 * 1.15,
        perimeterDeltaM,
        wallsAdded,
        wallsRemoved,
        openingsDelta,
        openSpaceRatioDelta: Number(((targetSnap.spaces?.length || 1) / Math.max(1, targetSnap.rooms?.length || 1)).toFixed(2)),
      },
      spatialImpact: {
        roomsCountDelta,
        spacesCountDelta,
        zonesCountDelta,
        affectedSpaces,
      },
      furnitureImpact: {
        addedCount,
        removedCount,
        movedCount: 0,
        potentialCollisions: 0,
        clearanceIssues: 0,
      },
      constructionImpact: {
        demolitionCount,
        newBuildCount,
        affectedPhases: ['Demoliciones', 'Albañilería', 'Acabados'],
        requiresStructuralPro: hasStructuralPro,
        technicalWarnings,
      },
      economicImpact: {
        currentCostEur: baseCostSummary.total,
        scenarioCostEur: targetCostSummary.total,
        costDeltaEur,
        materialCostEur: targetCostSummary.material,
        laborCostEur: targetCostSummary.labor,
        wasteCostEur: targetCostSummary.waste,
        isEstimated: true,
      },
      validationImpact: {
        status: validation.status,
        requiresProfessionalValidation: validation.requiresProfessionalValidation,
        issuesCount: validation.issues.length,
        criticalIssues,
        warningIssues,
      },
    };
  }

  private static computeItemsCost(items: any[]): { total: number; material: number; labor: number; waste: number } {
    let material = 0;
    let labor = 0;
    let waste = 0;

    for (const item of items) {
      const quantity = item.quantity || 1;
      const matPrice = item.unitPriceMaterial || 0;
      const laborPrice = item.unitPriceLabor || 0;
      const wastePct = (item.wastePercent || 5) / 100;

      const itemMat = quantity * (1 + wastePct) * matPrice;
      const itemLabor = quantity * laborPrice;
      const itemWaste = quantity * wastePct * matPrice;

      material += itemMat;
      labor += itemLabor;
      waste += itemWaste;
    }

    const total = material + labor;
    return {
      total: Number(total.toFixed(2)),
      material: Number(material.toFixed(2)),
      labor: Number(labor.toFixed(2)),
      waste: Number(waste.toFixed(2)),
    };
  }
}
