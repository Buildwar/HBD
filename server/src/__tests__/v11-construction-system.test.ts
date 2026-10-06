/**
 * HBD — HOME BOARD DESIGNER (V11.0.0)
 * Test Suite de Inteligencia de Obra y Reforma (Construction & Renovation Intelligence)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  APP_METADATA,
  ConstructionIntelligenceEngine,
  ConstructionComparisonEngine,
  PRO_VALIDATION_NOTICE,
  ConstructionPhaseDto,
  ConstructionTaskDto,
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
  console.log('🧪 HBD V11.0.0 — SUITE DE PRUEBAS DE INTELIGENCIA DE OBRA Y REFORMA');
  console.log('============================================================\n');

  // --- 1. Identidad Centralizada, Autoría y Versión 11.0.0 ---
  console.log('--- 1. Identidad Centralizada, Autoría y Versión 11.0.0 ---');
  assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
  assert(Boolean(APP_METADATA.version), `Versión del sistema es válida: ${APP_METADATA.version}`);
  assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
  assert(
    APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)',
    'Cadena de copyright oficial completa y exacta'
  );

  // --- 2. ConstructionIntelligenceEngine: Mermas y Cómputo de Costes ---
  console.log('\n--- 2. Mermas y Cómputo de Costes ---');
  const qtyBase = 100;
  const waste8 = 8;
  const effectiveQty = ConstructionIntelligenceEngine.computeEffectiveQuantity(qtyBase, waste8);
  assert(effectiveQty === 108, `Cálculo de merma exacto: 100m² + 8% = ${effectiveQty}m²`);

  const itemCost = ConstructionIntelligenceEngine.computeItemTotalCost({
    quantity: 50,
    wastePercent: 10,
    materialCost: 20, // 20€/m2 material
    laborCost: 15,    // 15€/m2 mano de obra
    otherCost: 50,    // 50€ transporte/otros
  });
  // Material: 55m2 * 20€ = 1100€
  // Labor: 50m2 * 15€ = 750€
  // Other: 50€
  // Total: 1900€
  assert(itemCost.effectiveQuantity === 55, 'Cantidad efectiva con 10% de merma es 55 m²');
  assert(itemCost.materialCost === 1100, 'Coste de material con merma es 1100.00 €');
  assert(itemCost.laborCost === 750, 'Coste de mano de obra sobre cantidad base es 750.00 €');
  assert(itemCost.totalCost === 1900, 'Coste total de la partida es 1900.00 €');

  // --- 3. Detección de Validación Profesional Obligatoria ---
  console.log('\n--- 3. Supervisión y Validación Profesional ---');
  const proDemolition = ConstructionIntelligenceEngine.checkRequiresProValidation(
    'DEMOLITION',
    'DEMOLITION',
    'Demolición de tabique divisorio'
  );
  assert(proDemolition === true, 'Demolición activa advertencia de validación profesional');

  const proLoadBearing = ConstructionIntelligenceEngine.checkRequiresProValidation(
    'MASONRY',
    'CONSTRUCTION',
    'Apertura en muro de carga con cargadero'
  );
  assert(proLoadBearing === true, 'Muro de carga activa advertencia de validación profesional');

  const simpleFinishing = ConstructionIntelligenceEngine.checkRequiresProValidation(
    'WALL_FINISH',
    'FINISHING',
    'Pintura plástica lisa color blanco'
  );
  assert(simpleFinishing === false, 'Pintura sencilla no requiere advertencia estructural');

  // --- 4. Planificación de Fases, Tareas y Dependencias ---
  console.log('\n--- 4. Fases, Tareas y Dependencias ---');
  const defaultPhases = ConstructionIntelligenceEngine.generateDefaultPhases();
  assert(defaultPhases.length === 5, 'Genera 5 fases estándar de reforma integral');
  assert(defaultPhases[0].name.includes('Demoliciones'), 'Fase 1 contiene demoliciones');
  assert(defaultPhases[3].name.includes('Acabados'), 'Fase 4 contiene acabados y pintura');

  const mockTasks: ConstructionTaskDto[] = [
    {
      id: 'task-1',
      phaseId: 'phase-1',
      name: 'Instalaciones terminadas',
      status: 'DONE',
      order: 1,
      dependencies: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task-2',
      phaseId: 'phase-1',
      name: 'Colocación de suelo',
      status: 'TODO',
      order: 2,
      dependencies: ['task-1'],
      createdAt: '',
      updatedAt: '',
    },
  ];

  const canCompleteTask2 = ConstructionIntelligenceEngine.validateTaskCompletion('task-2', mockTasks);
  assert(canCompleteTask2.canComplete === true, 'Tarea dependiente puede completarse si la previa está DONE');

  mockTasks[0].status = 'IN_PROGRESS';
  const blockedTask2 = ConstructionIntelligenceEngine.validateTaskCompletion('task-2', mockTasks);
  assert(blockedTask2.canComplete === false, 'Tarea dependiente se bloquea si la previa está IN_PROGRESS');
  assert(blockedTask2.blockingTaskNames.includes('Instalaciones terminadas'), 'Identifica tarea bloqueante');

  // --- 5. ConstructionComparisonEngine (Actual vs Propuesto) ---
  console.log('\n--- 5. Comparador de Obra (Actual vs Propuesto) ---');
  const comparison = ConstructionComparisonEngine.compareStates({
    projectId: 'test-proj-1',
    existing: {
      rooms: [
        { id: 'r1', name: 'Salón', areaM2: 20 },
        { id: 'r2', name: 'Cocina', areaM2: 10 },
        { id: 'r3', name: 'Dormitorio 1', areaM2: 12 },
        { id: 'r4', name: 'Dormitorio 2', areaM2: 10 },
        { id: 'r5', name: 'Baño', areaM2: 5 },
      ],
      walls: [{ id: 'w1' }, { id: 'w2' }, { id: 'w3' }, { id: 'w4' }, { id: 'w5' }],
      doorsCount: 5,
      windowsCount: 4,
      furnitureCount: 8,
    },
    proposed: {
      rooms: [
        { id: 'r1', name: 'Salón-Cocina Abierto', areaM2: 32 },
        { id: 'r3', name: 'Dormitorio Principal', areaM2: 14 },
        { id: 'r4', name: 'Dormitorio 2', areaM2: 10 },
        { id: 'r5', name: 'Baño', areaM2: 5 },
      ],
      walls: [{ id: 'w1' }, { id: 'w3' }, { id: 'w4' }],
      doorsCount: 4,
      windowsCount: 4,
      furnitureCount: 10,
    },
    demolishedWallsCount: 2,
    newWallsCount: 0,
  });

  assert(comparison.existingSummary.roomCount === 5, 'Estado actual tiene 5 estancias');
  assert(comparison.proposedSummary.roomCount === 4, 'Estado propuesto tiene 4 estancias unificadas');
  assert(comparison.demolitions.wallsToDemolishCount === 2, 'Detecta 2 demoliciones de muro');
  assert(comparison.demolitions.requiresProValidation === true, 'Demoliciones activan validación pro');
  assert(comparison.proValidationNotes.length > 0, 'Incluye notas técnicas de validación profesional');

  // --- 6. Auditoría de Navegación y UI Limpia ---
  console.log('\n--- 6. Auditoría de Navegación y UI Limpia ---');
  const sidebarPath = path.resolve(__dirname, '../../../client/src/components/layout/Sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
  assert(sidebarContent.includes("to: '/construction'"), 'Sidebar incluye ruta /construction');
  assert(!sidebarContent.includes('V11'), 'Sidebar NO contiene texto "V11"');
  assert(!sidebarContent.includes('11.0.0'), 'Sidebar NO contiene texto "11.0.0"');

  console.log('\n============================================================');
  console.log(`📊 RESULTADOS DE PRUEBAS V11: ${passed} PASADAS / ${failed} FALLIDAS`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal en suite de pruebas V11:', err);
  process.exit(1);
});
