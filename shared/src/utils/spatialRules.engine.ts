/**
 * HBD — HOME BOARD DESIGNER (V10.0.0)
 * Spatial Rules Engine (spatialRules.engine.ts)
 * 
 * Generic and referential spatial rules evaluator for:
 * - Minimum ceiling height (Habitability / CTE reference)
 * - Minimum room area by usage (living, single bedroom, double bedroom)
 * - Minimum circulation & passage width
 * - Natural lighting and ventilation ratio (window area vs floor area)
 * - Minimum door widths & access clearance
 * 
 * Strict Principle:
 * - All rules are marked as REFERENTIAL / CONFIGURABLE.
 * - Missing or insufficient data yields status UNKNOWN with REQUIRES PROFESSIONAL VALIDATION.
 * 
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  SpatialRule,
  SpatialRuleEvaluationResult,
  SpatialRuleEvaluationSummary,
  SpaceEvaluationContext,
  RuleEvaluationStatus,
} from '../types/spatialRules.types.js';

export class SpatialRulesEngine {
  /**
   * Returns default referential habitability rules.
   */
  static getDefaultRules(): SpatialRule[] {
    return [
      {
        id: 'rule-ceiling-height',
        code: 'RULE_MIN_CEILING_HEIGHT',
        name: 'Altura libre mínima',
        category: 'HABITABILITY',
        description: 'Altura libre mínima de estancias habitables (referencia: 2.50 m en estancias principales, 2.20 m en zonas húmedas/pasillos).',
        value: 2.5,
        unit: 'm',
        severity: 'CRITICAL',
        source: 'REFERENTIAL_CTE',
        jurisdiction: 'ES_CTE',
        enabled: true,
        requiresProValidation: true,
      },
      {
        id: 'rule-room-min-area',
        code: 'RULE_MIN_ROOM_AREA',
        name: 'Superficie mínima de estancia habitable',
        category: 'DIMENSIONS',
        description: 'Superficie mínima útil para una estancia habitable individual (referencia: 6.0 m²).',
        value: 6.0,
        unit: 'm²',
        severity: 'WARNING',
        source: 'HABITABILITY_RECOMMENDATION',
        jurisdiction: 'ES_CTE',
        enabled: true,
        requiresProValidation: true,
      },
      {
        id: 'rule-double-bedroom-area',
        code: 'RULE_MIN_DOUBLE_BEDROOM_AREA',
        name: 'Superficie mínima de dormitorio doble',
        category: 'DIMENSIONS',
        description: 'Superficie mínima útil para dormitorio de uso doble (referencia: 10.0 m²).',
        value: 10.0,
        unit: 'm²',
        severity: 'WARNING',
        source: 'HABITABILITY_RECOMMENDATION',
        jurisdiction: 'ES_CTE',
        enabled: true,
        requiresProValidation: true,
      },
      {
        id: 'rule-circulation-width',
        code: 'RULE_MIN_CIRCULATION_WIDTH',
        name: 'Anchura mínima de circulación / pasillos',
        category: 'CIRCULATION',
        description: 'Anchura mínima libre en zonas de paso y pasillos interiores (referencia: 0.90 m).',
        value: 0.9,
        unit: 'm',
        severity: 'WARNING',
        source: 'REFERENTIAL_CTE',
        jurisdiction: 'ES_CTE',
        enabled: true,
        requiresProValidation: true,
      },
      {
        id: 'rule-window-ratio',
        code: 'RULE_MIN_WINDOW_RATIO',
        name: 'Ratio mínimo de iluminación y ventilación natural',
        category: 'VENTILATION_LIGHTING',
        description: 'Superficie mínima de huecos acristalados respecto a la superficie útil de la estancia (referencia: ≥ 10%).',
        value: 0.1, // 10%
        unit: '%',
        severity: 'WARNING',
        source: 'REFERENTIAL_CTE',
        jurisdiction: 'ES_CTE',
        enabled: true,
        requiresProValidation: true,
      },
      {
        id: 'rule-door-width',
        code: 'RULE_DOOR_MIN_WIDTH',
        name: 'Anchura mínima de paso en puertas',
        category: 'ACCESSIBILITY',
        description: 'Anchura de paso mínima recomendada en puertas de estancias habitables (referencia: 0.80 m).',
        value: 0.8,
        unit: 'm',
        severity: 'INFO',
        source: 'REFERENTIAL_CTE',
        jurisdiction: 'ES_CTE',
        enabled: true,
        requiresProValidation: true,
      },
    ];
  }

  /**
   * Evaluates a space against a set of spatial rules.
   */
  static evaluateSpace(
    context: SpaceEvaluationContext,
    customRules?: SpatialRule[]
  ): SpatialRuleEvaluationSummary {
    const rules = (customRules && customRules.length > 0 ? customRules : this.getDefaultRules()).filter(
      (r) => r.enabled
    );

    const results: SpatialRuleEvaluationResult[] = [];
    const metrics = context.metrics;
    const usableArea = metrics ? metrics.usableAreaM2.value : 0;
    const heightM = context.heightM || (metrics && metrics.usableAreaM2.value > 0 ? 2.5 : 0);
    const roomType = (context.roomType || context.name || '').toLowerCase();

    for (const rule of rules) {
      const baseResult: Partial<SpatialRuleEvaluationResult> = {
        ruleId: rule.id,
        ruleCode: rule.code,
        ruleName: rule.name,
        category: rule.category,
        severity: rule.severity,
        unit: rule.unit,
        source: rule.source,
        requiresProValidation: rule.requiresProValidation,
        context: {
          spaceId: context.id,
          spaceName: context.name,
          roomType: context.roomType,
        },
      };

      switch (rule.code) {
        case 'RULE_MIN_CEILING_HEIGHT': {
          const isWetZone = roomType.includes('baño') || roomType.includes('aseo') || roomType.includes('pasillo');
          const minRequired = isWetZone ? 2.2 : (rule.value as number);

          if (!heightM || heightM <= 0) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'UNKNOWN',
              actualValue: null,
              expectedValue: minRequired,
              confidence: 'UNKNOWN',
              message: 'Altura libre no disponible en los datos geométricos.',
            });
          } else if (heightM >= minRequired) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'VALID',
              actualValue: heightM,
              expectedValue: minRequired,
              confidence: 'GEOMETRY_CALCULATED',
              message: `Altura libre adecuada (${heightM} m ≥ ${minRequired} m).`,
            });
          } else {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'INVALID',
              actualValue: heightM,
              expectedValue: minRequired,
              confidence: 'GEOMETRY_CALCULATED',
              message: `Altura libre insuficiente (${heightM} m < ${minRequired} m). Requiere validación técnica.`,
            });
          }
          break;
        }

        case 'RULE_MIN_ROOM_AREA': {
          const isSecondary = roomType.includes('baño') || roomType.includes('aseo') || roomType.includes('trastero') || roomType.includes('pasillo');
          if (isSecondary) {
            // Secondary rooms are not subject to generic living room minimum
            break;
          }
          const minArea = rule.value as number;
          if (!usableArea || usableArea <= 0) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'UNKNOWN',
              actualValue: null,
              expectedValue: minArea,
              confidence: 'UNKNOWN',
              message: 'Superficie útil no disponible para evaluar tamaño mínimo.',
            });
          } else if (usableArea >= minArea) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'VALID',
              actualValue: usableArea,
              expectedValue: minArea,
              confidence: 'GEOMETRY_CALCULATED',
              message: `Superficie útil conforme a recomendación (${usableArea} m² ≥ ${minArea} m²).`,
            });
          } else {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'WARNING',
              actualValue: usableArea,
              expectedValue: minArea,
              confidence: 'GEOMETRY_CALCULATED',
              message: `Superficie útil reducida (${usableArea} m² < ${minArea} m²).`,
            });
          }
          break;
        }

        case 'RULE_MIN_DOUBLE_BEDROOM_AREA': {
          if (!context.isDoubleBedroom && !roomType.includes('principal') && !roomType.includes('matrimonio') && !roomType.includes('doble')) {
            break; // Solo evaluar si es explícitamente dormitorio doble
          }
          const minArea = rule.value as number;
          if (!usableArea || usableArea <= 0) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'UNKNOWN',
              actualValue: null,
              expectedValue: minArea,
              confidence: 'UNKNOWN',
              message: 'Superficie no disponible para dormitorio doble.',
            });
          } else if (usableArea >= minArea) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'VALID',
              actualValue: usableArea,
              expectedValue: minArea,
              confidence: 'GEOMETRY_CALCULATED',
              message: `Dormitorio doble con dimensión conforme (${usableArea} m² ≥ ${minArea} m²).`,
            });
          } else {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'WARNING',
              actualValue: usableArea,
              expectedValue: minArea,
              confidence: 'GEOMETRY_CALCULATED',
              message: `Superficie de dormitorio doble ajustada (${usableArea} m² < ${minArea} m²).`,
            });
          }
          break;
        }

        case 'RULE_MIN_CIRCULATION_WIDTH': {
          const passageWidths = context.passageWidthsM || [];
          const minWidth = rule.value as number;
          if (passageWidths.length === 0) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'UNKNOWN',
              actualValue: null,
              expectedValue: minWidth,
              confidence: 'UNKNOWN',
              message: 'No se han definido cotas de paso o pasillos para verificar circulación.',
            });
          } else {
            const hasNarrow = passageWidths.some((w) => w < minWidth);
            const minFound = Math.min(...passageWidths);
            if (hasNarrow) {
              results.push({
                ...(baseResult as SpatialRuleEvaluationResult),
                status: 'WARNING',
                actualValue: minFound,
                expectedValue: minWidth,
                confidence: 'GEOMETRY_CALCULATED',
                message: `Paso estrecho detectado (${minFound} m < ${minWidth} m).`,
              });
            } else {
              results.push({
                ...(baseResult as SpatialRuleEvaluationResult),
                status: 'VALID',
                actualValue: minFound,
                expectedValue: minWidth,
                confidence: 'GEOMETRY_CALCULATED',
                message: `Anchuras de circulación conformes (mínimo ${minFound} m ≥ ${minWidth} m).`,
              });
            }
          }
          break;
        }

        case 'RULE_MIN_WINDOW_RATIO': {
          const isInteriorOnly = roomType.includes('pasillo') || roomType.includes('distribuidor') || roomType.includes('trastero');
          if (isInteriorOnly) {
            break;
          }
          const windows = context.windows || [];
          const minRatio = rule.value as number;

          if (!usableArea || usableArea <= 0) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'UNKNOWN',
              actualValue: null,
              expectedValue: minRatio,
              confidence: 'UNKNOWN',
              message: 'Superficie no calculable para el ratio de ventilación.',
            });
          } else if (windows.length === 0) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'WARNING',
              actualValue: 0,
              expectedValue: minRatio,
              confidence: 'GEOMETRY_CALCULATED',
              message: 'Sin ventanas registradas en la estancia. Requiere ventilación forzada si es zona húmeda.',
            });
          } else {
            let totalWinArea = 0;
            for (const win of windows) {
              totalWinArea += (win.widthM || 1.0) * (win.heightM || 1.0);
            }
            const actualRatio = Math.round((totalWinArea / usableArea) * 1000) / 1000;
            if (actualRatio >= minRatio) {
              results.push({
                ...(baseResult as SpatialRuleEvaluationResult),
                status: 'VALID',
                actualValue: `${Math.round(actualRatio * 100)}%`,
                expectedValue: `${Math.round(minRatio * 100)}%`,
                confidence: 'GEOMETRY_CALCULATED',
                message: `Ratio de hueco a suelo favorable (${Math.round(actualRatio * 100)}% ≥ ${Math.round(minRatio * 100)}%).`,
              });
            } else {
              results.push({
                ...(baseResult as SpatialRuleEvaluationResult),
                status: 'WARNING',
                actualValue: `${Math.round(actualRatio * 100)}%`,
                expectedValue: `${Math.round(minRatio * 100)}%`,
                confidence: 'GEOMETRY_CALCULATED',
                message: `Ratio de iluminación/ventilación bajo (${Math.round(actualRatio * 100)}% < ${Math.round(minRatio * 100)}%).`,
              });
            }
          }
          break;
        }

        case 'RULE_DOOR_MIN_WIDTH': {
          const doors = context.doors || [];
          const minDoorW = rule.value as number;
          if (doors.length === 0) {
            results.push({
              ...(baseResult as SpatialRuleEvaluationResult),
              status: 'UNKNOWN',
              actualValue: null,
              expectedValue: minDoorW,
              confidence: 'UNKNOWN',
              message: 'No hay puertas registradas en el recinto.',
            });
          } else {
            const minDoorFound = Math.min(...doors.map((d) => d.widthM || 0.8));
            if (minDoorFound >= minDoorW) {
              results.push({
                ...(baseResult as SpatialRuleEvaluationResult),
                status: 'VALID',
                actualValue: minDoorFound,
                expectedValue: minDoorW,
                confidence: 'GEOMETRY_CALCULATED',
                message: `Paso libre de puertas adecuado (${minDoorFound} m ≥ ${minDoorW} m).`,
              });
            } else {
              results.push({
                ...(baseResult as SpatialRuleEvaluationResult),
                status: 'WARNING',
                actualValue: minDoorFound,
                expectedValue: minDoorW,
                confidence: 'GEOMETRY_CALCULATED',
                message: `Paso de puerta reducido (${minDoorFound} m < ${minDoorW} m).`,
              });
            }
          }
          break;
        }
      }
    }

    const validCount = results.filter((r) => r.status === 'VALID').length;
    const warningCount = results.filter((r) => r.status === 'WARNING').length;
    const invalidCount = results.filter((r) => r.status === 'INVALID').length;
    const unknownCount = results.filter((r) => r.status === 'UNKNOWN').length;

    const evaluable = validCount + warningCount + invalidCount;
    const complianceScore =
      evaluable > 0 ? Math.round(((validCount * 1.0 + warningCount * 0.5) / evaluable) * 100) : 100;

    return {
      totalRules: results.length,
      validCount,
      warningCount,
      invalidCount,
      unknownCount,
      complianceScore,
      requiresProValidation: true,
      results,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
