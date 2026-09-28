export interface ProjectDto {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  propertyType?: string | null;
  userId: string;
  isArchived: boolean;
  thumbnail?: string | null;
  floorsCount?: number;
  roomsCount?: number;
  totalAreaM2?: number;
  createdAt: string;
  updatedAt: string;
  floors?: FloorDto[];
}

export interface FloorDto {
  id: string;
  projectId: string;
  name: string;
  level: number;
  order: number;
  heightM: number;
  createdAt: string;
  updatedAt: string;
  floorPlans?: FloorPlanDto[];
  wallsCount?: number;
  roomsCount?: number;
}

export enum FloorPlanStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  ANALYZED = 'ANALYZED',
  VALIDATED = 'VALIDATED',
  FAILED = 'FAILED',
}

export interface FloorPlanDto {
  id: string;
  floorId: string;
  originalFileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  widthPx?: number | null;
  heightPx?: number | null;
  scaleFactor?: number | null; // Pixels per meter
  status: FloorPlanStatus;
  detectedElementsSummary?: {
    wallsCount?: number;
    roomsCount?: number;
    doorsCount?: number;
    windowsCount?: number;
    scaleDetected?: boolean;
    needsReviewCount?: number;
  } | null;
  createdAt: string;
}

export interface CreateProjectRequestDto {
  name: string;
  description?: string;
  address?: string;
  propertyType?: string;
}

export interface UpdateProjectRequestDto {
  name?: string;
  description?: string;
  address?: string;
  propertyType?: string;
  isArchived?: boolean;
  thumbnail?: string;
}
