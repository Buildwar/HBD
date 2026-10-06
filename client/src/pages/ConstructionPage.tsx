import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Hammer,
  Layers,
  Calendar,
  Calculator,
  Scale,
  FileText,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { Input } from '../components/ui/Input.js';
import {
  ConstructionTimeline,
  ConstructionItemsTable,
  ConstructionComparisonModal,
  ConstructionReportModal,
} from '../features/construction/index.js';
import { constructionService } from '../services/construction.service.js';
import { projectService } from '../services/project.service.js';
import {
  ConstructionProjectDto,
  ConstructionComparisonResult,
  ConstructionReportDto,
  ConstructionTaskStatus,
} from '@hbd/shared';

export const ConstructionPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [construction, setConstruction] = useState<ConstructionProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'items'>('timeline');

  // Modales
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<ConstructionComparisonResult | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ConstructionReportDto | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [selectedPhaseIdForTask, setSelectedPhaseIdForTask] = useState<string>('');

  // Form nueva partida
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('MASONRY');
  const [newItemOperation, setNewItemOperation] = useState<string>('CONSTRUCTION');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>('m2');
  const [newItemWaste, setNewItemWaste] = useState<number>(5);
  const [newItemMaterialCost, setNewItemMaterialCost] = useState<number>(0);
  const [newItemLaborCost, setNewItemLaborCost] = useState<number>(0);
  const [newItemOtherCost, setNewItemOtherCost] = useState<number>(0);

  // Form nueva tarea
  const [newTaskName, setNewTaskName] = useState<string>('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadConstructionProject(selectedProjectId);
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

  const loadConstructionProject = async (projId: string) => {
    try {
      setIsLoading(true);
      const res = await constructionService.getConstructionProject(projId);
      if (res.data) {
        setConstruction(res.data);
      }
    } catch (err) {
      console.error('Error al cargar obra:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, newStatus: ConstructionTaskStatus) => {
    try {
      await constructionService.updateTask(taskId, { status: newStatus });
      if (selectedProjectId) await loadConstructionProject(selectedProjectId);
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
    }
  };

  const handleToggleChecklist = async (checklistId: string, currentDone: boolean) => {
    try {
      await constructionService.toggleChecklistItem(checklistId, { isDone: !currentDone });
      if (selectedProjectId) await loadConstructionProject(selectedProjectId);
    } catch (err) {
      console.error('Error al actualizar checklist:', err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !selectedProjectId) return;

    try {
      await constructionService.createItem(selectedProjectId, {
        name: newItemName,
        category: newItemCategory,
        operation: newItemOperation,
        quantity: newItemQty,
        unit: newItemUnit,
        wastePercent: newItemWaste,
        materialCost: newItemMaterialCost,
        laborCost: newItemLaborCost,
        otherCost: newItemOtherCost,
      });

      setIsNewItemModalOpen(false);
      setNewItemName('');
      await loadConstructionProject(selectedProjectId);
    } catch (err) {
      console.error('Error al crear partida:', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await constructionService.deleteItem(itemId);
      if (selectedProjectId) await loadConstructionProject(selectedProjectId);
    } catch (err) {
      console.error('Error al eliminar partida:', err);
    }
  };

  const handleOpenComparison = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await constructionService.getComparison(selectedProjectId);
      if (res.data) {
        setComparisonData(res.data);
        setIsComparisonOpen(true);
      }
    } catch (err) {
      console.error('Error al obtener comparativa:', err);
    }
  };

  const handleOpenReport = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await constructionService.getReport(selectedProjectId);
      if (res.data) {
        setReportData(res.data);
        setIsReportOpen(true);
      }
    } catch (err) {
      console.error('Error al generar informe:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !selectedPhaseIdForTask) return;

    try {
      await constructionService.createTask(selectedPhaseIdForTask, {
        name: newTaskName,
      });
      setIsNewTaskModalOpen(false);
      setNewTaskName('');
      if (selectedProjectId) await loadConstructionProject(selectedProjectId);
    } catch (err) {
      console.error('Error al crear tarea:', err);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={t('nav.construction', 'Planificación y Reforma')}
        subtitle={t('construction.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Scale size={15} />}
              onClick={handleOpenComparison}
            >
              {t('construction.compare')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<FileText size={15} />}
              onClick={handleOpenReport}
            >
              {t('construction.report')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white"
              icon={<Activity size={15} />}
              onClick={() => navigate(`/execution?projectId=${selectedProjectId}`)}
            >
              {t('construction.execution')}
            </Button>
          </div>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Selector de Proyecto y Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-dark-surface border-dark-border space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-brand-400" /> {t('construction.project')}
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSearchParams({ projectId: e.target.value });
              }}
              className="w-full text-xs font-bold bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-brand-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Card>

          <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator size={14} className="text-emerald-400" /> {t('construction.totalBudget')}
            </span>
            <p className="text-xl font-black text-white mt-1">
              {construction?.grandTotalCost ? `${construction.grandTotalCost.toFixed(2)} €` : '0.00 €'}
            </p>
            <p className="text-[11px] text-gray-400">
              {t('construction.matCost', { cost: construction?.totalMaterialCost.toFixed(0) })} • {t('construction.laborCost', { cost: construction?.totalLaborCost.toFixed(0) })}
            </p>
          </Card>

          <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-sky-400" /> {t('construction.taskProgress')}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xl font-black text-sky-400">
                {construction?.progressPercent || 0}%
              </p>
              <div className="flex-1 bg-dark-card rounded-full h-2 overflow-hidden border border-dark-border">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${construction?.progressPercent || 0}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400">
              {t('construction.status')} <span className="text-gray-200 font-semibold">{construction?.status}</span>
            </p>
          </Card>

          <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} /> {t('construction.proValidation')}
            </span>
            <p className="text-xl font-black text-amber-400 mt-1">
              {construction?.proValidationWarningsCount || 0}
            </p>
            <p className="text-[11px] text-gray-400">{t('construction.itemsReqSupervision')}</p>
          </Card>
        </div>

        {/* Pestañas de Vista */}
        <div className="flex items-center gap-2 border-b border-dark-border/80 pb-3">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            <Calendar size={14} /> {t('construction.tabTimeline')}
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'items'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            <Calculator size={14} /> {t('construction.tabItems')} ({construction?.items.length || 0})
          </button>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === 'timeline' && construction && (
          <ConstructionTimeline
            phases={construction.phases}
            onToggleTask={handleToggleTask}
            onToggleChecklist={handleToggleChecklist}
            onAddTask={(phaseId) => {
              setSelectedPhaseIdForTask(phaseId);
              setIsNewTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === 'items' && construction && (
          <ConstructionItemsTable
            items={construction.items}
            onDeleteItem={handleDeleteItem}
            onAddItemClick={() => setIsNewItemModalOpen(true)}
          />
        )}
      </div>

      {/* Modales */}
      <ConstructionComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        comparison={comparisonData}
      />

      <ConstructionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={reportData}
      />

      {/* Modal Nueva Partida */}
      <Modal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        title={t('construction.newItemTitle')}
        maxWidth="md"
      >
        <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">{t('construction.itemName')}</label>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={t('construction.itemNamePlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">{t('construction.category')}</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white"
              >
                <option value="DEMOLITION">{t('construction.catDemolition')}</option>
                <option value="MASONRY">{t('construction.catMasonry')}</option>
                <option value="FLOORING">{t('construction.catFlooring')}</option>
                <option value="WALL_FINISH">{t('construction.catWallFinish')}</option>
                <option value="ELECTRICAL">{t('construction.catElectrical')}</option>
                <option value="PLUMBING">{t('construction.catPlumbing')}</option>
                <option value="HVAC">{t('construction.catHVAC')}</option>
                <option value="DOORS">{t('construction.catDoors')}</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">{t('construction.operation')}</label>
              <select
                value={newItemOperation}
                onChange={(e) => setNewItemOperation(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white"
              >
                <option value="DEMOLITION">{t('construction.opDemolish')}</option>
                <option value="CONSTRUCTION">{t('construction.opConstruct')}</option>
                <option value="INSTALLATION">{t('construction.opInstall')}</option>
                <option value="FINISHING">{t('construction.opFinish')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">{t('construction.measurement')}</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={newItemQty}
                onChange={(e) => setNewItemQty(parseFloat(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">{t('construction.unit')}</label>
              <Input
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder={t('construction.unitPlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">{t('construction.wastePercent')}</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newItemWaste}
                onChange={(e) => setNewItemWaste(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">{t('construction.matCostUnit')}</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newItemMaterialCost}
                onChange={(e) => setNewItemMaterialCost(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">{t('construction.laborCostUnit')}</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newItemLaborCost}
                onChange={(e) => setNewItemLaborCost(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsNewItemModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('construction.saveItem')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Nueva Tarea */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title={t('construction.newTaskTitle')}
        maxWidth="sm"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">{t('construction.taskDesc')}</label>
            <Input
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder={t('construction.taskDescPlaceholder')}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsNewTaskModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('construction.addTask')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
