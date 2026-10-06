/**
 * HBD — HOME BOARD DESIGNER (V10.0.0)
 * Test Suite del Motor de Reglas Espaciales y Habitabilidad (SpatialRulesEngine)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  SpatialRulesEngine,
  GeometricMetricsEngine,
  Point2D,
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
  console.log('🧪 HBD V10.0.0 — SUITE DE PRUEBAS DE REGLAS ESPACIALES');
  console.log('============================================================\n');

  // --- 1. Reglas por Defecto y Metadatos ---
  console.log('--- 1. Reglas por Defecto y Metadatos ---');
  const defaultRules = SpatialRulesEngine.getDefaultRules();
  assert(defaultRules.length >= 6, `Dispone de ${defaultRules.length} reglas espaciales configurables`);
  assert(defaultRules.every((r) => r.source === 'REFERENTIAL_CTE' || r.source === 'HABITABILITY_RECOMMENDATION'), 'Todas las reglas están marcadas como REFERENCIALES');
  assert(defaultRules.every((r) => r.requiresProValidation === true), 'Todas las reglas exigen validación profesional');

  // --- 2. Evaluación de Altura Libre (RULE_MIN_CEILING_HEIGHT) ---
  console.log('\n--- 2. Evaluación de Altura Libre ---');
  // Caso A: Salón con 2.60m -> VALID
  const resValidHeight = SpatialRulesEngine.evaluateSpace({
    name: 'Salón',
    roomType: 'living',
    heightM: 2.6,
  });
  const ruleH1 = resValidHeight.results.find((r) => r.ruleCode === 'RULE_MIN_CEILING_HEIGHT');
  assert(ruleH1?.status === 'VALID', 'Altura de 2.60m en salón es VALID');

  // Caso B: Dormitorio con 2.30m -> INVALID (< 2.50m)
  const resLowHeight = SpatialRulesEngine.evaluateSpace({
    name: 'Dormitorio',
    roomType: 'bedroom',
    heightM: 2.3,
  });
  const ruleH2 = resLowHeight.results.find((r) => r.ruleCode === 'RULE_MIN_CEILING_HEIGHT');
  assert(ruleH2?.status === 'INVALID', 'Altura de 2.30m en dormitorio es INVALID (< 2.50m)');

  // Caso C: Baño con 2.30m -> VALID (permite 2.20m en zonas húmedas)
  const resBathHeight = SpatialRulesEngine.evaluateSpace({
    name: 'Baño Principal',
    roomType: 'baño',
    heightM: 2.3,
  });
  const ruleH3 = resBathHeight.results.find((r) => r.ruleCode === 'RULE_MIN_CEILING_HEIGHT');
  assert(ruleH3?.status === 'VALID', 'Altura de 2.30m en baño es VALID (mínimo 2.20m)');

  // Caso D: Sin datos de altura -> UNKNOWN
  const resUnknownHeight = SpatialRulesEngine.evaluateSpace({
    name: 'Estancia sin datos',
    heightM: 0,
  });
  const ruleH4 = resUnknownHeight.results.find((r) => r.ruleCode === 'RULE_MIN_CEILING_HEIGHT');
  assert(ruleH4?.status === 'UNKNOWN', 'Altura no especificada da estado UNKNOWN');

  // --- 3. Evaluación de Superficie Útil Mínima ---
  console.log('\n--- 3. Evaluación de Superficie Útil Mínima ---');
  const polygon15m2: Point2D[] = [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 3 },
    { x: 0, y: 3 },
  ];
  const metrics15m2 = GeometricMetricsEngine.calculateSpaceMetrics({
    polygon: polygon15m2,
  });

  const resArea15 = SpatialRulesEngine.evaluateSpace({
    name: 'Dormitorio Individual',
    roomType: 'bedroom',
    metrics: metrics15m2,
  });
  const ruleArea1 = resArea15.results.find((r) => r.ruleCode === 'RULE_MIN_ROOM_AREA');
  assert(ruleArea1?.status === 'VALID', 'Dormitorio de 15 m² es VALID (≥ 6.0 m²)');

  const polygon4m2: Point2D[] = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 2 },
    { x: 0, y: 2 },
  ];
  const metrics4m2 = GeometricMetricsEngine.calculateSpaceMetrics({
    polygon: polygon4m2,
  });

  const resArea4 = SpatialRulesEngine.evaluateSpace({
    name: 'Estudio Pequeño',
    roomType: 'studio',
    metrics: metrics4m2,
  });
  const ruleArea2 = resArea4.results.find((r) => r.ruleCode === 'RULE_MIN_ROOM_AREA');
  assert(ruleArea2?.status === 'WARNING', 'Estudio de 4 m² genera WARNING (< 6.0 m²)');

  // --- 4. Ratio de Iluminación y Ventilación Natural ---
  console.log('\n--- 4. Ratio de Ventilación e Iluminación Natural ---');
  // Estancia de 20m2 con ventana de 2.40m2 (12% >= 10%) -> VALID
  const resVentValid = SpatialRulesEngine.evaluateSpace({
    name: 'Salón Comedor',
    roomType: 'living',
    metrics: GeometricMetricsEngine.calculateSpaceMetrics({
      polygon: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 4 },
        { x: 0, y: 4 },
      ],
    }),
    windows: [
      {
        id: 'w1',
        wallId: 'w',
        floorId: 'f',
        posX: 1,
        posY: 0,
        widthM: 2.0,
        heightM: 1.2, // 2.4 m2
        elevationM: 0.9,
        rotationDeg: 0,
      },
    ],
  });
  const ruleWin1 = resVentValid.results.find((r) => r.ruleCode === 'RULE_MIN_WINDOW_RATIO');
  assert(ruleWin1?.status === 'VALID', 'Ventana con 12% de superficie respecto al suelo es VALID (≥ 10%)');

  // Estancia de 20m2 con ventana pequeña de 1.0m2 (5% < 10%) -> WARNING
  const resVentLow = SpatialRulesEngine.evaluateSpace({
    name: 'Salón con ventana pequeña',
    roomType: 'living',
    metrics: GeometricMetricsEngine.calculateSpaceMetrics({
      polygon: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 4 },
        { x: 0, y: 4 },
      ],
    }),
    windows: [
      {
        id: 'w2',
        wallId: 'w',
        floorId: 'f',
        posX: 1,
        posY: 0,
        widthM: 1.0,
        heightM: 1.0, // 1.0 m2
        elevationM: 0.9,
        rotationDeg: 0,
      },
    ],
  });
  const ruleWin2 = resVentLow.results.find((r) => r.ruleCode === 'RULE_MIN_WINDOW_RATIO');
  assert(ruleWin2?.status === 'WARNING', 'Ventana con 5% de ratio es WARNING (< 10%)');

  // --- 5. Anchura de Puertas y Accesibilidad ---
  console.log('\n--- 5. Anchura de Paso en Puertas ---');
  const resDoorValid = SpatialRulesEngine.evaluateSpace({
    name: 'Entrada',
    doors: [
      {
        id: 'd1',
        wallId: 'w',
        floorId: 'f',
        posX: 0,
        posY: 0,
        widthM: 0.85,
        heightM: 2.1,
        rotationDeg: 0,
      },
    ],
  });
  const ruleDoor1 = resDoorValid.results.find((r) => r.ruleCode === 'RULE_DOOR_MIN_WIDTH');
  assert(ruleDoor1?.status === 'VALID', 'Puerta de 0.85m es VALID (≥ 0.80m)');

  const resDoorNarrow = SpatialRulesEngine.evaluateSpace({
    name: 'Habitación con puerta estrecha',
    doors: [
      {
        id: 'd2',
        wallId: 'w',
        floorId: 'f',
        posX: 0,
        posY: 0,
        widthM: 0.65,
        heightM: 2.1,
        rotationDeg: 0,
      },
    ],
  });
  const ruleDoor2 = resDoorNarrow.results.find((r) => r.ruleCode === 'RULE_DOOR_MIN_WIDTH');
  assert(ruleDoor2?.status === 'WARNING', 'Puerta de 0.65m genera WARNING (< 0.80m)');

  // --- 6. Puntuación Global de Cumplimiento (Compliance Score) ---
  console.log('\n--- 6. Resumen y Puntuación de Cumplimiento ---');
  assert(typeof resVentValid.complianceScore === 'number', 'Calcula complianceScore numérico');
  assert(resVentValid.complianceScore >= 0 && resVentValid.complianceScore <= 100, 'Compliance score está en el rango [0, 100]');
  assert(resVentValid.requiresProValidation === true, 'El resumen general retiene el flag de validación profesional');

  console.log('\n============================================================');
  console.log(`📊 RESULTADOS V10 SPATIAL RULES: ${passed} pasadas, ${failed} fallidas`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error running spatial rules tests:', err);
  process.exit(1);
});
