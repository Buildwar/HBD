/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT PROVENANCE & CONFIDENCE ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProductProvenance,
  ProductVerificationStatus,
  ConfidenceTier,
} from '../types/product.types.js';

export const PROVENANCE_HIERARCHY: Record<ProductProvenance, number> = {
  [ProductProvenance.OFFICIAL_3D]: 90,
  [ProductProvenance.OFFICIAL_PRODUCT_DATA]: 80,
  [ProductProvenance.USER_PROVIDED]: 70,
  [ProductProvenance.IMPORTED]: 60,
  [ProductProvenance.AI_RECONSTRUCTED]: 50,
  [ProductProvenance.PARAMETRIC]: 40,
  [ProductProvenance.ESTIMATED]: 30,
  [ProductProvenance.UNKNOWN]: 10,
};

export const VERIFICATION_HIERARCHY: Record<ProductVerificationStatus, number> = {
  [ProductVerificationStatus.USER_CONFIRMED]: 100,
  [ProductVerificationStatus.USER_EDITED]: 95,
  [ProductVerificationStatus.CUSTOMIZED]: 90,
  [ProductVerificationStatus.SYSTEM_EXTRACTED]: 60,
  [ProductVerificationStatus.AI_DETECTED]: 40,
  [ProductVerificationStatus.REVIEW_REQUIRED]: 20,
  [ProductVerificationStatus.INVALID]: 0,
};

export class ProductProvenanceEngine {
  /**
   * Calcula el nivel de confianza cualitativo (HIGH, MEDIUM, LOW)
   */
  static getConfidenceTier(score: number): ConfidenceTier {
    if (score >= 0.85) return 'HIGH';
    if (score >= 0.60) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Evalúa la procedencia más alta entre dos orígenes
   */
  static compareProvenance(a: ProductProvenance, b: ProductProvenance): number {
    return (PROVENANCE_HIERARCHY[a] || 0) - (PROVENANCE_HIERARCHY[b] || 0);
  }

  /**
   * Genera una explicación transparente y descriptiva del origen y fiabilidad del producto
   */
  static getProvenanceDescription(
    provenance: ProductProvenance,
    status: ProductVerificationStatus,
    confidence: number
  ): { label: string; explanation: string; requiresReview: boolean } {
    let label = 'Datos Importados';
    let explanation = 'Información extraída automáticamente desde la página web del fabricante.';
    let requiresReview = false;

    if (status === ProductVerificationStatus.USER_CONFIRMED) {
      return {
        label: 'Verificado por el Usuario',
        explanation: 'Las dimensiones y características han sido revisadas y confirmadas formalmente por el usuario.',
        requiresReview: false,
      };
    }

    if (status === ProductVerificationStatus.CUSTOMIZED) {
      return {
        label: 'Personalizado',
        explanation: 'Las dimensiones originales del catálogo fueron modificadas por el usuario para su proyecto.',
        requiresReview: false,
      };
    }

    switch (provenance) {
      case ProductProvenance.OFFICIAL_3D:
        label = 'Modelo 3D Oficial';
        explanation = 'Geometría 3D y especificaciones oficiales proporcionadas directamente por el fabricante.';
        break;
      case ProductProvenance.OFFICIAL_PRODUCT_DATA:
        label = 'Ficha Oficial del Fabricante';
        explanation = 'Datos técnicos estructurados extraídos de fuentes oficiales (JSON-LD / metadatos de producto).';
        break;
      case ProductProvenance.AI_RECONSTRUCTED:
        label = 'Estimación por IA';
        explanation = 'Modelo o dimensiones inferidas mediante visión e inteligencia artificial a partir de imágenes.';
        requiresReview = true;
        break;
      case ProductProvenance.PARAMETRIC:
        label = 'Geometría Paramétrica';
        explanation = 'Representación geométrica procedural ajustada a las medidas volumétricas del producto.';
        break;
      case ProductProvenance.ESTIMATED:
        label = 'Dimensiones Estimadas';
        explanation = 'No se hallaron medidas completas; se aplicaron valores estándar basados en la tipología del mueble.';
        requiresReview = true;
        break;
      case ProductProvenance.UNKNOWN:
      default:
        label = 'Origen No Verificado';
        explanation = 'Faltan datos estructurados fiables. Se recomienda verificación manual antes de fabricar o comprar.';
        requiresReview = true;
        break;
    }

    if (confidence < 0.60) {
      requiresReview = true;
    }

    return { label, explanation, requiresReview };
  }

  /**
   * Si el usuario altera las medidas reales de catálogo, degrada el estado a CUSTOMIZED
   */
  static handleDimensionModification(
    originalWidthM: number,
    originalDepthM: number,
    originalHeightM: number,
    newWidthM: number,
    newDepthM: number,
    newHeightM: number
  ): {
    isModified: boolean;
    verificationStatus: ProductVerificationStatus;
    warning?: string;
  } {
    const isDiff =
      Math.abs(originalWidthM - newWidthM) > 0.005 ||
      Math.abs(originalDepthM - newDepthM) > 0.005 ||
      Math.abs(originalHeightM - newHeightM) > 0.005;

    if (isDiff) {
      return {
        isModified: true,
        verificationStatus: ProductVerificationStatus.CUSTOMIZED,
        warning: 'Has modificado las medidas reales de catálogo. Este mueble ya no corresponde exactamente al producto comercial original.',
      };
    }

    return {
      isModified: false,
      verificationStatus: ProductVerificationStatus.USER_CONFIRMED,
    };
  }
}
