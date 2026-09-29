/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * Tipos y Modelos de Dominio: AI Vision & Smart Recognition Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { DimensionSource } from './furniture.types.js';

export const ImageSourceType = {
  PROJECT_PHOTO: 'PROJECT_PHOTO',
  ROOM_PHOTO: 'ROOM_PHOTO',
  RENDER: 'RENDER',
  REFERENCE: 'REFERENCE',
  UPLOAD: 'UPLOAD',
} as const;
export type ImageSourceType = (typeof ImageSourceType)[keyof typeof ImageSourceType];

export const VisionAnalysisStatus = {
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  ANALYZING: 'ANALYZING',
  ANALYZED: 'ANALYZED',
  REVIEW: 'REVIEW',
  CONFIRMED: 'CONFIRMED',
  APPLIED: 'APPLIED',
  ERROR: 'ERROR',
} as const;
export type VisionAnalysisStatus = (typeof VisionAnalysisStatus)[keyof typeof VisionAnalysisStatus];

export const VisionDiffStatus = {
  MATCH: 'MATCH',
  POSSIBLE_MATCH: 'POSSIBLE_MATCH',
  MISSING: 'MISSING',
  NEW: 'NEW',
  UNKNOWN: 'UNKNOWN',
} as const;
export type VisionDiffStatus = (typeof VisionDiffStatus)[keyof typeof VisionDiffStatus];

export type SpatialRelationType =
  | 'IN_FRONT_OF'
  | 'BEHIND'
  | 'NEXT_TO'
  | 'AGAINST_WALL'
  | 'UNDER'
  | 'ABOVE'
  | 'INSIDE'
  | 'ON_TOP_OF';

export interface BoundingBox2D {
  x: number;      // Normalizado [0..1] o coordenadas relativas
  y: number;
  width: number;
  height: number;
}

export interface FurnitureDetection {
  id: string;
  category: string;
  label: string;
  confidence: number; // 0..1 (ej. 0.94 -> 94%)
  boundingBox: BoundingBox2D;
  orientation?: string;
  estimatedDimensions: {
    widthM: number;
    depthM: number;
    heightM: number;
    source: DimensionSource;
  };
  visualProperties?: {
    colorHex?: string;
    colorName?: string;
    materialType?: string;
    style?: string;
  };
  confirmedByHuman?: boolean;
  isCustomConfirmed?: boolean;
  mappedFurnitureId?: string;
  existingPlacementId?: string;
  isNewFurniture?: boolean;
}

export interface MaterialDetection {
  id: string;
  materialType: string;
  label: string;
  confidence: number;
  region?: string;
  dominantColorHex?: string;
  roughness?: number;
  metalness?: number;
}

export interface VisualPalette {
  dominantColors: string[];
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  dark: string;
  light: string;
  wallColors?: string[];
  furnitureColors?: string[];
  floorColors?: string[];
  accentColors?: string[];
}

export interface RoomDetection {
  roomType: string;
  label: string;
  confidence: number;
  suggestedRoomId?: string;
  confirmedRoomId?: string;
  architecturalFeatures?: string[];
}

export interface SpatialRelation {
  id: string;
  sourceEntityId: string;
  sourceLabel: string;
  relation: SpatialRelationType;
  targetEntityId: string;
  targetLabel: string;
  confidence: number;
}

export interface VisionScaleReference {
  id: string;
  detectedEntityId?: string;
  objectLabel: string;
  realDimensionM: number;
  dimensionType: 'WIDTH' | 'HEIGHT' | 'DEPTH';
  confidence: number;
  pixelSpan?: number;
}

export interface InspirationProfile {
  style: string;
  styleConfidence: number;
  atmosphere: string;
  dominantColors: string[];
  visualPalette: VisualPalette;
  materials: MaterialDetection[];
  lightingMood: string;
  generalVibe: string;
  keyHighlights: string[];
}

export interface VisionAnalysisResult {
  id: string;
  imageId: string;
  provider: string;
  isMock: boolean;
  status: VisionAnalysisStatus;
  confidenceScore: number;
  roomDetection?: RoomDetection;
  detectedObjects: FurnitureDetection[];
  detectedMaterials: MaterialDetection[];
  visualPalette: VisualPalette;
  detectedRelations: SpatialRelation[];
  scaleReference?: VisionScaleReference;
  inspirationProfile?: InspirationProfile;
  aiRoomBrief: string;
  summary: string;
  createdAt: string;
  analyzedAt: string;
}

export interface VisionDiffItem {
  category: string;
  name: string;
  status: VisionDiffStatus;
  matchConfidence?: number;
  projectPlacementId?: string;
  visionDetectionId?: string;
  message: string;
}

export interface VisionDiffResult {
  projectId: string;
  floorId?: string;
  roomId?: string;
  imageId: string;
  timestamp: string;
  items: VisionDiffItem[];
  overallMatchScore: number; // 0..100
  summary: string;
}

export interface VisionContext {
  imageId: string;
  sourceType: ImageSourceType;
  detectedStyle?: string;
  detectedAtmosphere?: string;
  visualPalette?: VisualPalette;
  detectedMaterials?: MaterialDetection[];
  detectedFurniture?: FurnitureDetection[];
  roomType?: string;
  confidenceScore: number;
}

export interface ProjectImageDto {
  id: string;
  projectId: string;
  floorId?: string | null;
  roomId?: string | null;
  sourceType: ImageSourceType;
  filename: string;
  originalFilename: string;
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
  sizeBytes: number;
  status: VisionAnalysisStatus;
  provider?: string;
  analysis?: VisionAnalysisResult | null;
  createdAt: string;
  updatedAt: string;
  analyzedAt?: string | null;
}

export interface VisionReviewItemDto {
  id: string; // detection ID
  action: 'CONFIRM' | 'EDIT' | 'REJECT';
  mappedPlacementId?: string;
  customDimensions?: {
    widthM: number;
    depthM: number;
    heightM: number;
  };
  customLabel?: string;
  targetRoomId?: string;
}

export interface VisionReviewDto {
  imageId: string;
  projectId: string;
  floorId?: string;
  roomId?: string;
  reviews: VisionReviewItemDto[];
  applyToProject?: boolean;
  scaleReference?: VisionScaleReference;
}

export interface VisionProviderConfig {
  providerName: 'mock' | 'openai' | 'anthropic' | 'custom';
  isConfigured: boolean;
  isMockMode: boolean;
  availableModels: string[];
  activeModel: string;
  supportsImageVision: boolean;
  rateLimitPerMinute: number;
}

export interface ImageInputData {
  imageId?: string;
  imageUrl?: string;
  imageBuffer?: Buffer | ArrayBuffer;
  base64Data?: string;
  mimeType: string;
  filename?: string;
  sourceType?: ImageSourceType;
  projectId?: string;
  floorId?: string;
  roomId?: string;
}

export interface VisionProvider {
  getProviderConfig(): VisionProviderConfig;
  analyzeImage(input: ImageInputData): Promise<VisionAnalysisResult>;
  detectObjects(input: ImageInputData): Promise<FurnitureDetection[]>;
  detectMaterials(input: ImageInputData): Promise<MaterialDetection[]>;
  compareWithProject(
    input: ImageInputData,
    projectContext: {
      rooms: any[];
      furniturePlacements: any[];
      walls: any[];
    }
  ): Promise<VisionDiffResult>;
  generateInspirationProfile(input: ImageInputData): Promise<InspirationProfile>;
}
