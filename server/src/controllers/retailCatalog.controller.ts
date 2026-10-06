/**
 * HBD — Retail Catalog Controller
 * V20.0.0 — Connected Retail Catalog & Product Placement
 */

import { Request, Response } from 'express';
import { RetailSearchEngine } from '../services/retailSearch.engine.js';
import { RetailerRegistry } from '../connectors/retailer.registry.js';
import { CatalogSyncEngine } from '../services/catalogSync.engine.js';
import { RetailPlacementService } from '../services/retailPlacement.service.js';
import { ProductMatchingEngine } from '../services/productMatching.engine.js';
import { prisma } from '../config/prisma.js';
import type { RetailCatalogSearchParams, RetailerCode } from '@hbd/shared';

export const searchCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const params: RetailCatalogSearchParams = {
      query: req.query.q as string,
      retailerCodes: req.query.retailers ? (req.query.retailers as string).split(',') as RetailerCode[] : undefined,
      categories: req.query.categories ? (req.query.categories as string).split(',') : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      inStockOnly: req.query.inStock === 'true',
      roomType: req.query.roomType as string,
      color: req.query.color as string,
      material: req.query.material as string,
      maxWidth: req.query.maxWidth ? parseFloat(req.query.maxWidth as string) : undefined,
      maxDepth: req.query.maxDepth ? parseFloat(req.query.maxDepth as string) : undefined,
      maxHeight: req.query.maxHeight ? parseFloat(req.query.maxHeight as string) : undefined,
      sortBy: req.query.sortBy as any,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    };

    const results = await RetailSearchEngine.search(params);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const registry = RetailerRegistry.getInstance();
    const product = await registry.getProductById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Producto no encontrado en los catálogos conectados.' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRetailers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const registry = RetailerRegistry.getInstance();
    const metadata = await registry.getRetailersMetadata();
    res.json({ success: true, data: metadata });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const testRetailerConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const registry = RetailerRegistry.getInstance();
    const connector = registry.getConnector(code.toUpperCase() as RetailerCode);

    if (!connector) {
      res.status(404).json({ success: false, message: `Conector '${code}' no encontrado.` });
      return;
    }

    const testResult = await connector.testConnection();
    res.json({ success: true, data: testResult });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRetailerConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const registry = RetailerRegistry.getInstance();
    const success = await registry.updateConnectorConfig(
      {
        retailerCode: code.toUpperCase() as RetailerCode,
        ...req.body,
      },
      req.user?.id
    );

    res.json({ success, message: `Configuración de ${code} guardada con éxito.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { retailerCode } = req.body;
    const result = await CatalogSyncEngine.syncRetailerCatalog(retailerCode, req.user?.id);
    res.json({
      success: true,
      data: result,
      message: `Sincronización completada (${result.syncedCount} productos).`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const compareProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ success: false, message: 'Se requiere una lista de productIds para comparar.' });
      return;
    }

    const registry = RetailerRegistry.getInstance();
    const products = (
      await Promise.all(productIds.map((id: string) => registry.getProductById(id)))
    ).filter(Boolean);

    const comparison = ProductMatchingEngine.compareProducts(products as any);
    res.json({ success: true, data: comparison });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProductToProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const result = await RetailPlacementService.addProductToProject(
      {
        projectId,
        ...req.body,
      },
      req.user?.id
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'No autenticado.' });
      return;
    }

    const existing = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: id,
        },
      },
    });

    if (existing) {
      await prisma.productFavorite.delete({ where: { id: existing.id } });
      res.json({ success: true, isFavorite: false, message: 'Eliminado de favoritos.' });
    } else {
      // Ensure product exists in DB before linking
      const registry = RetailerRegistry.getInstance();
      const p = await registry.getProductById(id);
      if (p) {
        await CatalogSyncEngine.upsertNormalizedProduct(p);
      }
      const dbProduct = await prisma.product.findFirst({
        where: { OR: [{ id }, { sku: p?.sku || p?.externalId }] },
      });

      if (dbProduct) {
        await prisma.productFavorite.create({
          data: {
            userId,
            productId: dbProduct.id,
          },
        });
        res.json({ success: true, isFavorite: true, message: 'Añadido a favoritos.' });
      } else {
        res.status(404).json({ success: false, message: 'Producto no encontrado.' });
      }
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
