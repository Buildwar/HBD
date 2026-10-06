/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * MOTOR DE PLANTILLAS DE DOCUMENTACIÓN Y PRESENTACIÓN
 * DOCUMENT TEMPLATE ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  DocumentTemplateDto,
  DocumentType,
  DocumentSectionConfig,
  DocumentOrientation,
  DocumentPageSize,
} from '../types/document.types.js';

export class DocumentTemplateEngine {
  /**
   * Obtiene la lista completa de plantillas predefinidas del sistema
   */
  public static getSystemTemplates(): DocumentTemplateDto[] {
    const timestamp = new Date().toISOString();
    return [
      {
        id: 'template-standard-project',
        name: 'Dossier Estándar de Proyecto',
        description: 'Documento balanceado con resumen, planos, mediciones, mobiliario, presupuesto y renders.',
        type: 'PROJECT_DOSSIER',
        isSystem: true,
        defaultOrientation: 'PORTRAIT',
        defaultPageSize: 'A4',
        sectionsConfig: [
          { type: 'COVER', title: 'Portada del Proyecto', order: 1, isEnabled: true },
          { type: 'PROJECT_SUMMARY', title: 'Resumen Ejecutivo', order: 2, isEnabled: true },
          { type: 'PROJECT_DATA', title: 'Ficha Técnica y Emplazamiento', order: 3, isEnabled: true },
          { type: 'PROPOSED_PLAN', title: 'Plano de Distribución Propuesta', order: 4, isEnabled: true },
          { type: 'MEASUREMENTS', title: 'Cuadro de Superficies y Mediciones', order: 5, isEnabled: true },
          { type: 'SPACE_ANALYSIS', title: 'Análisis de Estancias y Espacios', order: 6, isEnabled: true },
          { type: 'FURNITURE', title: 'Inventario de Mobiliario y Equipamiento', order: 7, isEnabled: true },
          { type: 'BUDGET', title: 'Resumen Presupuestario', order: 8, isEnabled: true },
          { type: 'RENDERS', title: 'Visualización y Renders Fotorrealistas', order: 9, isEnabled: true },
          { type: 'DISCLAIMER', title: 'Aviso Legal y Validación Técnica', order: 10, isEnabled: true },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'template-interior-design',
        name: 'Dossier de Interiorismo y Estilismo',
        description: 'Enfocado en mobiliario, materiales, iluminación, paleta cromática y vistas fotorrealistas.',
        type: 'DESIGN_PRESENTATION',
        isSystem: true,
        defaultOrientation: 'LANDSCAPE',
        defaultPageSize: 'A4',
        sectionsConfig: [
          { type: 'COVER', title: 'Portada de Interiorismo', order: 1, isEnabled: true },
          { type: 'PROJECT_SUMMARY', title: 'Concepto y Memoria de Diseño', order: 2, isEnabled: true },
          { type: 'PROPOSED_PLAN', title: 'Plano de Distribución y Mobiliario', order: 3, isEnabled: true },
          { type: 'FUNCTIONAL_ZONES', title: 'Zonificación Funcional y Usos', order: 4, isEnabled: true },
          { type: 'FURNITURE', title: 'Catálogo de Mobiliario', order: 5, isEnabled: true },
          { type: 'MATERIALS', title: 'Moodboard y Cuadro de Materiales', order: 6, isEnabled: true },
          { type: 'LIGHTING', title: 'Plan de Iluminación y Luminarias', order: 7, isEnabled: true },
          { type: 'RENDERS', title: 'Galería de Renders y Vistas 3D', order: 8, isEnabled: true },
          { type: 'THREE_D_VIEWS', title: 'Perspectivas Axonométricas 3D', order: 9, isEnabled: true },
          { type: 'CONCLUSIONS', title: 'Recomendaciones de Estilismo', order: 10, isEnabled: true },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'template-renovation',
        name: 'Informe Técnico de Reforma y Obra',
        description: 'Comparativa antes/después, demoliciones, obra nueva, partidas con mermas y validaciones.',
        type: 'RENOVATION_REPORT',
        isSystem: true,
        defaultOrientation: 'PORTRAIT',
        defaultPageSize: 'A4',
        sectionsConfig: [
          { type: 'COVER', title: 'Informe Técnico de Reforma', order: 1, isEnabled: true },
          { type: 'PROJECT_SUMMARY', title: 'Alcance de la Intervención', order: 2, isEnabled: true },
          { type: 'EXISTING_PLAN', title: 'Estado Actual y Demoliciones', order: 3, isEnabled: true },
          { type: 'PROPOSED_PLAN', title: 'Estado Reformado y Nueva Planta', order: 4, isEnabled: true },
          { type: 'SCENARIO_COMPARISON', title: 'Comparativa Estado Actual vs Propuesta', order: 5, isEnabled: true },
          { type: 'MEASUREMENTS', title: 'Mediciones Geométricas Detalladas', order: 6, isEnabled: true },
          { type: 'CONSTRUCTION', title: 'Fases, Tareas y Partidas de Obra', order: 7, isEnabled: true },
          { type: 'BUDGET', title: 'Presupuesto de Ejecución Material', order: 8, isEnabled: true },
          { type: 'VALIDATIONS', title: 'Verificación Normativa y CTE Referencial', order: 9, isEnabled: true },
          { type: 'DISCLAIMER', title: 'Responsabilidad Técnica Profesional', order: 10, isEnabled: true },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'template-technical',
        name: 'Memoria Técnica de Arquitectura e Ingeniería',
        description: 'Documentación rigurosa de superficies útiles/construidas, CTE y normativas de habitabilidad.',
        type: 'TECHNICAL_REPORT',
        isSystem: true,
        defaultOrientation: 'PORTRAIT',
        defaultPageSize: 'A4',
        sectionsConfig: [
          { type: 'COVER', title: 'Memoria Técnica Arquitectónica', order: 1, isEnabled: true },
          { type: 'PROJECT_DATA', title: 'Datos Generales y Normativa de Aplicación', order: 2, isEnabled: true },
          { type: 'MEASUREMENTS', title: 'Cálculo de Superficies Útiles, Construidas y Volúmenes', order: 3, isEnabled: true },
          { type: 'SPACE_ANALYSIS', title: 'Espacios Funcionales y Habitabilidad', order: 4, isEnabled: true },
          { type: 'VALIDATIONS', title: 'Matriz de Cumplimiento de Reglas Espaciales', order: 5, isEnabled: true },
          { type: 'CONSTRUCTION', title: 'Especificaciones de Albañilería e Instalaciones', order: 6, isEnabled: true },
          { type: 'BUDGET', title: 'Cuadro de Precios Descompuestos', order: 7, isEnabled: true },
          { type: 'NOTES', title: 'Prescripciones Técnicas Particulares', order: 8, isEnabled: true },
          { type: 'DISCLAIMER', title: 'Cláusula de Validación Colegial', order: 9, isEnabled: true },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'template-client-presentation',
        name: 'Presentación Comercial para Cliente',
        description: 'Formato visual y atractivo sin sobrecarga técnica, ideal para reuniones con clientes.',
        type: 'CLIENT_PRESENTATION',
        isSystem: true,
        defaultOrientation: 'LANDSCAPE',
        defaultPageSize: 'A4',
        sectionsConfig: [
          { type: 'COVER', title: 'Tu Nueva Vivienda', order: 1, isEnabled: true },
          { type: 'PROJECT_SUMMARY', title: 'Propuesta de Diseño y Estilo', order: 2, isEnabled: true },
          { type: 'PROPOSED_PLAN', title: 'Distribución y Espacios', order: 3, isEnabled: true },
          { type: 'RENDERS', title: 'Vistas Fotorrealistas', order: 4, isEnabled: true },
          { type: 'FURNITURE', title: 'Selección de Mobiliario', order: 5, isEnabled: true },
          { type: 'BUDGET', title: 'Inversión Estimada', order: 6, isEnabled: true },
          { type: 'CONCLUSIONS', title: 'Próximos Pasos', order: 7, isEnabled: true },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'template-full-project',
        name: 'Dossier Integral Completo (Full Project)',
        description: 'Documentación exhaustiva con todos los capítulos, análisis, renders y comparativas.',
        type: 'PROJECT_DOSSIER',
        isSystem: true,
        defaultOrientation: 'PORTRAIT',
        defaultPageSize: 'A4',
        sectionsConfig: [
          { type: 'COVER', title: 'Dossier Integral del Proyecto', order: 1, isEnabled: true },
          { type: 'PROJECT_SUMMARY', title: 'Resumen Ejecutivo y Ficha Técnica', order: 2, isEnabled: true },
          { type: 'PROJECT_DATA', title: 'Datos del Inmueble', order: 3, isEnabled: true },
          { type: 'EXISTING_PLAN', title: 'Plano del Estado Original', order: 4, isEnabled: true },
          { type: 'PROPOSED_PLAN', title: 'Plano del Estado Propuesto', order: 5, isEnabled: true },
          { type: 'SCENARIO_COMPARISON', title: 'Comparativa de Escenarios y Alternativas', order: 6, isEnabled: true },
          { type: 'OPTIMIZATION', title: 'Optimización Multicriterio de Diseño', order: 7, isEnabled: true },
          { type: 'SPACE_ANALYSIS', title: 'Análisis Espacial y Funcional', order: 8, isEnabled: true },
          { type: 'FUNCTIONAL_ZONES', title: 'Zonas Funcionales y Convivencia', order: 9, isEnabled: true },
          { type: 'MEASUREMENTS', title: 'Mediciones Métricas y Volumetría', order: 10, isEnabled: true },
          { type: 'FURNITURE', title: 'Equipamiento y Mobiliario', order: 11, isEnabled: true },
          { type: 'MATERIALS', title: 'Materiales y Acabados', order: 12, isEnabled: true },
          { type: 'LIGHTING', title: 'Iluminación y Confort Visual', order: 13, isEnabled: true },
          { type: 'CONSTRUCTION', title: 'Planificación de Obra y Reforma', order: 14, isEnabled: true },
          { type: 'BUDGET', title: 'Presupuesto Detallado con Mermas', order: 15, isEnabled: true },
          { type: 'VALIDATIONS', title: 'Validaciones de Habitabilidad y Normativa', order: 16, isEnabled: true },
          { type: 'RENDERS', title: 'Galería de Renders Fotorrealistas', order: 17, isEnabled: true },
          { type: 'THREE_D_VIEWS', title: 'Vistas 3D y Modelado Digital', order: 18, isEnabled: true },
          { type: 'CONCLUSIONS', title: 'Conclusiones y Dictamen', order: 19, isEnabled: true },
          { type: 'NOTES', title: 'Notas y Prescripciones', order: 20, isEnabled: true },
          { type: 'DISCLAIMER', title: 'Aviso Legal y Responsabilidad', order: 21, isEnabled: true },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];
  }

  /**
   * Obtiene una plantilla por su ID o tipo
   */
  public static getTemplate(idOrType: string): DocumentTemplateDto {
    const templates = this.getSystemTemplates();
    const found = templates.find((t) => t.id === idOrType || t.type === idOrType);
    return found || templates[0];
  }
}
