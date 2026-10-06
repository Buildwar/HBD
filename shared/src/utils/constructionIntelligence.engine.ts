/**
 * HBD — HOME BOARD DESIGNER (V11.0.0)
 * Construction Intelligence Engine (Motor de Inteligencia de Obra y Reforma)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  ConstructionItemDto,
  ConstructionPhaseDto,
  ConstructionTaskDto,
  ConstructionProjectDto,
  ConstructionCategory,
  ConstructionOperationType,
  MeasurementConfidence,
} from '../types/construction.types.js';
import { DetailedGeometricMetricsDto } from '../types/space.types.js';
import { GeometricMetricsEngine } from './geometricMetrics.engine.js';
import { SpaceGeometricInput } from '../types/space.types.js';

export const PRO_VALIDATION_NOTICE =
  'REQUIERE VALIDACIÓN PROFESIONAL: Los cálculos y modificaciones que afecten a elementos estructurales, muros de carga o acometidas deben ser supervisados y certificados por un técnico competente (arquitecto o aparejador).';

export class ConstructionIntelligenceEngine {
  /**
   * Calcula la cantidad efectiva aplicando el porcentaje de merma configurable.
   */
  static computeEffectiveQuantity(quantity: number, wastePercent: number): number {
    const validWaste = Math.max(0, wastePercent || 0);
    const multiplier = 1 + validWaste / 100;
    return Number((quantity * multiplier).toFixed(2));
  }

  /**
   * Calcula el coste total de una partida a partir de material, mano de obra y otros.
   */
  static computeItemTotalCost(item: {
    quantity: number;
    wastePercent?: number;
    materialCost?: number;
    laborCost?: number;
    otherCost?: number;
  }): {
    effectiveQuantity: number;
    materialCost: number;
    laborCost: number;
    otherCost: number;
    totalCost: number;
  } {
    const effectiveQty = this.computeEffectiveQuantity(item.quantity, item.wastePercent || 0);
    const material = Number(((item.materialCost || 0) * effectiveQty).toFixed(2));
    const labor = Number(((item.laborCost || 0) * (item.quantity || 1)).toFixed(2));
    const other = Number((item.otherCost || 0).toFixed(2));
    const total = Number((material + labor + other).toFixed(2));

    return {
      effectiveQuantity: effectiveQty,
      materialCost: material,
      laborCost: labor,
      otherCost: other,
      totalCost: total,
    };
  }

  /**
   * Genera partidas de obra estándar consumiendo opcionalmente las métricas geométricas de V10.
   */
  static generateItemsFromGeometricMetrics(
    constructionId: string,
    spaceId: string,
    spaceName: string,
    metrics: DetailedGeometricMetricsDto,
    unitPrices?: {
      flooringMaterialM2?: number;
      flooringLaborM2?: number;
      paintMaterialM2?: number;
      paintLaborM2?: number;
      skirtingMaterialM?: number;
      skirtingLaborM?: number;
      ceilingMaterialM2?: number;
      ceilingLaborM2?: number;
    }
  ): Array<Omit<ConstructionItemDto, 'id' | 'createdAt' | 'updatedAt'>> {
    const p = {
      flooringMaterialM2: 25,
      flooringLaborM2: 18,
      paintMaterialM2: 4,
      paintLaborM2: 8,
      skirtingMaterialM: 6,
      skirtingLaborM: 5,
      ceilingMaterialM2: 12,
      ceilingLaborM2: 15,
      ...unitPrices,
    };

    const items: Array<Omit<ConstructionItemDto, 'id' | 'createdAt' | 'updatedAt'>> = [];
    const source = metrics.usableAreaM2.source;

    // 1. Pavimento / Solado
    if (metrics.usableAreaM2.value > 0) {
      const qty = metrics.usableAreaM2.value;
      const waste = 8; // 8% merma estándar
      const costs = this.computeItemTotalCost({
        quantity: qty,
        wastePercent: waste,
        materialCost: p.flooringMaterialM2,
        laborCost: p.flooringLaborM2,
      });

      items.push({
        constructionId,
        spaceId,
        spaceName,
        category: 'FLOORING',
        operation: 'FINISHING',
        name: `Pavimento continuo para ${spaceName}`,
        description: `Suministro e instalación de pavimento con ${waste}% de merma técnica calculada.`,
        quantity: qty,
        unit: 'm2',
        wastePercent: waste,
        effectiveQuantity: costs.effectiveQuantity,
        materialCost: costs.materialCost,
        laborCost: costs.laborCost,
        otherCost: 0,
        totalCost: costs.totalCost,
        confidence: source,
        requiresProValidation: false,
      });
    }

    // 2. Pintura en paramentos verticales netos (descontando puertas y ventanas)
    if (metrics.netWallAreaM2.value > 0) {
      const qty = metrics.netWallAreaM2.value;
      const waste = 5;
      const costs = this.computeItemTotalCost({
        quantity: qty,
        wastePercent: waste,
        materialCost: p.paintMaterialM2,
        laborCost: p.paintLaborM2,
      });

      items.push({
        constructionId,
        spaceId,
        spaceName,
        category: 'WALL_FINISH',
        operation: 'FINISHING',
        name: `Pintura plástica paramentos verticales en ${spaceName}`,
        description: `Aplicación de pintura plástica en paredes netas (${qty} m² tras deducir ${metrics.openingsAreaM2.value} m² de huecos).`,
        quantity: qty,
        unit: 'm2',
        wastePercent: waste,
        effectiveQuantity: costs.effectiveQuantity,
        materialCost: costs.materialCost,
        laborCost: costs.laborCost,
        otherCost: 0,
        totalCost: costs.totalCost,
        confidence: source,
        requiresProValidation: false,
      });
    }

    // 3. Rodapié (deduciendo pasos de puertas)
    if (metrics.skirtingBoardM.value > 0) {
      const qty = metrics.skirtingBoardM.value;
      const waste = 10;
      const costs = this.computeItemTotalCost({
        quantity: qty,
        wastePercent: waste,
        materialCost: p.skirtingMaterialM,
        laborCost: p.skirtingLaborM,
      });

      items.push({
        constructionId,
        spaceId,
        spaceName,
        category: 'FLOORING',
        operation: 'FINISHING',
        name: `Rodapié a juego para ${spaceName}`,
        description: `Colocación de rodapié sobre perímetro útil (${qty} m lineales).`,
        quantity: qty,
        unit: 'm',
        wastePercent: waste,
        effectiveQuantity: costs.effectiveQuantity,
        materialCost: costs.materialCost,
        laborCost: costs.laborCost,
        otherCost: 0,
        totalCost: costs.totalCost,
        confidence: source,
        requiresProValidation: false,
      });
    }

    return items;
  }

  /**
   * Determina si una partida requiere advertencia de validación profesional.
   */
  static checkRequiresProValidation(
    category: ConstructionCategory,
    operation: ConstructionOperationType,
    itemName: string
  ): boolean {
    const criticalCategories: ConstructionCategory[] = ['DEMOLITION', 'MASONRY', 'HVAC', 'PLUMBING', 'ELECTRICAL'];
    const nameLower = (itemName || '').toLowerCase();
    const criticalKeywords = ['carga', 'muro de carga', 'estructural', 'pilar', 'bajante', 'gas', 'alta tensión'];

    if (criticalCategories.includes(category) && (operation === 'DEMOLITION' || operation === 'CONSTRUCTION')) {
      return true;
    }

    return criticalKeywords.some((kw) => nameLower.includes(kw));
  }

  /**
   * Calcula el progreso global a partir del estado de las tareas de todas las fases.
   */
  static calculateProjectProgress(phases: ConstructionPhaseDto[]): number {
    if (!phases || phases.length === 0) return 0;

    let totalTasks = 0;
    let completedTasks = 0;

    for (const phase of phases) {
      if (phase.tasks && phase.tasks.length > 0) {
        for (const task of phase.tasks) {
          totalTasks++;
          if (task.status === 'DONE') {
            completedTasks++;
          }
        }
      }
    }

    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  /**
   * Valida dependencias de tareas para evitar ciclos o completar tareas con dependencias bloqueadas.
   */
  static validateTaskCompletion(
    taskId: string,
    tasks: ConstructionTaskDto[]
  ): { canComplete: boolean; blockingTaskNames: string[] } {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || !targetTask.dependencies || targetTask.dependencies.length === 0) {
      return { canComplete: true, blockingTaskNames: [] };
    }

    const blockingTasks = tasks.filter(
      (t) => targetTask.dependencies.includes(t.id) && t.status !== 'DONE'
    );

    return {
      canComplete: blockingTasks.length === 0,
      blockingTaskNames: blockingTasks.map((t) => t.name),
    };
  }

  /**
   * Genera fases estándar iniciales para un proyecto de reforma integral.
   */
  static generateDefaultPhases(): Array<{
    name: string;
    description: string;
    order: number;
    estimatedDurationDays: number;
    defaultTasks: string[];
    defaultChecklist: string[];
  }> {
    return [
      {
        name: 'Fase 1: Preparación y Demoliciones',
        description: 'Protección de zonas comunes, retirada de mobiliario existente y demolición de tabiquería y pavimentos.',
        order: 1,
        estimatedDurationDays: 5,
        defaultTasks: [
          'Protección de accesos y zonas comunitarias',
          'Desmontaje de carpinterías y sanitarios existentes',
          'Demolición de tabiquería no estructural según plano',
          'Levantado de pavimentos y desescombro',
        ],
        defaultChecklist: [
          'Contenedor de escombros gestionado y autorizado',
          'Suministro de agua y electricidad de obra verificado',
          'Demoliciones completadas sin afección a elementos estructurales',
        ],
      },
      {
        name: 'Fase 2: Instalaciones Básicas',
        description: 'Renovación y trazado de acometidas eléctricas, fontanería, desagües y climatización.',
        order: 2,
        estimatedDurationDays: 8,
        defaultTasks: [
          'Rozas y canalizaciones eléctricas según nuevo diseño',
          'Instalación de fontanería y saneamiento multicapa',
          'Preinstalación de climatización por conductos o split',
        ],
        defaultChecklist: [
          'Prueba de presión de fontanería realizada y superada',
          'Puntos de luz y tomas de corriente replanteados',
        ],
      },
      {
        name: 'Fase 3: Albañilería y Falsos Techos',
        description: 'Levantamiento de nueva tabiquería (pladur/ladrillo), trasdosados y techos continuos.',
        order: 3,
        estimatedDurationDays: 7,
        defaultTasks: [
          'Replanteo de nueva distribución en suelo',
          'Montaje de tabiquería de yeso laminado con aislamiento acústico',
          'Instalación de falso techo continuo de pladur',
          'Enlucido y preparación de paramentos',
        ],
        defaultChecklist: [
          'Nivelación de soleras y planeidad de paredes revisada',
          'Huecos de paso para nuevas puertas comprobados',
        ],
      },
      {
        name: 'Fase 4: Acabados, Suelos y Pintura',
        description: 'Colocación de gres porcelánico / tarima, alicatados y aplicación de pintura plástica.',
        order: 4,
        estimatedDurationDays: 6,
        defaultTasks: [
          'Alicatado de baños y frentes de cocina',
          'Colocación de pavimento continuo y rodapié',
          'Lijado, imprimación y pintura plástica en 2 manos',
        ],
        defaultChecklist: [
          'Juntas de dilatación y lechada homogéneas',
          'Acabado liso de pintura sin sombras ni marcas',
        ],
      },
      {
        name: 'Fase 5: Montaje de Mobiliario y Equipamiento',
        description: 'Instalación de cocina, sanitarios, iluminación definitiva y mobiliario.',
        order: 5,
        estimatedDurationDays: 4,
        defaultTasks: [
          'Montaje de muebles de cocina y electrodomésticos',
          'Instalación de mecanismos eléctricos y luminarias',
          'Colocación de sanitarios, grifería y mamparas',
          'Montaje y distribución del mobiliario según gemelo 3D',
        ],
        defaultChecklist: [
          'Limpieza final de fin de obra completada',
          'Revisión general de funcionamiento de suministros',
          'Entrega y cotejo con el gemelo digital HBD',
        ],
      },
    ];
  }
}
