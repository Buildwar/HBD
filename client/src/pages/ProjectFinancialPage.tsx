/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Project Financial Page — Project Investment & Total Cost Intelligence Dashboard
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FinancialService,
} from '../services/financial.service.js';
import {
  FinancialSummaryDto,
  FinancialForecastDto,
  CostItemDto,
  PropertyAcquisitionDto,
  ProjectPaymentDto,
  CreateCostItemInput,
  UpdateCostItemInput,
  CreatePaymentInput,
  SavePropertyAcquisitionInput,
  CostCategory,
} from '@hbd/shared';
import {
  FinancialSummaryCards,
  FinancialTransformationChart,
  FinancialCategoryTab,
  FinancialRoomsTab,
  FinancialCostItemsTable,
  FinancialPaymentsTab,
  FinancialForecastTab,
  FinancialAcquisitionModal,
  FinancialCostModal,
  FinancialPaymentModal,
} from '../features/financial/index.js';
import {
  ArrowLeft,
  DollarSign,
  RefreshCw,
  Building2,
  Plus,
  Camera,
  Layers,
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  DoorOpen,
  PieChart,
} from 'lucide-react';

type TabType = 'overview' | 'items' | 'rooms' | 'payments' | 'forecast';

export const ProjectFinancialPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [summary, setSummary] = useState<FinancialSummaryDto | null>(null);
  const [forecast, setForecast] = useState<FinancialForecastDto | null>(null);
  const [items, setItems] = useState<CostItemDto[]>([]);
  const [acquisition, setAcquisition] = useState<PropertyAcquisitionDto | null>(null);
  const [payments, setPayments] = useState<ProjectPaymentDto[]>([]);

  // Modals state
  const [isAcqModalOpen, setIsAcqModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostItemDto | null>(null);
  const [paymentItem, setPaymentItem] = useState<CostItemDto | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [sumRes, itemsRes, acqRes, payRes, foreRes] = await Promise.all([
        FinancialService.getSummary(projectId).catch(() => null),
        FinancialService.getItems(projectId).catch(() => []),
        FinancialService.getAcquisition(projectId).catch(() => null),
        FinancialService.getPayments(projectId).catch(() => []),
        FinancialService.getForecast(projectId).catch(() => null),
      ]);

      if (sumRes) setSummary(sumRes);
      setItems(itemsRes);
      setAcquisition(acqRes);
      setPayments(payRes);
      if (foreRes) setForecast(foreRes);
    } catch (error: any) {
      showNotification(`Error cargando datos financieros: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [projectId]);

  const handleSync = async () => {
    if (!projectId) return;
    try {
      setSyncing(true);
      const res = await FinancialService.syncFinancials(projectId, {
        includeV11Construction: true,
        includeV15Execution: true,
        includeV16Products: true,
        includeV5Furniture: true,
      });
      showNotification(res.message || 'Sincronización financiera completada.', 'success');
      await loadAllData();
    } catch (error: any) {
      showNotification(`Error en la sincronización: ${error.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveAcquisition = async (data: SavePropertyAcquisitionInput) => {
    if (!projectId) return;
    try {
      await FinancialService.saveAcquisition(projectId, data);
      showNotification('Adquisición del inmueble guardada correctamente.', 'success');
      await loadAllData();
    } catch (error: any) {
      showNotification(`Error guardando adquisición: ${error.message}`, 'error');
      throw error;
    }
  };

  const handleDeleteAcquisition = async () => {
    if (!projectId) return;
    if (!window.confirm('¿Seguro que deseas eliminar los datos de adquisición del inmueble?')) return;
    try {
      await FinancialService.deleteAcquisition(projectId);
      showNotification('Datos de adquisición eliminados.', 'success');
      setIsAcqModalOpen(false);
      await loadAllData();
    } catch (error: any) {
      showNotification(`Error eliminando adquisición: ${error.message}`, 'error');
    }
  };

  const handleSaveCostItem = async (data: CreateCostItemInput | UpdateCostItemInput) => {
    if (!projectId) return;
    try {
      if (editingItem) {
        await FinancialService.updateItem(projectId, editingItem.id, data as UpdateCostItemInput);
        showNotification('Partida de coste actualizada.', 'success');
      } else {
        await FinancialService.createItem(projectId, data as CreateCostItemInput);
        showNotification('Nueva partida de coste creada.', 'success');
      }
      await loadAllData();
    } catch (error: any) {
      showNotification(`Error guardando partida: ${error.message}`, 'error');
      throw error;
    }
  };

  const handleDeleteCostItem = async (itemId: string) => {
    if (!projectId) return;
    if (!window.confirm('¿Deseas eliminar esta partida de coste?')) return;
    try {
      await FinancialService.deleteItem(projectId, itemId);
      showNotification('Partida eliminada correctamente.', 'success');
      await loadAllData();
    } catch (error: any) {
      showNotification(`Error eliminando partida: ${error.message}`, 'error');
    }
  };

  const handleSavePayment = async (data: CreatePaymentInput) => {
    if (!projectId) return;
    try {
      await FinancialService.createPayment(projectId, data);
      showNotification('Pago registrado con éxito.', 'success');
      await loadAllData();
    } catch (error: any) {
      showNotification(`Error registrando pago: ${error.message}`, 'error');
      throw error;
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!projectId) return;
    if (!window.confirm('¿Deseas eliminar este registro de pago?')) return;
    try {
      await FinancialService.deletePayment(projectId, paymentId);
      showNotification('Pago eliminado correctamente.', 'success');
      await loadAllData();
    } catch (error: any) {
      showNotification(`Error eliminando pago: ${error.message}`, 'error');
    }
  };

  const handleCreateSnapshot = async () => {
    if (!projectId) return;
    try {
      await FinancialService.createSnapshot(projectId, {
        title: `Instantánea - ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      });
      showNotification('Instantánea financiera guardada con éxito.', 'success');
    } catch (error: any) {
      showNotification(`Error creando instantánea: ${error.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 border animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
              : 'bg-red-950/90 text-red-300 border-red-800'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            to={`/projects/${projectId}`}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-800"
            title="Volver al Proyecto"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <h1 className="text-xl md:text-2xl font-black text-white">
                Finanzas & Inversión Total
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidación transversal de Reforma, Mobiliario, Equipamiento y Adquisición
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            title="Sincroniza costes desde Inteligencia de Obra (V11), Ejecución (V15) y Mobiliario Digital (V16)"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar Costes'}</span>
          </button>

          <button
            onClick={() => setIsAcqModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-blue-300 text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Adquisición Inmueble</span>
          </button>

          <button
            onClick={handleCreateSnapshot}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors shadow-sm"
            title="Guardar instantánea del estado financiero actual"
          >
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <span>Instantánea</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsCostModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Partida</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-800 mt-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Resumen & Distribución</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'items'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Partidas de Coste ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'rooms'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Coste por Estancias</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pagos & Tesorería ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'forecast'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Proyección & Riesgo</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="mt-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
            Cargando inteligencia financiera...
          </div>
        ) : !summary ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No hay datos financieros disponibles</h3>
            <p className="text-xs text-slate-400 mt-1">
              Comienza sincronizando partidas de obra o añadiendo nuevas partidas de coste.
            </p>
            <button
              onClick={handleSync}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Sincronizar Ahora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <FinancialSummaryCards
                  summary={summary}
                  onOpenAcquisitionModal={() => setIsAcqModalOpen(true)}
                />
                <FinancialTransformationChart summary={summary} />
                <div className="pt-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Desglose por Pilares Económicos
                  </h3>
                  <FinancialCategoryTab
                    summary={summary}
                    onSelectCategory={() => setActiveTab('items')}
                  />
                </div>
              </>
            )}

            {activeTab === 'items' && (
              <FinancialCostItemsTable
                items={items}
                onNewItem={() => {
                  setEditingItem(null);
                  setIsCostModalOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingItem(item);
                  setIsCostModalOpen(true);
                }}
                onDeleteItem={handleDeleteCostItem}
                onRegisterPayment={(item) => {
                  setPaymentItem(item);
                  setIsPaymentModalOpen(true);
                }}
              />
            )}

            {activeTab === 'rooms' && <FinancialRoomsTab summary={summary} />}

            {activeTab === 'payments' && (
              <FinancialPaymentsTab
                payments={payments}
                onNewPayment={() => {
                  setPaymentItem(null);
                  setIsPaymentModalOpen(true);
                }}
                onDeletePayment={handleDeletePayment}
              />
            )}

            {activeTab === 'forecast' && <FinancialForecastTab forecast={forecast} />}
          </div>
        )}
      </div>

      {/* Modals */}
      <FinancialAcquisitionModal
        isOpen={isAcqModalOpen}
        onClose={() => setIsAcqModalOpen(false)}
        acquisition={acquisition}
        onSave={handleSaveAcquisition}
        onDelete={handleDeleteAcquisition}
      />

      <FinancialCostModal
        isOpen={isCostModalOpen}
        onClose={() => {
          setIsCostModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        projectId={projectId || ''}
        onSave={handleSaveCostItem}
      />

      <FinancialPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentItem(null);
        }}
        projectId={projectId || ''}
        item={paymentItem}
        onSave={handleSavePayment}
      />
    </div>
  );
};
