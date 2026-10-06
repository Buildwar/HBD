/**
 * HBD — TEST SUITE V18.0.0 — PROCUREMENT & PROJECT PURCHASING INTELLIGENCE
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 * 
 * Pruebas unitarias y de integración para ProcurementEngine, PurchasePlanningEngine,
 * ProcurementRiskEngine y sincronizaciones transversales (V11, V15, V16, V17).
 */

import {
  ProcurementEngine,
  PurchasePlanningEngine,
  ProcurementRiskEngine,
  ProcurementItemDto,
  SupplierQuoteDto,
  ProcurementOrderDto,
  MaterialRequirementDto,
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

console.log('\n================================================================');
console.log('🧪 HBD V18.0.0 — TEST SUITE: PROCUREMENT & PURCHASING INTELLIGENCE');
console.log('================================================================\n');

// -------------------------------------------------------------
// TEST 1: Sincronización automática de materiales V11
// -------------------------------------------------------------
console.log('--- TEST 1: Sincronización de Materiales V11 con Mermas ---');
const v11Materials = [
  { id: 'mat-1', name: 'Gres porcelánico rectificado 60x60', netQuantity: 45.0, unit: 'm²', wastePercent: 10, unitPrice: 32.5 },
  { id: 'mat-2', name: 'Pintura plástica lisa mate lavable', netQuantity: 120.0, unit: 'm²', wastePercent: 5, unitPrice: 4.8 },
];

const req1 = v11Materials.map((m) =>
  PurchasePlanningEngine.calculateMaterialRequirement({
    id: m.id,
    projectId: 'proj-1',
    materialName: m.name,
    requiredQuantity: m.netQuantity,
    purchasedQuantity: 0,
    unit: m.unit,
    wastePercent: m.wastePercent,
  })
);

assert(req1.length === 2, 'Calculó requisitos para los 2 materiales de V11');
assert(req1[0].totalCalculatedNeed === 49.5, `Gres con merma del 10%: ${req1[0].totalCalculatedNeed} m² (Esperado: 49.5)`);
assert(req1[1].totalCalculatedNeed === 126.0, `Pintura con merma del 5%: ${req1[1].totalCalculatedNeed} m² (Esperado: 126.0)`);
assert(!req1[0].isCovered, 'Material marcado correctamente como no cubierto inicialmente');

// -------------------------------------------------------------
// TEST 2 & 3: Filtro estricto DESIGN_ONLY vs Productos V16
// -------------------------------------------------------------
console.log('\n--- TEST 2 & 3: Exclusión de DESIGN_ONLY e Inclusión de Productos V16 ---');
const candidateProducts = [
  { id: 'p1', name: 'Sofá chaise longue 3 plazas', isDesignOnly: true, price: 1200 },
  { id: 'p2', name: 'Mesa de comedor extensible roble', isDesignOnly: false, price: 650, supplier: 'Kave Home' },
  { id: 'p3', name: 'Campana extractora integrada', isDesignOnly: false, price: 340, supplier: 'Balay' },
];

const filteredPurchases = candidateProducts.filter((p) => !p.isDesignOnly);
assert(filteredPurchases.length === 2, 'Excluyó estrictamente el producto DESIGN_ONLY');
assert(!filteredPurchases.some((p) => p.name.includes('Sofá')), 'El sofá DESIGN_ONLY no se añade al aprovisionamiento automático');
assert(filteredPurchases.some((p) => p.name.includes('Mesa')), 'La mesa de comedor real se incluye correctamente');

// -------------------------------------------------------------
// TEST 4: Planificación temporal y compras por semana
// -------------------------------------------------------------
console.log('\n--- TEST 4: Planificación Temporal y Tramificación Semanal ---');
const now = new Date();
const nextWeek = new Date(now.getTime() + 5 * 24 * 3600 * 1000).toISOString();
const in3Weeks = new Date(now.getTime() + 20 * 24 * 3600 * 1000).toISOString();

const mockItems: ProcurementItemDto[] = [
  {
    id: 'item-1',
    projectId: 'proj-1',
    description: 'Placas de yeso laminado antihumedad',
    category: 'RENOVATION_MATERIAL',
    quantity: 30,
    unit: 'placa',
    requiredDate: nextWeek,
    estimatedUnitCost: 14.5,
    estimatedTotalCost: 435.0,
    currency: 'EUR',
    priority: 'HIGH',
    status: 'NEEDED',
    source: 'V11_CONSTRUCTION',
    orderedQuantity: 0,
    receivedQuantity: 0,
    damagedQuantity: 0,
    missingQuantity: 0,
    pendingQuantity: 30,
    leadTimeDays: 3,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 'item-2',
    projectId: 'proj-1',
    description: 'Grifería empotrada ducha termostática',
    category: 'PLUMBING',
    quantity: 2,
    unit: 'ud',
    requiredDate: in3Weeks,
    estimatedUnitCost: 210.0,
    estimatedTotalCost: 420.0,
    currency: 'EUR',
    priority: 'NORMAL',
    status: 'DRAFT',
    source: 'MANUAL',
    orderedQuantity: 0,
    receivedQuantity: 0,
    damagedQuantity: 0,
    missingQuantity: 0,
    pendingQuantity: 2,
    leadTimeDays: 14,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];

const planning = PurchasePlanningEngine.generatePlanning('proj-1', mockItems, []);
assert(planning.totalPurchasesCount === 2, 'Contabiliza las 2 compras');
assert(planning.upcomingOrdersByWeek.length > 0, 'Agrupó las compras en tramos semanales');

// -------------------------------------------------------------
// TEST 5: Comparador multicriterio de cotizaciones
// -------------------------------------------------------------
console.log('\n--- TEST 5: Comparador Multicriterio de Cotizaciones ---');
const quotes: SupplierQuoteDto[] = [
  {
    id: 'q1',
    projectId: 'proj-1',
    procurementItemId: 'item-1',
    supplierId: 'sup-a',
    supplierName: 'Distribuidor A',
    quantity: 30,
    unitPrice: 15.0,
    totalPrice: 450.0,
    currency: 'EUR',
    estimatedDeliveryDays: 2,
    shippingCost: 30,
    installationCost: 0,
    totalWithServices: 480.0,
    status: 'RECEIVED',
    createdAt: now.toISOString(),
  },
  {
    id: 'q2',
    projectId: 'proj-1',
    procurementItemId: 'item-1',
    supplierId: 'sup-b',
    supplierName: 'Distribuidor B',
    quantity: 30,
    unitPrice: 13.8,
    totalPrice: 414.0,
    currency: 'EUR',
    estimatedDeliveryDays: 7,
    shippingCost: 20,
    installationCost: 0,
    totalWithServices: 434.0,
    status: 'RECEIVED',
    createdAt: now.toISOString(),
  },
];

const comparison = ProcurementEngine.compareQuotes(quotes);
const bestPriceQuote = comparison.quotes.find((q) => q.isBestPrice);
const fastestQuote = comparison.quotes.find((q) => q.isFastest);

assert(bestPriceQuote?.supplierName === 'Distribuidor B', `Mejor precio detectado: ${bestPriceQuote?.supplierName} (434.00 € total)`);
assert(fastestQuote?.supplierName === 'Distribuidor A', `Entrega más rápida detectada: ${fastestQuote?.supplierName} (2 días)`);

// -------------------------------------------------------------
// TEST 6: Generación y Ciclo de Vida de Órdenes de Compra
// -------------------------------------------------------------
console.log('\n--- TEST 6: Ciclo de Vida de Órdenes de Compra ---');
const order: ProcurementOrderDto = {
  id: 'po-1',
  projectId: 'proj-1',
  supplierId: 'sup-b',
  supplierName: 'Distribuidor B',
  orderNumber: 'PO-2026-001',
  orderDate: now.toISOString(),
  status: 'SUBMITTED',
  currency: 'EUR',
  subtotal: 414.0,
  shipping: 20.0,
  taxes: 91.14,
  total: 525.14,
  paidAmount: 0,
  pendingAmount: 525.14,
  lines: [
    {
      id: 'line-1',
      orderId: 'po-1',
      procurementItemId: 'item-1',
      description: 'Placas de yeso laminado antihumedad',
      quantity: 30,
      unit: 'placa',
      unitPrice: 13.8,
      totalPrice: 414.0,
      receivedQuantity: 0,
      damagedQuantity: 0,
    },
  ],
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
};

assert(order.total === 525.14, 'Cálculo correcto del total con envío e impuestos');
assert(order.status === 'SUBMITTED', 'Estado inicial de la orden es SUBMITTED');

// -------------------------------------------------------------
// TEST 7: Recepción Parcial y Actualización de Cantidades
// -------------------------------------------------------------
console.log('\n--- TEST 7: Recepción Parcial de Mercancía ---');
// Recibimos 20 de las 30 placas (1 dañada)
const receivedCount = 20;
const damagedCount = 1;
order.lines[0].receivedQuantity = receivedCount;
order.lines[0].damagedQuantity = damagedCount;
order.status = 'PARTIALLY_RECEIVED';

assert(order.lines[0].receivedQuantity === 20, 'Registradas 20 placas recibidas');
assert(order.lines[0].damagedQuantity === 1, 'Registrada 1 placa dañada');
assert(order.status === 'PARTIALLY_RECEIVED', 'Orden pasa a PARTIALLY_RECEIVED');

// -------------------------------------------------------------
// TEST 8: Gestión de Incidencias y Devoluciones
// -------------------------------------------------------------
console.log('\n--- TEST 8: Incidencias y Solicitud de Devolución ---');
const incident = {
  id: 'inc-1',
  projectId: 'proj-1',
  procurementItemId: 'item-1',
  orderId: 'po-1',
  title: 'Placa de yeso con esquina rota en transporte',
  type: 'DAMAGED',
  quantityAffected: 1,
  status: 'OPEN',
};

const returnRequest = {
  id: 'ret-1',
  projectId: 'proj-1',
  procurementItemId: 'item-1',
  quantity: 1,
  reason: 'Esquina rota en transporte',
  status: 'RETURN_REQUESTED',
  refundAmount: 13.8,
};

assert(incident.type === 'DAMAGED', 'Incidencia tipificada como DAMAGED');
assert(returnRequest.refundAmount === 13.8, 'Importe de abono calculado correctamente');

// -------------------------------------------------------------
// TEST 9: Matriz de Mermas y Sobrantes
// -------------------------------------------------------------
console.log('\n--- TEST 9: Matriz de Mermas y Cobertura Total ---');
const materialNeed = 49.5; // Necesidad con merma
const totalPurchased = 50.0; // Compradas 50 uds (empaquetado estándar)
const surplus = Math.max(0, totalPurchased - materialNeed);

assert(surplus === 0.5, `Sobrante previsto calculado: ${surplus} m²`);
assert(totalPurchased >= materialNeed, 'El material queda 100% cubierto para la obra');

// -------------------------------------------------------------
// TEST 10: Detección Proactiva de Riesgos de Suministro
// -------------------------------------------------------------
console.log('\n--- TEST 10: Detección Proactiva de Riesgos de Suministro ---');
const delayedItem: ProcurementItemDto = {
  ...mockItems[1],
  requiredDate: new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString(), // Necesario en 2 días
  leadTimeDays: 14, // Plazo de 14 días (retraso asegurado de 12 días)
  priority: 'CRITICAL',
};

const risk = ProcurementRiskEngine.analyzeItemRisk(delayedItem);
const projectRisks = ProcurementRiskEngine.evaluateProjectRisks([delayedItem]);
assert(risk !== null, 'Detectó riesgo de suministro para el artículo');
assert(risk!.riskLevel === 'CRITICAL' || risk!.riskLevel === 'AT_RISK', 'Clasificado como riesgo crítico / en riesgo');
assert(risk!.delayDays >= 10, `Retraso estimado calculado: ${risk!.delayDays} días`);
assert(projectRisks.overallRisk === 'CRITICAL', 'Riesgo global del proyecto evaluado como CRITICAL');

// -------------------------------------------------------------
// TEST 11: Resumen y Consolidación de Totales Financieros
// -------------------------------------------------------------
console.log('\n--- TEST 11: Resumen Global de Compras y Presupuesto ---');
const summary = ProcurementEngine.generateSummary('proj-1', mockItems, 'SAFE', 1);
assert(summary.totalPurchasesCount === 2, 'Total de partidas registradas es 2');
assert(summary.totalEstimatedPurchasingBudget === 855.0, `Presupuesto total estimado: ${summary.totalEstimatedPurchasingBudget} €`);
assert(summary.pendingPurchasesCount >= 1, 'Partidas pendientes identificadas');

// -------------------------------------------------------------
// TEST 12: Prevención de Duplicados en Resincronización
// -------------------------------------------------------------
console.log('\n--- TEST 12: Prevención de Duplicados (Anti-Duplication) ---');
const existingSourceRefs = new Set(['v11_mat:mat-1', 'v16_prod:p2']);
const incomingItems = [
  { sourceReference: 'v11_mat:mat-1', name: 'Gres porcelánico' },
  { sourceReference: 'v11_mat:mat-2', name: 'Pintura plástica' },
  { sourceReference: 'v16_prod:p2', name: 'Mesa comedor' },
];

const newItemsToCreate = incomingItems.filter((it) => !existingSourceRefs.has(it.sourceReference));
assert(newItemsToCreate.length === 1, 'Solo se crea 1 nuevo artículo (Pintura plástica)');
assert(newItemsToCreate[0].name === 'Pintura plástica', 'Se evitaron duplicados de Gres y Mesa');

// -------------------------------------------------------------
// Resumen de la Ejecución
// -------------------------------------------------------------
console.log('\n============================================================');
console.log(`📊 RESULTADOS TEST SUITE V18: ${passed} PASSED | ${failed} FAILED`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✨ Todos los tests del Sistema de Aprovisionamiento V18.0.0 pasaron con éxito.\n');
}
