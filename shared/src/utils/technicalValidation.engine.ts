/**
 * HBD — HOME BOARD DESIGNER
 * Technical Infrastructure Regulatory & Spatial Validation Engine (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  TechnicalElementDto,
  TechnicalConnectionDto,
  TechnicalZoneDto,
  TechnicalValidationResultDto,
  TechnicalIssueDto
} from '../types/technicalInfrastructure.types.js';

export class TechnicalValidationEngine {
  /**
   * Ejecuta la batería completa de validaciones técnicas, normativas y espaciales
   */
  public static validateInfrastructure(
    elements: TechnicalElementDto[],
    connections: TechnicalConnectionDto[] = [],
    zones: TechnicalZoneDto[] = []
  ): TechnicalValidationResultDto {
    const issues: TechnicalIssueDto[] = [];

    // 1. Validar distancias de seguridad entre tomas eléctricas y puntos de agua (REBT ITC-BT-27)
    this.validateWaterElectricalDistances(elements, issues);

    // 2. Validar cotas y alturas ergonómicas
    this.validateErgonomicHeights(elements, issues);

    // 3. Validar dependencias obligatorias (Alimentación PoE, circuitos)
    this.validateDependencies(elements, connections, issues);

    // 4. Validar sobrecargas y capacidades de zonas / cuadros
    this.validateZonesCapacity(zones, elements, issues);

    // Calcular puntuación y estado de validez
    const errorsCount = issues.filter((i) => i.severity === 'ERROR').length;
    const warningsCount = issues.filter((i) => i.severity === 'WARNING').length;
    const infosCount = issues.filter((i) => i.severity === 'INFO').length;

    // Fórmula de puntuación sobre 100
    const score = Math.max(0, Math.round(100 - errorsCount * 25 - warningsCount * 8 - infosCount * 2));
    const isValid = errorsCount === 0;

    return {
      isValid,
      score,
      totalElements: elements.length,
      totalConnections: connections.length,
      totalZones: zones.length,
      errorsCount,
      warningsCount,
      infosCount,
      issues,
      validatedAt: new Date().toISOString()
    };
  }

  private static validateWaterElectricalDistances(
    elements: TechnicalElementDto[],
    issues: TechnicalIssueDto[]
  ): void {
    const electricals = elements.filter(
      (e) => e.category === 'ELECTRICAL' || e.category === 'LIGHTING'
    );
    const waters = elements.filter((e) => e.category === 'PLUMBING');

    for (const el of electricals) {
      for (const w of waters) {
        const dist = Math.sqrt(
          (el.position.x - w.position.x) ** 2 +
          (el.position.y - w.position.y) ** 2
        );

        // Distancia mínima de 0.50m entre enchufes estándar y tomas de agua
        if (dist < 0.50 && (!el.ipRating || (!el.ipRating.includes('44') && !el.ipRating.includes('65')))) {
          issues.push({
            ruleCode: 'REBT-VOL-WET',
            ruleName: 'Distancia de seguridad a punto de agua',
            severity: 'ERROR',
            elementId: el.id,
            elementCode: el.code || el.name,
            relatedElementId: w.id,
            message: `El mecanismo eléctrico ${el.code || el.name} está a solo ${(dist * 100).toFixed(0)}cm de un punto de agua (${w.code || w.name}) sin protección IP44+.`,
            recommendation: 'Desplazar el enchufe a un mínimo de 50 cm del grifo o instalar mecanismo estanco IP44/IP55.',
            standardReference: 'REBT ITC-BT-27 Volumen de Prohibición'
          });
        }
      }
    }
  }

  private static validateErgonomicHeights(
    elements: TechnicalElementDto[],
    issues: TechnicalIssueDto[]
  ): void {
    for (const el of elements) {
      const z = el.position.z;

      // Mecanismos de mando / interruptores: altura recomendada 0.80m a 1.20m (ideal 1.00m)
      if (el.category === 'LIGHTING' && el.name.toLowerCase().includes('interruptor')) {
        if (z < 0.70 || z > 1.30) {
          issues.push({
            ruleCode: 'ERG-HEIGHT-SW',
            ruleName: 'Altura de mecanismo de encendido fuera de rango ergonómico',
            severity: 'WARNING',
            elementId: el.id,
            elementCode: el.code || el.name,
            message: `El interruptor ${el.code || el.name} está instalado a cota Z=${z.toFixed(2)}m (rango estándar: 0.90m - 1.10m).`,
            recommendation: 'Ajustar la cota de montaje a 1.00 m sobre suelo terminado para accesibilidad universal.',
            standardReference: 'CTE DB-SUA / Accesibilidad'
          });
        }
      }

      // Termostatos: altura recomendada 1.40m a 1.60m (ideal 1.50m lejos de fuentes de calor)
      if (el.category === 'HVAC' && el.name.toLowerCase().includes('termostato')) {
        if (z < 1.30 || z > 1.70) {
          issues.push({
            ruleCode: 'ERG-HEIGHT-TH',
            ruleName: 'Cota de termostato inadecuada para medición térmica',
            severity: 'WARNING',
            elementId: el.id,
            elementCode: el.code || el.name,
            message: `El termostato ${el.code || el.name} está a cota Z=${z.toFixed(2)}m.`,
            recommendation: 'Ubicar el termostato a 1.50 m del suelo para lectura térmica representativa.',
            standardReference: 'RITE IT 1.3.4.1.2'
          });
        }
      }
    }
  }

  private static validateDependencies(
    elements: TechnicalElementDto[],
    connections: TechnicalConnectionDto[],
    issues: TechnicalIssueDto[]
  ): void {
    const connectedElementIds = new Set<string>();
    for (const c of connections) {
      if (c.fromElementId) connectedElementIds.add(c.fromElementId);
      if (c.toElementId) connectedElementIds.add(c.toElementId);
    }

    for (const el of elements) {
      // Si es un AP o cámara PoE y no tiene conexión registrada ni cable
      if (el.poePowered && !connectedElementIds.has(el.id)) {
        issues.push({
          ruleCode: 'NET-POE-UNCONNECTED',
          ruleName: 'Dispositivo PoE sin canalización ni enlace de datos',
          severity: 'INFO',
          elementId: el.id,
          elementCode: el.code || el.name,
          message: `El equipo PoE ${el.code || el.name} no tiene cable de red UTP asignado en el trazado.`,
          recommendation: 'Trazar canalización o enlace Ethernet hasta el rack o switch más cercano.',
          standardReference: 'ICT-2 Infraestructuras Comunes de Telecomunicaciones'
        });
      }
    }
  }

  private static validateZonesCapacity(
    zones: TechnicalZoneDto[],
    elements: TechnicalElementDto[],
    issues: TechnicalIssueDto[]
  ): void {
    for (const z of zones) {
      if (z.zoneType === 'ELECTRICAL_PANEL' && z.capacityUnits) {
        // Estimar módulos DIN ocupados (aprox 2 módulos por circuito)
        const circuits = new Set(elements.map((e) => e.circuitId).filter(Boolean)).size;
        const requiredUnits = circuits * 2 + 4; // ICP/IGA + Dif + Circuitos
        if (requiredUnits > z.capacityUnits) {
          issues.push({
            ruleCode: 'PANEL-OVERCAPACITY',
            ruleName: 'Capacidad insuficiente en cuadro eléctrico',
            severity: 'WARNING',
            elementId: z.id,
            elementCode: z.code || z.name,
            message: `El cuadro ${z.code || z.name} tiene capacidad para ${z.capacityUnits} módulos DIN pero se requieren aprox. ${requiredUnits} módulos.`,
            recommendation: 'Aumentar las dimensiones del cuadro a un modelo de mayor capacidad (ej. 24 o 36 módulos).',
            standardReference: 'REBT ITC-BT-17'
          });
        }
      }
    }
  }
}
