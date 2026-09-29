/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * AIVisionController — Controlador REST de Visión Artificial, Galería e Inspección Espacial
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Request, Response } from 'express';
import { AIVisionService } from '../modules/ai-vision/aiVision.service.js';
import { ImageSourceType } from '@hbd/shared';

const aiVisionService = AIVisionService.getInstance();

export class AIVisionController {
  static async getProviderStatus(_req: Request, res: Response) {
    try {
      const config = aiVisionService.getProvider().getProviderConfig();
      res.json({
        success: true,
        data: config,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estado del proveedor de Visión IA',
      });
    }
  }

  static async uploadImage(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo de imagen.',
        });
      }

      const { projectId, floorId, roomId, sourceType } = req.body;
      const userId = (req as any).user?.id;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'projectId es obligatorio.',
        });
      }

      const imageRecord = await aiVisionService.uploadProjectImage({
        projectId,
        floorId,
        roomId,
        sourceType: sourceType as ImageSourceType,
        file,
        userId,
      });

      res.status(201).json({
        success: true,
        data: imageRecord,
        message: 'Imagen subida correctamente a la galería del proyecto.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir la imagen.',
      });
    }
  }

  static async getProjectImages(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { sourceType } = req.query;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'projectId es obligatorio.',
        });
      }

      const images = await aiVisionService.getProjectImages(
        projectId,
        sourceType as ImageSourceType
      );

      res.json({
        success: true,
        data: images,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener imágenes del proyecto.',
      });
    }
  }

  static async getImageById(req: Request, res: Response) {
    try {
      const { imageId } = req.params;
      const image = await aiVisionService.getImageById(imageId);

      res.json({
        success: true,
        data: image,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Imagen no encontrada.',
      });
    }
  }

  static async deleteImage(req: Request, res: Response) {
    try {
      const { imageId } = req.params;
      const result = await aiVisionService.deleteImage(imageId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar la imagen.',
      });
    }
  }

  static async analyzeImage(req: Request, res: Response) {
    try {
      const { imageId } = req.body;
      if (!imageId) {
        return res.status(400).json({
          success: false,
          message: 'imageId es obligatorio para iniciar el análisis visual.',
        });
      }

      const analysis = await aiVisionService.analyzeImage(imageId);

      res.json({
        success: true,
        data: analysis,
        message: 'Análisis de visión artificial completado con éxito.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al analizar la imagen con Visión IA.',
      });
    }
  }

  static async compareWithProject(req: Request, res: Response) {
    try {
      const { imageId } = req.body;
      if (!imageId) {
        return res.status(400).json({
          success: false,
          message: 'imageId es obligatorio para la comparativa.',
        });
      }

      const diff = await aiVisionService.compareWithProject(imageId);

      res.json({
        success: true,
        data: diff,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al comparar imagen con el proyecto.',
      });
    }
  }

  static async reviewAndApply(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userRole = user?.role?.name || user?.role || 'VIEWER';

      if (userRole === 'VIEWER') {
        return res.status(403).json({
          success: false,
          message: 'Los usuarios con rol VISOR no tienen permisos para aplicar mobiliario al proyecto.',
        });
      }

      const result = await aiVisionService.reviewAndApplyDetections(req.body, user?.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al aplicar las detecciones confirmadas.',
      });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const history = await aiVisionService.getProjectVisionHistory(projectId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener historial de visión.',
      });
    }
  }
}
