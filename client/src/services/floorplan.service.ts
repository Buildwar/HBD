/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * FloorPlan Client Service
 */

import { api } from './api.js';

export interface FloorPlanAnalysisData {
  meta: any;
  scale: {
    scaleFactor: number;
    method: string;
    scaleRatioText?: string;
    confidence: number;
  };
  textAnnotations: any[];
  walls: any[];
  rooms: any[];
  doors: any[];
  windows: any[];
  validation: {
    isValid: boolean;
    score: number;
    confidenceBreakdown: {
      high: number;
      medium: number;
      low: number;
      total: number;
    };
    warnings: string[];
    elementsSummary: {
      wallsCount: number;
      roomsCount: number;
      doorsCount: number;
      windowsCount: number;
      scaleDetected: boolean;
      needsReviewCount: number;
      totalAreaM2: number;
    };
  };
}

export const floorplanService = {
  async uploadPlan(projectId: string, floorId: string, file: File): Promise<{ success: boolean; data: any }> {
    const formData = new FormData();
    formData.append('plan', file);
    return api.upload<{ success: boolean; data: any }>(
      `/projects/${projectId}/floors/${floorId}/plans/upload`,
      formData
    );
  },

  async getPlan(id: string): Promise<{ success: boolean; data: any }> {
    return api.get<{ success: boolean; data: any }>(`/plans/${id}`);
  },

  async analyzePlan(id: string, manualScale?: { p1: any; p2: any; meters: number }): Promise<{ success: boolean; data: { floorPlan: any; analysis: FloorPlanAnalysisData } }> {
    return api.post<{ success: boolean; data: { floorPlan: any; analysis: FloorPlanAnalysisData } }>(
      `/plans/${id}/analyze`,
      { manualScale }
    );
  },

  async calibrateScale(id: string, p1: { x: number; y: number }, p2: { x: number; y: number }, realMeters: number): Promise<{ success: boolean; data: any }> {
    return api.post<{ success: boolean; data: any }>(`/plans/${id}/calibrate-scale`, {
      p1,
      p2,
      realMeters,
    });
  },

  async confirmImport(id: string, geometry: { walls: any[]; rooms: any[]; doors: any[]; windows: any[] }): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(`/plans/${id}/confirm-import`, geometry);
  },

  async saveGeometry(floorId: string, geometry: { walls: any[]; rooms: any[]; doors: any[]; windows: any[]; measurements?: any[] }): Promise<{ success: boolean; message: string }> {
    return api.put<{ success: boolean; message: string }>(`/floors/${floorId}/geometry`, geometry);
  },
};
