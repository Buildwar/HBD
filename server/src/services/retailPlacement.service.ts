/**
 * HBD — Retail Product Placement & Twin Integration Service
 * V20.0.0 — Connected Retail Catalog
 */

import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { RetailerRegistry } from '../connectors/retailer.registry.js';
import { CatalogSyncEngine } from './catalogSync.engine.js';
import type {
  AddRetailProductToProjectInput,
  AddRetailProductToProjectResult,
  SpaceFitValidationResult,
  GeometryFitResult,
  RetailProductDto,
} from '@hbd/shared';

export class RetailPlacementService {
  /**
   * Validates if a retail product fits within the requested spatial bounds
   */
  static validateSpaceFit(
    product: RetailProductDto,
    availableWidthM: number,
    availableDepthM: number,
    availableHeightM?: number
  ): SpaceFitValidationResult {
    const pWidth = product.dimensions.widthM;
    const pDepth = product.dimensions.depthM;
    const pHeight = product.dimensions.heightM;

    const widthDiff = availableWidthM - pWidth;
    const depthDiff = availableDepthM - pDepth;

    const warnings: string[] = [];
    let fitResult: GeometryFitResult = 'VALID';
    let message = 'El producto encaja perfectamente en el espacio asignado.';

    // Check if it physically exceeds available space
    if (widthDiff < 0 || depthDiff < 0 || (availableHeightM && availableHeightM < pHeight)) {
      fitResult = 'INVALID';
      message = 'El producto excede las dimensiones máximas disponibles del espacio o pared.';
      if (widthDiff < 0) warnings.push(`El ancho (${pWidth}m) supera el espacio disponible (${availableWidthM}m) por ${Math.abs(widthDiff).toFixed(2)}m.`);
      if (depthDiff < 0) warnings.push(`El fondo (${pDepth}m) supera el espacio disponible (${availableDepthM}m) por ${Math.abs(depthDiff).toFixed(2)}m.`);
    } else if (widthDiff < 0.15 || depthDiff < 0.15) {
      fitResult = 'WARNING';
      message = 'El producto cabe, pero deja un margen de paso o separación ajustado (< 15 cm).';
      warnings.push('Margen de circulación reducido.');
    }

    const clearanceScore = Math.max(0, Math.min(100, Math.round((Math.min(widthDiff, depthDiff) / 1.0) * 100)));

    return {
      fitResult,
      message,
      clearanceScore,
      warnings,
      dimensionComparison: {
        productWidthM: pWidth,
        productDepthM: pDepth,
        productHeightM: pHeight,
        availableWidthM,
        availableDepthM,
        availableHeightM,
        widthDifferenceM: parseFloat(widthDiff.toFixed(3)),
        depthDifferenceM: parseFloat(depthDiff.toFixed(3)),
      },
    };
  }

  /**
   * Adds retail product to project, creates Digital Furniture Twin, places in 2D, and links V17/V18
   */
  static async addProductToProject(
    input: AddRetailProductToProjectInput,
    userId?: string
  ): Promise<AddRetailProductToProjectResult> {
    const registry = RetailerRegistry.getInstance();
    const product = await registry.getProductById(input.productId);

    if (!product) {
      throw new Error(`Producto retail con ID '${input.productId}' no encontrado en ningún catálogo.`);
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
    });
    if (!project) {
      throw new Error(`Proyecto '${input.projectId}' no encontrado.`);
    }

    // Ensure product is in local DB
    await CatalogSyncEngine.upsertNormalizedProduct(product);

    const dbProduct = await prisma.product.findFirst({
      where: { sku: product.sku || product.externalId },
    });
    if (!dbProduct) {
      throw new Error('Error al sincronizar el producto con la base de datos local.');
    }

    // 1. Spatial validation
    const fitValidation = this.validateSpaceFit(
      product,
      3.0, // default room reference bounds if unspecified
      3.0,
      2.6
    );

    // 2. Create Digital Furniture Twin
    const twin = await prisma.furnitureTwin.create({
      data: {
        productId: dbProduct.id,
        name: `${product.name} (${product.brand || product.retailerName})`,
        dimensions: {
          width: product.dimensions.widthM,
          depth: product.dimensions.depthM,
          height: product.dimensions.heightM,
        } as any,
        geometry: {
          type: 'BOX',
          width: product.dimensions.widthM,
          depth: product.dimensions.depthM,
          height: product.dimensions.heightM,
        } as any,
        materials: {
          primary: product.materials[0] || 'wood',
          color: product.colors[0] || '#FFFFFF',
        } as any,
        lockRealDimensions: true,
        confidence: product.price.confidence || 0.95,
      },
    });

    // 3. Create ProjectProduct instance
    const quantity = input.quantity || 1;
    const unitPrice = product.price.amount;
    const totalPrice = unitPrice * quantity;

    const projectProduct = await prisma.projectProduct.create({
      data: {
        projectId: input.projectId,
        productId: dbProduct.id,
        furnitureTwinId: twin.id,
        floorId: input.floorId,
        roomId: input.roomId,
        roomName: input.roomName,
        quantity,
        unitPrice,
        totalPrice,
        currency: product.price.currency,
        placed2d: Boolean(input.placeOnPlan),
        posX: input.posX ?? 1.5,
        posY: input.posY ?? 1.5,
        posZ: input.posZ ?? 0.0,
        rotationDeg: input.rotationDeg ?? 0.0,
      },
    });

    // 4. Create 2D Furniture Placement if requested
    let placementId: string | undefined;
    if (input.placeOnPlan && input.floorId) {
      // Find or create a matching furniture catalog entry
      let furniture = await prisma.furniture.findFirst({
        where: { name: product.name },
      });

      if (!furniture) {
        let category = await prisma.furnitureCategory.findFirst();
        if (!category) {
          category = await prisma.furnitureCategory.create({
            data: { name: 'Mobiliario', slug: 'mobiliario', icon: 'Armchair' },
          });
        }

        furniture = await prisma.furniture.create({
          data: {
            name: product.name,
            categoryId: category.id,
            defaultWidthM: product.dimensions.widthM,
            defaultDepthM: product.dimensions.depthM,
            defaultHeightM: product.dimensions.heightM,
          },
        });
      }

      const placement = await prisma.furniturePlacement.create({
        data: {
          floorId: input.floorId,
          furnitureId: furniture.id,
          posX: input.posX ?? 1.5,
          posY: input.posY ?? 1.5,
          rotationDeg: input.rotationDeg ?? 0,
          widthM: product.dimensions.widthM,
          depthM: product.dimensions.depthM,
          heightM: product.dimensions.heightM,
        },
      });
      placementId = placement.id;
    }

    // 5. Integrate with V17 Financial items if requested
    let financialItemCreated = false;
    if (input.addToFinancial !== false) {
      try {
        await prisma.costItem.create({
          data: {
            projectId: input.projectId,
            category: 'FURNITURE',
            subcategory: product.category || 'Mobiliario',
            name: `${product.brand ? product.brand + ' ' : ''}${product.name}`,
            description: `Importado desde catálogo ${product.retailerName} (SKU: ${product.sku || product.externalId})`,
            estimatedUnitCost: unitPrice,
            estimatedTotalCost: totalPrice,
            source: 'PRODUCT_V16',
            supplierName: product.retailerName,
          },
        });
        financialItemCreated = true;
      } catch (err: any) {
        logger.warn('SYSTEM', `No se pudo crear partida en CostItem V17: ${err.message}`);
      }
    }

    // 6. Integrate with V18 Procurement items if requested
    let procurementItemCreated = false;
    if (input.addToProcurement) {
      try {
        await prisma.procurementItem.create({
          data: {
            projectId: input.projectId,
            description: `${product.brand ? product.brand + ' ' : ''}${product.name}`,
            category: 'FURNITURE',
            quantity: quantity,
            unit: 'ud',
            estimatedUnitCost: unitPrice,
            estimatedTotalCost: totalPrice,
            currency: product.price.currency,
            status: 'NEEDED',
            source: 'V16_PRODUCT',
            supplierName: product.retailerName,
          },
        });
        procurementItemCreated = true;
      } catch (err: any) {
        logger.warn('SYSTEM', `No se pudo crear partida en ProcurementItem V18: ${err.message}`);
      }
    }

    await logger.audit(
      'PROJECT',
      `Producto '${product.name}' añadido al proyecto ${project.name} (Twin: ${twin.id})`,
      userId
    );

    return {
      success: true,
      projectProductId: projectProduct.id,
      productId: dbProduct.id,
      furnitureTwinId: twin.id,
      furniturePlacementId: placementId,
      fitValidation,
      financialItemCreated,
      procurementItemCreated,
      message: `Producto '${product.name}' añadido exitosamente al proyecto.`,
    };
  }
}
