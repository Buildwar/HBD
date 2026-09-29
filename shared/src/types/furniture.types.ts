/**
 * HBD — HOME BOARD DESIGNER V5.0.0
 * Furniture & Spatial Validation Types
 */

import { Point2D } from './geometry.types.js';

export type DimensionUnit = 'cm' | 'mm' | 'm';

export enum DimensionSource {
  USER_CONFIRMED = 'USER_CONFIRMED',
  MANUAL = 'MANUAL',
  ESTIMATED = 'ESTIMATED',
  AI_ESTIMATED = 'AI_ESTIMATED',
  CATALOG = 'CATALOG',
  UNKNOWN = 'UNKNOWN',
}

export enum SpatialValidationStatus {
  VALID = 'VALID',           // ✓ Compatible (Cabe perfectamente)
  WARNING = 'WARNING',       // ⚠ Revisar (Cabe pero margen ajustado / paso reducido)
  INVALID = 'INVALID',       // ✕ No válido (Colisión o fuera de habitación)
  UNKNOWN = 'UNKNOWN',       // ? Sin comprobar
}

export interface FurnitureCategoryDto {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  order?: number;
}

export interface FurnitureDto {
  id: string;
  name: string;
  categoryId: string;
  category?: FurnitureCategoryDto;
  defaultWidthM: number;
  defaultDepthM: number;
  defaultHeightM: number;
  color?: string | null;
  material?: string | null;
  description?: string | null;
  model3dUrl?: string | null;
  imageUrl?: string | null;
  isCustom: boolean;
  userId?: string | null;
  dimensionSource: DimensionSource;
  createdAt: string;
  updatedAt?: string;
}

export interface FurniturePlacementDto {
  id: string;
  floorId: string;
  floorPlanId?: string | null;
  roomId?: string | null;
  furnitureId: string;
  furniture?: FurnitureDto;
  posX: number;           // World/canvas coordinates or meters
  posY: number;
  posZ: number;
  rotationDeg: number;    // 0°, 45°, 90°, 135°, 180°, etc.
  scale: number;
  widthM: number;
  depthM: number;
  heightM: number;
  lockProportions?: boolean;
  validationStatus: SpatialValidationStatus;
  lastValidation?: SpatialValidationResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollisionDetail {
  type: 'WALL' | 'FURNITURE' | 'DOOR_SWING' | 'WINDOW_ACCESS' | 'OUTSIDE_ROOM';
  entityId?: string;
  entityName?: string;
  penetrationCm?: number;
  message: string;
}

export interface ClearanceMargins {
  leftCm: number;
  rightCm: number;
  topCm: number;
  bottomCm: number;
  nearestDoorCm?: number;
  nearestWindowCm?: number;
}

export interface SpatialValidationResult {
  status: SpatialValidationStatus;
  isCompatible: boolean;
  dimensionsCm: {
    width: number;
    depth: number;
    height: number;
  };
  availableSpaceCm?: {
    width: number;
    depth: number;
  };
  margins: ClearanceMargins;
  collisions: CollisionDetail[];
  blockedDoors: Array<{ doorId: string; message: string }>;
  blockedWindows: Array<{ windowId: string; message: string }>;
  clearanceWarnings: string[];
  messages: string[];
}

export interface ClearanceRulesConfig {
  minPassageWidthM: number;       // default: 0.70m (70cm)
  minWallMarginM: number;          // default: 0.05m (5cm)
  minDoorClearanceM: number;       // default: 0.80m (80cm)
  minFurnitureGapM: number;        // default: 0.10m (10cm)
}
