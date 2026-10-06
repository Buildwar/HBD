/**
 * Types & Enums for AR / Real Space Visualization (Phase V22 / v1.22.0)
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

export type ARMode = 
  | 'WEBXR_IMMERSIVE'
  | 'CAMERA_TRACKED'
  | 'PHOTO_AR'
  | 'AR_PREVIEW'
  | 'SIDE_BY_SIDE'
  | 'BEFORE_AFTER_SLIDER'
  | 'OVERLAY_COMPARISON';

export type ARCapability =
  | 'WEBXR_SUPPORTED'
  | 'PLANE_DETECTION'
  | 'CAMERA_SUPPORTED'
  | 'LIGHT_ESTIMATION'
  | 'DEPTH_SUPPORTED'
  | 'GYROSCOPE_SUPPORTED'
  | 'HIT_TEST_SUPPORTED';

export type ARTrackingState =
  | 'NOT_INITIALIZED'
  | 'INITIALIZING'
  | 'TRACKING'
  | 'LIMITED_LOW_LIGHT'
  | 'LIMITED_EXCESSIVE_MOTION'
  | 'LIMITED_INSUFFICIENT_FEATURES'
  | 'LOST'
  | 'FALLBACK_MANUAL';

export type ARSurfaceType =
  | 'FLOOR'
  | 'WALL'
  | 'CEILING'
  | 'TABLE_TOP'
  | 'FURNITURE_SURFACE'
  | 'ARBITRARY_PLANE'
  | 'UNKNOWN';

export type ARAnchorTargetType =
  | 'FURNITURE'
  | 'TECHNICAL_ELEMENT'
  | 'ROOM_GEOMETRY'
  | 'WALL_MEASUREMENT'
  | 'CUSTOM_POINT'
  | 'SCALE_REFERENCE';

export type ARReferenceType =
  | 'DOOR_STANDARD'
  | 'WINDOW_STANDARD'
  | 'WALL_MEASUREMENT'
  | 'FURNITURE_KNOWN'
  | 'A4_PAPER_MARKER'
  | 'USER_MANUAL_CALIBRATION'
  | 'ROOM_CORNER';

export type ARMeasurementQuality =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'ESTIMATED_UNKNOWN';

export type AR3DAssetProvenance =
  | 'OFFICIAL_3D_MODEL'
  | 'USER_PROVIDED_GLTF'
  | 'RETAIL_IMPORTED_GLTF'
  | 'AI_RECONSTRUCTED_3D'
  | 'PARAMETRIC_GENERATED'
  | 'PRIMITIVE_BOX_FALLBACK';

export interface ARAnchorPosition {
  x: number; // in meters relative to AR world origin
  y: number;
  z: number;
}

export interface ARAnchorRotation {
  pitch: number; // in degrees or Euler radians
  yaw: number;
  roll: number;
}

export interface ARAnchorScale {
  x: number;
  y: number;
  z: number;
}

export interface ARAnchorItem {
  id: string;
  targetType: ARAnchorTargetType;
  targetId?: string;
  name: string;
  surfaceType: ARSurfaceType;
  position: ARAnchorPosition;
  rotation: ARAnchorRotation;
  scale: ARAnchorScale;
  isConfirmed: boolean;
  provenance: AR3DAssetProvenance;
  modelUrl?: string;
  metadata?: Record<string, any>;
  hasCollisions?: boolean;
  collisionWarning?: string;
}

export interface ARScaleReferenceItem {
  id: string;
  type: ARReferenceType;
  knownRealSizeMeters: number;
  measuredPixelSize?: number;
  calibrationRatioMetersPerPixel?: number;
  quality: ARMeasurementQuality;
  notes?: string;
}

export interface ARMeasurementItem {
  id: string;
  pointA: ARAnchorPosition;
  pointB: ARAnchorPosition;
  distanceMeters: number;
  surfaceType: ARSurfaceType;
  quality: ARMeasurementQuality;
  confidenceScore: number; // 0 to 1
  label?: string;
}

export interface ARComparisonConfig {
  mode: 'SIDE_BY_SIDE' | 'BEFORE_AFTER_SLIDER' | 'OPACITY_OVERLAY';
  sliderPosition: number; // 0 to 100 percentage
  overlayOpacity: number; // 0 to 1
  realSpaceImageUrl?: string;
  renderedSceneImageUrl?: string;
  showWireframeOverlay?: boolean;
  showTechnicalInfrastructure?: boolean;
}

export interface ARSceneConfig {
  id?: string;
  projectId: string;
  scenarioId?: string;
  roomId?: string;
  name: string;
  mode: ARMode;
  trackingState: ARTrackingState;
  activeCapabilities: ARCapability[];
  anchors: ARAnchorItem[];
  references: ARScaleReferenceItem[];
  measurements: ARMeasurementItem[];
  comparison?: ARComparisonConfig;
  cameraSettings?: {
    fov: number;
    aspectRatio: number;
    near: number;
    far: number;
    position?: ARAnchorPosition;
    rotation?: ARAnchorRotation;
  };
  lightingEstimate?: {
    ambientIntensity: number; // 0 to 1
    colorTemperature: number; // in Kelvin
    mainLightDirection?: [number, number, number];
  };
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ARCapabilityCheckResult {
  isSupported: boolean;
  recommendedMode: ARMode;
  availableCapabilities: ARCapability[];
  missingCapabilities: ARCapability[];
  notes: string[];
}

export interface ARCalibrationResult {
  isValid: boolean;
  scaleFactor: number; // meters per unit/pixel
  quality: ARMeasurementQuality;
  confidence: number;
  appliedReferenceType: ARReferenceType;
  message: string;
}

export interface ARCollisionValidationResult {
  hasCollisions: boolean;
  conflictingAnchors: string[];
  wallViolations: string[];
  clearanceViolations: string[];
  warnings: string[];
}
