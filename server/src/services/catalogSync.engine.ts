/**
 * HBD — Catalog Synchronization Engine
 * V20.0.0 — Connected Retail Catalog
 */

import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { RetailerRegistry } from '../connectors/retailer.registry.js';
import { ProductDataQualityService } from './productDataQuality.service.js';
import type { RetailerCode, RetailProductDto } from '@hbd/shared';

export class CatalogSyncEngine {
  /**
   * Performs catalog synchronization for a retailer (or all if omitted)
   */
  static async syncRetailerCatalog(
    retailerCode?: RetailerCode,
    userId?: string
  ): Promise<{ syncedCount: number; updatedCount: number; errorsCount: number; durationMs: number }> {
    const startTime = Date.now();
    let syncedCount = 0;
    let updatedCount = 0;
    let errorsCount = 0;

    const registry = RetailerRegistry.getInstance();
    const connectors = retailerCode
      ? [registry.getConnector(retailerCode)].filter(Boolean)
      : registry.getAllConnectors();

    for (const connector of connectors) {
      if (!connector) continue;

      try {
        const metadata = await connector.getMetadata();
        const products = await connector.searchProducts({ limit: 100 });

        for (const p of products) {
          try {
            await this.upsertNormalizedProduct(p);
            syncedCount++;
          } catch (err: any) {
            errorsCount++;
            logger.warn('SYSTEM', `Fallo al sincronizar producto ${p.externalId}: ${err.message}`);
          }
        }

        // Update Retailer entry in DB
        await prisma.retailer.upsert({
          where: { code: connector.code },
          create: {
            code: connector.code,
            name: metadata.name,
            websiteUrl: metadata.websiteUrl,
            status: metadata.status,
            capabilities: metadata.capabilities as any,
            integrationType: metadata.integrationType,
            lastSyncedAt: new Date(),
            syncStatus: 'SUCCESS',
            productsCount: products.length,
          },
          update: {
            lastSyncedAt: new Date(),
            syncStatus: 'SUCCESS',
            productsCount: products.length,
          },
        });
      } catch (err: any) {
        errorsCount++;
        logger.error('SYSTEM', `Error sincronizando conector ${connector?.code}: ${err.message}`);
      }
    }

    const durationMs = Date.now() - startTime;
    await logger.audit(
      'SYSTEM',
      `Sincronización de catálogo retail completada: ${syncedCount} sincronizados, ${errorsCount} fallos (${durationMs}ms)`,
      userId
    );

    return { syncedCount, updatedCount, errorsCount, durationMs };
  }

  /**
   * Non-destructive upsert of retail product into PostgreSQL
   */
  static async upsertNormalizedProduct(p: RetailProductDto): Promise<void> {
    const qualityScore = ProductDataQualityService.calculateQualityScore(p);

    // 1. Ensure Retailer record exists
    const retailer = await prisma.retailer.upsert({
      where: { code: p.retailerCode },
      create: {
        code: p.retailerCode,
        name: p.retailerName,
        websiteUrl: p.productUrl,
        status: p.isMockData ? 'MOCK' : 'AVAILABLE',
      },
      update: {},
    });

    // 2. Upsert Product
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: p.sku || p.externalId,
      },
    });

    let productId = existingProduct?.id;

    if (!existingProduct) {
      const created = await prisma.product.create({
        data: {
          name: p.name,
          brand: p.brand || p.retailerName,
          sku: p.sku || p.externalId,
          productCode: p.reference,
          category: p.category,
          description: p.description,
          sourceUrl: p.productUrl,
          sourceDomain: p.retailerCode.toLowerCase(),
          currency: p.price.currency,
          price: p.price.amount,
          availability: p.availability.status,
          provenance: p.provenance as any,
          confidence: p.price.confidence || 0.95,
          retailerId: retailer.id,
          isMarketplace: p.isMarketplace,
          marketplaceSeller: p.marketplaceSeller,
          dataQualityScore: qualityScore,
          rawStructuredData: p as any,
        },
      });
      productId = created.id;

      // Create dimensions
      await prisma.productDimension.create({
        data: {
          productId: created.id,
          widthM: p.dimensions.widthM,
          depthM: p.dimensions.depthM,
          heightM: p.dimensions.heightM,
          rawWidth: p.dimensions.rawWidth,
          rawDepth: p.dimensions.rawDepth,
          rawHeight: p.dimensions.rawHeight,
          rawUnit: p.dimensions.rawUnit || 'cm',
          weightKg: p.dimensions.weightKg,
          provenance: p.dimensions.provenance as any,
          confidence: p.dimensions.confidence || 0.95,
        },
      });

      // Create primary image
      if (p.primaryImageUrl) {
        await prisma.productImage.create({
          data: {
            productId: created.id,
            url: p.primaryImageUrl,
            isPrimary: true,
          },
        });
      }

      // Record price history
      await prisma.productPriceHistory.create({
        data: {
          productId: created.id,
          price: p.price.amount,
          currency: p.price.currency,
        },
      });
    } else {
      // Check if price changed -> record history
      if (existingProduct.price !== p.price.amount) {
        await prisma.productPriceHistory.create({
          data: {
            productId: existingProduct.id,
            price: p.price.amount,
            currency: p.price.currency,
          },
        });
      }

      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name: p.name,
          price: p.price.amount,
          availability: p.availability.status,
          retailerId: retailer.id,
          dataQualityScore: qualityScore,
          rawStructuredData: p as any,
        },
      });
    }
  }
}
