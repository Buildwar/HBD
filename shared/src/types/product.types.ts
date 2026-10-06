/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — REAL PRODUCT IMPORT & DIGITAL FURNITURE TWIN TYPES
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { DimensionSource, SpatialValidationStatus, FurnitureDto } from './furniture.types.js';

// ============================================================
// 1. ENUMS DE PROCEDENCIA, EXTRACCIÓN Y VALIDACIÓN
// ============================================================

export enum ProductProvenance {
  OFFICIAL_3D = 'OFFICIAL_3D',
  OFFICIAL_PRODUCT_DATA = 'OFFICIAL_PRODUCT_DATA',
  USER_PROVIDED = 'USER_PROVIDED',
  IMPORTED = 'IMPORTED',
  AI_RECONSTRUCTED = 'AI_RECONSTRUCTED',
  PARAMETRIC = 'PARAMETRIC',
  ESTIMATED = 'ESTIMATED',
  UNKNOWN = 'UNKNOWN',
}

export enum ProductVerificationStatus {
  SYSTEM_EXTRACTED = 'SYSTEM_EXTRACTED',
  AI_DETECTED = 'AI_DETECTED',
  USER_CONFIRMED = 'USER_CONFIRMED',
  USER_EDITED = 'USER_EDITED',
  CUSTOMIZED = 'CUSTOMIZED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  INVALID = 'INVALID',
}

export enum ProductValidationState {
  VALID = 'VALID',
  WARNING = 'WARNING',
  INVALID = 'INVALID',
  UNKNOWN = 'UNKNOWN',
}

export enum ExtractionMethod {
  JSON_LD = 'JSON_LD',
  MICRODATA = 'MICRODATA',
  OPEN_GRAPH = 'OPEN_GRAPH',
  IKEA_SPECIFIC = 'IKEA_SPECIFIC',
  GENERIC_HTML = 'GENERIC_HTML',
  AI_EXTRACTED = 'AI_EXTRACTED',
  MANUAL_ENTRY = 'MANUAL_ENTRY',
}

export enum ProductImageType {
  PRIMARY = 'PRIMARY',
  GALLERY = 'GALLERY',
  DETAIL = 'DETAIL',
  MATERIAL = 'MATERIAL',
  VARIANT = 'VARIANT',
  LIFESTYLE = 'LIFESTYLE',
  UNKNOWN = 'UNKNOWN',
}

export enum Product3DAssetType {
  OFFICIAL_3D = 'OFFICIAL_3D',
  USER_UPLOADED = 'USER_UPLOADED',
  IMPORTED = 'IMPORTED',
  AI_RECONSTRUCTED = 'AI_RECONSTRUCTED',
  PARAMETRIC = 'PARAMETRIC',
  PRIMITIVE = 'PRIMITIVE',
}

export enum ProductMaterialCategory {
  WOOD = 'wood',
  METAL = 'metal',
  GLASS = 'glass',
  FABRIC = 'fabric',
  LEATHER = 'leather',
  PLASTIC = 'plastic',
  STONE = 'stone',
  CERAMIC = 'ceramic',
  COMPOSITE = 'composite',
  UNKNOWN = 'unknown',
}

export enum ProjectProductStatus {
  PLANNED = 'PLANNED',
  SHORTLISTED = 'SHORTLISTED',
  ORDERED = 'ORDERED',
  DELIVERED = 'DELIVERED',
  INSTALLED = 'INSTALLED',
  CANCELLED = 'CANCELLED',
}

export type ProductDimensionUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft';

export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';

// ============================================================
// 2. MODELOS DE DATOS DE PRODUCTO
// ============================================================

export interface ProductDimensionsDto {
  widthM: number;
  depthM: number;
  heightM: number;
  diameterM?: number;
  thicknessM?: number;
  weightKg?: number;
  rawWidth?: number;
  rawDepth?: number;
  rawHeight?: number;
  rawUnit?: ProductDimensionUnit;
  provenance: ProductProvenance;
  confidence: number;
  isCustomized?: boolean;
}

export interface ProductMaterialDto {
  id?: string;
  category: ProductMaterialCategory | string;
  name: string;
  finish?: string;
  color?: string;
  colorHex?: string;
  textureUrl?: string;
  provenance: ProductProvenance;
  confidence: number;
}

export interface ProductImageDto {
  id?: string;
  url: string;
  type: ProductImageType;
  altText?: string;
  width?: number;
  height?: number;
  isPrimary: boolean;
  sourceUrl?: string;
}

export interface ProductVariantDto {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  color?: string;
  colorCode?: string;
  material?: string;
  finish?: string;
  dimensions?: ProductDimensionsDto;
  price?: number;
  currency?: string;
  imageUrl?: string;
  provenance: ProductProvenance;
  confidence: number;
  selected?: boolean;
}

export interface Product3DAssetDto {
  id: string;
  productId: string;
  variantId?: string;
  type: Product3DAssetType;
  format: 'glb' | 'gltf' | 'obj' | 'parametric_box';
  modelUrl?: string;
  geometryConfig?: {
    primitiveShape?: 'box' | 'cylinder' | 'table' | 'chair' | 'sofa' | 'wardrobe' | 'bed' | 'shelf';
    widthM: number;
    depthM: number;
    heightM: number;
    mainColorHex?: string;
    secondaryColorHex?: string;
    cornerRadiusM?: number;
  };
  provenance: ProductProvenance;
  confidence: number;
  isEstimatedAi: boolean;
  notes?: string;
}

export interface ProductPriceHistoryDto {
  id: string;
  productId: string;
  price: number;
  currency: string;
  recordedAt: string;
  sourceUrl?: string;
}

export interface ProductDto {
  id: string;
  projectId?: string | null;
  name: string;
  brand?: string | null;
  manufacturer?: string | null;
  productCode?: string | null;
  sku?: string | null;
  category: string;
  description?: string | null;
  sourceUrl: string;
  sourceDomain: string;
  importedAt: string;
  updatedAt: string;
  currency: string;
  price?: number | null;
  availability?: string | null;
  productPageTitle?: string | null;
  provenance: ProductProvenance;
  confidence: number;
  confidenceLevel: ConfidenceTier;
  verificationStatus: ProductVerificationStatus;
  dimensions: ProductDimensionsDto;
  materials: ProductMaterialDto[];
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  assets3d: Product3DAssetDto[];
  priceHistory?: ProductPriceHistoryDto[];
  furnitureTwin?: DigitalFurnitureTwinDto | null;
  furnitureId?: string | null;
  rawStructuredData?: any;
}

// ============================================================
// 3. DIGITAL FURNITURE TWIN
// ============================================================

export interface DigitalFurnitureTwinDto {
  id: string;
  productId: string;
  variantId?: string | null;
  furnitureId?: string | null;
  name: string;
  dimensions: ProductDimensionsDto;
  geometry: {
    shape: 'box' | 'cylinder' | 'compound' | 'mesh';
    boundingDimensionsM: {
      width: number;
      depth: number;
      height: number;
    };
    meshVerticesCount?: number;
  };
  materials: ProductMaterialDto[];
  asset3d?: Product3DAssetDto | null;
  transform?: {
    rotationDeg: number;
    scale: number;
    lockRealDimensions: boolean;
  };
  provenance: ProductProvenance;
  confidence: number;
  verificationStatus: ProductVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 4. IMPORT RESULT & INPUTS
// ============================================================

export interface ProductImportInput {
  url: string;
  projectId?: string;
  aiAssisted?: boolean;
  forceRefresh?: boolean;
}

export interface ProductImportResultDto {
  success: boolean;
  product?: ProductDto;
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  dimensions?: ProductDimensionsDto;
  warnings: string[];
  missingFields: string[];
  confidence: number;
  confidenceLevel: ConfidenceTier;
  provenance: ProductProvenance;
  extractionMethod: ExtractionMethod;
  sourceUrl: string;
  sourceDomain: string;
  validationIssues: string[];
  validationState: ProductValidationState;
}

export interface ProductConfirmationInput {
  name: string;
  brand?: string;
  sku?: string;
  category: string;
  description?: string;
  price?: number;
  currency?: string;
  dimensions: {
    widthM: number;
    depthM: number;
    heightM: number;
  };
  selectedVariantId?: string;
  materials?: Array<{
    category: string;
    name: string;
    colorHex?: string;
  }>;
  createFurnitureTwin?: boolean;
}

export interface ProjectProductDto {
  id: string;
  projectId: string;
  floorId?: string | null;
  roomId?: string | null;
  roomName?: string | null;
  productId: string;
  variantId?: string | null;
  furnitureTwinId?: string | null;
  product?: ProductDto;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: ProjectProductStatus;
  notes?: string | null;
  placed2d?: boolean;
  posX?: number;
  posY?: number;
  posZ?: number;
  rotationDeg?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItemDto {
  id: string;
  projectId: string;
  productId: string;
  productName: string;
  brand?: string;
  sku?: string;
  sourceUrl?: string;
  imageUrl?: string;
  category: string;
  targetRoomName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: ProjectProductStatus;
  availability?: string;
}

export interface ProductComparisonItemDto {
  product: ProductDto;
  spatialFit: {
    fitsRoom: boolean;
    remainingPassageM?: number;
    collisionStatus: SpatialValidationStatus;
  };
  priceVarianceFromAverage?: number;
  differences: string[];
}
