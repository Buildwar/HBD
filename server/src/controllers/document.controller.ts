/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * CONTROLADOR DE DOCUMENTACIÓN Y PRESENTACIÓN
 * DOCUMENT CONTROLLER
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
  DocumentEngine,
  DocumentTemplateEngine,
  CreateDocumentInput,
  DocumentExportOptions,
} from '@hbd/shared';

export class DocumentController {
  /**
   * Obtiene la lista de documentos de un proyecto
   */
  public static async getProjectDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const documents = await prisma.projectDocument.findMany({
        where: { projectId },
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
          history: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.json({ success: true, data: documents });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Obtiene un documento individual con sus secciones
   */
  public static async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const document = await prisma.projectDocument.findUnique({
        where: { id },
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
          history: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!document) {
        res.status(404).json({ success: false, message: 'Documento no encontrado' });
        return;
      }

      res.json({ success: true, data: document });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Obtiene las plantillas de documento del sistema
   */
  public static async getTemplates(_req: Request, res: Response): Promise<void> {
    try {
      const systemTemplates = DocumentTemplateEngine.getSystemTemplates();
      const customTemplates = await prisma.documentTemplate.findMany();
      res.json({ success: true, data: [...systemTemplates, ...customTemplates] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Crea y genera un nuevo documento para el proyecto
   */
  public static async createDocument(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const body = req.body as CreateDocumentInput;
      const userId = (req as any).user?.id || null;

      // Obtener datos del proyecto para contexto
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          floors: {
            include: {
              rooms: true,
              walls: true,
              doors: true,
              windows: true,
              spaces: true,
              furniturePlacements: {
                include: { furniture: true },
              },
            },
          },
          renders: true,
          images: true,
          constructionProject: {
            include: { items: true, phases: true },
          },
        },
      });

      if (!project) {
        res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        return;
      }

      let scenario: any = null;
      if (body.scenarioId) {
        scenario = await prisma.projectScenario.findUnique({
          where: { id: body.scenarioId },
        });
      }

      let alternative: any = null;
      if (body.alternativeId) {
        alternative = await prisma.designAlternative.findUnique({
          where: { id: body.alternativeId },
        });
      }

      // Generar documento con DocumentEngine
      const generatedDoc = DocumentEngine.createDocument(
        {
          ...body,
          projectId,
        },
        {
          project,
          floor: project.floors[0] || null,
          scenario,
          alternative,
          renders: project.renders,
          images: project.images,
          language: body.language || 'es',
          metadata: body.metadata,
        }
      );

      // Persistir en base de datos Prisma
      const created = await prisma.projectDocument.create({
        data: {
          id: generatedDoc.id,
          projectId,
          scenarioId: generatedDoc.scenarioId,
          alternativeId: generatedDoc.alternativeId,
          templateId: generatedDoc.templateId,
          name: generatedDoc.name,
          description: generatedDoc.description,
          type: generatedDoc.type,
          status: generatedDoc.status,
          language: generatedDoc.language,
          version: generatedDoc.version,
          orientation: generatedDoc.orientation,
          pageSize: generatedDoc.pageSize,
          metadata: generatedDoc.metadata as any,
          createdById: userId,
          sections: {
            create: (generatedDoc.sections || []).map((s) => ({
              id: s.id,
              type: s.type,
              title: s.title,
              order: s.order,
              isEnabled: s.isEnabled,
              config: s.config as any,
              contentData: s.contentData as any,
              status: s.status,
              warnings: s.warnings as any,
            })),
          },
          history: {
            create: {
              action: 'CREATED',
              version: generatedDoc.version,
              snapshotData: { sectionsCount: generatedDoc.sections?.length || 0 },
              userId,
            },
          },
        },
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
          history: true,
        },
      });

      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Regenera un documento actualizando todas sus secciones
   */
  public static async regenerateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || null;

      const existing = await prisma.projectDocument.findUnique({
        where: { id },
        include: {
          sections: true,
          project: {
            include: {
              floors: {
                include: {
                  rooms: true,
                  walls: true,
                  doors: true,
                  windows: true,
                  spaces: true,
                  furniturePlacements: {
                    include: { furniture: true },
                  },
                },
              },
              renders: true,
              images: true,
              constructionProject: {
                include: { items: true, phases: true },
              },
            },
          },
        },
      });

      if (!existing) {
        res.status(404).json({ success: false, message: 'Documento no encontrado' });
        return;
      }

      let scenario: any = null;
      if (existing.scenarioId) {
        scenario = await prisma.projectScenario.findUnique({
          where: { id: existing.scenarioId },
        });
      }

      let alternative: any = null;
      if (existing.alternativeId) {
        alternative = await prisma.designAlternative.findUnique({
          where: { id: existing.alternativeId },
        });
      }

      const regenerated = DocumentEngine.regenerateDocument(existing as any, {
        project: existing.project,
        floor: existing.project.floors[0] || null,
        scenario,
        alternative,
        renders: existing.project.renders,
        images: existing.project.images,
        language: existing.language,
        metadata: existing.metadata as any,
      });

      // Actualizar secciones en base de datos
      await prisma.documentSection.deleteMany({ where: { documentId: id } });

      const updated = await prisma.projectDocument.update({
        where: { id },
        data: {
          version: regenerated.version,
          status: regenerated.status,
          metadata: regenerated.metadata as any,
          sections: {
            create: (regenerated.sections || []).map((s) => ({
              id: s.id,
              type: s.type,
              title: s.title,
              order: s.order,
              isEnabled: s.isEnabled,
              config: s.config as any,
              contentData: s.contentData as any,
              status: s.status,
              warnings: s.warnings as any,
            })),
          },
          history: {
            create: {
              action: 'REGENERATED',
              version: regenerated.version,
              snapshotData: { sectionsCount: regenerated.sections?.length || 0 },
              userId,
            },
          },
        },
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
          history: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Exporta un documento a PDF, PRINT, JSON o CSV
   */
  public static async exportDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const options = (req.body || { format: 'PDF' }) as DocumentExportOptions;

      const document = await prisma.projectDocument.findUnique({
        where: { id },
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!document) {
        res.status(404).json({ success: false, message: 'Documento no encontrado' });
        return;
      }

      const exportResult = DocumentEngine.exportDocument(document as any, options);

      // Registrar acción en historial
      await prisma.documentHistory.create({
        data: {
          documentId: id,
          action: `EXPORTED_${exportResult.format}`,
          version: document.version,
          snapshotData: { format: exportResult.format, filename: exportResult.filename },
          userId: (req as any).user?.id || null,
        },
      });

      res.json({ success: true, data: exportResult });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Elimina o archiva un documento
   */
  public static async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.projectDocument.delete({ where: { id } });
      res.json({ success: true, message: 'Documento eliminado correctamente' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
