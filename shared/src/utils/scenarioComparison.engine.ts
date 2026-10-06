/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * MOTOR DE COMPARACIÓN OBJETIVA DE ESCENARIOS
 * SCENARIO COMPARISON ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProjectScenarioDto,
  ScenarioComparisonDto,
} from '../types/scenario.types.js';
import { ScenarioImpactEngine } from './scenarioImpact.engine.js';
import { ScenarioValidationEngine } from './scenarioValidation.engine.js';

export class ScenarioComparisonEngine {
  /**
   * Compara objetivamente de 2 a 4 escenarios sin juicios de valor ni ganadores automáticos
   */
  public static compareScenarios(
    scenarios: ProjectScenarioDto[],
    baseScenarioId?: string
  ): ScenarioComparisonDto {
    if (!scenarios || scenarios.length === 0) {
      throw new Error('Se requiere al menos un escenario para realizar la comparación.');
    }

    // Identificar escenario base (por ID, tipo 'CURRENT', o el primero)
    const base =
      (baseScenarioId && scenarios.find((s) => s.id === baseScenarioId)) ||
      scenarios.find((s) => s.type === 'CURRENT') ||
      scenarios[0];

    const processedScenarios = scenarios.map((scenario) => {
      const impact = ScenarioImpactEngine.calculateScenarioImpact(scenario, base);
      const validation = ScenarioValidationEngine.validateScenario(scenario.id, scenario.snapshotData);

      const totalCost = impact.economicImpact.scenarioCostEur;

      return {
        id: scenario.id,
        name: scenario.name,
        type: scenario.type,
        metrics: scenario.metrics || {},
        cost: totalCost,
        impact,
        validation,
      };
    });

    // Construcción de la Matriz Comparativa Objetiva
    const geometryRows: Array<{ metric: string; values: Record<string, number | string> }> = [
      {
        metric: 'Superficie Útil (m²)',
        values: this.extractMetricValues(processedScenarios, (s) => {
          const rooms = s.impact ? (scenarios.find((sc) => sc.id === s.id)?.snapshotData?.rooms || []) : [];
          return Number(rooms.reduce((acc, r) => acc + (r.areaM2 || 0), 0).toFixed(1));
        }),
      },
      {
        metric: 'Delta Superficie Útil (m²)',
        values: this.extractMetricValues(processedScenarios, (s) => s.impact.geometricImpact.usefulAreaDeltaM2),
      },
      {
        metric: 'Número de Paredes',
        values: this.extractMetricValues(processedScenarios, (s) => {
          return scenarios.find((sc) => sc.id === s.id)?.snapshotData?.walls?.length || 0;
        }),
      },
      {
        metric: 'Huecos (Puertas / Ventanas)',
        values: this.extractMetricValues(processedScenarios, (s) => {
          const snap = scenarios.find((sc) => sc.id === s.id)?.snapshotData;
          return (snap?.doors?.length || 0) + (snap?.windows?.length || 0);
        }),
      },
    ];

    const spacesRows: Array<{ metric: string; values: Record<string, number | string> }> = [
      {
        metric: 'Estancias (Rooms)',
        values: this.extractMetricValues(processedScenarios, (s) => {
          return scenarios.find((sc) => sc.id === s.id)?.snapshotData?.rooms?.length || 0;
        }),
      },
      {
        metric: 'Espacios Funcionales (Spaces)',
        values: this.extractMetricValues(processedScenarios, (s) => {
          return scenarios.find((sc) => sc.id === s.id)?.snapshotData?.spaces?.length || 0;
        }),
      },
      {
        metric: 'Zonas Funcionales',
        values: this.extractMetricValues(processedScenarios, (s) => {
          return scenarios.find((sc) => sc.id === s.id)?.snapshotData?.zones?.length || 0;
        }),
      },
    ];

    const furnitureRows: Array<{ metric: string; values: Record<string, number | string> }> = [
      {
        metric: 'Elementos de Mobiliario',
        values: this.extractMetricValues(processedScenarios, (s) => {
          return scenarios.find((sc) => sc.id === s.id)?.snapshotData?.furniture?.length || 0;
        }),
      },
      {
        metric: 'Muebles Añadidos',
        values: this.extractMetricValues(processedScenarios, (s) => s.impact.furnitureImpact.addedCount),
      },
    ];

    const constructionRows: Array<{ metric: string; values: Record<string, number | string> }> = [
      {
        metric: 'Partidas de Demolición',
        values: this.extractMetricValues(processedScenarios, (s) => s.impact.constructionImpact.demolitionCount),
      },
      {
        metric: 'Partidas de Nueva Construcción',
        values: this.extractMetricValues(processedScenarios, (s) => s.impact.constructionImpact.newBuildCount),
      },
      {
        metric: 'Intervención Estructural',
        values: this.extractMetricValues(processedScenarios, (s) =>
          s.impact.constructionImpact.requiresStructuralPro ? 'SÍ (Requiere Técnico)' : 'NO'
        ),
      },
    ];

    const economyRows: Array<{ metric: string; values: Record<string, number | string> }> = [
      {
        metric: 'Coste Estimado Total (€)',
        values: this.extractMetricValues(processedScenarios, (s) => `${s.impact.economicImpact.scenarioCostEur} €`),
      },
      {
        metric: 'Materiales (€)',
        values: this.extractMetricValues(processedScenarios, (s) => `${s.impact.economicImpact.materialCostEur} €`),
      },
      {
        metric: 'Mano de Obra (€)',
        values: this.extractMetricValues(processedScenarios, (s) => `${s.impact.economicImpact.laborCostEur} €`),
      },
      {
        metric: 'Mermas y Desperdicios (€)',
        values: this.extractMetricValues(processedScenarios, (s) => `${s.impact.economicImpact.wasteCostEur} €`),
      },
    ];

    const validationRows: Array<{ metric: string; values: Record<string, string> }> = [
      {
        metric: 'Estado de Validación',
        values: this.extractMetricValues(processedScenarios, (s) => s.validation.status),
      },
      {
        metric: 'Puntuación de Cumplimiento',
        values: this.extractMetricValues(processedScenarios, (s) => `${s.validation.complianceScore}/100`),
      },
      {
        metric: 'Validación Profesional Requerida',
        values: this.extractMetricValues(processedScenarios, (s) =>
          s.validation.requiresProfessionalValidation ? 'SÍ' : 'NO'
        ),
      },
    ];

    return {
      baseScenario: {
        id: base.id,
        name: base.name,
        type: base.type,
        metrics: base.metrics || {},
        cost: processedScenarios.find((s) => s.id === base.id)?.cost || 0,
      },
      scenarios: processedScenarios,
      comparisonMatrix: {
        geometry: geometryRows,
        spaces: spacesRows,
        furniture: furnitureRows,
        construction: constructionRows,
        economy: economyRows,
        validation: validationRows,
      },
      professionalNotice:
        'NOTA TÉCNICA: Esta comparativa de escenarios ofrece estimaciones técnicas y dimensionales de carácter referencial. Toda intervención estructural o constructiva debe ser visada por técnicos titulados competentes.',
    };
  }

  private static extractMetricValues<T>(
    scenarios: Array<{ id: string; [key: string]: any }>,
    extractor: (s: any) => T
  ): Record<string, T> {
    const values: Record<string, T> = {};
    for (const s of scenarios) {
      values[s.id] = extractor(s);
    }
    return values;
  }
}
