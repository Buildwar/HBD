/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT AI PROVIDER & RECONSTRUCTION INTERFACE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  Product3DAssetDto,
  Product3DAssetType,
  ProductDimensionsDto,
  ProductMaterialCategory,
  ProductMaterialDto,
  ProductProvenance,
} from '../types/product.types.js';
import { ProductNormalizerEngine } from './productNormalizer.engine.js';

export interface IProductAIProvider {
  classifyCategory(title: string, description?: string): Promise<{ category: string; confidence: number }>;
  detectMaterials(text: string): Promise<ProductMaterialDto[]>;
  extractDimensions(text: string): Promise<ProductDimensionsDto | null>;
  reconstructGeometry(
    dimensions: ProductDimensionsDto,
    category: string,
    imageUrls?: string[]
  ): Promise<Product3DAssetDto>;
}

export class MockProductAIProvider implements IProductAIProvider {
  async classifyCategory(title: string, description?: string): Promise<{ category: string; confidence: number }> {
    const text = `${title} ${description || ''}`.toLowerCase();
    if (text.includes('sofá') || text.includes('sofa') || text.includes('chaise')) return { category: 'Sofás y Sillones', confidence: 0.92 };
    if (text.includes('mesa') || text.includes('table') || text.includes('escritorio')) return { category: 'Mesas y Escritorios', confidence: 0.94 };
    if (text.includes('silla') || text.includes('chair') || text.includes('butaca')) return { category: 'Sillas y Asientos', confidence: 0.91 };
    if (text.includes('armario') || text.includes('wardrobe') || text.includes('cómoda')) return { category: 'Armarios y Almacenaje', confidence: 0.95 };
    if (text.includes('cama') || text.includes('bed') || text.includes('canapé')) return { category: 'Camas y Dormitorio', confidence: 0.93 };
    if (text.includes('lámpara') || text.includes('lamp') || text.includes('foco')) return { category: 'Iluminación', confidence: 0.89 };
    return { category: 'Mobiliario General', confidence: 0.75 };
  }

  async detectMaterials(text: string): Promise<ProductMaterialDto[]> {
    const base = ProductNormalizerEngine.parseMaterialsFromText(text);
    return base.map((m) => ({
      ...m,
      provenance: ProductProvenance.AI_RECONSTRUCTED,
      confidence: 0.78,
    }));
  }

  async extractDimensions(text: string): Promise<ProductDimensionsDto | null> {
    const parsed = ProductNormalizerEngine.parseDimensionsFromText(text);
    if (!parsed) return null;
    return {
      ...parsed,
      provenance: ProductProvenance.AI_RECONSTRUCTED,
      confidence: 0.82,
    };
  }

  async reconstructGeometry(
    dimensions: ProductDimensionsDto,
    category: string,
    imageUrls?: string[]
  ): Promise<Product3DAssetDto> {
    return {
      id: `ai-recon-${Date.now().toString(36)}`,
      productId: 'ai-temp',
      type: Product3DAssetType.AI_RECONSTRUCTED,
      format: 'parametric_box',
      geometryConfig: {
        widthM: dimensions.widthM,
        depthM: dimensions.depthM,
        heightM: dimensions.heightM,
        mainColorHex: '#B0C4DE',
        secondaryColorHex: '#708090',
        cornerRadiusM: 0.04,
      },
      provenance: ProductProvenance.AI_RECONSTRUCTED,
      confidence: 0.72,
      isEstimatedAi: true,
      notes: 'Modelo 3D estimado mediante IA a partir de imágenes de catálogo y dimensiones declaradas.',
    };
  }
}
