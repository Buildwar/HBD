export enum WallType {
  EXTERIOR = 'EXTERIOR',
  INTERIOR = 'INTERIOR',
  PARTITION = 'PARTITION',
  LOAD_BEARING = 'LOAD_BEARING',
}

export interface Point2D {
  x: number;
  y: number;
}

export interface WallDto {
  id: string;
  floorId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thicknessM: number;
  heightM: number;
  wallType: WallType;
  lengthM?: number;
  doors?: DoorDto[];
  windows?: WindowDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomDto {
  id: string;
  floorId: string;
  name: string;
  roomType?: string;
  polygon: Point2D[];
  areaM2: number;
  widthM?: number;
  lengthM?: number;
  heightM: number;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoorDto {
  id: string;
  wallId: string;
  floorId: string;
  posX: number;
  posY: number;
  widthM: number;
  heightM: number;
  rotationDeg: number;
  swingDirection?: 'INWARD_LEFT' | 'INWARD_RIGHT' | 'OUTWARD_LEFT' | 'OUTWARD_RIGHT' | 'SLIDING' | 'NONE';
  createdAt?: string;
  updatedAt?: string;
}

export interface WindowDto {
  id: string;
  wallId: string;
  floorId: string;
  posX: number;
  posY: number;
  widthM: number;
  heightM: number;
  elevationM: number;
  rotationDeg: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeasurementDto {
  id: string;
  floorId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  distanceM: number;
  label?: string;
  createdAt?: string;
}
