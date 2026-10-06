/**
 * Property Intelligence Engine (Phase V23 / v1.23.0)
 * Master facade consolidating spatial, technical, financial, risks, opportunities, and data quality.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  PropertyDto,
  PropertyIntelligenceReportDto,
  PropertyOpportunityItem,
  PropertyRiskItem,
  PropertySnapshotDto,
  PropertySpatialSummary,
  PropertyTotalInvestmentDto,
} from '../types/propertyIntelligence.types';
import { PropertyAnalysisEngine } from './propertyAnalysis.engine';
import { PropertyOpportunityEngine } from './propertyOpportunity.engine';
import { PropertyRiskEngine } from './propertyRisk.engine';
import { PropertyDataQualityEngine } from './propertyDataQuality.engine';
import { PropertySnapshotEngine } from './propertySnapshot.engine';

export class PropertyIntelligenceEngine {
  /**
   * Generates a complete comprehensive intelligence report for a property.
   */
  static generateReport(
    property: PropertyDto,
    options?: {
      rooms?: Array<{ id: string; name: string; type: string; widthM?: number; lengthM?: number; areaM2?: number }>;
      financials?: {
        acquisitionPrice?: number;
        renovationCost?: number;
        furnitureCost?: number;
        technicalCost?: number;
        procurementCost?: number;
        executionCost?: number;
      };
      technicalSummary?: {
        totalPowerKW: number;
        totalCircuits: number;
        hasWifiAnalysis: boolean;
        smartHomeProtocolCount: number;
        securityFixturesCount: number;
      };
      furnitureSummary?: {
        totalItems: number;
        furnitureTwinsCount: number;
        retailProductsCount: number;
      };
      scenarios?: Array<{ scenarioId: string; scenarioName: string; estimatedCost: number; modificationsCount: number }>;
    }
  ): PropertyIntelligenceReportDto {
    // 1. Spatial Analysis
    const spatial: PropertySpatialSummary = options?.rooms && options.rooms.length > 0
      ? PropertyAnalysisEngine.analyzeSpatialProfile(options.rooms, property.totalFloors || 1, property.plotSurfaceM2)
      : {
          totalBuiltSurfaceM2: property.builtSurfaceM2 || (property.usableSurfaceM2 ? property.usableSurfaceM2 * 1.15 : 0),
          totalUsableSurfaceM2: property.usableSurfaceM2 || 0,
          plotSurfaceM2: property.plotSurfaceM2,
          roomsCount: property.roomsCount || 0,
          bathroomsCount: property.bathroomsCount || 0,
          bedroomsCount: property.bedroomsCount || 0,
          floorsCount: property.totalFloors || 1,
          circulationSurfaceM2: 0,
          circulationRatio: 0,
          storageSurfaceM2: 0,
          spacesBreakdown: [],
          adjacencies: [],
        };

    // 2. Data Quality
    const dataQuality = PropertyDataQualityEngine.evaluateDataQuality({
      ...property,
      usableSurfaceM2: spatial.totalUsableSurfaceM2,
      roomsCount: spatial.roomsCount,
      bathroomsCount: spatial.bathroomsCount,
    });

    // 3. Opportunities
    const opportunities = PropertyOpportunityEngine.detectOpportunities(
      property,
      spatial,
      { existingSmartHome: (options?.technicalSummary?.smartHomeProtocolCount || 0) > 0 }
    );

    // 4. Risks
    const risks = PropertyRiskEngine.evaluateRisks(property);

    // 5. Total Investment Consolidation (V17 integration)
    const fin = options?.financials;
    const reno = fin?.renovationCost || 0;
    const furn = fin?.furnitureCost || 0;
    const tech = fin?.technicalCost || 0;
    const proc = fin?.procurementCost || 0;
    const exec = fin?.executionCost || 0;
    const other = 0;

    const totalEst = reno + furn + tech + proc + exec + other;
    const usableM2 = spatial.totalUsableSurfaceM2 || property.usableSurfaceM2 || 1;
    const costPerM2 = Number((totalEst / usableM2).toFixed(2));

    const investment: PropertyTotalInvestmentDto = {
      acquisitionCost: fin?.acquisitionPrice
        ? { amount: fin.acquisitionPrice, isProvided: true, source: 'USER_PROVIDED' }
        : { amount: 0, isProvided: false, source: 'UNKNOWN' },
      renovationCost: reno,
      furnitureCost: furn,
      technicalInfrastructureCost: tech,
      procurementCost: proc,
      executionCost: exec,
      otherCosts: other,
      totalCommittedInvestment: totalEst,
      totalEstimatedInvestment: totalEst,
      costPerM2,
    };

    // 6. Alerts
    const alerts: string[] = [];
    if (risks.some((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH' || r.severity === 'MEDIUM')) {
      alerts.push('Se han detectado riesgos potenciales que requieren revisión técnica o profesional.');
    }
    if (dataQuality.completionPercentage < 80) {
      alerts.push('Perfil del inmueble incompleto: añadir datos clave aumentará la precisión del análisis.');
    }
    if (spatial.circulationRatio > 0.05) {
      alerts.push(`La superficie de pasillos y distribuidores representa el ${(spatial.circulationRatio * 100).toFixed(0)}% de la superficie útil.`);
    }
    if (opportunities.length > 0) {
      alerts.push(`${opportunities.length} oportunidades de optimización y ahorro detectadas para este inmueble.`);
    }

    return {
      property,
      spatial,
      opportunities,
      risks,
      dataQuality,
      investment,
      technicalSummary: options?.technicalSummary,
      furnitureSummary: options?.furnitureSummary,
      scenariosComparison: options?.scenarios,
      alerts,
    };
  }
}

export {
  PropertyAnalysisEngine,
  PropertyOpportunityEngine,
  PropertyRiskEngine,
  PropertyDataQualityEngine,
  PropertySnapshotEngine,
};
