/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Motor de Conversión 2D -> 3D (ThreeDConversionEngine)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  Scene3DData,
  Wall3D,
  Floor3D,
  Ceiling3D,
  Door3D,
  Window3D,
  Furniture3D,
  Furniture3DPart,
  Light3D,
  CameraPreset,
  MaterialDefinition,
  SceneLightingMode,
  Vector3D,
} from '../types/threeD.types';

export const DEFAULT_MATERIALS: MaterialDefinition[] = [
  // Paredes
  { id: 'mat_wall_white', name: 'Blanco Mate', category: 'wall', color: '#f8fafc', roughness: 0.9, metalness: 0.05 },
  { id: 'mat_wall_warm_gray', name: 'Gris Cálido', category: 'wall', color: '#e2e8f0', roughness: 0.85, metalness: 0.05 },
  { id: 'mat_wall_beige', name: 'Beige Arena', category: 'wall', color: '#f5f5f0', roughness: 0.9, metalness: 0.05 },
  { id: 'mat_wall_soft_blue', name: 'Azul Nórdico', category: 'wall', color: '#e0f2fe', roughness: 0.8, metalness: 0.05 },
  { id: 'mat_wall_sage_green', name: 'Verde Salvia', category: 'wall', color: '#dcfce7', roughness: 0.85, metalness: 0.05 },
  { id: 'mat_wall_accent', name: 'Color Acento HBD', category: 'wall', color: '#10b981', roughness: 0.7, metalness: 0.1 },

  // Suelos
  { id: 'mat_floor_oak', name: 'Madera Roble Natural', category: 'floor', color: '#b48a60', roughness: 0.45, metalness: 0.1 },
  { id: 'mat_floor_parquet_dark', name: 'Nogal Oscuro', category: 'floor', color: '#5c4033', roughness: 0.4, metalness: 0.1 },
  { id: 'mat_floor_tile_light', name: 'Baldosa Porcelánica', category: 'floor', color: '#e5e7eb', roughness: 0.25, metalness: 0.2 },
  { id: 'mat_floor_marble', name: 'Mármol Blanco', category: 'floor', color: '#f3f4f6', roughness: 0.15, metalness: 0.3 },
  { id: 'mat_floor_concrete', name: 'Cemento Pulido', category: 'floor', color: '#9ca3af', roughness: 0.6, metalness: 0.1 },
  { id: 'mat_floor_carpet', name: 'Moqueta Suave', category: 'floor', color: '#cbd5e1', roughness: 0.95, metalness: 0.0 },

  // Techos
  { id: 'mat_ceiling_white', name: 'Techo Blanco Mate', category: 'ceiling', color: '#ffffff', roughness: 0.95, metalness: 0.0 },

  // Muebles
  { id: 'mat_furn_wood', name: 'Madera Textil', category: 'furniture', color: '#92400e', roughness: 0.5, metalness: 0.1 },
  { id: 'mat_furn_fabric_gray', name: 'Tela Gris Marengo', category: 'furniture', color: '#475569', roughness: 0.9, metalness: 0.0 },
  { id: 'mat_furn_fabric_cream', name: 'Tela Crema', category: 'furniture', color: '#fef3c7', roughness: 0.9, metalness: 0.0 },
  { id: 'mat_furn_leather_black', name: 'Cuero Negro', category: 'furniture', color: '#1e293b', roughness: 0.3, metalness: 0.1 },
  { id: 'mat_furn_metal_black', name: 'Metal Negro Mate', category: 'furniture', color: '#0f172a', roughness: 0.4, metalness: 0.8 },
  { id: 'mat_furn_chrome', name: 'Cromo Brillante', category: 'furniture', color: '#e2e8f0', roughness: 0.1, metalness: 0.95 },
  { id: 'mat_furn_glass', name: 'Cristal Templado', category: 'furniture', color: '#bae6fd', roughness: 0.1, metalness: 0.1, opacity: 0.4, transparent: true },
];

export interface Input2DConversionData {
  floorId: string;
  projectName?: string;
  floorName?: string;
  floorHeightM?: number;
  pixelsPerMeter?: number;
  walls?: Array<{
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    thicknessM?: number;
    heightM?: number;
    wallType?: string;
    color?: string;
  }>;
  rooms?: Array<{
    id: string;
    name: string;
    roomType?: string;
    polygon: Array<{ x: number; y: number }>;
    areaM2?: number;
    heightM?: number;
    color?: string;
  }>;
  doors?: Array<{
    id: string;
    wallId?: string;
    posX: number;
    posY: number;
    widthM?: number;
    heightM?: number;
    rotationDeg?: number;
    isOpen?: boolean;
    swingAngleDeg?: number;
  }>;
  windows?: Array<{
    id: string;
    wallId?: string;
    posX: number;
    posY: number;
    widthM?: number;
    heightM?: number;
    elevationM?: number;
    rotationDeg?: number;
  }>;
  furniturePlacements?: Array<{
    id: string;
    furnitureId: string;
    name?: string;
    categorySlug?: string;
    posX: number;
    posY: number;
    posZ?: number;
    rotationDeg?: number;
    widthM: number;
    depthM: number;
    heightM: number;
    model3dUrl?: string;
    color?: string;
  }>;
}

export class ThreeDConversionEngine {
  /**
   * Convierte la geometría completa del modelo 2D en una Escena 3D navegable y estructurada.
   */
  public static convert2DTo3D(
    data: Input2DConversionData,
    lightingMode: SceneLightingMode = 'day'
  ): Scene3DData {
    const ppm = data.pixelsPerMeter && data.pixelsPerMeter > 0 ? data.pixelsPerMeter : 50;
    const floorHeightM = data.floorHeightM || 2.50;

    // 1. Calcular caja envolvente y centro de referencia 2D para centrar la escena en (0,0,0)
    const bounds2D = this.compute2DBoundingBox(data);
    const centerPxX = (bounds2D.minX + bounds2D.maxX) / 2;
    const centerPxY = (bounds2D.minY + bounds2D.maxY) / 2;

    const bounds3D = {
      minX: (bounds2D.minX - centerPxX) / ppm,
      maxX: (bounds2D.maxX - centerPxX) / ppm,
      minZ: (bounds2D.minY - centerPxY) / ppm,
      maxZ: (bounds2D.maxY - centerPxY) / ppm,
      widthM: Math.max(1, (bounds2D.maxX - bounds2D.minX) / ppm),
      lengthM: Math.max(1, (bounds2D.maxY - bounds2D.minY) / ppm),
      center: { x: 0, y: 0, z: 0 },
    };

    // 2. Conversión de Paredes 2D -> Wall3D
    const walls: Wall3D[] = (data.walls || []).map((w) => {
      const startX = (w.startX - centerPxX) / ppm;
      const startZ = (w.startY - centerPxY) / ppm;
      const endX = (w.endX - centerPxX) / ppm;
      const endZ = (w.endY - centerPxY) / ppm;

      const dx = endX - startX;
      const dz = endZ - startZ;
      const lengthM = Math.hypot(dx, dz);
      const rotationYRad = Math.atan2(dz, dx);

      const heightM = w.heightM || floorHeightM;
      const thicknessM = w.thicknessM || 0.15;

      const center: Vector3D = {
        x: (startX + endX) / 2,
        y: heightM / 2,
        z: (startZ + endZ) / 2,
      };

      const startPoint: Vector3D = { x: startX, y: 0, z: startZ };
      const endPoint: Vector3D = { x: endX, y: 0, z: endZ };

      const wallType = (w.wallType as any) || (thicknessM >= 0.22 ? 'EXTERIOR' : 'INTERIOR');

      return {
        id: w.id,
        startPoint,
        endPoint,
        center,
        lengthM,
        thicknessM,
        heightM,
        rotationYRad,
        wallType,
        color: w.color || (wallType === 'EXTERIOR' ? '#cbd5e1' : '#f1f5f9'),
      };
    });

    // 3. Conversión de Habitaciones -> Floor3D y Ceiling3D
    const floors: Floor3D[] = [];
    const ceilings: Ceiling3D[] = [];

    (data.rooms || []).forEach((r) => {
      const polygonVertices3D: Vector3D[] = (r.polygon || []).map((p) => ({
        x: (p.x - centerPxX) / ppm,
        y: 0.01, // ligera elevación para evitar z-fighting con el suelo base
        z: (p.y - centerPxY) / ppm,
      }));

      // Calcular centroide 3D del polígono
      let cx = 0;
      let cz = 0;
      if (polygonVertices3D.length > 0) {
        polygonVertices3D.forEach((v) => {
          cx += v.x;
          cz += v.z;
        });
        cx /= polygonVertices3D.length;
        cz /= polygonVertices3D.length;
      }

      const roomHeightM = r.heightM || floorHeightM;
      const floorColor = this.getRoomFloorColor(r.roomType, r.color);

      floors.push({
        id: r.id,
        name: r.name,
        roomType: r.roomType,
        areaM2: r.areaM2 || 0,
        heightM: roomHeightM,
        polygon2D: r.polygon,
        polygonVertices3D,
        center3D: { x: cx, y: 0, z: cz },
        floorColor,
        ceilingColor: '#ffffff',
      });

      ceilings.push({
        id: `ceiling_${r.id}`,
        floorId: r.id,
        polygonVertices3D: polygonVertices3D.map((v) => ({ ...v, y: roomHeightM })),
        heightM: roomHeightM,
        color: '#f8fafc',
      });
    });

    // 4. Conversión de Puertas 2D -> Door3D
    const doors: Door3D[] = (data.doors || []).map((d) => {
      const posX = (d.posX - centerPxX) / ppm;
      const posZ = (d.posY - centerPxY) / ppm;
      const widthM = d.widthM || 0.85;
      const heightM = d.heightM || 2.10;
      const rotationYRad = ((d.rotationDeg || 0) * Math.PI) / 180;
      const isOpen = d.isOpen ?? false;
      const swingAngleDeg = d.swingAngleDeg ?? (isOpen ? 85 : 0);

      // Calcular posición de la bisagra (extremo izquierdo de la puerta)
      const halfW = widthM / 2;
      const hingeX = posX - Math.cos(rotationYRad) * halfW;
      const hingeZ = posZ - Math.sin(rotationYRad) * halfW;

      return {
        id: d.id,
        wallId: d.wallId,
        position: { x: posX, y: heightM / 2, z: posZ },
        widthM,
        heightM,
        thicknessM: 0.045,
        rotationYRad,
        isOpen,
        swingAngleDeg,
        hingePosition: { x: hingeX, y: 0, z: hingeZ },
        frameColor: '#334155',
        leafColor: '#b48a60',
      };
    });

    // 5. Conversión de Ventanas 2D -> Window3D
    const windows: Window3D[] = (data.windows || []).map((w) => {
      const posX = (w.posX - centerPxX) / ppm;
      const posZ = (w.posY - centerPxY) / ppm;
      const widthM = w.widthM || 1.20;
      const heightM = w.heightM || 1.20;
      const elevationM = w.elevationM ?? 0.90;
      const rotationYRad = ((w.rotationDeg || 0) * Math.PI) / 180;

      return {
        id: w.id,
        wallId: w.wallId,
        position: { x: posX, y: elevationM + heightM / 2, z: posZ },
        widthM,
        heightM,
        elevationM,
        thicknessM: 0.08,
        rotationYRad,
        frameColor: '#0f172a',
        glassColor: '#bae6fd',
        glassOpacity: 0.45,
      };
    });

    // 6. Conversión de Mobiliario -> Furniture3D con partes procedurales
    const furniture: Furniture3D[] = (data.furniturePlacements || []).map((fp) => {
      const posX = (fp.posX - centerPxX) / ppm;
      const posZ = (fp.posY - centerPxY) / ppm;
      const posY = (fp.posZ || 0) + fp.heightM / 2;
      const rotationYDeg = fp.rotationDeg || 0;
      const rotationYRad = (rotationYDeg * Math.PI) / 180;
      const catSlug = fp.categorySlug || 'auxiliary';

      const parts = this.generateProceduralParts(catSlug, fp.widthM, fp.depthM, fp.heightM, fp.color);

      return {
        placementId: fp.id,
        furnitureId: fp.furnitureId,
        name: fp.name || 'Mueble',
        categorySlug: catSlug,
        position: { x: posX, y: posY, z: posZ },
        dimensions: {
          widthM: fp.widthM,
          depthM: fp.depthM,
          heightM: fp.heightM,
        },
        rotationYRad,
        rotationYDeg,
        color: fp.color || '#475569',
        materialType: 'furniture',
        model3dUrl: fp.model3dUrl,
        parts,
        isValid: true,
      };
    });

    // 7. Configuración de Iluminación
    const lights = this.generateSceneLights(lightingMode, floors, bounds3D);

    // 8. Presets de Cámara y Punto de Vista
    const cameraPresets = this.generateCameraPresets(floors, bounds3D);
    const defaultCamera = cameraPresets[0];

    return {
      floorId: data.floorId,
      projectName: data.projectName,
      floorName: data.floorName,
      floorHeightM,
      scalePixelsPerMeter: ppm,
      bounds: bounds3D,
      walls,
      floors,
      ceilings,
      doors,
      windows,
      furniture,
      lights,
      cameraPresets,
      defaultCamera,
    };
  }

  /**
   * Genera partes 3D procedurales volumétricas para muebles según su categoría
   */
  public static generateProceduralParts(
    categorySlug: string,
    w: number,
    d: number,
    h: number,
    mainColor = '#475569'
  ): Furniture3DPart[] {
    const parts: Furniture3DPart[] = [];
    const slug = categorySlug.toLowerCase();

    if (slug.includes('sofa') || slug.includes('living') || slug.includes('salon')) {
      // Base / Asiento
      const seatH = h * 0.45;
      parts.push({
        name: 'seat_base',
        type: 'box',
        position: { x: 0, y: -(h / 2) + seatH / 2, z: 0 },
        dimensions: { x: w * 0.96, y: seatH, z: d * 0.9 },
        color: mainColor,
      });
      // Respaldo
      const backH = h * 0.55;
      const backD = d * 0.22;
      parts.push({
        name: 'backrest',
        type: 'box',
        position: { x: 0, y: -(h / 2) + seatH + backH / 2, z: -(d / 2) + backD / 2 },
        dimensions: { x: w * 0.96, y: backH, z: backD },
        color: mainColor,
      });
      // Reposabrazos izquierdo y derecho
      const armW = w * 0.12;
      const armH = h * 0.7;
      parts.push({
        name: 'armrest_left',
        type: 'box',
        position: { x: -(w / 2) + armW / 2, y: -(h / 2) + armH / 2, z: 0 },
        dimensions: { x: armW, y: armH, z: d },
        color: mainColor,
      });
      parts.push({
        name: 'armrest_right',
        type: 'box',
        position: { x: w / 2 - armW / 2, y: -(h / 2) + armH / 2, z: 0 },
        dimensions: { x: armW, y: armH, z: d },
        color: mainColor,
      });
    } else if (slug.includes('bed') || slug.includes('bedroom') || slug.includes('dormitorio')) {
      // Base de la cama
      const baseH = h * 0.35;
      parts.push({
        name: 'bed_base',
        type: 'box',
        position: { x: 0, y: -(h / 2) + baseH / 2, z: 0 },
        dimensions: { x: w, y: baseH, z: d },
        color: '#5c4033', // Estructura de madera
      });
      // Colchón
      const matH = h * 0.35;
      parts.push({
        name: 'mattress',
        type: 'box',
        position: { x: 0, y: -(h / 2) + baseH + matH / 2, z: 0.02 },
        dimensions: { x: w * 0.96, y: matH, z: d * 0.94 },
        color: '#f8fafc',
      });
      // Cabecero
      const headH = h;
      const headD = Math.min(0.12, d * 0.08);
      parts.push({
        name: 'headboard',
        type: 'box',
        position: { x: 0, y: 0, z: -(d / 2) + headD / 2 },
        dimensions: { x: w * 1.02, y: headH, z: headD },
        color: '#475569',
      });
      // Almohadas
      const pilW = (w * 0.85) / 2;
      parts.push({
        name: 'pillow_1',
        type: 'box',
        position: { x: -pilW / 2 - 0.02, y: -(h / 2) + baseH + matH + 0.06, z: -(d / 2) + 0.35 },
        dimensions: { x: pilW * 0.9, y: 0.12, z: 0.35 },
        color: '#e2e8f0',
      });
      parts.push({
        name: 'pillow_2',
        type: 'box',
        position: { x: pilW / 2 + 0.02, y: -(h / 2) + baseH + matH + 0.06, z: -(d / 2) + 0.35 },
        dimensions: { x: pilW * 0.9, y: 0.12, z: 0.35 },
        color: '#e2e8f0',
      });
    } else if (slug.includes('table') || slug.includes('dining') || slug.includes('comedor')) {
      // Tablero superior
      const topH = Math.min(0.06, h * 0.08);
      parts.push({
        name: 'tabletop',
        type: 'box',
        position: { x: 0, y: h / 2 - topH / 2, z: 0 },
        dimensions: { x: w, y: topH, z: d },
        color: '#b48a60',
      });
      // 4 Patas
      const legW = Math.min(0.06, w * 0.06);
      const legH = h - topH;
      const legX = w / 2 - legW;
      const legZ = d / 2 - legW;
      const legPos = [
        [-legX, -legZ],
        [legX, -legZ],
        [-legX, legZ],
        [legX, legZ],
      ];
      legPos.forEach(([lx, lz], idx) => {
        parts.push({
          name: `leg_${idx + 1}`,
          type: 'box',
          position: { x: lx, y: -(h / 2) + legH / 2, z: lz },
          dimensions: { x: legW, y: legH, z: legW },
          color: '#1e293b',
        });
      });
    } else if (slug.includes('chair') || slug.includes('silla') || slug.includes('armchair')) {
      // Asiento
      const seatH = h * 0.08;
      const legH = h * 0.46;
      parts.push({
        name: 'seat',
        type: 'box',
        position: { x: 0, y: -(h / 2) + legH + seatH / 2, z: 0 },
        dimensions: { x: w * 0.9, y: seatH, z: d * 0.85 },
        color: mainColor,
      });
      // Respaldo
      const backH = h - legH - seatH;
      parts.push({
        name: 'backrest',
        type: 'box',
        position: { x: 0, y: -(h / 2) + legH + seatH + backH / 2, z: -(d / 2) + 0.04 },
        dimensions: { x: w * 0.85, y: backH, z: 0.06 },
        color: mainColor,
      });
      // Patas
      const legW = 0.04;
      const lx = (w * 0.8) / 2;
      const lz = (d * 0.75) / 2;
      [
        [-lx, -lz],
        [lx, -lz],
        [-lx, lz],
        [lx, lz],
      ].forEach(([x, z], idx) => {
        parts.push({
          name: `chair_leg_${idx + 1}`,
          type: 'box',
          position: { x, y: -(h / 2) + legH / 2, z },
          dimensions: { x: legW, y: legH, z: legW },
          color: '#0f172a',
        });
      });
    } else if (slug.includes('wardrobe') || slug.includes('storage') || slug.includes('armario')) {
      // Cuerpo principal
      parts.push({
        name: 'closet_body',
        type: 'box',
        position: { x: 0, y: 0, z: 0 },
        dimensions: { x: w, y: h, z: d },
        color: '#f1f5f9',
      });
      // Puertas frontales / marco
      parts.push({
        name: 'door_panel_left',
        type: 'box',
        position: { x: -w * 0.24, y: 0, z: d / 2 + 0.01 },
        dimensions: { x: w * 0.46, y: h * 0.96, z: 0.02 },
        color: '#e2e8f0',
      });
      parts.push({
        name: 'door_panel_right',
        type: 'box',
        position: { x: w * 0.24, y: 0, z: d / 2 + 0.01 },
        dimensions: { x: w * 0.46, y: h * 0.96, z: 0.02 },
        color: '#e2e8f0',
      });
    } else {
      // Fallback genérico volumétrico perfectamente ajustado a sus dimensiones W x D x H
      parts.push({
        name: 'body',
        type: 'box',
        position: { x: 0, y: 0, z: 0 },
        dimensions: { x: w, y: h, z: d },
        color: mainColor,
      });
    }

    return parts;
  }

  /**
   * Genera el sistema de iluminación para la escena (Día / Noche)
   */
  private static generateSceneLights(
    mode: SceneLightingMode,
    floors: Floor3D[],
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number; center: Vector3D }
  ): Light3D[] {
    const lights: Light3D[] = [];

    if (mode === 'day') {
      // Luz ambiental diurna suave
      lights.push({
        id: 'light_ambient',
        type: 'ambient',
        color: '#f8fafc',
        intensity: 0.75,
      });

      // Sol directo con sombras suaves
      lights.push({
        id: 'light_sun',
        type: 'directional',
        position: { x: bounds.maxX + 10, y: 25, z: bounds.minZ - 10 },
        color: '#fffbeb',
        intensity: 1.2,
        castShadow: true,
      });
    } else if (mode === 'night') {
      // Luz nocturna tenue y azulada
      lights.push({
        id: 'light_ambient_night',
        type: 'ambient',
        color: '#1e293b',
        intensity: 0.25,
      });

      // Luna suave
      lights.push({
        id: 'light_moon',
        type: 'directional',
        position: { x: bounds.minX - 10, y: 20, z: bounds.maxZ + 10 },
        color: '#93c5fd',
        intensity: 0.4,
        castShadow: true,
      });

      // Puntos de luz cálida en cada habitación
      floors.forEach((f, idx) => {
        lights.push({
          id: `room_light_${f.id}`,
          type: 'point',
          position: { x: f.center3D.x, y: f.heightM - 0.2, z: f.center3D.z },
          color: idx % 2 === 0 ? '#ffedd5' : '#fef3c7',
          intensity: 1.1,
          distance: 8.0,
          castShadow: true,
        });
      });
    } else {
      // Modo neutro / estudio
      lights.push({
        id: 'light_neutral_ambient',
        type: 'ambient',
        color: '#ffffff',
        intensity: 0.9,
      });
      lights.push({
        id: 'light_neutral_dir',
        type: 'directional',
        position: { x: 0, y: 20, z: 0 },
        color: '#ffffff',
        intensity: 0.8,
      });
    }

    return lights;
  }

  /**
   * Genera los puntos de vista y presets de cámara para navegación fluida
   */
  private static generateCameraPresets(
    floors: Floor3D[],
    bounds: { widthM: number; lengthM: number; center: Vector3D }
  ): CameraPreset[] {
    const maxDim = Math.max(bounds.widthM, bounds.lengthM, 6);
    const presets: CameraPreset[] = [];

    // 1. Casa Completa / Vista General
    presets.push({
      id: 'cam_overview',
      name: '🏠 Casa completa',
      description: 'Vista axonométrica general de la vivienda',
      position: { x: maxDim * 0.9, y: maxDim * 1.1, z: maxDim * 0.9 },
      target: { x: 0, y: 1.0, z: 0 },
      mode: 'orbit',
    });

    // 2. Vista Superior (2D/3D Top-down)
    presets.push({
      id: 'cam_top',
      name: '📐 Vista superior',
      description: 'Vista ortogonal cenital',
      position: { x: 0, y: maxDim * 1.6, z: 0.001 },
      target: { x: 0, y: 0, z: 0 },
      mode: 'top',
    });

    // 3. Vista Isométrica
    presets.push({
      id: 'cam_iso',
      name: '🧊 Vista isométrica',
      description: 'Perspectiva isométrica a 45°',
      position: { x: maxDim * 0.8, y: maxDim * 0.8, z: maxDim * 0.8 },
      target: { x: 0, y: 0.5, z: 0 },
      mode: 'isometric',
    });

    // 4. Modo Recorrido / Primera Persona
    presets.push({
      id: 'cam_walkthrough',
      name: '🚶 Recorrido',
      description: 'Paseo en primera persona con controles WASD',
      position: floors.length > 0 ? { x: floors[0].center3D.x, y: 1.70, z: floors[0].center3D.z } : { x: 0, y: 1.70, z: 0 },
      target: floors.length > 0 ? { x: floors[0].center3D.x, y: 1.70, z: floors[0].center3D.z + 1 } : { x: 0, y: 1.70, z: 1 },
      mode: 'first_person',
    });

    // 5. Presets por estancias detectadas (Salón, Cocina, Dormitorio, Baño, etc.)
    floors.forEach((room) => {
      const icon = this.getRoomIcon(room.name, room.roomType);
      presets.push({
        id: `cam_room_${room.id}`,
        name: `${icon} ${room.name}`,
        description: `Enfocar estancia ${room.name}`,
        position: { x: room.center3D.x + 2.5, y: 2.2, z: room.center3D.z + 2.5 },
        target: { x: room.center3D.x, y: 0.8, z: room.center3D.z },
        mode: 'room_focus',
        roomId: room.id,
      });
    });

    return presets;
  }

  private static getRoomIcon(name: string, type?: string): string {
    const txt = `${name} ${type || ''}`.toLowerCase();
    if (txt.includes('salón') || txt.includes('salon') || txt.includes('living')) return '🛋️';
    if (txt.includes('dormitorio') || txt.includes('habitación') || txt.includes('bed')) return '🛏️';
    if (txt.includes('cocina') || txt.includes('kitchen')) return '🍳';
    if (txt.includes('baño') || txt.includes('aseo') || txt.includes('bath')) return '🚿';
    if (txt.includes('despacho') || txt.includes('estudio') || txt.includes('office')) return '💼';
    if (txt.includes('terraza') || txt.includes('balcón') || txt.includes('balcon')) return '☀️';
    return '🚪';
  }

  private static getRoomFloorColor(roomType?: string, customColor?: string): string {
    if (customColor) return customColor;
    const t = (roomType || '').toLowerCase();
    if (t.includes('baño') || t.includes('aseo') || t.includes('bath')) return '#e5e7eb'; // Baldosa clara
    if (t.includes('cocina') || t.includes('kitchen')) return '#d1d5db'; // Cerámica
    if (t.includes('terraza') || t.includes('balcon')) return '#cbd5e1'; // Exterior
    return '#b48a60'; // Madera roble por defecto
  }

  private static compute2DBoundingBox(data: Input2DConversionData): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    (data.walls || []).forEach((w) => {
      minX = Math.min(minX, w.startX, w.endX);
      maxX = Math.max(maxX, w.startX, w.endX);
      minY = Math.min(minY, w.startY, w.endY);
      maxY = Math.max(maxY, w.startY, w.endY);
    });

    (data.rooms || []).forEach((r) => {
      (r.polygon || []).forEach((p) => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });
    });

    if (minX === Infinity) {
      return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 };
    }

    return { minX, maxX, minY, maxY };
  }
}
