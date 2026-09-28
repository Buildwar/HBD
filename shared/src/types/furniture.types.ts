export interface FurnitureCategoryDto {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface FurnitureDto {
  id: string;
  name: string;
  categoryId: string;
  category?: FurnitureCategoryDto;
  defaultWidthM: number;
  defaultDepthM: number;
  defaultHeightM: number;
  model3dUrl?: string | null;
  imageUrl?: string | null;
  isCustom: boolean;
  userId?: string | null;
  createdAt: string;
}

export interface FurniturePlacementDto {
  id: string;
  floorId: string;
  furnitureId: string;
  furniture?: FurnitureDto;
  posX: number;
  posY: number;
  posZ: number;
  rotationDeg: number;
  widthM: number;
  depthM: number;
  heightM: number;
  createdAt: string;
  updatedAt: string;
}

export interface FitCheckResult {
  fits: boolean;
  availableSpaceM: number;
  furnitureSizeM: number;
  marginM: number;
  collisionType?: 'WALL' | 'FURNITURE' | 'DOOR_SWING' | 'PASSAGEWAY' | 'NONE';
  message: string;
}
