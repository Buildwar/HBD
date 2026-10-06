/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Mock AI Copilot Provider (Deterministic, Structured & Grounded in HBD Engines)
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  AICopilotProvider,
  AICopilotProviderResponse,
  AIProjectContext,
  AIToolDefinition,
  AIToolResult,
  AIToolCall,
  AICopilotIntent,
  AIMessageStructuredPayload,
  AICopilotAction,
} from '../types/copilot.types.js';
import { CopilotIntentEngine } from './copilotIntent.engine.js';
import { CopilotActionEngine } from './copilotAction.engine.js';

export class MockCopilotAIProvider implements AICopilotProvider {
  public readonly id = 'mock-copilot-provider';
  public readonly name = 'HBD Copilot Mock AI Provider (Local Engine)';
  public readonly isMock = true;

  async processQuery(
    query: string,
    context: AIProjectContext,
    tools: AIToolDefinition[],
    toolResults?: AIToolResult[]
  ): Promise<AICopilotProviderResponse> {
    const intent = CopilotIntentEngine.detectIntent(query, context);
    const budgetTarget = CopilotIntentEngine.extractBudget(query) || context.budget?.maxBudget || 5000;
    const roomName = context.layers?.level2_room?.roomName || 'Salón Principal';
    const areaM2 = context.layers?.level2_room?.areaM2 || 22.5;

    let content = '';
    const proposedActions: AICopilotAction[] = [];
    let structuredPayload: AIMessageStructuredPayload = {};
    const toolCalls: AIToolCall[] = [];

    switch (intent) {
      case 'BUDGET': {
        toolCalls.push({
          id: `tc_${Date.now()}_1`,
          toolName: 'calculate_project_cost',
          parameters: { projectId: context.projectId || 'demo_proj' },
        });

        const furnitureCost = 2150.0;
        const materialsCost = 1450.0;
        const laborCostEstimated = 1200.0;
        const technicalCost = 450.0;
        const total = furnitureCost + materialsCost + laborCostEstimated + technicalCost;

        content = `He analizado el presupuesto detallado para **${roomName}** (superficie útil: ${areaM2.toFixed(1)} m²). ` +
          `Los precios de mobiliario y materiales proceden del catálogo de tiendas conectadas y tarifas confirmadas, ` +
          `mientras que la mano de obra se estima según el baremo estándar de reforma.`;

        structuredPayload = {
          cardType: 'BUDGET_BREAKDOWN',
          budgetBreakdown: {
            knownTotal: furnitureCost + materialsCost + technicalCost,
            estimatedTotal: laborCostEstimated,
            estimatedRange: { min: laborCostEstimated * 0.9, max: laborCostEstimated * 1.2 },
            totalEstimate: total,
            currency: '€',
            disclaimer: 'Los costes de mano de obra e instalación son estimaciones orientativas sujetas a visita técnica profesional.',
            items: [
              { category: 'Mobiliario', name: 'Pack Mobiliario Salón (Sofá, Mesa, Mueble TV)', amount: furnitureCost, source: 'RETAIL_CATALOG', isEstimated: false, currency: '€', notes: 'Precios catálogo IKEA / Kave Home' },
              { category: 'Materiales', name: 'Suelo laminado AC5 y pintura ecológica', amount: materialsCost, source: 'FINANCIAL_ENGINE', isEstimated: false, currency: '€', notes: 'Leroy Merlin 28 m² con merma 10%' },
              { category: 'Instalaciones', name: 'Puntos eléctricos y tomas RJ45 Cat6', amount: technicalCost, source: 'FINANCIAL_ENGINE', isEstimated: false, currency: '€', notes: 'Infraestructura técnica V21' },
              { category: 'Mano de Obra', name: 'Pintor, montador y electricista', amount: laborCostEstimated, source: 'AI_ESTIMATED', isEstimated: true, currency: '€', notes: 'Estimación baremo medio profesional' },
            ],
          },
          sources: [
            { type: 'CATALOG', title: 'Connected Retail Catalog (V20)', confidence: 'HIGH', sourceDetail: 'Precios sincronizados de tiendas oficiales' },
            { type: 'ENGINE', title: 'Financial Intelligence (V17)', confidence: 'HIGH', sourceDetail: 'Cálculo de mermas y partidas unitarias' },
            { type: 'ESTIMATE', title: 'Estimación de Mano de Obra', confidence: 'MEDIUM', sourceDetail: 'Requiere validación de instalador' },
          ],
          suggestedPrompts: [
            '¿Qué me falta por comprar de este presupuesto?',
            '¿Cómo puedo reducir 500 € en esta reforma?',
            'Genera un informe en PDF con este desglose',
          ],
        };
        break;
      }

      case 'CHECK_FIT': {
        toolCalls.push({
          id: `tc_${Date.now()}_2`,
          toolName: 'check_product_fit',
          parameters: { productId: 'prod_sofa_3p', roomId: context.activeRoomId || 'room_1' },
        });

        const fits = true;
        const availableWidth = 240;
        const productWidth = 218;
        const clearance = availableWidth - productWidth;

        content = `He verificado el espacio en **${roomName}**. El sofá de 3 plazas (**${productWidth} cm**) **sí cabe** en la pared seleccionada (ancho libre disponible: **${availableWidth} cm**). ` +
          `Queda un margen lateral de **${clearance} cm** que respeta holgadamente las normas de circulación (mínimo recomendado: 15 cm de margen de holgura).`;

        structuredPayload = {
          cardType: 'FIT_CHECK',
          fitCheckResult: {
            productId: 'prod_sofa_3p',
            productName: 'Sofá 3 plazas LANDSKRONA',
            retailer: 'IKEA',
            priceEur: 699,
            fits,
            roomName,
            availableWidthCm: availableWidth,
            availableDepthCm: 110,
            productWidthCm: productWidth,
            productDepthCm: 89,
            productHeightCm: 78,
            clearanceCirculationCm: 85,
            explanations: [
              `Ancho disponible: ${availableWidth} cm vs Producto: ${productWidth} cm (Holgura: ${clearance} cm)`,
              'Cumple con la regla de paso de 80 cm frente a la mesa de centro.',
              'No obstaculiza la apertura de la ventana adyacente ni radiadores.',
            ],
          },
          suggestedPrompts: [
            'Añade este sofá al plano 2D',
            'Busca una mesa de centro a juego por menos de 150 €',
            'Enséñame cómo queda en Realidad Aumentada',
          ],
        };

        proposedActions.push(
          CopilotActionEngine.createAction({
            type: 'ADD_FURNITURE',
            reason: 'Colocar Sofá LANDSKRONA en pared sur de salón con holgura verificada',
            projectId: context.projectId,
            entityType: 'FURNITURE',
            entityId: 'prod_sofa_3p',
            parameters: { x: 120, y: 350, rotation: 0, width: productWidth, depth: 89, name: 'Sofá LANDSKRONA' },
          })
        );
        break;
      }

      case 'SEARCH_PRODUCT': {
        toolCalls.push({
          id: `tc_${Date.now()}_3`,
          toolName: 'search_products',
          parameters: { query, maxPriceEur: budgetTarget },
        });

        content = `He encontrado varias opciones compatibles en el catálogo de tiendas conectadas que encajan con tu criterio y presupuesto (máx. ${budgetTarget} €):`;

        structuredPayload = {
          cardType: 'PRODUCT_MATCH',
          products: [
            {
              id: 'p_ikea_kallax_4x2',
              name: 'Estantería KALLAX 4x2 Blanco',
              retailer: 'IKEA',
              category: 'Almacenamiento',
              priceEur: 79.99,
              inStock: true,
              dimensionsCm: { width: 147, depth: 39, height: 77 },
              imageUrl: '/images/products/kallax.png',
            },
            {
              id: 'p_kave_tv_meuble',
              name: 'Mueble TV DISA madera maciza',
              retailer: 'Kave Home',
              category: 'Mueble TV',
              priceEur: 389.0,
              inStock: true,
              dimensionsCm: { width: 160, depth: 40, height: 50 },
              imageUrl: '/images/products/disa_tv.png',
            },
            {
              id: 'p_leroy_lampara',
              name: 'Lámpara de pie INSPIRE Haya/Metal',
              retailer: 'Leroy Merlin',
              category: 'Iluminación',
              priceEur: 64.95,
              inStock: true,
              dimensionsCm: { width: 45, depth: 45, height: 155 },
              imageUrl: '/images/products/inspire_lamp.png',
            },
          ],
          suggestedPrompts: [
            '¿Cabe el mueble TV DISA en la pared principal?',
            'Añade la estantería KALLAX a la lista de compras',
            'Busca alternativas más económicas',
          ],
        };
        break;
      }

      case 'DESIGN':
      case 'REDESIGN':
      case 'FURNISH': {
        toolCalls.push({
          id: `tc_${Date.now()}_4`,
          toolName: 'get_room_geometry',
          parameters: { roomId: context.activeRoomId || 'room_1' },
        });
        toolCalls.push({
          id: `tc_${Date.now()}_5`,
          toolName: 'search_products',
          parameters: { maxPriceEur: budgetTarget },
        });

        content = `He preparado **2 propuestas de distribución y amueblamiento** para **${roomName}** adaptadas a un presupuesto objetivo de **${budgetTarget} €**. ` +
          `Ambas opciones respetan las distancias normativas de paso y aprovechan la luz natural de las ventanas.`;

        const altA_Cost = Math.min(budgetTarget * 0.88, 4200);
        const altB_Cost = Math.min(budgetTarget * 0.98, 4900);

        structuredPayload = {
          cardType: 'ALTERNATIVE_COMPARISON',
          alternatives: [
            {
              id: 'alt_nordic_comfort',
              title: 'Alternativa A: Nórdico Minimalista (Optimizado en Coste)',
              description: 'Distribución abierta que potencia la luz y la amplitud visual con tonos claros y madera natural.',
              style: 'Nórdico',
              estimatedCostEur: altA_Cost,
              itemsCount: 5,
              highlights: ['Mayor espacio libre de paso (+35 cm)', 'Menor inversión inicial', 'Mobiliario modular ampliable'],
              tradeOffs: [
                { advantage: 'Ahorro de ' + (altB_Cost - altA_Cost).toFixed(0) + ' € frente a la alternativa B', drawback: 'Capacidad de almacenaje ligeramente menor' },
              ],
              actions: [
                CopilotActionEngine.createAction({
                  type: 'CREATE_SCENARIO',
                  reason: 'Crear escenario Nórdico Minimalista para ' + roomName,
                  projectId: context.projectId,
                  parameters: { name: 'Escenario Nórdico ' + roomName, costEur: altA_Cost },
                }),
              ],
            },
            {
              id: 'alt_max_storage',
              title: 'Alternativa B: Contemporáneo con Máximo Almacenamiento',
              description: 'Muebles de pared a medida y zona de trabajo integrada aprovechando la esquina noroeste.',
              style: 'Contemporáneo',
              estimatedCostEur: altB_Cost,
              itemsCount: 7,
              highlights: ['+45% de volumen de almacenaje', 'Escritorio integrado', 'Iluminación LED indirecta'],
              tradeOffs: [
                { advantage: 'Máxima capacidad de almacenaje e integración de teletrabajo', drawback: 'Coste cercano al límite del presupuesto' },
              ],
              actions: [
                CopilotActionEngine.createAction({
                  type: 'CREATE_SCENARIO',
                  reason: 'Crear escenario Almacenamiento Máximo para ' + roomName,
                  projectId: context.projectId,
                  parameters: { name: 'Escenario Almacenamiento ' + roomName, costEur: altB_Cost },
                }),
              ],
            },
          ],
          suggestedPrompts: [
            'Aplica la Alternativa A como escenario de trabajo',
            'Enséñame la Alternativa B en 3D',
            '¿Qué productos exactos incluye la Alternativa A?',
          ],
        };
        break;
      }

      case 'PROCUREMENT': {
        toolCalls.push({
          id: `tc_${Date.now()}_6`,
          toolName: 'get_purchase_status',
          parameters: { projectId: context.projectId || 'demo_proj' },
        });

        content = `Consultando el módulo de Compras e Inteligencia de Aprovisionamiento (V18):\n\n` +
          `- **Productos pendientes de pedir:** 3 artículos (Total: 1.153,94 €)\n` +
          `- **Pedidos en tránsito:** 1 pedido en Leroy Merlin (Llegada estimada: Viernes)\n` +
          `- **Artículos entregados:** 4 artículos en obra\n` +
          `- **Incidencias abiertas:** 0 incidencias activas.`;

        structuredPayload = {
          cardType: 'DOCUMENT_SUMMARY',
          explanations: [
            '3 artículos requieren emisión de orden de compra para no demorar la fase de montaje.',
            'Ningún artículo con rotura de stock detectada en tiendas proveedoras.',
          ],
          suggestedPrompts: [
            '¿Cuál es el importe total pendiente de pago?',
            'Ver lista completa de compras en Compras (V18)',
          ],
        };
        break;
      }

      case 'TECHNICAL_DESIGN': {
        toolCalls.push({
          id: `tc_${Date.now()}_7`,
          toolName: 'get_technical_infrastructure',
          parameters: { projectId: context.projectId || 'demo_proj' },
        });

        content = `He analizado la **Infraestructura Técnica y Smart Home (V21)** para la vivienda:\n\n` +
          `- **Red & Wi-Fi:** Cobertura Wi-Fi 6 estimada al 94% con 1 Access Point central en pasillo.\n` +
          `- **Electricidad:** 18 mecanismos previstos en estancia, potencia de circuito adecuada sin sobrecargas.\n` +
          `- **Domótica:** Red Zigbee/Matter recomendada con actuadores de persianas e iluminación dimmer.`;

        structuredPayload = {
          cardType: 'SMART_HOME_PLAN',
          explanations: [
            'Se sugiere colocar el Access Point en techo a 1.2m del cuadro secundario para minimizar rozas.',
            'Los sensores de presencia en pasillo y salón reducirán el consumo energético un 14% estimado.',
          ],
          actions: [
            CopilotActionEngine.createAction({
              type: 'ADD_TECHNICAL_ELEMENT',
              reason: 'Añadir punto de acceso Wi-Fi PoE en pasillo central',
              projectId: context.projectId,
              entityType: 'TECHNICAL_ELEMENT',
              parameters: { type: 'ACCESS_POINT', room: 'Pasillo', mount: 'CEILING', poe: true },
            }),
          ],
          suggestedPrompts: [
            'Ver mapa de calor de cobertura Wi-Fi (V21)',
            '¿Cuánto cuesta la instalación eléctrica completa?',
          ],
        };
        break;
      }

      case 'AR': {
        toolCalls.push({
          id: `tc_${Date.now()}_8`,
          toolName: 'prepare_ar_session',
          parameters: { projectId: context.projectId || 'demo_proj', roomId: context.activeRoomId || 'room_1' },
        });

        content = `He preparado el gemelo digital y los anclajes métricos de **${roomName}** para la sesión de Realidad Aumentada (V22). ` +
          `Puedes abrir la cámara de tu dispositivo o escanear el código QR para proyectar el mobiliario a escala 1:1 en tu espacio físico real.`;

        structuredPayload = {
          cardType: 'AR_PREVIEW',
          explanations: [
            'Modelos 3D optimizados para visualización WebXR y cámara móvil.',
            'Calibración métrica asistida mediante marcos de puerta o puntos fiduciales.',
          ],
          suggestedPrompts: [
            'Abrir visor de Realidad Aumentada ahora',
            'Comparar con foto del estado actual (Antes/Después)',
          ],
        };
        break;
      }

      case 'PROPERTY_INTELLIGENCE': {
        toolCalls.push({
          id: `tc_${Date.now()}_9`,
          toolName: 'get_property_insights',
          parameters: { propertyId: context.propertyId || 'prop_demo' },
        });

        content = `Consultando el módulo de **Property Intelligence (V23)** del inmueble:\n\n` +
          `- **Calidad del dato:** 88% (Datos oficiales y planos acotados confirmados).\n` +
          `- **Oportunidades identificadas:** 3 mejoras (Apertura pasillo-salón, modernización de carpinterías, integración domótica).\n` +
          `- **Riesgos auditados:** 1 riesgo potencial en bajante comunitaria (*requiere inspección técnica presencial*).`;

        structuredPayload = {
          cardType: 'RISK_ALERT',
          explanations: [
            'Las oportunidades de reforma permitirían un incremento estimado de superficie útil percibida de +12%.',
            'Aviso legal: Los riesgos estructurales y de instalaciones marcados por IA son indicios potenciales y no sustituyen el dictamen de un técnico colegiado.',
          ],
          suggestedPrompts: [
            'Ver informe completo del inmueble en Inmuebles (V23)',
            '¿Qué coste tendría ejecutar las 3 oportunidades de mejora?',
          ],
        };
        break;
      }

      default: {
        content = `Hola, soy el Copiloto de HBD. Conozco todos los datos reales de tu proyecto: ` +
          `geometría de habitaciones (${areaM2.toFixed(1)} m² en ${roomName}), catálogo de productos de tiendas, ` +
          `presupuesto, infraestructura técnica (V21), realidad aumentada (V22) e inteligencia del inmueble (V23).\n\n` +
          `¿En qué puedo ayudarte hoy?`;

        structuredPayload = {
          suggestedPrompts: [
            '¿Cuánto cuesta amueblar este salón?',
            'Busca un sofá que quepa aquí por menos de 800 €',
            '¿Qué compras me faltan por hacer?',
            'Diseña una propuesta nórdica para esta habitación',
            'Revisa la cobertura Wi-Fi y puntos de red',
          ],
        };
        break;
      }
    }

    return {
      content,
      intent,
      toolCalls,
      structuredPayload,
      proposedActions,
      confidence: 'HIGH',
      tokensUsed: { prompt: 240, completion: 310, total: 550 },
    };
  }
}
