/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * AIVisionService — Servicio de Visión Artificial, Gestión de Galería y Mapeo Espacial
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import {
  AIVisionEngine,
  MockVisionProvider,
  VisionProvider,
  VisionAnalysisResult,
  VisionDiffResult,
  VisionReviewDto,
  ImageSourceType,
  DimensionSource,
} from '@hbd/shared';
import { OpenAiVisionProvider } from './openAiVision.provider.js';

export class AIVisionService {
  private static instance: AIVisionService;
  private provider: VisionProvider;

  private constructor() {
    if (ENV.AI_VISION_PROVIDER === 'openai' && ENV.AI_VISION_API_KEY) {
      this.provider = new OpenAiVisionProvider();
    } else {
      this.provider = new MockVisionProvider();
    }
  }

  public static getInstance(): AIVisionService {
    if (!AIVisionService.instance) {
      AIVisionService.instance = new AIVisionService();
    }
    return AIVisionService.instance;
  }

  getProvider(): VisionProvider {
    return this.provider;
  }

  /**
   * Sube una imagen a la galería del proyecto y valida formato y seguridad
   */
  async uploadProjectImage(params: {
    projectId: string;
    floorId?: string;
    roomId?: string;
    sourceType?: ImageSourceType;
    file: Express.Multer.File;
    userId?: string;
  }) {
    const { projectId, floorId, roomId, file, userId } = params;
    const sourceType: ImageSourceType = params.sourceType || 'UPLOAD';

    // 1. Validar seguridad del archivo con AIVisionEngine
    const validation = AIVisionEngine.validateImageFile({
      mimeType: file.mimetype,
      sizeBytes: file.size,
      originalFilename: file.originalname,
    });

    if (!validation.isValid) {
      // Eliminar archivo temporal si falló la validación
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(validation.error || 'Archivo de imagen no válido.');
    }

    // 2. Destino definitivo en /uploads/projects/{projectId}/images/
    const projectDir = path.resolve(ENV.UPLOAD_DIR, 'projects', projectId, 'images');
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const finalFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const finalPath = path.join(projectDir, finalFilename);

    fs.renameSync(file.path, finalPath);

    const relativeUrl = `/uploads/projects/${projectId}/images/${finalFilename}`;

    // 3. Crear registro en la base de datos
    const imageRecord = await prisma.projectImage.create({
      data: {
        projectId,
        floorId: floorId || null,
        roomId: roomId || null,
        sourceType,
        filename: finalFilename,
        originalFilename: file.originalname,
        url: relativeUrl,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        status: 'UPLOADED',
        provider: this.provider.getProviderConfig().providerName,
        userId: userId || null,
      },
    });

    return imageRecord;
  }

  /**
   * Lista las imágenes de la galería de un proyecto
   */
  async getProjectImages(projectId: string, sourceType?: ImageSourceType) {
    const where: any = { projectId };
    if (sourceType) {
      where.sourceType = sourceType;
    }

    const images = await prisma.projectImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    return images;
  }

  /**
   * Obtiene el detalle de una imagen junto con su análisis de visión
   */
  async getImageById(imageId: string) {
    const image = await prisma.projectImage.findUnique({
      where: { id: imageId },
      include: {
        project: true,
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    if (!image) {
      throw new Error(`Imagen con ID ${imageId} no encontrada.`);
    }

    return image;
  }

  /**
   * Elimina una imagen de la galería y su archivo físico
   */
  async deleteImage(imageId: string) {
    const image = await this.getImageById(imageId);

    const filePath = path.resolve(ENV.UPLOAD_DIR, 'projects', image.projectId, 'images', image.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('No se pudo borrar archivo físico de imagen:', e);
      }
    }

    await prisma.projectImage.delete({
      where: { id: imageId },
    });

    return { success: true, message: 'Imagen eliminada correctamente.' };
  }

  /**
   * Ejecuta el análisis de IA de visión sobre una imagen
   */
  async analyzeImage(imageId: string): Promise<VisionAnalysisResult> {
    const image = await this.getImageById(imageId);

    // Actualizar estado a PROCESSING
    await prisma.projectImage.update({
      where: { id: imageId },
      data: { status: 'ANALYZING' },
    });

    try {
      const filePath = path.resolve(ENV.UPLOAD_DIR, 'projects', image.projectId, 'images', image.filename);
      let buffer: Buffer | undefined;
      if (fs.existsSync(filePath)) {
        buffer = fs.readFileSync(filePath);
      }

      const analysis = await this.provider.analyzeImage({
        imageId: image.id,
        imageUrl: image.url,
        imageBuffer: buffer,
        mimeType: image.mimeType,
        filename: image.originalFilename,
        sourceType: image.sourceType as ImageSourceType,
        projectId: image.projectId,
        floorId: image.floorId || undefined,
        roomId: image.roomId || undefined,
      });

      // Guardar análisis estructurado en base de datos
      await prisma.projectImage.update({
        where: { id: imageId },
        data: {
          status: 'ANALYZED',
          analysisData: analysis as any,
          analyzedAt: new Date(),
        },
      });

      return analysis;
    } catch (err: any) {
      await prisma.projectImage.update({
        where: { id: imageId },
        data: { status: 'ERROR' },
      });
      throw err;
    }
  }

  /**
   * Compara una foto real analizada contra los elementos 3D/2D del proyecto
   */
  async compareWithProject(imageId: string): Promise<VisionDiffResult> {
    const image = await this.getImageById(imageId);

    // Cargar contexto del proyecto
    const project = await prisma.project.findUnique({
      where: { id: image.projectId },
      include: {
        floors: {
          include: {
            rooms: true,
            walls: true,
            furniturePlacements: {
              include: {
                furniture: {
                  include: { category: true },
                },
              },
            },
          },
        },
      },
    });

    if (!project) throw new Error('Proyecto no encontrado.');

    const targetFloor = image.floorId
      ? project.floors.find((f: any) => f.id === image.floorId) || project.floors[0]
      : project.floors[0];

    const projectContext = {
      rooms: targetFloor ? targetFloor.rooms : [],
      walls: targetFloor ? targetFloor.walls : [],
      furniturePlacements: targetFloor ? targetFloor.furniturePlacements : [],
    };

    return this.provider.compareWithProject(
      {
        imageId: image.id,
        imageUrl: image.url,
        mimeType: image.mimeType,
        filename: image.originalFilename,
        projectId: image.projectId,
        floorId: image.floorId || undefined,
        roomId: image.roomId || undefined,
      },
      projectContext
    );
  }

  /**
   * Revisa detecciones humanas y aplica los elementos confirmados al modelo
   */
  async reviewAndApplyDetections(reviewDto: VisionReviewDto, _userId: string) {
    const image = await this.getImageById(reviewDto.imageId);
    const analysis = (image.analysisData as unknown as VisionAnalysisResult) || (await this.analyzeImage(image.id));

    const confirmedItems = reviewDto.reviews.filter((r) => r.action === 'CONFIRM' || r.action === 'EDIT');

    if (reviewDto.applyToProject && confirmedItems.length > 0) {
      const targetFloorId = reviewDto.floorId || image.floorId;
      if (!targetFloorId) {
        throw new Error('Debe especificar la planta de destino para aplicar las detecciones de mobiliario.');
      }

      // Buscar categoría genérica o crear muebles
      for (const item of confirmedItems) {
        const det = analysis.detectedObjects.find((d) => d.id === item.id);
        if (!det) continue;

        const widthM = item.customDimensions?.widthM || det.estimatedDimensions.widthM;
        const depthM = item.customDimensions?.depthM || det.estimatedDimensions.depthM;
        const heightM = item.customDimensions?.heightM || det.estimatedDimensions.heightM;

        // Buscar categoría en la BD o usar categoría por defecto
        let category = await prisma.furnitureCategory.findFirst({
          where: { slug: det.category },
        });

        if (!category) {
          category = await prisma.furnitureCategory.findFirst();
        }

        if (category) {
          // Crear pieza de catálogo con fuente de dimensiones AI_ESTIMATED o USER_CONFIRMED
          const furniture = await prisma.furniture.create({
            data: {
              name: item.customLabel || det.label,
              categoryId: category.id,
              defaultWidthM: widthM,
              defaultDepthM: depthM,
              defaultHeightM: heightM,
              isCustom: true,
            },
          });

          // Crear colocación en la planta
          await prisma.furniturePlacement.create({
            data: {
              floorId: targetFloorId,
              furnitureId: furniture.id,
              posX: 250,
              posY: 200,
              posZ: 0,
              rotationDeg: 0,
              widthM,
              depthM,
              heightM,
            },
          });
        }
      }

      await prisma.projectImage.update({
        where: { id: image.id },
        data: { status: 'APPLIED' },
      });
    } else {
      await prisma.projectImage.update({
        where: { id: image.id },
        data: { status: 'CONFIRMED' },
      });
    }

    return {
      success: true,
      appliedCount: confirmedItems.length,
      message: `Se confirmaron ${confirmedItems.length} detecciones y se sincronizaron con el proyecto.`,
    };
  }

  /**
   * Obtiene el historial de análisis de visión de un proyecto
   */
  async getProjectVisionHistory(projectId: string) {
    const imagesWithAnalysis = await prisma.projectImage.findMany({
      where: {
        projectId,
        status: { in: ['ANALYZED', 'CONFIRMED', 'APPLIED'] },
      },
      orderBy: { analyzedAt: 'desc' },
      select: {
        id: true,
        filename: true,
        originalFilename: true,
        url: true,
        sourceType: true,
        status: true,
        provider: true,
        analysisData: true,
        createdAt: true,
        analyzedAt: true,
      },
    });

    return imagesWithAnalysis;
  }
}
