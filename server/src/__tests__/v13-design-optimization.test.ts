/**
 * HBD — HOME BOARD DESIGNER
 * SUITE DE PRUEBAS AUTOMATIZADAS — V13.0.0
 * INTELLIGENT DESIGN OPTIMIZATION ENGINE
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
  DesignOptimizationEngine,
  CandidateGenerationEngine,
  MockDesignOptimizationAIProvider,
  DesignBrief,
  DesignConstraint,
  DesignAlternativeDto,
  OptimizationRequestDto,
} from '@hbd/shared';

describe('🧪 HBD V13.0.0 — SUITE DE PRUEBAS DEL MOTOR DE OPTIMIZACIÓN MULTICRITERIO', () => {
  // ============================================================
  // 1. Identidad Centralizada y Versión 13.0.0
  // ============================================================
  describe('--- 1. Identidad Centralizada, Autoría y Versión 13.0.0 ---', () => {
    it('Autor oficial debe ser "Adrián Palma"', () => {
      assert.strictEqual(APP_METADATA.author, 'Adrián Palma');
    });

    it('Versión global debe ser válida', () => {
      assert.ok(Boolean(APP_METADATA.version));
    });

    it('Año de copyright debe ser 2026', () => {
      assert.strictEqual(APP_METADATA.copyrightYear, 2026);
    });

    it('Copyright oficial debe incluir a Adrián Palma', () => {
      assert.ok(APP_METADATA.copyright.includes('Adrián Palma'));
      assert.ok(APP_METADATA.copyright.includes('2026'));
    });

    it('supportedLanguages debe ser exactamente [es, en]', () => {
      assert.deepStrictEqual(Array.from(APP_METADATA.supportedLanguages), ['es', 'en']);
    });
  });

  // ============================================================
  // 2. Modelo de Brief, Objetivos y Restricciones
  // ============================================================
  describe('--- 2. Modelo de Brief, Objetivos y Restricciones ---', () => {
    it('Define un DesignBrief estructurado con objetivos y restricciones de severidad', () => {
      const brief: DesignBrief = {
        text: 'Reorganización espacial para integrar zona de trabajo y maximizar luz natural con presupuesto ajustado',
        minBedrooms: 2,
        minBathrooms: 1,
        preserveKitchen: true,
        preserveStructuralWalls: true,
        maxBudgetEur: 8000,
        minUsableAreaM2: 50,
        minPassageWidthM: 0.85,
        targetStyle: 'Contemporáneo',
        workZoneRequired: true,
        storageBoostRequired: true,
      };

      assert.strictEqual(brief.minBedrooms, 2);
      assert.strictEqual(brief.preserveKitchen, true);
      assert.strictEqual(brief.preserveStructuralWalls, true);
      assert.strictEqual(brief.maxBudgetEur, 8000);
      assert.strictEqual(brief.workZoneRequired, true);
    });
  });

  // ============================================================
  // 3. Motor de Generación de Candidatos (CandidateGenerationEngine)
  // ============================================================
  describe('--- 3. Motor de Generación de Candidatos de Diseño ---', () => {
    const mockFloorPlan = {
      rooms: [
        { id: 'r1', name: 'Salón', areaM2: 25 },
        { id: 'r2', name: 'Cocina', areaM2: 12 },
      ],
      walls: [
        { id: 'w1', startX: 0, startY: 0, endX: 5, endY: 0, thickness: 0.20, isStructural: true },
        { id: 'w2', startX: 5, startY: 0, endX: 5, endY: 5, thickness: 0.20, isStructural: true },
        { id: 'w3', startX: 5, startY: 5, endX: 0, endY: 5, thickness: 0.20, isStructural: true },
        { id: 'w4', startX: 0, startY: 5, endX: 0, endY: 0, thickness: 0.20, isStructural: true },
        { id: 'w-int', startX: 0, startY: 3, endX: 3, endY: 3, thickness: 0.10, isStructural: false },
      ],
      furniture: [
        { id: 'f1', name: 'Sofá 3 Plazas', widthM: 2.1, depthM: 0.9, heightM: 0.85, x: 1, y: 1, rotationDeg: 0 },
      ],
    };

    it('Genera candidatos deterministas cubriendo diferentes estrategias', () => {
      const candidates = CandidateGenerationEngine.generateCandidates(
        mockFloorPlan,
        ['MAXIMIZE_USABLE_AREA', 'MINIMIZE_CONSTRUCTION_COST', 'MAXIMIZE_FUNCTIONAL_ZONES'],
        3
      );

      assert.ok(candidates.length >= 2, 'Debe generar al menos 2 candidatos');
      const objectives = candidates.map((c) => c.targetedObjective);
      assert.ok(
        objectives.includes('MAXIMIZE_USABLE_AREA') ||
          objectives.includes('MAXIMIZE_FUNCTIONAL_ZONES') ||
          objectives.includes('MINIMIZE_CONSTRUCTION_COST')
      );
    });
  });

  // ============================================================
  // 4. Evaluación de Restricciones y Factibilidad
  // ============================================================
  describe('--- 4. Evaluación de Restricciones y Factibilidad (Hard vs Soft) ---', () => {
    it('Evalúa factibilidad: es factible solo si cumple todas las restricciones REQUIRED', async () => {
      const constraints: DesignConstraint[] = [
        {
          id: 'c-struct',
          type: 'REQUIRED',
          category: 'STRUCTURE',
          description: 'Preservar muros portantes y estructura',
        },
        {
          id: 'c-passage',
          type: 'PREFERRED',
          category: 'DIMENSIONS',
          description: 'Ancho de paso libre mínimo',
          targetValue: 0.85,
        },
      ];

      const baseFloorPlan = {
        rooms: [{ id: 'r1', name: 'Estar', areaM2: 20 }],
        walls: [
          { id: 'w-str', startX: 0, startY: 0, endX: 4, endY: 0, thickness: 0.25, isStructural: true },
          { id: 'w-part', startX: 2, startY: 0, endX: 2, endY: 3, thickness: 0.10, isStructural: false },
        ],
        furniture: [],
      };

      const result = await DesignOptimizationEngine.optimizeDesign(
        {
          projectId: 'proj-100',
          constraints,
          objectives: ['MAXIMIZE_USABLE_AREA', 'MINIMIZE_CONSTRUCTION_COST'],
          maxCandidates: 3,
        },
        baseFloorPlan
      );

      assert.ok(result.alternatives.length > 0);
      result.alternatives.forEach((alt) => {
        assert.ok(alt.constraintsStatus.length > 0);
        assert.ok(alt.status === 'VALID' || alt.status === 'WARNING');
        assert.ok(alt.metrics.usableAreaM2 > 0);
      });
    });
  });

  // ============================================================
  // 5. Principio Fundamental: Neutralidad Objetiva (Sin Ganador Automático)
  // ============================================================
  describe('--- 5. Principio Fundamental: Neutralidad Objetiva sin Ganador Forzado ---', () => {
    it('Las alternativas contienen trade-offs explicables sin declarar un ganador subjetivo', async () => {
      const baseFloorPlan = {
        rooms: [{ id: 'r1', name: 'Salón Comedor', areaM2: 30 }],
        walls: [{ id: 'w-int', startX: 0, startY: 3, endX: 4, endY: 3, thickness: 0.10, isStructural: false }],
        furniture: [],
      };

      const result = await DesignOptimizationEngine.optimizeDesign(
        {
          projectId: 'proj-101',
          objectives: ['MAXIMIZE_USABLE_AREA', 'MINIMIZE_CONSTRUCTION_COST'],
          maxCandidates: 3,
        },
        baseFloorPlan
      );

      assert.ok(result.objectiveNotice.includes('NOTA METODOLÓGICA'));
      assert.ok(result.objectiveNotice.includes('sin designar una opción ganadora automática'));
      result.alternatives.forEach((alt) => {
        assert.ok(Array.isArray(alt.explanations), 'Debe tener explicaciones estructuradas');
        assert.ok(alt.explanations.length > 0);
        assert.ok(alt.explanations[0].whatChanged);
        assert.ok(alt.explanations[0].whyChanged);
        assert.ok(alt.metrics);
        assert.ok(alt.impacts);
        assert.ok(alt.validation);
      });
    });
  });

  // ============================================================
  // 6. Provider de IA Desacoplado (MockDesignOptimizationAIProvider)
  // ============================================================
  describe('--- 6. Provider de IA Desacoplado ---', () => {
    it('El MockDesignOptimizationAIProvider responde con interpretación de brief y alternativas', async () => {
      const provider = new MockDesignOptimizationAIProvider();
      const brief: DesignBrief = {
        text: 'Quiero una cocina abierta integrada con salón y un rincón de teletrabajo luminoso.',
        minBedrooms: 2,
        preserveKitchen: true,
        maxBudgetEur: 12000,
      };

      const interpretation = await provider.interpretBrief(brief);
      assert.ok(interpretation.objectives.length > 0);
      assert.ok(interpretation.constraints.length > 0);

      const proposals = await provider.proposeOptimizedLayouts(
        { rooms: [{ id: 'r1', name: 'Dormitorio Principal', areaM2: 18 }] },
        brief
      );

      assert.ok(proposals.length > 0);
      assert.ok(proposals[0].name.length > 0);
      assert.ok(proposals[0].tradeOffNotes.length > 0);
      assert.ok(proposals[0].pros.length > 0);
      assert.ok(proposals[0].cons.length > 0);
    });
  });

  // ============================================================
  // 7. Conversión de Alternativa a Escenario de Proyecto (V12 Integration)
  // ============================================================
  describe('--- 7. Integración V13 → V12 (Conversión a Escenario) ---', () => {
    it('Convierte una alternativa de optimización en un ProjectScenario con snapshotData intacto', () => {
      const alternative: DesignAlternativeDto = {
        id: 'alt-test-1',
        requestId: 'opt-req-1',
        name: 'Distribución Abierta Diáfana',
        status: 'VALID',
        snapshotData: {
          rooms: [{ id: 'r1', name: 'Salón Unificado', areaM2: 35.0 }],
          walls: [],
          furniture: [],
        },
        metrics: {
          usableAreaM2: 35.0,
          estimatedCostEur: 1800,
          roomsCount: 1,
          openSpaceRatio: 0.85,
          modificationsCount: 2,
          complianceScore: 95,
        },
        impacts: {
          scenarioId: 'temp',
          geometricImpact: { addedAreaM2: 1.5, removedAreaM2: 0, netAreaDeltaM2: 1.5 },
          spatialImpact: { spacesCount: 1, zonesCount: 1 },
          furnitureImpact: { totalFurniture: 1, validPlacements: 1, clearanceWarnings: 0, collisions: 0 },
          constructionImpact: { totalTasks: 1, totalEstimatedCost: 1800, estimatedDurationDays: 4, criticalPathDays: 4 },
          economicImpact: { demolitionCost: 400, masonryCost: 0, finishCost: 1400, totalCost: 1800 },
          calculatedAt: new Date().toISOString(),
        },
        validation: {
          scenarioId: 'temp',
          status: 'COMPLIANT',
          complianceScore: 95,
          totalRulesEvaluated: 6,
          passedRulesCount: 6,
          warningRulesCount: 0,
          violatedRulesCount: 0,
          requiresProValidation: true,
          proValidationNotice: 'Aviso Técnico',
          evaluations: [],
          evaluatedAt: new Date().toISOString(),
        },
        explanations: [
          {
            whatChanged: 'Eliminación de tabique',
            whyChanged: 'Maximizar amplitud visual',
            objectiveTargeted: 'MAXIMIZE_USABLE_AREA',
            satisfiedConstraints: ['c-struct'],
            unsatisfiedConstraints: [],
            impactSummary: 'Mayor luminosidad y superficie',
          },
        ],
        constraintsStatus: [
          {
            constraintId: 'c-struct',
            description: 'Preservar muros portantes',
            type: 'REQUIRED',
            status: 'SATISFIED',
            notes: 'Muros estructurales intactos',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const scenario = DesignOptimizationEngine.convertAlternativeToScenario(
        alternative,
        'proj-101',
        'Escenario desde Optimización: Distribución Abierta'
      );

      assert.ok(scenario.id.startsWith('scenario-'));
      assert.strictEqual(scenario.projectId, 'proj-101');
      assert.strictEqual(scenario.name, 'Escenario desde Optimización: Distribución Abierta');
      assert.strictEqual(scenario.type, 'AI_OPTIMIZED');
      assert.strictEqual(scenario.status, 'DRAFT');
      assert.ok(scenario.snapshotData);
      assert.ok(scenario.actions && scenario.actions.length > 0);
    });
  });

  // ============================================================
  // 8. Auditoría de Simetría i18n (es / en)
  // ============================================================
  describe('--- 8. Auditoría de Simetría de Traducciones (es / en) ---', () => {
    it('client/src/i18n/locales/es.json y en.json contienen sección optimization simétrica', () => {
      const esPath = resolve(__dirname, '../../../client/src/i18n/locales/es.json');
      const enPath = resolve(__dirname, '../../../client/src/i18n/locales/en.json');

      assert.ok(existsSync(esPath), 'es.json debe existir');
      assert.ok(existsSync(enPath), 'en.json debe existir');

      const esData = JSON.parse(readFileSync(esPath, 'utf-8'));
      const enData = JSON.parse(readFileSync(enPath, 'utf-8'));

      assert.ok(esData.optimization, 'es.json debe tener clave "optimization"');
      assert.ok(enData.optimization, 'en.json debe tener clave "optimization"');

      const esKeys = Object.keys(esData.optimization).sort();
      const enKeys = Object.keys(enData.optimization).sort();

      assert.deepStrictEqual(
        esKeys,
        enKeys,
        'Las claves de optimization en es.json y en.json deben coincidir exactamente'
      );
    });
  });

  // ============================================================
  // 9. Auditoría de NO Badges de Versión en Módulos o Sidebar
  // ============================================================
  describe('--- 9. Auditoría de Centralización de Versión en "Acerca de" ---', () => {
    it('Sidebar y Modales NO contienen badges de versión V13 ni versiones históricas', () => {
      const sidebarPath = resolve(__dirname, '../../../client/src/components/layout/Sidebar.tsx');
      const sidebarContent = readFileSync(sidebarPath, 'utf-8');

      assert.ok(!sidebarContent.includes("badge: 'V13'"), 'Sidebar NO muestra badge V13');
      assert.ok(!sidebarContent.includes("badge: 'V12'"), 'Sidebar NO muestra badge V12');
      assert.ok(!sidebarContent.includes("badge: 'V11'"), 'Sidebar NO muestra badge V11');
      assert.ok(!sidebarContent.includes("badge: 'V10'"), 'Sidebar NO muestra badge V10');
    });
  });
});
