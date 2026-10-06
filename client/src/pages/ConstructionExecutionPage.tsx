import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Layers,
  Clock,
  DollarSign,
  Package,
  FileSpreadsheet,
  AlertTriangle,
  FileEdit,
  ShieldCheck,
  Calendar,
  Camera,
  ArrowLeft,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import {
  ExecutionDashboardTab,
  ExecutionTasksTab,
  ExecutionCostTab,
  ExecutionProcurementTab,
  ExecutionDailyLogsTab,
  ExecutionIncidentsTab,
  ExecutionChangeOrdersTab,
  ExecutionQualityTab,
  ExecutionMilestonesTab,
  ExecutionPhotosTab,
  ExecutionClientViewModal,
  ExecutionContractorViewModal,
  ExecutionClosureModal,
} from '../features/execution/index.js';
import { executionService } from '../services/execution.service.js';
import { projectService } from '../services/project.service.js';
import {
  ExecutionProjectDto,
  ExecutionTaskStatus,
  ClientViewDto,
  ContractorViewDto,
} from '@hbd/shared';

export const ConstructionExecutionPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [execution, setExecution] = useState<ExecutionProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<string>('dashboard');

  // Modales
  const [isClientViewOpen, setIsClientViewOpen] = useState<boolean>(false);
  const [clientViewData, setClientViewData] = useState<ClientViewDto | null>(null);
  const [isContractorViewOpen, setIsContractorViewOpen] = useState<boolean>(false);
  const [contractorViewData, setContractorViewData] = useState<ContractorViewDto | null>(null);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadExecution(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const res = await projectService.getProjects();
      if (res.data && res.data.length > 0) {
        setProjects(res.data);
        const qpId = searchParams.get('projectId');
        const defaultId = qpId && res.data.some((p: any) => p.id === qpId) ? qpId : res.data[0].id;
        setSelectedProjectId(defaultId);
      }
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExecution = async (projId: string) => {
    try {
      setIsLoading(true);
      const res = await executionService.getExecutionProject(projId);
      if (res.data) {
        setExecution(res.data);
      }
    } catch (err) {
      console.error('Error al cargar ejecución:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string, status: ExecutionTaskStatus, progress: number) => {
    if (!execution) return;
    try {
      const res = await executionService.updateProgress(execution.id, {
        taskId,
        status,
        progress,
      });
      if (res.data) setExecution(res.data);
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
    }
  };

  const handleCreateDelivery = async (deliveryData: any) => {
    if (!execution) return;
    try {
      await executionService.createDelivery(execution.id, deliveryData);
      await loadExecution(selectedProjectId);
    } catch (err) {
      console.error('Error al registrar entrega:', err);
    }
  };

  const handleCreateDailyLog = async (logData: any) => {
    if (!execution) return;
    try {
      await executionService.createDailyLog(execution.id, logData);
      await loadExecution(selectedProjectId);
    } catch (err) {
      console.error('Error al registrar diario:', err);
    }
  };

  const handleCreateIncident = async (incidentData: any) => {
    if (!execution) return;
    try {
      await executionService.createIncident(execution.id, incidentData);
      await loadExecution(selectedProjectId);
    } catch (err) {
      console.error('Error al registrar incidencia:', err);
    }
  };

  const handleUpdateIncident = async (incidentId: string, data: any) => {
    try {
      await executionService.updateIncident(incidentId, data);
      await loadExecution(selectedProjectId);
    } catch (err) {
      console.error('Error al actualizar incidencia:', err);
    }
  };

  const handleCreateChangeOrder = async (data: any) => {
    if (!execution) return;
    try {
      await executionService.createChangeOrder(execution.id, data);
      await loadExecution(selectedProjectId);
    } catch (err) {
      console.error('Error al crear orden de cambio:', err);
    }
  };

  const handleUpdateChangeOrder = async (changeOrderId: string, data: any) => {
    try {
      await executionService.updateChangeOrder(changeOrderId, data);
      await loadExecution(selectedProjectId);
    } catch (err) {
      console.error('Error al procesar orden de cambio:', err);
    }
  };

  const handleCreateInspection = async (data: any) => {
    if (!execution) return;
    try {
      await executionService.createInspection(execution.id, data);
      await loadExecution(selectedProjectId);
    } catch (err) {
      console.error('Error al crear inspección:', err);
    }
  };

  const handleCreatePhoto = async (data: any) => {
    if (!execution) return;
    try {
      await executionService.createPhoto(execution.id, data);
      await loadExecution(selectedProjectId);
    } catch (err) {
      console.error('Error al guardar foto:', err);
    }
  };

  const handleCloseProject = async (data: { forceClose?: boolean; notes?: string }) => {
    if (!execution) return;
    await executionService.closeExecutionProject(execution.id, data);
    await loadExecution(selectedProjectId);
  };

  const handleOpenClientView = async () => {
    if (!execution) return;
    try {
      const res = await executionService.getClientView(execution.id);
      if (res.data) {
        setClientViewData(res.data);
        setIsClientViewOpen(true);
      }
    } catch (err) {
      console.error('Error al abrir vista de cliente:', err);
    }
  };

  const handleOpenContractorView = async () => {
    if (!execution) return;
    try {
      const res = await executionService.getContractorView(execution.id);
      if (res.data) {
        setContractorViewData(res.data);
        setIsContractorViewOpen(true);
      }
    } catch (err) {
      console.error('Error al abrir vista de contratista:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={t('execution.page.title', 'Ejecución de Obra & Gestión de Reforma')}
        subtitle={t('execution.page.subtitle')}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(`/construction?projectId=${selectedProjectId}`)}
          >
            {t('execution.backToPlanning')}
          </Button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Selector de Proyecto */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-surface border border-dark-border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-brand-400" /> {t('execution.projectLabel')}
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSearchParams({ projectId: e.target.value });
              }}
              className="text-xs font-bold bg-dark-card border border-dark-border rounded-xl px-3 py-1.5 text-white focus:ring-1 focus:ring-brand-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-400">{t('execution.statusLabel')}</span>
            <strong className="text-brand-400 font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30">
              {execution?.status || 'READY'}
            </strong>
          </div>
        </div>

        {/* Sub-Pestañas de Ejecución */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-dark-border/80 pb-3">
          {[
            { id: 'dashboard', label: t('execution.tabDashboard'), icon: Activity },
            { id: 'tasks', label: t('execution.tabTasks', { count: execution?.tasks.length || 0 }), icon: Layers },
            { id: 'cost', label: t('execution.tabCost'), icon: DollarSign },
            { id: 'procurement', label: t('execution.tabProcurement', { count: execution?.deliveries.length || 0 }), icon: Package },
            { id: 'dailyLogs', label: t('execution.tabDailyLogs', { count: execution?.dailyLogs.length || 0 }), icon: FileSpreadsheet },
            { id: 'incidents', label: t('execution.tabIncidents', { count: execution?.incidents.length || 0 }), icon: AlertTriangle },
            { id: 'changeOrders', label: t('execution.tabChangeOrders', { count: execution?.changeOrders.length || 0 }), icon: FileEdit },
            { id: 'quality', label: t('execution.tabQuality', { count: execution?.inspections.length || 0 }), icon: ShieldCheck },
            { id: 'milestones', label: t('execution.tabMilestones', { count: execution?.milestones.length || 0 }), icon: Calendar },
            { id: 'photos', label: t('execution.tabPhotos', { count: execution?.photos.length || 0 }), icon: Camera },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido según subpestaña */}
        {execution && activeSubTab === 'dashboard' && (
          <ExecutionDashboardTab
            execution={execution}
            onOpenClientView={handleOpenClientView}
            onOpenContractorView={handleOpenContractorView}
            onOpenClosureModal={() => setIsClosureModalOpen(true)}
            onSelectTab={(tabId) => setActiveSubTab(tabId)}
          />
        )}

        {execution && activeSubTab === 'tasks' && (
          <ExecutionTasksTab execution={execution} onUpdateTask={handleUpdateTask} />
        )}

        {execution && activeSubTab === 'cost' && <ExecutionCostTab execution={execution} />}

        {execution && activeSubTab === 'procurement' && (
          <ExecutionProcurementTab execution={execution} onCreateDelivery={handleCreateDelivery} />
        )}

        {execution && activeSubTab === 'dailyLogs' && (
          <ExecutionDailyLogsTab execution={execution} onCreateDailyLog={handleCreateDailyLog} />
        )}

        {execution && activeSubTab === 'incidents' && (
          <ExecutionIncidentsTab
            execution={execution}
            onCreateIncident={handleCreateIncident}
            onUpdateIncident={handleUpdateIncident}
          />
        )}

        {execution && activeSubTab === 'changeOrders' && (
          <ExecutionChangeOrdersTab
            execution={execution}
            onCreateChangeOrder={handleCreateChangeOrder}
            onUpdateChangeOrder={handleUpdateChangeOrder}
          />
        )}

        {execution && activeSubTab === 'quality' && (
          <ExecutionQualityTab execution={execution} onCreateInspection={handleCreateInspection} />
        )}

        {execution && activeSubTab === 'milestones' && <ExecutionMilestonesTab execution={execution} />}

        {execution && activeSubTab === 'photos' && (
          <ExecutionPhotosTab execution={execution} onCreatePhoto={handleCreatePhoto} />
        )}
      </div>

      {/* Modales Especiales */}
      <ExecutionClientViewModal
        isOpen={isClientViewOpen}
        onClose={() => setIsClientViewOpen(false)}
        clientView={clientViewData}
      />

      <ExecutionContractorViewModal
        isOpen={isContractorViewOpen}
        onClose={() => setIsContractorViewOpen(false)}
        contractorView={contractorViewData}
      />

      {execution && (
        <ExecutionClosureModal
          isOpen={isClosureModalOpen}
          onClose={() => setIsClosureModalOpen(false)}
          execution={execution}
          onCloseProject={handleCloseProject}
        />
      )}
    </div>
  );
};
