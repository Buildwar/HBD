/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Project Procurement Page — Project Purchasing & Supply Intelligence Dashboard
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProcurementService } from '../services/procurement.service.js';
import {
  ProcurementSummaryDto,
  ProcurementPlanningDto,
  ProcurementItemDto,
  SupplierQuoteDto,
  ProcurementOrderDto,
  MaterialRequirementDto,
} from '@hbd/shared';
import {
  ProcurementSummaryCards,
  ProcurementItemsTable,
  ProcurementPlanningTab,
  ProcurementQuotesTab,
  ProcurementOrdersTab,
  ProcurementReceivingModal,
  ProcurementIncidentModal,
  ProcurementReturnModal,
  ProcurementItemModal,
  ProcurementQuoteModal,
  ProcurementOrderModal,
} from '../features/procurement/index.js';
import {
  ArrowLeft,
  ShoppingBag,
  RefreshCw,
  Plus,
  Layers,
  Calendar,
  Send,
  FileText,
} from 'lucide-react';

type TabType = 'items' | 'planning' | 'quotes' | 'orders';

export const ProjectProcurementPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [summary, setSummary] = useState<ProcurementSummaryDto | null>(null);
  const [planning, setPlanning] = useState<ProcurementPlanningDto | null>(null);
  const [items, setItems] = useState<ProcurementItemDto[]>([]);
  const [quotes, setQuotes] = useState<SupplierQuoteDto[]>([]);
  const [orders, setOrders] = useState<ProcurementOrderDto[]>([]);
  const [materialRequirements, setMaterialRequirements] = useState<MaterialRequirementDto[]>([]);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<ProcurementItemDto | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ProcurementOrderDto | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [sumRes, planRes, itemsRes, ordersRes] = await Promise.all([
        ProcurementService.getSummary(projectId).catch(() => null),
        ProcurementService.getPlanning(projectId).catch(() => null),
        ProcurementService.getItems(projectId).catch(() => []),
        ProcurementService.getOrders(projectId).catch(() => []),
      ]);

      if (sumRes) setSummary(sumRes);
      if (planRes) setPlanning(planRes);
      setItems(itemsRes);
      setOrders(ordersRes);

      const allQuotes: SupplierQuoteDto[] = [];
      setQuotes(allQuotes);
    } catch (error: any) {
      showNotification(`Error cargando aprovisionamiento: ${error.message}`, 'error');
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
      const res = await ProcurementService.syncProcurement(projectId, {
        includeV11Materials: true,
        includeV15Tasks: true,
        includeV16Products: true,
        excludeDesignOnly: true,
      });
      showNotification(res.message || 'Sincronización de aprovisionamiento completada.', 'success');
      await loadAllData();
    } catch (error: any) {
      showNotification(`Error sincronizando compras: ${error.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Item Handlers
  const handleSaveItem = async (data: any) => {
    if (!projectId) return;
    try {
      const unitCost = Number(data.estimatedUnitCost) || 0;
      const qty = Number(data.quantity) || 1;
      const totalCost = unitCost * qty;

      if (selectedItem) {
        await ProcurementService.updateItem(projectId, selectedItem.id, {
          description: data.description,
          category: data.category,
          priority: data.priority,
          status: data.status,
          quantity: qty,
          unit: data.unit,
          estimatedUnitCost: unitCost,
          estimatedTotalCost: totalCost,
          supplierName: data.supplierName,
          leadTimeDays: data.leadTimeDays,
          requiredDate: data.requiredDate,
          notes: data.notes,
        });
        showNotification('Partida de aprovisionamiento actualizada.');
      } else {
        await ProcurementService.createItem(projectId, {
          projectId,
          description: data.description,
          category: data.category,
          priority: data.priority,
          status: data.status,
          quantity: qty,
          unit: data.unit,
          estimatedUnitCost: unitCost,
          estimatedTotalCost: totalCost,
          supplierName: data.supplierName,
          leadTimeDays: data.leadTimeDays,
          requiredDate: data.requiredDate,
          notes: data.notes,
        });
        showNotification('Partida de aprovisionamiento creada con éxito.');
      }
      await loadAllData();
    } catch (err: any) {
      showNotification(`Error guardando partida: ${err.message}`, 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!projectId || !window.confirm('¿Seguro que deseas eliminar esta partida?')) return;
    try {
      await ProcurementService.deleteItem(projectId, itemId);
      showNotification('Partida eliminada.');
      await loadAllData();
    } catch (err: any) {
      showNotification(`Error eliminando partida: ${err.message}`, 'error');
    }
  };

  // Quote Handlers
  const handleAddQuote = async (data: any) => {
    if (!projectId) return;
    try {
      const item = items.find((it) => it.id === data.procurementItemId);
      const qty = item?.quantity || 1;
      const uPrice = Number(data.unitPrice) || 0;

      await ProcurementService.createQuote(projectId, {
        projectId,
        procurementItemId: data.procurementItemId,
        supplierId: data.supplierId || 'supplier_manual',
        supplierName: data.supplierName,
        quantity: qty,
        unitPrice: uPrice,
        totalPrice: uPrice * qty,
        estimatedDeliveryDays: data.estimatedDeliveryDays || 7,
        validUntil: data.validUntil,
        notes: data.notes,
      });
      showNotification('Cotización de proveedor guardada.');
      await loadAllData();
    } catch (err: any) {
      showNotification(`Error guardando cotización: ${err.message}`, 'error');
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!projectId) return;
    try {
      await ProcurementService.selectQuote(projectId, quoteId);
      showNotification('Cotización seleccionada y partida actualizada.');
      await loadAllData();
    } catch (err: any) {
      showNotification(`Error aceptando cotización: ${err.message}`, 'error');
    }
  };

  // Order Handlers
  const handleCreateOrder = async (data: any) => {
    if (!projectId) return;
    try {
      await ProcurementService.createOrder(projectId, {
        projectId,
        supplierId: data.supplierId || 'supplier_primary',
        orderNumber: data.orderNumber,
        orderDate: data.orderDate,
        expectedDeliveryDate: data.expectedDeliveryDate,
        notes: data.notes,
        lines: data.lines.map((l: any) => ({
          procurementItemId: l.procurementItemId,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitPrice: l.unitPrice,
          totalPrice: l.totalPrice,
          notes: l.notes,
        })),
      });
      showNotification('Orden de compra emitida correctamente.');
      await loadAllData();
    } catch (err: any) {
      showNotification(`Error creando orden de compra: ${err.message}`, 'error');
    }
  };

  // Receiving Handler
  const handleRecordDelivery = async (data: any) => {
    if (!projectId) return;
    try {
      if (data.orderId) {
        await ProcurementService.receiveOrder(projectId, data.orderId, {
          orderId: data.orderId,
          deliveryDate: data.deliveryDate,
          carrier: data.carrier,
          trackingNumber: data.trackingNumber,
          notes: data.notes,
          linesReceived: [
            {
              lineId: data.procurementItemId || 'default_line',
              procurementItemId: data.procurementItemId,
              quantityReceivedNow: data.receivedQuantity,
              quantityDamagedNow: data.damagedQuantity,
              quantityMissingNow: data.missingQuantity,
            },
          ],
        });
      } else if (data.procurementItemId) {
        await ProcurementService.updateItem(projectId, data.procurementItemId, {
          receivedQuantity: (selectedItem?.receivedQuantity || 0) + data.receivedQuantity,
          damagedQuantity: (selectedItem?.damagedQuantity || 0) + (data.damagedQuantity || 0),
          missingQuantity: (selectedItem?.missingQuantity || 0) + (data.missingQuantity || 0),
          status: 'RECEIVED',
        });
      }
      showNotification('Recepción de mercancía registrada con éxito.');
      await loadAllData();
    } catch (err: any) {
      showNotification(`Error registrando recepción: ${err.message}`, 'error');
    }
  };

  // Incident Handler
  const handleReportIncident = async (data: any) => {
    if (!projectId) return;
    try {
      await ProcurementService.createIncident(projectId, {
        projectId,
        title: data.title,
        procurementItemId: data.procurementItemId,
        orderId: data.orderId,
        type: data.type,
        description: data.description,
        quantityAffected: data.quantityAffected,
      });
      showNotification('Incidencia de compra registrada.', 'success');
      await loadAllData();
    } catch (err: any) {
      showNotification(`Error registrando incidencia: ${err.message}`, 'error');
    }
  };

  // Return Handler
  const handleInitiateReturn = async (data: any) => {
    if (!projectId) return;
    try {
      await ProcurementService.createReturn(projectId, {
        projectId,
        procurementItemId: data.procurementItemId,
        quantity: data.quantity,
        reason: data.reason,
        refundAmount: data.refundAmount,
        notes: data.notes,
      });
      showNotification('Devolución a proveedor tramitada con éxito.');
      await loadAllData();
    } catch (err: any) {
      showNotification(`Error tramitando devolución: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
              : 'bg-rose-950 border-rose-500 text-rose-200'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/projects" className="hover:text-slate-200">
              Proyectos
            </Link>
            <span>/</span>
            <Link to={`/projects/${projectId}`} className="hover:text-slate-200">
              Detalle
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">Compras & Aprovisionamiento</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">
                  Compras & Aprovisionamiento
                </h1>
                <p className="text-xs text-slate-400">
                  Planificación, cotizaciones de proveedores, órdenes y seguimiento de entregas
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 shadow transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar V11/V15/V16'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedItem(null);
              setIsItemModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Partida</span>
          </button>
        </div>
      </div>

      {loading && !summary ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <ProcurementSummaryCards
              summary={summary}
              planning={planning}
              onSyncPurchases={handleSync}
              syncing={syncing}
            />
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'items'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Partidas & Compras ({items.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'planning'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Cronograma & Mermas</span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'quotes'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Cotizaciones Proveedores ({quotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Órdenes de Compra ({orders.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'items' && (
              <ProcurementItemsTable
                items={items}
                onNewItem={() => {
                  setSelectedItem(null);
                  setIsItemModalOpen(true);
                }}
                onEditItem={(item) => {
                  setSelectedItem(item);
                  setIsItemModalOpen(true);
                }}
                onDeleteItem={handleDeleteItem}
                onRequestQuote={(item) => {
                  setSelectedItem(item);
                  setIsQuoteModalOpen(true);
                }}
                onCreateOrder={(item) => {
                  setSelectedItem(item);
                  setIsOrderModalOpen(true);
                }}
                onReceiveItem={(item) => {
                  setSelectedItem(item);
                  setSelectedOrder(null);
                  setIsReceivingModalOpen(true);
                }}
                onReportIncident={(item) => {
                  setSelectedItem(item);
                  setIsIncidentModalOpen(true);
                }}
                onInitiateReturn={(item) => {
                  setSelectedItem(item);
                  setIsReturnModalOpen(true);
                }}
              />
            )}

            {activeTab === 'planning' && (
              <ProcurementPlanningTab
                planning={planning}
                materialRequirements={materialRequirements}
              />
            )}

            {activeTab === 'quotes' && (
              <ProcurementQuotesTab
                quotes={quotes}
                items={items}
                onAcceptQuote={handleAcceptQuote}
                onNewQuoteRequest={(itemId) => {
                  if (itemId) {
                    const it = items.find((i) => i.id === itemId) || null;
                    setSelectedItem(it);
                  } else {
                    setSelectedItem(null);
                  }
                  setIsQuoteModalOpen(true);
                }}
              />
            )}

            {activeTab === 'orders' && (
              <ProcurementOrdersTab
                orders={orders}
                onNewOrder={() => {
                  setSelectedItem(null);
                  setIsOrderModalOpen(true);
                }}
                onReceiveOrder={(order) => {
                  setSelectedOrder(order);
                  setSelectedItem(null);
                  setIsReceivingModalOpen(true);
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <ProcurementItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSubmit={handleSaveItem}
        item={selectedItem}
      />

      <ProcurementQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={handleAddQuote}
        items={items}
        selectedItemId={selectedItem?.id}
      />

      <ProcurementOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmit={handleCreateOrder}
        items={items}
        selectedItem={selectedItem}
      />

      <ProcurementReceivingModal
        isOpen={isReceivingModalOpen}
        onClose={() => setIsReceivingModalOpen(false)}
        onSubmit={handleRecordDelivery}
        item={selectedItem}
        order={selectedOrder}
      />

      <ProcurementIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSubmit={handleReportIncident}
        item={selectedItem}
      />

      <ProcurementReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleInitiateReturn}
        item={selectedItem}
      />
    </div>
  );
};
export default ProjectProcurementPage;
