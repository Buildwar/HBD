/**
 * HBD — HOME BOARD DESIGNER
 * HVAC & Plumbing Hydraulics Engine (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  TechnicalElementDto,
  TechnicalConnectionDto
} from '../types/technicalInfrastructure.types.js';

export interface HvacPlumbingReport {
  totalHvacUnits: number;
  totalCoolingKw: number;
  totalHeatingKw: number;
  totalAirflowM3h: number;
  estimatedAreaCoveredM2: number;
  totalPlumbingPoints: number;
  simultaneousFlowRateLps: number;
  drainSlopesValid: boolean;
  issues: string[];
}

export class HvacPlumbingEngine {
  /**
   * Analiza las capacidades térmicas de climatización y caudales de fontanería/saneamiento
   */
  public static analyzeHvacAndPlumbing(
    elements: TechnicalElementDto[],
    connections: TechnicalConnectionDto[] = []
  ): HvacPlumbingReport {
    const hvacElements = elements.filter((e) => e.category === 'HVAC');
    const plumbingElements = elements.filter((e) => e.category === 'PLUMBING');

    let totalCoolingKw = 0;
    let totalHeatingKw = 0;
    let totalAirflowM3h = 0;

    for (const hvac of hvacElements) {
      totalCoolingKw += hvac.hvacCoolingKw ?? 2.5;
      totalHeatingKw += hvac.hvacHeatingKw ?? 2.8;
      totalAirflowM3h += hvac.airflowM3h ?? 450;
    }

    // Área estimada climatizable considerando 100 W/m² (0.1 kW/m²)
    const estimatedAreaCoveredM2 = Math.round((totalCoolingKw / 0.1) * 10) / 10;

    // Fontanería: caudal simultáneo según CTE DB-HS 4 (aprox 0.15 l/s por punto de consumo con factor de simultaneidad)
    const pointsCount = plumbingElements.length;
    const simultaneityFactor = pointsCount > 0 ? 1 / Math.sqrt(Math.max(1, pointsCount - 1)) : 0;
    const simultaneousFlowRateLps = Math.round(pointsCount * 0.15 * Math.min(1, simultaneityFactor) * 100) / 100;

    const issues: string[] = [];

    // Validar pendientes de desagües en conexiones
    let drainSlopesValid = true;
    for (const conn of connections) {
      if (conn.connectionType === 'SANITARY_DRAIN') {
        // Si hay puntos de trazado, verificar pendiente mínima 1.5%
        if (conn.pathPoints && conn.pathPoints.length >= 2) {
          const p1 = conn.pathPoints[0];
          const p2 = conn.pathPoints[conn.pathPoints.length - 1];
          const horizontalDist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
          const verticalDrop = p1.z - p2.z;
          if (horizontalDist > 0.5) {
            const slope = (verticalDrop / horizontalDist) * 100;
            if (slope < 1.0) {
              drainSlopesValid = false;
              issues.push(`La tubería de desagüe ${conn.code || conn.name} tiene una pendiente inferior al 1.0% reglamentario.`);
            }
          }
        }
      }
    }

    return {
      totalHvacUnits: hvacElements.length,
      totalCoolingKw: Math.round(totalCoolingKw * 10) / 10,
      totalHeatingKw: Math.round(totalHeatingKw * 10) / 10,
      totalAirflowM3h: Math.round(totalAirflowM3h),
      estimatedAreaCoveredM2,
      totalPlumbingPoints: plumbingElements.length,
      simultaneousFlowRateLps,
      drainSlopesValid,
      issues
    };
  }
}
