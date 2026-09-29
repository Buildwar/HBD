/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * AIVisionEngine — Motor Central de Visión Artificial y Sincronización Espacial
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  VisionAnalysisResult,
  VisionContext,
  ImageSourceType,
  FurnitureDetection,
  VisionScaleReference,
} from '../types/aiVision.types.js';
import { DimensionSource } from '../types/furniture.types.js';
import { DesignPreferences } from '../types/aiDesign.types.js';

export class AIVisionEngine {
  /**
   * Extensiones y tipos MIME rigurosamente permitidos
   */
  static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  static readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
  static readonly MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  /**
   * Valida metadatos de archivo de imagen (MIME, extensión, tamaño)
   */
  static validateImageFile(fileMeta: {
    mimeType?: string;
    mimetype?: string;
    sizeBytes: number;
    originalFilename?: string;
    filename?: string;
  }): { isValid: boolean; valid: boolean; error?: string } {
    const filename = fileMeta.originalFilename || fileMeta.filename || '';
    const mime = fileMeta.mimeType || fileMeta.mimetype || '';
    const lastDot = filename.lastIndexOf('.');
    const ext = lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';

    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        valid: false,
        error: `Formato de archivo no soportado (${ext}). Utilice JPG, JPEG, PNG o WEBP.`,
      };
    }

    if (!this.ALLOWED_MIME_TYPES.includes(mime.toLowerCase())) {
      return {
        isValid: false,
        valid: false,
        error: `Tipo MIME no válido (${mime}). Se requiere imagen válida.`,
      };
    }

    if (fileMeta.sizeBytes > this.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        valid: false,
        error: `El archivo supera el tamaño máximo permitido de 50 MB (${(fileMeta.sizeBytes / (1024 * 1024)).toFixed(1)} MB).`,
      };
    }

    return { isValid: true, valid: true };
  }

  /**
   * Construye el contexto visual (VisionContext) para transferir a AIDesignEngine (V8)
   */
  static buildVisionContext(
    analysis: VisionAnalysisResult,
    sourceType: ImageSourceType
  ): VisionContext {
    return {
      imageId: analysis.imageId,
      sourceType,
      detectedStyle: analysis.inspirationProfile?.style,
      detectedAtmosphere: analysis.inspirationProfile?.atmosphere,
      visualPalette: analysis.visualPalette,
      detectedMaterials: analysis.detectedMaterials,
      detectedFurniture: analysis.detectedObjects,
      roomType: analysis.roomDetection?.roomType,
      confidenceScore: analysis.confidenceScore,
    };
  }

  /**
   * Mapea el contexto visual analizado en preferencias de diseño compatibles con V8
   */
  static mapVisionContextToDesignPreferences(
    visionContext: VisionContext
  ): Partial<DesignPreferences> {
    let style: any = 'MODERN';
    const styleLower = (visionContext.detectedStyle || '').toLowerCase();

    if (styleLower.includes('nord') || styleLower.includes('escand')) style = 'NORDIC';
    else if (styleLower.includes('minim')) style = 'MINIMALIST';
    else if (styleLower.includes('indus')) style = 'INDUSTRIAL';
    else if (styleLower.includes('clas') || styleLower.includes('classic')) style = 'CLASSIC';
    else if (styleLower.includes('japan')) style = 'JAPANDI';
    else if (styleLower.includes('mediter')) style = 'MEDITERRANEAN';
    else if (styleLower.includes('rust')) style = 'RUSTIC';

    let atmosphere: any = 'WARM';
    const atmosLower = (visionContext.detectedAtmosphere || '').toLowerCase();
    if (atmosLower.includes('lumin') || atmosLower.includes('light')) atmosphere = 'LUMINOUS';
    else if (atmosLower.includes('intim') || atmosLower.includes('cozy')) atmosphere = 'INTIMATE';

    return {
      style,
      atmosphere,
      colorPalette: 'warm',
      goal: 'more_space',
    };
  }

  /**
   * Convierte detecciones visuales confirmadas en FurniturePlacement DTOs
   */
  static convertDetectionsToPlacements(params: {
    detections: FurnitureDetection[];
    targetRoom?: any;
    scaleFactor?: number;
  }): any[] {
    const scaleFactor = params.scaleFactor || 100;
    const room = params.targetRoom;

    let originX = 200;
    let originY = 200;

    if (room && Array.isArray(room.polygon) && room.polygon.length > 0) {
      originX = room.polygon[0].x + 40;
      originY = room.polygon[0].y + 40;
    }

    return params.detections.map((det, index) => {
      const posX = originX + (index % 3) * (det.estimatedDimensions.widthM * scaleFactor + 20);
      const posY = originY + Math.floor(index / 3) * (det.estimatedDimensions.depthM * scaleFactor + 20);

      return {
        id: `vis-placement-${Date.now()}-${index}`,
        furnitureId: det.mappedFurnitureId || `gen-${det.category}`,
        furniture: {
          id: det.mappedFurnitureId || `gen-${det.category}`,
          name: det.label,
          categorySlug: det.category,
          defaultWidthM: det.estimatedDimensions.widthM,
          defaultDepthM: det.estimatedDimensions.depthM,
          defaultHeightM: det.estimatedDimensions.heightM,
          dimensionSource: det.isCustomConfirmed
            ? DimensionSource.USER_CONFIRMED
            : DimensionSource.AI_ESTIMATED,
        },
        posX,
        posY,
        posZ: 0,
        rotationDeg: 0,
        scale: 1,
        widthM: det.estimatedDimensions.widthM,
        depthM: det.estimatedDimensions.depthM,
        heightM: det.estimatedDimensions.heightM,
        colorHex: det.visualProperties?.colorHex || '#4b5563',
        source: 'VISION',
        createdAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Calcula escala proporcional a partir de una cota de referencia calibrada en la imagen
   */
  static estimateScaleFromReference(
    reference: VisionScaleReference,
    pixelSpan: number
  ): { pixelsPerMeter: number; confidence: number } {
    if (!reference.realDimensionM || reference.realDimensionM <= 0 || pixelSpan <= 0) {
      return { pixelsPerMeter: 100, confidence: 0.5 };
    }

    const pixelsPerMeter = pixelSpan / reference.realDimensionM;
    return {
      pixelsPerMeter: Math.round(pixelsPerMeter * 100) / 100,
      confidence: Math.min(reference.confidence, 0.95),
    };
  }
}
