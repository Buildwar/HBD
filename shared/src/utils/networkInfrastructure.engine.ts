/**
 * HBD — HOME BOARD DESIGNER
 * Network Infrastructure & PoE Budget Engine (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  TechnicalElementDto,
  NetworkPortSummaryDto
} from '../types/technicalInfrastructure.types.js';

export class NetworkInfrastructureEngine {
  /**
   * Calcula el resumen de puertos de red, dispositivos PoE y presupuestos de energía
   */
  public static calculateNetworkSummary(
    elements: TechnicalElementDto[],
    projectId: string
  ): NetworkPortSummaryDto {
    let totalDataOutlets = 0;
    let totalPoeDevices = 0;
    let totalPoePowerWatts = 0;
    let fiberEndpointsCount = 0;

    for (const elem of elements) {
      if (elem.category === 'NETWORK') {
        totalDataOutlets++;
        if (elem.protocol === 'MATTER' || elem.name.toLowerCase().includes('fibra') || elem.name.toLowerCase().includes('ont')) {
          fiberEndpointsCount++;
        }
      }

      // Dispositivos que pueden ser PoE (APs Wi-Fi, cámaras de seguridad, intercomunicadores)
      if (elem.poePowered || elem.category === 'WIFI' || (elem.category === 'SECURITY' && elem.mountingType !== 'OUTDOOR')) {
        totalPoeDevices++;
        const watts = elem.powerWatts || this.getDefaultPoeWatts(elem.poeClass);
        totalPoePowerWatts += watts;
      }
    }

    // Calcular switch recomendado: 8, 16, 24 o 48 puertos con un 25% de margen de crecimiento
    const requiredPorts = totalDataOutlets + totalPoeDevices;
    const recommendedSwitchPorts = this.getRecommendedSwitchPortCount(requiredPorts * 1.25);

    // Presupuesto PoE recomendado con factor de seguridad del 20%
    const recommendedPoeBudgetWatts = Math.ceil(totalPoePowerWatts * 1.2);

    return {
      projectId,
      totalDataOutlets,
      totalPoeDevices,
      totalPoePowerWatts,
      recommendedSwitchPorts,
      recommendedPoeBudgetWatts,
      fiberEndpointsCount
    };
  }

  public static getDefaultPoeWatts(poeClass?: string | null): number {
    if (!poeClass) return 15.4; // 802.3af Class 3 estándar
    if (poeClass.includes('bt') || poeClass.includes('PoE++')) return 60.0;
    if (poeClass.includes('at') || poeClass.includes('PoE+')) return 30.0;
    return 15.4;
  }

  private static getRecommendedSwitchPortCount(portsNeeded: number): number {
    if (portsNeeded <= 8) return 8;
    if (portsNeeded <= 16) return 16;
    if (portsNeeded <= 24) return 24;
    return 48;
  }
}
