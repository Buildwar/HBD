/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * PROVEEDOR ABSTRACTO Y MOCK DE IA DE OPTIMIZACIÓN DE DISEÑO
 * DESIGN OPTIMIZATION AI PROVIDER
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  DesignBrief,
  DesignObjectiveType,
  DesignConstraint,
} from '../types/optimization.types.js';

export interface DesignOptimizationAIProvider {
  interpretBrief(brief: DesignBrief): Promise<{
    objectives: DesignObjectiveType[];
    constraints: DesignConstraint[];
    preferences: Record<string, any>;
  }>;
}

export class MockDesignOptimizationAIProvider implements DesignOptimizationAIProvider {
  public async interpretBrief(brief: DesignBrief): Promise<{
    objectives: DesignObjectiveType[];
    constraints: DesignConstraint[];
    preferences: Record<string, any>;
  }> {
    const objectives: DesignObjectiveType[] = [];
    const constraints: DesignConstraint[] = [];
    const preferences: Record<string, any> = {
      style: brief.targetStyle || 'Moderno',
    };

    const briefText = (brief.text || '').toLowerCase();

    // 1. Detección de Objetivos
    if (briefText.includes('superficie') || briefText.includes('espacio') || brief.minUsableAreaM2) {
      objectives.push('MAXIMIZE_USABLE_AREA');
    }
    if (briefText.includes('presupuesto') || briefText.includes('coste') || briefText.includes('económic') || brief.maxBudgetEur) {
      objectives.push('MINIMIZE_CONSTRUCTION_COST');
    }
    if (briefText.includes('obra mínima') || briefText.includes('poca obra') || briefText.includes('rápido')) {
      objectives.push('MINIMIZE_CONSTRUCTION_WORK');
    }
    if (briefText.includes('abierto') || briefText.includes('open plan') || briefText.includes('diáfano')) {
      objectives.push('MAXIMIZE_FREE_SPACE');
    }
    if (briefText.includes('almacenaje') || briefText.includes('armario') || brief.storageBoostRequired) {
      objectives.push('MAXIMIZE_STORAGE');
    }
    if (briefText.includes('luz') || briefText.includes('iluminación')) {
      objectives.push('MAXIMIZE_NATURAL_LIGHT');
    }
    if (briefText.includes('trabajo') || briefText.includes('despacho') || brief.workZoneRequired) {
      objectives.push('MAXIMIZE_FUNCTIONAL_ZONES');
    }

    if (objectives.length === 0) {
      objectives.push('MAXIMIZE_USABLE_AREA', 'MINIMIZE_CONSTRUCTION_COST');
    }

    // 2. Detección de Restricciones (Constraints)
    if (brief.preserveStructuralWalls !== false) {
      constraints.push({
        id: 'c-struct',
        type: 'REQUIRED',
        category: 'STRUCTURE',
        description: 'Mantener intactos los muros de carga y elementos estructurales.',
        targetElement: 'Paredes Portantes',
      });
    }

    if (brief.minBedrooms) {
      constraints.push({
        id: 'c-bed',
        type: 'REQUIRED',
        category: 'PROGRAM',
        description: `Garantizar al menos ${brief.minBedrooms} dormitorios independientes.`,
        targetValue: brief.minBedrooms,
      });
    }

    if (brief.preserveKitchen) {
      constraints.push({
        id: 'c-kitchen',
        type: 'REQUIRED',
        category: 'PRESERVATION',
        description: 'Conservar la ubicación técnica de acometidas y desagües de cocina.',
        targetElement: 'Cocina',
      });
    }

    if (brief.maxBudgetEur) {
      constraints.push({
        id: 'c-budget',
        type: 'REQUIRED',
        category: 'BUDGET',
        description: `Presupuesto máximo de ejecución material: ${brief.maxBudgetEur} €.`,
        targetValue: brief.maxBudgetEur,
      });
    }

    if (brief.minPassageWidthM) {
      constraints.push({
        id: 'c-passage',
        type: 'PREFERRED',
        category: 'DIMENSIONS',
        description: `Ancho de paso libre mínimo en pasillos: ${brief.minPassageWidthM} m.`,
        targetValue: brief.minPassageWidthM,
      });
    }

    return {
      objectives: Array.from(new Set(objectives)),
      constraints,
      preferences,
    };
  }

  public async proposeOptimizedLayouts(
    floorPlanData: any,
    brief: DesignBrief
  ): Promise<
    Array<{
      name: string;
      description: string;
      tradeOffNotes: string;
      pros: string[];
      cons: string[];
      layoutChanges?: any;
    }>
  > {
    return [
      {
        name: 'Propuesta IA: Distribución Fluida y Espacio Abierto',
        description: 'Distribución optimizada para potenciar la amplitud visual y el paso de luz natural.',
        tradeOffNotes: 'Optimiza la sensación de amplitud e iluminación natural a expensas de la compartimentación acústica.',
        pros: ['Mayor entrada de luz natural', 'Sensación de amplitud incrementada'],
        cons: ['Menor privacidad en zonas comunes'],
      },
      {
        name: 'Propuesta IA: Zonificación Funcional y Espacio de Trabajo',
        description: 'Distribución estructurada con áreas diferenciadas de descanso y actividad.',
        tradeOffNotes: 'Prioriza la polivalencia de usos frente a la continuidad espacial sin obstáculos.',
        pros: ['Zona de teletrabajo integrada', 'Almacenaje optimizado'],
        cons: ['Mayor densidad de particiones'],
      },
    ];
  }
}
