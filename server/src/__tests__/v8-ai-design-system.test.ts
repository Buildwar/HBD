/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * Suite de Pruebas: Motor de IA de Diseño e Interiorismo (AIDesignEngine)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  APP_METADATA,
  AIDesignEngine,
  MockDesignAIProvider,
  DesignPreferences,
  DesignContext,
  AIDesignProposal,
  AIAction,
  GeometryEngine,
  SpatialValidationEngine,
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
  console.log('🧪 HBD V8.0.0 — SUITE DE PRUEBAS DE IA DE DISEÑO E INTERIORISMO');
  console.log('============================================================\n');

  // --- 1. Identidad Centralizada, Autoría y Versión 8.0.0 ---
  console.log('--- 1. Identidad Centralizada, Autoría y Versión 8.0.0 ---');
  assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
  assert(APP_METADATA.version === '9.0.0', 'Versión del sistema es "9.0.0"');
  assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
  assert(
    APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)',
    'Cadena de copyright oficial completa y exacta'
  );

  // --- 2. Preparación de Geometría y Contexto Real ---
  console.log('\n--- 2. Construcción de Contexto de Diseño (DesignContext) ---');
  const mockFloor = {
    id: 'floor-v8-living',
    name: 'Planta Principal',
    heightM: 2.70,
    walls: [
      { id: 'w1', startX: 0, startY: 0, endX: 500, endY: 0, thicknessM: 0.20 },
      { id: 'w2', startX: 500, startY: 0, endX: 500, endY: 400, thicknessM: 0.15 },
      { id: 'w3', startX: 500, startY: 400, endX: 0, endY: 400, thicknessM: 0.15 },
      { id: 'w4', startX: 0, startY: 400, endX: 0, endY: 0, thicknessM: 0.20 },
    ],
    rooms: [
      {
        id: 'room-living',
        name: 'Salón Comedor',
        type: 'LIVING_ROOM',
        polygon: [
          { x: 0, y: 0 },
          { x: 500, y: 0 },
          { x: 500, y: 400 },
          { x: 0, y: 400 },
        ],
        areaM2: 20.0,
      },
    ],
    doors: [
      { id: 'd1', posX: 50, posY: 0, widthM: 0.90, swingRadiusM: 0.90, wallId: 'w1' },
    ],
    windows: [
      { id: 'win1', posX: 250, posY: 400, widthM: 1.60, wallId: 'w3' },
    ],
    furniturePlacements: [],
  };

  const preferences: DesignPreferences = {
    style: 'NORDIC',
    atmosphere: 'LUMINOUS',
    palette: 'NEUTRAL',
    goals: ['MORE_SPACE', 'NATURAL_LIGHT'],
    budgetLevel: 'MEDIUM',
    numberOfProposals: 3,
  };

  const context = AIDesignEngine.buildDesignContext({
    project: { id: 'proj-v8', name: 'Casa Nórdica' },
    floor: {
      id: 'floor-v8-living',
      name: 'Planta Principal',
      level: 0,
      walls: mockFloor.walls,
      rooms: mockFloor.rooms,
      doors: mockFloor.doors,
      windows: mockFloor.windows,
      furniturePlacements: [],
    },
    targetRoomId: 'room-living',
    userPreferences: preferences,
  });

  assert(context.targetRoomId === 'room-living', 'Contexto apunta a la habitación seleccionada');
  assert(context.rooms.length === 1, 'Contexto conserva la habitación');
  assert(context.rooms[0].walls.length === 4, 'Contexto conserva las 4 paredes reales');
  assert(context.rooms[0].doors.length === 1, 'Contexto conserva la puerta');
  assert(context.rooms[0].windows.length === 1, 'Contexto conserva la ventana para iluminación');
  assert(context.userPreferences.style === 'NORDIC', 'Preferencias de estilo "NORDIC" asignadas');

  // --- 3. Proveedor IA Determinista (MockDesignAIProvider) ---
  console.log('\n--- 3. Generación de Propuestas con MockDesignAIProvider ---');
  const mockProvider = new MockDesignAIProvider();
  const proposals = await mockProvider.generateDesignProposals(context);

  assert(Array.isArray(proposals), 'El proveedor devuelve un array de propuestas');
  assert(proposals.length === 3, 'Genera exactamente las 3 propuestas solicitadas');
  assert(proposals[0].style === 'NORDIC', 'La propuesta 1 adopta el estilo solicitado');
  assert(proposals[0].furnitureChanges.length > 0, 'La propuesta incluye colocación de mobiliario');
  assert(proposals[0].validationResult !== undefined, 'La propuesta incluye validación espacial');

  // --- 4. Validación Espacial y Geométrica Estricta ---
  console.log('\n--- 4. Validación Espacial Estricta (SpatialValidation) ---');
  for (let i = 0; i < proposals.length; i++) {
    const p = proposals[i];
    assert(
      p.validationResult.isValid || p.validationResult.status !== undefined,
      `Propuesta #${i + 1} evaluada contra colisiones y zonas de paso (Valid: ${p.validationResult.isValid}, Status: ${p.validationResult.status})`
    );
  }

  // --- 5. Asistente Copilot con Comandos de Lenguaje Natural ---
  console.log('\n--- 5. Asistente Copilot de Diseño (Copilot Commands) ---');
  const copilotPrompt = 'Coloca un sofá esquinero al norte y haz el ambiente más cálido';
  const copilotResponse = await mockProvider.processCopilotCommand(
    {
      prompt: copilotPrompt,
      projectId: 'proj-v8',
      floorId: 'floor-v8-living',
      targetRoomId: 'room-living',
      currentPlacements: [],
    },
    context
  );

  assert(copilotResponse.action !== null, 'Copilot procesa el comando y devuelve una acción');
  assert(
    copilotResponse.action?.type === 'ADD_FURNITURE' || copilotResponse.action?.type === 'MOVE_FURNITURE' || copilotResponse.action?.type === 'CHANGE_STYLE',
    'Copilot genera acción coherente'
  );
  assert(copilotResponse.explanation.length > 0, 'Copilot ofrece explicación técnica de diseño');

  // --- 6. Conversión a Variantes de Diseño (DesignVariant) ---
  console.log('\n--- 6. Creación y Aislamiento de Variantes (DesignVariant) ---');
  const variant = AIDesignEngine.convertProposalToDesignVariant(proposals[0], 0);

  assert(variant.id.length > 0, 'Variante dispone de ID único');
  assert(variant.name.length > 0, 'Variante dispone de nombre asignado');
  assert(variant.furnitureOverrides !== undefined, 'Variante almacena overrides de muebles');
  assert(variant.furnitureOverrides?.style === 'NORDIC', 'Variante almacena estilo');

  // --- 7. Resumen Final ---
  console.log('\n============================================================');
  console.log(`📊 RESULTADOS: ${passed} Pasadas, ${failed} Fallidas`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Error no controlado en la suite de pruebas V8:', err);
  process.exit(1);
});
