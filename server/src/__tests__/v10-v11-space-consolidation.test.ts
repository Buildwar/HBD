/**
 * HBD — HOME BOARD DESIGNER (V11.0.0)
 * Test Suite de Consolidación V10 → V11 (Spaces, Functional Zones, Room Compatibility & Construction)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  APP_METADATA,
  GeometricMetricsEngine,
  SpatialRulesEngine,
  ConstructionIntelligenceEngine,
  SpaceDto,
  FunctionalZoneDto,
  FunctionalZoneType,
  PRO_VALIDATION_NOTICE,
} from '@hbd/shared';
import * as fs from 'fs';
import * as path from 'path';

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
  console.log('🧪 HBD — SUITE DE PRUEBAS DE CONSOLIDACIÓN V10 → V11');
  console.log('============================================================\n');

  // --- 1. Identidad Centralizada, Autoría y Versión 11.0.0 ---
  console.log('--- 1. Identidad Centralizada y Versión 11.0.0 ---');
  assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
  assert(Boolean(APP_METADATA.version), `Versión global es válida: ${APP_METADATA.version}`);
  assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
  assert(APP_METADATA.supportedLanguages.length === 2, 'supportedLanguages refleja exactamente [es, en]');
  assert(
    APP_METADATA.supportedLanguages.includes('es') && APP_METADATA.supportedLanguages.includes('en'),
    'supportedLanguages contiene "es" y "en"'
  );

  // --- 2. Modelo Space y Métricas Geométricas V10 ---
  console.log('\n--- 2. Modelo Space y Métricas Geométricas ---');
  const spacePolygon = [
    { x: 0, y: 0 },
    { x: 8, y: 0 },
    { x: 8, y: 5 },
    { x: 0, y: 5 },
  ]; // 40 m2, perímetro 26m

  const spaceMetrics = GeometricMetricsEngine.calculateSpaceMetrics({
    name: 'Open Plan Principal',
    polygon: spacePolygon,
    heightM: 2.7,
  });

  assert(spaceMetrics.usableAreaM2.value === 40.0, 'Superficie útil del espacio es 40.0 m²');
  assert(spaceMetrics.perimeterM.value === 26.0, 'Perímetro exterior del espacio es 26.0 m');
  assert(spaceMetrics.volumeM3.value === 108.0, 'Volumen interior es 108.0 m³ (40m² * 2.7m)');

  const mockSpace: SpaceDto = {
    id: 'space-open-plan-1',
    floorId: 'floor-1',
    name: 'Open Space Salón-Comedor-Cocina',
    roomType: 'OPEN_PLAN',
    polygon: spacePolygon,
    metrics: spaceMetrics,
    heightM: 2.7,
    color: '#10b981',
    functionalZones: [],
    roomIds: ['room-salon-1', 'room-cocina-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  assert(mockSpace.id === 'space-open-plan-1', 'SpaceDto creado con ID válido');
  assert(mockSpace.roomIds?.length === 2, 'Space puede asociar múltiples estancias Room existentes');

  // --- 3. Functional Zones dentro de Space ---
  console.log('\n--- 3. Zonas Funcionales (FunctionalZone) ---');
  const livingZone: FunctionalZoneDto = {
    id: 'zone-living-1',
    parentSpaceId: mockSpace.id,
    name: 'Zona Estar / TV',
    type: 'LIVING',
    polygon: [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 5 },
    ],
    areaM2: {
      value: 25.0,
      unit: 'm²',
      source: 'GEOMETRY_CALCULATED',
    },
  };

  const diningZone: FunctionalZoneDto = {
    id: 'zone-dining-1',
    parentSpaceId: mockSpace.id,
    name: 'Zona Comedor',
    type: 'DINING',
    polygon: [
      { x: 5, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 5 },
      { x: 5, y: 5 },
    ],
    areaM2: {
      value: 15.0,
      unit: 'm²',
      source: 'GEOMETRY_CALCULATED',
    },
  };

  mockSpace.functionalZones = [livingZone, diningZone];

  assert(mockSpace.functionalZones.length === 2, 'Space contiene 2 FunctionalZones');
  const totalZoneArea = mockSpace.functionalZones.reduce((acc, z) => acc + z.areaM2.value, 0);
  assert(totalZoneArea === 40.0, 'La suma de áreas de las zonas (25 + 15) coincide con el total del Space (40 m²)');

  // --- 4. Retrocompatibilidad Room (Estancias físicas existentes) ---
  console.log('\n--- 4. Retrocompatibilidad de Room ---');
  const legacyRoom = {
    id: 'room-dorm-1',
    floorId: 'floor-1',
    spaceId: null, // Room independiente sin Space asignado
    name: 'Dormitorio Principal',
    roomType: 'BEDROOM',
    polygon: [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 3.5 },
      { x: 0, y: 3.5 },
    ],
    areaM2: 14.0,
    heightM: 2.5,
  };

  assert(legacyRoom.spaceId === null, 'Room puede existir de forma autónoma sin Space');
  const legacyMetrics = GeometricMetricsEngine.calculateSpaceMetrics({
    name: legacyRoom.name,
    polygon: legacyRoom.polygon,
    heightM: legacyRoom.heightM,
  });
  assert(legacyMetrics.usableAreaM2.value === 14.0, 'Métricas de Room calculadas con precisión (14.0 m²)');

  // --- 5. Consumo V10 Metrics por V11 Construction Intelligence ---
  console.log('\n--- 5. Consumo de Métricas V10 por V11 Construction Engine ---');
  const itemsFromSpace = ConstructionIntelligenceEngine.generateItemsFromGeometricMetrics(
    'construction-proj-1',
    mockSpace.id,
    mockSpace.name,
    spaceMetrics
  );

  assert(itemsFromSpace.length === 3, 'Genera automáticamente 3 partidas de obra para el Space');
  const flooring = itemsFromSpace.find((i) => i.category === 'FLOORING' && i.unit === 'm2');
  assert(flooring?.spaceId === mockSpace.id, 'ConstructionItem.spaceId referencia directamente el Space');
  assert(flooring?.quantity === 40.0, 'Partida de suelo computa los 40 m² útiles del Space');
  assert(flooring?.effectiveQuantity === 43.2, 'Aplica merma del 8% (40 * 1.08 = 43.2 m²)');

  // --- 6. Evaluación de Reglas Espaciales Referenciales V10 ---
  console.log('\n--- 6. Reglas Espaciales y Validación Profesional ---');
  const rulesResult = SpatialRulesEngine.evaluateSpace({
    id: mockSpace.id,
    name: mockSpace.name,
    heightM: mockSpace.heightM,
    metrics: spaceMetrics,
  });

  assert(rulesResult.requiresProValidation === true, 'El resumen técnico exige validación profesional');
  assert(rulesResult.complianceScore >= 0 && rulesResult.complianceScore <= 100, 'Compliance score normalizado');

  // --- 7. Auditoría de Simetría i18n ---
  console.log('\n--- 7. Simetría y Coherencia de Idiomas (es.json vs en.json) ---');
  const esPath = path.resolve(__dirname, '../../../client/src/i18n/locales/es.json');
  const enPath = path.resolve(__dirname, '../../../client/src/i18n/locales/en.json');
  const es = JSON.parse(fs.readFileSync(esPath, 'utf-8'));
  const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  const esKeys = Object.keys(es);
  const enKeys = Object.keys(en);
  assert(esKeys.length === enKeys.length, `Mismo número de secciones de primer nivel (${esKeys.length})`);
  assert(esKeys.every((k) => enKeys.includes(k)), 'Todas las secciones de ES existen en EN');
  assert(Boolean(es.intelligence && en.intelligence), 'Sección "intelligence" presente en ambos idiomas');
  assert(
    Object.keys(es.intelligence).length === Object.keys(en.intelligence).length,
    `Sección intelligence tiene mismo número de claves (${Object.keys(es.intelligence).length})`
  );

  console.log('\n============================================================');
  console.log(`📊 RESULTADOS DE PRUEBAS CONSOLIDACIÓN V10/V11: ${passed} PASADAS / ${failed} FALLIDAS`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal en suite de pruebas:', err);
  process.exit(1);
});
