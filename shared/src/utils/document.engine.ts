/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * MOTOR PRINCIPAL DE GESTIÓN DOCUMENTAL
 * DOCUMENT ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProjectDocumentDto,
  CreateDocumentInput,
  DocumentSectionDto,
  DocumentTemplateDto,
  DocumentStatus,
  DocumentExportResult,
  DocumentExportOptions,
} from '../types/document.types.js';
import { DocumentTemplateEngine } from './documentTemplate.engine.js';
import { DocumentBuilderEngine, DocumentBuildContext } from './documentBuilder.engine.js';
import { DocumentExportEngine } from './documentExport.engine.js';

export class DocumentEngine {
  /**
   * Crea un nuevo documento a partir de una plantilla y contexto
   */
  public static createDocument(
    input: CreateDocumentInput,
    context?: DocumentBuildContext
  ): ProjectDocumentDto {
    const timestamp = new Date().toISOString();
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Obtener plantilla base
    const template: DocumentTemplateDto = input.templateId
      ? DocumentTemplateEngine.getTemplate(input.templateId)
      : input.templateType
      ? DocumentTemplateEngine.getTemplate(input.templateType)
      : DocumentTemplateEngine.getTemplate('STANDARD_PROJECT');

    const sectionsConfig = input.customSections || template.sectionsConfig;

    // 2. Construir secciones si se proporciona contexto
    let sections: DocumentSectionDto[] = [];
    if (context) {
      sections = DocumentBuilderEngine.buildDocumentSections(documentId, sectionsConfig, context);
    } else {
      sections = sectionsConfig.map((sc, i) => ({
        id: `sec-${documentId}-${sc.type.toLowerCase()}-${i + 1}`,
        documentId,
        type: sc.type,
        title: sc.title,
        order: sc.order || i + 1,
        isEnabled: sc.isEnabled !== false,
        config: sc,
        contentData: {},
        status: 'READY',
        warnings: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      }));
    }

    const document: ProjectDocumentDto = {
      id: documentId,
      projectId: input.projectId,
      scenarioId: input.scenarioId || null,
      alternativeId: input.alternativeId || null,
      templateId: template.id,
      name: input.name || template.name,
      description: input.description || template.description,
      type: input.templateType || template.type,
      status: 'READY',
      language: input.language || 'es',
      version: '1.0',
      orientation: input.orientation || template.defaultOrientation,
      pageSize: input.pageSize || template.defaultPageSize,
      metadata: {
        ...input.metadata,
        generatedAt: timestamp,
        totalPages: sections.filter((s) => s.isEnabled).length,
      },
      sections,
      history: [
        {
          id: `hist-${Date.now()}-1`,
          documentId,
          action: 'CREATED',
          version: '1.0',
          snapshotData: { sectionsCount: sections.length },
          createdAt: timestamp,
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return document;
  }

  /**
   * Regenera las secciones de un documento actualizando datos desde el modelo
   */
  public static regenerateDocument(
    document: ProjectDocumentDto,
    context: DocumentBuildContext
  ): ProjectDocumentDto {
    const timestamp = new Date().toISOString();
    const sectionConfigs = (document.sections || []).map((s) => ({
      type: s.type,
      title: s.title,
      order: s.order,
      isEnabled: s.isEnabled,
      config: s.config,
    }));

    const updatedSections = DocumentBuilderEngine.buildDocumentSections(document.id, sectionConfigs, context);

    // Incrementar versión menor del documento (ej. 1.0 -> 1.1)
    const [major, minor] = (document.version || '1.0').split('.').map(Number);
    const newVersion = `${major || 1}.${(minor || 0) + 1}`;

    return {
      ...document,
      status: 'READY',
      version: newVersion,
      sections: updatedSections,
      metadata: {
        ...document.metadata,
        generatedAt: timestamp,
        totalPages: updatedSections.filter((s) => s.isEnabled).length,
      },
      history: [
        ...(document.history || []),
        {
          id: `hist-${Date.now()}-${(document.history?.length || 0) + 1}`,
          documentId: document.id,
          action: 'REGENERATED',
          version: newVersion,
          snapshotData: { sectionsCount: updatedSections.length },
          createdAt: timestamp,
        },
      ],
      updatedAt: timestamp,
    };
  }

  /**
   * Exporta un documento al formato solicitado utilizando DocumentExportEngine
   */
  public static exportDocument(
    document: ProjectDocumentDto,
    options: DocumentExportOptions = { format: 'PDF' }
  ): DocumentExportResult {
    return DocumentExportEngine.export(document, options);
  }
}
