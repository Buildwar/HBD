/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * MOTOR DE VALIDACIÓN TÉCNICA DE ESCENARIOS
 * SCENARIO VALIDATION ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ScenarioValidationDto,
  ScenarioIssueDto,
  ScenarioSnapshotData,
} from '../types/scenario.types.js';
import { SpatialRulesEngine } from './spatialRules.engine.js';
import { GeometricMetricsEngine } from './geometricMetrics.engine.js';

export class ScenarioValidationEngine {
  /**
   * Valida integralmente un escenario arquitectónico
   */
  public static validateScenario(
    scenarioId: string,
    snapshot?: ScenarioSnapshotData | null
  ): ScenarioValidationDto {
    const issues: ScenarioIssueDto[] = [];
    const timestamp = new Date().toISOString();

    if (!snapshot) {
      return {
        scenarioId,
        status: 'UNKNOWN',
        requiresProfessionalValidation: true,
        issues: [
          {
            id: `iss-empty-${Date.now()}`,
            category: 'SPATIAL',
            severity: 'INFO',
            explanation: 'El escenario no contiene datos de snapshot registrados todavía.',
            origin: 'ScenarioValidationEngine',
            recommendedAction: 'Añade paredes, estancias o mobiliario para habilitar la validación completa.',
            requiresProfessionalValidation: false,
          },
        ],
        complianceScore: 100,
        timestamp,
        notes: 'Validación en estado preliminar sin datos.',
      };
    }

    let hasStructuralIntervention = false;

    // 1. Validación de Elementos Estructurales
    const walls = snapshot.walls || [];
    for (const wall of walls) {
      if (wall.isStructural) {
        hasStructuralIntervention = true;
        issues.push({
          id: `iss-struct-${wall.id}`,
          category: 'STRUCTURE',
          severity: 'WARNING',
          targetElement: `Muro Estructural (${wall.id})`,
          explanation: 'Se ha detectado un muro de carga o elemento estructural en la distribución.',
          origin: 'Estructura Portante',
          recommendedAction: 'Cualquier modificación sobre este elemento requiere proyecto técnico de arquitecto o aparejador colegiado.',
          requiresProfessionalValidation: true,
        });
      }
    }

    // 2. Validación de Huecos y Pasos (Circulación)
    const doors = snapshot.doors || [];
    for (const door of doors) {
      if (door.widthM < 0.70) {
        issues.push({
          id: `iss-door-narrow-${door.id}`,
          category: 'CIRCULATION',
          severity: 'WARNING',
          targetElement: `Paso de Puerta (${door.id})`,
          explanation: `El ancho de paso (${door.widthM}m) es inferior a las recomendaciones de accesibilidad (≥ 0.80m).`,
          origin: 'Accesibilidad y Circulación',
          recommendedAction: 'Ampliar la anchura de paso a mínimo 0.80m para estancias principales.',
          requiresProfessionalValidation: false,
        });
      }
    }

    // 3. Validación de Reglas Espaciales (V10)
    const rooms = snapshot.rooms || [];
    for (const room of rooms) {
      if (room.areaM2 < 5.0) {
        issues.push({
          id: `iss-room-area-${room.id}`,
          category: 'SPATIAL',
          severity: 'WARNING',
          targetElement: `Estancia ${room.name || room.id}`,
          explanation: `La superficie útil (${room.areaM2} m²) es inferior a la superficie mínima habitual para habitabilidad.`,
          origin: 'V10 Spatial Rules Engine',
          recommendedAction: 'Revisar superficies mínimas según la normativa local aplicable.',
          requiresProfessionalValidation: true,
        });
      }

      if (room.heightM && room.heightM < 2.40) {
        issues.push({
          id: `iss-room-height-${room.id}`,
          category: 'GEOMETRY',
          severity: 'WARNING',
          targetElement: `Estancia ${room.name || room.id}`,
          explanation: `La altura libre (${room.heightM}m) está por debajo de la altura mínima estándar de 2.50m.`,
          origin: 'V10 Spatial Rules Engine',
          recommendedAction: 'Verificar la altura libre permitida en la normativa municipal.',
          requiresProfessionalValidation: true,
        });
      }
    }

    // 4. Validación de Partidas de Obra (V11)
    const constructionItems = snapshot.constructionItems || [];
    for (const item of constructionItems) {
      if (item.category === 'DEMOLITION') {
        hasStructuralIntervention = true;
        issues.push({
          id: `iss-demo-${item.id}`,
          category: 'CONSTRUCTION',
          severity: 'INFO',
          targetElement: item.description || undefined,
          explanation: 'La partida de demolición requiere comprobación de afección a instalaciones y bajantes.',
          origin: 'V11 Construction Intelligence',
          recommendedAction: 'Verificar trazado de fontanería, electricidad y bajantes comunitarias.',
          requiresProfessionalValidation: true,
        });
      }
    }

    // Puntuación de cumplimiento
    const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
    const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
    const proValidationRequired = hasStructuralIntervention || issues.some((i) => i.requiresProfessionalValidation);

    let score = 100 - criticalCount * 30 - warningCount * 10;
    if (score < 0) score = 0;

    let status: ScenarioValidationDto['status'] = 'VALID';
    if (criticalCount > 0) {
      status = 'INVALID';
    } else if (warningCount > 0) {
      status = proValidationRequired ? 'REQUIRES_PRO_VALIDATION' : 'WARNING';
    } else if (proValidationRequired) {
      status = 'REQUIRES_PRO_VALIDATION';
    }

    return {
      scenarioId,
      status,
      requiresProfessionalValidation: proValidationRequired,
      issues,
      complianceScore: score,
      timestamp,
      notes: proValidationRequired
        ? 'AVISO TÉCNICO: Este escenario contiene modificaciones técnicas que exigen validación por parte de un profesional competente antes de la ejecución de la obra.'
        : 'Escenario evaluado sin incidencias críticas detectadas.',
    };
  }
}
