/**
 * Property Intelligence Controller (Phase V23 / v1.23.0)
 * Handles Property CRUD, intelligence analysis, snapshots, opportunities, risks, and data quality.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
  PropertyIntelligenceEngine,
  PropertyAnalysisEngine,
  PropertyOpportunityEngine,
  PropertyRiskEngine,
  PropertyDataQualityEngine,
  PropertySnapshotEngine,
  PropertyDto,
} from '@hbd/shared';

export class PropertyController {
  /**
   * Lists all properties (optionally filtered by user).
   * GET /api/properties
   */
  static async getProperties(req: Request, res: Response) {
    try {
      const properties = await prisma.property.findMany({
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              propertyType: true,
            },
          },
          opportunities: true,
          risks: true,
          snapshots: {
            select: {
              id: true,
              name: true,
              stateType: true,
              createdAt: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return res.json({ success: true, data: properties });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Retrieves a single property by ID with all relations.
   * GET /api/properties/:id
   */
  static async getPropertyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          projects: {
            include: {
              floors: {
                include: {
                  rooms: true,
                  walls: true,
                  furniturePlacements: true,
                  technicalElements: true,
                },
              },
              costItems: true,
              procurementItems: true,
              scenarios: true,
            },
          },
          opportunities: true,
          risks: true,
          snapshots: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!property) {
        return res.status(404).json({ success: false, error: 'Inmueble no encontrado.' });
      }

      return res.json({ success: true, data: property });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Creates a new property.
   * POST /api/properties
   */
  static async createProperty(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        propertyType,
        status,
        condition,
        occupancyStatus,
        address,
        builtSurfaceM2,
        usableSurfaceM2,
        plotSurfaceM2,
        roomsCount,
        bathroomsCount,
        bedroomsCount,
        floorNumber,
        totalFloors,
        constructionYear,
        renovationYear,
        orientation,
        energyRating,
        source,
        confidence,
        metadata,
        userId: customUserId,
      } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'El nombre del inmueble es obligatorio.' });
      }

      // Find an existing user or fallback to first user in database
      let userId = (req as any).user?.id || customUserId;
      if (!userId) {
        const firstUser = await prisma.user.findFirst();
        if (!firstUser) {
          return res.status(400).json({ success: false, error: 'No se ha encontrado un usuario para asociar.' });
        }
        userId = firstUser.id;
      }

      const created = await prisma.property.create({
        data: {
          userId,
          name,
          description,
          propertyType: propertyType || 'APARTMENT',
          status: status || 'ACTIVE',
          condition: condition || 'UNKNOWN',
          occupancyStatus: occupancyStatus || 'UNKNOWN',
          address: address || {},
          builtSurfaceM2: builtSurfaceM2 ? Number(builtSurfaceM2) : undefined,
          usableSurfaceM2: usableSurfaceM2 ? Number(usableSurfaceM2) : undefined,
          plotSurfaceM2: plotSurfaceM2 ? Number(plotSurfaceM2) : undefined,
          roomsCount: roomsCount ? Number(roomsCount) : undefined,
          bathroomsCount: bathroomsCount ? Number(bathroomsCount) : undefined,
          bedroomsCount: bedroomsCount ? Number(bedroomsCount) : undefined,
          floorNumber: floorNumber ? Number(floorNumber) : undefined,
          totalFloors: totalFloors ? Number(totalFloors) : 1,
          constructionYear: constructionYear ? Number(constructionYear) : undefined,
          renovationYear: renovationYear ? Number(renovationYear) : undefined,
          orientation,
          energyRating,
          source: source || 'USER_PROVIDED',
          confidence: confidence || 'CONFIRMED',
          metadata: metadata || {},
        },
        include: {
          projects: true,
          opportunities: true,
          risks: true,
          snapshots: true,
        },
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Updates an existing property.
   * PUT /api/properties/:id
   */
  static async updateProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await prisma.property.update({
        where: { id },
        data: {
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.description !== undefined ? { description: updates.description } : {}),
          ...(updates.propertyType ? { propertyType: updates.propertyType } : {}),
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.condition ? { condition: updates.condition } : {}),
          ...(updates.occupancyStatus ? { occupancyStatus: updates.occupancyStatus } : {}),
          ...(updates.address ? { address: updates.address } : {}),
          ...(updates.builtSurfaceM2 !== undefined ? { builtSurfaceM2: Number(updates.builtSurfaceM2) } : {}),
          ...(updates.usableSurfaceM2 !== undefined ? { usableSurfaceM2: Number(updates.usableSurfaceM2) } : {}),
          ...(updates.plotSurfaceM2 !== undefined ? { plotSurfaceM2: Number(updates.plotSurfaceM2) } : {}),
          ...(updates.roomsCount !== undefined ? { roomsCount: Number(updates.roomsCount) } : {}),
          ...(updates.bathroomsCount !== undefined ? { bathroomsCount: Number(updates.bathroomsCount) } : {}),
          ...(updates.bedroomsCount !== undefined ? { bedroomsCount: Number(updates.bedroomsCount) } : {}),
          ...(updates.floorNumber !== undefined ? { floorNumber: Number(updates.floorNumber) } : {}),
          ...(updates.totalFloors !== undefined ? { totalFloors: Number(updates.totalFloors) } : {}),
          ...(updates.constructionYear !== undefined ? { constructionYear: Number(updates.constructionYear) } : {}),
          ...(updates.renovationYear !== undefined ? { renovationYear: Number(updates.renovationYear) } : {}),
          ...(updates.orientation !== undefined ? { orientation: updates.orientation } : {}),
          ...(updates.energyRating !== undefined ? { energyRating: updates.energyRating } : {}),
          ...(updates.source ? { source: updates.source } : {}),
          ...(updates.confidence ? { confidence: updates.confidence } : {}),
          ...(updates.metadata ? { metadata: updates.metadata } : {}),
        },
        include: {
          projects: true,
          opportunities: true,
          risks: true,
          snapshots: true,
        },
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Deletes a property.
   * DELETE /api/properties/:id
   */
  static async deleteProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.property.delete({ where: { id } });
      return res.json({ success: true, message: 'Inmueble eliminado correctamente.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Associates a Project with a Property.
   * POST /api/properties/:id/link-project
   */
  static async linkProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { projectId } = req.body;

      if (!projectId) {
        return res.status(400).json({ success: false, error: 'projectId es obligatorio.' });
      }

      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { propertyId: id },
      });

      return res.json({ success: true, data: updatedProject });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Unlinks a Project from a Property.
   * POST /api/properties/:id/unlink-project
   */
  static async unlinkProject(req: Request, res: Response) {
    try {
      const { projectId } = req.body;
      if (!projectId) {
        return res.status(400).json({ success: false, error: 'projectId es obligatorio.' });
      }

      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { propertyId: null },
      });

      return res.json({ success: true, data: updatedProject });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Comprehensive Intelligence Report for a Property.
   * GET /api/properties/:id/analysis
   */
  static async getAnalysisReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          projects: {
            include: {
              floors: {
                include: {
                  rooms: true,
                  furniturePlacements: true,
                  technicalElements: true,
                },
              },
              costItems: true,
              procurementItems: true,
              scenarios: true,
            },
          },
          opportunities: true,
          risks: true,
          snapshots: true,
        },
      });

      if (!property) {
        return res.status(404).json({ success: false, error: 'Inmueble no encontrado.' });
      }

      // Collect rooms from associated projects
      const rooms: any[] = [];
      let totalPowerKW = 0;
      let totalCircuits = 0;
      let smartHomeProtocolCount = 0;
      let securityFixturesCount = 0;
      let furnitureItemsCount = 0;
      let renovationCost = 0;
      let furnitureCost = 0;
      let technicalCost = 0;
      let procurementCost = 0;

      property.projects.forEach((proj) => {
        proj.floors.forEach((floor) => {
          floor.rooms.forEach((r) => {
            rooms.push({
              id: r.id,
              name: r.name,
              type: r.roomType || 'ROOM',
              areaM2: r.areaM2,
              widthM: r.widthM || undefined,
              lengthM: r.lengthM || undefined,
            });
          });

          furnitureItemsCount += floor.furniturePlacements.length;
          floor.technicalElements.forEach((te) => {
            if (te.category === 'ELECTRICAL') totalPowerKW += (te.powerWatts || 0) / 1000;
            if (te.category === 'SMART_HOME') smartHomeProtocolCount++;
            if (te.category === 'SECURITY') securityFixturesCount++;
          });
        });

        proj.costItems.forEach((ci) => {
          if (ci.category === 'RENOVATION') renovationCost += ci.estimatedTotalCost;
          if (ci.category === 'FURNITURE') furnitureCost += ci.estimatedTotalCost;
          if (ci.category === 'EQUIPMENT' || ci.category === 'PROFESSIONAL_SERVICES') technicalCost += ci.estimatedTotalCost;
        });

        proj.procurementItems.forEach((pi) => {
          procurementCost += pi.estimatedTotalCost;
        });
      });

      const report = PropertyIntelligenceEngine.generateReport(property as any, {
        rooms,
        financials: {
          renovationCost,
          furnitureCost,
          technicalCost,
          procurementCost,
        },
        technicalSummary: {
          totalPowerKW: Number(totalPowerKW.toFixed(2)),
          totalCircuits,
          hasWifiAnalysis: true,
          smartHomeProtocolCount,
          securityFixturesCount,
        },
        furnitureSummary: {
          totalItems: furnitureItemsCount,
          furnitureTwinsCount: furnitureItemsCount,
          retailProductsCount: furnitureItemsCount,
        },
      });

      return res.json({ success: true, data: report });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Evaluates and returns Data Quality for a Property.
   * GET /api/properties/:id/data-quality
   */
  static async getDataQuality(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await prisma.property.findUnique({ where: { id } });
      if (!property) {
        return res.status(404).json({ success: false, error: 'Inmueble no encontrado.' });
      }

      const quality = PropertyDataQualityEngine.evaluateDataQuality(property as any);
      return res.json({ success: true, data: quality });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Lists opportunities for a property.
   * GET /api/properties/:id/opportunities
   */
  static async getOpportunities(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const opportunities = await prisma.propertyOpportunity.findMany({
        where: { propertyId: id },
        orderBy: { impactScore: 'desc' },
      });
      return res.json({ success: true, data: opportunities });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Detects and upserts AI/Calculated opportunities for a property.
   * POST /api/properties/:id/opportunities
   */
  static async generateOpportunities(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          projects: {
            include: {
              floors: {
                include: { rooms: true },
              },
            },
          },
        },
      });

      if (!property) {
        return res.status(404).json({ success: false, error: 'Inmueble no encontrado.' });
      }

      const rooms: any[] = [];
      property.projects.forEach((p) => {
        p.floors.forEach((f) => {
          f.rooms.forEach((r) => rooms.push(r));
        });
      });

      const spatial = rooms.length > 0 ? PropertyAnalysisEngine.analyzeSpatialProfile(rooms) : undefined;
      const detected = PropertyOpportunityEngine.detectOpportunities(property as any, spatial);

      // Save detected opportunities
      for (const opp of detected) {
        await prisma.propertyOpportunity.create({
          data: {
            propertyId: id,
            title: opp.title,
            description: opp.description,
            category: opp.category,
            priority: opp.priority,
            estimatedCostEur: opp.estimatedCostEur,
            impactScore: opp.impactScore,
            potentialSavingsEur: opp.potentialSavingsEur,
            dependencies: opp.dependencies || [],
            source: opp.source,
            confidence: opp.confidence,
            status: 'IDENTIFIED',
          },
        });
      }

      const allOpportunities = await prisma.propertyOpportunity.findMany({
        where: { propertyId: id },
      });

      return res.json({ success: true, data: allOpportunities });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Lists risks for a property.
   * GET /api/properties/:id/risks
   */
  static async getRisks(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const risks = await prisma.propertyRisk.findMany({
        where: { propertyId: id },
        orderBy: { severity: 'desc' },
      });
      return res.json({ success: true, data: risks });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Generates and records risks for a property.
   * POST /api/properties/:id/risks
   */
  static async generateRisks(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await prisma.property.findUnique({ where: { id } });
      if (!property) {
        return res.status(404).json({ success: false, error: 'Inmueble no encontrado.' });
      }

      const evaluated = PropertyRiskEngine.evaluateRisks(property as any);

      for (const r of evaluated) {
        await prisma.propertyRisk.create({
          data: {
            propertyId: id,
            title: r.title,
            description: r.description,
            category: r.category,
            severity: r.severity,
            isPotential: r.isPotential,
            requiresProfessionalReview: r.requiresProfessionalReview,
            mitigationSuggestion: r.mitigationSuggestion,
            source: r.source,
            confidence: r.confidence,
            status: 'OPEN',
          },
        });
      }

      const allRisks = await prisma.propertyRisk.findMany({ where: { propertyId: id } });
      return res.json({ success: true, data: allRisks });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Lists snapshots for a property.
   * GET /api/properties/:id/snapshots
   */
  static async getSnapshots(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const snapshots = await prisma.propertySnapshot.findMany({
        where: { propertyId: id },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: snapshots });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Creates a snapshot of a property.
   * POST /api/properties/:id/snapshots
   */
  static async createSnapshot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, stateType, description } = req.body;

      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          opportunities: true,
          risks: true,
          projects: {
            include: {
              floors: {
                include: { rooms: true },
              },
            },
          },
        },
      });

      if (!property) {
        return res.status(404).json({ success: false, error: 'Inmueble no encontrado.' });
      }

      const snapshot = PropertySnapshotEngine.createSnapshot(
        property as any,
        stateType || 'INITIAL_EXISTING',
        name || `Instantánea ${new Date().toLocaleDateString()}`,
        {
          description,
          opportunities: property.opportunities as any,
          risks: property.risks as any,
        }
      );

      const created = await prisma.propertySnapshot.create({
        data: {
          propertyId: id,
          name: snapshot.name,
          stateType: snapshot.stateType,
          description: snapshot.description,
          snapshotData: snapshot.snapshotData as any,
          metricsSummary: (snapshot.metricsSummary || {}) as any,
        },
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Compares two snapshots.
   * GET /api/properties/:id/snapshots/compare?snapA=xxx&snapB=yyy
   */
  static async compareSnapshots(req: Request, res: Response) {
    try {
      const { snapA: idA, snapB: idB } = req.query;
      if (!idA || !idB) {
        return res.status(400).json({ success: false, error: 'snapA and snapB query params are required.' });
      }

      const snapshotA = await prisma.propertySnapshot.findUnique({ where: { id: String(idA) } });
      const snapshotB = await prisma.propertySnapshot.findUnique({ where: { id: String(idB) } });

      if (!snapshotA || !snapshotB) {
        return res.status(404).json({ success: false, error: 'Una o ambas instantáneas no existen.' });
      }

      const comparison = PropertySnapshotEngine.compareSnapshots(snapshotA as any, snapshotB as any);
      return res.json({ success: true, data: comparison });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
