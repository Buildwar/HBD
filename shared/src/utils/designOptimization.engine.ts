/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * MOTOR DE OPTIMIZACIÓN DE DISEÑO ARQUITECTÓNICO
 * DESIGN OPTIMIZATION ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  CreateOptimizationInput,
  OptimizationResultDto,
  OptimizationRequestDto,
  DesignAlternativeDto,
  DesignConstraint,
  DesignObjectiveType,
  AlternativeExplanationDto,
} from '../types/optimization.types.js';
import { ScenarioSnapshotData, ProjectScenarioDto } from '../types/scenario.types.js';
import { CandidateGenerationEngine, GeneratedCandidate } from './candidateGeneration.engine.js';
import { ScenarioValidationEngine } from './scenarioValidation.engine.js';
import { ScenarioImpactEngine } from './scenarioImpact.engine.js';
import { MockDesignOptimizationAIProvider } from './designOptimizationAI.provider.js';

export class DesignOptimizationEngine {
  /**
   * Ejecuta la optimización integral de diseño y genera alternativas explicables
   */
  public static async optimizeDesign(
    input: CreateOptimizationInput,
    baseSnapshot: ScenarioSnapshotData
  ): Promise<OptimizationResultDto> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const requestId = `opt-req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Interpretar Brief si se proporciona
    let objectives: DesignObjectiveType[] = input.objectives || [];
    let constraints: DesignConstraint[] = input.constraints || [];
    let preferences: Record<string, any> = input.preferences || {};

    if (input.brief && (objectives.length === 0 || constraints.length === 0)) {
      const aiProvider = new MockDesignOptimizationAIProvider();
      const interpreted = await aiProvider.interpretBrief(input.brief);
      if (objectives.length === 0) objectives = interpreted.objectives;
      if (constraints.length === 0) constraints = interpreted.constraints;
      preferences = { ...preferences, ...interpreted.preferences };
    }

    if (objectives.length === 0) {
      objectives = ['MAXIMIZE_USABLE_AREA', 'MINIMIZE_CONSTRUCTION_COST'];
    }

    const maxCandidates = input.maxCandidates || 4;
    const timeoutMs = input.timeoutMs || 15000;
    const strategy = input.strategy || 'PARAMETRIC';

    // 2. Generar candidatos de diseño
    const generatedCandidates = CandidateGenerationEngine.generateCandidates(
      baseSnapshot,
      objectives,
      maxCandidates * 2
    );

    const validAlternatives: DesignAlternativeDto[] = [];
    const rejectedCandidates: Array<{
      candidateId: string;
      name: string;
      reason: string;
      failedConstraint?: string;
    }> = [];

    // Objeto temporal de escenario base para cálculo de impacto
    const baseScenarioMock: ProjectScenarioDto = {
      id: input.baseScenarioId || 'scenario-base',
      projectId: input.projectId,
      name: 'Estado Base',
      type: 'CURRENT',
      status: 'VALID',
      snapshotData: baseSnapshot,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 3. Evaluar y Validar cada candidato
    for (const candidate of generatedCandidates) {
      // Comprobar Timeout
      if (Date.now() - startTime > timeoutMs) {
        break;
      }

      // Comprobar Restricciones Duras (HARD CONSTRAINTS - REQUIRED)
      const hardConstraintViolation = this.checkHardConstraints(candidate, constraints);
      if (hardConstraintViolation) {
        rejectedCandidates.push({
          candidateId: candidate.candidateId,
          name: candidate.name,
          reason: hardConstraintViolation.reason,
          failedConstraint: hardConstraintViolation.constraint.description,
        });
        continue;
      }

      // Evaluar Restricciones Blandas (SOFT CONSTRAINTS)
      const constraintsStatus = this.evaluateSoftConstraints(candidate, constraints);

      // Calcular Validación Técnica e Impacto
      const validation = ScenarioValidationEngine.validateScenario(
        candidate.candidateId,
        candidate.snapshotData
      );

      const targetScenarioMock: ProjectScenarioDto = {
        id: candidate.candidateId,
        projectId: input.projectId,
        name: candidate.name,
        type: 'MANUAL',
        status: 'VALID',
        snapshotData: candidate.snapshotData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const impacts = ScenarioImpactEngine.calculateScenarioImpact(targetScenarioMock, baseScenarioMock);

      // Cómputo de Métricas de la Alternativa
      const usableArea = (candidate.snapshotData.rooms || []).reduce((acc, r) => acc + (r.areaM2 || 0), 0);
      const estimatedCost = impacts.economicImpact.scenarioCostEur;
      const roomsCount = candidate.snapshotData.rooms?.length || 0;
      const modificationsCount = candidate.modifications.length;

      // Generar Explicabilidad Técnica
      const satisfied = constraintsStatus.filter((c) => c.status === 'SATISFIED').map((c) => c.description);
      const unsatisfied = constraintsStatus.filter((c) => c.status === 'NOT_SATISFIED').map((c) => c.description);

      const explanations: AlternativeExplanationDto[] = candidate.modifications.map((m) => ({
        whatChanged: m.description,
        whyChanged: m.reason,
        objectiveTargeted: candidate.targetedObjective,
        satisfiedConstraints: satisfied,
        unsatisfiedConstraints: unsatisfied,
        impactSummary: `Delta de superficie: ${impacts.geometricImpact.usefulAreaDeltaM2 >= 0 ? '+' : ''}${impacts.geometricImpact.usefulAreaDeltaM2} m² | Coste estimado: ${estimatedCost} €`,
      }));

      const alternativeDto: DesignAlternativeDto = {
        id: `alt-${Date.now()}-${validAlternatives.length + 1}`,
        requestId,
        scenarioId: null,
        name: candidate.name,
        description: candidate.description,
        status: 'VALID',
        snapshotData: candidate.snapshotData,
        metrics: {
          usableAreaM2: Number(usableArea.toFixed(1)),
          estimatedCostEur: estimatedCost,
          roomsCount,
          openSpaceRatio: impacts.geometricImpact.openSpaceRatioDelta,
          modificationsCount,
          complianceScore: validation.complianceScore,
        },
        impacts,
        validation,
        explanations,
        constraintsStatus,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      validAlternatives.push(alternativeDto);

      if (validAlternatives.length >= maxCandidates) {
        break;
      }
    }

    const executionTimeMs = Date.now() - startTime;

    const requestDto: OptimizationRequestDto = {
      id: requestId,
      projectId: input.projectId,
      baseScenarioId: input.baseScenarioId || null,
      name: input.name || 'Optimización Paramétrica de Vivienda',
      objectives,
      constraints,
      preferences,
      strategy,
      status: 'COMPLETED',
      maxCandidates,
      timeoutMs,
      executionTimeMs,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return {
      request: requestDto,
      alternatives: validAlternatives,
      rejectedCandidates,
      metrics: {
        totalCandidatesEvaluated: generatedCandidates.length,
        validAlternativesCount: validAlternatives.length,
        rejectedCount: rejectedCandidates.length,
        executionTimeMs,
      },
      warnings:
        validAlternatives.length === 0
          ? ['No se encontraron alternativas que cumplan todas las restricciones requeridas. Intenta flexibilizar las restricciones.']
          : [],
      strategy,
      generatedAt: timestamp,
      objectiveNotice:
        'NOTA METODOLÓGICA: Todas las alternativas se exponen con métricas objetivas independientes sin designar una opción ganadora automática. La selección final corresponde al criterio y necesidades del usuario.',
    };
  }

  /**
   * Comprueba restricciones obligatorias (HARD CONSTRAINTS)
   */
  private static checkHardConstraints(
    candidate: GeneratedCandidate,
    constraints: DesignConstraint[]
  ): { constraint: DesignConstraint; reason: string } | null {
    for (const c of constraints) {
      if (c.type !== 'REQUIRED') continue;

      if (c.category === 'STRUCTURE') {
        // Verificar que ningún muro estructural haya sido eliminado
        const hasStructuralTouched = (candidate.snapshotData.walls || []).some(
          (w) => w.isStructural && w.thickness < 0.20
        );
        if (hasStructuralTouched) {
          return {
            constraint: c,
            reason: 'Se detectó modificación de elemento estructural portante.',
          };
        }
      }

      if (c.category === 'PROGRAM' && c.targetValue) {
        const currentRooms = candidate.snapshotData.rooms?.length || 0;
        if (currentRooms < c.targetValue) {
          return {
            constraint: c,
            reason: `Número de estancias (${currentRooms}) inferior al mínimo requerido (${c.targetValue}).`,
          };
        }
      }
    }

    return null;
  }

  /**
   * Evalúa satisfacción de restricciones blandas (SOFT CONSTRAINTS)
   */
  private static evaluateSoftConstraints(
    candidate: GeneratedCandidate,
    constraints: DesignConstraint[]
  ): DesignAlternativeDto['constraintsStatus'] {
    return constraints.map((c) => {
      let status: 'SATISFIED' | 'PARTIALLY_SATISFIED' | 'NOT_SATISFIED' = 'SATISFIED';
      let notes = 'Restricción cumplida satisfactoriamente.';

      if (c.category === 'DIMENSIONS' && c.targetValue) {
        const narrowDoors = (candidate.snapshotData.doors || []).filter((d) => d.widthM < c.targetValue);
        if (narrowDoors.length > 0) {
          status = 'PARTIALLY_SATISFIED';
          notes = `Existen ${narrowDoors.length} huecos con anchura menor a ${c.targetValue}m.`;
        }
      }

      return {
        constraintId: c.id,
        description: c.description,
        type: c.type,
        status,
        notes,
      };
    });
  }

  /**
   * Convierte una alternativa generada a un Escenario de Proyecto (V12)
   */
  public static convertAlternativeToScenario(
    alternative: DesignAlternativeDto,
    projectId: string,
    scenarioName?: string
  ): ProjectScenarioDto {
    const timestamp = new Date().toISOString();
    const scenarioId = `scenario-opt-${Date.now()}`;
    return {
      id: scenarioId,
      projectId,
      name: scenarioName || `Escenario: ${alternative.name}`,
      description: alternative.description || `Generado a partir de la alternativa de optimización ${alternative.name}`,
      type: 'AI_OPTIMIZED',
      status: 'DRAFT',
      snapshotData: alternative.snapshotData || {},
      actions: [
        {
          id: `act-init-opt-${Date.now()}`,
          scenarioId,
          sequence: 1,
          actionType: 'CREATE_SPACE',
          isReverted: false,
          payload: { alternativeId: alternative.id, name: alternative.name },
          createdAt: timestamp,
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
}
