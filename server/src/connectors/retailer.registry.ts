/**
 * HBD — Retailer Registry & Connector Hub
 * V20.0.0 — Connected Retail Catalog
 */

import { IRetailConnector } from './base.connector.js';
import { MockRetailConnector } from './mock.connector.js';
import { IkeaConnector } from './ikea.connector.js';
import { LeroyMerlinConnector } from './leroy.connector.js';
import { KaveHomeConnector } from './kaveHome.connector.js';
import { ConforamaConnector } from './conforama.connector.js';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import type {
  RetailerMetadata,
  RetailerCode,
  RetailCatalogSearchParams,
  RetailProductDto,
  ConnectorConfigDto,
} from '@hbd/shared';

export class RetailerRegistry {
  private static instance: RetailerRegistry;
  private connectors: Map<RetailerCode, IRetailConnector> = new Map();
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();

  private constructor() {
    this.registerConnector(new MockRetailConnector());
    this.registerConnector(new IkeaConnector());
    this.registerConnector(new LeroyMerlinConnector());
    this.registerConnector(new KaveHomeConnector());
    this.registerConnector(new ConforamaConnector());
  }

  public static getInstance(): RetailerRegistry {
    if (!RetailerRegistry.instance) {
      RetailerRegistry.instance = new RetailerRegistry();
    }
    return RetailerRegistry.instance;
  }

  public registerConnector(connector: IRetailConnector): void {
    this.connectors.set(connector.code, connector);
  }

  public getConnector(code: RetailerCode): IRetailConnector | undefined {
    return this.connectors.get(code);
  }

  public getAllConnectors(): IRetailConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Returns metadata for all registered retailers (synced with DB configuration if present)
   */
  private configCache: Map<string, ConnectorConfigDto> = new Map();
  private isDbOffline = false;

  public async getRetailersMetadata(): Promise<RetailerMetadata[]> {
    const list: RetailerMetadata[] = [];

    for (const connector of this.connectors.values()) {
      try {
        const baseMeta = await connector.getMetadata();

        // Check if there is a custom status or config in DB or cache
        const key = `retailer_${connector.code.toLowerCase()}_config`;
        let parsed: any = this.configCache.get(key) || null;

        if (!parsed && !this.isDbOffline) {
          try {
            const dbSetting = await prisma.appSetting.findUnique({
              where: { key },
            });
            if (dbSetting?.value) {
              parsed = JSON.parse(dbSetting.value);
              this.configCache.set(key, parsed);
            }
          } catch (err: any) {
            if (
              err?.name === 'PrismaClientInitializationError' ||
              err?.message?.includes("Can't reach database server")
            ) {
              this.isDbOffline = true;
            }
          }
        }

        if (parsed) {
          list.push({
            ...baseMeta,
            isEnabled: parsed.isEnabled !== undefined ? parsed.isEnabled : baseMeta.isEnabled,
            affiliateId: parsed.affiliateId || baseMeta.affiliateId,
          });
          continue;
        }

        list.push(baseMeta);
      } catch (err: any) {
        logger.warn('SYSTEM', `Fallo al obtener metadata para conector ${connector.code}: ${err.message}`);
      }
    }

    return list;
  }

  /**
   * Update connector configuration (Admin only)
   */
  public async updateConnectorConfig(
    config: ConnectorConfigDto,
    userId?: string
  ): Promise<boolean> {
    const key = `retailer_${config.retailerCode.toLowerCase()}_config`;
    this.configCache.set(key, config);

    try {
      await prisma.appSetting.upsert({
        where: { key },
        create: {
          key,
          value: JSON.stringify(config),
          description: `Configuración del conector retail: ${config.retailerCode}`,
          isPublic: false,
        },
        update: {
          value: JSON.stringify(config),
        },
      });
    } catch {
      // DB offline, stored in cache
    }

    await logger.audit(
      'SYSTEM',
      `Configuración de conector de catálogo ${config.retailerCode} actualizada`,
      userId
    );
    return true;
  }

  /**
   * Multi-retailer search with error isolation and caching
   */
  public async searchAllRetailers(
    params: RetailCatalogSearchParams
  ): Promise<{ products: RetailProductDto[]; errors: Record<string, string>; totalQueried: number }> {
    const rawTargetCodes =
      params.retailerCodes && params.retailerCodes.length > 0
        ? params.retailerCodes
        : Array.from(this.connectors.keys());

    const allProducts: RetailProductDto[] = [];
    const errors: Record<string, string> = {};
    let totalQueried = 0;

    // Execute in parallel with error isolation
    await Promise.all(
      rawTargetCodes.map(async (code) => {
        // Normalize code matching
        const normalizedCode = Array.from(this.connectors.keys()).find(
          (k) => k.toLowerCase() === code.toLowerCase()
        );
        const connector = normalizedCode ? this.getConnector(normalizedCode) : undefined;
        if (!connector) return;

        try {
          const meta = await connector.getMetadata();
          if (meta.isEnabled === false || meta.status === 'DISABLED') {
            return;
          }

          totalQueried++;
          const results = await connector.searchProducts(params);
          allProducts.push(...results);
        } catch (err: any) {
          totalQueried++;
          logger.warn('SYSTEM', `Error en búsqueda retail para ${code}: ${err.message}`);
          errors[code] = err.message || 'Error temporal de conexión con el proveedor';
        }
      })
    );

    return { products: allProducts, errors, totalQueried };
  }

  /**
   * Get single product from appropriate connector
   */
  public async getProductById(productId: string): Promise<RetailProductDto | null> {
    for (const connector of this.connectors.values()) {
      try {
        const p = await connector.getProduct(productId);
        if (p) return p;
      } catch {
        // continue search
      }
    }
    return null;
  }
}
