/**
 * HBD — HOME BOARD DESIGNER
 * SUITE DE PRUEBAS AUTOMATIZADAS — V12.0.0
 * MOTOR DE PLANIFICACIÓN Y ESCENARIOS DE PROYECTO
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  APP_METADATA,
  ScenarioEngine,
  ScenarioValidationEngine,
  ScenarioImpactEngine,
  ScenarioComparisonEngine,
  ProjectScenarioDto,
  ScenarioSnapshotData,
} from '@hbd/shared';

describe('🧪 HBD V12.0.0 — SUITE DE PRUEBAS DE ESCENARIOS Y PLANIFICACIÓN', () => {
  // ============================================================
  // 1. Identidad Centralizada y Versión 12.0.0
  // ============================================================
  describe('--- 1. Identidad Centralizada, Autoría y Versión ---', () => {
    it('Autor oficial debe ser "Adrián Palma"', () => {
      assert.strictEqual(APP_METADATA.author, 'Adrián Palma');
    });

    it('Versión global debe ser válida', () => {
      assert.ok(Boolean(APP_METADATA.version));
    });

    it('Año de copyright debe ser 2026', () => {
      assert.strictEqual(APP_METADATA.copyrightYear, 2026);
    });

    it('supportedLanguages debe ser exactamente [es, en]', () => {
      assert.deepStrictEqual(Array.from(APP_METADATA.supportedLanguages), ['es', 'en']);
    });
  });

  // ============================================================
  // 2. Creación y Duplicación de Escenarios
  // ============================================================
  describe('--- 2. Creación y Duplicación de Escenarios ---', () => {
    it('Crea un escenario inicial con snapshot base vacío o personalizado', () => {
      const scenario = ScenarioEngine.createScenario({
        projectId: 'proj-123',
        name: 'Estado Actual',
        type: 'CURRENT',
      });

      assert.ok(scenario.id.startsWith('scenario-'));
      assert.strictEqual(scenario.name, 'Estado Actual');
      assert.strictEqual(scenario.type, 'CURRENT');
      assert.strictEqual(scenario.status, 'DRAFT');
      assert.ok(scenario.snapshotData);
      assert.strictEqual(scenario.actions?.length, 0);
    });

    it('Duplica un escenario conservando snapshot y vinculando baseScenarioId', () => {
      const baseScenario = ScenarioEngine.createScenario(
        {
          projectId: 'proj-123',
          name: 'Propuesta A',
          type: 'MANUAL',
        },
        {
          rooms: [{ id: 'room-1', name: 'Salón', areaM2: 28.0 }],
          walls: [{ id: 'w-1', startX: 0, startY: 0, endX: 5, endY: 0, thickness: 0.15 }],
        }
      );

      const duplicated = ScenarioEngine.duplicateScenario(baseScenario, 'Propuesta A (Variante B)');

      assert.notStrictEqual(duplicated.id, baseScenario.id);
      assert.strictEqual(duplicated.name, 'Propuesta A (Variante B)');
      assert.strictEqual(duplicated.baseScenarioId, baseScenario.id);
      assert.strictEqual(duplicated.snapshotData?.rooms?.length, 1);
      assert.strictEqual(duplicated.snapshotData?.rooms?.[0].areaM2, 28.0);
    });
  });

  // ============================================================
  // 3. Acciones Estructuradas y Reversibilidad
  // ============================================================
  describe('--- 3. Acciones Estructuradas y Reversibilidad ---', () => {
    it('Aplica una acción estructurada modificando el snapshot y guardando historial', () => {
      const scenario = ScenarioEngine.createScenario({
        projectId: 'proj-123',
        name: 'Reforma Cocina',
      });

      const { scenario: updatedScenario, action } = ScenarioEngine.applyAction(
        scenario,
        'CREATE_WALL',
        { id: 'w-new-1', startX: 0, startY: 0, endX: 4, endY: 0, thickness: 0.10 }
      );

      assert.strictEqual(updatedScenario.actions?.length, 1);
      assert.strictEqual(action.actionType, 'CREATE_WALL');
      assert.strictEqual(updatedScenario.snapshotData?.walls?.length, 1);
      assert.strictEqual(updatedScenario.snapshotData?.walls?.[0].id, 'w-new-1');
    });

    it('Revierte una acción restaurando el estado previo del snapshot', () => {
      const initialSnap: ScenarioSnapshotData = {
        walls: [{ id: 'w-1', startX: 0, startY: 0, endX: 5, endY: 0, thickness: 0.15 }],
      };

      const scenario = ScenarioEngine.createScenario(
        { projectId: 'proj-123', name: 'Reforma' },
        initialSnap
      );

      // Eliminar pared w-1
      const { scenario: afterDelete, action: deleteAction } = ScenarioEngine.applyAction(
        scenario,
        'DELETE_WALL',
        { id: 'w-1' }
      );

      assert.strictEqual(afterDelete.snapshotData?.walls?.length, 0);

      // Revertir eliminación
      const revertedScenario = ScenarioEngine.revertAction(afterDelete, deleteAction.id);
      assert.strictEqual(revertedScenario.snapshotData?.walls?.length, 1);
      assert.strictEqual(revertedScenario.snapshotData?.walls?.[0].id, 'w-1');
    });
  });

  // ============================================================
  // 4. Validación Técnica y Avisos Profesionales
  // ============================================================
  describe('--- 4. Validación Técnica y Avisos Profesionales ---', () => {
    it('Detecta muro estructural y marca REQUIRES_PRO_VALIDATION', () => {
      const snapshot: ScenarioSnapshotData = {
        walls: [
          { id: 'w-struct', startX: 0, startY: 0, endX: 6, endY: 0, thickness: 0.30, isStructural: true },
        ],
      };

      const validation = ScenarioValidationEngine.validateScenario('scenario-1', snapshot);

      assert.strictEqual(validation.requiresProfessionalValidation, true);
      assert.strictEqual(validation.status, 'REQUIRES_PRO_VALIDATION');
      assert.ok(validation.issues.some((i) => i.category === 'STRUCTURE'));
    });

    it('Detecta puerta con paso estrecho (< 0.70m) y emite advertencia de accesibilidad', () => {
      const snapshot: ScenarioSnapshotData = {
        doors: [{ id: 'd-narrow', widthM: 0.60, position: { x: 1, y: 1 } }],
      };

      const validation = ScenarioValidationEngine.validateScenario('scenario-2', snapshot);
      assert.ok(validation.issues.some((i) => i.category === 'CIRCULATION'));
    });

    it('Detecta habitación con superficie inferior a 5m² y emite aviso normativo V10', () => {
      const snapshot: ScenarioSnapshotData = {
        rooms: [{ id: 'r-small', name: 'Trastero Habitable', areaM2: 3.5 }],
      };

      const validation = ScenarioValidationEngine.validateScenario('scenario-3', snapshot);
      assert.ok(validation.issues.some((i) => i.category === 'SPATIAL'));
      assert.strictEqual(validation.requiresProfessionalValidation, true);
    });
  });

  // ============================================================
  // 5. Cómputo de Impacto e Integración V10 / V11
  // ============================================================
  describe('--- 5. Cómputo de Impacto e Integración V10 / V11 ---', () => {
    it('Calcula deltas de superficie útil y costes de obra con mermas', () => {
      const baseScenario = ScenarioEngine.createScenario(
        { projectId: 'proj-1', name: 'Actual' },
        {
          rooms: [{ id: 'r1', name: 'Salón', areaM2: 20.0 }],
          constructionItems: [],
        }
      );

      const targetScenario = ScenarioEngine.createScenario(
        { projectId: 'proj-1', name: 'Propuesto' },
        {
          rooms: [{ id: 'r1', name: 'Salón Ampliado', areaM2: 32.0 }],
          constructionItems: [
            {
              id: 'ci-1',
              category: 'FLOORING',
              operation: 'CONSTRUCTION',
              name: 'Tarima Flotante',
              description: 'Tarima AC5',
              quantity: 32,
              unit: 'm²',
              unitPriceMaterial: 25,
              unitPriceLabor: 15,
              wastePercent: 10,
              totalCost: 1280,
              confidence: 'GEOMETRY_CALCULATED',
              requiresProValidation: false,
            },
          ],
        }
      );

      const impact = ScenarioImpactEngine.calculateScenarioImpact(targetScenario, baseScenario);

      assert.strictEqual(impact.geometricImpact.usefulAreaDeltaM2, 12.0);
      assert.ok(impact.economicImpact.scenarioCostEur > 0);
      assert.strictEqual(impact.economicImpact.costDeltaEur, impact.economicImpact.scenarioCostEur);
      assert.ok(impact.economicImpact.wasteCostEur > 0);
    });
  });

  // ============================================================
  // 6. Matriz Comparativa Objetiva (2 a 4 Escenarios)
  // ============================================================
  describe('--- 6. Matriz Comparativa Objetiva (2 a 4 Escenarios) ---', () => {
    it('Compara múltiples escenarios objetivamente sin juicios de valor o ganadores', () => {
      const sc1 = ScenarioEngine.createScenario(
        { projectId: 'proj-1', name: 'Base', type: 'CURRENT' },
        { rooms: [{ id: 'r1', name: 'Habitación', areaM2: 15.0 }] }
      );

      const sc2 = ScenarioEngine.createScenario(
        { projectId: 'proj-1', name: 'Opción 1 - Abierta', type: 'MANUAL' },
        { rooms: [{ id: 'r1', name: 'Espacio Abierto', areaM2: 22.0 }] }
      );

      const comparison = ScenarioComparisonEngine.compareScenarios([sc1, sc2], sc1.id);

      assert.strictEqual(comparison.scenarios.length, 2);
      assert.strictEqual(comparison.baseScenario.id, sc1.id);
      assert.ok(comparison.comparisonMatrix.geometry.length >= 2);
      assert.ok(comparison.comparisonMatrix.economy.length >= 2);
      assert.ok(comparison.professionalNotice.includes('NOTA TÉCNICA'));

      // Verificar que NO existan campos de ganador o mejor escenario
      assert.strictEqual((comparison as any).winner, undefined);
      assert.strictEqual((comparison as any).bestScenario, undefined);
    });
  });

  // ============================================================
  // 7. Simetría de Internacionalización (es.json vs en.json)
  // ============================================================
  describe('--- 7. Simetría de Internacionalización (es.json vs en.json) ---', () => {
    it('Sección "scenarios" existe en ES y EN con idéntica estructura de claves', () => {
      const esPath = resolve(__dirname, '../../../client/src/i18n/locales/es.json');
      const enPath = resolve(__dirname, '../../../client/src/i18n/locales/en.json');

      assert.ok(existsSync(esPath), 'es.json debe existir');
      assert.ok(existsSync(enPath), 'en.json debe existir');

      const es = JSON.parse(readFileSync(esPath, 'utf8'));
      const en = JSON.parse(readFileSync(enPath, 'utf8'));

      assert.ok(es.scenarios, 'es.json debe tener clave "scenarios"');
      assert.ok(en.scenarios, 'en.json debe tener clave "scenarios"');

      const esKeys = Object.keys(es.scenarios).sort();
      const enKeys = Object.keys(en.scenarios).sort();

      assert.deepStrictEqual(esKeys, enKeys, 'Las claves de scenarios deben ser 100% simétricas');
    });
  });
});
