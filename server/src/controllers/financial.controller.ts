/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Controller — Project Investment & Total Cost Intelligence
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  ProjectFinancialEngine,
  FinancialForecastEngine,
  CostItemDto,
  PropertyAcquisitionDto,
  FinancialSyncOptions,
  CostCategory,
  CostStatus,
  CostSource,
} from '@hbd/shared';

export class FinancialController {
  /**
   * Helper to retrieve active project cost items formatted as CostItemDto[]
   */
  private static async getProjectCostItems(projectId: string): Promise<CostItemDto[]> {
    const items = await prisma.costItem.findMany({
      where: { projectId },
      include: {
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((i) => ({
      id: i.id,
      projectId: i.projectId,
      category: i.category as CostCategory,
      subcategory: i.subcategory as any,
      name: i.name,
      description: i.description,
      unit: i.unit,
      quantity: i.quantity,
      estimatedUnitCost: i.estimatedUnitCost,
      estimatedTotalCost: i.estimatedTotalCost,
      actualUnitCost: i.actualUnitCost,
      actualTotalCost: i.actualTotalCost,
      paidAmount: i.paidAmount,
      pendingAmount: Math.max(
        0,
        (i.actualTotalCost ?? i.estimatedTotalCost) - i.paidAmount
      ),
      status: i.status as CostStatus,
      source: i.source as CostSource,
      sourceReference: i.sourceReference,
      spaceId: i.spaceId,
      roomName: i.roomName,
      supplierId: i.supplierId,
      supplierName: i.supplier?.name || i.supplierName || null,
      invoiceRef: i.invoiceRef,
      paymentDueDate: i.paymentDueDate ? i.paymentDueDate.toISOString() : null,
      notes: i.notes,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }));
  }

  /**
   * Helper to retrieve project acquisition
   */
  private static async getProjectAcquisition(
    projectId: string
  ): Promise<PropertyAcquisitionDto | null> {
    const acq = await prisma.propertyAcquisition.findUnique({
      where: { projectId },
    });

    if (!acq) return null;

    return {
      id: acq.id,
      projectId: acq.projectId,
      purchasePrice: acq.purchasePrice,
      notaryFees: acq.notaryFees,
      registryFees: acq.registryFees,
      transferTax: acq.transferTax,
      agencyFees: acq.agencyFees,
      legalFees: acq.legalFees,
      renovationTax: acq.renovationTax,
      valuationFees: acq.valuationFees,
      otherAcquisitionFees: acq.otherAcquisitionFees,
      totalAcquisitionCost: acq.totalAcquisitionCost,
      notes: acq.notes,
      createdAt: acq.createdAt.toISOString(),
      updatedAt: acq.updatedAt.toISOString(),
    };
  }

  /**
   * Helper to get total space areas
   */
  private static async getProjectSpaces(projectId: string) {
    const spaces = await prisma.space.findMany({
      where: {
        floor: { projectId },
      },
      include: {
        floor: true,
      },
    });

    return spaces.map((s) => ({
      id: s.id,
      name: s.name,
      floor: s.floor?.level ?? 0,
      area: s.areaM2 || 0,
    }));
  }

  /**
   * GET /api/projects/:projectId/financial/summary
   * Retorna el resumen consolidado de inversión y coste total del proyecto
   */
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        return;
      }

      const items = await FinancialController.getProjectCostItems(projectId);
      const acquisition = await FinancialController.getProjectAcquisition(projectId);
      const spaces = await FinancialController.getProjectSpaces(projectId);

      const totalArea = spaces.reduce((sum, s) => sum + (s.area || 0), 0);

      const summary = ProjectFinancialEngine.generateSummary(
        projectId,
        items,
        acquisition,
        totalArea,
        spaces
      );

      res.json({ success: true, data: summary });
    } catch (error: any) {
      logger.error('PROJECT', `Error obteniendo resumen financiero: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/financial/items
   * Lista todas las partidas de coste del proyecto
   */
  static async getItems(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { category, status } = req.query;

      const items = await FinancialController.getProjectCostItems(projectId);
      let filtered = items;

      if (category && typeof category === 'string') {
        filtered = filtered.filter((i) => i.category === category);
      }
      if (status && typeof status === 'string') {
        filtered = filtered.filter((i) => i.status === status);
      }

      res.json({ success: true, data: filtered });
    } catch (error: any) {
      logger.error('PROJECT', `Error obteniendo partidas de coste: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/financial/items
   * Crea una nueva partida de coste manual
   */
  static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const {
        category,
        subcategory,
        name,
        description,
        unit,
        quantity,
        estimatedUnitCost,
        estimatedTotalCost,
        actualUnitCost,
        actualTotalCost,
        paidAmount,
        status,
        source,
        sourceReference,
        spaceId,
        roomName,
        supplierId,
        supplierName,
        invoiceRef,
        paymentDueDate,
        notes,
      } = req.body;

      if (!name || !category) {
        res.status(400).json({
          success: false,
          message: 'El nombre y la categoría de la partida son obligatorios.',
        });
        return;
      }

      const q = typeof quantity === 'number' ? quantity : 1;
      const estUnit = typeof estimatedUnitCost === 'number' ? estimatedUnitCost : (estimatedTotalCost || 0) / q;
      const estTotal = typeof estimatedTotalCost === 'number' ? estimatedTotalCost : estUnit * q;

      const created = await prisma.costItem.create({
        data: {
          projectId,
          category: category as any,
          subcategory: subcategory || 'MISCELLANEOUS',
          name,
          description: description || null,
          unit: unit || 'ud',
          quantity: q,
          estimatedUnitCost: estUnit,
          estimatedTotalCost: estTotal,
          actualUnitCost: typeof actualUnitCost === 'number' ? actualUnitCost : null,
          actualTotalCost: typeof actualTotalCost === 'number' ? actualTotalCost : null,
          paidAmount: typeof paidAmount === 'number' ? paidAmount : 0,
          status: (status as any) || 'ESTIMATED',
          source: (source as any) || 'MANUAL',
          sourceReference: sourceReference || null,
          spaceId: spaceId || null,
          roomName: roomName || null,
          supplierId: supplierId || null,
          supplierName: supplierName || null,
          invoiceRef: invoiceRef || null,
          paymentDueDate: paymentDueDate ? new Date(paymentDueDate) : null,
          notes: notes || null,
        },
        include: { supplier: true },
      });

      logger.info('PROJECT', `Partida de coste creada: ${created.name} (${created.category})`);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      logger.error('PROJECT', `Error creando partida de coste: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/projects/:projectId/financial/items/:itemId
   * Actualiza una partida de coste existente
   */
  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, itemId } = req.params;
      const data = req.body;

      const existing = await prisma.costItem.findFirst({
        where: { id: itemId, projectId },
      });

      if (!existing) {
        res.status(404).json({ success: false, message: 'Partida de coste no encontrada.' });
        return;
      }

      const q = typeof data.quantity === 'number' ? data.quantity : existing.quantity;
      let estTotal = data.estimatedTotalCost;
      if (estTotal === undefined && data.estimatedUnitCost !== undefined) {
        estTotal = data.estimatedUnitCost * q;
      }

      let actTotal = data.actualTotalCost;
      if (actTotal === undefined && data.actualUnitCost !== undefined) {
        actTotal = data.actualUnitCost * q;
      }

      const updated = await prisma.costItem.update({
        where: { id: itemId },
        data: {
          category: data.category !== undefined ? (data.category as any) : undefined,
          subcategory: data.subcategory !== undefined ? data.subcategory : undefined,
          name: data.name !== undefined ? data.name : undefined,
          description: data.description !== undefined ? data.description : undefined,
          unit: data.unit !== undefined ? data.unit : undefined,
          quantity: q,
          estimatedUnitCost: data.estimatedUnitCost !== undefined ? data.estimatedUnitCost : undefined,
          estimatedTotalCost: estTotal !== undefined ? estTotal : undefined,
          actualUnitCost: data.actualUnitCost !== undefined ? data.actualUnitCost : undefined,
          actualTotalCost: actTotal !== undefined ? actTotal : undefined,
          paidAmount: data.paidAmount !== undefined ? data.paidAmount : undefined,
          status: data.status !== undefined ? (data.status as any) : undefined,
          spaceId: data.spaceId !== undefined ? data.spaceId : undefined,
          roomName: data.roomName !== undefined ? data.roomName : undefined,
          supplierId: data.supplierId !== undefined ? data.supplierId : undefined,
          supplierName: data.supplierName !== undefined ? data.supplierName : undefined,
          invoiceRef: data.invoiceRef !== undefined ? data.invoiceRef : undefined,
          paymentDueDate: data.paymentDueDate !== undefined ? (data.paymentDueDate ? new Date(data.paymentDueDate) : null) : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: { supplier: true },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('PROJECT', `Error actualizando partida de coste: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/projects/:projectId/financial/items/:itemId
   * Elimina una partida de coste
   */
  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, itemId } = req.params;

      const existing = await prisma.costItem.findFirst({
        where: { id: itemId, projectId },
      });

      if (!existing) {
        res.status(404).json({ success: false, message: 'Partida no encontrada' });
        return;
      }

      await prisma.costItem.delete({
        where: { id: itemId },
      });

      res.json({ success: true, message: 'Partida eliminada correctamente' });
    } catch (error: any) {
      logger.error('PROJECT', `Error eliminando partida de coste: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/financial/sync
   * Sincroniza partidas desde V11 (Construcción), V15 (Ejecución) y V16 (Mobiliario / Productos)
   * garantizando NO duplicar partidas ya importadas mediante sourceReference.
   */
  static async syncFinancials(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const options: FinancialSyncOptions = req.body || {
        includeV11Construction: true,
        includeV15Execution: true,
        includeV16Products: true,
        includeV5Furniture: true,
      };

      const existingItems = await prisma.costItem.findMany({
        where: { projectId },
      });

      const existingRefMap = new Map<string, typeof existingItems[0]>();
      for (const item of existingItems) {
        if (item.sourceReference) {
          existingRefMap.set(item.sourceReference, item);
        }
      }

      let createdCount = 0;
      let updatedCount = 0;

      // 1. Sync V11 Construction Items
      if (options.includeV11Construction !== false) {
        const constructionProject = await prisma.constructionProject.findUnique({
          where: { projectId },
          include: {
            items: {
              include: {
                supplier: true,
                space: true,
              },
            },
          },
        });

        if (constructionProject && constructionProject.items) {
          for (const item of constructionProject.items) {
            const ref = `v11_item:${item.id}`;
            const subcategory = mapV11CategoryToSubcategory(item.category);
            const estTotal = item.totalCost || (item.materialCost + item.laborCost + item.otherCost) || 0;

            if (existingRefMap.has(ref)) {
              // Update existing
              const existing = existingRefMap.get(ref)!;
              await prisma.costItem.update({
                where: { id: existing.id },
                data: {
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  estimatedTotalCost: estTotal,
                  spaceId: item.spaceId || null,
                  roomName: item.space?.name || null,
                  supplierId: item.supplierId || null,
                },
              });
              updatedCount++;
            } else {
              // Create new
              await prisma.costItem.create({
                data: {
                  projectId,
                  category: 'RENOVATION',
                  subcategory,
                  name: item.name,
                  description: item.description || 'Partida importada de Inteligencia de Obra',
                  unit: item.unit || 'ud',
                  quantity: item.quantity,
                  estimatedUnitCost: item.quantity > 0 ? estTotal / item.quantity : estTotal,
                  estimatedTotalCost: estTotal,
                  status: 'APPROVED',
                  source: 'CONSTRUCTION_V11',
                  sourceReference: ref,
                  spaceId: item.spaceId || null,
                  roomName: item.space?.name || null,
                  supplierId: item.supplierId || null,
                },
              });
              createdCount++;
            }
          }
        }
      }

      // 2. Sync V15 Execution Invoices
      if (options.includeV15Execution !== false) {
        const executionProjects = await prisma.executionProject.findMany({
          where: { projectId },
          include: {
            invoices: true,
          },
        });

        for (const ep of executionProjects) {
          for (const inv of ep.invoices) {
            const ref = `v15_invoice:${inv.id}`;
            if (!existingRefMap.has(ref)) {
              await prisma.costItem.create({
                data: {
                  projectId,
                  category: 'RENOVATION',
                  subcategory: 'MASONRY',
                  name: `Factura Certificada: ${inv.reference}`,
                  description: inv.notes || `Proveedor: ${inv.supplierId || 'Directo'}`,
                  unit: 'ud',
                  quantity: 1,
                  estimatedTotalCost: inv.totalAmount,
                  actualTotalCost: inv.totalAmount,
                  paidAmount: inv.status === 'PAID' ? inv.totalAmount : 0,
                  status: inv.status === 'PAID' ? 'PAID' : 'COMMITTED',
                  source: 'EXECUTION_V15',
                  sourceReference: ref,
                  supplierId: inv.supplierId || null,
                  invoiceRef: inv.reference,
                },
              });
              createdCount++;
            }
          }
        }
      }

      // 3. Sync V16 Project Products & Shopping List Items
      if (options.includeV16Products !== false) {
        const projectProducts = await prisma.projectProduct.findMany({
          where: { projectId },
          include: {
            product: true,
          },
        });

        for (const pp of projectProducts) {
          const ref = `product:${pp.id}`;
          const subcategory = mapProductCategoryToSubcategory(pp.product.category);
          const category = mapSubcategoryToMainCategory(subcategory);

          const total = pp.totalPrice || pp.unitPrice * pp.quantity;

          if (existingRefMap.has(ref)) {
            const existing = existingRefMap.get(ref)!;
            await prisma.costItem.update({
              where: { id: existing.id },
              data: {
                name: `${pp.product.name} (${pp.product.brand || 'Genérico'})`,
                quantity: pp.quantity,
                estimatedUnitCost: pp.unitPrice,
                estimatedTotalCost: total,
                roomName: pp.roomName || null,
              },
            });
            updatedCount++;
          } else {
            await prisma.costItem.create({
              data: {
                projectId,
                category,
                subcategory,
                name: `${pp.product.name} (${pp.product.brand || 'Genérico'})`,
                description: pp.product.description || `Mobiliario Digital Twin - SKU: ${pp.product.sku || 'N/A'}`,
                unit: 'ud',
                quantity: pp.quantity,
                estimatedUnitCost: pp.unitPrice,
                estimatedTotalCost: total,
                status: pp.status === 'INSTALLED' || pp.status === 'DELIVERED' ? 'COMMITTED' : 'ESTIMATED',
                source: 'PRODUCT_V16',
                sourceReference: ref,
                roomName: pp.roomName || null,
              },
            });
            createdCount++;
          }
        }
      }

      logger.info(
        'PROJECT',
        `Sincronización financiera completada: ${createdCount} creadas, ${updatedCount} actualizadas.`
      );

      res.json({
        success: true,
        message: `Sincronización completada: ${createdCount} partidas creadas, ${updatedCount} actualizadas.`,
        createdCount,
        updatedCount,
      });
    } catch (error: any) {
      logger.error('PROJECT', `Error sincronizando partidas financieras: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/financial/acquisition
   * Retorna datos de adquisición del inmueble
   */
  static async getAcquisition(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const acq = await FinancialController.getProjectAcquisition(projectId);
      res.json({ success: true, data: acq });
    } catch (error: any) {
      logger.error('PROJECT', `Error obteniendo datos de adquisición: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/financial/acquisition
   * Guarda o actualiza los datos de adquisición del inmueble
   */
  static async saveAcquisition(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const data = req.body;

      const total = ProjectFinancialEngine.calculateTotalAcquisition(data);

      const acq = await prisma.propertyAcquisition.upsert({
        where: { projectId },
        create: {
          projectId,
          purchasePrice: data.purchasePrice || 0,
          notaryFees: data.notaryFees || 0,
          registryFees: data.registryFees || 0,
          transferTax: data.transferTax || 0,
          agencyFees: data.agencyFees || 0,
          legalFees: data.legalFees || 0,
          renovationTax: data.renovationTax || 0,
          valuationFees: data.valuationFees || 0,
          otherAcquisitionFees: data.otherAcquisitionFees || 0,
          totalAcquisitionCost: total,
          notes: data.notes || null,
        },
        update: {
          purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : undefined,
          notaryFees: data.notaryFees !== undefined ? data.notaryFees : undefined,
          registryFees: data.registryFees !== undefined ? data.registryFees : undefined,
          transferTax: data.transferTax !== undefined ? data.transferTax : undefined,
          agencyFees: data.agencyFees !== undefined ? data.agencyFees : undefined,
          legalFees: data.legalFees !== undefined ? data.legalFees : undefined,
          renovationTax: data.renovationTax !== undefined ? data.renovationTax : undefined,
          valuationFees: data.valuationFees !== undefined ? data.valuationFees : undefined,
          otherAcquisitionFees: data.otherAcquisitionFees !== undefined ? data.otherAcquisitionFees : undefined,
          totalAcquisitionCost: total,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
      });

      logger.info('PROJECT', `Datos de adquisición guardados para proyecto ${projectId}: ${total} €`);
      res.json({ success: true, data: acq });
    } catch (error: any) {
      logger.error('PROJECT', `Error guardando datos de adquisición: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/projects/:projectId/financial/acquisition
   * Elimina la adquisición asociada al proyecto
   */
  static async deleteAcquisition(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      await prisma.propertyAcquisition.deleteMany({
        where: { projectId },
      });
      res.json({ success: true, message: 'Datos de adquisición eliminados.' });
    } catch (error: any) {
      logger.error('PROJECT', `Error eliminando adquisición: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/financial/payments
   * Lista todos los pagos registrados en el proyecto
   */
  static async getPayments(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const payments = await prisma.projectPayment.findMany({
        where: { projectId },
        include: {
          costItem: true,
        },
        orderBy: { paymentDate: 'desc' },
      });

      res.json({
        success: true,
        data: payments.map((p) => ({
          id: p.id,
          projectId: p.projectId,
          costItemId: p.costItemId,
          costItemName: p.costItem?.name || null,
          amount: p.amount,
          paymentDate: p.paymentDate.toISOString(),
          paymentMethod: p.paymentMethod,
          reference: p.reference,
          payee: p.payee,
          invoiceRef: p.invoiceRef,
          receiptUrl: p.receiptUrl,
          notes: p.notes,
          createdAt: p.createdAt.toISOString(),
        })),
      });
    } catch (error: any) {
      logger.error('PROJECT', `Error obteniendo pagos: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/financial/payments
   * Registra un nuevo pago e incrementa el paidAmount en la partida correspondiente
   */
  static async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const {
        costItemId,
        amount,
        paymentDate,
        paymentMethod,
        reference,
        payee,
        invoiceRef,
        receiptUrl,
        notes,
      } = req.body;

      if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({ success: false, message: 'El importe del pago debe ser mayor que 0.' });
        return;
      }

      const payment = await prisma.projectPayment.create({
        data: {
          projectId,
          costItemId: costItemId || null,
          amount,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMethod: paymentMethod || 'TRANSFER',
          reference: reference || null,
          payee: payee || null,
          invoiceRef: invoiceRef || null,
          receiptUrl: receiptUrl || null,
          notes: notes || null,
        },
      });

      // Si está vinculado a una partida, actualizamos su paidAmount y estado
      if (costItemId) {
        const item = await prisma.costItem.findUnique({ where: { id: costItemId } });
        if (item) {
          const newPaid = item.paidAmount + amount;
          const targetTotal = item.actualTotalCost ?? item.estimatedTotalCost;
          const isFullyPaid = newPaid >= targetTotal;

          await prisma.costItem.update({
            where: { id: costItemId },
            data: {
              paidAmount: newPaid,
              status: isFullyPaid ? 'PAID' : item.status === 'ESTIMATED' ? 'APPROVED' : item.status,
            },
          });
        }
      }

      logger.info('PROJECT', `Pago registrado: ${amount} € en proyecto ${projectId}`);
      res.status(201).json({ success: true, data: payment });
    } catch (error: any) {
      logger.error('PROJECT', `Error registrando pago: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/projects/:projectId/financial/payments/:paymentId
   * Elimina un pago y ajusta el paidAmount de la partida asociada
   */
  static async deletePayment(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, paymentId } = req.params;

      const payment = await prisma.projectPayment.findFirst({
        where: { id: paymentId, projectId },
      });

      if (!payment) {
        res.status(404).json({ success: false, message: 'Pago no encontrado.' });
        return;
      }

      if (payment.costItemId) {
        const item = await prisma.costItem.findUnique({ where: { id: payment.costItemId } });
        if (item) {
          const newPaid = Math.max(0, item.paidAmount - payment.amount);
          await prisma.costItem.update({
            where: { id: payment.costItemId },
            data: {
              paidAmount: newPaid,
              status: item.status === 'PAID' && newPaid < (item.actualTotalCost ?? item.estimatedTotalCost)
                ? 'APPROVED'
                : item.status,
            },
          });
        }
      }

      await prisma.projectPayment.delete({ where: { id: paymentId } });

      res.json({ success: true, message: 'Pago eliminado correctamente.' });
    } catch (error: any) {
      logger.error('PROJECT', `Error eliminando pago: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/financial/forecast
   * Calcula la proyección y desviación financiera
   */
  static async getForecast(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { baseline } = req.query;

      const items = await FinancialController.getProjectCostItems(projectId);
      const baselineBudget = baseline ? parseFloat(baseline as string) : 0;

      const forecast = FinancialForecastEngine.calculateForecast(
        projectId,
        items,
        baselineBudget
      );

      res.json({ success: true, data: forecast });
    } catch (error: any) {
      logger.error('PROJECT', `Error calculando proyección: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/projects/:projectId/financial/snapshots
   * Guarda una instantánea del estado financiero actual
   */
  static async createSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { title, notes } = req.body;

      const items = await FinancialController.getProjectCostItems(projectId);
      const acquisition = await FinancialController.getProjectAcquisition(projectId);
      const summary = ProjectFinancialEngine.generateSummary(projectId, items, acquisition);

      const snapshot = await prisma.financialSnapshot.create({
        data: {
          projectId,
          title: title || `Instantánea Financiera - ${new Date().toLocaleDateString()}`,
          totalTransformationCost: summary.totalTransformationCost,
          totalInvestment: summary.totalInvestment,
          propertyAcquisitionCost: summary.propertyAcquisitionCost,
          renovationCost: summary.renovationCost,
          furnitureCost: summary.furnitureCost,
          appliancesCost: summary.appliancesCost,
          equipmentCost: summary.equipmentCost,
          professionalServicesCost: summary.professionalServicesCost,
          logisticsCost: summary.logisticsCost,
          permitsCost: summary.permitsCost,
          contingencyCost: summary.contingencyCost,
          otherCost: summary.otherCost,
          paidAmount: summary.totalPaidAmount,
          pendingAmount: summary.totalPendingAmount,
          notes: notes || null,
        },
      });

      res.status(201).json({ success: true, data: snapshot });
    } catch (error: any) {
      logger.error('PROJECT', `Error creando instantánea financiera: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/projects/:projectId/financial/snapshots
   * Lista todas las instantáneas guardadas
   */
  static async getSnapshots(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const snapshots = await prisma.financialSnapshot.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: snapshots });
    } catch (error: any) {
      logger.error('PROJECT', `Error obteniendo instantáneas: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

// Helpers for category mappings
function mapV11CategoryToSubcategory(cat?: string): any {
  if (!cat) return 'MASONRY';
  const c = cat.toUpperCase();
  if (c.includes('DEMO')) return 'DEMOLITION';
  if (c.includes('ELEC')) return 'ELECTRICAL';
  if (c.includes('FONT') || c.includes('PLUMB')) return 'PLUMBING';
  if (c.includes('CLIM') || c.includes('HVAC')) return 'HVAC';
  if (c.includes('PINT') || c.includes('PAINT')) return 'PAINTING';
  if (c.includes('CARP')) return 'CARPENTRY';
  if (c.includes('SUEL') || c.includes('FLOOR')) return 'FLOORING';
  if (c.includes('BANO') || c.includes('BATH')) return 'BATHROOM_FITOUT';
  if (c.includes('COCINA') || c.includes('KITCH')) return 'KITCHEN_FITOUT';
  if (c.includes('VENT') || c.includes('DOOR') || c.includes('PUERT')) return 'WINDOWS_DOORS';
  if (c.includes('ESTRUCT') || c.includes('STRUCT')) return 'STRUCTURAL';
  if (c.includes('ALBAN') || c.includes('MASON')) return 'MASONRY';
  return 'MASONRY';
}

function mapProductCategoryToSubcategory(cat?: string): any {
  if (!cat) return 'SOFAS';
  const c = cat.toUpperCase();
  if (c.includes('SOFA') || c.includes('SILLON')) return 'SOFAS';
  if (c.includes('MESA')) return 'TABLES';
  if (c.includes('SILLA')) return 'CHAIRS';
  if (c.includes('CAMA') || c.includes('COLCHON')) return 'BEDS';
  if (c.includes('ARMARIO') || c.includes('VESTIDOR')) return 'WARDROBES';
  if (c.includes('ESTANTE') || c.includes('LIBRERIA')) return 'SHELVING';
  if (c.includes('FRIGORIFICO') || c.includes('NEVERA')) return 'REFRIGERATOR';
  if (c.includes('HORNO')) return 'OVEN';
  if (c.includes('LAVADORA')) return 'WASHING_MACHINE';
  if (c.includes('LAVAVAJILLAS')) return 'DISHWASHER';
  if (c.includes('CAMPANA')) return 'HOOD';
  if (c.includes('TV') || c.includes('TELEVISOR')) return 'TV';
  if (c.includes('LAMP') || c.includes('ILUMINACION')) return 'LIGHTING';
  if (c.includes('CLIMA') || c.includes('AIRE')) return 'AIR_CONDITIONING';
  return 'SOFAS';
}

function mapSubcategoryToMainCategory(subcat: string): CostCategory {
  const appliances = ['REFRIGERATOR', 'OVEN', 'MICROWAVE', 'DISHWASHER', 'WASHING_MACHINE', 'DRYER', 'HOB', 'HOOD', 'TV', 'SMALL_APPLIANCES'];
  const equipment = ['AIR_CONDITIONING', 'HEATING', 'SMART_HOME', 'SECURITY', 'NETWORK', 'LIGHTING', 'TECHNICAL_EQUIPMENT', 'AUDIO_VIDEO'];
  const renovation = ['DEMOLITION', 'MASONRY', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'CARPENTRY', 'FLOORING', 'PAINTING', 'BATHROOM_FITOUT', 'KITCHEN_FITOUT', 'WINDOWS_DOORS', 'INSULATION', 'STRUCTURAL'];
  
  if (appliances.includes(subcat)) return 'APPLIANCES';
  if (equipment.includes(subcat)) return 'EQUIPMENT';
  if (renovation.includes(subcat)) return 'RENOVATION';
  return 'FURNITURE';
}
