/**
 * HBD — HOME BOARD DESIGNER
 * Technical Infrastructure Controller (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
  TechnicalInfrastructureEngine,
  WiFiCoverageEngine,
  TechnicalValidationEngine,
  TechnicalElementDto,
  TechnicalConnectionDto,
  TechnicalZoneDto,
  TechnicalCategory
} from '@hbd/shared';
import { TechnicalIntegrationService } from '../services/technicalIntegration.service.js';

export class TechnicalInfrastructureController {
  /**
   * Obtener todos los elementos técnicos de un proyecto
   */
  public static async getElements(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const elements = await prisma.technicalElement.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' }
      });

      const formatted: TechnicalElementDto[] = elements.map((e: any) => ({
        id: e.id,
        projectId: e.projectId,
        floorId: e.floorId,
        roomId: e.roomId,
        wallId: e.wallId,
        furnitureId: e.furnitureId,
        retailProductId: e.retailProductId,
        code: e.code,
        name: e.name,
        category: e.category as any,
        mountingType: e.mountingType as any,
        status: e.status as any,
        protocol: e.protocol as any,
        position: { x: e.posX, y: e.posY, z: e.posZ },
        rotation: e.rotationDeg,
        dimensions: { width: e.widthM, height: e.heightM, depth: e.depthM },
        circuitId: e.circuitId,
        channelId: e.channelId,
        powerWatts: e.powerWatts,
        voltage: e.voltage,
        currentAmps: e.currentAmps,
        ipRating: e.ipRating,
        poePowered: e.poePowered,
        poeClass: e.poeClass,
        wifiBand: e.wifiBand as any,
        rfPowerDbm: e.rfPowerDbm,
        cameraFovDegrees: e.cameraFovDegrees,
        cameraRangeMeters: e.cameraRangeMeters,
        pipeDiameterMm: e.pipeDiameterMm,
        airflowM3h: e.airflowM3h,
        hvacCoolingKw: e.hvacCoolingKw,
        hvacHeatingKw: e.hvacHeatingKw,
        costItemId: e.costItemId,
        procurementItemId: e.procurementItemId,
        executionTaskId: e.executionTaskId,
        metadata: (e.metadata as any) || {},
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString()
      }));

      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Crear un nuevo elemento técnico
   */
  public static async createElement(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const body = req.body;

      // Contar elementos existentes en la categoría para generar código correlativo
      const count = await prisma.technicalElement.count({
        where: { projectId, category: body.category as any }
      });
      const generatedCode = body.code || TechnicalInfrastructureEngine.generateElementCode(body.category as TechnicalCategory, count + 1);

      const element = await prisma.technicalElement.create({
        data: {
          projectId,
          floorId: body.floorId || null,
          roomId: body.roomId || null,
          wallId: body.wallId || null,
          furnitureId: body.furnitureId || null,
          retailProductId: body.retailProductId || null,
          code: generatedCode,
          name: body.name || `${body.category} Element`,
          category: body.category || 'ELECTRICAL',
          mountingType: body.mountingType || 'WALL_RECESSED',
          status: body.status || 'PLANNED',
          protocol: body.protocol || null,
          posX: body.position?.x ?? 0,
          posY: body.position?.y ?? 0,
          posZ: body.position?.z ?? 0.30,
          rotationDeg: body.rotation ?? 0,
          widthM: body.dimensions?.width ?? 0.08,
          heightM: body.dimensions?.height ?? 0.08,
          depthM: body.dimensions?.depth ?? 0.05,
          circuitId: body.circuitId || null,
          channelId: body.channelId || null,
          powerWatts: body.powerWatts || null,
          voltage: body.voltage || 230,
          currentAmps: body.currentAmps || null,
          ipRating: body.ipRating || null,
          poePowered: body.poePowered || false,
          poeClass: body.poeClass || null,
          wifiBand: body.wifiBand || null,
          rfPowerDbm: body.rfPowerDbm || null,
          cameraFovDegrees: body.cameraFovDegrees || null,
          cameraRangeMeters: body.cameraRangeMeters || null,
          pipeDiameterMm: body.pipeDiameterMm || null,
          airflowM3h: body.airflowM3h || null,
          hvacCoolingKw: body.hvacCoolingKw || null,
          hvacHeatingKw: body.hvacHeatingKw || null,
          metadata: body.metadata || {}
        }
      });

      const formatted: TechnicalElementDto = {
        id: element.id,
        projectId: element.projectId,
        floorId: element.floorId,
        roomId: element.roomId,
        wallId: element.wallId,
        furnitureId: element.furnitureId,
        retailProductId: element.retailProductId,
        code: element.code,
        name: element.name,
        category: element.category as any,
        mountingType: element.mountingType as any,
        status: element.status as any,
        protocol: element.protocol as any,
        position: { x: element.posX, y: element.posY, z: element.posZ },
        rotation: element.rotationDeg,
        dimensions: { width: element.widthM, height: element.heightM, depth: element.depthM },
        circuitId: element.circuitId,
        channelId: element.channelId,
        powerWatts: element.powerWatts,
        voltage: element.voltage,
        currentAmps: element.currentAmps,
        ipRating: element.ipRating,
        poePowered: element.poePowered,
        poeClass: element.poeClass,
        wifiBand: element.wifiBand as any,
        rfPowerDbm: element.rfPowerDbm,
        cameraFovDegrees: element.cameraFovDegrees,
        cameraRangeMeters: element.cameraRangeMeters,
        pipeDiameterMm: element.pipeDiameterMm,
        airflowM3h: element.airflowM3h,
        hvacCoolingKw: element.hvacCoolingKw,
        hvacHeatingKw: element.hvacHeatingKw,
        costItemId: element.costItemId,
        procurementItemId: element.procurementItemId,
        executionTaskId: element.executionTaskId,
        metadata: (element.metadata as any) || {},
        createdAt: element.createdAt.toISOString(),
        updatedAt: element.updatedAt.toISOString()
      };

      // Si se solicita sincronización automática con V17, V18, V15
      if (body.autoSync) {
        await TechnicalIntegrationService.syncWithFinancial(formatted, body.estimatedCost || 45.0);
        await TechnicalIntegrationService.syncWithProcurement(formatted, body.estimatedCost || 45.0);
        await TechnicalIntegrationService.syncWithExecution(projectId, formatted);
      }

      return res.status(201).json({ success: true, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Actualizar un elemento técnico
   */
  public static async updateElement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const body = req.body;

      const element = await prisma.technicalElement.update({
        where: { id },
        data: {
          name: body.name,
          category: body.category,
          mountingType: body.mountingType,
          status: body.status,
          protocol: body.protocol,
          posX: body.position?.x !== undefined ? body.position.x : undefined,
          posY: body.position?.y !== undefined ? body.position.y : undefined,
          posZ: body.position?.z !== undefined ? body.position.z : undefined,
          rotationDeg: body.rotation,
          widthM: body.dimensions?.width,
          heightM: body.dimensions?.height,
          depthM: body.dimensions?.depth,
          circuitId: body.circuitId,
          channelId: body.channelId,
          powerWatts: body.powerWatts,
          voltage: body.voltage,
          currentAmps: body.currentAmps,
          ipRating: body.ipRating,
          poePowered: body.poePowered,
          poeClass: body.poeClass,
          wifiBand: body.wifiBand,
          rfPowerDbm: body.rfPowerDbm,
          cameraFovDegrees: body.cameraFovDegrees,
          cameraRangeMeters: body.cameraRangeMeters,
          pipeDiameterMm: body.pipeDiameterMm,
          airflowM3h: body.airflowM3h,
          hvacCoolingKw: body.hvacCoolingKw,
          hvacHeatingKw: body.hvacHeatingKw,
          metadata: body.metadata
        }
      });

      return res.json({ success: true, data: element });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Eliminar un elemento técnico
   */
  public static async deleteElement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.technicalElement.delete({ where: { id } });
      return res.json({ success: true, message: 'Elemento técnico eliminado correctamente' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Obtener conexiones técnicas del proyecto
   */
  public static async getConnections(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const connections = await prisma.technicalConnection.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' }
      });

      const formatted: TechnicalConnectionDto[] = connections.map((c: any) => ({
        id: c.id,
        projectId: c.projectId,
        floorId: c.floorId,
        code: c.code,
        name: c.name,
        connectionType: c.connectionType as any,
        fromElementId: c.fromElementId,
        toElementId: c.toElementId,
        fromZoneId: c.fromZoneId,
        toZoneId: c.toZoneId,
        pathPoints: (c.pathPoints as any) || [],
        lengthMeters: c.lengthMeters,
        wireGaugeMm2: c.wireGaugeMm2,
        cableCategory: c.cableCategory,
        pipeDiameterMm: c.pipeDiameterMm,
        conduitDiameterMm: c.conduitDiameterMm,
        channelingType: c.channelingType as any,
        status: c.status as any,
        metadata: (c.metadata as any) || {},
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      }));

      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Crear una conexión técnica (cableado/tubería)
   */
  public static async createConnection(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const body = req.body;

      const count = await prisma.technicalConnection.count({ where: { projectId } });
      const code = body.code || `CON-${(count + 1).toString().padStart(3, '0')}`;

      // Calcular longitud sumando segmentos si pathPoints está provisto
      let lengthMeters = body.lengthMeters || 0;
      if (body.pathPoints && body.pathPoints.length >= 2 && !body.lengthMeters) {
        for (let i = 0; i < body.pathPoints.length - 1; i++) {
          const p1 = body.pathPoints[i];
          const p2 = body.pathPoints[i + 1];
          const segDist = Math.sqrt(
            (p2.x - p1.x) ** 2 +
            (p2.y - p1.y) ** 2 +
            ((p2.z || 0) - (p1.z || 0)) ** 2
          );
          lengthMeters += segDist;
        }
        lengthMeters = Math.round(lengthMeters * 100) / 100;
      }

      const connection = await prisma.technicalConnection.create({
        data: {
          projectId,
          floorId: body.floorId || null,
          code,
          name: body.name || `Conexión ${code}`,
          connectionType: body.connectionType || 'ELECTRICAL_CIRCUIT',
          fromElementId: body.fromElementId || null,
          toElementId: body.toElementId || null,
          fromZoneId: body.fromZoneId || null,
          toZoneId: body.toZoneId || null,
          pathPoints: body.pathPoints || [],
          lengthMeters,
          wireGaugeMm2: body.wireGaugeMm2 || null,
          cableCategory: body.cableCategory || null,
          pipeDiameterMm: body.pipeDiameterMm || null,
          conduitDiameterMm: body.conduitDiameterMm || null,
          channelingType: body.channelingType || 'RECESSED_WALL',
          status: body.status || 'PLANNED',
          metadata: body.metadata || {}
        }
      });

      return res.status(201).json({ success: true, data: connection });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Eliminar una conexión técnica
   */
  public static async deleteConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.technicalConnection.delete({ where: { id } });
      return res.json({ success: true, message: 'Conexión eliminada correctamente' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Obtener zonas y cuadros técnicos del proyecto
   */
  public static async getZones(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const zones = await prisma.technicalZone.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' }
      });

      const formatted: TechnicalZoneDto[] = zones.map((z: any) => ({
        id: z.id,
        projectId: z.projectId,
        floorId: z.floorId,
        roomId: z.roomId,
        code: z.code,
        name: z.name,
        zoneType: z.zoneType as any,
        position: { x: z.posX, y: z.posY, z: z.posZ },
        dimensions: { width: z.widthM, height: z.heightM, depth: z.depthM },
        capacityUnits: z.capacityUnits,
        usedUnits: z.usedUnits,
        mainSupplySpecs: (z.mainSupplySpecs as any) || {},
        status: z.status as any,
        metadata: (z.metadata as any) || {},
        createdAt: z.createdAt.toISOString(),
        updatedAt: z.updatedAt.toISOString()
      }));

      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Crear una nueva zona o cuadro técnico
   */
  public static async createZone(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const body = req.body;

      const count = await prisma.technicalZone.count({ where: { projectId } });
      const code = body.code || `ZONE-${(count + 1).toString().padStart(2, '0')}`;

      const zone = await prisma.technicalZone.create({
        data: {
          projectId,
          floorId: body.floorId || null,
          roomId: body.roomId || null,
          code,
          name: body.name || `Zona Técnica ${code}`,
          zoneType: body.zoneType || 'ELECTRICAL_PANEL',
          posX: body.position?.x ?? 0,
          posY: body.position?.y ?? 0,
          posZ: body.position?.z ?? 1.50,
          widthM: body.dimensions?.width ?? 0.40,
          heightM: body.dimensions?.height ?? 0.60,
          depthM: body.dimensions?.depth ?? 0.15,
          capacityUnits: body.capacityUnits || 24,
          usedUnits: body.usedUnits || 0,
          mainSupplySpecs: body.mainSupplySpecs || {},
          status: body.status || 'PLANNED',
          metadata: body.metadata || {}
        }
      });

      return res.status(201).json({ success: true, data: zone });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Eliminar una zona técnica
   */
  public static async deleteZone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.technicalZone.delete({ where: { id } });
      return res.json({ success: true, message: 'Zona técnica eliminada correctamente' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Obtener resumen consolidado de infraestructura técnica
   */
  public static async getSummary(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const elements = await prisma.technicalElement.findMany({ where: { projectId } });
      const connections = await prisma.technicalConnection.findMany({ where: { projectId } });
      const zones = await prisma.technicalZone.findMany({ where: { projectId } });

      const elDtos: TechnicalElementDto[] = elements.map((e: any) => ({
        id: e.id,
        projectId: e.projectId,
        floorId: e.floorId,
        roomId: e.roomId,
        wallId: e.wallId,
        furnitureId: e.furnitureId,
        retailProductId: e.retailProductId,
        code: e.code,
        name: e.name,
        category: e.category as any,
        mountingType: e.mountingType as any,
        status: e.status as any,
        protocol: e.protocol as any,
        position: { x: e.posX, y: e.posY, z: e.posZ },
        rotation: e.rotationDeg,
        dimensions: { width: e.widthM, height: e.heightM, depth: e.depthM },
        circuitId: e.circuitId,
        channelId: e.channelId,
        powerWatts: e.powerWatts,
        voltage: e.voltage,
        currentAmps: e.currentAmps,
        ipRating: e.ipRating,
        poePowered: e.poePowered,
        poeClass: e.poeClass,
        wifiBand: e.wifiBand as any,
        rfPowerDbm: e.rfPowerDbm,
        cameraFovDegrees: e.cameraFovDegrees,
        cameraRangeMeters: e.cameraRangeMeters,
        pipeDiameterMm: e.pipeDiameterMm,
        airflowM3h: e.airflowM3h,
        hvacCoolingKw: e.hvacCoolingKw,
        hvacHeatingKw: e.hvacHeatingKw,
        costItemId: e.costItemId,
        procurementItemId: e.procurementItemId,
        executionTaskId: e.executionTaskId,
        metadata: (e.metadata as any) || {},
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString()
      }));

      const conDtos: TechnicalConnectionDto[] = connections.map((c: any) => ({
        id: c.id,
        projectId: c.projectId,
        floorId: c.floorId,
        code: c.code,
        name: c.name,
        connectionType: c.connectionType as any,
        fromElementId: c.fromElementId,
        toElementId: c.toElementId,
        fromZoneId: c.fromZoneId,
        toZoneId: c.toZoneId,
        pathPoints: (c.pathPoints as any) || [],
        lengthMeters: c.lengthMeters,
        wireGaugeMm2: c.wireGaugeMm2,
        cableCategory: c.cableCategory,
        pipeDiameterMm: c.pipeDiameterMm,
        conduitDiameterMm: c.conduitDiameterMm,
        channelingType: c.channelingType as any,
        status: c.status as any,
        metadata: (c.metadata as any) || {},
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      }));

      const zoneDtos: TechnicalZoneDto[] = zones.map((z: any) => ({
        id: z.id,
        projectId: z.projectId,
        floorId: z.floorId,
        roomId: z.roomId,
        code: z.code,
        name: z.name,
        zoneType: z.zoneType as any,
        position: { x: z.posX, y: z.posY, z: z.posZ },
        dimensions: { width: z.widthM, height: z.heightM, depth: z.depthM },
        capacityUnits: z.capacityUnits,
        usedUnits: z.usedUnits,
        mainSupplySpecs: (z.mainSupplySpecs as any) || {},
        status: z.status as any,
        metadata: (z.metadata as any) || {},
        createdAt: z.createdAt.toISOString(),
        updatedAt: z.updatedAt.toISOString()
      }));

      const summary = TechnicalInfrastructureEngine.generateSummary(projectId, elDtos, conDtos, zoneDtos);
      return res.json({ success: true, data: summary });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Simular mapa de calor Wi-Fi
   */
  public static async simulateWiFi(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const elements = await prisma.technicalElement.findMany({ where: { projectId } });
      const elDtos: TechnicalElementDto[] = elements.map((e: any) => ({
        id: e.id,
        projectId: e.projectId,
        code: e.code,
        name: e.name,
        category: e.category as any,
        mountingType: e.mountingType as any,
        status: e.status as any,
        position: { x: e.posX, y: e.posY, z: e.posZ },
        rotation: e.rotationDeg,
        dimensions: { width: e.widthM, height: e.heightM, depth: e.depthM },
        rfPowerDbm: e.rfPowerDbm,
        metadata: {},
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString()
      }));

      const minX = Math.min(...elements.map((e: any) => e.posX), 0);
      const maxX = Math.max(...elements.map((e: any) => e.posX), 12);
      const minY = Math.min(...elements.map((e: any) => e.posY), 0);
      const maxY = Math.max(...elements.map((e: any) => e.posY), 10);

      const simulation = WiFiCoverageEngine.simulateCoverage(
        elDtos,
        projectId,
        { minX, minY, maxX, maxY },
        [],
        0.5
      );

      return res.json({ success: true, data: simulation });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Ejecutar validación normativa y espacial
   */
  public static async validate(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const elements = await prisma.technicalElement.findMany({ where: { projectId } });
      const connections = await prisma.technicalConnection.findMany({ where: { projectId } });
      const zones = await prisma.technicalZone.findMany({ where: { projectId } });

      const elDtos: TechnicalElementDto[] = elements.map((e: any) => ({
        id: e.id,
        projectId: e.projectId,
        code: e.code,
        name: e.name,
        category: e.category as any,
        mountingType: e.mountingType as any,
        status: e.status as any,
        position: { x: e.posX, y: e.posY, z: e.posZ },
        rotation: e.rotationDeg,
        dimensions: { width: e.widthM, height: e.heightM, depth: e.depthM },
        ipRating: e.ipRating,
        poePowered: e.poePowered,
        circuitId: e.circuitId,
        metadata: {},
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString()
      }));

      const conDtos: TechnicalConnectionDto[] = connections.map((c: any) => ({
        id: c.id,
        projectId: c.projectId,
        code: c.code,
        name: c.name,
        connectionType: c.connectionType as any,
        fromElementId: c.fromElementId,
        toElementId: c.toElementId,
        pathPoints: (c.pathPoints as any) || [],
        lengthMeters: c.lengthMeters,
        status: c.status as any,
        metadata: {},
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      }));

      const zoneDtos: TechnicalZoneDto[] = zones.map((z: any) => ({
        id: z.id,
        projectId: z.projectId,
        code: z.code,
        name: z.name,
        zoneType: z.zoneType as any,
        position: { x: z.posX, y: z.posY, z: z.posZ },
        dimensions: { width: z.widthM, height: z.heightM, depth: z.depthM },
        capacityUnits: z.capacityUnits,
        status: z.status as any,
        metadata: {},
        createdAt: z.createdAt.toISOString(),
        updatedAt: z.updatedAt.toISOString()
      }));

      const validation = TechnicalValidationEngine.validateInfrastructure(elDtos, conDtos, zoneDtos);
      return res.json({ success: true, data: validation });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Sincronizar un elemento técnico con V17 (CostItem), V18 (ProcurementItem) y V15 (ExecutionTask)
   */
  public static async syncElement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const element = await prisma.technicalElement.findUnique({ where: { id } });
      if (!element) {
        return res.status(404).json({ success: false, error: 'Elemento técnico no encontrado' });
      }

      const elDto: TechnicalElementDto = {
        id: element.id,
        projectId: element.projectId,
        code: element.code,
        name: element.name,
        category: element.category as any,
        mountingType: element.mountingType as any,
        status: element.status as any,
        position: { x: element.posX, y: element.posY, z: element.posZ },
        rotation: element.rotationDeg,
        dimensions: { width: element.widthM, height: element.heightM, depth: element.depthM },
        costItemId: element.costItemId,
        procurementItemId: element.procurementItemId,
        executionTaskId: element.executionTaskId,
        metadata: {},
        createdAt: element.createdAt.toISOString(),
        updatedAt: element.updatedAt.toISOString()
      };

      const costItemId = await TechnicalIntegrationService.syncWithFinancial(elDto, 45.0);
      const procItemId = await TechnicalIntegrationService.syncWithProcurement(elDto, 45.0);
      const execTaskId = await TechnicalIntegrationService.syncWithExecution(element.projectId, elDto);

      return res.json({
        success: true,
        data: {
          elementId: id,
          costItemId,
          procurementItemId: procItemId,
          executionTaskId: execTaskId
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
