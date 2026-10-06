/**
 * Property Snapshot & State Engine (Phase V23 / v1.23.0)
 * Preserves historical property states (initial, proposed, during renovation, executed) without data loss.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  PropertyDto,
  PropertyOpportunityItem,
  PropertyRiskItem,
  PropertySnapshotDto,
  PropertySnapshotStateType,
  PropertySpatialSummary,
  PropertyTotalInvestmentDto,
} from '../types/propertyIntelligence.types';

export class PropertySnapshotEngine {
  /**
   * Creates an immutable snapshot from live property and intelligence data.
   */
  static createSnapshot(
    property: PropertyDto,
    stateType: PropertySnapshotStateType,
    name: string,
    options?: {
      description?: string;
      spatial?: PropertySpatialSummary;
      opportunities?: PropertyOpportunityItem[];
      risks?: PropertyRiskItem[];
      investment?: PropertyTotalInvestmentDto;
      metadata?: Record<string, any>;
    }
  ): PropertySnapshotDto {
    return {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      propertyId: property.id,
      name,
      stateType,
      description: options?.description,
      snapshotData: {
        property: { ...property },
        spatial: options?.spatial ? { ...options.spatial } : undefined,
        opportunities: options?.opportunities ? [...options.opportunities] : undefined,
        risks: options?.risks ? [...options.risks] : undefined,
        investment: options?.investment ? { ...options.investment } : undefined,
        metadata: options?.metadata || {},
      },
      metricsSummary: {
        surfaceM2: options?.spatial?.totalUsableSurfaceM2 || property.usableSurfaceM2,
        roomsCount: options?.spatial?.roomsCount || property.roomsCount,
        risksCount: options?.risks?.length || 0,
        opportunitiesCount: options?.opportunities?.length || 0,
        totalInvestmentEur: options?.investment?.totalEstimatedInvestment || 0,
      },
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Compares two snapshots to evaluate delta changes across states.
   */
  static compareSnapshots(
    snapA: PropertySnapshotDto,
    snapB: PropertySnapshotDto
  ): {
    surfaceDeltaM2: number;
    roomsDelta: number;
    investmentDeltaEur: number;
    risksDelta: number;
    summary: string;
  } {
    const surfaceA = snapA.metricsSummary?.surfaceM2 || 0;
    const surfaceB = snapB.metricsSummary?.surfaceM2 || 0;
    const invA = snapA.metricsSummary?.totalInvestmentEur || 0;
    const invB = snapB.metricsSummary?.totalInvestmentEur || 0;
    const risksA = snapA.metricsSummary?.risksCount || 0;
    const risksB = snapB.metricsSummary?.risksCount || 0;

    const surfaceDelta = Number((surfaceB - surfaceA).toFixed(2));
    const invDelta = Number((invB - invA).toFixed(2));
    const risksDelta = risksB - risksA;

    return {
      surfaceDeltaM2: surfaceDelta,
      roomsDelta: (snapB.metricsSummary?.roomsCount || 0) - (snapA.metricsSummary?.roomsCount || 0),
      investmentDeltaEur: invDelta,
      risksDelta,
      summary: `Comparativa entre "${snapA.name}" y "${snapB.name}": Variación de inversión ${invDelta >= 0 ? '+' : ''}${invDelta} €, variación de riesgos ${risksDelta >= 0 ? '+' : ''}${risksDelta}.`,
    };
  }
}
