/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * SERVICIO API DE DOCUMENTACIÓN Y PRESENTACIÓN
 * DOCUMENT SERVICE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProjectDocumentDto,
  DocumentTemplateDto,
  CreateDocumentInput,
  DocumentExportOptions,
  DocumentExportResult,
} from '@hbd/shared';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const documentService = {
  /**
   * Obtiene todos los documentos de un proyecto
   */
  async getProjectDocuments(projectId: string): Promise<{ success: boolean; data: ProjectDocumentDto[] }> {
    const res = await fetch(`/api/projects/${projectId}/documents`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar documentos del proyecto');
    return res.json();
  },

  /**
   * Obtiene un documento por su ID
   */
  async getDocumentById(id: string): Promise<{ success: boolean; data: ProjectDocumentDto }> {
    const res = await fetch(`/api/documents/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar el documento');
    return res.json();
  },

  /**
   * Obtiene las plantillas del sistema
   */
  async getTemplates(): Promise<{ success: boolean; data: DocumentTemplateDto[] }> {
    const res = await fetch('/api/documents/templates', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar plantillas de documentos');
    return res.json();
  },

  /**
   * Crea y genera un nuevo documento
   */
  async createDocument(
    projectId: string,
    data: CreateDocumentInput
  ): Promise<{ success: boolean; data: ProjectDocumentDto }> {
    const res = await fetch(`/api/projects/${projectId}/documents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al generar el documento');
    return res.json();
  },

  /**
   * Regenera un documento actualizando todas sus secciones
   */
  async regenerateDocument(id: string): Promise<{ success: boolean; data: ProjectDocumentDto }> {
    const res = await fetch(`/api/documents/${id}/regenerate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al regenerar el documento');
    return res.json();
  },

  /**
   * Exporta un documento a PDF, JSON, CSV o PRINT
   */
  async exportDocument(
    id: string,
    options: DocumentExportOptions = { format: 'PDF' }
  ): Promise<{ success: boolean; data: DocumentExportResult }> {
    const res = await fetch(`/api/documents/${id}/export`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(options),
    });
    if (!res.ok) throw new Error('Error al exportar el documento');
    return res.json();
  },

  /**
   * Elimina un documento
   */
  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar el documento');
    return res.json();
  },
};
