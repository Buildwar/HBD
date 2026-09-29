/**
 * HBD — HOME BOARD DESIGNER V5.0.0
 * Furniture & Spatial Validation Controller
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  FurnitureEngine,
  SpatialValidationEngine,
  SpatialValidationStatus,
  DimensionSource,
} from '@hbd/shared';

// Standard Generic Residential Categories Seed Data
const DEFAULT_CATEGORIES = [
  { name: 'Sofás y Sillones', slug: 'sofas', icon: 'Armchair', description: 'Sofás de 2/3 plazas, chaiselongues y butacas' },
  { name: 'Camas y Dormitorio', slug: 'beds', icon: 'Bed', description: 'Camas individuales, dobles, literas y cabeceros' },
  { name: 'Mesas', slug: 'tables', icon: 'Table', description: 'Mesas de comedor, centro, auxiliares y extensibles' },
  { name: 'Sillas y Taburetes', slug: 'chairs', icon: 'Chair', description: 'Sillas de comedor, oficina y taburetes altos' },
  { name: 'Armarios y Roperos', slug: 'wardrobes', icon: 'DoorOpen', description: 'Armarios roperos, empotrados y vestidores' },
  { name: 'Cómodas y Cajoneras', slug: 'dressers', icon: 'Layers', description: 'Sinfonieres, cómodas y mesitas de noche' },
  { name: 'Escritorios y Trabajo', slug: 'desks', icon: 'Laptop', description: 'Mesas de estudio y escritorios de despacho' },
  { name: 'Muebles de TV y Salón', slug: 'tv-stands', icon: 'Tv', description: 'Módulos bajos de televisión y aparadores' },
  { name: 'Estanterías y Librerías', slug: 'shelves', icon: 'BookOpen', description: 'Estanterías modulares y librerías de pared' },
  { name: 'Cocina', slug: 'kitchen', icon: 'UtensilsCrossed', description: 'Módulos altos/bajos de cocina e islas' },
  { name: 'Electrodomésticos', slug: 'appliances', icon: 'Refrigerator', description: 'Frigoríficos, lavadoras, lavavajillas y hornos' },
  { name: 'Baño', slug: 'bathroom', icon: 'Bath', description: 'Muebles de lavabo, sanitarios, platos de ducha y bañeras' },
  { name: 'Iluminación', slug: 'lighting', icon: 'Lamp', description: 'Lámparas de pie, techo y apliques' },
  { name: 'Decoración', slug: 'decor', icon: 'Sparkles', description: 'Plantas, alfombras, espejos y accesorios' },
  { name: 'Otros', slug: 'others', icon: 'Box', description: 'Elementos auxiliares varios' },
];

// Standard Generic Furniture Catalog Seed Data (Generic residential dimensions, no trademarked names)
const DEFAULT_GENERIC_FURNITURE = [
  { name: 'Sofá 3 Plazas Estándar', categorySlug: 'sofas', w: 2.40, d: 0.95, h: 0.85, desc: 'Sofá residencial de tres plazas' },
  { name: 'Sofá 2 Plazas Compacto', categorySlug: 'sofas', w: 1.80, d: 0.90, h: 0.85, desc: 'Sofá de dos plazas' },
  { name: 'Sillón Individual', categorySlug: 'sofas', w: 0.90, d: 0.85, h: 0.90, desc: 'Butaca individual' },
  { name: 'Cama Doble Matrimonio (160×200)', categorySlug: 'beds', w: 1.60, d: 2.00, h: 0.50, desc: 'Cama doble estándar' },
  { name: 'Cama Individual (90×190)', categorySlug: 'beds', w: 0.90, d: 1.90, h: 0.45, desc: 'Cama individual' },
  { name: 'Mesita de Noche', categorySlug: 'dressers', w: 0.45, d: 0.40, h: 0.55, desc: 'Mesilla auxiliar de dormitorio' },
  { name: 'Mesa de Comedor Rectangular', categorySlug: 'tables', w: 1.80, d: 0.90, h: 0.75, desc: 'Mesa para 6 comensales' },
  { name: 'Mesa de Centro Salón', categorySlug: 'tables', w: 1.10, d: 0.60, h: 0.45, desc: 'Mesa baja de café' },
  { name: 'Silla de Comedor', categorySlug: 'chairs', w: 0.45, d: 0.45, h: 0.90, desc: 'Silla ergonómica' },
  { name: 'Armario Ropero 3 Puertas', categorySlug: 'wardrobes', w: 2.00, d: 0.60, h: 2.20, desc: 'Armario principal' },
  { name: 'Cómoda 4 Cajones', categorySlug: 'dressers', w: 1.00, d: 0.50, h: 0.90, desc: 'Cómoda cajonera' },
  { name: 'Escritorio de Trabajo', categorySlug: 'desks', w: 1.40, d: 0.70, h: 0.75, desc: 'Mesa de ordenador' },
  { name: 'Mueble Bajo TV', categorySlug: 'tv-stands', w: 1.60, d: 0.40, h: 0.50, desc: 'Módulo multimedia' },
  { name: 'Estantería Librería', categorySlug: 'shelves', w: 0.80, d: 0.30, h: 2.00, desc: 'Estantería vertical' },
  { name: 'Frigorífico Combi', categorySlug: 'appliances', w: 0.60, d: 0.65, h: 1.85, desc: 'Nevera estándar 60cm' },
  { name: 'Lavadora Carga Frontal', categorySlug: 'appliances', w: 0.60, d: 0.60, h: 0.85, desc: 'Lavadora 60cm' },
  { name: 'Mueble Lavabo Baño', categorySlug: 'bathroom', w: 0.80, d: 0.45, h: 0.85, desc: 'Lavabo con cajones' },
];

/**
 * Initializes categories and default generic furniture if empty.
 */
export const ensureFurnitureCatalogSeeded = async (): Promise<void> => {
  try {
    const categoriesCount = await prisma.furnitureCategory.count();
    if (categoriesCount === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.furnitureCategory.create({ data: cat });
      }
    }

    const furnitureCount = await prisma.furniture.count({ where: { isCustom: false } });
    if (furnitureCount === 0) {
      const allCats = await prisma.furnitureCategory.findMany();
      const catMap = new Map(allCats.map((c) => [c.slug, c.id]));

      for (const f of DEFAULT_GENERIC_FURNITURE) {
        const categoryId = catMap.get(f.categorySlug) || allCats[0].id;
        await prisma.furniture.create({
          data: {
            name: f.name,
            categoryId,
            defaultWidthM: f.w,
            defaultDepthM: f.d,
            defaultHeightM: f.h,
            isCustom: false,
          },
        });
      }
    }
  } catch (err) {
    console.error('Error auto-seeding furniture catalog:', err);
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureFurnitureCatalogSeeded();
    const categories = await prisma.furnitureCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { furniture: true } },
      },
    });

    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFurnitureList = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureFurnitureCatalogSeeded();
    const userId = req.user!.id;
    const { categoryId, search, customOnly } = req.query;

    const where: any = {
      OR: [
        { isCustom: false },
        { isCustom: true, userId },
      ],
    };

    if (customOnly === 'true') {
      where.OR = [{ isCustom: true, userId }];
    }

    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }

    if (search && typeof search === 'string') {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const furniture = await prisma.furniture.findMany({
      where,
      include: { category: true },
      orderBy: [{ isCustom: 'desc' }, { name: 'asc' }],
    });

    res.json({ success: true, data: furniture });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFurniture = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, categoryId, widthM, depthM, heightM, description, imageUrl } = req.body;

    if (!name || !categoryId) {
      res.status(400).json({ success: false, message: 'El nombre y la categoría son obligatorios.' });
      return;
    }

    const val = FurnitureEngine.validateDimensions(
      Number(widthM) || 0,
      Number(depthM) || 0,
      Number(heightM) || 0
    );

    if (!val.isValid) {
      res.status(400).json({ success: false, message: val.error });
      return;
    }

    const created = await prisma.furniture.create({
      data: {
        name,
        categoryId,
        defaultWidthM: Number(widthM),
        defaultDepthM: Number(depthM),
        defaultHeightM: Number(heightM),
        imageUrl: imageUrl || null,
        isCustom: true,
        userId,
      },
      include: { category: true },
    });

    await logger.audit('FURNITURE', `Mueble personalizado creado: ${created.name} (${created.id})`, userId);

    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFurniture = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, categoryId, widthM, depthM, heightM, imageUrl } = req.body;

    const existing = await prisma.furniture.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mueble no encontrado.' });
      return;
    }

    if (existing.userId !== userId && req.user!.roleName !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'No puedes modificar muebles que no son tuyos.' });
      return;
    }

    if (widthM !== undefined || depthM !== undefined || heightM !== undefined) {
      const val = FurnitureEngine.validateDimensions(
        Number(widthM ?? existing.defaultWidthM),
        Number(depthM ?? existing.defaultDepthM),
        Number(heightM ?? existing.defaultHeightM)
      );
      if (!val.isValid) {
        res.status(400).json({ success: false, message: val.error });
        return;
      }
    }

    const updated = await prisma.furniture.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(widthM !== undefined && { defaultWidthM: Number(widthM) }),
        ...(depthM !== undefined && { defaultDepthM: Number(depthM) }),
        ...(heightM !== undefined && { defaultHeightM: Number(heightM) }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: { category: true },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFurniture = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.furniture.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mueble no encontrado.' });
      return;
    }

    if (existing.userId !== userId && req.user!.roleName !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'No puedes eliminar este mueble.' });
      return;
    }

    await prisma.furniture.delete({ where: { id } });
    await logger.audit('FURNITURE', `Mueble eliminado: ${existing.name} (${id})`, userId);

    res.json({ success: true, message: 'Mueble eliminado de tu biblioteca.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFloorPlacements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floorId } = req.params;

    const placements = await prisma.furniturePlacement.findMany({
      where: { floorId },
      include: {
        furniture: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: placements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlacement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floorId } = req.params;
    const userId = req.user!.id;
    const { furnitureId, posX, posY, posZ, rotationDeg, widthM, depthM, heightM, roomId } = req.body;

    if (!furnitureId) {
      res.status(400).json({ success: false, message: 'Se requiere ID de mueble.' });
      return;
    }

    const furniture = await prisma.furniture.findUnique({ where: { id: furnitureId } });
    if (!furniture) {
      res.status(404).json({ success: false, message: 'Mueble no encontrado.' });
      return;
    }

    const created = await prisma.furniturePlacement.create({
      data: {
        floorId,
        furnitureId,
        posX: Number(posX) || 100,
        posY: Number(posY) || 100,
        posZ: Number(posZ) || 0,
        rotationDeg: Number(rotationDeg) || 0,
        widthM: Number(widthM) || furniture.defaultWidthM,
        depthM: Number(depthM) || furniture.defaultDepthM,
        heightM: Number(heightM) || furniture.defaultHeightM,
      },
      include: {
        furniture: {
          include: { category: true },
        },
      },
    });

    await logger.audit('FURNITURE', `Mueble colocado en planta ${floorId}: ${furniture.name}`, userId);

    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlacement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { posX, posY, posZ, rotationDeg, widthM, depthM, heightM } = req.body;

    const updated = await prisma.furniturePlacement.update({
      where: { id },
      data: {
        ...(posX !== undefined && { posX: Number(posX) }),
        ...(posY !== undefined && { posY: Number(posY) }),
        ...(posZ !== undefined && { posZ: Number(posZ) }),
        ...(rotationDeg !== undefined && { rotationDeg: Number(rotationDeg) }),
        ...(widthM !== undefined && { widthM: Number(widthM) }),
        ...(depthM !== undefined && { depthM: Number(depthM) }),
        ...(heightM !== undefined && { heightM: Number(heightM) }),
      },
      include: {
        furniture: {
          include: { category: true },
        },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePlacement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.furniturePlacement.delete({ where: { id } });
    res.json({ success: true, message: 'Mueble retirado del plano.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicatePlacement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const source = await prisma.furniturePlacement.findUnique({ where: { id } });

    if (!source) {
      res.status(404).json({ success: false, message: 'Colocación no encontrada.' });
      return;
    }

    const duplicated = await prisma.furniturePlacement.create({
      data: {
        floorId: source.floorId,
        furnitureId: source.furnitureId,
        posX: source.posX + 30, // Offset position slightly
        posY: source.posY + 30,
        posZ: source.posZ,
        rotationDeg: source.rotationDeg,
        widthM: source.widthM,
        depthM: source.depthM,
        heightM: source.heightM,
      },
      include: {
        furniture: {
          include: { category: true },
        },
      },
    });

    res.status(201).json({ success: true, data: duplicated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validatePlacementSpatial = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      furnitureId,
      furnitureName,
      posX,
      posY,
      widthM,
      depthM,
      heightM,
      rotationDeg,
      scaleFactor,
      room,
      walls,
      otherPlacements,
      doors,
      windows,
      rules,
    } = req.body;

    const validationResult = SpatialValidationEngine.validatePlacement({
      furnitureId: furnitureId || 'candidate',
      furnitureName,
      posX: Number(posX) || 0,
      posY: Number(posY) || 0,
      widthM: Number(widthM) || 1.0,
      depthM: Number(depthM) || 1.0,
      heightM: Number(heightM) || 1.0,
      rotationDeg: Number(rotationDeg) || 0,
      scaleFactor: Number(scaleFactor) || 100,
      room,
      walls,
      otherPlacements,
      doors,
      windows,
      rules,
    });

    res.json({ success: true, data: validationResult });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
