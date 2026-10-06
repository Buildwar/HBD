/**
 * HBD — TEST SUITE FASE V24 / 1.24.0: HBD AI COPILOT
 * Verificación integral del Copiloto Inteligente, Orquestador, Tools, Acciones,
 * Contexto Progresivo, Veracidad de Precios y Reglas Contractuales.
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  CopilotIntentEngine,
  CopilotContextEngine,
  CopilotToolRegistry,
  CopilotActionEngine,
  MockCopilotAIProvider,
  CopilotOrchestratorEngine,
  AICopilotEngine,
  AIProjectContext,
  AIConversation,
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

async function runTests() {
  console.log('\n============================================================');
  console.log('🤖 HBD — SUITE DE PRUEBAS V24: HBD AI COPILOT (1.24.0)');
  console.log('============================================================\n');

  // -------------------------------------------------------------
  // 1. Detección de Intenciones (IntentEngine)
  // -------------------------------------------------------------
  console.log('--- 1. Detección de Intenciones de Lenguaje Natural ---');
  assert(CopilotIntentEngine.detectIntent('¿Cuánto cuesta reformar este salón?') === 'BUDGET', 'Detecta intención BUDGET');
  assert(CopilotIntentEngine.detectIntent('¿Cabe este sofá en la pared principal?') === 'CHECK_FIT', 'Detecta intención CHECK_FIT');
  assert(CopilotIntentEngine.detectIntent('Busca una estantería blanca en IKEA por menos de 100 €') === 'SEARCH_PRODUCT', 'Detecta intención SEARCH_PRODUCT');
  assert(CopilotIntentEngine.detectIntent('Diseña el dormitorio principal con estilo nórdico') === 'DESIGN', 'Detecta intención DESIGN');
  assert(CopilotIntentEngine.detectIntent('¿Qué me falta comprar para la obra?') === 'PROCUREMENT', 'Detecta intención PROCUREMENT');
  assert(CopilotIntentEngine.detectIntent('¿Cómo va el progreso de la reforma?') === 'EXECUTION', 'Detecta intención EXECUTION');
  assert(CopilotIntentEngine.detectIntent('Revisa los puntos de acceso Wi-Fi y enchufes') === 'TECHNICAL_DESIGN', 'Detecta intención TECHNICAL_DESIGN');
  assert(CopilotIntentEngine.detectIntent('Quiero ver el diseño en realidad aumentada en mi salón') === 'AR', 'Detecta intención AR');
  assert(CopilotIntentEngine.detectIntent('¿Qué riesgos y oportunidades tiene este inmueble?') === 'PROPERTY_INTELLIGENCE', 'Detecta intención PROPERTY_INTELLIGENCE');
  assert(CopilotIntentEngine.detectIntent('Compara estas dos opciones de distribución') === 'COMPARE_SCENARIOS', 'Detecta intención COMPARE_SCENARIOS');
  assert(CopilotIntentEngine.detectIntent('Genera un informe en PDF de la memoria del proyecto') === 'DOCUMENT', 'Detecta intención DOCUMENT');
  assert(CopilotIntentEngine.detectIntent('Enséñame un render fotorrealista de cómo quedaría') === 'RENDER', 'Detecta intención RENDER');

  // -------------------------------------------------------------
  // 2. Extracción de Parámetros Numéricos y Cotas
  // -------------------------------------------------------------
  console.log('\n--- 2. Extracción de Parámetros Numéricos ---');
  assert(CopilotIntentEngine.extractBudget('Quiero amueblar por menos de 5.000 €') === 5000, 'Extrae presupuesto 5000 €');
  assert(CopilotIntentEngine.extractBudget('Presupuesto máximo de 12500 eur') === 12500, 'Extrae presupuesto 12500 eur');
  const dims = CopilotIntentEngine.extractDimensions('Busca un mueble de máximo 180 cm de ancho y 45 cm de fondo');
  assert(dims.maxWidthCm === 180, 'Extrae ancho máximo 180 cm');
  assert(dims.maxDepthCm === 45, 'Extrae profundidad máxima 45 cm');

  // -------------------------------------------------------------
  // 3. Sanitización de Privacidad y Contexto Progresivo
  // -------------------------------------------------------------
  console.log('\n--- 3. Privacidad y Contexto Progresivo (Niveles 1 a 9) ---');
  const sensitiveObj = {
    projectId: 'proj_123',
    jwtToken: 'secret_token_jwt',
    userPasswordHash: 'hash12345',
    apiKey: 'ai_secret_key',
    validField: 'safe_data',
  };
  const sanitized = CopilotContextEngine.sanitizeContext(sensitiveObj);
  assert(!('jwtToken' in sanitized), 'Elimina jwtToken del contexto');
  assert(!('userPasswordHash' in sanitized), 'Elimina userPasswordHash');
  assert(!('apiKey' in sanitized), 'Elimina apiKey');
  assert(sanitized.validField === 'safe_data', 'Mantiene campos seguros');

  const sampleFullContext: AIProjectContext = {
    projectId: 'p1',
    layers: {
      level1_summary: { projectId: 'p1', projectName: 'P1', status: 'ACTIVE', totalAreaM2: 80, floorsCount: 1, roomsCount: 3, createdAt: '' },
      level2_room: { roomId: 'r1', roomName: 'Salón', roomType: 'LIVING_ROOM', areaM2: 25, perimeterM: 20, heightM: 2.6 },
      level3_geometry: { wallsCount: 4, openingsCount: 2 },
      level5_technical: { elementsCount: 12, connectionsCount: 4, summaryByType: {} },
      level7_financial: { budgetTotalEur: 15000 },
    },
  };

  const budgetContext = CopilotContextEngine.filterContextForIntent(sampleFullContext, 'BUDGET');
  assert(budgetContext.layers?.level1_summary !== undefined, 'Contexto BUDGET incluye Level 1 Summary');
  assert(budgetContext.layers?.level7_financial !== undefined, 'Contexto BUDGET incluye Level 7 Financial');
  assert(budgetContext.layers?.level5_technical === undefined, 'Contexto BUDGET excluye Level 5 Technical para minimizar payload');

  // -------------------------------------------------------------
  // 4. Registro de Herramientas y Validación de Esquemas
  // -------------------------------------------------------------
  console.log('\n--- 4. Tool Registry, Permisos y Validación ---');
  const allTools = CopilotToolRegistry.getAllTools();
  assert(allTools.length >= 10, `Registradas ${allTools.length} herramientas en el registro`);

  const summaryTool = CopilotToolRegistry.getTool('get_project_summary');
  assert(summaryTool !== undefined, 'Herramienta "get_project_summary" está registrada');
  assert(summaryTool?.riskLevel === 'LOW', 'get_project_summary tiene riesgo LOW');
  assert(!summaryTool?.requiresConfirmation, 'get_project_summary no requiere confirmación previa');

  const validCall = CopilotToolRegistry.validateToolCall('get_project_summary', { projectId: 'p1' }, ['ai.read', 'project.read']);
  assert(validCall.valid, 'Llamada a tool con parámetros y permisos correctos es válida');

  const missingParamCall = CopilotToolRegistry.validateToolCall('get_project_summary', {}, ['ai.read', 'project.read']);
  assert(!missingParamCall.valid && missingParamCall.error?.includes('projectId'), 'Rechaza llamada con parámetro obligatorio ausente');

  const unauthorizedCall = CopilotToolRegistry.validateToolCall('get_project_summary', { projectId: 'p1' }, ['other.permission']);
  assert(!unauthorizedCall.valid && unauthorizedCall.error?.includes('Permiso denegado'), 'Rechaza llamada sin permisos requeridos');

  // -------------------------------------------------------------
  // 5. Ciclo de Vida y Confirmación de Acciones (AIAction)
  // -------------------------------------------------------------
  console.log('\n--- 5. Ciclo de Vida de Acciones y Confirmación ---');
  const addFurnitureAction = CopilotActionEngine.createAction({
    type: 'ADD_FURNITURE',
    reason: 'Colocar Sofá en pared sur',
    projectId: 'p1',
  });
  assert(addFurnitureAction.riskLevel === 'MEDIUM', 'ADD_FURNITURE clasificada con riesgo MEDIUM');
  assert(addFurnitureAction.requiresConfirmation === true, 'ADD_FURNITURE requiere confirmación obligatoria');
  assert(addFurnitureAction.status === 'PENDING', 'ADD_FURNITURE inicia en estado PENDING');

  const confirmedTransition = CopilotActionEngine.transitionActionStatus(addFurnitureAction, 'EXECUTED', { placementId: 'pl_1' });
  assert(confirmedTransition.success && confirmedTransition.action.status === 'EXECUTED', 'Transición a EXECUTED es exitosa');

  const doubleTransition = CopilotActionEngine.transitionActionStatus(confirmedTransition.action, 'CANCELLED');
  assert(!doubleTransition.success, 'Impide modificar una acción que ya fue ejecutada');

  // -------------------------------------------------------------
  // 6. Proveedor Mock y Veracidad de Datos (MockCopilotAIProvider)
  // -------------------------------------------------------------
  console.log('\n--- 6. Mock AI Copilot Provider y Presupuestos con Fuentes ---');
  const mockProvider = new MockCopilotAIProvider();
  assert(mockProvider.isMock === true, 'MockCopilotAIProvider se identifica explícitamente como Mock');

  const budgetResponse = await mockProvider.processQuery('¿Cuánto cuesta reformar este salón?', sampleFullContext, allTools);
  assert(budgetResponse.intent === 'BUDGET', 'Mock Provider resuelve intención BUDGET');
  assert(budgetResponse.structuredPayload?.budgetBreakdown !== undefined, 'Genera desglose estructurado de presupuesto');
  assert(
    budgetResponse.structuredPayload?.budgetBreakdown?.items.some((i) => i.isEstimated && i.source === 'AI_ESTIMATED'),
    'Marca explícitamente la mano de obra como ESTIMATED'
  );
  assert(
    budgetResponse.structuredPayload?.budgetBreakdown?.items.some((i) => !i.isEstimated && i.source === 'RETAIL_CATALOG'),
    'Atribuye precios de catálogo comercial como CONFIRMED'
  );

  const fitResponse = await mockProvider.processQuery('¿Cabe este sofá aquí?', sampleFullContext, allTools);
  assert(fitResponse.intent === 'CHECK_FIT', 'Mock Provider resuelve CHECK_FIT');
  assert(fitResponse.structuredPayload?.fitCheckResult?.fits === true, 'Valida holgura métrica de colocación');

  // -------------------------------------------------------------
  // 7. Orquestador y Pipeline Completo (CopilotOrchestratorEngine)
  // -------------------------------------------------------------
  console.log('\n--- 7. Pipeline del AI Orchestrator ---');
  const testConv: AIConversation = {
    id: 'conv_test_1',
    userId: 'u1',
    title: 'Test Conv',
    isPinned: false,
    messages: [],
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const chatResponse = await CopilotOrchestratorEngine.processMessage({
    userMessage: 'Quiero un sofá que quepa en el salón por menos de 800 €',
    conversation: testConv,
    context: sampleFullContext,
    userPermissions: ['ai.read', 'ai.use', 'ai.execute', 'ai.confirm'],
  });

  assert(chatResponse.conversation.messages?.length === 1, 'Agrega mensaje del asistente a la conversación');
  assert(chatResponse.message.sender === 'COPILOT', 'Emisor es COPILOT');
  assert(chatResponse.usage?.tokens !== undefined && chatResponse.usage.tokens > 0, 'Registra métricas de tokens consumidos');

  // -------------------------------------------------------------
  // 8. Master Facade (AICopilotEngine)
  // -------------------------------------------------------------
  console.log('\n--- 8. Fachada Principal AICopilotEngine ---');
  const facadeResponse = await AICopilotEngine.chat({
    message: '¿Qué me falta comprar para la obra?',
    context: sampleFullContext,
  });

  assert(facadeResponse.message.intent === 'PROCUREMENT', 'AICopilotEngine.chat resuelve intención PROCUREMENT');
  assert(facadeResponse.message.content.includes('Compras e Inteligencia'), 'Genera respuesta informada con datos de compras');

  // Resumen Final
  console.log('\n============================================================');
  console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Error fatal ejecutando suite:', err);
  process.exit(1);
});
