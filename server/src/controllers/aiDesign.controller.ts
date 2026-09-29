/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * AIDesignController — Controlador de Endpoints de IA de Diseño
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Request, Response } from 'express';
import { AIDesignService } from '../modules/ai-design/aiDesign.service.js';

const aiDesignService = new AIDesignService();

export class AIDesignController {
  static async getProviderStatus(req: Request, res: Response) {
    try {
      const status = aiDesignService.getProviderStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estado del proveedor de IA',
      });
    }
  }

  static async analyzeRoom(req: Request, res: Response) {
    try {
      const { projectId, floorId, roomId } = req.body;
      const userId = req.user?.id || '';

      if (!projectId || !floorId || !roomId) {
        return res.status(400).json({
          success: false,
          message: 'projectId, floorId y roomId son obligatorios',
        });
      }

      const insight = await aiDesignService.analyzeRoom(projectId, floorId, roomId, userId);
      res.json({
        success: true,
        data: insight,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al analizar la habitación con IA',
      });
    }
  }

  static async analyzeProject(req: Request, res: Response) {
    try {
      const { projectId, floorId } = req.body;
      const userId = req.user?.id || '';

      if (!projectId || !floorId) {
        return res.status(400).json({
          success: false,
          message: 'projectId y floorId son obligatorios',
        });
      }

      const analysis = await aiDesignService.analyzeProject(projectId, floorId, userId);
      res.json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al analizar el proyecto con IA',
      });
    }
  }

  static async generateProposals(req: Request, res: Response) {
    try {
      const { projectId, floorId, targetRoomId, preferences } = req.body;
      const userId = req.user?.id || '';

      if (!projectId || !floorId) {
        return res.status(400).json({
          success: false,
          message: 'projectId y floorId son obligatorios',
        });
      }

      const result = await aiDesignService.generateProposals(
        projectId,
        floorId,
        userId,
        targetRoomId,
        preferences
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar propuestas de diseño con IA',
      });
    }
  }

  static async processCopilotCommand(req: Request, res: Response) {
    try {
      const { projectId, floorId, prompt, targetRoomId } = req.body;
      const userId = req.user?.id || '';

      if (!projectId || !floorId || !prompt) {
        return res.status(400).json({
          success: false,
          message: 'projectId, floorId y prompt son obligatorios',
        });
      }

      const response = await aiDesignService.processCopilotCommand(
        projectId,
        floorId,
        userId,
        prompt,
        targetRoomId
      );

      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al procesar instrucción de Copilot',
      });
    }
  }

  static async applyProposal(req: Request, res: Response) {
    try {
      const { projectId, floorId, proposalId, historyId } = req.body;
      const userId = req.user?.id || '';
      const userRole = req.user?.roleName || 'USER';

      if (!projectId || !floorId || !proposalId || !historyId) {
        return res.status(400).json({
          success: false,
          message: 'projectId, floorId, proposalId y historyId son obligatorios',
        });
      }

      const result = await aiDesignService.applyProposal(
        projectId,
        floorId,
        proposalId,
        historyId,
        userId,
        userRole
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al aplicar propuesta de diseño',
      });
    }
  }

  static async saveProposalAsVariant(req: Request, res: Response) {
    try {
      const { projectId, floorId, proposalId, historyId, variantName } = req.body;
      const userId = req.user?.id || '';
      const userRole = req.user?.roleName || 'USER';

      if (!projectId || !floorId || !proposalId || !historyId) {
        return res.status(400).json({
          success: false,
          message: 'projectId, floorId, proposalId y historyId son obligatorios',
        });
      }

      const result = await aiDesignService.saveProposalAsVariant(
        projectId,
        floorId,
        proposalId,
        historyId,
        variantName,
        userId,
        userRole
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al guardar propuesta como variante',
      });
    }
  }

  static async getProjectHistory(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id || '';

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'projectId es obligatorio',
        });
      }

      const history = await aiDesignService.getProjectHistory(projectId, userId);
      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener historial de IA',
      });
    }
  }
}
