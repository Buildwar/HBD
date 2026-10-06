/**
 * Property Improvement Opportunity Engine (Phase V23 / v1.23.0)
 * Evaluates architectural, technical, functional, and energy optimization opportunities.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ImprovementCategory,
  ImprovementPriority,
  PropertyDto,
  PropertyOpportunityItem,
  PropertySpatialSummary,
} from '../types/propertyIntelligence.types';

export class PropertyOpportunityEngine {
  /**
   * Generates tailored improvement opportunities for a given property and spatial layout.
   */
  static detectOpportunities(
    property: Partial<PropertyDto>,
    spatial?: Partial<PropertySpatialSummary>,
    options?: { existingSmartHome?: boolean; existingHvac?: boolean }
  ): PropertyOpportunityItem[] {
    const opportunities: PropertyOpportunityItem[] = [];
    const propId = property.id || 'prop_temp';

    // 1. Storage Optimization Check
    const storageRatio = spatial && spatial.totalUsableSurfaceM2 && spatial.storageSurfaceM2
      ? spatial.storageSurfaceM2 / spatial.totalUsableSurfaceM2
      : 0;

    if (storageRatio < 0.05) {
      opportunities.push({
        id: `opp_storage_${Date.now()}_1`,
        propertyId: propId,
        title: 'Optimización de Almacenamiento Empotrado',
        description: 'La superficie destinada a almacenaje es inferior al 5% de la superficie útil. Se recomienda integrar armarios a medida en pasillos o bajo ventanas.',
        category: 'STORAGE',
        priority: 'MEDIUM',
        estimatedCostEur: 1800,
        impactScore: 78,
        potentialSavingsEur: 350,
        source: 'AI_ESTIMATED',
        confidence: 'ESTIMATED',
        status: 'IDENTIFIED',
      });
    }

    // 2. Open Concept Kitchen / Living Check
    const hasKitchenLivingAdjacency = spatial?.adjacencies?.some(
      (a) =>
        (a.fromRoomName.toLowerCase().includes('cocina') && a.toRoomName.toLowerCase().includes('salón')) ||
        (a.fromRoomName.toLowerCase().includes('salón') && a.toRoomName.toLowerCase().includes('cocina'))
    );

    if (hasKitchenLivingAdjacency) {
      opportunities.push({
        id: `opp_openconcept_${Date.now()}_2`,
        propertyId: propId,
        title: 'Apertura Cocina-Salón en Concepto Abierto',
        description: 'La cocina y el salón comparten tabiquería. Abrir un pasaplatos o concepto continuo aumentará la luminosidad y sensación de amplitud.',
        category: 'OPEN_CONCEPT',
        priority: 'HIGH',
        estimatedCostEur: 3200,
        impactScore: 88,
        dependencies: ['Validación de tabiques de carga'],
        source: 'AI_ESTIMATED',
        confidence: 'ESTIMATED',
        status: 'IDENTIFIED',
      });
    }

    // 3. Smart Home & Wi-Fi Coverage Optimization (V21 integration)
    if (!options?.existingSmartHome) {
      opportunities.push({
        id: `opp_smarthome_${Date.now()}_3`,
        propertyId: propId,
        title: 'Infraestructura Smart Home & Red Mesh (V21)',
        description: 'Implantación de pasarela domótica multiprotocolo (Matter/Zigbee) y puntos de acceso Wi-Fi 6 para cobertura sin zonas muertas.',
        category: 'SMART_HOME',
        priority: 'LOW',
        estimatedCostEur: 950,
        impactScore: 72,
        source: 'CALCULATED',
        confidence: 'CALCULATED',
        status: 'IDENTIFIED',
      });
    }

    // 4. Energy Efficiency & HVAC Zoning Check
    if (property.constructionYear && property.constructionYear < 2005) {
      opportunities.push({
        id: `opp_energy_${Date.now()}_4`,
        propertyId: propId,
        title: 'Actualización de Aislamiento y Carpinterías Térmicas',
        description: 'Inmueble con año de construcción previo a 2005. Mejorar ventanas con doble acristalamiento bajo emisivo reducirá el consumo energético hasta un 30%.',
        category: 'ENERGY_EFFICIENCY',
        priority: 'HIGH',
        estimatedCostEur: 4500,
        impactScore: 90,
        potentialSavingsEur: 650,
        source: 'AI_ESTIMATED',
        confidence: 'ESTIMATED',
        status: 'IDENTIFIED',
      });
    }

    return opportunities;
  }
}
