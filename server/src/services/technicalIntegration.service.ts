/**
 * HBD — HOME BOARD DESIGNER
 * Technical Infrastructure Cross-Engine Integration Service (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { prisma } from '../config/prisma.js';
import { TechnicalElementDto, TechnicalConnectionDto } from '@hbd/shared';

export class TechnicalIntegrationService {
  /**
   * Sincroniza un elemento técnico con el presupuesto financiero de V17 (CostItem)
   */
  public static async syncWithFinancial(
    element: TechnicalElementDto,
    estimatedCost: number = 45.0
  ): Promise<string | null> {
    try {
      if (element.costItemId) {
        // Actualizar item existente
        await prisma.costItem.update({
          where: { id: element.costItemId },
          data: {
            name: `${element.name} (${element.code})`,
            estimatedUnitCost: estimatedCost,
            estimatedTotalCost: estimatedCost
          }
        });
        return element.costItemId;
      }

      // Crear nuevo CostItem
      const subcategoryMap: Record<string, string> = {
        ELECTRICAL: 'Electricidad e Iluminación',
        LIGHTING: 'Electricidad e Iluminación',
        NETWORK: 'Telecomunicaciones y Red',
        WIFI: 'Telecomunicaciones y Red',
        SMART_HOME: 'Domótica y Automatización',
        SECURITY: 'Seguridad y Alarmas',
        HVAC: 'Climatización y Ventilación',
        PLUMBING: 'Fontanería y Saneamiento',
        MULTIMEDIA: 'Multimedia y Audio',
        TECHNICAL_ROOM: 'Cuadros e Instalaciones Generales'
      };

      const costItem = await prisma.costItem.create({
        data: {
          projectId: element.projectId,
          category: 'EQUIPMENT',
          subcategory: subcategoryMap[element.category] || 'Instalaciones Técnicas',
          name: `${element.name} (${element.code})`,
          description: `Elemento de infraestructura técnica: ${element.category} - Montaje: ${element.mountingType}`,
          unit: 'ud',
          quantity: 1,
          estimatedUnitCost: estimatedCost,
          estimatedTotalCost: estimatedCost,
          source: 'CONSTRUCTION_V11',
          sourceReference: element.id
        }
      });

      // Vincular con el elemento técnico
      await prisma.technicalElement.update({
        where: { id: element.id },
        data: { costItemId: costItem.id }
      });

      return costItem.id;
    } catch (err) {
      console.warn('Error syncing technical element with financial system:', err);
      return null;
    }
  }

  /**
   * Sincroniza un elemento técnico con el sistema de compras y aprovisionamiento de V18 (ProcurementItem)
   */
  public static async syncWithProcurement(
    element: TechnicalElementDto,
    estimatedCost: number = 45.0
  ): Promise<string | null> {
    try {
      if (element.procurementItemId) {
        await prisma.procurementItem.update({
          where: { id: element.procurementItemId },
          data: {
            description: `${element.name} [${element.code}]`,
            estimatedUnitCost: estimatedCost,
            estimatedTotalCost: estimatedCost
          }
        });
        return element.procurementItemId;
      }

      const procurementCategoryMap: Record<string, any> = {
        ELECTRICAL: 'ELECTRICAL',
        LIGHTING: 'LIGHTING',
        NETWORK: 'EQUIPMENT',
        WIFI: 'EQUIPMENT',
        SMART_HOME: 'APPLIANCE',
        SECURITY: 'EQUIPMENT',
        HVAC: 'EQUIPMENT',
        PLUMBING: 'PLUMBING',
        MULTIMEDIA: 'EQUIPMENT',
        TECHNICAL_ROOM: 'EQUIPMENT'
      };

      const procItem = await prisma.procurementItem.create({
        data: {
          projectId: element.projectId,
          description: `${element.name} [${element.code}]`,
          category: procurementCategoryMap[element.category] || 'EQUIPMENT',
          subcategory: element.category,
          quantity: 1,
          unit: 'ud',
          estimatedUnitCost: estimatedCost,
          estimatedTotalCost: estimatedCost,
          source: 'V11_CONSTRUCTION',
          sourceReference: element.id,
          status: 'NEEDED'
        }
      });

      await prisma.technicalElement.update({
        where: { id: element.id },
        data: { procurementItemId: procItem.id }
      });

      return procItem.id;
    } catch (err) {
      console.warn('Error syncing technical element with procurement:', err);
      return null;
    }
  }

  /**
   * Sincroniza rozas, canalizaciones e instalación con la ejecución de obra V15 (ExecutionTask)
   */
  public static async syncWithExecution(
    projectId: string,
    element: TechnicalElementDto
  ): Promise<string | null> {
    try {
      const execProject = await prisma.executionProject.findFirst({
        where: { projectId }
      });

      if (!execProject) return null;

      if (element.executionTaskId) {
        return element.executionTaskId;
      }

      const task = await prisma.executionTask.create({
        data: {
          executionId: execProject.id,
          name: `Instalación y conexionado de ${element.name} (${element.code})`,
          description: `Montaje en cota Z=${element.position.z}m. Categoría: ${element.category}`,
          status: 'NOT_STARTED',
          plannedDurationDays: 1
        }
      });

      await prisma.technicalElement.update({
        where: { id: element.id },
        data: { executionTaskId: task.id }
      });

      return task.id;
    } catch (err) {
      console.warn('Error syncing technical element with execution tasks:', err);
      return null;
    }
  }
}
