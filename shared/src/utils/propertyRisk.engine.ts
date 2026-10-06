/**
 * Property Risk & Assessment Engine (Phase V23 / v1.23.0)
 * Evaluates structural, electrical, moisture, and financial risks, enforcing professional review flags.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  PropertyCondition,
  PropertyDto,
  PropertyRiskItem,
  RiskCategory,
  RiskSeverity,
} from '../types/propertyIntelligence.types';

export class PropertyRiskEngine {
  /**
   * Evaluates potential risks in a property based on age, condition, and technical systems.
   */
  static evaluateRisks(
    property: Partial<PropertyDto>,
    options?: {
      hasTechnicalViolations?: boolean;
      hasUncheckedLoadBearingWalls?: boolean;
      hasMoistureSigns?: boolean;
    }
  ): PropertyRiskItem[] {
    const risks: PropertyRiskItem[] = [];
    const propId = property.id || 'prop_temp';

    // 1. Electrical installation age risk
    if (property.constructionYear && property.constructionYear < 2002 && (!property.renovationYear || property.renovationYear < 2002)) {
      risks.push({
        id: `risk_elec_${Date.now()}_1`,
        propertyId: propId,
        title: 'Instalación Eléctrica Previa al REBT 2002',
        description: 'La instalación eléctrica original puede carecer de circuitos diferenciados por usos o protecciones diferenciales modernas. Requiere revisión técnica profesional.',
        category: 'ELECTRICAL',
        severity: 'MEDIUM',
        isPotential: true,
        requiresProfessionalReview: true,
        mitigationSuggestion: 'Inspección reglamentaria por instalador electricista autorizado y actualización de cuadro general (V21).',
        source: 'AI_ESTIMATED',
        confidence: 'ESTIMATED',
        status: 'OPEN',
      });
    }

    // 2. Structural / Load bearing partition risk
    if (options?.hasUncheckedLoadBearingWalls) {
      risks.push({
        id: `risk_struct_${Date.now()}_2`,
        propertyId: propId,
        title: 'Posible Afección a Elementos Estructurales',
        description: 'La redistribución espacial propuesta podría afectar a muros de carga o pilares maestros. Es imprescindible contar con un proyecto técnico visado.',
        category: 'STRUCTURAL',
        severity: 'CRITICAL',
        isPotential: true,
        requiresProfessionalReview: true,
        mitigationSuggestion: 'Verificación in situ por arquitecto o aparejador colegiado antes del derribo de tabiquería.',
        source: 'AI_ESTIMATED',
        confidence: 'ESTIMATED',
        status: 'OPEN',
      });
    }

    // 3. Wet zone / Moisture risk
    if (options?.hasMoistureSigns || property.condition === 'FULL_RENOVATION' || property.condition === 'NEEDS_UPDATE') {
      risks.push({
        id: `risk_moist_${Date.now()}_3`,
        propertyId: propId,
        title: 'Riesgo de Filtración o Condensación en Zonas Húmedas',
        description: 'Se recomienda verificar la impermeabilización de duchas y el aislamiento en puentes térmicos exteriores para prevenir humedades.',
        category: 'MOISTURE',
        severity: 'MEDIUM',
        isPotential: true,
        requiresProfessionalReview: true,
        mitigationSuggestion: 'Aplicación de láminas impermeabilizantes y sellado elástico en encuentros de solados y alicatados.',
        source: 'AI_ESTIMATED',
        confidence: 'ESTIMATED',
        status: 'OPEN',
      });
    }

    // 4. Regulatory violation from V21 technical rules
    if (options?.hasTechnicalViolations) {
      risks.push({
        id: `risk_tech_${Date.now()}_4`,
        propertyId: propId,
        title: 'Infracción Normativa Técnica Detectada (V21)',
        description: 'Existen tomas o elementos eléctricos situados en volúmenes prohibidos de zonas húmedas (REBT ITC-BT-27).',
        category: 'ELECTRICAL',
        severity: 'HIGH',
        isPotential: false,
        requiresProfessionalReview: true,
        mitigationSuggestion: 'Reubicar tomas de corriente fuera del volumen de prohibición (0.6m desde el borde de bañera/ducha).',
        source: 'CALCULATED',
        confidence: 'CONFIRMED',
        status: 'OPEN',
      });
    }

    return risks;
  }
}
