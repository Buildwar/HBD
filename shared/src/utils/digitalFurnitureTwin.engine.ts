/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — DIGITAL FURNITURE TWIN ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  DimensionSource,
  FurnitureCategoryDto,
  FurnitureDto,
  FurniturePlacementDto,
  SpatialValidationStatus,
} from '../types/furniture.types.js';
import {
  DigitalFurnitureTwinDto,
  Product3DAssetDto,
  Product3DAssetType,
  ProductDimensionsDto,
  ProductDto,
  ProductProvenance,
  ProductVerificationStatus,
} from '../types/product.types.js';

export class DigitalFurnitureTwinEngine {
  /**
   * Crea un Gemelo Digital de Mobiliario (DigitalFurnitureTwin) a partir de un producto real importado
   */
  static createTwinFromProduct(
    product: ProductDto,
    variantId?: string | null,
    customDimensions?: { widthM: number; depthM: number; heightM: number }
  ): DigitalFurnitureTwinDto {
    const variant = variantId ? product.variants.find((v) => v.id === variantId) : null;
    const baseDimensions: ProductDimensionsDto = variant?.dimensions || product.dimensions;

    const dimensions: ProductDimensionsDto = customDimensions
      ? {
          ...baseDimensions,
          widthM: customDimensions.widthM,
          depthM: customDimensions.depthM,
          heightM: customDimensions.heightM,
          provenance: ProductProvenance.USER_PROVIDED,
          confidence: 1.0,
          isCustomized: true,
        }
      : baseDimensions;

    // Determinar asset 3D o generar representación paramétrica
    let asset3d = product.assets3d.find((a) => (variantId ? a.variantId === variantId : true));
    if (!asset3d) {
      asset3d = this.generateParametricAsset(product, dimensions);
    }

    const shape = this.inferShapeFromCategory(product.category);

    return {
      id: `twin-${product.id}-${Date.now().toString(36)}`,
      productId: product.id,
      variantId: variantId || null,
      name: variant ? `${product.name} (${variant.name})` : product.name,
      dimensions,
      geometry: {
        shape: 'box',
        boundingDimensionsM: {
          width: dimensions.widthM,
          depth: dimensions.depthM,
          height: dimensions.heightM,
        },
      },
      materials: variant?.material
        ? [
            {
              category: 'wood',
              name: variant.material,
              colorHex: variant.colorCode || '#8B5A2B',
              provenance: variant.provenance,
              confidence: variant.confidence,
            },
          ]
        : product.materials,
      asset3d,
      transform: {
        rotationDeg: 0,
        scale: 1.0,
        lockRealDimensions: !dimensions.isCustomized,
      },
      provenance: product.provenance,
      confidence: product.confidence,
      verificationStatus: dimensions.isCustomized
        ? ProductVerificationStatus.CUSTOMIZED
        : product.verificationStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Convierte el DigitalFurnitureTwin a una entidad Furniture compatible con FurnitureEngine (V5-V15)
   */
  static convertTwinToFurniture(
    twin: DigitalFurnitureTwinDto,
    product: ProductDto,
    categoryDto?: FurnitureCategoryDto
  ): FurnitureDto {
    const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;

    return {
      id: `furn-twin-${twin.id}`,
      name: twin.name,
      categoryId: categoryDto?.id || 'cat-living-room',
      category: categoryDto,
      defaultWidthM: twin.dimensions.widthM,
      defaultDepthM: twin.dimensions.depthM,
      defaultHeightM: twin.dimensions.heightM,
      color: twin.materials[0]?.colorHex || '#8B5A2B',
      material: twin.materials[0]?.name || 'Estándar',
      description: `[Gemelo Digital V16] ${product.brand ? `${product.brand} - ` : ''}${product.description || ''}`,
      model3dUrl: twin.asset3d?.modelUrl || null,
      imageUrl: primaryImg || null,
      isCustom: true,
      dimensionSource:
        twin.verificationStatus === ProductVerificationStatus.USER_CONFIRMED
          ? DimensionSource.USER_CONFIRMED
          : twin.provenance === ProductProvenance.OFFICIAL_PRODUCT_DATA
          ? DimensionSource.CATALOG
          : DimensionSource.ESTIMATED,
      createdAt: twin.createdAt,
      updatedAt: twin.updatedAt,
    };
  }

  /**
   * Genera un asset paramétrico volumétrico cuando no existe modelo 3D GLB oficial
   */
  static generateParametricAsset(
    product: ProductDto,
    dimensions: ProductDimensionsDto
  ): Product3DAssetDto {
    const shape = this.inferShapeFromCategory(product.category);

    return {
      id: `asset-param-${product.id}`,
      productId: product.id,
      type: Product3DAssetType.PARAMETRIC,
      format: 'parametric_box',
      geometryConfig: {
        primitiveShape: shape,
        widthM: dimensions.widthM,
        depthM: dimensions.depthM,
        heightM: dimensions.heightM,
        mainColorHex: product.materials[0]?.colorHex || '#A07044',
      },
      provenance: ProductProvenance.PARAMETRIC,
      confidence: 0.85,
      isEstimatedAi: false,
      notes: 'Representación volumétrica paramétrica calculada a partir de las medidas de catálogo.',
    };
  }

  private static inferShapeFromCategory(category: string): 'box' | 'table' | 'chair' | 'sofa' | 'wardrobe' | 'bed' | 'shelf' {
    const cat = (category || '').toLowerCase();
    if (cat.includes('sofá') || cat.includes('sofa') || cat.includes('sillón')) return 'sofa';
    if (cat.includes('mesa') || cat.includes('escritorio') || cat.includes('table')) return 'table';
    if (cat.includes('silla') || cat.includes('chair') || cat.includes('taburete')) return 'chair';
    if (cat.includes('armario') || cat.includes('wardrobe') || cat.includes('closet')) return 'wardrobe';
    if (cat.includes('cama') || cat.includes('bed') || cat.includes('colchón')) return 'bed';
    if (cat.includes('estantería') || cat.includes('shelf') || cat.includes('librería')) return 'shelf';
    return 'box';
  }
}
