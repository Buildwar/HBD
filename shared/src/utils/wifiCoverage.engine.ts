/**
 * HBD — HOME BOARD DESIGNER
 * Wi-Fi Coverage & RF Heatmap Simulation Engine (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  TechnicalElementDto,
  WiFiCoverageAnalysisDto,
  WiFiHeatmapPointDto
} from '../types/technicalInfrastructure.types.js';

export interface WallObstacle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  attenuationDb: number; // Ej. 12 dB para hormigón, 6 dB para ladrillo, 3 dB para pladur
}

export class WiFiCoverageEngine {
  /**
   * Genera un mapa de calor y análisis de cobertura Wi-Fi en base a los puntos de acceso existentes
   */
  public static simulateCoverage(
    elements: TechnicalElementDto[],
    projectId: string,
    floorBounds: { minX: number; minY: number; maxX: number; maxY: number },
    walls: WallObstacle[] = [],
    gridResolutionMeters: number = 0.5
  ): WiFiCoverageAnalysisDto {
    const accessPoints = elements.filter(
      (e) => e.category === 'WIFI' || (e.category === 'NETWORK' && e.name.toLowerCase().includes('ap'))
    );

    const width = Math.max(1, floorBounds.maxX - floorBounds.minX);
    const height = Math.max(1, floorBounds.maxY - floorBounds.minY);
    const totalAreaM2 = Math.round(width * height * 10) / 10;

    const heatmapPoints: WiFiHeatmapPointDto[] = [];
    let coveredPointsCount = 0;
    let deadZonesCount = 0;

    // Si no hay APs, retornar resultado vacío con advertencia
    if (accessPoints.length === 0) {
      return {
        projectId,
        gridResolutionMeters,
        totalAreaM2,
        coveredAreaM2: 0,
        coveragePercentage: 0,
        heatmapPoints: [],
        deadZonesCount: Math.ceil(totalAreaM2 / (gridResolutionMeters * gridResolutionMeters)),
        accessPointsCount: 0,
        recommendations: [
          'No se han detectado puntos de acceso Wi-Fi. Se recomienda añadir al menos 1 AP central por cada 70 m².'
        ]
      };
    }

    // Muestreo por cuadrícula
    for (let x = floorBounds.minX; x <= floorBounds.maxX; x += gridResolutionMeters) {
      for (let y = floorBounds.minY; y <= floorBounds.maxY; y += gridResolutionMeters) {
        let maxRssi = -100;
        let bestApId: string | undefined = undefined;

        for (const ap of accessPoints) {
          const apX = ap.position.x;
          const apY = ap.position.y;
          const dist = Math.max(0.2, Math.sqrt((x - apX) ** 2 + (y - apY) ** 2));

          // Potencia de emisión base (típicamente 20 dBm en 2.4/5GHz doméstico)
          const txPowerDbm = ap.rfPowerDbm ?? 20;

          // Modelo de propagación en espacio libre (FSPL) simplificado a 5GHz:
          // PathLoss(dist) = 20*log10(dist) + 20*log10(5000MHz) - 27.55
          // A 1m ~ 46dB de pérdida
          const pathLoss = 40 + 25 * Math.log10(dist);

          // Atenuación adicional por muros cruzados
          const wallLoss = this.calculateWallObstacleLoss(apX, apY, x, y, walls);

          const rssi = Math.round(txPowerDbm - pathLoss - wallLoss);

          if (rssi > maxRssi) {
            maxRssi = rssi;
            bestApId = ap.id;
          }
        }

        const quality = this.getSignalQuality(maxRssi);
        if (quality !== 'NO_SIGNAL' && quality !== 'POOR') {
          coveredPointsCount++;
        } else {
          deadZonesCount++;
        }

        heatmapPoints.push({
          x: Math.round(x * 100) / 100,
          y: Math.round(y * 100) / 100,
          rssiDbm: maxRssi,
          signalQuality: quality,
          connectedApId: bestApId
        });
      }
    }

    const totalPoints = heatmapPoints.length || 1;
    const coveragePercentage = Math.round((coveredPointsCount / totalPoints) * 100);
    const coveredAreaM2 = Math.round(((totalAreaM2 * coveragePercentage) / 100) * 10) / 10;

    const recommendations: string[] = [];
    if (coveragePercentage < 80) {
      recommendations.push(`La cobertura Wi-Fi actual es del ${coveragePercentage}%. Se detectan zonas muertas importantes.`);
      recommendations.push('Añadir un Punto de Acceso adicional en la zona más alejada del AP principal.');
    }
    if (accessPoints.length === 1 && totalAreaM2 > 90) {
      recommendations.push('Para viviendas de más de 90 m² se recomienda un sistema Mesh con al menos 2 nodos interconectados por Ethernet.');
    }

    return {
      projectId,
      gridResolutionMeters,
      totalAreaM2,
      coveredAreaM2,
      coveragePercentage,
      heatmapPoints,
      deadZonesCount,
      accessPointsCount: accessPoints.length,
      recommendations
    };
  }

  private static calculateWallObstacleLoss(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    walls: WallObstacle[]
  ): number {
    let totalWallLoss = 0;
    for (const w of walls) {
      if (this.linesIntersect(x1, y1, x2, y2, w.x1, w.y1, w.x2, w.y2)) {
        totalWallLoss += w.attenuationDb;
      }
    }
    return totalWallLoss;
  }

  private static linesIntersect(
    a1: number, b1: number, a2: number, b2: number,
    c1: number, d1: number, c2: number, d2: number
  ): boolean {
    const denom = (b2 - b1) * (c2 - c1) - (a2 - a1) * (d2 - d1);
    if (denom === 0) return false;
    const ua = ((a2 - a1) * (d1 - b1) - (b2 - b1) * (c1 - a1)) / denom;
    const ub = ((c2 - c1) * (d1 - b1) - (d2 - d1) * (c1 - a1)) / denom;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  public static getSignalQuality(rssi: number): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NO_SIGNAL' {
    if (rssi >= -55) return 'EXCELLENT';
    if (rssi >= -67) return 'GOOD';
    if (rssi >= -75) return 'FAIR';
    if (rssi >= -85) return 'POOR';
    return 'NO_SIGNAL';
  }
}
