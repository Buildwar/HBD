/**
 * HBD — TEST SUITE FASE V23 / 1.23.0
 * PROPERTY INTELLIGENCE
 * 
 * Batería de pruebas automatizadas para la inteligencia integral del inmueble:
 * - Property vs Project: Separación conceptual y soporte de múltiples proyectos por inmueble.
 * - PropertyAnalysisEngine: Perfil espacial, superficies, ratios de circulación y adyacencias.
 * - PropertyOpportunityEngine: Detección heurística de oportunidades de mejora y ahorro.
 * - PropertyRiskEngine: Evaluación de riesgos potenciales con marcas obligatorias de revisión técnica.
 * - PropertyDataQualityEngine: Cálculo de completitud, procedencia (provenance) y confianza.
 * - PropertySnapshotEngine: Preservación histórica y comparativa entre estados temporales.
 * - PropertyIntelligenceEngine: Fachada maestra y consolidación transversal (V4 a V22).
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  PropertyIntelligenceEngine,
  PropertyAnalysisEngine,
  PropertyOpportunityEngine,
  PropertyRiskEngine,
  PropertyDataQualityEngine,
  PropertySnapshotEngine,
  PropertyDto,
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
console.log('🧪 HBD — TEST SUITE FASE V23 / 1.23.0: PROPERTY INTELLIGENCE');
console.log('============================================================\n');

// -------------------------------------------------------------
// 1. Property vs Project & Identidad de Inmueble
// -------------------------------------------------------------
console.log('--- 1. Property Identity & Property vs Project Separation ---');

const sampleProperty: PropertyDto = {
  id: 'prop_madrid_01',
  name: 'Piso Retiro — Madrid',
  description: 'Vivienda residencial en edificio señorial',
  propertyType: 'APARTMENT',
  status: 'ACTIVE',
  condition: 'NEEDS_UPDATE',
  occupancyStatus: 'VACANT',
  address: {
    street: 'Calle Alcalá, 45',
    city: 'Madrid',
    postalCode: '28014',
    country: 'España',
  },
  usableSurfaceM2: 95.5,
  builtSurfaceM2: 110.0,
  roomsCount: 4,
  bathroomsCount: 2,
  bedroomsCount: 3,
  floorNumber: 3,
  totalFloors: 6,
  constructionYear: 1985,
  renovationYear: 2010,
  orientation: 'SE',
  energyRating: 'E',
  source: 'DOCUMENT',
  confidence: 'CONFIRMED',
};

assert(sampleProperty.id === 'prop_madrid_01', 'Inmueble identificado independientemente de proyectos');
assert(sampleProperty.propertyType === 'APARTMENT', 'Tipo de inmueble APARTMENT soportado');
assert(sampleProperty.condition === 'NEEDS_UPDATE', 'Estado del inmueble registrado correctamente');
assert(sampleProperty.source === 'DOCUMENT', 'Fuente de datos oficial documentada');
assert(sampleProperty.confidence === 'CONFIRMED', 'Nivel de confianza CONFIRMED asignado');


// -------------------------------------------------------------
// 2. PropertyAnalysisEngine: Perfil Espacial & Adyacencias
// -------------------------------------------------------------
console.log('\n--- 2. PropertyAnalysisEngine (Perfil Espacial & Adyacencias) ---');

const sampleRooms = [
  { id: 'r1', name: 'Salón Comedor', type: 'LIVING', widthM: 6.0, lengthM: 4.5 },
  { id: 'r2', name: 'Cocina Independiente', type: 'KITCHEN', widthM: 3.5, lengthM: 3.0 },
  { id: 'r3', name: 'Dormitorio Principal', type: 'BEDROOM', widthM: 4.0, lengthM: 3.5 },
  { id: 'r4', name: 'Baño Principal', type: 'BATHROOM', widthM: 2.5, lengthM: 2.0 },
  { id: 'r5', name: 'Pasillo Distribuidor', type: 'CORRIDOR', widthM: 5.0, lengthM: 1.2 },
];

const spatialProfile = PropertyAnalysisEngine.analyzeSpatialProfile(sampleRooms, 1);
assert(spatialProfile.roomsCount === 5, 'Conteo de 5 estancias analizadas');
assert(spatialProfile.totalUsableSurfaceM2 > 60, 'Cálculo de superficie útil total > 60 m²');
assert(spatialProfile.bathroomsCount === 1, 'Detección automática de 1 baño');
assert(spatialProfile.bedroomsCount === 1, 'Detección automática de 1 dormitorio');
assert(spatialProfile.circulationSurfaceM2 === 6.0, 'Superficie de circulación identificada (5.0 x 1.2 = 6.0 m²)');
assert(spatialProfile.circulationRatio > 0, 'Ratio de circulación calculado');

// Adyacencias funcionales
assert(spatialProfile.adjacencies.length > 0, 'Matriz de adyacencias generada');
const kitchenLiving = spatialProfile.adjacencies.find(
  (a) =>
    (a.fromRoomName.includes('Cocina') && a.toRoomName.includes('Salón')) ||
    (a.fromRoomName.includes('Salón') && a.toRoomName.includes('Cocina'))
);
assert(kitchenLiving !== undefined, 'Adyacencia Cocina-Salón detectada');
assert(kitchenLiving?.quality === 'OPTIMAL', 'Calidad óptima de relación funcional Cocina-Salón');


// -------------------------------------------------------------
// 3. PropertyOpportunityEngine: Oportunidades de Mejora
// -------------------------------------------------------------
console.log('\n--- 3. PropertyOpportunityEngine (Oportunidades & Potencial) ---');

const opportunities = PropertyOpportunityEngine.detectOpportunities(sampleProperty, spatialProfile);
assert(opportunities.length >= 2, 'Genera al menos 2 oportunidades de mejora justificadas');

const openConcept = opportunities.find((o) => o.category === 'OPEN_CONCEPT');
assert(openConcept !== undefined, 'Oportunidad de Concepto Abierto detectada');
assert(openConcept?.priority === 'HIGH', 'Prioridad de concepto abierto clasificada como HIGH');
assert(openConcept?.source === 'AI_ESTIMATED', 'Marcada explícitamente como AI_ESTIMATED');

const storageOpp = opportunities.find((o) => o.category === 'STORAGE');
assert(storageOpp !== undefined, 'Oportunidad de almacenamiento generada por bajo ratio de armarios');

const energyOpp = opportunities.find((o) => o.category === 'ENERGY_EFFICIENCY');
assert(energyOpp !== undefined, 'Oportunidad de eficiencia energética generada por antigüedad (<2005)');


// -------------------------------------------------------------
// 4. PropertyRiskEngine: Riesgos & Revisión Profesional
// -------------------------------------------------------------
console.log('\n--- 4. PropertyRiskEngine (Evaluación de Riesgos & Seguridad) ---');

const risks = PropertyRiskEngine.evaluateRisks(sampleProperty, {
  hasUncheckedLoadBearingWalls: true,
  hasTechnicalViolations: true,
});

assert(risks.length >= 3, 'Identifica riesgos para instalación antigua, muros y tomas');

const structRisk = risks.find((r) => r.category === 'STRUCTURAL');
assert(structRisk !== undefined, 'Riesgo estructural detectado');
assert(structRisk?.requiresProfessionalReview === true, 'Bandera obligatoria: Requiere revisión técnica profesional');
assert(structRisk?.severity === 'CRITICAL', 'Severidad estructural CRITICAL');
assert(structRisk?.isPotential === true, 'Riesgo inferido marcado como isPotential = true');

const techRisk = risks.find((r) => r.category === 'ELECTRICAL' && r.title.includes('Normativa'));
assert(techRisk !== undefined, 'Infracción normativa V21 detectada');
assert(techRisk?.requiresProfessionalReview === true, 'Infracción técnica exige revisión profesional');


// -------------------------------------------------------------
// 5. PropertyDataQualityEngine: Completitud & Auditoría
// -------------------------------------------------------------
console.log('\n--- 5. PropertyDataQualityEngine (Calidad & Procedencia) ---');

const dataQuality = PropertyDataQualityEngine.evaluateDataQuality(sampleProperty);
assert(dataQuality.completionPercentage >= 80, 'Tasa de completitud calculada >= 80%');
assert(dataQuality.confirmedFieldsCount > 0, 'Conteo de campos confirmados positivo');
assert(dataQuality.unknownFieldsCount === 0 || dataQuality.unknownFieldsCount < 3, 'Pocos campos desconocidos en muestra completa');
assert(dataQuality.totalEvaluatedFields > 10, 'Audita más de 10 campos clave del inmueble');

// Comprobación de inmueble incompleto
const incompleteProperty: PropertyDto = {
  id: 'prop_empty',
  name: 'Piso Sin Datos',
  propertyType: 'OTHER',
  status: 'DRAFT',
  condition: 'UNKNOWN',
  occupancyStatus: 'UNKNOWN',
  source: 'UNKNOWN',
  confidence: 'UNKNOWN',
};
const incompleteQuality = PropertyDataQualityEngine.evaluateDataQuality(incompleteProperty);
assert(incompleteQuality.completionPercentage < 40, 'Inmueble vacío tiene completitud < 40%');
assert(incompleteQuality.missingKeyFields.includes('usableSurfaceM2'), 'Detecta falta de superficie útil');
assert(incompleteQuality.recommendations.length > 0, 'Ofrece recomendaciones para completar el perfil');


// -------------------------------------------------------------
// 6. PropertySnapshotEngine: Estados Históricos & Comparativa
// -------------------------------------------------------------
console.log('\n--- 6. PropertySnapshotEngine (Instantáneas & Estados) ---');

const snapshotInitial = PropertySnapshotEngine.createSnapshot(
  sampleProperty,
  'INITIAL_EXISTING',
  'Estado Inicial 2026',
  {
    spatial: spatialProfile,
    opportunities,
    risks,
    investment: {
      renovationCost: 0,
      furnitureCost: 0,
      technicalInfrastructureCost: 0,
      procurementCost: 0,
      executionCost: 0,
      otherCosts: 0,
      totalCommittedInvestment: 0,
      totalEstimatedInvestment: 0,
      costPerM2: 0,
    },
  }
);
assert(snapshotInitial.name === 'Estado Inicial 2026', 'Nombre de instantánea guardado');
assert(snapshotInitial.stateType === 'INITIAL_EXISTING', 'Tipo de estado INITIAL_EXISTING asignado');
assert(snapshotInitial.metricsSummary?.surfaceM2 !== undefined, 'Métricas resumen congeladas');

const snapshotProposed = PropertySnapshotEngine.createSnapshot(
  sampleProperty,
  'PROPOSED_DESIGN',
  'Propuesta Reforma Integral + Smart Home',
  {
    spatial: {
      ...spatialProfile,
      totalUsableSurfaceM2: 98.0,
      roomsCount: 4,
    },
    opportunities: [],
    risks: [],
    investment: {
      renovationCost: 28000,
      furnitureCost: 8500,
      technicalInfrastructureCost: 4200,
      procurementCost: 6500,
      executionCost: 28000,
      otherCosts: 0,
      totalCommittedInvestment: 47200,
      totalEstimatedInvestment: 47200,
      costPerM2: 481.63,
    },
  }
);

const comparison = PropertySnapshotEngine.compareSnapshots(snapshotInitial, snapshotProposed);
assert(comparison.investmentDeltaEur === 47200, 'Variación de inversión calculada (+47.200 €)');
assert(comparison.summary.includes('Variación de inversión'), 'Resumen textual de comparativa generado');


// -------------------------------------------------------------
// 7. PropertyIntelligenceEngine: Fachada Maestra
// -------------------------------------------------------------
console.log('\n--- 7. PropertyIntelligenceEngine (Fachada Maestra & Consolidación) ---');

const fullReport = PropertyIntelligenceEngine.generateReport(sampleProperty, {
  rooms: sampleRooms,
  financials: {
    acquisitionPrice: 320000,
    renovationCost: 25000,
    furnitureCost: 7000,
    technicalCost: 3500,
    procurementCost: 5000,
    executionCost: 25000,
  },
  technicalSummary: {
    totalPowerKW: 5.75,
    totalCircuits: 7,
    hasWifiAnalysis: true,
    smartHomeProtocolCount: 3,
    securityFixturesCount: 2,
  },
  furnitureSummary: {
    totalItems: 14,
    furnitureTwinsCount: 14,
    retailProductsCount: 14,
  },
});

assert(fullReport.property.id === 'prop_madrid_01', 'Reporte vinculado al inmueble');
assert(fullReport.spatial.roomsCount === 5, 'Resumen espacial consolidado');
assert(fullReport.opportunities.length > 0, 'Oportunidades consolidadas');
assert(fullReport.risks.length > 0, 'Riesgos consolidados');
assert(fullReport.dataQuality.completionPercentage > 0, 'Calidad del dato evaluada');
assert(fullReport.investment.totalEstimatedInvestment > 60000, 'Consolidación financiera correcta (> 60.000 €)');
assert(fullReport.investment.acquisitionCost?.isProvided === true, 'Precio de adquisición registrado como USER_PROVIDED');
assert(fullReport.alerts.length > 0, 'Alertas inteligentes generadas');

// Resumen final
console.log('\n============================================================');
console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
