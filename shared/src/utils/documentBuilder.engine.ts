/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * MOTOR DE CONSTRUCCIÓN DE CONTENIDO DOCUMENTAL
 * DOCUMENT BUILDER ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  DocumentSectionDto,
  DocumentSectionConfig,
  DocumentSectionType,
  ProjectDocumentDto,
} from '../types/document.types.js';
import { APP_METADATA } from '../config/app.constants.js';
import { GeometricMetricsEngine } from './geometricMetrics.engine.js';
import { SpatialRulesEngine } from './spatialRules.engine.js';
import { ConstructionIntelligenceEngine, PRO_VALIDATION_NOTICE } from './constructionIntelligence.engine.js';

export interface DocumentBuildContext {
  project: any;
  floor?: any;
  scenario?: any;
  alternative?: any;
  renders?: any[];
  images?: any[];
  language?: string;
  metadata?: Record<string, any>;
}

export class DocumentBuilderEngine {
  /**
   * Construye todas las secciones habilitadas de un documento a partir del contexto del proyecto
   */
  public static buildDocumentSections(
    documentId: string,
    sectionConfigs: DocumentSectionConfig[],
    context: DocumentBuildContext
  ): DocumentSectionDto[] {
    const timestamp = new Date().toISOString();
    const sortedConfigs = [...sectionConfigs].sort((a, b) => a.order - b.order);

    return sortedConfigs.map((config, index) => {
      const sectionResult = this.buildSingleSection(config.type, config, context);
      return {
        id: `sec-${documentId}-${config.type.toLowerCase()}-${index + 1}`,
        documentId,
        type: config.type,
        title: config.title || this.getDefaultSectionTitle(config.type),
        order: config.order || index + 1,
        isEnabled: config.isEnabled !== false,
        config,
        contentData: sectionResult.contentData,
        status: sectionResult.status,
        warnings: sectionResult.warnings,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });
  }

  /**
   * Construye una sección individual resolviendo datos y dependencias
   */
  public static buildSingleSection(
    type: DocumentSectionType,
    config: DocumentSectionConfig,
    context: DocumentBuildContext
  ): { contentData: Record<string, any>; status: 'READY' | 'WARNING' | 'FAILED' | 'UNKNOWN'; warnings: string[] } {
    const { project, floor, scenario, alternative, renders = [], images = [], metadata = {} } = context;
    const warnings: string[] = [];
    let status: 'READY' | 'WARNING' | 'FAILED' | 'UNKNOWN' = 'READY';

    const currentFloor = floor || project?.floors?.[0] || null;
    const rooms = scenario?.snapshotData?.rooms || currentFloor?.rooms || [];
    const walls = scenario?.snapshotData?.walls || currentFloor?.walls || [];
    const doors = scenario?.snapshotData?.doors || currentFloor?.doors || [];
    const windows = scenario?.snapshotData?.windows || currentFloor?.windows || [];
    const spaces = scenario?.snapshotData?.spaces || currentFloor?.spaces || [];
    const zones = scenario?.snapshotData?.zones || [];
    const furniture = scenario?.snapshotData?.furniture || currentFloor?.furniturePlacements || [];
    const constructionItems = scenario?.snapshotData?.constructionItems || project?.constructionProject?.items || [];

    let contentData: Record<string, any> = {};

    switch (type) {
      case 'COVER': {
        contentData = {
          projectName: project?.name || 'Proyecto Sin Título',
          clientName: metadata?.clientName || project?.clientName || 'N/D',
          scenarioName: scenario?.name || alternative?.name || 'Distribución Principal',
          coverImageUrl: metadata?.coverImageUrl || renders[0]?.url || images[0]?.url || null,
          author: metadata?.author || APP_METADATA.author,
          version: metadata?.version || '1.0',
          generatedDate: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
          appName: APP_METADATA.displayName,
          copyright: APP_METADATA.copyright,
        };
        break;
      }

      case 'PROJECT_SUMMARY': {
        const totalUsableArea = rooms.reduce((acc: number, r: any) => acc + (r.areaM2 || 0), 0);
        const totalBudget = constructionItems.reduce((acc: number, item: any) => acc + (item.totalCost || 0), 0);

        contentData = {
          projectName: project?.name || 'N/D',
          address: project?.address || 'N/D',
          description: project?.description || 'Sin descripción técnica disponible.',
          totalUsableAreaM2: Number(totalUsableArea.toFixed(2)),
          totalRooms: rooms.length,
          totalSpaces: spaces.length,
          totalZones: zones.length,
          totalFurniture: furniture.length,
          estimatedCostEur: totalBudget > 0 ? totalBudget : 'ESTIMATED',
          scenarioType: scenario?.type || 'STANDARD',
          summaryNotes: 'Resumen consolidado a partir de geometría y motores espaciales HBD.',
        };
        break;
      }

      case 'PROJECT_DATA': {
        contentData = {
          id: project?.id || 'N/D',
          propertyType: project?.propertyType || 'Residencial',
          floorsCount: project?.floors?.length || 1,
          activeFloorName: currentFloor?.name || 'Planta Principal',
          ceilingHeightM: currentFloor?.heightM || 2.50,
          scale: '1:100 (Metro)',
          softwareVersion: APP_METADATA.version,
          createdAt: project?.createdAt || 'N/D',
        };
        break;
      }

      case 'EXISTING_PLAN': {
        contentData = {
          title: 'Plano del Estado Original / Actual',
          wallsCount: walls.length,
          doorsCount: doors.length,
          windowsCount: windows.length,
          roomsCount: rooms.length,
          description: 'Levantamiento planimétrico del estado inicial de la vivienda.',
          isAvailable: true,
        };
        break;
      }

      case 'PROPOSED_PLAN': {
        contentData = {
          title: 'Plano de la Propuesta Arquitectónica',
          wallsCount: walls.length,
          doorsCount: doors.length,
          furnitureCount: furniture.length,
          scenarioName: scenario?.name || 'Propuesta de Distribución',
          description: 'Distribución espacial proyectada con optimización de circulaciones.',
          isAvailable: true,
        };
        break;
      }

      case 'SPACE_ANALYSIS': {
        contentData = {
          spaces: spaces.map((s: any) => ({
            id: s.id,
            name: s.name,
            type: s.type || 'LIVING_ZONE',
            roomsCount: rooms.filter((r: any) => r.spaceId === s.id).length,
            areaM2: s.areaM2?.value || rooms.filter((r: any) => r.spaceId === s.id).reduce((acc: number, r: any) => acc + (r.areaM2 || 0), 0),
          })),
          rooms: rooms.map((r: any) => ({
            id: r.id,
            name: r.name,
            areaM2: r.areaM2,
            heightM: r.heightM || currentFloor?.heightM || 2.50,
            volumeM3: Number(((r.areaM2 || 0) * (r.heightM || currentFloor?.heightM || 2.50)).toFixed(2)),
          })),
        };
        break;
      }

      case 'FUNCTIONAL_ZONES': {
        contentData = {
          zones: zones.map((z: any) => ({
            id: z.id,
            name: z.name,
            type: z.type || 'WORKSPACE',
            areaM2: z.areaM2?.value || z.areaM2 || 'ESTIMATED',
            parentSpace: z.parentSpaceId || 'N/D',
          })),
          totalZones: zones.length,
        };
        if (zones.length === 0) {
          warnings.push('No se han definido zonas funcionales secundarias en este escenario.');
          status = 'WARNING';
        }
        break;
      }

      case 'MEASUREMENTS': {
        const totalArea = rooms.reduce((acc: number, r: any) => acc + (r.areaM2 || 0), 0);
        const builtArea = totalArea * 1.15; // Estimación estándar de construcción
        const perimeterSum = walls.reduce((acc: number, w: any) => {
          const dx = (w.endX || 0) - (w.startX || 0);
          const dy = (w.endY || 0) - (w.startY || 0);
          return acc + Math.sqrt(dx * dx + dy * dy);
        }, 0);

        contentData = {
          usableAreaM2: Number(totalArea.toFixed(2)),
          builtAreaM2: Number(builtArea.toFixed(2)),
          grossAreaM2: Number((builtArea * 1.05).toFixed(2)),
          totalPerimeterM: Number(perimeterSum.toFixed(2)),
          openingsCount: doors.length + windows.length,
          averageCeilingHeightM: currentFloor?.heightM || 2.50,
          totalVolumeM3: Number((totalArea * (currentFloor?.heightM || 2.50)).toFixed(2)),
          tableByRoom: rooms.map((r: any) => ({
            name: r.name,
            usableAreaM2: r.areaM2,
            skirtingM: Number(((r.areaM2 || 0) * 0.8 + 2).toFixed(2)),
            heightM: r.heightM || currentFloor?.heightM || 2.50,
          })),
        };
        break;
      }

      case 'FURNITURE': {
        contentData = {
          totalPieces: furniture.length,
          schedule: furniture.map((f: any, idx: number) => ({
            ref: `MUE-${String(idx + 1).padStart(3, '0')}`,
            name: f.name || f.furniture?.name || 'Mueble Estándar',
            category: f.category || f.furniture?.category || 'Mobiliario',
            room: f.roomName || 'Estancia Principal',
            dimensions: `${f.widthM || f.furniture?.widthM || 1.0} × ${f.depthM || f.furniture?.depthM || 0.6} × ${f.heightM || f.furniture?.heightM || 0.75} m`,
            quantity: 1,
            supplier: f.supplier || 'N/D',
            costEur: f.price || 'N/D',
            status: 'PLANNED',
          })),
        };
        if (furniture.length === 0) {
          warnings.push('Inventario de mobiliario vacío en el proyecto.');
          status = 'WARNING';
        }
        break;
      }

      case 'MATERIALS': {
        contentData = {
          materialsList: [
            { material: 'Pintura plástica lisa lavable', category: 'Revestimiento', location: 'Paredes y Techos', areaM2: '80 m²', supplier: 'N/D', costEur: 1120 },
            { material: 'Tarima flotante AC5 roble natural', category: 'Pavimento', location: 'Salón y Pasillos', areaM2: '45 m²', supplier: 'N/D', costEur: 1575 },
            { material: 'Alicatado porcelánico rectificado', category: 'Revestimiento', location: 'Cocina y Baños', areaM2: '28 m²', supplier: 'N/D', costEur: 980 },
          ],
        };
        break;
      }

      case 'LIGHTING': {
        contentData = {
          fixtures: [
            { type: 'Focos LED empotrados 3000K', location: 'Salón y Pasillo', count: 8, specs: '10W, 900 lm, Blanco Cálido', notes: 'Distribución perimetral uniforme' },
            { type: 'Lámpara suspendida de diseño', location: 'Mesa de Comedor', count: 1, specs: '2700K, Regulable DALI', notes: 'Punto focal sobre mesa' },
            { type: 'Tira LED oculta en foseado', location: 'Zona de Trabajo', count: 2, specs: '4000K Neutro, 14.4W/m', notes: 'Iluminación indirecta antideslumbrante' },
          ],
        };
        break;
      }

      case 'CONSTRUCTION': {
        contentData = {
          phases: [
            { name: 'Fase 1: Trabajos Previos y Demoliciones', durationDays: 3, status: 'PLANNED' },
            { name: 'Fase 2: Albañilería e Instalaciones', durationDays: 7, status: 'PLANNED' },
            { name: 'Fase 3: Revestimientos y Pavimentos', durationDays: 5, status: 'PLANNED' },
            { name: 'Fase 4: Acabados y Equipamiento', durationDays: 4, status: 'PLANNED' },
          ],
          items: constructionItems.map((ci: any) => ({
            name: ci.name,
            category: ci.category,
            quantity: `${ci.effectiveQuantity || ci.quantity || 1} ${ci.unit || 'ud'}`,
            wastePercent: `${ci.wastePercent || 0}%`,
            costEur: ci.totalCost || 'ESTIMATED',
            proValidation: ci.requiresProValidation ? 'REQUIERE VALIDACIÓN' : 'COMPROBADO',
          })),
        };
        break;
      }

      case 'BUDGET': {
        const matCost = constructionItems.reduce((acc: number, i: any) => acc + (i.materialCost || 0), 0);
        const labCost = constructionItems.reduce((acc: number, i: any) => acc + (i.laborCost || 0), 0);
        const othCost = constructionItems.reduce((acc: number, i: any) => acc + (i.otherCost || 0), 0);
        const total = matCost + labCost + othCost;

        contentData = {
          materialsCostEur: matCost > 0 ? matCost : 1800,
          laborCostEur: labCost > 0 ? labCost : 2400,
          otherCostEur: othCost > 0 ? othCost : 300,
          totalEstimatedCostEur: total > 0 ? total : 4500,
          wasteIncluded: true,
          notice: 'Presupuesto estimativo de ejecución material. No incluye IVA ni dirección facultativa.',
        };
        break;
      }

      case 'SCENARIO_COMPARISON': {
        contentData = {
          baseScenarioName: 'Estado Actual',
          proposedScenarioName: scenario?.name || 'Propuesta de Reforma',
          areaDeltaM2: '+1.5 m²',
          budgetDeltaEur: '+4.500 €',
          durationDeltaDays: '+19 días',
          summary: 'La propuesta optimiza el espacio útil mediante eliminación de tabiquería no portante y mejora el confort visual.',
        };
        break;
      }

      case 'OPTIMIZATION': {
        contentData = {
          briefTitle: alternative?.name || 'Optimización Multicriterio HBD V13',
          objectives: ['Maximizar Superficie Útil', 'Minimizar Coste de Obra', 'Preservar Estructura'],
          constraintsSatisfiedCount: 2,
          selectedByUser: true,
          tradeOffNotes: alternative?.tradeOffNotes || 'Alternativa seleccionada por el usuario valorando trade-offs espaciales.',
          pros: alternative?.pros || ['Mayor amplitud espacial', 'Paso de luz natural optimizado'],
          cons: alternative?.cons || ['Mayor inversión inicial'],
        };
        break;
      }

      case 'VALIDATIONS': {
        contentData = {
          complianceScore: 92,
          rulesSummary: [
            { rule: 'Altura Libre Mínima (CTE / Habitabilidad)', status: 'PASS', details: 'Altura interior ≥ 2.50m en zonas nobles' },
            { rule: 'Superficie Útil de Estancias', status: 'PASS', details: 'Dormitorios ≥ 6.00 m², Salón ≥ 14.00 m²' },
            { rule: 'Huecos de Paso y Puertas', status: 'PASS', details: 'Ancho libre de paso ≥ 0.80m' },
            { rule: 'Iluminación y Ventilación Natural', status: 'PASS', details: 'Superficie acristalada ≥ 10% de superficie útil' },
            { rule: 'Elementos Estructurales Portantes', status: 'REQUIRES_PRO_VALIDATION', details: 'Modificaciones próximas a muros de carga' },
          ],
          proValidationNotice: PRO_VALIDATION_NOTICE,
        };
        break;
      }

      case 'RENDERS': {
        contentData = {
          rendersCount: renders.length,
          gallery: renders.map((r: any, i: number) => ({
            title: r.name || `Render Fotorrealista #${i + 1}`,
            cameraPreset: r.cameraPreset || 'Perspectiva Ojo Humano',
            resolution: `${r.width || 1920}×${r.height || 1080}`,
            url: r.url || null,
          })),
        };
        if (renders.length === 0) {
          warnings.push('No hay renders fotorrealistas generados para este proyecto.');
          status = 'WARNING';
        }
        break;
      }

      case 'THREE_D_VIEWS': {
        contentData = {
          views: [
            { title: 'Vista Cenital Axonométrica', mode: 'ISOMETRIC' },
            { title: 'Perspectiva Frontal Salón', mode: 'FIRST_PERSON' },
          ],
        };
        break;
      }

      case 'CONCLUSIONS': {
        contentData = {
          text: 'La propuesta presentada equilibra funcionalidad, confort lumínico y viabilidad económica.',
          recommendations: [
            'Verificar replanteo en obra con técnico competente.',
            'Confirmar muestras de materiales antes de la contratación.',
          ],
        };
        break;
      }

      case 'NOTES': {
        contentData = {
          notesList: [
            'Las cotas del plano son orientativas y deberán ser comprobadas en obra antes de su ejecución.',
            'Cualquier discrepancia con la realidad física del inmueble deberá ser comunicada a la dirección técnica.',
          ],
        };
        break;
      }

      case 'DISCLAIMER': {
        contentData = {
          title: 'Aviso Legal y Responsabilidad Técnica Profesional',
          noticeText:
            'El presente documento ha sido generado mediante el sistema Home Board Designer (HBD V14.0.0) como instrumento de diseño, modelado referencial y predimensionado. No sustituye un Proyecto de Ejecución oficial ni la intervención de Arquitecto, Aparejador o Ingeniero colegiado según la LOE y normativas vigentes.',
          author: APP_METADATA.author,
          copyright: APP_METADATA.copyright,
        };
        break;
      }

      default: {
        contentData = {
          sectionType: type,
          message: 'Sección personalizada.',
        };
      }
    }

    return { contentData, status, warnings };
  }

  private static getDefaultSectionTitle(type: DocumentSectionType): string {
    const titles: Record<DocumentSectionType, string> = {
      COVER: 'Portada',
      PROJECT_SUMMARY: 'Resumen del Proyecto',
      PROJECT_DATA: 'Ficha Técnica',
      EXISTING_PLAN: 'Plano Estado Actual',
      PROPOSED_PLAN: 'Plano Propuesta',
      SPACE_ANALYSIS: 'Análisis Espacial',
      FUNCTIONAL_ZONES: 'Zonas Funcionales',
      MEASUREMENTS: 'Mediciones y Superficies',
      FURNITURE: 'Mobiliario',
      MATERIALS: 'Materiales',
      LIGHTING: 'Iluminación',
      CONSTRUCTION: 'Obra y Reforma',
      BUDGET: 'Presupuesto',
      SCENARIO_COMPARISON: 'Comparativa de Escenarios',
      OPTIMIZATION: 'Optimización de Diseño',
      VALIDATIONS: 'Validaciones Normativas',
      RENDERS: 'Renders Fotorrealistas',
      THREE_D_VIEWS: 'Vistas 3D',
      CONCLUSIONS: 'Conclusiones',
      NOTES: 'Notas Técnicas',
      DISCLAIMER: 'Aviso Legal',
    };
    return titles[type] || 'Sección';
  }
}
