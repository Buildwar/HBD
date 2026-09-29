/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * Mock Design AI Provider — Motor de IA determinista basado en reglas geométricas
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  DesignAIProvider,
  AIProviderConfig,
  DesignContext,
  RoomContextData,
  RoomAnalysisInsight,
  ProjectDesignAnalysis,
  AIDesignProposal,
  AICopilotCommandRequest,
  AICopilotCommandResponse,
  DesignStyle,
  FurnitureChangeProposal,
  AIAction,
} from '../types/aiDesign.types.js';
import { SpatialValidationEngine } from './spatialValidation.engine.js';
import { SpatialValidationResult, SpatialValidationStatus } from '../types/furniture.types.js';

export class MockDesignAIProvider implements DesignAIProvider {
  getProviderConfig(): AIProviderConfig {
    return {
      providerName: 'mock',
      isConfigured: true,
      isMockMode: true,
      availableModels: ['hbd-rules-engine-v8', 'hbd-spatial-heuristic-v1'],
      activeModel: 'hbd-rules-engine-v8',
      supportsImageVision: true,
      rateLimitPerMinute: 60,
    };
  }

  async analyzeRoom(room: RoomContextData, context: DesignContext): Promise<RoomAnalysisInsight> {
    const area = room.areaM2 || 15.0;
    const roomNameLower = (room.name || '').toLowerCase();
    
    let functionalRole = 'Estancia Polivalente';
    if (roomNameLower.includes('salón') || roomNameLower.includes('living') || roomNameLower.includes('estar')) {
      functionalRole = 'Zona de Estar, Convivencia y Ocio';
    } else if (roomNameLower.includes('dormitorio') || roomNameLower.includes('habitación') || roomNameLower.includes('bed')) {
      functionalRole = 'Zona de Descanso y Privacidad';
    } else if (roomNameLower.includes('cocina') || roomNameLower.includes('kitchen')) {
      functionalRole = 'Zona de Trabajo Culinario y Almacenaje';
    } else if (roomNameLower.includes('baño') || roomNameLower.includes('aseo') || roomNameLower.includes('bath')) {
      functionalRole = 'Zona de Higiene y Bienestar Personal';
    } else if (roomNameLower.includes('comedor') || roomNameLower.includes('dining')) {
      functionalRole = 'Zona de Degustación y Reunión';
    }

    const hasWindows = room.windows && room.windows.length > 0;
    const lightingPotential = hasWindows
      ? `Buena captación solar natural con ${room.windows.length} vano(s) de iluminación.`
      : 'Requiere iluminación cenital e indirecta reforzada por ausencia de ventanas exteriores directas.';

    const strengths = [
      `Superficie útil generosa de ${area.toFixed(1)} m².`,
      `Geometría perimetral con ${room.walls.length} paredes estructurales identificadas.`,
    ];

    const constraints = [
      `Respetar radio de apertura de ${room.doors.length} puerta(s) de acceso (${room.doors.map(d => `${d.widthM}m`).join(', ')}).`,
      'Mantener paso libre mínimo de 70 cm en los ejes principales de circulación.',
    ];

    const opportunities = [
      'Optimización de la orientación del mobiliario para maximizar la sensación de amplitud.',
      'Mejora de la temperatura de color y armonía de texturas según el estilo preferido.',
    ];

    const suggestedStyles: DesignStyle[] = ['modern', 'minimalist', 'nordic', 'japandi', 'industrial'];

    const recommendedFurniture = this.getRecommendedFurnitureForRoom(roomNameLower, area);

    return {
      roomId: room.id,
      roomName: room.name,
      areaM2: area,
      functionalRole,
      lightingPotential,
      trafficFlowAssessment: 'Circulación perimetral fluida recomendada con eje despejado hacia los accesos.',
      strengths,
      constraints,
      opportunities,
      suggestedStyles,
      recommendedFurniture,
    };
  }

  async analyzeProject(context: DesignContext): Promise<ProjectDesignAnalysis> {
    const roomsAnalyzed: RoomAnalysisInsight[] = [];
    let totalArea = 0;

    for (const room of context.rooms) {
      totalArea += room.areaM2 || 0;
      const insight = await this.analyzeRoom(room, context);
      roomsAnalyzed.push(insight);
    }

    return {
      projectId: context.projectId,
      floorId: context.floorId,
      totalAreaM2: Math.round(totalArea * 10) / 10,
      roomsAnalyzed,
      architecturalCoherenceScore: 92,
      globalSuggestions: [
        'Unificar paleta de materiales en zonas de día (salón, comedor, recibidor) para potenciar la continuidad espacial.',
        'Orientar piezas principales hacia los vanos de luz natural para maximizar confort térmico y lumínico.',
        'Alinear acabados de carpintería y rodapiés entre estancias.',
      ],
      recommendedAtmosphere: context.userPreferences.atmosphere || 'warm',
      dominantStyles: [context.userPreferences.style || 'modern', 'nordic', 'minimalist'],
    };
  }

  async generateDesignProposals(context: DesignContext): Promise<AIDesignProposal[]> {
    const numProposals = context.userPreferences.numberOfProposals || 1;
    const targetRooms = context.targetRoomId
      ? context.rooms.filter((r) => r.id === context.targetRoomId)
      : context.rooms;

    const proposals: AIDesignProposal[] = [];

    for (let i = 0; i < numProposals; i++) {
      const proposal = this.buildSingleProposal(i, context, targetRooms);
      proposals.push(proposal);
    }

    return proposals;
  }

  async processCopilotCommand(
    request: AICopilotCommandRequest,
    context: DesignContext
  ): Promise<AICopilotCommandResponse> {
    const promptLower = (request.prompt || '').toLowerCase().trim();
    const targetRoom = request.targetRoomId
      ? context.rooms.find((r) => r.id === request.targetRoomId) || context.rooms[0]
      : context.rooms[0];

    // 1. Intent: Mover sofá / mueble
    if (promptLower.includes('sofá') || promptLower.includes('mesa') || promptLower.includes('mueble')) {
      if (promptLower.includes('pared norte') || promptLower.includes('arriba') || promptLower.includes('norte')) {
        const action: AIAction = {
          id: `act-${Date.now()}`,
          type: 'MOVE_FURNITURE',
          entityId: 'sofa-main',
          target: { y: targetRoom ? targetRoom.polygon[0]?.y + 40 : 120, rotationDeg: 0 },
          params: { categorySlug: 'sofas', furnitureName: 'Sofá Principal 3 Plazas' },
          reason: 'Alineado contra el paramento norte optimizando la circulación central.',
        };

        const valResult = this.createSyntheticValidation(true, 'Posición favorable contra paramento norte. Pasos libres superiores a 85 cm.');
        return {
          interpretedIntent: 'Alinear pieza principal de descanso contra la pared norte',
          action,
          spatialValidation: valResult,
          proposedChangesSummary: 'Desplazamiento del sofá hacia pared norte manteniendo holgura de paso.',
          canAutoApply: true,
          explanation: 'He ubicado el sofá contra la pared norte. Esta distribución libera el centro de la estancia y garantiza 92 cm de paso libre.',
        };
      }

      if (promptLower.includes('cabe') || promptLower.includes('caber') || promptLower.includes('dimensiones') || promptLower.includes('1,80') || promptLower.includes('1.80')) {
        const valResult = this.createSyntheticValidation(true, 'La pieza de 1.80 m cabe perfectamente con márgenes laterales de 45 cm.');
        return {
          interpretedIntent: 'Verificación de viabilidad dimensional y holguras espaciales',
          action: null,
          spatialValidation: valResult,
          proposedChangesSummary: 'Verificación espacial "¿Cabe aquí?": Compatible (VALID)',
          canAutoApply: false,
          explanation: 'Sí, la pieza de 1,80 m cabe en esta zona manteniendo 85 cm de paso respecto a los muros contiguos y sin invadir el radio de apertura de las puertas.',
        };
      }
    }

    // 2. Intent: Estilo o Material
    if (promptLower.includes('minimalista') || promptLower.includes('japandi') || promptLower.includes('nordic') || promptLower.includes('estilo')) {
      const detectedStyle: DesignStyle = promptLower.includes('japandi')
        ? 'japandi'
        : promptLower.includes('minimalista')
        ? 'minimalist'
        : 'nordic';

      const action: AIAction = {
        id: `act-${Date.now()}`,
        type: 'CHANGE_STYLE',
        params: { styleName: detectedStyle, colorHex: '#e5e7eb' },
        reason: `Aplicación de armonía estética ${detectedStyle} con texturas sobrias y materiales naturales.`,
      };

      return {
        interpretedIntent: `Transformar la estética hacia estilo ${detectedStyle}`,
        action,
        proposedChangesSummary: `Reasignación de acabados de suelo y paredes con paleta ${detectedStyle}.`,
        canAutoApply: true,
        explanation: `He configurado los parámetros para el estilo ${detectedStyle}: maderas claras, tonos neutros y acabados mate de baja saturación.`,
      };
    }

    // 3. Intent: Iluminación o Calidez
    if (promptLower.includes('cálid') || promptLower.includes('ilumin') || promptLower.includes('luz')) {
      const action: AIAction = {
        id: `act-${Date.now()}`,
        type: 'CHANGE_LIGHTING',
        params: { colorTempK: 2700, intensity: 1.2, lightMode: 'sunset' },
        reason: 'Ajuste de temperatura a 2700K (blanco cálido residencial) y realce de luces de acento.',
      };

      return {
        interpretedIntent: 'Ajustar la atmósfera lumínica hacia un ambiente más cálido y acogedor',
        action,
        proposedChangesSummary: 'Iluminación cálida 2700K con modulación de sombras suaves.',
        canAutoApply: true,
        explanation: 'He configurado la temperatura de color a 2700K (cálido suave) y reforzado los puntos de luz indirecta.',
      };
    }

    // Default Fallback
    return {
      interpretedIntent: 'Análisis y optimización general de la distribución',
      action: {
        id: `act-${Date.now()}`,
        type: 'CHANGE_STYLE',
        params: { styleName: context.userPreferences.style || 'modern' },
        reason: 'Optimización paramétrica general de confort y circulación.',
      },
      proposedChangesSummary: 'Sugerencia de equilibrio compositivo y orden espacial.',
      canAutoApply: true,
      explanation: `He analizado la estancia "${targetRoom?.name || 'Vivienda'}". Te sugiero mantener el eje de paso despejado y reforzar la iluminación natural.`,
    };
  }

  // --- MÉTODOS PRIVADOS DE GENERACIÓN DETERMINISTA ---

  private buildSingleProposal(index: number, context: DesignContext, rooms: RoomContextData[]): AIDesignProposal {
    const style = context.userPreferences.style || 'modern';
    const atmosphere = context.userPreferences.atmosphere || 'warm';
    const scaleFactor = context.scaleFactor || 100;

    const titles = [
      `Propuesta ${String.fromCharCode(65 + index)}: Distribución Fluida y Confort`,
      `Propuesta ${String.fromCharCode(65 + index)}: Máxima Amplitud y Líneas Puras`,
      `Propuesta ${String.fromCharCode(65 + index)}: Zonificación Funcional y Almacenaje`,
    ];

    const furnitureChanges: FurnitureChangeProposal[] = [];
    const actions: AIAction[] = [];
    const materialOverrides: Record<string, string> = {};

    for (const room of rooms) {
      const roomCentroid = this.calculatePolygonCentroid(room.polygon);
      const roomNameLower = (room.name || '').toLowerCase();

      // Overrides de materiales por estilo
      if (style === 'minimalist' || style === 'japandi') {
        materialOverrides[room.id] = '#f3f4f6'; // Paredes neutras casi blancas
        materialOverrides[`${room.id}_floor`] = '#e5e7eb'; // Microcemento o roble clarísimo
      } else if (style === 'industrial') {
        materialOverrides[room.id] = '#d1d5db';
        materialOverrides[`${room.id}_floor`] = '#4b5563'; // Cemento oscuro
      } else if (style === 'nordic') {
        materialOverrides[room.id] = '#ffffff';
        materialOverrides[`${room.id}_floor`] = '#fde68a'; // Madera pino clara
      } else {
        materialOverrides[room.id] = '#f9fafb';
        materialOverrides[`${room.id}_floor`] = '#9ca3af'; // Porcelánico gris
      }

      // Proponer mobiliario representativo colocado de forma segura en el centroide de la estancia
      if (roomNameLower.includes('salón') || roomNameLower.includes('living') || roomNameLower.includes('estar')) {
        const sofaOffsetX = index === 1 ? -30 : 0;
        const sofaOffsetY = index === 1 ? -20 : -40;
        furnitureChanges.push({
          type: 'added',
          furnitureId: 'sofa-3p-std',
          furnitureName: 'Sofá 3 Plazas Ergonómico',
          categorySlug: 'sofas',
          newPosX: Math.round(roomCentroid.x + sofaOffsetX),
          newPosY: Math.round(roomCentroid.y + sofaOffsetY),
          newPosZ: 0,
          newRotationDeg: index === 2 ? 90 : 0,
          dimensions: { widthM: 2.20, depthM: 0.90, heightM: 0.85 },
          clearanceMm: 850,
          reason: 'Centrado respecto al eje visual principal con holgura perimetral superior a 80 cm.',
        });

        furnitureChanges.push({
          type: 'added',
          furnitureId: 'mesa-centro-std',
          furnitureName: 'Mesa de Centro Roble',
          categorySlug: 'mesas-centro',
          newPosX: Math.round(roomCentroid.x + sofaOffsetX),
          newPosY: Math.round(roomCentroid.y + sofaOffsetY + 60),
          newPosZ: 0,
          newRotationDeg: 0,
          dimensions: { widthM: 1.10, depthM: 0.60, heightM: 0.45 },
          clearanceMm: 450,
          reason: 'Separación ergonómica de 45 cm del sofá para facilitar el acceso sentado.',
        });
      } else if (roomNameLower.includes('dormitorio') || roomNameLower.includes('habitación')) {
        furnitureChanges.push({
          type: 'added',
          furnitureId: 'cama-matrimonio-std',
          furnitureName: 'Cama Doble 150×200 con Cabecero',
          categorySlug: 'camas',
          newPosX: Math.round(roomCentroid.x),
          newPosY: Math.round(roomCentroid.y - 30),
          newPosZ: 0,
          newRotationDeg: 0,
          dimensions: { widthM: 1.60, depthM: 2.05, heightM: 1.00 },
          clearanceMm: 750,
          reason: 'Cabecero contra muro maestro permitiendo paso bilateral de 75 cm.',
        });
      }
    }

    // Validación espacial automática
    const validationResult: SpatialValidationResult = {
      isCompatible: true,
      status: SpatialValidationStatus.VALID,
      dimensionsCm: { width: 0, depth: 0, height: 0 },
      margins: { leftCm: 75, rightCm: 75, topCm: 75, bottomCm: 75 },
      collisions: [],
      blockedDoors: [],
      blockedWindows: [],
      clearanceWarnings: [],
      messages: ['Propuesta físicamente validada. No se detectan colisiones con muros ni bloqueo de puertas.'],
    };

    return {
      id: `prop-${Date.now()}-${index + 1}`,
      variantId: `var-ai-${Date.now()}-${index + 1}`,
      proposalIndex: index + 1,
      name: titles[index] || `Propuesta ${index + 1}`,
      style,
      atmosphere,
      summary: `Distribución basada en principios de arquitectura de interiores con optimización de paso y paleta ${style}.`,
      rationale: `Esta configuración aprovecha la geometría de ${rooms.length} estancia(s) para establecer una circulación natural y respetar las zonas de paso mínimas de 70 cm.`,
      roomInsights: [
        'Eje visual despejado hacia los ventanales principales.',
        'Mobiliario proporcionado a la escala métrica real de la vivienda.',
        'Materiales con absorción lumínica adaptada al ambiente.',
      ],
      actions,
      furnitureChanges,
      materialOverrides,
      lightingOverrides: {
        timeOfDay: atmosphere === 'warm' ? '20:00' : '12:00',
        colorTempK: atmosphere === 'warm' ? 3000 : 4500,
        sunIntensity: 1.2,
        ambientColorHex: '#fef3c7',
      },
      validationResult,
      status: 'VALIDATED',
      createdAt: new Date().toISOString(),
    };
  }

  private calculatePolygonCentroid(polygon: Array<{ x: number; y: number }>): { x: number; y: number } {
    if (!polygon || polygon.length === 0) return { x: 300, y: 300 };
    let sumX = 0;
    let sumY = 0;
    for (const p of polygon) {
      sumX += p.x;
      sumY += p.y;
    }
    return {
      x: Math.round(sumX / polygon.length),
      y: Math.round(sumY / polygon.length),
    };
  }

  private createSyntheticValidation(isValid: boolean, message: string): SpatialValidationResult {
    return {
      isCompatible: isValid,
      status: isValid ? SpatialValidationStatus.VALID : SpatialValidationStatus.INVALID,
      dimensionsCm: { width: 0, depth: 0, height: 0 },
      margins: { leftCm: 70, rightCm: 70, topCm: 70, bottomCm: 70 },
      collisions: [],
      blockedDoors: [],
      blockedWindows: [],
      clearanceWarnings: isValid ? [] : [message],
      messages: [message],
    };
  }

  private getRecommendedFurnitureForRoom(roomNameLower: string, areaM2: number) {
    if (roomNameLower.includes('salón') || roomNameLower.includes('living')) {
      return [
        {
          categorySlug: 'sofas',
          name: 'Sofá de 3 plazas',
          priority: 'essential' as const,
          suggestedDimensions: { widthM: 2.20, depthM: 0.95, heightM: 0.85 },
          idealPlacementZone: 'Centro visual o pared principal opuesta a la entrada',
        },
        {
          categorySlug: 'mesas-centro',
          name: 'Mesa de centro baja',
          priority: 'recommended' as const,
          suggestedDimensions: { widthM: 1.10, depthM: 0.60, heightM: 0.45 },
          idealPlacementZone: 'Frente al sofá con 45 cm de distancia de separación',
        },
        {
          categorySlug: 'muebles-tv',
          name: 'Mueble bajo para TV',
          priority: 'recommended' as const,
          suggestedDimensions: { widthM: 1.80, depthM: 0.40, heightM: 0.50 },
          idealPlacementZone: 'Muro frontal continuo sin interferencia de paso',
        },
      ];
    } else if (roomNameLower.includes('dormitorio') || roomNameLower.includes('habitación')) {
      return [
        {
          categorySlug: 'camas',
          name: 'Cama doble 150×200',
          priority: 'essential' as const,
          suggestedDimensions: { widthM: 1.60, depthM: 2.05, heightM: 1.00 },
          idealPlacementZone: 'Muro testero centrado para acceso bilateral',
        },
        {
          categorySlug: 'mesillas',
          name: 'Mesillas de noche (pareja)',
          priority: 'recommended' as const,
          suggestedDimensions: { widthM: 0.45, depthM: 0.35, heightM: 0.50 },
          idealPlacementZone: 'A ambos lados del cabecero',
        },
      ];
    }

    return [
      {
        categorySlug: 'mesas-comedor',
        name: 'Mesa de comedor 4-6 plazas',
        priority: 'essential' as const,
        suggestedDimensions: { widthM: 1.60, depthM: 0.90, heightM: 0.75 },
        idealPlacementZone: 'Zona central despejada con 80 cm perimetrales para sillas',
      },
    ];
  }
}
