/**
 * HBD — HOME BOARD DESIGNER
 * Smart Home & Domotics Mesh Topology Engine (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  TechnicalElementDto,
  TechnicalProtocol
} from '../types/technicalInfrastructure.types.js';

export interface SmartHomeTopologyReport {
  totalSmartDevices: number;
  byProtocol: Record<string, number>;
  hubFound: boolean;
  hubProtocols: TechnicalProtocol[];
  orphanedDevicesCount: number;
  orphanedDeviceCodes: string[];
  recommendations: string[];
}

export class SmartHomeEngine {
  /**
   * Analiza la topología domótica y detecta dispositivos huérfanos o incompatibilidades de protocolo
   */
  public static analyzeTopology(elements: TechnicalElementDto[]): SmartHomeTopologyReport {
    const smartElements = elements.filter(
      (e) =>
        e.category === 'SMART_HOME' ||
        (e.protocol && e.protocol !== 'HARDWIRED' && e.protocol !== 'ANALOG')
    );

    const byProtocol: Record<string, number> = {};
    const hubProtocols: TechnicalProtocol[] = [];
    let hubFound = false;

    // Detectar pasarelas / hubs
    for (const elem of elements) {
      const isHub =
        elem.name.toLowerCase().includes('hub') ||
        elem.name.toLowerCase().includes('pasarela') ||
        elem.name.toLowerCase().includes('gateway') ||
        elem.name.toLowerCase().includes('bridge');

      if (isHub && elem.protocol) {
        hubFound = true;
        if (!hubProtocols.includes(elem.protocol)) {
          hubProtocols.push(elem.protocol);
        }
      }
    }

    const orphanedDeviceCodes: string[] = [];

    for (const el of smartElements) {
      const proto = el.protocol || 'WIFI';
      byProtocol[proto] = (byProtocol[proto] || 0) + 1;

      // Protocolos que requieren Hub / Gateway obligatoriamente (Zigbee, Z-Wave, Thread sin border router)
      if ((proto === 'ZIGBEE' || proto === 'ZWAVE') && !hubProtocols.includes(proto)) {
        orphanedDeviceCodes.push(el.code || el.name);
      }
    }

    const recommendations: string[] = [];
    if (orphanedDeviceCodes.length > 0) {
      recommendations.push(
        `Se han detectado ${orphanedDeviceCodes.length} dispositivos Zigbee/Z-Wave sin pasarela o coordinador compatible en el proyecto.`
      );
    }
    if (byProtocol['MATTER'] && !byProtocol['THREAD'] && !byProtocol['WIFI']) {
      recommendations.push('Los dispositivos Matter requieren un Border Router Thread o conectividad Wi-Fi.');
    }

    return {
      totalSmartDevices: smartElements.length,
      byProtocol,
      hubFound,
      hubProtocols,
      orphanedDevicesCount: orphanedDeviceCodes.length,
      orphanedDeviceCodes,
      recommendations
    };
  }
}
