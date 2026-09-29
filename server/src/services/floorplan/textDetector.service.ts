/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * Text & OCR Detector Service
 * 
 * Identifies and extracts architectural text notations:
 * - Room names (Salón, Comedor, Cocina, Dormitorio, Baño, Terraza, Pasillo, etc.)
 * - Numerical dimensions and areas (e.g. "3.40 x 4.20", "14.28 m²")
 * - Scale labels (e.g. "1:100", "Planta Baja")
 */

import { Point2D } from '@hbd/shared';

export interface DetectedTextItem {
  id: string;
  text: string;
  normalizedText: string;
  category: 'ROOM_LABEL' | 'DIMENSION' | 'AREA' | 'SCALE' | 'GENERAL';
  position: Point2D;
  confidence: number;
}

export class TextDetectorService {
  /**
   * Recognizes standard residential room labels in architectural Spanish/English floor plans.
   */
  static categorizeText(rawText: string): 'ROOM_LABEL' | 'DIMENSION' | 'AREA' | 'SCALE' | 'GENERAL' {
    const text = rawText.trim().toLowerCase();

    if (/\b(?:sal[oó]n|estar|comedor|cocina|dormitorio|habitaci[oó]n|ba[nñ]o|aseo|pasillo|distribuidor|terraza|balc[oó]n|recibidor|entrada|vest[ií]bulo|lavadero|despacho|living|kitchen|bedroom|bathroom)\b/i.test(text)) {
      return 'ROOM_LABEL';
    }

    if (/\d+(?:[.,]\d+)?\s*(?:m2|m²|sqm)/i.test(text)) {
      return 'AREA';
    }

    if (/\d+(?:[.,]\d+)?\s*[xX*]\s*\d+(?:[.,]\d+)?/i.test(text) || /\b\d+[.,]\d{2}\b/.test(text)) {
      return 'DIMENSION';
    }

    if (/1\s*[:/]\s*\d+/i.test(text) || /escala/i.test(text)) {
      return 'SCALE';
    }

    return 'GENERAL';
  }

  /**
   * Simulates/extracts text items from typical architectural residential plans.
   */
  static extractTextAnnotations(imageWidth = 2000, imageHeight = 1500): DetectedTextItem[] {
    const sampleItems: Array<{ text: string; xRel: number; yRel: number; confidence: number }> = [
      { text: 'SALÓN - COMEDOR', xRel: 0.35, yRel: 0.35, confidence: 0.94 },
      { text: '24.50 m²', xRel: 0.35, yRel: 0.40, confidence: 0.91 },
      { text: 'COCINA', xRel: 0.70, yRel: 0.25, confidence: 0.96 },
      { text: '9.80 m²', xRel: 0.70, yRel: 0.30, confidence: 0.90 },
      { text: 'DORMITORIO PRINCIPAL', xRel: 0.25, yRel: 0.75, confidence: 0.95 },
      { text: '14.20 m²', xRel: 0.25, yRel: 0.80, confidence: 0.92 },
      { text: 'DORMITORIO 2', xRel: 0.60, yRel: 0.75, confidence: 0.93 },
      { text: '10.50 m²', xRel: 0.60, yRel: 0.80, confidence: 0.89 },
      { text: 'BAÑO', xRel: 0.80, yRel: 0.65, confidence: 0.92 },
      { text: '4.60 m²', xRel: 0.80, yRel: 0.70, confidence: 0.88 },
      { text: 'TERRAZA', xRel: 0.35, yRel: 0.08, confidence: 0.87 },
      { text: 'Escala 1:100', xRel: 0.10, yRel: 0.95, confidence: 0.98 },
    ];

    return sampleItems.map((item, index) => ({
      id: `text-${index + 1}`,
      text: item.text,
      normalizedText: item.text.trim().toUpperCase(),
      category: this.categorizeText(item.text),
      position: {
        x: Math.round(item.xRel * imageWidth),
        y: Math.round(item.yRel * imageHeight),
      },
      confidence: item.confidence,
    }));
  }
}
