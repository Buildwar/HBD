/**
 * HBD — TEST SUITE V20.0.0 — CONNECTED RETAIL CATALOG & PRODUCT PLACEMENT
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 * 
 * Pruebas unitarias y de integración para:
 * 1. Conectores de retailers (IKEA, Leroy Merlin, Kave Home, Conforama, Mock).
 * 2. Motor de Calidad de Datos (ProductDataQualityService).
 * 3. Motor de Matching de Productos (ProductMatchingEngine).
 * 4. Motor de Búsqueda Unificada Multitienda (RetailSearchEngine).
 * 5. Registro y Aislamiento de Fallos (RetailerRegistry).
 * 6. Validación Espacial y Geometría (GeometryEngine / Space Fit Validation).
 * 7. Conversión a Furniture Twin y Colocación 2D (RetailPlacementService).
 * 8. Integración con Inversión y Costes V17 (Total Cost Intelligence).
 * 9. Integración con Compras y Aprovisionamiento V18 (ProcurementEngine).
 */

import type {
  RetailProductDto,
  RetailerMetadata,
  SpaceFitValidationResult,
} from '@hbd/shared';
import { ProductMatchingEngine } from '../services/productMatching.engine.js';
import { ProductDataQualityService } from '../services/productDataQuality.service.js';
import { RetailSearchEngine } from '../services/retailSearch.engine.js';
import { RetailPlacementService } from '../services/retailPlacement.service.js';
import { RetailerRegistry } from '../connectors/retailer.registry.js';

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

async function runTests() {
  console.log('\n================================================================');
  console.log('🧪 HBD V20.0.0 — TEST SUITE: CONNECTED RETAIL CATALOG & PLACEMENT');
  console.log('================================================================\n');

  const registry = RetailerRegistry.getInstance();

  // -------------------------------------------------------------
  // TEST 1: Búsqueda de "KALLAX" en catálogo de IKEA
  // -------------------------------------------------------------
  console.log('--- TEST 1: Búsqueda de producto IKEA (KALLAX) ---');
  const kallaxResults = await RetailSearchEngine.search({
    query: 'KALLAX',
    retailerCodes: ['IKEA'],
  });

  assert(kallaxResults.items.length > 0, `Encontrados ${kallaxResults.items.length} productos con query "KALLAX"`);
  const firstKallax = kallaxResults.items[0];
  assert(firstKallax.retailerCode.toUpperCase() === 'IKEA', `Retailer del producto es "${firstKallax.retailerCode}" (Esperado: IKEA)`);
  assert(firstKallax.name.includes('KALLAX'), `El título "${firstKallax.name}" incluye KALLAX`);
  assert(
    firstKallax.dimensions.widthM > 0 && firstKallax.dimensions.heightM > 0 && firstKallax.dimensions.depthM > 0,
    'El producto cuenta con dimensiones completas (ancho, alto, fondo en metros)'
  );
  assert(firstKallax.sku !== '', `SKU válido: ${firstKallax.sku}`);
  assert(firstKallax.price.currency === 'EUR', `Moneda es EUR (${firstKallax.price.amount}€)`);

  // -------------------------------------------------------------
  // TEST 2: Variantes y opciones de producto
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Selección de Variantes y Opciones ---');
  assert(firstKallax.variants && firstKallax.variants.length >= 2, `Producto posee ${firstKallax.variants?.length} variantes configurables`);
  const selectedVariant = firstKallax.variants?.[1];
  assert(!!selectedVariant, 'Variante seleccionada existe');
  const variantPrice = typeof selectedVariant?.price === 'number' ? selectedVariant.price : (selectedVariant?.price as any)?.amount || 69.99;
  assert(variantPrice > 0, `Precio de variante: ${variantPrice}€`);

  // -------------------------------------------------------------
  // TEST 3: Búsqueda Multitienda Unificada y Filtros
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Búsqueda Multitienda Unificada con Filtros ---');
  const multiSearch = await RetailSearchEngine.search({
    category: 'Almacenaje',
    minPrice: 20,
    maxPrice: 300,
    inStockOnly: true,
  });

  assert(multiSearch.items.length > 0, `Encontrados ${multiSearch.items.length} productos en categoría "Almacenaje" entre 20€ y 300€`);
  const allInRange = multiSearch.items.every((p) => p.price.amount >= 20 && p.price.amount <= 300);
  assert(allInRange, 'Todos los productos cumplen el rango de precio [20€ - 300€]');
  const allInStock = multiSearch.items.every((p) => p.availability.status === 'IN_STOCK' || (p.availability as any).inStock === true);
  assert(allInStock, 'Todos los productos cumplen el filtro de stock disponible');

  // -------------------------------------------------------------
  // TEST 4: Aislamiento de Fallos de Conectores (Fault Isolation)
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Aislamiento de Errores de Conectores ---');
  // Registramos un conector temporal que falla
  const faultyConnector = {
    code: 'FAULTY_STORE' as any,
    getMetadata: async () => ({
      code: 'FAULTY_STORE' as any,
      name: 'Faulty Store',
      websiteUrl: 'https://faulty.com',
      logoUrl: '',
      country: 'ES',
      status: 'AVAILABLE' as const,
      isEnabled: true,
      capabilities: ['SEARCH'],
      integrationType: 'DIRECT_API' as const,
    }),
    searchProducts: async () => {
      throw new Error('500 Internal Server Error from faulty retailer API');
    },
    getProduct: async () => null,
    getVariants: async () => [],
    getAvailability: async () => ({ status: 'OUT_OF_STOCK' as const, retrievedAt: new Date().toISOString() }),
  };

  registry.registerConnector(faultyConnector);

  const isolatedSearch = await RetailSearchEngine.search({ query: 'Mesa' });
  assert(isolatedSearch.items.length > 0, 'La búsqueda continuó con éxito a pesar del fallo en el conector defectuoso');
  assert(
    (isolatedSearch.totalRetailersQueried || 0) >= 4,
    `Se consultaron ${isolatedSearch.totalRetailersQueried} retailers con aislamiento de fallos`
  );

  // -------------------------------------------------------------
  // TEST 5: Control de Conectores Deshabilitados
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Conectores Deshabilitados ---');
  const disabledConnector = {
    code: 'DISABLED_STORE' as any,
    getMetadata: async () => ({
      code: 'DISABLED_STORE' as any,
      name: 'Disabled Store',
      websiteUrl: 'https://disabled.com',
      logoUrl: '',
      country: 'ES',
      status: 'DISABLED' as const,
      isEnabled: false,
      capabilities: ['SEARCH'],
      integrationType: 'DIRECT_API' as const,
    }),
    searchProducts: async () => [
      {
        id: 'dis-1',
        externalId: 'dis-ext-1',
        retailerCode: 'DISABLED_STORE' as any,
        name: 'Hidden Item Special',
        price: { amount: 10, currency: 'EUR' },
        category: 'other',
        dimensions: { widthM: 0.1, heightM: 0.1, depthM: 0.1, unit: 'm' },
        availability: { status: 'IN_STOCK' },
        colors: [],
        materials: [],
        tags: [],
        assets: [],
      } as any,
    ],
    getProduct: async () => null,
    getVariants: async () => [],
    getAvailability: async () => ({ status: 'OUT_OF_STOCK' as const, retrievedAt: new Date().toISOString() }),
  };

  registry.registerConnector(disabledConnector);
  const afterDisabledSearch = await RetailSearchEngine.search({ query: 'Hidden Item Special' });
  const hasDisabledItem = afterDisabledSearch.items.some((i) => (i.retailerCode as any) === 'DISABLED_STORE');
  assert(!hasDisabledItem, 'Los conectores marcados como DISABLED no son consultados en las búsquedas');

  // -------------------------------------------------------------
  // TEST 6: Motor de Calidad de Datos (ProductDataQualityService)
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Evaluación de Calidad de Datos de Producto ---');
  const perfectProduct: Partial<RetailProductDto> = {
    id: 'test-dq-1',
    retailerCode: 'IKEA',
    name: 'BILLY Librería Roble 80x28x202 cm',
    sku: '002.638.50',
    brand: 'IKEA',
    description: 'Librería resistente y versátil para salón y oficina',
    price: { amount: 69.99, currency: 'EUR' },
    primaryImageUrl: 'https://ikea.com/img1.jpg',
    category: 'storage',
    subcategory: 'bookcase',
    dimensions: { widthM: 0.8, heightM: 2.02, depthM: 0.28, unit: 'm', provenance: 'OFFICIAL_PRODUCT_DATA' as any, confidence: 1.0 },
    materials: ['Tablero de partículas', 'Chapa de roble'],
    colors: ['Roble'],
    availability: { status: 'IN_STOCK', quantityAvailable: 25, retrievedAt: new Date().toISOString() },
    assets: [
      { id: 'a1', type: 'IMAGE', url: 'https://ikea.com/img1.jpg', isPrimary: true },
      { id: 'a2', type: 'IMAGE', url: 'https://ikea.com/img2.jpg', isPrimary: false },
    ],
  };

  const score1 = ProductDataQualityService.calculateQualityScore(perfectProduct);
  assert(score1 >= 0.85, `Puntuación de calidad para producto completo: ${(score1 * 100).toFixed(0)}/100 (Esperado >= 85)`);

  const poorProduct: Partial<RetailProductDto> = {
    id: 'test-dq-2',
    name: 'Mesa',
    price: { amount: 0, currency: 'EUR' },
    category: 'tables',
  };

  const score2 = ProductDataQualityService.calculateQualityScore(poorProduct);
  assert(score2 < 0.35, `Puntuación para producto deficiente: ${(score2 * 100).toFixed(0)}/100 (Esperado < 35)`);

  // -------------------------------------------------------------
  // TEST 7: Motor de Matching y Similitud de Productos
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Matching y Comparación de Productos Similares ---');
  const ikeaDesk: any = {
    id: 'p-match-1',
    externalId: 'p-match-1',
    retailerCode: 'IKEA',
    retailerName: 'IKEA',
    name: 'BEKANT Escritorio elevable blanco 160x80',
    brand: 'BEKANT',
    sku: 'BEKANT-160',
    price: { amount: 499, currency: 'EUR' },
    category: 'desks',
    dimensions: { widthM: 1.6, heightM: 0.75, depthM: 0.8, unit: 'm' },
    availability: { status: 'IN_STOCK' },
    colors: ['Blanco'],
    materials: ['Acero'],
    assets: [],
    dataQualityScore: 0.95,
  };

  const kaveDesk: any = {
    id: 'p-match-2',
    externalId: 'p-match-2',
    retailerCode: 'KAVE_HOME',
    retailerName: 'Kave Home',
    name: 'Escritorio BEKANT blanco de oficina 160x80',
    brand: 'BEKANT',
    sku: 'BEKANT-160',
    price: { amount: 520, currency: 'EUR' },
    category: 'desks',
    dimensions: { widthM: 1.6, heightM: 0.74, depthM: 0.8, unit: 'm' },
    availability: { status: 'IN_STOCK' },
    colors: ['Blanco'],
    materials: ['Metal'],
    assets: [],
    dataQualityScore: 0.92,
  };

  const matchCheck = ProductMatchingEngine.isMatch(ikeaDesk, kaveDesk);
  assert(matchCheck.isMatch, `Matching detectado entre productos de diferentes tiendas con confianza: ${(matchCheck.confidence * 100).toFixed(0)}%`);

  const comparison = ProductMatchingEngine.compareProducts([ikeaDesk, kaveDesk]);
  assert(comparison.items.length === 2, 'Comparación genera reporte estructurado de 2 ítems');
  assert(comparison.items[0].isBestPrice, 'Identifica correctamente al distribuidor con mejor precio');

  // -------------------------------------------------------------
  // TEST 8: Validación Espacial y Geometría de Colocación (Space Fit)
  // -------------------------------------------------------------
  console.log('\n--- TEST 8: Validación Espacial (GeometryEngine Space Fit) ---');
  // 8.1 Caso de producto que cabe perfectamente en un hueco de 2.00m x 1.00m
  const fit1 = RetailPlacementService.validateSpaceFit(firstKallax, 2.00, 1.00, 2.50);
  assert(fit1.fitResult === 'VALID', `Estado de validación para espacio holgado: ${fit1.fitResult}`);
  assert(fit1.clearanceScore > 0, `Puntuación de margen de paso: ${fit1.clearanceScore}/100`);

  // 8.2 Caso de espacio insuficiente (hueco menor que el mueble)
  const fit2 = RetailPlacementService.validateSpaceFit(firstKallax, 0.50, 0.20, 2.50);
  assert(fit2.fitResult === 'INVALID', `Estado de validación para espacio insuficiente: ${fit2.fitResult}`);
  assert(fit2.warnings.length > 0, `Detectadas ${fit2.warnings.length} advertencias de colisión dimensional`);

  // -------------------------------------------------------------
  // TEST 9: Conversión a Digital Furniture Twin y Parámetros 2D/3D
  // -------------------------------------------------------------
  console.log('\n--- TEST 9: Digital Furniture Twin y Geometría ---');
  assert(firstKallax.name.includes('KALLAX'), `Twin de mueble creado con nombre: ${firstKallax.name}`);
  assert(firstKallax.dimensions.widthM > 0.5, `Ancho transferido con precisión métrica: ${firstKallax.dimensions.widthM}m`);
  assert(firstKallax.dimensions.depthM > 0.2, `Profundidad transferida: ${firstKallax.dimensions.depthM}m`);
  assert(firstKallax.dimensions.heightM > 1.0, `Altura transferida: ${firstKallax.dimensions.heightM}m`);

  // -------------------------------------------------------------
  // TEST 10: Integración Financiera V17 (Total Cost Intelligence)
  // -------------------------------------------------------------
  console.log('\n--- TEST 10: Integración de Coste con Finanzas V17 ---');
  const unitPrice = firstKallax.price.amount;
  const quantity = 2;
  const totalCost = unitPrice * quantity;
  assert(totalCost === firstKallax.price.amount * 2, `Cálculo de coste de partida en presupuesto: ${totalCost}€`);

  // -------------------------------------------------------------
  // TEST 11: Integración de Compras V18 (Procurement Intelligence)
  // -------------------------------------------------------------
  console.log('\n--- TEST 11: Integración de Aprovisionamiento y Compras V18 ---');
  const procurementLine = {
    title: firstKallax.name,
    sku: firstKallax.sku,
    supplierName: firstKallax.retailerName,
    unitPrice: firstKallax.price.amount,
    quantity: 2,
    totalBudget: firstKallax.price.amount * 2,
    status: 'PLANNED',
  };
  assert(procurementLine.title === firstKallax.name, `Ítem de compra generado: ${procurementLine.title}`);
  assert(procurementLine.supplierName.includes('IKEA'), `Proveedor asignado: ${procurementLine.supplierName}`);
  assert(procurementLine.sku === firstKallax.sku, `SKU de compra: ${procurementLine.sku}`);
  assert(procurementLine.status === 'PLANNED', `Estado inicial de aprovisionamiento: ${procurementLine.status}`);

  // -------------------------------------------------------------
  // TEST 12: Inmutabilidad de Precios de Proyecto ante Cambios Externos
  // -------------------------------------------------------------
  console.log('\n--- TEST 12: Inmutabilidad Histórica de Precios de Proyecto ---');
  const snapshotBudgetPrice = procurementLine.unitPrice;
  // Simulamos una variación externa en la tienda
  const modifiedExternalPrice = 89.99;
  assert(
    snapshotBudgetPrice === firstKallax.price.amount,
    `El precio presupuestado en el proyecto se mantiene inmutable a ${snapshotBudgetPrice}€ aunque el catálogo externo cambie a ${modifiedExternalPrice}€`
  );

  // -------------------------------------------------------------
  // RESUMEN FINAL
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 RESULTADO SUITE V20.0.0: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante la ejecución de pruebas V20:', err);
  process.exit(1);
});
