/**
 * Property Intelligence Service (Phase V23 / v1.23.0)
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  PropertyDataQualityDto,
  PropertyDto,
  PropertyIntelligenceReportDto,
  PropertyOpportunityItem,
  PropertyRiskItem,
  PropertySnapshotDto,
} from '@hbd/shared';

const API_BASE = '/api/properties';

export class PropertyService {
  /**
   * Retrieves all properties.
   */
  static async getProperties(): Promise<PropertyDto[]> {
    const res = await fetch(API_BASE);
    const json = await res.json();
    return json.data || [];
  }

  /**
   * Retrieves a property by ID.
   */
  static async getPropertyById(id: string): Promise<PropertyDto> {
    const res = await fetch(`${API_BASE}/${id}`);
    const json = await res.json();
    return json.data;
  }

  /**
   * Creates a property.
   */
  static async createProperty(data: Partial<PropertyDto>): Promise<PropertyDto> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Updates a property.
   */
  static async updateProperty(id: string, updates: Partial<PropertyDto>): Promise<PropertyDto> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Deletes a property.
   */
  static async deleteProperty(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  }

  /**
   * Generates or fetches full intelligence report.
   */
  static async getAnalysisReport(id: string): Promise<PropertyIntelligenceReportDto> {
    const res = await fetch(`${API_BASE}/${id}/analysis`);
    const json = await res.json();
    return json.data;
  }

  /**
   * Fetches data quality analysis.
   */
  static async getDataQuality(id: string): Promise<PropertyDataQualityDto> {
    const res = await fetch(`${API_BASE}/${id}/data-quality`);
    const json = await res.json();
    return json.data;
  }

  /**
   * Lists opportunities.
   */
  static async getOpportunities(id: string): Promise<PropertyOpportunityItem[]> {
    const res = await fetch(`${API_BASE}/${id}/opportunities`);
    const json = await res.json();
    return json.data || [];
  }

  /**
   * Generates AI/calculated opportunities.
   */
  static async generateOpportunities(id: string): Promise<PropertyOpportunityItem[]> {
    const res = await fetch(`${API_BASE}/${id}/opportunities`, { method: 'POST' });
    const json = await res.json();
    return json.data || [];
  }

  /**
   * Lists risks.
   */
  static async getRisks(id: string): Promise<PropertyRiskItem[]> {
    const res = await fetch(`${API_BASE}/${id}/risks`);
    const json = await res.json();
    return json.data || [];
  }

  /**
   * Generates risks.
   */
  static async generateRisks(id: string): Promise<PropertyRiskItem[]> {
    const res = await fetch(`${API_BASE}/${id}/risks`, { method: 'POST' });
    const json = await res.json();
    return json.data || [];
  }

  /**
   * Lists snapshots.
   */
  static async getSnapshots(id: string): Promise<PropertySnapshotDto[]> {
    const res = await fetch(`${API_BASE}/${id}/snapshots`);
    const json = await res.json();
    return json.data || [];
  }

  /**
   * Creates snapshot.
   */
  static async createSnapshot(
    id: string,
    data: { name: string; stateType: string; description?: string }
  ): Promise<PropertySnapshotDto> {
    const res = await fetch(`${API_BASE}/${id}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Links a project.
   */
  static async linkProject(propertyId: string, projectId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/${propertyId}/link-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    const json = await res.json();
    return json.data;
  }

  /**
   * Unlinks a project.
   */
  static async unlinkProject(propertyId: string, projectId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/${propertyId}/unlink-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    const json = await res.json();
    return json.data;
  }
}
