/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * AIDesignService — Servicio Orquestador de IA de Diseño, Validación y Persistencia
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { PrismaClient } from '@prisma/client';
import {
  AIDesignEngine,
  DesignAIProvider,
  DesignPreferences,
  DesignContext,
  AIDesignProposal,
  RoomAnalysisInsight,
  ProjectDesignAnalysis,
  AICopilotCommandRequest,
  AICopilotCommandResponse,
  AIProviderConfig,
  MockDesignAIProvider,
} from '@hbd/shared';
import { OpenAIDesignProvider } from './openAiDesign.provider.js';
import { ENV } from '../../config/env.js';

const prisma = new PrismaClient();

export class AIDesignService {
  private provider: DesignAIProvider;

  constructor(customProvider?: DesignAIProvider) {
    if (customProvider) {
      this.provider = customProvider;
    } else if (ENV.AI_PROVIDER === 'openai' && ENV.AI_API_KEY) {
      this.provider = new OpenAIDesignProvider(ENV.AI_API_KEY, ENV.AI_MODEL);
    } else {
      this.provider = new MockDesignAIProvider();
    }
  }

  getProviderStatus(): AIProviderConfig {
    return this.provider.getProviderConfig();
  }

  /**
   * Carga los datos completos de una planta para construir el DesignContext
   */
  private async loadFloorDesignContext(
    projectId: string,
    floorId: string,
    userId: string,
    targetRoomId?: string,
    preferences?: Partial<DesignPreferences>
  ): Promise<DesignContext> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        floors: {
          where: { id: floorId },
          include: {
            walls: true,
            rooms: true,
            doors: true,
            windows: true,
            measurements: true,
            furniturePlacements: {
              include: { furniture: true },
            },
            floorPlans: true,
          },
        },
        designVariants: {
          where: { floorId },
        },
      },
    });

    if (!project) {
      throw new Error(`Proyecto ${projectId} no encontrado`);
    }

    const floor = project.floors[0];
    if (!floor) {
      throw new Error(`Planta ${floorId} no encontrada en el proyecto ${projectId}`);
    }

    const catalog = await prisma.furniture.findMany({
      take: 100,
      include: { category: true },
    });

    const scaleFactor = floor.floorPlans[0]?.scaleFactor || 100;

    return AIDesignEngine.buildDesignContext({
      project: {
        id: project.id,
        name: project.name,
        propertyType: project.propertyType || undefined,
      },
      floor: {
        id: floor.id,
        name: floor.name,
        level: floor.level,
        walls: floor.walls,
        rooms: floor.rooms,
        doors: floor.doors,
        windows: floor.windows,
        measurements: floor.measurements,
        furniturePlacements: floor.furniturePlacements,
      },
      scaleFactor,
      targetRoomId,
      furnitureCatalog: catalog as any,
      userPreferences: preferences,
      existingVariants: project.designVariants.map((v) => ({
        id: v.id,
        name: v.name,
        description: v.description || undefined,
        isDefault: v.isDefault,
        materialOverrides: (v.materialOverrides as Record<string, string>) || {},
        furnitureOverrides: (v.furnitureOverrides as Record<string, any>) || {},
        createdAt: v.createdAt.toISOString(),
      })),
    });
  }

  async analyzeRoom(
    projectId: string,
    floorId: string,
    roomId: string,
    userId: string
  ): Promise<RoomAnalysisInsight> {
    const context = await this.loadFloorDesignContext(projectId, floorId, userId, roomId);
    const room = context.rooms.find((r) => r.id === roomId);
    if (!room) {
      throw new Error(`Habitación ${roomId} no encontrada en la planta ${floorId}`);
    }
    return this.provider.analyzeRoom(room, context);
  }

  async analyzeProject(
    projectId: string,
    floorId: string,
    userId: string
  ): Promise<ProjectDesignAnalysis> {
    const context = await this.loadFloorDesignContext(projectId, floorId, userId);
    return this.provider.analyzeProject(context);
  }

  async generateProposals(
    projectId: string,
    floorId: string,
    userId: string,
    targetRoomId?: string,
    preferences?: Partial<DesignPreferences>
  ): Promise<{ proposals: AIDesignProposal[]; historyId: string }> {
    const context = await this.loadFloorDesignContext(
      projectId,
      floorId,
      userId,
      targetRoomId,
      preferences
    );

    // 1. Generación por el proveedor de IA
    const rawProposals = await this.provider.generateDesignProposals(context);

    // 2. Validación geométrica estricta de cada propuesta
    const validatedProposals: AIDesignProposal[] = rawProposals.map((prop) => {
      const validation = AIDesignEngine.validateAIProposal(prop, context);
      return {
        ...prop,
        validationResult: validation.validation,
        status: validation.isValid ? 'VALIDATED' : 'INVALID',
      };
    });

    // 3. Persistencia en historial
    const history = await prisma.aIDesignHistory.create({
      data: {
        projectId,
        floorId,
        roomId: targetRoomId || null,
        userId,
        provider: this.provider.getProviderConfig().providerName,
        preferences: context.userPreferences as any,
        proposals: validatedProposals as any,
        status: 'GENERATED',
      },
    });

    return {
      proposals: validatedProposals,
      historyId: history.id,
    };
  }

  async processCopilotCommand(
    projectId: string,
    floorId: string,
    userId: string,
    prompt: string,
    targetRoomId?: string
  ): Promise<AICopilotCommandResponse> {
    const context = await this.loadFloorDesignContext(projectId, floorId, userId, targetRoomId);

    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: { furniturePlacements: { include: { furniture: true } } },
    });

    const currentPlacements = (floor?.furniturePlacements || []).map((p: any) => ({
      id: p.id,
      floorId: p.floorId,
      furnitureId: p.furnitureId,
      furniture: p.furniture,
      posX: p.posX,
      posY: p.posY,
      posZ: p.posZ || 0,
      rotationDeg: p.rotationDeg || 0,
      scale: 1,
      widthM: p.widthM,
      depthM: p.depthM,
      heightM: p.heightM,
      validationStatus: 'VALID' as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    const request: AICopilotCommandRequest = {
      prompt,
      projectId,
      floorId,
      targetRoomId,
      currentPlacements,
    };

    return this.provider.processCopilotCommand(request, context);
  }

  async applyProposal(
    projectId: string,
    floorId: string,
    proposalId: string,
    historyId: string,
    userId: string,
    userRole: string
  ): Promise<{ success: boolean; appliedCount: number; message: string }> {
    if (userRole === 'VIEWER') {
      throw new Error('Los usuarios con rol VISOR no tienen permisos para aplicar cambios en el diseño.');
    }

    const history = await prisma.aIDesignHistory.findUnique({
      where: { id: historyId },
    });

    if (!history) {
      throw new Error(`Registro de historial ${historyId} no encontrado`);
    }

    const proposals = history.proposals as unknown as AIDesignProposal[];
    const proposal = proposals.find((p) => p.id === proposalId);

    if (!proposal) {
      throw new Error(`Propuesta ${proposalId} no encontrada en el historial ${historyId}`);
    }

    if (proposal.status === 'INVALID') {
      throw new Error('No se puede aplicar una propuesta clasificada como inválida por el motor de validación geométrica.');
    }

    // Cargar colocaciones actuales
    const currentPlacements = await prisma.furniturePlacement.findMany({
      where: { floorId },
    });

    let appliedCount = 0;

    for (const change of proposal.furnitureChanges) {
      if (change.type === 'added') {
        await prisma.furniturePlacement.create({
          data: {
            floorId,
            furnitureId: change.furnitureId,
            posX: change.newPosX,
            posY: change.newPosY,
            posZ: change.newPosZ || 0,
            rotationDeg: change.newRotationDeg,
            widthM: change.dimensions.widthM,
            depthM: change.dimensions.depthM,
            heightM: change.dimensions.heightM,
          },
        });
        appliedCount++;
      } else if (change.type === 'moved' || change.type === 'adjusted') {
        const existing = currentPlacements.find((p) => p.id === change.placementId || p.furnitureId === change.furnitureId);
        if (existing) {
          await prisma.furniturePlacement.update({
            where: { id: existing.id },
            data: {
              posX: change.newPosX,
              posY: change.newPosY,
              posZ: change.newPosZ || 0,
              rotationDeg: change.newRotationDeg,
              widthM: change.dimensions.widthM,
              depthM: change.dimensions.depthM,
              heightM: change.dimensions.heightM,
            },
          });
          appliedCount++;
        }
      } else if (change.type === 'removed') {
        if (change.placementId) {
          await prisma.furniturePlacement.delete({
            where: { id: change.placementId },
          });
          appliedCount++;
        }
      }
    }

    // Actualizar estado en historial
    await prisma.aIDesignHistory.update({
      where: { id: historyId },
      data: {
        selectedProposalId: proposalId,
        status: 'APPLIED',
      },
    });

    return {
      success: true,
      appliedCount,
      message: `Propuesta "${proposal.name}" aplicada correctamente (${appliedCount} cambios realizados).`,
    };
  }

  async saveProposalAsVariant(
    projectId: string,
    floorId: string,
    proposalId: string,
    historyId: string,
    variantName?: string,
    userId?: string,
    userRole?: string
  ): Promise<{ success: boolean; variantId: string }> {
    if (userRole === 'VIEWER') {
      throw new Error('Los usuarios con rol VISOR no tienen permisos para crear variantes.');
    }

    const history = await prisma.aIDesignHistory.findUnique({
      where: { id: historyId },
    });

    if (!history) {
      throw new Error(`Historial ${historyId} no encontrado`);
    }

    const proposals = history.proposals as unknown as AIDesignProposal[];
    const proposal = proposals.find((p) => p.id === proposalId);

    if (!proposal) {
      throw new Error(`Propuesta ${proposalId} no encontrada`);
    }

    const variantRecord = await prisma.designVariantRecord.create({
      data: {
        projectId,
        floorId,
        name: variantName || proposal.name || 'Variante de Diseño IA',
        description: proposal.summary,
        materialOverrides: proposal.materialOverrides as any,
        furnitureOverrides: {
          proposalId: proposal.id,
          style: proposal.style,
          atmosphere: proposal.atmosphere,
          furnitureChanges: proposal.furnitureChanges,
          lighting: proposal.lightingOverrides,
        } as any,
        isDefault: false,
      },
    });

    return {
      success: true,
      variantId: variantRecord.id,
    };
  }

  async getProjectHistory(projectId: string, userId: string) {
    return prisma.aIDesignHistory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
