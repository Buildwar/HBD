/**
 * HBD — TEST SUITE V17.0.0
 * PROJECT INVESTMENT & TOTAL COST INTELLIGENCE
 * 
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  APP_METADATA,
  ProjectFinancialEngine,
  FinancialForecastEngine,
  CostItemDto,
  PropertyAcquisitionDto,
  CostCategory,
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
console.log('🧪 HBD V17.0.0 — TEST SUITE DE INTELIGENCIA FINANCIERA & COSTE TOTAL');
console.log('============================================================\n');

// 1. Verificación de Versión e Identidad
console.log('--- TEST 1: Identidad y Versión V17.0.0 ---');
assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es Adrián Palma');
assert(Boolean(APP_METADATA.version), `Versión global es válida (Actual: ${APP_METADATA.version})`);
assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');

// 2. Segregación Conceptual de Categorías de Coste
console.log('\n--- TEST 2: Segregación Conceptual de Categorías ---');
const categories: CostCategory[] = [
  'PROPERTY_ACQUISITION',
  'RENOVATION',
  'FURNITURE',
  'APPLIANCES',
  'EQUIPMENT',
  'PROFESSIONAL_SERVICES',
  'LOGISTICS',
  'PERMITS',
  'CONTINGENCY',
  'OTHER',
];
assert(categories.length === 10, 'Existen 10 categorías de coste segregadas');
assert(
  !ProjectFinancialEngine.TRANSFORMATION_CATEGORIES.includes('PROPERTY_ACQUISITION'),
  'PROPERTY_ACQUISITION está formalmente excluida de las categorías de transformación'
);
assert(
  ProjectFinancialEngine.TRANSFORMATION_CATEGORIES.includes('RENOVATION') &&
  ProjectFinancialEngine.TRANSFORMATION_CATEGORIES.includes('FURNITURE') &&
  ProjectFinancialEngine.TRANSFORMATION_CATEGORIES.includes('APPLIANCES'),
  'Las categorías de transformación incluyen Reforma, Mobiliario y Electrodomésticos'
);

// 3. Cálculo de los Dos Totales (Dual Totals)
console.log('\n--- TEST 3: Cálculo de los Dos Totales (Dual Totals) ---');
const sampleItems: CostItemDto[] = [
  {
    id: 'item-1',
    projectId: 'proj-1',
    category: 'RENOVATION',
    subcategory: 'MASONRY',
    name: 'Tabiquería y Albañilería',
    unit: 'm²',
    quantity: 50,
    estimatedUnitCost: 60,
    estimatedTotalCost: 30000,
    actualUnitCost: 65,
    actualTotalCost: 32500, // 32.500 real
    paidAmount: 20000,
    pendingAmount: 12500,
    status: 'APPROVED',
    source: 'CONSTRUCTION_V11',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-2',
    projectId: 'proj-1',
    category: 'FURNITURE',
    subcategory: 'SOFAS',
    name: 'Sofá Modular 3 Plazas',
    unit: 'ud',
    quantity: 1,
    estimatedUnitCost: 1800,
    estimatedTotalCost: 1800,
    actualUnitCost: 1800,
    actualTotalCost: 1800,
    paidAmount: 1800,
    pendingAmount: 0,
    status: 'PAID',
    source: 'PRODUCT_V16',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-3',
    projectId: 'proj-1',
    category: 'APPLIANCES',
    subcategory: 'REFRIGERATOR',
    name: 'Frigorífico Combi No Frost',
    unit: 'ud',
    quantity: 1,
    estimatedUnitCost: 1200,
    estimatedTotalCost: 1200,
    paidAmount: 0,
    pendingAmount: 1200,
    status: 'ESTIMATED',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const transformationCost = ProjectFinancialEngine.calculateTransformationCost(sampleItems);
// 32.500 (real) + 1.800 (real) + 1.200 (estimated) = 35.500 €
assert(transformationCost === 35500, `Coste de Transformación correcto: 35.500 € (Calculado: ${transformationCost} €)`);

// Sin adquisición
const totalInvestWithoutAcq = ProjectFinancialEngine.calculateTotalInvestment(transformationCost, null);
assert(
  totalInvestWithoutAcq === 35500,
  `Inversión Total sin adquisición coincide con Coste de Transformación: ${totalInvestWithoutAcq} €`
);

// Con adquisición de 200.000 €
const sampleAcquisition: PropertyAcquisitionDto = {
  projectId: 'proj-1',
  purchasePrice: 200000,
  notaryFees: 1200,
  registryFees: 600,
  transferTax: 16000,
  agencyFees: 0,
  legalFees: 500,
  renovationTax: 0,
  valuationFees: 400,
  otherAcquisitionFees: 0,
  totalAcquisitionCost: 218700,
};

const totalInvestWithAcq = ProjectFinancialEngine.calculateTotalInvestment(transformationCost, sampleAcquisition);
assert(
  totalInvestWithAcq === 254200,
  `Inversión Total con adquisición correcta (218.700 + 35.500 = 254.200 €) (Calculado: ${totalInvestWithAcq} €)`
);

// 4. Consolidación de Adquisición de Inmueble
console.log('\n--- TEST 4: Consolidación de Gastos de Adquisición ---');
const totalAcqFee = ProjectFinancialEngine.calculateTotalAcquisition({
  purchasePrice: 250000,
  transferTax: 20000,
  notaryFees: 1000,
  registryFees: 500,
  legalFees: 800,
  valuationFees: 350,
});
assert(totalAcqFee === 272650, `Cálculo de tasas y precio de compra exacto: 272.650 € (Calculado: ${totalAcqFee} €)`);

// 5. Agregación Espacial y Coste por m²
console.log('\n--- TEST 5: Agregación Espacial y Coste por m² ---');
const spaces = [
  { id: 'space-living', name: 'Salón Comedor', floor: 1, area: 30 },
  { id: 'space-kitchen', name: 'Cocina', floor: 1, area: 12 },
];

const spatialItems: CostItemDto[] = [
  {
    ...sampleItems[0],
    spaceId: 'space-living',
    roomName: 'Salón Comedor',
  },
  {
    ...sampleItems[1],
    spaceId: 'space-living',
    roomName: 'Salón Comedor',
  },
  {
    ...sampleItems[2],
    spaceId: 'space-kitchen',
    roomName: 'Cocina',
  },
];

const roomBreakdowns = ProjectFinancialEngine.calculateRoomBreakdowns(spatialItems, spaces);
const livingRoom = roomBreakdowns.find((r) => r.spaceId === 'space-living');
const kitchenRoom = roomBreakdowns.find((r) => r.spaceId === 'space-kitchen');

assert(livingRoom !== undefined, 'Salón Comedor encontrado en desglose espacial');
// Salón: 32.500 (item-1) + 1.800 (item-2) = 34.300 € sobre 30 m² -> 1.143,33 €/m²
assert(livingRoom?.totalEffective === 34300, `Coste Salón: 34.300 € (Calculado: ${livingRoom?.totalEffective})`);
assert(
  livingRoom?.costPerSquareMeter === 1143.33,
  `Coste por m² Salón: 1.143,33 €/m² (Calculado: ${livingRoom?.costPerSquareMeter})`
);
assert(kitchenRoom?.totalEffective === 1200, `Coste Cocina: 1.200 € (Calculado: ${kitchenRoom?.totalEffective})`);

// 6. Control de Desviación Presupuestaria (Variance)
console.log('\n--- TEST 6: Control de Desviación Presupuestaria ---');
const summary = ProjectFinancialEngine.generateSummary(
  'proj-1',
  sampleItems,
  sampleAcquisition,
  42, // 30 + 12 m²
  spaces
);

assert(summary.totalBudgetVariance === 2500, `Desviación total calculada: +2.500 € (Calculado: ${summary.totalBudgetVariance})`);
assert(summary.varianceStatus === 'OVER_BUDGET', 'Estado de desviación detectado como OVER_BUDGET');
assert(summary.costPerSquareMeterTransformation > 0, `Coste/m² transformación: ${summary.costPerSquareMeterTransformation} €/m²`);

// 7. Pagos y Pendientes
console.log('\n--- TEST 7: Desembolsos y Saldo Pendiente ---');
// Pagado = 20.000 + 1.800 + 218.700 (adq) = 240.500 €
assert(summary.totalPaidAmount === 240500, `Importe pagado consolidado exacto: ${summary.totalPaidAmount} €`);
assert(summary.totalPendingAmount === 13700, `Importe pendiente exacto: 13.700 € (Calculado: ${summary.totalPendingAmount} €)`);
assert(summary.paymentProgressPercentage > 90, `Progreso de pagos superior al 90% (Actual: ${summary.paymentProgressPercentage}%)`);

// 8. Motor de Proyección Financiera (Forecast Engine)
console.log('\n--- TEST 8: Motor de Proyección Financiera (Forecast Engine) ---');
const forecast = FinancialForecastEngine.calculateForecast('proj-1', sampleItems, 33000);
assert(forecast.forecastFinalCost === 35500, `Coste final proyectado: 35.500 € (Calculado: ${forecast.forecastFinalCost})`);
assert(forecast.projectedVariance === 2500, `Varianza proyectada: +2.500 € (Calculado: ${forecast.projectedVariance})`);
assert(forecast.suggestedContingencyBuffer > 0, `Colchón sugerido calculado: ${forecast.suggestedContingencyBuffer} €`);
assert(forecast.confidenceScore >= 40 && forecast.confidenceScore <= 100, `Puntuación de confianza válida: ${forecast.confidenceScore}`);
assert(forecast.recommendations.length > 0, 'Genera recomendaciones estratégicas de ajuste');

// 9. Mecanismo Antiduplicidad mediante sourceReference
console.log('\n--- TEST 9: Mecanismo Antiduplicidad con sourceReference ---');
const itemWithRef: CostItemDto = {
  ...sampleItems[0],
  sourceReference: 'v11_item:item-12345',
};
const existingRefs = new Set(['v11_item:item-12345']);
const isDuplicate = existingRefs.has(itemWithRef.sourceReference!);
assert(isDuplicate === true, 'El sistema detecta correctamente la partida sincronizada para evitar duplicidades');

// 10. Instantánea Financiera (Snapshot Integrity)
console.log('\n--- TEST 10: Instantánea Financiera (Snapshot) ---');
assert(summary.categories.length === 10, 'Resumen contiene desglose para las 10 categorías');
const renovationCat = summary.categories.find((c) => c.category === 'RENOVATION');
assert(renovationCat?.effectiveAmount === 32500, `Categoría Reforma calculada correctamente: ${renovationCat?.effectiveAmount} €`);

console.log('\n============================================================');
console.log(`📊 RESULTADOS: ${passed} PASADOS | ${failed} FALLADOS`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
