/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Tipos y definiciones para el Motor 3D de Vivienda
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

export type SceneLightingMode = 'day' | 'night' | 'neutral';

export type CameraViewMode = 
  | 'orbit' 
  | 'first_person' 
  | 'top' 
  | 'front' 
  | 'side' 
  | 'isometric' 
  | 'room_focus';

export type MaterialCategory = 'wall' | 'floor' | 'ceiling' | 'furniture' | 'glass' | 'metal' | 'wood' | 'fabric';

export interface MaterialDefinition {
  id: string;
  name: string;
  category: MaterialCategory;
  color: string;
  roughness: number;
  metalness: number;
  opacity?: number;
  transparent?: boolean;
  textureUrl?: string;
  normalMapUrl?: string;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Wall3D {
  id: string;
  startPoint: Vector3D;
  endPoint: Vector3D;
  center: Vector3D;
  lengthM: number;
  thicknessM: number;
  heightM: number;
  rotationYRad: number;
  wallType: 'EXTERIOR' | 'INTERIOR' | 'LOAD_BEARING' | 'PARTITION';
  materialId?: string;
  color?: string;
}

export interface Floor3D {
  id: string;
  name: string;
  roomType?: string;
  areaM2: number;
  heightM: number;
  polygon2D: Array<{ x: number; y: number }>;
  polygonVertices3D: Vector3D[];
  center3D: Vector3D;
  materialId?: string;
  floorColor?: string;
  ceilingColor?: string;
}

export interface Ceiling3D {
  id: string;
  floorId: string;
  polygonVertices3D: Vector3D[];
  heightM: number;
  materialId?: string;
  color: string;
}

export interface Door3D {
  id: string;
  wallId?: string;
  position: Vector3D;
  widthM: number;
  heightM: number;
  thicknessM: number;
  rotationYRad: number;
  isOpen: boolean;
  swingAngleDeg: number;
  hingePosition: Vector3D;
  frameColor: string;
  leafColor: string;
}

export interface Window3D {
  id: string;
  wallId?: string;
  position: Vector3D;
  widthM: number;
  heightM: number;
  elevationM: number;
  thicknessM: number;
  rotationYRad: number;
  frameColor: string;
  glassColor: string;
  glassOpacity: number;
}

export interface Furniture3DPart {
  name: string;
  type: 'box' | 'cylinder' | 'sphere';
  position: Vector3D; // Local to furniture center
  dimensions: Vector3D; // width, height, depth (or radius, height)
  color: string;
  roughness?: number;
  metalness?: number;
}

export interface Furniture3D {
  placementId: string;
  furnitureId: string;
  name: string;
  categorySlug: string;
  position: Vector3D;
  dimensions: {
    widthM: number;
    depthM: number;
    heightM: number;
  };
  rotationYRad: number;
  rotationYDeg: number;
  color: string;
  materialType: MaterialCategory;
  model3dUrl?: string;
  parts: Furniture3DPart[];
  isValid: boolean;
}

export interface Light3D {
  id: string;
  type: 'ambient' | 'directional' | 'point';
  position?: Vector3D;
  color: string;
  intensity: number;
  castShadow?: boolean;
  distance?: number;
}

export interface CameraPreset {
  id: string;
  name: string;
  description: string;
  position: Vector3D;
  target: Vector3D;
  fov?: number;
  mode: CameraViewMode;
  roomId?: string;
}

export interface Scene3DLayerVisibility {
  walls: boolean;
  floors: boolean;
  ceilings: boolean;
  doors: boolean;
  windows: boolean;
  furniture: boolean;
  measurements: boolean;
  wireframe: boolean;
  dimensions3D: boolean;
}

export interface Scene3DConfig {
  pixelsPerMeter: number;
  defaultWallHeightM: number;
  defaultWallThicknessM: number;
  lightingMode: SceneLightingMode;
  groundSizeM: number;
  shadowsEnabled: boolean;
}

export interface Scene3DData {
  floorId: string;
  projectName?: string;
  floorName?: string;
  floorHeightM: number;
  scalePixelsPerMeter: number;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    widthM: number;
    lengthM: number;
    center: Vector3D;
  };
  walls: Wall3D[];
  floors: Floor3D[];
  ceilings: Ceiling3D[];
  doors: Door3D[];
  windows: Window3D[];
  furniture: Furniture3D[];
  lights: Light3D[];
  cameraPresets: CameraPreset[];
  defaultCamera: CameraPreset;
}

export interface ScenePreset {
  id: string;
  name: string;
  floorId: string;
  cameraPosition: Vector3D;
  cameraTarget: Vector3D;
  lightingMode: SceneLightingMode;
  activeLayers: Scene3DLayerVisibility;
  createdAt: string;
}

export interface Measurement3D {
  id: string;
  startPoint: Vector3D;
  endPoint: Vector3D;
  distanceM: number;
  label?: string;
}
