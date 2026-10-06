/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Tool Registry & Validation
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { AIToolDefinition, AIRiskLevel } from '../types/copilot.types.js';

export class CopilotToolRegistry {
  private static tools: Map<string, AIToolDefinition> = new Map();

  static {
    // Initialize standard tools across all HBD subsystems
    const defaultTools: AIToolDefinition[] = [
      // 1. GEOMETRY & SPACES (V4, V10)
      {
        name: 'get_project_summary',
        category: 'SYSTEM',
        description: 'Obtiene el resumen general del proyecto actual (superficie, plantas, estancias, estado).',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto a consultar' },
          },
          required: ['projectId'],
        },
        permissions: ['ai.read', 'project.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },
      {
        name: 'get_room_geometry',
        category: 'GEOMETRY',
        description: 'Obtiene la geometría detallada de una estancia (paredes, huecos, puertas, ventanas, superficie útil, perímetro).',
        inputSchema: {
          type: 'object',
          properties: {
            roomId: { type: 'string', description: 'ID de la habitación a consultar' },
          },
          required: ['roomId'],
        },
        permissions: ['ai.read', 'geometry.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },
      {
        name: 'get_room_measurements',
        category: 'GEOMETRY',
        description: 'Calcula distancias libres, anchos de paso y cotas disponibles dentro de una estancia.',
        inputSchema: {
          type: 'object',
          properties: {
            roomId: { type: 'string', description: 'ID de la habitación' },
            wallId: { type: 'string', description: 'ID opcional de una pared específica' },
          },
          required: ['roomId'],
        },
        permissions: ['ai.read', 'geometry.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },

      // 2. FURNITURE & FIT (V5, V20)
      {
        name: 'get_furniture',
        category: 'FURNITURE',
        description: 'Lista los muebles colocados en el proyecto o en una habitación específica.',
        inputSchema: {
          type: 'object',
          properties: {
            roomId: { type: 'string', description: 'ID opcional de la habitación' },
            category: { type: 'string', description: 'Categoría de mueble a filtrar' },
          },
        },
        permissions: ['ai.read', 'furniture.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },
      {
        name: 'search_products',
        category: 'RETAIL',
        description: 'Busca productos reales en el catálogo de tiendas conectadas (IKEA, Leroy Merlin, Bauhaus, etc.) con filtros de medidas y precio.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Texto de búsqueda' },
            category: { type: 'string', description: 'Categoría de producto' },
            maxWidthCm: { type: 'number', description: 'Ancho máximo en cm' },
            maxDepthCm: { type: 'number', description: 'Profundidad máxima en cm' },
            maxPriceEur: { type: 'number', description: 'Precio máximo en Euros' },
            retailer: { type: 'string', description: 'Nombre de la tienda' },
          },
        },
        permissions: ['ai.read', 'catalog.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },
      {
        name: 'check_product_fit',
        category: 'FURNITURE',
        description: 'Valida geométricamente si un producto cabe en un espacio libre de una habitación respetando normas de paso.',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'ID del producto' },
            roomId: { type: 'string', description: 'ID de la habitación destino' },
            positionX: { type: 'number', description: 'Coordenada X propuesta' },
            positionY: { type: 'number', description: 'Coordenada Y propuesta' },
          },
          required: ['productId', 'roomId'],
        },
        permissions: ['ai.read', 'geometry.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },

      // 3. FINANCIAL & PROCUREMENT (V17, V18)
      {
        name: 'calculate_project_cost',
        category: 'FINANCIAL',
        description: 'Consolida el presupuesto global del proyecto distinguiendo costes de reforma, mobiliario, instalaciones y compras.',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto' },
            scenarioId: { type: 'string', description: 'ID opcional del escenario a calcular' },
          },
          required: ['projectId'],
        },
        permissions: ['ai.read', 'financial.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },
      {
        name: 'get_purchase_status',
        category: 'PROCUREMENT',
        description: 'Consulta el estado de las compras del proyecto (pendientes de comprar, pedidos en curso, entregados, incidencias).',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto' },
          },
          required: ['projectId'],
        },
        permissions: ['ai.read', 'procurement.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },

      // 4. CONSTRUCTION & EXECUTION (V11, V15)
      {
        name: 'get_construction_tasks',
        category: 'CONSTRUCTION',
        description: 'Obtiene las fases y tareas de reforma del proyecto con sus estados y dependencias.',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto' },
          },
          required: ['projectId'],
        },
        permissions: ['ai.read', 'construction.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },

      // 5. TECHNICAL INFRASTRUCTURE (V21)
      {
        name: 'get_technical_infrastructure',
        category: 'TECHNICAL',
        description: 'Consulta los elementos técnicos instalados (electricidad, red, domótica, climatización, seguridad) y cobertura Wi-Fi.',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto' },
            layerType: { type: 'string', description: 'Capa técnica a filtrar (ELECTRICAL, NETWORK, SMART_HOME, etc.)' },
          },
          required: ['projectId'],
        },
        permissions: ['ai.read', 'technical.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },

      // 6. PROPERTY INTELLIGENCE (V23)
      {
        name: 'get_property_insights',
        category: 'PROPERTY',
        description: 'Obtiene el perfil espacial, oportunidades de mejora, riesgos auditados e historial del inmueble.',
        inputSchema: {
          type: 'object',
          properties: {
            propertyId: { type: 'string', description: 'ID del inmueble' },
          },
          required: ['propertyId'],
        },
        permissions: ['ai.read', 'property.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },

      // 7. SCENARIOS & OPTIMIZATION (V12, V13)
      {
        name: 'compare_scenarios',
        category: 'SCENARIO',
        description: 'Compara dos o más escenarios de diseño en términos de superficie, coste, mobiliario y riesgos.',
        inputSchema: {
          type: 'object',
          properties: {
            scenarioAId: { type: 'string', description: 'ID del primer escenario' },
            scenarioBId: { type: 'string', description: 'ID del segundo escenario' },
          },
          required: ['scenarioAId', 'scenarioBId'],
        },
        permissions: ['ai.read', 'scenario.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },

      // 8. ACTIONS & MUTATION TOOLS (High / Medium risk - require confirmation)
      {
        name: 'propose_furniture_placement',
        category: 'FURNITURE',
        description: 'Propone añadir o mover muebles en una habitación. Requiere confirmación del usuario para aplicarse.',
        inputSchema: {
          type: 'object',
          properties: {
            roomId: { type: 'string', description: 'ID de la habitación' },
            items: { type: 'array', description: 'Lista de muebles a colocar con coordenadas' },
          },
          required: ['roomId', 'items'],
        },
        permissions: ['ai.use', 'furniture.write'],
        riskLevel: 'MEDIUM',
        requiresConfirmation: true,
      },
      {
        name: 'propose_create_scenario',
        category: 'SCENARIO',
        description: 'Genera un nuevo escenario de reforma/distribución sin alterar el diseño principal.',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto' },
            name: { type: 'string', description: 'Nombre del escenario propuesto' },
            description: { type: 'string', description: 'Descripción de las modificaciones' },
          },
          required: ['projectId', 'name'],
        },
        permissions: ['ai.use', 'scenario.write'],
        riskLevel: 'MEDIUM',
        requiresConfirmation: true,
      },
      {
        name: 'propose_technical_element',
        category: 'TECHNICAL',
        description: 'Propone añadir un elemento técnico (punto de red, enchufe, sensor domótico) en una posición.',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto' },
            roomId: { type: 'string', description: 'ID de la habitación' },
            type: { type: 'string', description: 'Tipo de elemento técnico' },
          },
          required: ['projectId', 'type'],
        },
        permissions: ['ai.use', 'technical.write'],
        riskLevel: 'MEDIUM',
        requiresConfirmation: true,
      },
      {
        name: 'prepare_ar_session',
        category: 'VISUALIZATION',
        description: 'Prepara los datos y anchors 3D para iniciar una sesión de visualización en Realidad Aumentada (V22).',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto' },
            roomId: { type: 'string', description: 'ID de la habitación a proyectar' },
          },
          required: ['projectId'],
        },
        permissions: ['ai.use', 'ar.read'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },
      {
        name: 'generate_document',
        category: 'DOCUMENTATION',
        description: 'Prepara un informe ejecutivo en PDF/Word con el desglose del proyecto utilizando DocumentEngine (V14).',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'ID del proyecto' },
            docType: { type: 'string', description: 'Tipo de documento (BUDGET, TECHNICAL, EXECUTIVE_SUMMARY)' },
          },
          required: ['projectId'],
        },
        permissions: ['ai.use', 'document.write'],
        riskLevel: 'LOW',
        requiresConfirmation: false,
      },
    ];

    for (const tool of defaultTools) {
      this.tools.set(tool.name, tool);
    }
  }

  static registerTool(tool: AIToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  static getTool(name: string): AIToolDefinition | undefined {
    return this.tools.get(name);
  }

  static getAllTools(): AIToolDefinition[] {
    return Array.from(this.tools.values());
  }

  static getToolsForCategory(category: AIToolDefinition['category']): AIToolDefinition[] {
    return this.getAllTools().filter((t) => t.category === category);
  }

  static validateToolCall(
    toolName: string,
    params: Record<string, any>,
    userPermissions: string[]
  ): { valid: boolean; error?: string; tool?: AIToolDefinition } {
    const tool = this.getTool(toolName);
    if (!tool) {
      return { valid: false, error: `Herramienta desconocida: "${toolName}"` };
    }

    // Permission check
    const hasPermission = tool.permissions.every((perm) =>
      userPermissions.includes(perm) || userPermissions.includes('*') || userPermissions.includes('admin')
    );

    if (!hasPermission) {
      return {
        valid: false,
        error: `Permiso denegado para ejecutar la herramienta "${toolName}". Requiere: ${tool.permissions.join(', ')}`,
        tool,
      };
    }

    // Schema required parameters check
    if (tool.inputSchema.required) {
      for (const reqField of tool.inputSchema.required) {
        if (params[reqField] === undefined || params[reqField] === null || params[reqField] === '') {
          return {
            valid: false,
            error: `Parámetro obligatorio ausente "${reqField}" para la herramienta "${toolName}".`,
            tool,
          };
        }
      }
    }

    return { valid: true, tool };
  }
}
