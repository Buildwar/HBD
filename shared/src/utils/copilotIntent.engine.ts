/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Intent Detection & Natural Language Understanding
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { AICopilotIntent, AIProjectContext } from '../types/copilot.types.js';

export class CopilotIntentEngine {
  /**
   * Identifies the primary intent from user input and active project context.
   */
  static detectIntent(query: string, context?: AIProjectContext): AICopilotIntent {
    const q = query.toLowerCase().trim();

    // 1. Product Fit Validation (V20, V5)
    if (
      q.includes('cabe') ||
      q.includes('caben') ||
      q.includes('entraría') ||
      q.includes('entraria') ||
      q.includes('medidas de') ||
      q.includes('comprobar espacio') ||
      q.includes('espacio para')
    ) {
      return 'CHECK_FIT';
    }

    // 2. Product Search & Catalog (V20)
    if (
      q.includes('busca') ||
      q.includes('buscar') ||
      q.includes('encuentra') ||
      q.includes('encontrar') ||
      q.includes('catálogo') ||
      q.includes('catalogo') ||
      q.includes('ikea') ||
      q.includes('leroy') ||
      q.includes('bauhaus') ||
      q.includes('tienda') ||
      q.includes('comprar sofá') ||
      q.includes('comprar mesa') ||
      q.includes('estantería') ||
      q.includes('estanteria')
    ) {
      return 'SEARCH_PRODUCT';
    }

    if (q.includes('compara productos') || q.includes('comparar productos')) {
      return 'COMPARE_PRODUCTS';
    }

    // 3. Procurement & Purchases (V18)
    if (
      q.includes('que me falta comprar') ||
      q.includes('qué me falta comprar') ||
      q.includes('pedidos') ||
      q.includes('compras pendientes') ||
      q.includes('plazos de entrega') ||
      q.includes('estado de los pedidos') ||
      q.includes('falta comprar')
    ) {
      return 'PROCUREMENT';
    }

    // 4. Site Management & Execution Progress (V15)
    if (
      q.includes('como va la reforma') ||
      q.includes('cómo va la reforma') ||
      q.includes('progreso') ||
      q.includes('incidencias') ||
      q.includes('estado de la obra') ||
      q.includes('hitos')
    ) {
      return 'EXECUTION';
    }

    // 5. Construction Tasks & Renovation Steps (V11)
    if (
      q.includes('tirar pared') ||
      q.includes('abrir cocina') ||
      q.includes('demolición') ||
      q.includes('demolicion') ||
      q.includes('tareas de obra') ||
      q.includes('fases de reforma') ||
      q.includes('alicatado') ||
      q.includes('fontaneria') ||
      q.includes('fontanería')
    ) {
      return 'CONSTRUCTION';
    }

    // 6. Smart Home & Technical Infrastructure (V21)
    if (
      q.includes('smart home') ||
      q.includes('domótica') ||
      q.includes('domotica') ||
      q.includes('wifi') ||
      q.includes('wi-fi') ||
      q.includes('red de datos') ||
      q.includes('access point') ||
      q.includes('enchufes') ||
      q.includes('cuadro eléctrico') ||
      q.includes('cuadro electrico') ||
      q.includes('seguridad') ||
      q.includes('sensores') ||
      q.includes('climatización') ||
      q.includes('climatizacion')
    ) {
      return 'TECHNICAL_DESIGN';
    }

    // 7. Augmented Reality (V22)
    if (
      q.includes('realidad aumentada') ||
      q.includes('ver en ar') ||
      q.includes('proyectar en mi salon') ||
      q.includes('proyectar en mi salón') ||
      q.includes('espacio real') ||
      q.includes('abrir ar')
    ) {
      return 'AR';
    }

    // 8. Property Intelligence (V23)
    if (
      q.includes('inmueble') ||
      q.includes('propiedad') ||
      q.includes('riesgos del inmueble') ||
      q.includes('oportunidades de mejora') ||
      q.includes('calidad del dato') ||
      q.includes('perfil espacial') ||
      q.includes('referencia catastral')
    ) {
      return 'PROPERTY_INTELLIGENCE';
    }

    // 9. Scenario & Optimization (V12, V13)
    if (
      q.includes('compara opciones') ||
      q.includes('compara estas') ||
      q.includes('comparar escenarios') ||
      q.includes('diferencia entre')
    ) {
      return 'COMPARE_SCENARIOS';
    }

    if (
      q.includes('escenario') ||
      q.includes('alternativa') ||
      q.includes('variante')
    ) {
      return 'SCENARIO';
    }

    if (
      q.includes('optimiza') ||
      q.includes('optimizar') ||
      q.includes('más almacenamiento') ||
      q.includes('mas almacenamiento') ||
      q.includes('mejor circulación') ||
      q.includes('mejor circulacion') ||
      q.includes('maximizar')
    ) {
      return 'OPTIMIZE';
    }

    // 10. Documentation & Render (V14, V7)
    if (
      q.includes('informe') ||
      q.includes('documento') ||
      q.includes('dossier') ||
      q.includes('pdf') ||
      q.includes('memoria')
    ) {
      return 'DOCUMENT';
    }

    if (
      q.includes('render') ||
      q.includes('enséñame') ||
      q.includes('enseñame') ||
      q.includes('como quedaría') ||
      q.includes('cómo quedaría') ||
      q.includes('fotorrealista') ||
      q.includes('imagen 3d')
    ) {
      return 'RENDER';
    }

    // 11. Design & Furnish (V5, V8)
    if (
      q.includes('diseña') ||
      q.includes('diseñar') ||
      q.includes('amuebla') ||
      q.includes('amueblar') ||
      q.includes('distribuye') ||
      q.includes('distribuir') ||
      q.includes('estilo nórdico') ||
      q.includes('estilo nordico') ||
      q.includes('estilo moderno') ||
      q.includes('estilo industrial')
    ) {
      return 'DESIGN';
    }

    // 12. Budget & Cost Queries (V17)
    if (
      q.includes('presupuesto') ||
      q.includes('cuanto cuesta') ||
      q.includes('cuánto cuesta') ||
      q.includes('cuanto vale') ||
      q.includes('cuánto vale') ||
      q.includes('coste') ||
      q.includes('gasto') ||
      q.includes('inversión') ||
      q.includes('inversion') ||
      q.includes('desvío') ||
      q.includes('desvio') ||
      q.includes('precio') ||
      q.includes('más barata') ||
      q.includes('mas barata') ||
      q.includes('por menos de') ||
      q.includes('eur') ||
      q.includes('€')
    ) {
      return 'BUDGET';
    }

    // 13. Explanation & Summaries
    if (q.includes('por qué') || q.includes('porque') || q.includes('explica') || q.includes('motivo')) {
      return 'EXPLAIN';
    }

    if (q.includes('resumen') || q.includes('resumen general') || q.includes('resúmeme')) {
      return 'SUMMARIZE';
    }

    if (q.includes('analiza') || q.includes('analizar') || q.includes('evalúa') || q.includes('evaluar')) {
      return 'ANALYZE';
    }

    return 'GENERAL_QUERY';
  }

  /**
   * Extracts target budgets from natural text like "por menos de 5.000 €" or "presupuesto de 10000".
   */
  static extractBudget(query: string): number | undefined {
    const regex = /(?:menos de|máximo de|presupuesto de|hasta|de)\s*([0-9]+(?:[\.,][0-9]{3})*)\s*(?:€|eur|euros)?/i;
    const match = query.match(regex);
    if (match && match[1]) {
      const cleanNum = match[1].replace(/\./g, '').replace(',', '.');
      const val = parseFloat(cleanNum);
      if (!isNaN(val) && val > 0) return val;
    }
    return undefined;
  }

  /**
   * Extracts max dimension filters (e.g. "máximo 180 cm de ancho").
   */
  static extractDimensions(query: string): { maxWidthCm?: number; maxDepthCm?: number; maxHeightCm?: number } {
    const res: { maxWidthCm?: number; maxDepthCm?: number; maxHeightCm?: number } = {};
    const widthMatch = query.match(/(?:máximo|max|hasta)?\s*([0-9]+)\s*(?:cm)?\s*(?:de ancho|ancho)/i);
    if (widthMatch && widthMatch[1]) res.maxWidthCm = parseInt(widthMatch[1], 10);

    const depthMatch = query.match(/(?:máximo|max|hasta)?\s*([0-9]+)\s*(?:cm)?\s*(?:de fondo|de profundidad|profundo)/i);
    if (depthMatch && depthMatch[1]) res.maxDepthCm = parseInt(depthMatch[1], 10);

    const heightMatch = query.match(/(?:máximo|max|hasta)?\s*([0-9]+)\s*(?:cm)?\s*(?:de alto|alto|altura)/i);
    if (heightMatch && heightMatch[1]) res.maxHeightCm = parseInt(heightMatch[1], 10);

    return res;
  }
}
