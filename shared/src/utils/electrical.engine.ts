/**
 * HBD — HOME BOARD DESIGNER
 * Electrical Calculation & Load Balancing Engine (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  TechnicalElementDto,
  ElectricalCircuitSummaryDto,
  ElectricalLoadSummaryDto
} from '../types/technicalInfrastructure.types.js';

export interface StandardCircuitDefinition {
  id: string;
  name: string;
  nominalBreakerAmps: number;
  minWireGaugeMm2: number;
  maxPoints: number;
  maxPowerWatts: number;
}

export const STANDARD_SPANISH_CIRCUITS: Record<string, StandardCircuitDefinition> = {
  C1: { id: 'C1', name: 'Iluminación', nominalBreakerAmps: 10, minWireGaugeMm2: 1.5, maxPoints: 30, maxPowerWatts: 2300 },
  C2: { id: 'C2', name: 'Tomas de uso general', nominalBreakerAmps: 16, minWireGaugeMm2: 2.5, maxPoints: 20, maxPowerWatts: 3680 },
  C3: { id: 'C3', name: 'Cocina y Horno', nominalBreakerAmps: 25, minWireGaugeMm2: 6.0, maxPoints: 2, maxPowerWatts: 5750 },
  C4: { id: 'C4', name: 'Lavadora, Lavavajillas y Termo', nominalBreakerAmps: 20, minWireGaugeMm2: 4.0, maxPoints: 3, maxPowerWatts: 4600 },
  C5: { id: 'C5', name: 'Baños y Tomas auxiliares cocina', nominalBreakerAmps: 16, minWireGaugeMm2: 2.5, maxPoints: 6, maxPowerWatts: 3680 },
  C9: { id: 'C9', name: 'Aire acondicionado / Climatización', nominalBreakerAmps: 25, minWireGaugeMm2: 6.0, maxPoints: 2, maxPowerWatts: 5750 },
  C10: { id: 'C10', name: 'Secadora independiente', nominalBreakerAmps: 16, minWireGaugeMm2: 2.5, maxPoints: 1, maxPowerWatts: 3680 },
  C11: { id: 'C11', name: 'Automatización / Domótica', nominalBreakerAmps: 10, minWireGaugeMm2: 1.5, maxPoints: 20, maxPowerWatts: 2300 },
  C12: { id: 'C12', name: 'Recarga Vehículo Eléctrico (VE)', nominalBreakerAmps: 32, minWireGaugeMm2: 10.0, maxPoints: 1, maxPowerWatts: 7360 }
};

export class ElectricalEngine {
  /**
   * Calcula el balance de cargas eléctricas, potencia simultánea y sobrecargas de circuitos
   */
  public static calculateLoadSummary(
    elements: TechnicalElementDto[],
    projectId: string
  ): ElectricalLoadSummaryDto {
    const circuitsMap = new Map<string, TechnicalElementDto[]>();

    // Agrupar elementos por circuito
    for (const elem of elements) {
      if (elem.category === 'ELECTRICAL' || elem.category === 'LIGHTING' || elem.category === 'HVAC' || elem.category === 'SMART_HOME') {
        const cId = elem.circuitId || (elem.category === 'LIGHTING' ? 'C1' : 'C2');
        if (!circuitsMap.has(cId)) {
          circuitsMap.set(cId, []);
        }
        circuitsMap.get(cId)!.push(elem);
      }
    }

    let totalInstalledWatts = 0;
    const circuitsSummary: ElectricalCircuitSummaryDto[] = [];

    for (const [circuitId, circuitElements] of circuitsMap.entries()) {
      const standardSpec = STANDARD_SPANISH_CIRCUITS[circuitId] || {
        id: circuitId,
        name: `Circuito ${circuitId}`,
        nominalBreakerAmps: 16,
        minWireGaugeMm2: 2.5,
        maxPoints: 20,
        maxPowerWatts: 3680
      };

      let circuitWatts = 0;
      for (const el of circuitElements) {
        // Asignar potencia por defecto si no está especificada según categoría
        const power = el.powerWatts ?? this.getDefaultPowerWatts(el);
        circuitWatts += power;
      }

      totalInstalledWatts += circuitWatts;

      // Factor de simultaneidad específico por circuito
      const simultaneousFactor = this.getSimultaneityFactor(circuitId, circuitElements.length);
      const simultaneousDemandWatts = Math.round(circuitWatts * simultaneousFactor);
      const maxAllowedWatts = standardSpec.nominalBreakerAmps * 230; // Monofásico 230V
      const loadFactorPercentage = Math.round((simultaneousDemandWatts / maxAllowedWatts) * 100);
      const isOverloaded = simultaneousDemandWatts > maxAllowedWatts || circuitElements.length > standardSpec.maxPoints;

      circuitsSummary.push({
        circuitId,
        circuitName: standardSpec.name,
        breakerAmps: standardSpec.nominalBreakerAmps,
        wireSectionMm2: standardSpec.minWireGaugeMm2,
        elementsCount: circuitElements.length,
        totalInstalledWatts: circuitWatts,
        simultaneousDemandWatts,
        loadFactorPercentage,
        isOverloaded
      });
    }

    // Factor de simultaneidad global de la vivienda (según REBT ITC-BT-10)
    const diversityFactor = 0.7;
    const totalDemandPowerWatts = Math.round(totalInstalledWatts * diversityFactor);

    // Potencia a contratar normalizada recomendada (escalones estándar en España: 3.45, 4.6, 5.75, 6.9, 8.05, 9.2, 10.35, 11.5, 14.49 kW)
    const recommendedContractPowerKw = this.getRecommendedContractPower(totalDemandPowerWatts / 1000);

    return {
      projectId,
      totalInstalledPowerWatts: totalInstalledWatts,
      diversityFactor,
      totalDemandPowerWatts,
      recommendedContractPowerKw,
      circuits: circuitsSummary,
      isBalanced: circuitsSummary.every(c => !c.isOverloaded),
      phaseDistribution: {
        phaseL1Watts: totalDemandPowerWatts
      }
    };
  }

  public static getDefaultPowerWatts(el: TechnicalElementDto): number {
    switch (el.category) {
      case 'LIGHTING':
        return 15; // LED downlight / bombilla estándar
      case 'ELECTRICAL':
        return 200; // Enchufe estándar medio
      case 'HVAC':
        return 2200; // Split estándar 2.2kW
      case 'SMART_HOME':
        return 5; // Micromódulo / pasarela
      case 'NETWORK':
      case 'WIFI':
        return 15;
      case 'SECURITY':
        return 10;
      case 'MULTIMEDIA':
        return 150;
      default:
        return 50;
    }
  }

  private static getSimultaneityFactor(circuitId: string, count: number): number {
    if (circuitId === 'C1') return 0.75; // Alumbrado
    if (circuitId === 'C2') return count > 5 ? 0.4 : 0.6; // Enchufes
    if (circuitId === 'C3') return 0.8; // Cocina/Horno
    if (circuitId === 'C4') return 0.7; // Electrodomésticos
    if (circuitId === 'C9') return 0.9; // Climatización
    return 0.5;
  }

  private static getRecommendedContractPower(demandKw: number): number {
    const steps = [3.45, 4.6, 5.75, 6.9, 8.05, 9.2, 10.35, 11.5, 14.49];
    for (const step of steps) {
      if (step >= demandKw) return step;
    }
    return Math.ceil(demandKw);
  }
}
