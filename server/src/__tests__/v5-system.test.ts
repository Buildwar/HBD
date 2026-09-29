/**
 * HBD — HOME BOARD DESIGNER V5.0.0
 * Comprehensive System, Furniture Engine & Spatial Validation Test Suite
 */

import {
  APP_METADATA,
  GeometryEngine,
  FurnitureEngine,
  CollisionEngine,
  SpatialValidationEngine,
  SpatialValidationStatus,
  WallType,
} from '@hbd/shared';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n============================================================');
  console.log('🧪 HBD V5.0.0 — SUITE DE PRUEBAS DE MOBILIARIO Y VALIDACIÓN ESPACIAL');
  console.log('============================================================\n');

  // --- BLOQUE 1: IDENTIDAD Y AUTORÍA OFICIAL ---
  console.log('--- 1. Identidad Centralizada, Autoría y Versión 5.0.0 ---');
  assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
  assert(Boolean(APP_METADATA.version), `Versión del sistema es válida: ${APP_METADATA.version}`);
  assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
  assert(
    APP_METADATA.copyright.includes('© 2026 Adrián Palma — HBD (Home Board Designer)'),
    'Cadena de copyright oficial completa y exacta'
  );

  // --- BLOQUE 2: MOTOR DE MOBILIARIO (FurnitureEngine) ---
  console.log('\n--- 2. Motor de Mobiliario (FurnitureEngine) ---');

  // Conversión de unidades métricas
  const mFromCm = FurnitureEngine.convertUnit(240, 'cm', 'm');
  assert(mFromCm === 2.4, 'Conversión 240 cm -> 2.4 m');

  const cmFromM = FurnitureEngine.convertUnit(0.95, 'm', 'cm');
  assert(cmFromM === 95, 'Conversión 0.95 m -> 95 cm');

  const mFromMm = FurnitureEngine.convertUnit(850, 'mm', 'm');
  assert(mFromMm === 0.85, 'Conversión 850 mm -> 0.85 m');

  // Validación de dimensiones físicas
  const validDim = FurnitureEngine.validateDimensions(2.40, 0.95, 0.85);
  assert(validDim.isValid, 'Dimensiones estándar de sofá (2.40 × 0.95 × 0.85 m) son válidas');

  const invalidZeroDim = FurnitureEngine.validateDimensions(0, 0.95, 0.85);
  assert(!invalidZeroDim.isValid, 'Dimensiones con valor 0 son rechazadas');

  const invalidNegDim = FurnitureEngine.validateDimensions(-1.5, 0.95, 0.85);
  assert(!invalidNegDim.isValid, 'Dimensiones negativas son rechazadas');

  // Cálculo de Oriented Bounding Box (OBB) en 2D
  const obb0 = FurnitureEngine.computeOrientedBoundingBox({ x: 200, y: 200 }, 240, 95, 0);
  assert(obb0.vertices.length === 4, 'OBB genera 4 vértices para el mueble');
  assert(obb0.minX === 80 && obb0.maxX === 320, 'Extremos X a 0°: 200 ± 120 = [80, 320]');
  assert(obb0.minY === 152.5 && obb0.maxY === 247.5, 'Extremos Y a 0°: 200 ± 47.5 = [152.5, 247.5]');

  // Rotación a 90°
  const obb90 = FurnitureEngine.computeOrientedBoundingBox({ x: 200, y: 200 }, 240, 95, 90);
  assert(
    Math.round(obb90.maxX - obb90.minX) === 95 && Math.round(obb90.maxY - obb90.minY) === 240,
    'A 90° de rotación, la orientación espacial se invierte (Ancho 95px, Fondo 240px)'
  );

  // --- BLOQUE 3: MOTOR DE COLISIONES (CollisionEngine) ---
  console.log('\n--- 3. Motor de Colisiones (CollisionEngine) ---');

  // Habitación de prueba 4.0m x 3.0m (400px x 300px @ 100px/m)
  const sampleRoomPolygon = [
    { x: 0, y: 0 },
    { x: 400, y: 0 },
    { x: 400, y: 300 },
    { x: 0, y: 300 },
  ];

  // Test SAT entre dos rectángulos que se cruzan
  const polyA = [
    { x: 10, y: 10 },
    { x: 50, y: 10 },
    { x: 50, y: 50 },
    { x: 10, y: 50 },
  ];
  const polyB = [
    { x: 30, y: 30 },
    { x: 70, y: 30 },
    { x: 70, y: 70 },
    { x: 30, y: 70 },
  ];
  const polyDisjoint = [
    { x: 100, y: 100 },
    { x: 150, y: 100 },
    { x: 150, y: 150 },
    { x: 100, y: 150 },
  ];
  assert(CollisionEngine.testPolygonOverlap(polyA, polyB), 'SAT detecta solapamiento entre polígonos');
  assert(!CollisionEngine.testPolygonOverlap(polyA, polyDisjoint), 'SAT confirma que polígonos separados no colisionan');

  // Test Mueble dentro de la habitación
  const obbInside = FurnitureEngine.computeOrientedBoundingBox({ x: 200, y: 150 }, 240, 95, 0);
  const containmentInside = CollisionEngine.checkRoomContainment(obbInside, sampleRoomPolygon);
  assert(containmentInside.isFullyInside, 'Mueble completamente dentro de los límites de la habitación');

  // Test Mueble fuera de la habitación (sobresale por la derecha)
  const obbOutside = FurnitureEngine.computeOrientedBoundingBox({ x: 380, y: 150 }, 240, 95, 0);
  const containmentOutside = CollisionEngine.checkRoomContainment(obbOutside, sampleRoomPolygon);
  assert(!containmentOutside.isFullyInside, 'Detecta que el mueble sobresale de los límites de la estancia');

  // Test Colisión de Mueble contra Pared
  const walls = [
    { id: 'wall-left', startX: 0, startY: 0, endX: 0, endY: 300, thicknessM: 0.15 },
  ];
  const obbHittingWall = FurnitureEngine.computeOrientedBoundingBox({ x: 50, y: 150 }, 240, 95, 0); // minX = -70 (atraviesa x=0)
  const wallCollisions = CollisionEngine.checkWallCollisions(obbHittingWall, walls, 100);
  assert(wallCollisions.length > 0, 'Detecta colisión de mueble atravesando una pared');

  // Test Puerta bloqueada
  const doors = [{ id: 'door-main', posX: 0, posY: 100, widthM: 0.80 }];
  const obbNearDoor = FurnitureEngine.computeOrientedBoundingBox({ x: 40, y: 100 }, 100, 60, 0);
  const blockedDoors = CollisionEngine.checkDoorSwingClearance(obbNearDoor, doors, 100);
  assert(blockedDoors.length > 0, 'Detecta bloqueo de zona de abatimiento de puerta');

  // --- BLOQUE 4: VALIDACIÓN ESPACIAL ("¿CABE AQUÍ?") ---
  console.log('\n--- 4. Motor de Validación Espacial ("¿CABE AQUÍ?") ---');

  // Caso 1: CABE PERFECTAMENTE (Resultado Positivo: VALID)
  const validationPos = SpatialValidationEngine.validatePlacement({
    furnitureId: 'sofa-1',
    furnitureName: 'Sofá 3 Plazas',
    posX: 200,
    posY: 150,
    widthM: 2.40,
    depthM: 0.95,
    heightM: 0.85,
    rotationDeg: 0,
    scaleFactor: 100,
    room: { id: 'room-1', name: 'Salón', polygon: sampleRoomPolygon },
    walls,
    doors,
    windows: [],
    otherPlacements: [],
  });
  assert(validationPos.status === SpatialValidationStatus.VALID, '¿CABE AQUÍ? Caso válido -> Estado VALID (Compatible)');
  assert(validationPos.isCompatible === true, 'isCompatible es true en caso favorable');
  assert(validationPos.margins.leftCm > 0 && validationPos.margins.rightCm > 0, 'Márgenes laterales calculados en cm');

  // Caso 2: NO CABE / COLISIÓN (Resultado Negativo: INVALID)
  const validationNeg = SpatialValidationEngine.validatePlacement({
    furnitureId: 'sofa-2',
    furnitureName: 'Sofá 3 Plazas',
    posX: 40, // Atraviesa pared izquierda
    posY: 150,
    widthM: 2.40,
    depthM: 0.95,
    heightM: 0.85,
    rotationDeg: 0,
    scaleFactor: 100,
    room: { id: 'room-1', name: 'Salón', polygon: sampleRoomPolygon },
    walls,
    doors,
    windows: [],
    otherPlacements: [],
  });
  assert(validationNeg.status === SpatialValidationStatus.INVALID, '¿CABE AQUÍ? Caso con invasión de pared -> Estado INVALID');
  assert(validationNeg.collisions.length > 0, 'Reporta colisiones activas en el resultado estructurado');

  // Caso 3: REVISAR / PASO REDUCIDO (Resultado de Advertencia: WARNING)
  const validationWarn = SpatialValidationEngine.validatePlacement({
    furnitureId: 'sofa-3',
    furnitureName: 'Sofá 3 Plazas',
    posX: 150,
    posY: 220, // Queda a ~32cm de la pared inferior (paso recomendado > 70cm)
    widthM: 2.40,
    depthM: 0.95,
    heightM: 0.85,
    rotationDeg: 0,
    scaleFactor: 100,
    room: { id: 'room-1', name: 'Salón', polygon: sampleRoomPolygon },
    walls: [],
    doors: [],
    windows: [],
    otherPlacements: [],
  });
  assert(
    validationWarn.status === SpatialValidationStatus.WARNING,
    '¿CABE AQUÍ? Caso con paso reducido -> Estado WARNING (Revisar)'
  );
  assert(validationWarn.clearanceWarnings.length > 0, 'Incluye advertencia de paso reducido');

  // Caso 4: Modificación de Dimensiones
  const modifiedW = FurnitureEngine.convertUnit(280, 'cm', 'm'); // 2.80m
  assert(modifiedW === 2.8, 'Modificación directa de dimensión: 240cm -> 280cm (2.8m)');

  // --- RESUMEN FINAL ---
  console.log('\n============================================================');
  console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
