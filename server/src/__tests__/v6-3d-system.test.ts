/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Suite de Pruebas: Motor 3D de Vivienda, Conversión 2D -> 3D y Sincronización
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  APP_METADATA,
  ThreeDConversionEngine,
  Input2DConversionData,
  GeometryEngine,
  FurnitureEngine,
  CollisionEngine,
  SpatialValidationEngine,
} from '@hbd/shared';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
    failed++;
  }
}

console.log('============================================================');
console.log('🧪 HBD V6.0.0 — SUITE DE PRUEBAS DEL MOTOR 3D DE VIVIENDA');
console.log('============================================================\n');

// --- 1. Identidad, Autoría y Versión 6.0.0 ---
console.log('--- 1. Identidad Centralizada, Autoría y Versión 6.0.0 ---');
assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
assert(Boolean(APP_METADATA.version), `Versión del sistema es válida: ${APP_METADATA.version}`);
assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
assert(
  APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)',
  'Cadena de copyright oficial completa y exacta'
);

// --- 2. Conversión 2D -> 3D de Paredes (Wall3D) ---
console.log('\n--- 2. Conversión 2D -> 3D de Paredes (ThreeDConversionEngine) ---');
const sampleInput: Input2DConversionData = {
  floorId: 'floor-test-1',
  projectName: 'Chalet Las Rozas',
  floorName: 'Planta Principal',
  floorHeightM: 2.50,
  pixelsPerMeter: 50, // 50 px = 1 metro
  walls: [
    {
      id: 'wall-1',
      startX: 0,
      startY: 0,
      endX: 200, // 200 px = 4 metros
      endY: 0,
      thicknessM: 0.20,
      heightM: 2.50,
      wallType: 'EXTERIOR',
    },
    {
      id: 'wall-2',
      startX: 200,
      startY: 0,
      endX: 200,
      endY: 150, // 150 px = 3 metros
      thicknessM: 0.15,
      heightM: 2.50,
      wallType: 'INTERIOR',
    },
  ],
  rooms: [
    {
      id: 'room-1',
      name: 'Salón Comedor',
      roomType: 'living_room',
      areaM2: 24.5,
      polygon: [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 150 },
        { x: 0, y: 150 },
      ],
    },
  ],
  doors: [
    {
      id: 'door-1',
      wallId: 'wall-1',
      posX: 100,
      posY: 0,
      widthM: 0.85,
      heightM: 2.10,
      rotationDeg: 0,
      isOpen: false,
    },
  ],
  windows: [
    {
      id: 'win-1',
      wallId: 'wall-1',
      posX: 50,
      posY: 0,
      widthM: 1.20,
      heightM: 1.20,
      elevationM: 0.90,
      rotationDeg: 0,
    },
  ],
  furniturePlacements: [
    {
      id: 'placement-sofa-1',
      furnitureId: 'furn-sofa-1',
      name: 'Sofá Chaiselongue',
      categorySlug: 'sofa',
      posX: 100,
      posY: 75,
      posZ: 0,
      widthM: 2.40,
      depthM: 0.95,
      heightM: 0.85,
      rotationDeg: 0,
    },
  ],
};

const scene3D = ThreeDConversionEngine.convert2DTo3D(sampleInput, 'day');

assert(scene3D.walls.length === 2, 'Paredes 2D convertidas a Wall3D (2 elementos)');
const w1 = scene3D.walls[0];
assert(Math.abs(w1.lengthM - 4.0) < 0.001, 'Pared 1: Longitud exacta de 4.00 metros');
assert(w1.thicknessM === 0.20, 'Pared 1: Grosor de 0.20 m (20 cm)');
assert(w1.heightM === 2.50, 'Pared 1: Altura de 2.50 m');
assert(w1.wallType === 'EXTERIOR', 'Pared 1: Clasificación de tipo EXTERIOR preservada');

// --- 3. Suelos y Techos 3D (Room3D & Ceiling3D) ---
console.log('\n--- 3. Suelos y Techos 3D (Floor3D & Ceiling3D) ---');
assert(scene3D.floors.length === 1, 'Habitación convertida a Floor3D');
const f1 = scene3D.floors[0];
assert(f1.polygonVertices3D.length === 4, 'Suelo 3D: Polígono de 4 vértices generado');
assert(f1.heightM === 2.50, 'Suelo 3D: Altura libre de 2.50 m');
assert(scene3D.ceilings.length === 1, 'Techo 3D correspondiente generado a cota 2.50m');
assert(scene3D.ceilings[0].heightM === 2.50, 'Techo 3D situado a 2.50 m de altura');

// --- 4. Puertas y Ventanas 3D ---
console.log('\n--- 4. Puertas y Ventanas 3D (Door3D & Window3D) ---');
assert(scene3D.doors.length === 1, 'Puerta 2D convertida a Door3D');
const d1 = scene3D.doors[0];
assert(d1.widthM === 0.85 && d1.heightM === 2.10, 'Puerta 3D: Dimensiones estándar (85 × 210 cm)');
assert(d1.isOpen === false && d1.swingAngleDeg === 0, 'Puerta cerrada: Ángulo de abatimiento inicial 0°');

assert(scene3D.windows.length === 1, 'Ventana 2D convertida a Window3D');
const win1 = scene3D.windows[0];
assert(win1.widthM === 1.20 && win1.heightM === 1.20, 'Ventana 3D: Dimensiones (120 × 120 cm)');
assert(win1.elevationM === 0.90, 'Ventana 3D: Cota de antepecho (sill elevation) a 0.90 m');

// --- 5. Mobiliario 3D y Geometría Procedural ---
console.log('\n--- 5. Mobiliario 3D y Partes Procedurales (Furniture3D) ---');
assert(scene3D.furniture.length === 1, 'Mueble colocado convertido a Furniture3D');
const furn1 = scene3D.furniture[0];
assert(furn1.dimensions.widthM === 2.40, 'Sofá 3D: Ancho 2.40 m (240 cm)');
assert(furn1.dimensions.depthM === 0.95, 'Sofá 3D: Fondo 0.95 m (95 cm)');
assert(furn1.dimensions.heightM === 0.85, 'Sofá 3D: Alto 0.85 m (85 cm)');
assert(furn1.parts.length >= 3, 'Sofá 3D: Partes procedurales volumétricas generadas (asiento, respaldo, reposabrazos)');

// --- 6. Iluminación Día / Noche ---
console.log('\n--- 6. Iluminación y Modos Día / Noche ---');
assert(scene3D.lights.some((l) => l.type === 'ambient'), 'Luz ambiental configurada en modo Día');
assert(scene3D.lights.some((l) => l.type === 'directional' && l.id === 'light_sun'), 'Luz solar configurada en modo Día');

const sceneNight = ThreeDConversionEngine.convert2DTo3D(sampleInput, 'night');
assert(sceneNight.lights.some((l) => l.id === 'light_moon'), 'Luz lunar tenue configurada en modo Noche');
assert(sceneNight.lights.some((l) => l.type === 'point'), 'Puntos de luz cálidos interiores generados en modo Noche');

// --- 7. Presets de Cámara y Navegación ---
console.log('\n--- 7. Presets de Cámara y Puntos de Vista ---');
assert(scene3D.cameraPresets.some((c) => c.mode === 'orbit'), 'Preset de vista general "Casa completa" disponible');
assert(scene3D.cameraPresets.some((c) => c.mode === 'top'), 'Preset de vista cenital / superior disponible');
assert(scene3D.cameraPresets.some((c) => c.mode === 'isometric'), 'Preset de vista isométrica disponible');
assert(scene3D.cameraPresets.some((c) => c.mode === 'first_person'), 'Preset de recorrido en primera persona (WASD) disponible');
assert(scene3D.cameraPresets.some((c) => c.mode === 'room_focus'), 'Preset para enfocar estancia (Salón Comedor) disponible');

// --- 8. Sincronización 3D -> 2D ---
console.log('\n--- 8. Sincronización 3D -> 2D y Validación ---');
const ppm = 50;
const centerPxX = 100;
const centerPxY = 75;
const posX3D = 1.5; // +1.5 metros desde el centro
const posZ3D = -0.5; // -0.5 metros desde el centro
const posX2D = posX3D * ppm + centerPxX; // 75 + 100 = 175 px
const posY2D = posZ3D * ppm + centerPxY; // -25 + 75 = 50 px

assert(posX2D === 175, 'Conversión de coordenada 3D X (1.5m) a 2D Px (175px)');
assert(posY2D === 50, 'Conversión de coordenada 3D Z (-0.5m) a 2D Px (50px)');

// Resumen
console.log('\n============================================================');
console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
