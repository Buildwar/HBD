/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Controller — Purchasing & Acquisition Intelligence
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  ProcurementEngine,
  PurchasePlanningEngine,
  ProcurementRiskEngine,
  ProcurementItemDto,
  SupplierQuoteDto,
  ProcurementOrderDto,
  ProcurementIncidentDto,
  ProcurementReturnDto,
  ProcurementCategory,
  ProcurementStatus,
  ProcurementPriority,
  ProcurementSource,
  SupplierQuoteStatus,
  ProcurementSyncOptions,
} from '@hbd/shared';

export class ProcurementController {
  /**
   * Helper to format Prisma procurement item as ProcurementItemDto
   */
  private static formatItem(item: any): ProcurementItemDto {
    const qty = item.quantity || 1;
    const estUnit = item.estimatedUnitCost || 0;
    const estTotal = item.estimatedTotalCost || estUnit * qty;
    const recQty = item.receivedQuantity || 0;
    const ordQty = item.orderedQuantity || 0;

    return {
      id: item.id,
      projectId: item.projectId,
      description: item.description,
      category: item.category as ProcurementCategory,
      subcategory: item.subcategory || null,
      quantity: qty,
      unit: item.unit || 'ud',
      requiredDate: item.requiredDate ? item.requiredDate.toISOString() : null,
      preferredDate: item.preferredDate ? item.preferredDate.toISOString() : null,
      roomId: item.roomId || null,
      roomName: item.roomName || null,
      spaceId: item.spaceId || null,
      phaseId: item.phaseId || null,
      phaseName: item.phaseName || null,
      taskId: item.taskId || null,
      taskName: item.taskName || null,
      productId: item.productId || null,
      productVariantId: item.productVariantId || null,
      furnitureTwinId: item.furnitureTwinId || null,
      supplierId: item.supplierId || null,
      supplierName: item.supplier?.name || item.supplierName || null,
      estimatedUnitCost: estUnit,
      estimatedTotalCost: estTotal,
      selectedUnitCost: item.selectedUnitCost ?? null,
      selectedTotalCost: item.selectedTotalCost ?? null,
      currency: item.currency || 'EUR',
      priority: item.priority as ProcurementPriority,
      status: item.status as ProcurementStatus,
      source: item.source as ProcurementSource,
      sourceReference: item.sourceReference || null,
      notes: item.notes || null,
      orderedQuantity: ordQty,
      receivedQuantity: recQty,
      damagedQuantity: item.damagedQuantity || 0,
      missingQuantity: item.missingQuantity || 0,
      pendingQuantity: Math.max(0, qty - recQty),
      leadTimeDays: item.leadTimeDays ?? 7,
      quotesCount: item._count?.quotes || (item.quotes ? item.quotes.length : 0),
      selectedQuoteId: item.selectedQuoteId || null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  /**
   * Helper to retrieve all active procurement items for a project
   */
  private static async getProjectItems(projectId: string): Promise<ProcurementItemDto[]> {
    const items = await prisma.procurementItem.findMany({
      where: { projectId },
      include: {
        supplier: true,
        _count: {
          select: { quotes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((i) => ProcurementController.formatItem(i));
  }

  /**
   * GET /api/projects/:projectId/procurement/summary
   * Resumen global de compras, presupuestos, entregas e incidencias
   */
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        return;
      }

      const items = await ProcurementController.getProjectItems(projectId);
      const incidentsCount = await prisma.procurementIncident.count({
        where: { projectId, status: 'OPEN' },
      });

      const risks = ProcurementRiskEngine.evaluateProjectRisks(items);
      const summary = ProcurementEngine.generateSummary(
        projectId,
        items,
        risks.overallRisk,
        incidentsCount
      );

      res.json({ success: true, data: summary });
    } catch (error: any) {
      logger.error('PROJECT', `Error obteniendo resumen de compras: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/procurement/items
   * Listado filtrable de necesidades y partidas de compra
   */
  static async getItems(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { category, status, priority, supplierId, roomId } = req.query;

      const where: any = { projectId };
      if (category && typeof category === 'string' && category !== 'ALL') where.category = category;
      if (status && typeof status === 'string' && status !== 'ALL') where.status = status;
      if (priority && typeof priority === 'string' && priority !== 'ALL') where.priority = priority;
      if (supplierId && typeof supplierId === 'string') where.supplierId = supplierId;
      if (roomId && typeof roomId === 'string') where.roomId = roomId;

      const items = await prisma.procurementItem.findMany({
        where,
        include: {
          supplier: true,
          _count: { select: { quotes: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: items.map((i) => ProcurementController.formatItem(i)),
      });
    } catch (error: any) {
      logger.error('PROJECT', `Error listando partidas de compra: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/procurement/items/:id
   * Ficha detallada de una partida de compra con ofertas, pedidos e incidencias
   */
  static async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;

      const item = await prisma.procurementItem.findFirst({
        where: { id, projectId },
        include: {
          supplier: true,
          quotes: { include: { supplier: true } },
          orderLines: { include: { order: true } },
          incidents: true,
          returns: true,
        },
      });

      if (!item) {
        res.status(404).json({ success: false, message: 'Partida de compra no encontrada' });
        return;
      }

      res.json({
        success: true,
        data: {
          ...ProcurementController.formatItem(item),
          quotes: item.quotes.map((q) => ({
            id: q.id,
            projectId: q.projectId,
            procurementItemId: q.procurementItemId,
            supplierId: q.supplierId,
            supplierName: q.supplier?.name || q.supplierName,
            quantity: q.quantity,
            unitPrice: q.unitPrice,
            totalPrice: q.totalPrice,
            currency: q.currency,
            validUntil: q.validUntil ? q.validUntil.toISOString() : null,
            estimatedDeliveryDays: q.estimatedDeliveryDays,
            shippingCost: q.shippingCost,
            installationCost: q.installationCost,
            totalWithServices: q.totalPrice + q.shippingCost + q.installationCost,
            notes: q.notes,
            status: q.status as SupplierQuoteStatus,
            createdAt: q.createdAt.toISOString(),
          })),
          incidents: item.incidents.map((inc) => ({
            id: inc.id,
            title: inc.title,
            description: inc.description,
            type: inc.type,
            quantityAffected: inc.quantityAffected,
            status: inc.status,
            costImpact: inc.costImpact,
            timeImpactDays: inc.timeImpactDays,
            reportedDate: inc.reportedDate.toISOString(),
            photos: inc.photos,
          })),
          returns: item.returns.map((ret) => ({
            id: ret.id,
            quantity: ret.quantity,
            reason: ret.reason,
            status: ret.status,
            refundAmount: ret.refundAmount,
            requestedDate: ret.requestedDate.toISOString(),
          })),
        },
      });
    } catch (error: any) {
      logger.error('PROJECT', `Error obteniendo detalle de compra: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/procurement/items
   * Crear necesidad o partida de compra manual
   */
  static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const data = req.body;

      if (!data.description) {
        res.status(400).json({ success: false, message: 'La descripción del producto/material es obligatoria.' });
        return;
      }

      const q = typeof data.quantity === 'number' ? data.quantity : 1;
      const estUnit = typeof data.estimatedUnitCost === 'number' ? data.estimatedUnitCost : (data.estimatedTotalCost || 0) / q;
      const estTotal = typeof data.estimatedTotalCost === 'number' ? data.estimatedTotalCost : estUnit * q;

      const created = await prisma.procurementItem.create({
        data: {
          projectId,
          description: data.description,
          category: (data.category as any) || 'OTHER',
          subcategory: data.subcategory || null,
          quantity: q,
          unit: data.unit || 'ud',
          requiredDate: data.requiredDate ? new Date(data.requiredDate) : null,
          preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
          roomId: data.roomId || null,
          roomName: data.roomName || null,
          spaceId: data.spaceId || null,
          phaseId: data.phaseId || null,
          phaseName: data.phaseName || null,
          taskId: data.taskId || null,
          taskName: data.taskName || null,
          productId: data.productId || null,
          productVariantId: data.productVariantId || null,
          furnitureTwinId: data.furnitureTwinId || null,
          supplierId: data.supplierId || null,
          supplierName: data.supplierName || null,
          estimatedUnitCost: estUnit,
          estimatedTotalCost: estTotal,
          selectedUnitCost: typeof data.selectedUnitCost === 'number' ? data.selectedUnitCost : null,
          selectedTotalCost: typeof data.selectedTotalCost === 'number' ? data.selectedTotalCost : null,
          currency: data.currency || 'EUR',
          priority: (data.priority as any) || 'NORMAL',
          status: (data.status as any) || 'NEEDED',
          source: (data.source as any) || 'MANUAL',
          sourceReference: data.sourceReference || null,
          notes: data.notes || null,
          leadTimeDays: typeof data.leadTimeDays === 'number' ? data.leadTimeDays : 7,
        },
        include: { supplier: true },
      });

      logger.info('PROJECT', `Partida de compra creada: ${created.description} (${created.category})`);
      res.status(201).json({ success: true, data: ProcurementController.formatItem(created) });
    } catch (error: any) {
      logger.error('PROJECT', `Error creando partida de compra: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/projects/:projectId/procurement/items/:id
   * Actualizar partida de compra
   */
  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;
      const data = req.body;

      const existing = await prisma.procurementItem.findFirst({ where: { id, projectId } });
      if (!existing) {
        res.status(404).json({ success: false, message: 'Partida de compra no encontrada' });
        return;
      }

      const q = typeof data.quantity === 'number' ? data.quantity : existing.quantity;
      let estTotal = data.estimatedTotalCost;
      if (estTotal === undefined && data.estimatedUnitCost !== undefined) {
        estTotal = data.estimatedUnitCost * q;
      }

      const updated = await prisma.procurementItem.update({
        where: { id },
        data: {
          description: data.description !== undefined ? data.description : undefined,
          category: data.category !== undefined ? (data.category as any) : undefined,
          subcategory: data.subcategory !== undefined ? data.subcategory : undefined,
          quantity: q,
          unit: data.unit !== undefined ? data.unit : undefined,
          requiredDate: data.requiredDate !== undefined ? (data.requiredDate ? new Date(data.requiredDate) : null) : undefined,
          preferredDate: data.preferredDate !== undefined ? (data.preferredDate ? new Date(data.preferredDate) : null) : undefined,
          roomId: data.roomId !== undefined ? data.roomId : undefined,
          roomName: data.roomName !== undefined ? data.roomName : undefined,
          spaceId: data.spaceId !== undefined ? data.spaceId : undefined,
          phaseId: data.phaseId !== undefined ? data.phaseId : undefined,
          phaseName: data.phaseName !== undefined ? data.phaseName : undefined,
          taskId: data.taskId !== undefined ? data.taskId : undefined,
          taskName: data.taskName !== undefined ? data.taskName : undefined,
          productId: data.productId !== undefined ? data.productId : undefined,
          productVariantId: data.productVariantId !== undefined ? data.productVariantId : undefined,
          furnitureTwinId: data.furnitureTwinId !== undefined ? data.furnitureTwinId : undefined,
          supplierId: data.supplierId !== undefined ? data.supplierId : undefined,
          supplierName: data.supplierName !== undefined ? data.supplierName : undefined,
          estimatedUnitCost: data.estimatedUnitCost !== undefined ? data.estimatedUnitCost : undefined,
          estimatedTotalCost: estTotal !== undefined ? estTotal : undefined,
          selectedUnitCost: data.selectedUnitCost !== undefined ? data.selectedUnitCost : undefined,
          selectedTotalCost: data.selectedTotalCost !== undefined ? data.selectedTotalCost : undefined,
          priority: data.priority !== undefined ? (data.priority as any) : undefined,
          status: data.status !== undefined ? (data.status as any) : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
          orderedQuantity: data.orderedQuantity !== undefined ? data.orderedQuantity : undefined,
          receivedQuantity: data.receivedQuantity !== undefined ? data.receivedQuantity : undefined,
          damagedQuantity: data.damagedQuantity !== undefined ? data.damagedQuantity : undefined,
          missingQuantity: data.missingQuantity !== undefined ? data.missingQuantity : undefined,
          leadTimeDays: data.leadTimeDays !== undefined ? data.leadTimeDays : undefined,
        },
        include: { supplier: true },
      });

      res.json({ success: true, data: ProcurementController.formatItem(updated) });
    } catch (error: any) {
      logger.error('PROJECT', `Error actualizando compra: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/projects/:projectId/procurement/items/:id
   * Eliminar partida de compra
   */
  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;

      const existing = await prisma.procurementItem.findFirst({ where: { id, projectId } });
      if (!existing) {
        res.status(404).json({ success: false, message: 'Partida no encontrada' });
        return;
      }

      await prisma.procurementItem.delete({ where: { id } });
      res.json({ success: true, message: 'Partida de compra eliminada.' });
    } catch (error: any) {
      logger.error('PROJECT', `Error eliminando compra: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/procurement/sync
   * Sincronizar necesidades de compra desde V11, V15 y V16 (respetando DESIGN_ONLY)
   */
  static async syncProcurement(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const options: ProcurementSyncOptions = req.body || {
        includeV11Materials: true,
        includeV15Tasks: true,
        includeV16Products: true,
        excludeDesignOnly: true,
      };

      const existingItems = await prisma.procurementItem.findMany({ where: { projectId } });
      const existingRefMap = new Map<string, typeof existingItems[0]>();
      for (const item of existingItems) {
        if (item.sourceReference) existingRefMap.set(item.sourceReference, item);
      }

      let createdCount = 0;
      let updatedCount = 0;

      // 1. Sync V11 Construction Items & Material Needs
      if (options.includeV11Materials !== false) {
        const construction = await prisma.constructionProject.findUnique({
          where: { projectId },
          include: {
            items: { include: { supplier: true, space: true } },
          },
        });

        if (construction?.items) {
          for (const item of construction.items) {
            const ref = `v11_mat:${item.id}`;
            const category = mapConstructionCategoryToProcurement(item.category);
            const totalQty = item.quantity * (1 + (item.wastePercent || 0) / 100);
            const estTotal = item.materialCost > 0 ? item.materialCost : item.totalCost;

            if (existingRefMap.has(ref)) {
              const existing = existingRefMap.get(ref)!;
              await prisma.procurementItem.update({
                where: { id: existing.id },
                data: {
                  description: item.name,
                  quantity: totalQty,
                  unit: item.unit,
                  estimatedTotalCost: estTotal,
                  supplierId: item.supplierId || null,
                  spaceId: item.spaceId || null,
                  roomName: item.space?.name || null,
                },
              });
              updatedCount++;
            } else {
              await prisma.procurementItem.create({
                data: {
                  projectId,
                  description: item.name,
                  category,
                  quantity: totalQty,
                  unit: item.unit,
                  estimatedUnitCost: totalQty > 0 ? estTotal / totalQty : estTotal,
                  estimatedTotalCost: estTotal,
                  supplierId: item.supplierId || null,
                  supplierName: item.supplier?.name || null,
                  spaceId: item.spaceId || null,
                  roomName: item.space?.name || null,
                  status: 'NEEDED',
                  priority: 'NORMAL',
                  source: 'V11_CONSTRUCTION',
                  sourceReference: ref,
                },
              });
              createdCount++;
            }
          }
        }
      }

      // 2. Sync V16 Products (excluding DESIGN_ONLY unless explicitly configured)
      if (options.includeV16Products !== false) {
        const projectProducts = await prisma.projectProduct.findMany({
          where: { projectId },
          include: { product: true, furnitureTwin: true },
        });

        for (const pp of projectProducts) {
          // If product is DESIGN_ONLY and excludeDesignOnly is true, skip automatic inclusion
          if (options.excludeDesignOnly !== false && pp.notes?.includes('DESIGN_ONLY')) {
            continue;
          }

          const ref = `v16_product:${pp.id}`;
          const category = mapProductCategoryToProcurement(pp.product.category);
          const totalCost = pp.totalPrice || pp.unitPrice * pp.quantity;

          if (existingRefMap.has(ref)) {
            const existing = existingRefMap.get(ref)!;
            await prisma.procurementItem.update({
              where: { id: existing.id },
              data: {
                description: `${pp.product.name} (${pp.product.brand || 'Catálogo'})`,
                quantity: pp.quantity,
                estimatedUnitCost: pp.unitPrice,
                estimatedTotalCost: totalCost,
                roomName: pp.roomName || null,
              },
            });
            updatedCount++;
          } else {
            await prisma.procurementItem.create({
              data: {
                projectId,
                description: `${pp.product.name} (${pp.product.brand || 'Catálogo'})`,
                category,
                quantity: pp.quantity,
                unit: 'ud',
                estimatedUnitCost: pp.unitPrice,
                estimatedTotalCost: totalCost,
                productId: pp.productId,
                productVariantId: pp.variantId || null,
                furnitureTwinId: pp.furnitureTwinId || null,
                roomName: pp.roomName || null,
                status: pp.status === 'INSTALLED' ? 'INSTALLED' : pp.status === 'DELIVERED' ? 'RECEIVED' : pp.status === 'ORDERED' ? 'ORDERED' : 'NEEDED',
                priority: 'NORMAL',
                source: 'V16_PRODUCT',
                sourceReference: ref,
                leadTimeDays: 14,
              },
            });
            createdCount++;
          }
        }
      }

      logger.info(
        'PROJECT',
        `Sincronización de compras completada: ${createdCount} creadas, ${updatedCount} actualizadas.`
      );

      res.json({
        success: true,
        message: `Sincronización completada: ${createdCount} necesidades detectadas, ${updatedCount} actualizadas.`,
        createdCount,
        updatedCount,
      });
    } catch (error: any) {
      logger.error('PROJECT', `Error sincronizando compras: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/procurement/quotes
   * Crear oferta / presupuesto de proveedor
   */
  static async createQuote(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const data = req.body;

      if (!data.procurementItemId || !data.supplierId) {
        res.status(400).json({ success: false, message: 'La partida de compra y el proveedor son obligatorios.' });
        return;
      }

      const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
      const unitP = Number(data.unitPrice) || 0;
      const q = Number(data.quantity) || 1;
      const totalP = Number(data.totalPrice) || unitP * q;

      const quote = await prisma.supplierQuote.create({
        data: {
          projectId,
          procurementItemId: data.procurementItemId,
          supplierId: data.supplierId,
          supplierName: supplier?.name || data.supplierName || 'Proveedor',
          quantity: q,
          unitPrice: unitP,
          totalPrice: totalP,
          currency: data.currency || 'EUR',
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          estimatedDeliveryDays: Number(data.estimatedDeliveryDays) || 7,
          shippingCost: Number(data.shippingCost) || 0,
          installationCost: Number(data.installationCost) || 0,
          notes: data.notes || null,
          status: 'RECEIVED',
        },
        include: { supplier: true },
      });

      res.status(201).json({ success: true, data: quote });
    } catch (error: any) {
      logger.error('PROJECT', `Error creando oferta de proveedor: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/projects/:projectId/procurement/quotes/:id/select
   * Seleccionar oferta ganadora y actualizar partida y coste en V17
   */
  static async selectQuote(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;

      const quote = await prisma.supplierQuote.findFirst({
        where: { id, projectId },
      });

      if (!quote) {
        res.status(404).json({ success: false, message: 'Oferta no encontrada' });
        return;
      }

      // Marcar otras ofertas como REJECTED y esta como SELECTED
      await prisma.supplierQuote.updateMany({
        where: { procurementItemId: quote.procurementItemId },
        data: { status: 'REJECTED' },
      });

      await prisma.supplierQuote.update({
        where: { id },
        data: { status: 'SELECTED' },
      });

      // Actualizar la partida de compra
      const updatedItem = await prisma.procurementItem.update({
        where: { id: quote.procurementItemId },
        data: {
          supplierId: quote.supplierId,
          supplierName: quote.supplierName,
          selectedUnitCost: quote.unitPrice,
          selectedTotalCost: quote.totalPrice + quote.shippingCost + quote.installationCost,
          selectedQuoteId: quote.id,
          leadTimeDays: quote.estimatedDeliveryDays,
          status: 'QUOTED',
        },
      });

      res.json({ success: true, message: 'Oferta seleccionada con éxito', data: updatedItem });
    } catch (error: any) {
      logger.error('PROJECT', `Error seleccionando oferta: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/procurement/orders
   * Listado de pedidos a proveedor
   */
  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const orders = await prisma.procurementOrder.findMany({
        where: { projectId },
        include: {
          supplier: true,
          lines: true,
          deliveries: true,
        },
        orderBy: { orderDate: 'desc' },
      });

      res.json({
        success: true,
        data: orders.map((o) => ({
          id: o.id,
          projectId: o.projectId,
          supplierId: o.supplierId,
          supplierName: o.supplier?.name || 'Proveedor',
          orderNumber: o.orderNumber,
          orderDate: o.orderDate.toISOString(),
          expectedDeliveryDate: o.expectedDeliveryDate ? o.expectedDeliveryDate.toISOString() : null,
          actualDeliveryDate: o.actualDeliveryDate ? o.actualDeliveryDate.toISOString() : null,
          status: o.status,
          currency: o.currency,
          subtotal: o.subtotal,
          shipping: o.shipping,
          taxes: o.taxes,
          total: o.total,
          paidAmount: o.paidAmount,
          pendingAmount: Math.max(0, o.total - o.paidAmount),
          notes: o.notes,
          lines: o.lines.map((l) => ({
            id: l.id,
            orderId: l.orderId,
            procurementItemId: l.procurementItemId,
            description: l.description,
            quantity: l.quantity,
            unit: l.unit,
            unitPrice: l.unitPrice,
            totalPrice: l.totalPrice,
            receivedQuantity: l.receivedQuantity,
            damagedQuantity: l.damagedQuantity,
            notes: l.notes,
          })),
        })),
      });
    } catch (error: any) {
      logger.error('PROJECT', `Error obteniendo pedidos: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/procurement/orders
   * Crear pedido a proveedor y actualizar partidas vinculadas
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const data = req.body;

      if (!data.supplierId || !data.lines || data.lines.length === 0) {
        res.status(400).json({ success: false, message: 'Proveedor y líneas de pedido son obligatorios.' });
        return;
      }

      const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
      const orderNumber = data.orderNumber || `PED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      let subtotal = 0;
      for (const line of data.lines) {
        subtotal += line.totalPrice || line.unitPrice * line.quantity;
      }
      const shipping = Number(data.shipping) || 0;
      const taxes = Number(data.taxes) || 0;
      const total = subtotal + shipping + taxes;

      const order = await prisma.procurementOrder.create({
        data: {
          projectId,
          supplierId: data.supplierId,
          orderNumber,
          orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
          expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
          status: 'ORDERED',
          currency: data.currency || 'EUR',
          subtotal,
          shipping,
          taxes,
          total,
          notes: data.notes || null,
          lines: {
            create: data.lines.map((l: any) => ({
              procurementItemId: l.procurementItemId || null,
              description: l.description,
              quantity: Number(l.quantity) || 1,
              unit: l.unit || 'ud',
              unitPrice: Number(l.unitPrice) || 0,
              totalPrice: Number(l.totalPrice) || (Number(l.unitPrice) || 0) * (Number(l.quantity) || 1),
              notes: l.notes || null,
            })),
          },
        },
        include: { lines: true, supplier: true },
      });

      // Actualizar estado de las partidas vinculadas
      for (const line of data.lines) {
        if (line.procurementItemId) {
          await prisma.procurementItem.update({
            where: { id: line.procurementItemId },
            data: {
              status: 'ORDERED',
              orderedQuantity: { increment: Number(line.quantity) || 1 },
              supplierId: data.supplierId,
              selectedTotalCost: Number(line.totalPrice) || undefined,
            },
          });
        }
      }

      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      logger.error('PROJECT', `Error creando pedido: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/procurement/orders/:id/receive
   * Registrar recepción de entrega (con soporte para recepciones parciales y daños)
   */
  static async receiveOrder(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;
      const data = req.body;

      const order = await prisma.procurementOrder.findFirst({
        where: { id, projectId },
        include: { lines: true },
      });

      if (!order) {
        res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        return;
      }

      // 1. Crear registro de entrega
      await prisma.procurementDelivery.create({
        data: {
          projectId,
          orderId: id,
          carrier: data.carrier || null,
          trackingNumber: data.trackingNumber || null,
          deliveredAt: data.deliveryDate ? new Date(data.deliveryDate) : new Date(),
          status: 'DELIVERED',
          receivedBy: data.receivedBy || null,
          notes: data.notes || null,
        },
      });

      // 2. Procesar líneas recibidas
      let allLinesComplete = true;
      if (data.linesReceived && Array.isArray(data.linesReceived)) {
        for (const lr of data.linesReceived) {
          const recNow = Number(lr.quantityReceivedNow) || 0;
          const damNow = Number(lr.quantityDamagedNow) || 0;
          const misNow = Number(lr.quantityMissingNow) || 0;

          const line = await prisma.procurementOrderLine.update({
            where: { id: lr.lineId },
            data: {
              receivedQuantity: { increment: recNow },
              damagedQuantity: { increment: damNow },
            },
          });

          if (line.procurementItemId) {
            const item = await prisma.procurementItem.findUnique({ where: { id: line.procurementItemId } });
            if (item) {
              const newRec = item.receivedQuantity + recNow;
              const newDam = item.damagedQuantity + damNow;
              const newMis = item.missingQuantity + misNow;
              const isFull = newRec >= item.quantity;

              await prisma.procurementItem.update({
                where: { id: line.procurementItemId },
                data: {
                  receivedQuantity: newRec,
                  damagedQuantity: newDam,
                  missingQuantity: newMis,
                  status: isFull ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
                },
              });
            }
          }

          if (line.receivedQuantity < line.quantity) {
            allLinesComplete = false;
          }
        }
      }

      // 3. Actualizar estado del pedido
      await prisma.procurementOrder.update({
        where: { id },
        data: {
          status: allLinesComplete ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
          actualDeliveryDate: new Date(),
        },
      });

      res.json({ success: true, message: 'Recepción registrada con éxito.' });
    } catch (error: any) {
      logger.error('PROJECT', `Error registrando recepción: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/procurement/risks
   * Auditoría de riesgos de compra y detección de retrasos
   */
  static async getRisks(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const items = await ProcurementController.getProjectItems(projectId);

      const risks = ProcurementRiskEngine.evaluateProjectRisks(items);
      res.json({ success: true, data: risks });
    } catch (error: any) {
      logger.error('PROJECT', `Error analizando riesgos: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/procurement/planning
   * Planificación de compras recomendadas y calendario por semanas
   */
  static async getPlanning(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const items = await ProcurementController.getProjectItems(projectId);
      const risks = ProcurementRiskEngine.evaluateProjectRisks(items);

      const planning = PurchasePlanningEngine.generatePlanning(projectId, items, risks.criticalRisks);
      res.json({ success: true, data: planning });
    } catch (error: any) {
      logger.error('PROJECT', `Error calculando planificación de compras: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/procurement/incidents
   * Abrir incidencia de producto / compra
   */
  static async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const data = req.body;

      const incident = await prisma.procurementIncident.create({
        data: {
          projectId,
          procurementItemId: data.procurementItemId || null,
          orderId: data.orderId || null,
          title: data.title,
          description: data.description,
          type: (data.type as any) || 'OTHER',
          quantityAffected: Number(data.quantityAffected) || 0,
          costImpact: Number(data.costImpact) || 0,
          timeImpactDays: Number(data.timeImpactDays) || 0,
          photos: data.photos || [],
        },
      });

      if (data.procurementItemId) {
        await prisma.procurementItem.update({
          where: { id: data.procurementItemId },
          data: { status: 'INCIDENT' },
        });
      }

      res.status(201).json({ success: true, data: incident });
    } catch (error: any) {
      logger.error('PROJECT', `Error creando incidencia: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/procurement/returns
   * Solicitar devolución de producto
   */
  static async createReturn(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const data = req.body;

      const returnRecord = await prisma.procurementReturn.create({
        data: {
          projectId,
          procurementItemId: data.procurementItemId,
          orderId: data.orderId || null,
          quantity: Number(data.quantity) || 1,
          reason: data.reason,
          refundAmount: Number(data.refundAmount) || 0,
          currency: data.currency || 'EUR',
          notes: data.notes || null,
          status: 'RETURN_REQUESTED',
        },
      });

      await prisma.procurementItem.update({
        where: { id: data.procurementItemId },
        data: { status: 'RETURNED' },
      });

      res.status(201).json({ success: true, data: returnRecord });
    } catch (error: any) {
      logger.error('PROJECT', `Error solicitando devolución: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

// Helpers
function mapConstructionCategoryToProcurement(cat?: string): ProcurementCategory {
  if (!cat) return 'RENOVATION_MATERIAL';
  const c = cat.toUpperCase();
  if (c.includes('ELEC')) return 'ELECTRICAL';
  if (c.includes('FONT') || c.includes('PLUMB')) return 'PLUMBING';
  if (c.includes('PINT') || c.includes('PAINT')) return 'PAINT';
  if (c.includes('SUEL') || c.includes('FLOOR')) return 'FLOORING';
  if (c.includes('CARP')) return 'CARPENTRY';
  if (c.includes('CLIM') || c.includes('HVAC')) return 'EQUIPMENT';
  return 'RENOVATION_MATERIAL';
}

function mapProductCategoryToProcurement(cat?: string): ProcurementCategory {
  if (!cat) return 'FURNITURE';
  const c = cat.toUpperCase();
  if (c.includes('FRIG') || c.includes('HORNO') || c.includes('LAV') || c.includes('APPLIANCE')) return 'APPLIANCE';
  if (c.includes('LAMP') || c.includes('ILUM') || c.includes('LIGHT')) return 'LIGHTING';
  if (c.includes('CLIM') || c.includes('AIRE') || c.includes('DOMOT')) return 'EQUIPMENT';
  if (c.includes('DECOR') || c.includes('CUADR') || c.includes('ESPEJ')) return 'DECORATION';
  return 'FURNITURE';
}
