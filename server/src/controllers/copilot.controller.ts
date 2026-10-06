/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Copilot Backend Controller
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
  CopilotOrchestratorEngine,
  CopilotToolRegistry,
  AIProjectContext,
  AIConversation,
  AICopilotAction,
} from '@hbd/shared';

export class CopilotController {
  /**
   * Helper to fetch default user ID when auth middleware is bypassed in dev/tests.
   */
  private static async getUserId(req: Request): Promise<string> {
    if ((req as any).user?.id) return (req as any).user.id;
    const firstUser = await prisma.user.findFirst();
    if (firstUser) return firstUser.id;

    // Create fallback default admin user if none exists
    const role = await prisma.role.findFirst() || await prisma.role.create({
      data: { name: 'ADMIN', description: 'Administrador total' },
    });

    const created = await prisma.user.create({
      data: {
        email: 'admin@hbd.local',
        username: 'admin',
        name: 'Adrián Palma',
        passwordHash: '$2a$10$dummyhashfordevonly',
        roleId: role.id,
      },
    });
    return created.id;
  }

  /**
   * Helper to build live project context from DB.
   */
  private static async buildLiveContext(projectId?: string, propertyId?: string): Promise<AIProjectContext> {
    const context: AIProjectContext = {
      projectId,
      propertyId,
      layers: {},
    };

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          floors: {
            include: {
              rooms: true,
              furniturePlacements: true,
              technicalElements: true,
            },
          },
          costItems: true,
          technicalElements: true,
          procurementItems: true,
        },
      });

      if (project) {
        let totalAreaM2 = 0;
        let totalRooms = 0;
        let totalFurniture = 0;

        project.floors.forEach((f: any) => {
          totalFurniture += (f.furniturePlacements?.length || 0);
          f.rooms?.forEach((r: any) => {
            totalRooms++;
            totalAreaM2 += (r.areaM2 || 15);
          });
        });

        context.layers = {
          level1_summary: {
            projectId: project.id,
            projectName: project.name,
            propertyId: project.propertyId || undefined,
            status: 'ACTIVE',
            totalAreaM2: totalAreaM2 || 85.0,
            floorsCount: project.floors.length || 1,
            roomsCount: totalRooms || 4,
            createdAt: project.createdAt.toISOString(),
          },
          level4_furniture: {
            furnitureCount: totalFurniture,
            items: [],
          },
          level5_technical: {
            elementsCount: project.technicalElements?.length || 0,
            connectionsCount: 0,
            summaryByType: {},
          },
          level7_financial: {
            budgetTotalEur: project.costItems?.reduce((acc: number, item: any) => acc + (item.estimatedTotalCost || 0), 0) || 0,
          },
        };

        // If project has rooms, set first active room context
        const firstRoom = project.floors[0]?.rooms?.[0];
        if (firstRoom) {
          context.activeRoomId = firstRoom.id;
          context.layers.level2_room = {
            roomId: firstRoom.id,
            roomName: firstRoom.name,
            roomType: firstRoom.roomType || 'LIVING_ROOM',
            areaM2: firstRoom.areaM2 || 22.5,
            perimeterM: 19.0,
            heightM: firstRoom.heightM || 2.6,
          };
        }
      }
    }

    return context;
  }

  /**
   * POST /api/ai/copilot/chat
   * Main chat endpoint with tool orchestration and structured execution.
   */
  static async chat(req: Request, res: Response) {
    try {
      const userId = await CopilotController.getUserId(req);
      const { message, conversationId, projectId, propertyId, context: clientContext } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'El mensaje del usuario es obligatorio.' });
      }

      // 1. Find or create conversation in DB
      let dbConv = conversationId
        ? await prisma.aIConversation.findUnique({
            where: { id: conversationId },
            include: { messages: true, actions: true },
          })
        : null;

      if (!dbConv) {
        dbConv = await prisma.aIConversation.create({
          data: {
            userId,
            projectId: projectId || null,
            propertyId: propertyId || null,
            title: message.length > 50 ? message.substring(0, 47) + '...' : message,
            context: clientContext || {},
          },
          include: { messages: true, actions: true },
        });
      }

      // 2. Build live context
      const liveContext = await CopilotController.buildLiveContext(
        projectId || dbConv.projectId || undefined,
        propertyId || dbConv.propertyId || undefined
      );
      const mergedContext = { ...liveContext, ...(clientContext || {}) };

      // 3. Save user message to DB
      const userMsgRecord = await prisma.aIMessage.create({
        data: {
          conversationId: dbConv.id,
          sender: 'USER',
          content: message,
        },
      });

      // 4. Map DB conversation to domain AIConversation
      const domainConv: AIConversation = {
        id: dbConv.id,
        userId: dbConv.userId,
        projectId: dbConv.projectId || undefined,
        propertyId: dbConv.propertyId || undefined,
        title: dbConv.title,
        context: mergedContext,
        isPinned: dbConv.isPinned,
        messages: [
          ...dbConv.messages.map((m: any) => ({
            id: m.id,
            conversationId: m.conversationId,
            sender: m.sender as any,
            content: m.content,
            intent: m.intent as any,
            structuredPayload: m.structuredPayload as any,
            confidence: m.confidence as any,
            createdAt: m.createdAt.toISOString(),
          })),
          {
            id: userMsgRecord.id,
            conversationId: dbConv.id,
            sender: 'USER',
            content: message,
            createdAt: userMsgRecord.createdAt.toISOString(),
          },
        ],
        actions: dbConv.actions.map((a: any) => ({
          id: a.id,
          conversationId: a.conversationId || undefined,
          projectId: a.projectId || undefined,
          type: a.type as any,
          entityType: a.entityType as any,
          entityId: a.entityId || undefined,
          parameters: (a.parameters as any) || {},
          reason: a.reason || '',
          confidence: a.confidence as any,
          riskLevel: a.riskLevel as any,
          requiresConfirmation: a.requiresConfirmation,
          status: a.status as any,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        })),
        createdAt: dbConv.createdAt.toISOString(),
        updatedAt: dbConv.updatedAt.toISOString(),
      };

      // 5. Orchestrate AI Response & Tools
      const orchestratorResult = await CopilotOrchestratorEngine.processMessage({
        userMessage: message,
        conversation: domainConv,
        context: mergedContext,
        userPermissions: ['ai.read', 'ai.use', 'ai.execute', 'ai.confirm'],
      });

      // 6. Persist assistant message in DB
      const assistantMsgRecord = await prisma.aIMessage.create({
        data: {
          conversationId: dbConv.id,
          sender: 'COPILOT',
          content: orchestratorResult.message.content,
          intent: orchestratorResult.message.intent,
          structuredPayload: orchestratorResult.message.structuredPayload as any,
          toolCalls: orchestratorResult.message.toolCalls as any,
          confidence: orchestratorResult.message.confidence,
          tokens: orchestratorResult.message.tokens,
          latencyMs: orchestratorResult.message.latencyMs,
        },
      });

      // 7. Persist proposed actions in DB
      const savedActions: any[] = [];
      if (orchestratorResult.proposedActions && orchestratorResult.proposedActions.length > 0) {
        for (const act of orchestratorResult.proposedActions) {
          const actionRecord = await prisma.aIAction.create({
            data: {
              id: act.id,
              userId,
              projectId: projectId || dbConv.projectId || null,
              conversationId: dbConv.id,
              type: act.type,
              entityType: act.entityType || null,
              entityId: act.entityId || null,
              parameters: act.parameters || {},
              reason: act.reason,
              confidence: act.confidence,
              riskLevel: act.riskLevel,
              requiresConfirmation: act.requiresConfirmation,
              status: act.status,
            },
          });
          savedActions.push(actionRecord);
        }
      }

      // 8. Log interaction for audit trail
      await prisma.aIInteraction.create({
        data: {
          userId,
          projectId: projectId || dbConv.projectId || null,
          propertyId: propertyId || dbConv.propertyId || null,
          conversationId: dbConv.id,
          intent: orchestratorResult.message.intent || 'GENERAL_QUERY',
          toolName: orchestratorResult.message.toolCalls?.[0]?.toolName || null,
          inputSummary: { query: message },
          outputSummary: { responseLength: orchestratorResult.message.content.length, actionsCount: savedActions.length },
          status: 'SUCCESS',
          latencyMs: orchestratorResult.message.latencyMs,
          requiresConfirmation: savedActions.some((a) => a.requiresConfirmation),
        },
      });

      // 9. Record AI usage
      await prisma.aIUsage.create({
        data: {
          userId,
          projectId: projectId || dbConv.projectId || null,
          provider: orchestratorResult.usage?.provider || 'mock',
          model: orchestratorResult.usage?.model || 'hbd-copilot-default',
          tokensPrompt: 200,
          tokensCompletion: orchestratorResult.message.tokens ? orchestratorResult.message.tokens - 200 : 300,
          totalTokens: orchestratorResult.message.tokens || 500,
          estimatedCostEur: 0.0,
          latencyMs: orchestratorResult.message.latencyMs || 25,
          operation: 'copilot_chat',
        },
      });

      return res.json({
        success: true,
        data: {
          conversationId: dbConv.id,
          message: {
            ...orchestratorResult.message,
            id: assistantMsgRecord.id,
          },
          proposedActions: savedActions.length > 0 ? savedActions : orchestratorResult.proposedActions,
          usage: orchestratorResult.usage,
        },
      });
    } catch (error: any) {
      console.error('[CopilotController.chat] Error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error al procesar el mensaje con el Copiloto.' });
    }
  }

  /**
   * GET /api/ai/conversations
   * Lists conversations.
   */
  static async getConversations(req: Request, res: Response) {
    try {
      const userId = await CopilotController.getUserId(req);
      const { projectId, propertyId } = req.query;

      const where: any = { userId };
      if (projectId) where.projectId = String(projectId);
      if (propertyId) where.propertyId = String(propertyId);

      const conversations = await prisma.aIConversation.findMany({
        where,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          actions: {
            where: { status: 'PENDING' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return res.json({ success: true, data: conversations });
    } catch (error: any) {
      console.error('[CopilotController.getConversations] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/ai/conversations/:id
   * Get single conversation with full message history and actions.
   */
  static async getConversationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const conversation = await prisma.aIConversation.findUnique({
        where: { id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
          actions: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversación no encontrada.' });
      }

      return res.json({ success: true, data: conversation });
    } catch (error: any) {
      console.error('[CopilotController.getConversationById] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/ai/conversations
   * Create fresh conversation.
   */
  static async createConversation(req: Request, res: Response) {
    try {
      const userId = await CopilotController.getUserId(req);
      const { projectId, propertyId, title, context } = req.body;

      const conv = await prisma.aIConversation.create({
        data: {
          userId,
          projectId: projectId || null,
          propertyId: propertyId || null,
          title: title || 'Nueva conversación con Copiloto',
          context: context || {},
        },
      });

      return res.status(201).json({ success: true, data: conv });
    } catch (error: any) {
      console.error('[CopilotController.createConversation] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /api/ai/conversations/:id
   * Deletes a conversation.
   */
  static async deleteConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.aIConversation.delete({ where: { id } });
      return res.json({ success: true, message: 'Conversación eliminada correctamente.' });
    } catch (error: any) {
      console.error('[CopilotController.deleteConversation] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/ai/actions/:id/confirm
   * Confirms a pending AI action.
   */
  static async confirmAction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const action = await prisma.aIAction.findUnique({ where: { id } });

      if (!action) {
        return res.status(404).json({ success: false, error: 'Acción no encontrada.' });
      }

      if (action.status !== 'PENDING') {
        return res.status(400).json({ success: false, error: `La acción ya tiene estado "${action.status}".` });
      }

      // Execute simulated side effect depending on type
      let resultData: any = { executed: true, timestamp: new Date().toISOString() };

      if (action.type === 'CREATE_SCENARIO' && action.projectId) {
        // Create scenario record in DB
        const params = (action.parameters as any) || {};
        const scenario = await prisma.projectScenario.create({
          data: {
            projectId: action.projectId,
            name: params.name || 'Escenario Propuesto por Copiloto',
            description: action.reason,
            budgetSummary: { costEur: params.costEur || 0 },
            status: 'DRAFT',
          },
        });
        resultData = { scenarioId: scenario.id, name: scenario.name };
      }

      const updated = await prisma.aIAction.update({
        where: { id },
        data: {
          status: 'EXECUTED',
          result: resultData,
          executedAt: new Date(),
        },
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('[CopilotController.confirmAction] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/ai/actions/:id/cancel
   * Cancels / Rejects a pending action.
   */
  static async cancelAction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const action = await prisma.aIAction.findUnique({ where: { id } });

      if (!action) {
        return res.status(404).json({ success: false, error: 'Acción no encontrada.' });
      }

      const updated = await prisma.aIAction.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('[CopilotController.cancelAction] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/ai/interactions
   * Audit interaction logs.
   */
  static async getInteractions(req: Request, res: Response) {
    try {
      const { projectId, propertyId } = req.query;
      const where: any = {};
      if (projectId) where.projectId = String(projectId);
      if (propertyId) where.propertyId = String(propertyId);

      const interactions = await prisma.aIInteraction.findMany({
        where,
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: interactions });
    } catch (error: any) {
      console.error('[CopilotController.getInteractions] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/ai/usage
   * Token & operation statistics.
   */
  static async getUsage(req: Request, res: Response) {
    try {
      const usages = await prisma.aIUsage.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      });

      const totalTokens = usages.reduce((acc: number, u: any) => acc + (u.totalTokens || 0), 0);
      const totalEstimatedCostEur = usages.reduce((acc: number, u: any) => acc + (u.estimatedCostEur || 0), 0);

      return res.json({
        success: true,
        data: {
          totalRequests: usages.length,
          totalTokens,
          totalEstimatedCostEur,
          history: usages,
        },
      });
    } catch (error: any) {
      console.error('[CopilotController.getUsage] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/ai/tools
   * Lists all registered tools with schemas and permissions.
   */
  static async getTools(_req: Request, res: Response) {
    try {
      const tools = CopilotToolRegistry.getAllTools();
      return res.json({ success: true, data: tools });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
