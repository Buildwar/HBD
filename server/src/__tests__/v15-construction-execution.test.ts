import test, { describe } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  APP_METADATA,
  ConstructionExecutionEngine,
  ProgressTrackingEngine,
  ExecutionCostEngine,
  MaterialExecutionEngine,
  SiteManagementEngine,
  ConstructionProjectDto,
  ExecutionProjectDto,
  ExecutionTaskDto,
  WorkPackageDto,
  MaterialExecutionItemDto,
  MaterialDeliveryDto,
  PurchaseOrderDto,
  ExecutionInvoiceDto,
  ConstructionIncidentDto,
  ConstructionChangeOrderDto,
  QualityInspectionDto,
} from '@hbd/shared';

describe('🧪 HBD V15.0.0 — SUITE DE PRUEBAS DE EJECUCIÓN DE OBRA Y GESTIÓN DE REFORMA', () => {
  describe('--- 1. Identidad Centralizada, Autoría y Versión 15.0.0 ---', () => {
    test('Autor oficial debe ser "Adrián Palma"', () => {
      assert.strictEqual(APP_METADATA.author, 'Adrián Palma');
    });

    test('Versión global debe ser válida', () => {
      assert.ok(Boolean(APP_METADATA.version));
    });

    test('Año de copyright debe ser 2026', () => {
      assert.strictEqual(APP_METADATA.copyrightYear, 2026);
    });

    test('Copyright oficial debe incluir a Adrián Palma', () => {
      assert.ok(APP_METADATA.copyright.includes('Adrián Palma'));
      assert.ok(APP_METADATA.copyright.includes('2026'));
    });
  });

  describe('--- 2. Motor de Ejecución de Obra (ConstructionExecutionEngine) ---', () => {
    const mockConstruction: ConstructionProjectDto = {
      id: 'cp-test-1',
      projectId: 'proj-1',
      status: 'PLANNING',
      phases: [
        {
          id: 'phase-demo',
          constructionId: 'cp-test-1',
          name: 'Demolición y Desescombro',
          order: 1,
          status: 'TODO',
          estimatedDurationDays: 5,
          dependencies: [],
          tasks: [
            {
              id: 'task-1',
              phaseId: 'phase-demo',
              name: 'Demoler tabique cocina',
              status: 'TODO',
              order: 1,
              dependencies: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'task-2',
              phaseId: 'phase-demo',
              name: 'Retirada de escombros a vertedero',
              status: 'TODO',
              order: 2,
              dependencies: ['task-1'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          checklists: [],
          totalCost: 1500,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      items: [
        {
          id: 'item-1',
          constructionId: 'cp-test-1',
          category: 'DEMOLITION',
          operation: 'DEMOLITION',
          name: 'Demolición de tabique cerámico',
          quantity: 15,
          unit: 'm2',
          wastePercent: 5,
          effectiveQuantity: 15.75,
          materialCost: 0,
          laborCost: 20,
          otherCost: 5,
          totalCost: 393.75,
          confidence: 'GEOMETRY_CALCULATED',
          requiresProValidation: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      documents: [],
      totalMaterialCost: 0,
      totalLaborCost: 300,
      totalOtherCost: 75,
      grandTotalCost: 393.75,
      progressPercent: 0,
      proValidationWarningsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    test('Crea un ExecutionProject a partir de ConstructionProject V11 conservando trazabilidad V12/V13', () => {
      const execution = ConstructionExecutionEngine.createExecutionFromConstruction({
        projectId: 'proj-1',
        construction: mockConstruction,
        scenarioId: 'scen-v12-alpha',
        alternativeId: 'alt-v13-candidate-1',
        startDate: '2026-10-15T08:00:00.000Z',
      });

      assert.ok(execution.id);
      assert.strictEqual(execution.projectId, 'proj-1');
      assert.strictEqual(execution.constructionProjectId, 'cp-test-1');
      assert.strictEqual(execution.scenarioId, 'scen-v12-alpha');
      assert.strictEqual(execution.alternativeId, 'alt-v13-candidate-1');
      assert.strictEqual(execution.status, 'READY');
      assert.strictEqual(execution.workPackages.length, 1);
      assert.strictEqual(execution.tasks.length, 2);
      assert.strictEqual(execution.materials.length, 1);
      assert.ok(execution.milestones.length >= 2);
    });
  });

  describe('--- 3. Motor de Progreso y Desviaciones Temporales ---', () => {
    const tasks: ExecutionTaskDto[] = [
      {
        id: 't-1',
        executionId: 'exec-1',
        name: 'Tarea 1',
        status: 'COMPLETED',
        progress: 100,
        plannedDurationDays: 2,
        actualDurationDays: 2,
        assigneeType: 'WORKER',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 't-2',
        executionId: 'exec-1',
        name: 'Tarea 2',
        status: 'IN_PROGRESS',
        progress: 50,
        plannedDurationDays: 4,
        actualDurationDays: 2,
        assigneeType: 'WORKER',
        createdAt: '',
        updatedAt: '',
      },
    ];

    test('Calcula progreso global ponderado por duración de tareas', () => {
      // T1: 100% de 2d = 2d; T2: 50% de 4d = 2d. Total: 4d de 6d = 66.6% -> 67%
      const prog = ProgressTrackingEngine.calculateGlobalProgress({ tasks, method: 'WEIGHTED_DURATION' });
      assert.strictEqual(prog, 67);
    });

    test('Calcula progreso de WorkPackage', () => {
      const wp: WorkPackageDto = {
        id: 'wp-1',
        executionId: 'exec-1',
        name: 'Paquete Demolición',
        order: 1,
        status: 'IN_PROGRESS',
        progress: 0,
        tasks,
        createdAt: '',
        updatedAt: '',
      };
      const prog = ProgressTrackingEngine.calculateWorkPackageProgress(wp, 'WEIGHTED_DURATION');
      assert.strictEqual(prog, 67);
    });

    test('Calcula ScheduleVariance con detección de holgura o retraso', () => {
      const variance = ProgressTrackingEngine.calculateScheduleVariance({
        startDate: '2026-10-01T00:00:00.000Z',
        plannedEndDate: '2026-10-10T00:00:00.000Z',
        tasks,
      });

      assert.ok(variance.plannedDurationDays >= 9);
      assert.ok(variance.status === 'ON_TRACK' || variance.status === 'AT_RISK');
    });
  });

  describe('--- 4. Control de Costes y Desviaciones (ExecutionCostEngine) ---', () => {
    const materials: MaterialExecutionItemDto[] = [
      {
        id: 'm-1',
        executionId: 'exec-1',
        name: 'Gres Porcelánico',
        category: 'FLOORING',
        unit: 'm2',
        plannedQuantity: 50,
        orderedQuantity: 50,
        receivedQuantity: 50,
        usedQuantity: 25,
        wasteQuantity: 2,
        remainingQuantity: 23,
        unitCost: 30,
        totalCommittedCost: 1500,
        totalActualCost: 810, // 27m2 * 30
        status: 'IN_USE',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const purchaseOrders: PurchaseOrderDto[] = [
      {
        id: 'po-1',
        executionId: 'exec-1',
        supplierName: 'Azulejos del Norte',
        reference: 'PED-2026-001',
        status: 'RECEIVED',
        orderDate: '2026-10-01',
        totalAmount: 1500,
        createdAt: '',
        updatedAt: '',
      },
    ];

    const invoices: ExecutionInvoiceDto[] = [
      {
        id: 'inv-1',
        executionId: 'exec-1',
        supplierName: 'Azulejos del Norte',
        reference: 'FACT-0987',
        issueDate: '2026-10-05',
        amount: 1500,
        taxAmount: 315,
        totalAmount: 1815,
        status: 'PAID',
        createdAt: '',
        updatedAt: '',
      },
    ];

    test('Calcula Budget vs Committed vs Invoiced vs Paid vs Variance con desglose', () => {
      const costVariance = ExecutionCostEngine.calculateCostVariance({
        initialBudget: 1500,
        v11Budget: 1500,
        materials,
        purchaseOrders,
        invoices,
      });

      assert.strictEqual(costVariance.v11Budget, 1500);
      assert.strictEqual(costVariance.committedCost, 1500);
      assert.strictEqual(costVariance.invoicedCost, 1815);
      assert.strictEqual(costVariance.paidCost, 1815);
      assert.strictEqual(costVariance.actualCost, 1815);
      assert.strictEqual(costVariance.varianceAbsolute, 315);
      assert.strictEqual(costVariance.byCategory.length, 1);
      assert.strictEqual(costVariance.bySupplier.length, 1);
    });
  });

  describe('--- 5. Gestión de Materiales y Albaranes (MaterialExecutionEngine) ---', () => {
    test('Reconcilia entregas recibidas con inventario en obra y calcula merma', () => {
      const initialMaterials: MaterialExecutionItemDto[] = [
        {
          id: 'mat-1',
          executionId: 'exec-1',
          name: 'Placas de Pladur',
          category: 'MASONRY',
          unit: 'ud',
          plannedQuantity: 40,
          orderedQuantity: 0,
          receivedQuantity: 0,
          usedQuantity: 10,
          wasteQuantity: 1,
          remainingQuantity: 0,
          unitCost: 12,
          totalCommittedCost: 0,
          totalActualCost: 0,
          status: 'PLANNED',
          createdAt: '',
          updatedAt: '',
        },
      ];

      const deliveries: MaterialDeliveryDto[] = [
        {
          id: 'del-1',
          executionId: 'exec-1',
          materialItemId: 'mat-1',
          materialName: 'Placas de Pladur',
          expectedDate: '2026-10-02',
          quantity: 40,
          unit: 'ud',
          status: 'DELIVERED',
          createdAt: '',
          updatedAt: '',
        },
      ];

      const reconciled = MaterialExecutionEngine.reconcileMaterialDeliveries(initialMaterials, deliveries);
      assert.strictEqual(reconciled[0].receivedQuantity, 40);
      assert.strictEqual(reconciled[0].remainingQuantity, 29); // 40 - 10 - 1
      assert.strictEqual(reconciled[0].status, 'IN_USE');

      const metrics = MaterialExecutionEngine.calculateMaterialMetrics(reconciled, deliveries);
      assert.strictEqual(metrics.totalPlanned, 40);
      assert.strictEqual(metrics.totalReceived, 40);
      assert.strictEqual(metrics.totalUsed, 10);
      assert.strictEqual(metrics.totalWaste, 1);
    });
  });

  describe('--- 6. Incidencias, Seguridad y Advertencia Profesional ---', () => {
    test('Incidencias SAFETY o STRUCTURAL exigen supervisión técnica colegiada', () => {
      const incident = SiteManagementEngine.processIncident({
        title: 'Fisura en muro de carga al abrir hueco',
        type: 'STRUCTURAL',
        priority: 'CRITICAL',
      });

      assert.strictEqual(incident.requiresProReview, true);
      assert.ok(incident.proReviewNotes?.includes('arquitecto/aparejador colegiado'));
    });
  });

  describe('--- 7. Órdenes de Cambio y Aprobaciones ---', () => {
    test('Calcula impacto y actualiza estado tras aprobación', () => {
      const changeOrder: ConstructionChangeOrderDto = {
        id: 'co-1',
        executionId: 'exec-1',
        code: 'CO-001',
        title: 'Ampliación de puntos de luz en salón',
        description: 'Se añaden 4 tomas de corriente y 2 apliques de pared',
        reason: 'Petición de cliente',
        status: 'PENDING_APPROVAL',
        impact: { costImpact: 350, timeImpactDays: 1 },
        requestedBy: 'Cliente',
        requestDate: '2026-10-05',
        approvals: [],
        affectedTaskIds: [],
        affectedItemIds: [],
        documents: [],
        createdAt: '',
        updatedAt: '',
      };

      const result = SiteManagementEngine.processApprovalDecision(changeOrder, {
        requestedBy: 'Cliente',
        approvedBy: 'Adrián Palma',
        decision: 'APPROVED',
        comments: 'Aprobado conforme a presupuesto adicional',
      });

      assert.strictEqual(result.updatedChangeOrder.status, 'APPROVED');
      assert.strictEqual(result.updatedChangeOrder.approvals.length, 1);
      assert.strictEqual(result.newApproval.decision, 'APPROVED');
    });
  });

  describe('--- 8. Vistas Especiales (Cliente vs Contratista) ---', () => {
    test('Genera ClientView sin exponer detalles internos de subcontratas ni costes internos', () => {
      const mockExec: ExecutionProjectDto = {
        id: 'exec-1',
        projectId: 'proj-1',
        status: 'IN_PROGRESS',
        progress: 45,
        workPackages: [],
        tasks: [],
        materials: [],
        deliveries: [],
        purchaseOrders: [],
        invoices: [],
        dailyLogs: [],
        incidents: [],
        changeOrders: [],
        inspections: [],
        milestones: [
          {
            id: 'ms-1',
            executionId: 'exec-1',
            title: 'Fin Demoliciones',
            targetDate: '2026-10-01',
            status: 'COMPLETED',
            order: 1,
            createdAt: '',
            updatedAt: '',
          },
        ],
        photos: [],
        health: {
          scheduleStatus: 'ON_TRACK',
          costStatus: 'ON_TRACK',
          progressStatus: 'ON_TRACK',
          materialStatus: 'ON_TRACK',
          incidentStatus: 'ON_TRACK',
          qualityStatus: 'ON_TRACK',
          explanations: { schedule: '', cost: '', progress: '', material: '', incident: '', quality: '' },
        },
        scheduleVariance: {
          plannedDurationDays: 30,
          actualDurationDays: 14,
          remainingDurationDays: 16,
          delayDays: 0,
          delayPercent: 0,
          status: 'ON_TRACK',
          phaseVariances: [],
        },
        costVariance: {
          initialBudget: 25000,
          v11Budget: 25000,
          committedCost: 20000,
          invoicedCost: 10000,
          paidCost: 10000,
          actualCost: 10000,
          remainingCost: 15000,
          varianceAbsolute: 0,
          variancePercent: 0,
          status: 'ON_TRACK',
          byCategory: [],
          bySupplier: [],
        },
        createdAt: '',
        updatedAt: '',
      };

      const clientView = ConstructionExecutionEngine.buildClientView(mockExec, 'Reforma Integral Casa Palma');
      assert.strictEqual(clientView.projectName, 'Reforma Integral Casa Palma');
      assert.strictEqual(clientView.progress, 45);
      assert.strictEqual(clientView.completedMilestones.length, 1);
      assert.ok(clientView.budgetSummary);
      assert.strictEqual(clientView.budgetSummary.initialBudget, 25000);
    });
  });

  describe('--- 9. Validación y Cierre de Obra (ProjectClosure) ---', () => {
    test('Bloquea el cierre si hay tareas pendientes o incidencias críticas abiertas', () => {
      const mockExecWithBlockers: ExecutionProjectDto = {
        id: 'exec-1',
        projectId: 'proj-1',
        status: 'IN_PROGRESS',
        progress: 80,
        workPackages: [],
        tasks: [
          {
            id: 't-pending',
            executionId: 'exec-1',
            name: 'Pintura final salón',
            status: 'IN_PROGRESS',
            progress: 50,
            plannedDurationDays: 2,
            actualDurationDays: 1,
            assigneeType: 'WORKER',
            createdAt: '',
            updatedAt: '',
          },
        ],
        materials: [],
        deliveries: [],
        purchaseOrders: [],
        invoices: [],
        dailyLogs: [],
        incidents: [
          {
            id: 'inc-crit',
            executionId: 'exec-1',
            title: 'Fuga de agua en llave de paso',
            description: 'Gotera constante',
            type: 'INSTALLATION',
            priority: 'CRITICAL',
            status: 'OPEN',
            dateReported: '',
            photos: [],
            documents: [],
            requiresProReview: false,
            createdAt: '',
            updatedAt: '',
          },
        ],
        changeOrders: [],
        inspections: [],
        milestones: [],
        photos: [],
        health: {} as any,
        scheduleVariance: {} as any,
        costVariance: {} as any,
        createdAt: '',
        updatedAt: '',
      };

      const checklist = SiteManagementEngine.validateProjectClosure(mockExecWithBlockers);
      assert.strictEqual(checklist.canClose, false);
      assert.ok(checklist.blockers.length >= 2);
    });
  });

  describe('--- 10. Integración V14: Generación de Datos de Informe Final ---', () => {
    test('Construye estructura de informe final compatible con DocumentEngine', () => {
      const mockExec: ExecutionProjectDto = {
        id: 'exec-final',
        projectId: 'proj-1',
        status: 'CLOSED',
        progress: 100,
        workPackages: [],
        tasks: [],
        materials: [],
        deliveries: [],
        purchaseOrders: [],
        invoices: [],
        dailyLogs: [],
        incidents: [],
        changeOrders: [],
        inspections: [],
        milestones: [],
        photos: [],
        health: {} as any,
        scheduleVariance: { plannedDurationDays: 20, actualDurationDays: 20, remainingDurationDays: 0, delayDays: 0, delayPercent: 0, status: 'ON_TRACK', phaseVariances: [] },
        costVariance: { initialBudget: 15000, v11Budget: 15000, committedCost: 15000, invoicedCost: 15000, paidCost: 15000, actualCost: 15000, remainingCost: 0, varianceAbsolute: 0, variancePercent: 0, status: 'ON_TRACK', byCategory: [], bySupplier: [] },
        createdAt: '',
        updatedAt: '',
      };

      const reportPayload = SiteManagementEngine.buildFinalReportPayload({
        execution: mockExec,
        projectName: 'Ático Retiro',
        authorName: 'Adrián Palma',
      });

      assert.ok(reportPayload.title.includes('Ático Retiro'));
      assert.strictEqual(reportPayload.progress, 100);
      assert.strictEqual(reportPayload.status, 'CLOSED');
      assert.ok(reportPayload.legalDisclaimer.includes('LOE'));
    });
  });

  describe('--- 11. Simetría de Internacionalización (es.json vs en.json) ---', () => {
    test('Verifica que todos los namespaces V15 existen en ES y EN con idéntica estructura', () => {
      const esPath = path.resolve(__dirname, '../../../client/src/i18n/locales/es.json');
      const enPath = path.resolve(__dirname, '../../../client/src/i18n/locales/en.json');
      const es = JSON.parse(fs.readFileSync(esPath, 'utf-8'));
      const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

      const namespaces = [
        'execution',
        'site',
        'progress',
        'incidents',
        'changeOrders',
        'procurement',
        'quality',
        'milestones',
        'closure',
      ];

      for (const ns of namespaces) {
        assert.ok(es[ns], `Namespace ${ns} debe existir en es.json`);
        assert.ok(en[ns], `Namespace ${ns} debe existir en en.json`);
        assert.deepStrictEqual(
          Object.keys(es[ns]).sort(),
          Object.keys(en[ns]).sort(),
          `Claves del namespace ${ns} deben ser simétricas entre ES y EN`
        );
      }
    });
  });

  describe('--- 12. Auditoría de Centralización de Versión en "Acerca de" ---', () => {
    test('Sidebar y vistas NO contienen badges de versión V15', () => {
      const sidebarPath = path.resolve(__dirname, '../../../client/src/components/layout/Sidebar.tsx');
      const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
      assert.ok(!sidebarContent.includes("badge: 'V15'"));
      assert.ok(!sidebarContent.includes('V15.0.0'));
    });
  });
});
