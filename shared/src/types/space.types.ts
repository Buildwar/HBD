/**
 * HBD — HOME BOARD DESIGNER (V10.0.0 / V11.0.0)
 * Types and Interfaces for Space, Functional Zones and Measurement Sources
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Point2D, WallDto, DoorDto, WindowDto } from './geometry.types.js';

export type MeasurementConfidence =
  | 'USER_CONFIRMED'
  | 'GEOMETRY_CALCULATED'
  | 'CATALOG'
  | 'MANUAL'
  | 'AI_ESTIMATED'
  | 'ESTIMATED'
  | 'UNKNOWN';

export type FunctionalZoneType =
  | 'LIVING'
  | 'DINING'
  | 'KITCHEN'
  | 'BEDROOM'
  | 'BATHROOM'
  | 'WORKSPACE'
  | 'CIRCULATION'
  | 'STORAGE'
  | 'TERRACE'
  | 'OTHER';

export interface MetricValue<T = number> {
  value: T;
  unit: string;
  source: MeasurementConfidence;
  confidencePercent?: number;
  notes?: string | null;
}

export interface FunctionalZoneDto {
  id: string;
  parentSpaceId: string;
  name: string;
  type: FunctionalZoneType;
  polygon?: Point2D[] | null;
  areaM2: MetricValue<number>;
  associatedFurnitureIds?: string[];
  customRules?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DetailedGeometricMetricsDto {
  grossAreaM2: MetricValue<number>;
  usableAreaM2: MetricValue<number>;
  builtAreaM2: MetricValue<number>;
  grossWallAreaM2: MetricValue<number>;
  netWallAreaM2: MetricValue<number>;
  openingsAreaM2: MetricValue<number>;
  doorsAreaM2: MetricValue<number>;
  windowsAreaM2: MetricValue<number>;
  ceilingAreaM2: MetricValue<number>;
  perimeterM: MetricValue<number>;
  usablePerimeterM: MetricValue<number>;
  skirtingBoardM: MetricValue<number>;
  volumeM3: MetricValue<number>;
  wallCount: number;
  doorCount: number;
  windowCount: number;
  warnings: string[];
  isComplete: boolean;
}

export interface SpaceDto {
  id: string;
  floorId: string;
  name: string;
  roomType?: string | null;
  polygon: Point2D[];
  metrics: DetailedGeometricMetricsDto;
  heightM: number;
  color?: string | null;
  functionalZones?: FunctionalZoneDto[];
  roomIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SpaceGeometricInput {
  id?: string;
  name?: string;
  roomType?: string | null;
  polygon: Point2D[];
  heightM?: number;
  walls?: WallDto[];
  doors?: DoorDto[];
  windows?: WindowDto[];
  wallThicknessM?: number;
  pixelsPerMeter?: number;
  source?: MeasurementConfidence;
}

export interface ProjectIntelligenceDto {
  projectId: string;
  projectName: string;
  floorsCount: number;
  roomsCount: number;
  spacesCount: number;
  functionalZonesCount: number;
  totalGrossAreaM2: number;
  totalUsableAreaM2: number;
  totalBuiltAreaM2: number;
  totalVolumeM3: number;
  totalPerimeterM: number;
  totalOpeningsAreaM2: number;
  complianceScore: number;
  requiresProValidation: boolean;
  proValidationNotes: string[];
  spaces: SpaceDto[];
  generatedAt: string;
}
