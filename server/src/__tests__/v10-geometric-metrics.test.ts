/**
 * HBD — HOME BOARD DESIGNER (V10.0.0)
 * Test Suite del Motor de Inteligencia Geométrica (GeometricMetricsEngine)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  GeometricMetricsEngine,
  ConstructionIntelligenceEngine,
  Point2D,
  DoorDto,
  WindowDto,
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

async function runTests() {
  console.log('============================================================');
  console.log('🧪 HBD V10.0.0 — SUITE DE PRUEBAS DE INTELIGENCIA GEOMÉTRICA');
  console.log('============================================================\n');

  // --- 1. Habitación Rectangular Estándar ---
  console.log('--- 1. Habitación Rectangular Estándar (5.0m x 4.0m, H=2.50m) ---');
  const rectPolygon: Point2D[] = [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 4 },
    { x: 0, y: 4 },
  ];

  const rectMetrics = GeometricMetricsEngine.calculateSpaceMetrics({
    name: 'Salón',
    polygon: rectPolygon,
    heightM: 2.5,
    wallThicknessM: 0.15,
  });

  assert(rectMetrics.grossAreaM2.value === 20.0, 'Superficie bruta es 20.0 m²');
  assert(rectMetrics.usableAreaM2.value === 20.0, 'Superficie útil es 20.0 m²');
  assert(rectMetrics.perimeterM.value === 18.0, 'Perímetro exterior es 18.0 m (5+4+5+4)');
  assert(rectMetrics.grossWallAreaM2.value === 45.0, 'Superficie bruta de pared es 45.0 m² (18m * 2.5m)');
  assert(rectMetrics.ceilingAreaM2.value === 20.0, 'Superficie de techo es 20.0 m²');
  assert(rectMetrics.volumeM3.value === 50.0, 'Volumen interior es 50.0 m³ (20m² * 2.5m)');
  assert(rectMetrics.isComplete === true, 'Métrica marcada como completa');

  // --- 2. Deducción de Huecos: Puertas y Ventanas ---
  console.log('\n--- 2. Deducción de Huecos (1 Puerta 0.80x2.10m, 1 Ventana 1.20x1.20m) ---');
  const doors: DoorDto[] = [
    {
      id: 'd1',
      wallId: 'w1',
      floorId: 'f1',
      posX: 1,
      posY: 0,
      widthM: 0.8,
      heightM: 2.1,
      rotationDeg: 0,
    },
  ];

  const windows: WindowDto[] = [
    {
      id: 'w1',
      wallId: 'w2',
      floorId: 'f1',
      posX: 5,
      posY: 2,
      widthM: 1.2,
      heightM: 1.2,
      elevationM: 0.9,
      rotationDeg: 0,
    },
  ];

  const metricsWithOpenings = GeometricMetricsEngine.calculateSpaceMetrics({
    name: 'Salón con Huecos',
    polygon: rectPolygon,
    heightM: 2.5,
    doors,
    windows,
  });

  const doorArea = 0.8 * 2.1; // 1.68 m2
  const winArea = 1.2 * 1.2;  // 1.44 m2
  const totalOpenings = Math.round((doorArea + winArea) * 100) / 100; // 3.12 m2
  const expectedNetWall = Math.round((45.0 - totalOpenings) * 100) / 100; // 41.88 m2

  assert(metricsWithOpenings.doorsAreaM2.value === 1.68, 'Área de puertas calculada exactamente (1.68 m²)');
  assert(metricsWithOpenings.windowsAreaM2.value === 1.44, 'Área de ventanas calculada exactamente (1.44 m²)');
  assert(metricsWithOpenings.openingsAreaM2.value === 3.12, 'Área total de huecos es 3.12 m²');
  assert(metricsWithOpenings.netWallAreaM2.value === expectedNetWall, `Superficie neta de pared (${expectedNetWall} m²) tras descontar huecos`);
  
  // Rodapié descuenta el ancho de la puerta del perímetro total: 18.0 - 0.80 = 17.20 m
  assert(metricsWithOpenings.skirtingBoardM.value === 17.2, 'Longitud de rodapié descuenta ancho de puerta (17.2 m)');

  // --- 3. Habitación Irregular en L ---
  console.log('\n--- 3. Habitación Irregular en forma de L ---');
  const lPolygon: Point2D[] = [
    { x: 0, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 3 },
    { x: 3, y: 3 },
    { x: 3, y: 5 },
    { x: 0, y: 5 },
  ];
  // Área L = (6*3) + (3*2) = 18 + 6 = 24 m2
  // Perímetro = 6 + 3 + 3 + 2 + 3 + 5 = 22 m

  const lMetrics = GeometricMetricsEngine.calculateSpaceMetrics({
    name: 'Espacio Abierto L',
    polygon: lPolygon,
    heightM: 2.6,
  });

  assert(lMetrics.usableAreaM2.value === 24.0, 'Área de polígono en L es 24.0 m²');
  assert(lMetrics.perimeterM.value === 22.0, 'Perímetro de polígono en L es 22.0 m');
  assert(lMetrics.grossWallAreaM2.value === 57.2, 'Superficie de pared en L es 57.2 m² (22m * 2.6m)');

  // --- 4. Gestión de Geometría Incompleta o Inválida ---
  console.log('\n--- 4. Gestión de Geometría Incompleta (< 3 vértices) ---');
  const invalidPolygon: Point2D[] = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
  ];

  const emptyMetrics = GeometricMetricsEngine.calculateSpaceMetrics({
    name: 'Polígono Abierto',
    polygon: invalidPolygon,
  });

  assert(emptyMetrics.isComplete === false, 'isComplete es false para geometría insuficiente');
  assert(emptyMetrics.grossAreaM2.source === 'UNKNOWN', 'Fuente de medición es UNKNOWN');
  assert(emptyMetrics.warnings.length > 0, 'Genera advertencia clara sobre polígono incompleto');

  // --- 5. Consumo de Métricas V10 por V11 Construction Engine ---
  console.log('\n--- 5. Consumo de Métricas V10 por V11 Construction Intelligence ---');
  const generatedItems = ConstructionIntelligenceEngine.generateItemsFromGeometricMetrics(
    'const-proj-1',
    'space-1',
    'Salón Principal',
    metricsWithOpenings
  );

  assert(generatedItems.length === 3, 'Genera 3 partidas automáticas (pavimento, pintura neta, rodapié)');
  const flooringItem = generatedItems.find((i) => i.category === 'FLOORING' && i.unit === 'm2');
  const paintItem = generatedItems.find((i) => i.category === 'WALL_FINISH');
  const skirtingItem = generatedItems.find((i) => i.category === 'FLOORING' && i.unit === 'm');

  assert(flooringItem?.quantity === 20.0, 'Partida de suelo usa exactamente la superficie útil (20.0 m²)');
  assert(flooringItem?.wastePercent === 8, 'Aplica merma de suelo del 8%');
  assert(flooringItem?.effectiveQuantity === 21.6, 'Cantidad efectiva de suelo con merma es 21.6 m²');

  assert(paintItem?.quantity === expectedNetWall, `Partida de pintura usa superficie neta de pared (${expectedNetWall} m²)`);
  assert(skirtingItem?.quantity === 17.2, 'Partida de rodapié usa longitud útil sin puertas (17.2 m)');

  console.log('\n============================================================');
  console.log(`📊 RESULTADOS V10 GEOMETRIC METRICS: ${passed} pasadas, ${failed} fallidas`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error running geometric metrics tests:', err);
  process.exit(1);
});
