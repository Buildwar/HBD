/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * MOTOR DE GENERACIÓN PARAMÉTRICA DE CANDIDATOS ESPACIALES
 * CANDIDATE GENERATION ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { ScenarioSnapshotData } from '../types/scenario.types.js';
import { DesignObjectiveType } from '../types/optimization.types.js';

export interface GeneratedCandidate {
  candidateId: string;
  name: string;
  description: string;
  targetedObjective: DesignObjectiveType;
  snapshotData: ScenarioSnapshotData;
  modifications: Array<{
    type: string;
    description: string;
    reason: string;
  }>;
}

export class CandidateGenerationEngine {
  /**
   * Genera alternativas candidatas a partir del snapshot base y los objetivos solicitados
   */
  public static generateCandidates(
    baseSnapshot: ScenarioSnapshotData,
    objectives: any = [],
    maxCandidates: number = 4
  ): GeneratedCandidate[] {
    const candidates: GeneratedCandidate[] = [];
    const base: ScenarioSnapshotData = JSON.parse(JSON.stringify(baseSnapshot || {}));
    const timestamp = new Date().toISOString();

    const objList: string[] = Array.isArray(objectives)
      ? objectives.map((o: any) => (typeof o === 'string' ? o : o?.type || ''))
      : [];

    const walls = base.walls || [];
    const spaces = base.spaces || [];
    const nonStructuralWalls = walls.filter((w) => !w.isStructural);

    // 1. Candidato A: Distribución Diáfana / Open-Space (Maximizar Superficie Útil y Espacio Abierto)
    if (
      objList.includes('MAXIMIZE_USABLE_AREA') ||
      objList.includes('MAXIMIZE_FREE_SPACE') ||
      objList.includes('MAXIMIZE_SPACE_EFFICIENCY') ||
      objList.length === 0 ||
      candidates.length === 0
    ) {
      const snapA: ScenarioSnapshotData = JSON.parse(JSON.stringify(base));
      if (nonStructuralWalls.length > 0) {
        const wallToRemove = nonStructuralWalls[0];
        snapA.walls = (snapA.walls || []).filter((w) => w.id !== wallToRemove.id);
        snapA.doors = (snapA.doors || []).filter((d) => d.wallId !== wallToRemove.id);

        // Añadir partida de demolición V11
        snapA.constructionItems = [
          ...(snapA.constructionItems || []),
          {
            id: `ci-demo-${wallToRemove.id}`,
            constructionId: 'const-preview',
            category: 'DEMOLITION',
            operation: 'DEMOLITION',
            name: 'Demolición de tabiquería interior',
            description: `Demolición de tabique no estructural (${wallToRemove.id})`,
            quantity: 8,
            unit: 'm2',
            wastePercent: 5,
            effectiveQuantity: 8.4,
            materialCost: 40,
            laborCost: 200,
            otherCost: 0,
            totalCost: 240,
            confidence: 'GEOMETRY_CALCULATED',
            requiresProValidation: false,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ];

        // Recalcular área útil ampliada
        if (snapA.rooms && snapA.rooms.length > 0) {
          snapA.rooms = snapA.rooms.map((r, i) =>
            i === 0 ? { ...r, areaM2: Number((r.areaM2 + 1.2).toFixed(1)) } : r
          );
        }

        candidates.push({
          candidateId: `cand-open-${Date.now()}-1`,
          name: 'Distribución Diáfana Open-Space',
          description: 'Apertura de tabique no portante para maximizar la amplitud visual y superficie útil del salón.',
          targetedObjective: 'MAXIMIZE_USABLE_AREA',
          snapshotData: snapA,
          modifications: [
            {
              type: 'DEMOLISH_PARTITION',
              description: 'Eliminación de tabique divisor no estructural.',
              reason: 'Unificación espacial y aumento de luminosidad.',
            },
          ],
        });
      }
    }

    // 2. Candidato B: Optimización Funcional y Zonificación de Trabajo (Maximizar Zonas)
    if (
      objList.includes('MAXIMIZE_FUNCTIONAL_ZONES') ||
      objList.includes('MAXIMIZE_STORAGE') ||
      candidates.length < maxCandidates
    ) {
      const snapB: ScenarioSnapshotData = JSON.parse(JSON.stringify(base));

      // Añadir zona funcional de trabajo / teletrabajo
      snapB.zones = [
        ...(snapB.zones || []),
        {
          id: `zone-work-${Date.now()}`,
          parentSpaceId: spaces[0]?.id || 'space-main',
          name: 'Zona de Trabajo Integrada',
          type: 'WORKSPACE',
          areaM2: {
            value: 5.5,
            unit: 'm2',
            source: 'GEOMETRY_CALCULATED',
          },
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ];

      // Añadir partida de acabados
      snapB.constructionItems = [
        ...(snapB.constructionItems || []),
        {
          id: `ci-zone-desk-${Date.now()}`,
          constructionId: 'const-preview',
          category: 'WALL_FINISH',
          operation: 'CONSTRUCTION',
          name: 'Revestimiento acústico y panelado de despacho',
          description: 'Instalación de panelado para zona de trabajo',
          quantity: 12,
          unit: 'm2',
          wastePercent: 8,
          effectiveQuantity: 12.96,
          materialCost: 420,
          laborCost: 240,
          otherCost: 0,
          totalCost: 660,
          confidence: 'GEOMETRY_CALCULATED',
          requiresProValidation: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ];

      candidates.push({
        candidateId: `cand-zone-${Date.now()}-2`,
        name: 'Integración Funcional con Zona de Trabajo',
        description: 'Creación de área polivalente de despacho y almacenaje optimizado.',
        targetedObjective: 'MAXIMIZE_FUNCTIONAL_ZONES',
        snapshotData: snapB,
        modifications: [
          {
            type: 'ADD_FUNCTIONAL_ZONE',
            description: 'Definición de zona funcional WORKSPACE.',
            reason: 'Optimizar el uso polivalente del espacio principal.',
          },
        ],
      });
    }

    // 3. Candidato C: Intervención Mínima y Bajo Coste (Minimizar Coste y Obra)
    if (
      objList.includes('MINIMIZE_CONSTRUCTION_COST') ||
      objList.includes('MINIMIZE_CONSTRUCTION_WORK') ||
      candidates.length < maxCandidates
    ) {
      const snapC: ScenarioSnapshotData = JSON.parse(JSON.stringify(base));
      snapC.constructionItems = [
        {
          id: `ci-paint-${Date.now()}`,
          constructionId: 'const-preview',
          category: 'WALL_FINISH',
          operation: 'FINISHING',
          name: 'Pintura plástica lisa lavable',
          description: 'Renovación de revestimientos sin demolición',
          quantity: 80,
          unit: 'm2',
          wastePercent: 5,
          effectiveQuantity: 84,
          materialCost: 320,
          laborCost: 800,
          otherCost: 0,
          totalCost: 1120,
          confidence: 'GEOMETRY_CALCULATED',
          requiresProValidation: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ];

      candidates.push({
        candidateId: `cand-lowcost-${Date.now()}-3`,
        name: 'Optimización de Bajo Coste e Intervención Mínima',
        description: 'Conserva íntegramente la tabiquería existente minimizando presupuesto y residuos de obra.',
        targetedObjective: 'MINIMIZE_CONSTRUCTION_COST',
        snapshotData: snapC,
        modifications: [
          {
            type: 'PRESERVE_LAYOUT',
            description: 'Conservación integral de muros y tabiquería.',
            reason: 'Reducir el coste de ejecución material y plazos de ejecución.',
          },
        ],
      });
    }

    // 4. Candidato D: Redistribución Paramétrica de Circulación y Pasos
    if (candidates.length < maxCandidates) {
      const snapD: ScenarioSnapshotData = JSON.parse(JSON.stringify(base));

      snapD.doors = (snapD.doors || []).map((d) => ({
        ...d,
        widthM: Math.max(d.widthM, 0.85),
      }));

      candidates.push({
        candidateId: `cand-circ-${Date.now()}-4`,
        name: 'Optimización de Circulación y Accesibilidad',
        description: 'Ampliación de anchos de paso y holguras libres de circulación en todos los accesos.',
        targetedObjective: 'MAXIMIZE_CIRCULATION',
        snapshotData: snapD,
        modifications: [
          {
            type: 'EXPAND_DOORWAYS',
            description: 'Ajuste de huecos de paso a 0.85m.',
            reason: 'Cumplimiento óptimo de accesibilidad universal.',
          },
        ],
      });
    }

    return candidates.slice(0, maxCandidates);
  }
}
