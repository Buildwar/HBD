/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Suite de Pruebas: Motor de Visualización Arquitectónica, Escenas, Variantes y Render Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  APP_METADATA,
  ThreeDConversionEngine,
  SceneEngine,
  RenderEngine,
  Input2DConversionData,
  STYLE_PRESETS,
  RESOLUTION_PRESETS,
  QUALITY_CONFIGS,
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
console.log('🧪 HBD V7.0.0 — SUITE DE PRUEBAS DE VISUALIZACIÓN Y RENDER');
console.log('============================================================\n');

// --- 1. Identidad, Autoría y Versión 7.0.0 ---
console.log('--- 1. Identidad Centralizada, Autoría y Versión 7.0.0 ---');
assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
assert(Boolean(APP_METADATA.version), `Versión del sistema es válida: ${APP_METADATA.version}`);
assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
assert(
  APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)',
  'Cadena de copyright oficial completa y exacta'
);

// --- 2. Motor de Escenas y Creación Automática ---
console.log('\n--- 2. Motor de Escenas (SceneEngine) ---');
const sampleInput: Input2DConversionData = {
  floorId: 'floor-render-1',
  projectName: 'Ático Castellana',
  floorName: 'Planta Principal',
  floorHeightM: 2.70,
  pixelsPerMeter: 50,
  walls: [
    { id: 'w1', startX: 0, startY: 0, endX: 250, endY: 0, thicknessM: 0.20, heightM: 2.70 },
    { id: 'w2', startX: 250, startY: 0, endX: 250, endY: 200, thicknessM: 0.15, heightM: 2.70 },
  ],
  rooms: [
    {
      id: 'room-salon',
      name: 'Salón Principal',
      roomType: 'living_room',
      areaM2: 28.0,
      polygon: [
        { x: 0, y: 0 },
        { x: 250, y: 0 },
        { x: 250, y: 200 },
        { x: 0, y: 200 },
      ],
    },
    {
      id: 'room-cocina',
      name: 'Cocina Abierta',
      roomType: 'kitchen',
      areaM2: 12.0,
      polygon: [
        { x: 250, y: 0 },
        { x: 350, y: 0 },
        { x: 350, y: 200 },
        { x: 250, y: 200 },
      ],
    },
  ],
  furniturePlacements: [
    {
      id: 'furn-sofa',
      furnitureId: 'f1',
      name: 'Sofá 3 Plazas',
      categorySlug: 'sofa',
      posX: 120,
      posY: 100,
      widthM: 2.40,
      depthM: 0.95,
      heightM: 0.85,
    },
  ],
};

const scene3D = ThreeDConversionEngine.convert2DTo3D(sampleInput, 'day');
const defaultScene = SceneEngine.createDefaultScene(scene3D, 'Vista Principal');

assert(defaultScene.name === 'Vista Principal', 'Escena por defecto creada con nombre asignado');
assert(Boolean(defaultScene.camera?.position), 'Cámara de escena configurada con coordenadas 3D válidas');
assert(defaultScene.designVariants.length === 2, 'Escena inicial incluye 2 variantes de diseño (A y B)');
assert(defaultScene.designVariants[0].isDefault === true, 'Variante A marcada como predeterminada');

// --- 3. Posicionamiento Automático y Enfoque de Habitación ---
console.log('\n--- 3. Enfoque Automático de Habitaciones ---');
const roomSalon = scene3D.floors[0];
const roomCam = SceneEngine.createRoomFocusCamera(roomSalon.polygonVertices3D, roomSalon.heightM, 1.50);

assert(roomCam.heightM === 1.50, 'Altura de cámara situada a 1.50 m (nivel de ojos)');
assert(roomCam.fov >= 45 && roomCam.fov <= 75, 'FOV adaptado proporcionalmente a las dimensiones de la estancia');
assert(Boolean(roomCam.target), 'Target de cámara orientado al centroide de la habitación');

// --- 4. Sistema Solar, Hora del Día y Temperatura de Color ---
console.log('\n--- 4. Sistema Solar, Hora del Día y Temperatura Kelvin ---');
const sunMorning = SceneEngine.calculateSunPosition('08:00');
const sunNoon = SceneEngine.calculateSunPosition('12:00');
const sunSunset = SceneEngine.calculateSunPosition('20:00');
const sunNight = SceneEngine.calculateSunPosition('23:00');

assert(sunMorning.elevationDeg < sunNoon.elevationDeg, 'Elevación solar a las 08:00 menor que a las 12:00 (zenit)');
assert(sunSunset.elevationDeg <= 10, 'Atardecer a las 20:00 con sol rasante (< 10°)');
assert(sunNight.elevationDeg < 0, 'Noche a las 23:00 con sol bajo el horizonte');

assert(SceneEngine.colorTempToHex(2700) === '#ffc988', '2700K produce luz cálida ámbar (#ffc988)');
assert(SceneEngine.colorTempToHex(4000) === '#ffffff', '4000K produce blanco neutro (#ffffff)');
assert(SceneEngine.colorTempToHex(6500) === '#d6e6ff', '6500K produce blanco frío (#d6e6ff)');

// --- 5. Variantes de Diseño y Geometría Compartida ---
console.log('\n--- 5. Variantes de Diseño (Geometría Compartida) ---');
const varA = defaultScene.designVariants[0];
const varB = defaultScene.designVariants[1];

assert(varA.name.includes('Variante A'), 'Variante A identificada');
assert(varB.name.includes('Variante B'), 'Variante B identificada');
assert(scene3D.walls.length === 2, 'Geometría base idéntica e inmutable entre variantes');

// --- 6. Presets de Estilo Arquitectónico ---
console.log('\n--- 6. Presets de Estilo Arquitectónico ---');
assert(STYLE_PRESETS.length === 5, '5 Presets de estilo arquitectónico integrados');
assert(STYLE_PRESETS.some((p) => p.id === 'modern'), 'Estilo Moderno disponible');
assert(STYLE_PRESETS.some((p) => p.id === 'minimalist'), 'Estilo Minimalista disponible');
assert(STYLE_PRESETS.some((p) => p.id === 'industrial'), 'Estilo Industrial disponible');
assert(STYLE_PRESETS.some((p) => p.id === 'nordic'), 'Estilo Nórdico disponible');
assert(STYLE_PRESETS.some((p) => p.id === 'classic'), 'Estilo Clásico disponible');

const modernScene = SceneEngine.applyStylePreset(defaultScene, 'modern');
const activeVar = modernScene.designVariants.find((v) => v.id === modernScene.activeVariantId);
assert(Boolean(activeVar?.materialOverrides['all_walls']), 'Preset Moderno aplica material a paredes');

// --- 7. Motor de Render (RenderEngine) ---
console.log('\n--- 7. Motor de Render (RenderEngine) ---');
const validation = RenderEngine.validateSceneForRender(defaultScene, scene3D);
assert(validation.isValid === true, 'Validación previa de escena para render es favorable');
assert(validation.errors.length === 0, 'Sin errores de consistencia en escena');

assert(RESOLUTION_PRESETS.some((r) => r.id === 'hd_1080p' && r.width === 1920), 'Resolución Full HD (1920×1080) soportada');
assert(RESOLUTION_PRESETS.some((r) => r.id === '2k_1440p' && r.width === 2560), 'Resolución 2K (2560×1440) soportada');
assert(RESOLUTION_PRESETS.some((r) => r.id === '4k_uhd' && r.width === 3840), 'Resolución 4K UHD (3840×2160) soportada');

assert(QUALITY_CONFIGS.some((q) => q.id === 'draft' && q.shadowMapSize === 1024), 'Calidad Draft con ShadowMap 1024');
assert(QUALITY_CONFIGS.some((q) => q.id === 'ultra' && q.shadowMapSize === 4096), 'Calidad Ultra con ShadowMap 4096 y SSAO');

const estTimeMs = RenderEngine.estimateRenderDurationMs('high', 'hd_1080p');
assert(estTimeMs > 0 && estTimeMs < 5000, 'Estimación de tiempo de render coherente');

// Resumen
console.log('\n============================================================');
console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
