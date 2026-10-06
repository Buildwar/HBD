/**
 * HBD — TEST SUITE FASE V21 / 1.21.0
 * SMART HOME & TECHNICAL INFRASTRUCTURE
 * 
 * Batería de pruebas automatizadas para la infraestructura técnica de la vivienda:
 * - ElectricalEngine: Balance de potencia, circuitos normalizados REBT y potencia contratada.
 * - NetworkInfrastructureEngine: Asignación de puertos switch y balance PoE.
 * - WiFiCoverageEngine: Propagación RF, simulación de calor y zonas muertas.
 * - SmartHomeEngine: Topología mesh domótica, pasarelas y detección de huérfanos.
 * - SecurityInfrastructureEngine: Conos de visión FOV de cámaras y zonas de alarma.
 * - HvacPlumbingEngine: Cargas térmicas de clima y caudales hidráulicos simultáneos.
 * - TechnicalValidationEngine: Distancias reglamentarias en zonas húmedas y alturas ergonómicas.
 * - TechnicalInfrastructureEngine: Resumen maestro y codificación.
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ElectricalEngine,
  NetworkInfrastructureEngine,
  WiFiCoverageEngine,
  SmartHomeEngine,
  SecurityInfrastructureEngine,
  HvacPlumbingEngine,
  TechnicalValidationEngine,
  TechnicalInfrastructureEngine,
  TechnicalElementDto,
  TechnicalConnectionDto,
  TechnicalZoneDto,
  STANDARD_SPANISH_CIRCUITS
} from '@hbd/shared';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('🧪 HBD — TEST SUITE V21 (1.21.0): SMART HOME & TECHNICAL INFRASTRUCTURE');
console.log('============================================================\n');

// -------------------------------------------------------------
// 1. ElectricalEngine
// -------------------------------------------------------------
console.log('--- 1. ElectricalEngine & Spanish Standard Circuits ---');
const sampleElectricalElements: TechnicalElementDto[] = [
  {
    id: 'el-1',
    projectId: 'proj-1',
    code: 'ELE-001',
    name: 'Enchufe Salón',
    category: 'ELECTRICAL',
    mountingType: 'WALL_RECESSED',
    status: 'PLANNED',
    position: { x: 2, y: 3, z: 0.30 },
    rotation: 0,
    dimensions: { width: 0.08, height: 0.08, depth: 0.05 },
    circuitId: 'C2',
    powerWatts: 250,
    voltage: 230,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'el-2',
    projectId: 'proj-1',
    code: 'LUM-001',
    name: 'Punto de Luz Salón',
    category: 'LIGHTING',
    mountingType: 'CEILING_SURFACE',
    status: 'PLANNED',
    position: { x: 2, y: 3, z: 2.50 },
    rotation: 0,
    dimensions: { width: 0.15, height: 0.15, depth: 0.10 },
    circuitId: 'C1',
    powerWatts: 20,
    voltage: 230,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'el-3',
    projectId: 'proj-1',
    code: 'CLI-001',
    name: 'Split Aire Acondicionado',
    category: 'HVAC',
    mountingType: 'WALL_SURFACE',
    status: 'PLANNED',
    position: { x: 4, y: 1, z: 2.20 },
    rotation: 0,
    dimensions: { width: 0.80, height: 0.30, depth: 0.20 },
    circuitId: 'C9',
    powerWatts: 2200,
    hvacCoolingKw: 3.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const electricalSummary = ElectricalEngine.calculateLoadSummary(sampleElectricalElements, 'proj-1');
assert(electricalSummary.totalInstalledPowerWatts === 2470, `Potencia total instalada calculada (2470W)`);
assert(electricalSummary.totalDemandPowerWatts > 0, `Potencia demandada simultánea calculada (${electricalSummary.totalDemandPowerWatts}W)`);
assert(electricalSummary.recommendedContractPowerKw >= 3.45, `Potencia contratada recomendada normalizada (${electricalSummary.recommendedContractPowerKw} kW)`);
assert(STANDARD_SPANISH_CIRCUITS['C1'].nominalBreakerAmps === 10, 'Circuito C1 tiene protección magnetotérmica de 10A');
assert(STANDARD_SPANISH_CIRCUITS['C2'].nominalBreakerAmps === 16, 'Circuito C2 tiene protección magnetotérmica de 16A');
assert(STANDARD_SPANISH_CIRCUITS['C3'].nominalBreakerAmps === 25, 'Circuito C3 tiene protección magnetotérmica de 25A');

// -------------------------------------------------------------
// 2. NetworkInfrastructureEngine
// -------------------------------------------------------------
console.log('\n--- 2. NetworkInfrastructureEngine & PoE Budget ---');
const sampleNetworkElements: TechnicalElementDto[] = [
  {
    id: 'net-1',
    projectId: 'proj-1',
    code: 'NET-001',
    name: 'Toma RJ45 Salón',
    category: 'NETWORK',
    mountingType: 'WALL_RECESSED',
    status: 'PLANNED',
    position: { x: 1, y: 1, z: 0.30 },
    rotation: 0,
    dimensions: { width: 0.08, height: 0.08, depth: 0.05 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'net-2',
    projectId: 'proj-1',
    code: 'WIFI-001',
    name: 'AP Wi-Fi 6 Techo',
    category: 'WIFI',
    mountingType: 'CEILING_SURFACE',
    status: 'PLANNED',
    position: { x: 4, y: 4, z: 2.50 },
    rotation: 0,
    dimensions: { width: 0.18, height: 0.18, depth: 0.04 },
    poePowered: true,
    poeClass: '802.3at PoE+',
    powerWatts: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'net-3',
    projectId: 'proj-1',
    code: 'SEC-001',
    name: 'Cámara IP Domo',
    category: 'SECURITY',
    mountingType: 'CEILING_SURFACE',
    status: 'PLANNED',
    position: { x: 0.5, y: 0.5, z: 2.40 },
    rotation: 0,
    dimensions: { width: 0.12, height: 0.12, depth: 0.10 },
    poePowered: true,
    powerWatts: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const networkSummary = NetworkInfrastructureEngine.calculateNetworkSummary(sampleNetworkElements, 'proj-1');
assert(networkSummary.totalDataOutlets === 1, 'Total tomas de datos RJ45 detectadas: 1');
assert(networkSummary.totalPoeDevices === 2, 'Total dispositivos PoE detectados: 2');
assert(networkSummary.totalPoePowerWatts === 35, 'Presupuesto potencia PoE consumida: 35W');
assert(networkSummary.recommendedSwitchPorts >= 8, 'Switch recomendado mínimo 8 puertos');
assert(networkSummary.recommendedPoeBudgetWatts >= 42, 'Presupuesto PoE con margen de seguridad >= 42W');

// -------------------------------------------------------------
// 3. WiFiCoverageEngine
// -------------------------------------------------------------
console.log('\n--- 3. WiFiCoverageEngine & RF Propagation ---');
const wifiAnalysis = WiFiCoverageEngine.simulateCoverage(
  sampleNetworkElements,
  'proj-1',
  { minX: 0, minY: 0, maxX: 8, maxY: 8 },
  [],
  1.0
);
assert(wifiAnalysis.accessPointsCount === 1, 'Detectado 1 Punto de Acceso');
assert(wifiAnalysis.totalAreaM2 === 64, 'Superficie de simulación: 64 m²');
assert(wifiAnalysis.coveragePercentage > 0, `Porcentaje de cobertura calculado: ${wifiAnalysis.coveragePercentage}%`);
assert(wifiAnalysis.heatmapPoints.length > 0, `Generados ${wifiAnalysis.heatmapPoints.length} puntos de mapa de calor`);
assert(WiFiCoverageEngine.getSignalQuality(-50) === 'EXCELLENT', 'RSSI -50 dBm clasificado como EXCELLENT');
assert(WiFiCoverageEngine.getSignalQuality(-65) === 'GOOD', 'RSSI -65 dBm clasificado como GOOD');
assert(WiFiCoverageEngine.getSignalQuality(-72) === 'FAIR', 'RSSI -72 dBm clasificado como FAIR');
assert(WiFiCoverageEngine.getSignalQuality(-80) === 'POOR', 'RSSI -80 dBm clasificado como POOR');
assert(WiFiCoverageEngine.getSignalQuality(-95) === 'NO_SIGNAL', 'RSSI -95 dBm clasificado como NO_SIGNAL');

// -------------------------------------------------------------
// 4. SmartHomeEngine
// -------------------------------------------------------------
console.log('\n--- 4. SmartHomeEngine & Domotics Mesh Topology ---');
const smartHomeElements: TechnicalElementDto[] = [
  {
    id: 'dom-1',
    projectId: 'proj-1',
    code: 'DOM-001',
    name: 'Pasarela Central Zigbee 3.0',
    category: 'SMART_HOME',
    mountingType: 'FURNITURE_INTEGRATED',
    status: 'PLANNED',
    protocol: 'ZIGBEE',
    position: { x: 3, y: 3, z: 0.80 },
    rotation: 0,
    dimensions: { width: 0.10, height: 0.10, depth: 0.03 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dom-2',
    projectId: 'proj-1',
    code: 'DOM-002',
    name: 'Sensor Temperatura Zigbee',
    category: 'SMART_HOME',
    mountingType: 'WALL_SURFACE',
    status: 'PLANNED',
    protocol: 'ZIGBEE',
    position: { x: 1, y: 2, z: 1.50 },
    rotation: 0,
    dimensions: { width: 0.05, height: 0.05, depth: 0.02 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const smartReport = SmartHomeEngine.analyzeTopology(smartHomeElements);
assert(smartReport.totalSmartDevices === 2, 'Total dispositivos domóticos detectados: 2');
assert(smartReport.hubFound === true, 'Pasarela domótica detectada correctamente');
assert(smartReport.orphanedDevicesCount === 0, 'Cero dispositivos huérfanos con pasarela presente');

// -------------------------------------------------------------
// 5. SecurityInfrastructureEngine
// -------------------------------------------------------------
console.log('\n--- 5. SecurityInfrastructureEngine & FOV Vision Cones ---');
const securityElements: TechnicalElementDto[] = [
  {
    id: 'sec-cam-1',
    projectId: 'proj-1',
    code: 'SEC-CAM01',
    name: 'Cámara Entrada Principal',
    category: 'SECURITY',
    mountingType: 'WALL_SURFACE',
    status: 'PLANNED',
    cameraFovDegrees: 110,
    cameraRangeMeters: 10,
    rotation: 45,
    position: { x: 0, y: 0, z: 2.40 },
    dimensions: { width: 0.12, height: 0.12, depth: 0.12 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const securityReport = SecurityInfrastructureEngine.analyzeSecurity(securityElements, 1);
assert(securityReport.totalCameras === 1, 'Detectada 1 cámara de seguridad');
assert(securityReport.cameraCones.length === 1, 'Generado 1 cono de visión FOV');
assert(securityReport.cameraCones[0].polygonPoints.length === 4, 'Polígono de cono compuesto por 4 vértices geométricos');
assert(securityReport.coverageRatio === 100, 'Ratio de cobertura de accesos: 100%');

// -------------------------------------------------------------
// 6. HvacPlumbingEngine
// -------------------------------------------------------------
console.log('\n--- 6. HvacPlumbingEngine & Hydraulics ---');
const hvacPlumbElements: TechnicalElementDto[] = [
  {
    id: 'hvac-1',
    projectId: 'proj-1',
    code: 'CLI-001',
    name: 'Bomba de Calor Aerotermia Split',
    category: 'HVAC',
    mountingType: 'WALL_SURFACE',
    status: 'PLANNED',
    hvacCoolingKw: 4.2,
    hvacHeatingKw: 4.8,
    airflowM3h: 600,
    position: { x: 2, y: 2, z: 2.20 },
    rotation: 0,
    dimensions: { width: 0.90, height: 0.30, depth: 0.22 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fon-1',
    projectId: 'proj-1',
    code: 'FON-001',
    name: 'Toma AFS/ACS Lavabo',
    category: 'PLUMBING',
    mountingType: 'WALL_RECESSED',
    status: 'PLANNED',
    position: { x: 5, y: 2, z: 0.55 },
    rotation: 0,
    dimensions: { width: 0.15, height: 0.10, depth: 0.05 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const hvacReport = HvacPlumbingEngine.analyzeHvacAndPlumbing(hvacPlumbElements);
assert(hvacReport.totalHvacUnits === 1, '1 unidad de climatización registrada');
assert(hvacReport.totalCoolingKw === 4.2, 'Potencia frigorífica total: 4.2 kW');
assert(hvacReport.estimatedAreaCoveredM2 === 42, 'Superficie climatizable estimada: 42 m²');
assert(hvacReport.totalPlumbingPoints === 1, '1 punto de fontanería detectado');

// -------------------------------------------------------------
// 7. TechnicalValidationEngine
// -------------------------------------------------------------
console.log('\n--- 7. TechnicalValidationEngine & Safety Rules (REBT/CTE) ---');
const conflictElements: TechnicalElementDto[] = [
  {
    id: 'el-close',
    projectId: 'proj-1',
    code: 'ELE-WET',
    name: 'Enchufe sin IP junto a grifo',
    category: 'ELECTRICAL',
    mountingType: 'WALL_RECESSED',
    status: 'PLANNED',
    position: { x: 5.2, y: 2.0, z: 0.60 }, // Distancia = 0.20m (< 0.50m)
    rotation: 0,
    dimensions: { width: 0.08, height: 0.08, depth: 0.05 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  hvacPlumbElements[1] // Punto de agua en (5, 2, 0.55)
];

const valResult = TechnicalValidationEngine.validateInfrastructure(conflictElements);
assert(valResult.isValid === false, 'Detectada infracción de seguridad reglamentaria');
assert(valResult.errorsCount >= 1, 'Registrado al menos 1 error crítico REBT ITC-BT-27');
assert(valResult.issues.some((i) => i.ruleCode === 'REBT-VOL-WET'), 'Infracción REBT-VOL-WET correctamente reportada');

// -------------------------------------------------------------
// 8. TechnicalInfrastructureEngine Master Facade
// -------------------------------------------------------------
console.log('\n--- 8. TechnicalInfrastructureEngine Master Summary ---');
const allSampleElements = [...sampleElectricalElements, ...sampleNetworkElements];
const fullSummary = TechnicalInfrastructureEngine.generateSummary('proj-1', allSampleElements);
assert(fullSummary.totalElements === allSampleElements.length, `Resumen integral con ${allSampleElements.length} elementos`);
assert(fullSummary.byCategory.ELECTRICAL === 1, 'Conteo categoría ELECTRICAL = 1');
assert(fullSummary.byCategory.LIGHTING === 1, 'Conteo categoría LIGHTING = 1');
assert(fullSummary.byCategory.NETWORK === 1, 'Conteo categoría NETWORK = 1');
assert(fullSummary.byCategory.WIFI === 1, 'Conteo categoría WIFI = 1');
assert(fullSummary.byCategory.SECURITY === 1, 'Conteo categoría SECURITY = 1');
assert(TechnicalInfrastructureEngine.generateElementCode('ELECTRICAL', 5) === 'ELE-005', 'Generación de código ELE-005');
assert(TechnicalInfrastructureEngine.generateElementCode('WIFI', 2) === 'WIFI-002', 'Generación de código WIFI-002');
assert(TechnicalInfrastructureEngine.generateElementCode('HVAC', 1) === 'CLI-001', 'Generación de código CLI-001');

// -------------------------------------------------------------
// Resumen Final
// -------------------------------------------------------------
console.log('\n============================================================');
console.log(`🏁 RESULTADO SUITE V21: ${passed} PASSED, ${failed} FAILED`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
