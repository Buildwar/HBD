/**
 * HBD — HOME BOARD DESIGNER
 * Technical Infrastructure Central Master Engine (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  TechnicalCategory,
  TechnicalElementDto,
  TechnicalConnectionDto,
  TechnicalZoneDto,
  TechnicalSummaryDto,
  WiFiCoverageAnalysisDto
} from '../types/technicalInfrastructure.types.js';
import { ElectricalEngine } from './electrical.engine.js';
import { NetworkInfrastructureEngine } from './networkInfrastructure.engine.js';
import { WiFiCoverageEngine } from './wifiCoverage.engine.js';
import { SmartHomeEngine } from './smartHome.engine.js';
import { SecurityInfrastructureEngine } from './securityInfrastructure.engine.js';
import { HvacPlumbingEngine } from './hvacPlumbing.engine.js';
import { TechnicalValidationEngine } from './technicalValidation.engine.js';

export class TechnicalInfrastructureEngine {
  /**
   * Genera el resumen técnico holístico de todas las capas de infraestructura del proyecto
   */
  public static generateSummary(
    projectId: string,
    elements: TechnicalElementDto[],
    connections: TechnicalConnectionDto[] = [],
    zones: TechnicalZoneDto[] = []
  ): TechnicalSummaryDto {
    const byCategory: Record<TechnicalCategory, number> = {
      ELECTRICAL: 0,
      LIGHTING: 0,
      NETWORK: 0,
      WIFI: 0,
      SMART_HOME: 0,
      SECURITY: 0,
      HVAC: 0,
      PLUMBING: 0,
      MULTIMEDIA: 0,
      TECHNICAL_ROOM: 0
    };

    for (const el of elements) {
      if (byCategory[el.category] !== undefined) {
        byCategory[el.category]++;
      }
    }

    let totalCableLengthMeters = 0;
    let totalConduitLengthMeters = 0;

    for (const conn of connections) {
      totalCableLengthMeters += conn.lengthMeters || 0;
      if (conn.conduitDiameterMm) {
        totalConduitLengthMeters += conn.lengthMeters || 0;
      }
    }

    const validation = TechnicalValidationEngine.validateInfrastructure(elements, connections, zones);
    const electricalSummary = ElectricalEngine.calculateLoadSummary(elements, projectId);
    const networkSummary = NetworkInfrastructureEngine.calculateNetworkSummary(elements, projectId);

    // Bounding box por defecto para cálculo Wi-Fi
    const minX = Math.min(...elements.map((e) => e.position.x), 0);
    const maxX = Math.max(...elements.map((e) => e.position.x), 10);
    const minY = Math.min(...elements.map((e) => e.position.y), 0);
    const maxY = Math.max(...elements.map((e) => e.position.y), 10);

    const wifiCoverage: WiFiCoverageAnalysisDto = WiFiCoverageEngine.simulateCoverage(
      elements,
      projectId,
      { minX, minY, maxX, maxY },
      [],
      1.0
    );

    return {
      projectId,
      totalElements: elements.length,
      byCategory,
      totalConnections: connections.length,
      totalCableLengthMeters: Math.round(totalCableLengthMeters * 10) / 10,
      totalConduitLengthMeters: Math.round(totalConduitLengthMeters * 10) / 10,
      totalZones: zones.length,
      validation,
      electricalSummary,
      networkSummary,
      wifiSummary: {
        totalAps: wifiCoverage.accessPointsCount,
        coveragePercentage: wifiCoverage.coveragePercentage,
        deadZones: wifiCoverage.deadZonesCount
      }
    };
  }

  /**
   * Genera código de elemento técnico correlativo según su categoría
   */
  public static generateElementCode(category: TechnicalCategory, sequence: number): string {
    const prefixes: Record<TechnicalCategory, string> = {
      ELECTRICAL: 'ELE',
      LIGHTING: 'LUM',
      NETWORK: 'NET',
      WIFI: 'WIFI',
      SMART_HOME: 'DOM',
      SECURITY: 'SEC',
      HVAC: 'CLI',
      PLUMBING: 'FON',
      MULTIMEDIA: 'AV',
      TECHNICAL_ROOM: 'TEC'
    };
    const prefix = prefixes[category] || 'TEC';
    const num = sequence.toString().padStart(3, '0');
    return `${prefix}-${num}`;
  }
}
