/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Items Table Component — Sourcing, Tracking, Sched & Actions
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  FileText,
  Truck,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Package,
} from 'lucide-react';
import {
  ProcurementItemDto,
  ProcurementCategory,
  ProcurementStatus,
  ProcurementPriority,
} from '@hbd/shared';

interface ProcurementItemsTableProps {
  items: ProcurementItemDto[];
  onNewItem: () => void;
  onEditItem: (item: ProcurementItemDto) => void;
  onDeleteItem: (id: string) => void;
  onRequestQuote: (item: ProcurementItemDto) => void;
  onCreateOrder: (item: ProcurementItemDto) => void;
  onReceiveItem: (item: ProcurementItemDto) => void;
  onReportIncident: (item: ProcurementItemDto) => void;
  onInitiateReturn: (item: ProcurementItemDto) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  RENOVATION_MATERIAL: 'Materiales Reforma',
  FURNITURE: 'Mobiliario',
  APPLIANCE: 'Electrodomésticos',
  EQUIPMENT: 'Equipamiento',
  LIGHTING: 'Iluminación',
  DECORATION: 'Decoración',
  PLUMBING: 'Fontanería & Sanitarios',
  ELECTRICAL: 'Electricidad',
  CARPENTRY: 'Carpintería',
  FLOORING: 'Pavimentos & Revestimientos',
  PAINT: 'Pintura',
  TOOLS: 'Herramientas',
  SAFETY: 'Seguridad',
  LOGISTICS: 'Logística',
  OTHER: 'Otros',
};

const STATUS_BADGES: Record<ProcurementStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Borrador', bg: 'bg-slate-800', text: 'text-slate-300' },
  NEEDED: { label: 'Necesario', bg: 'bg-amber-950/60 border border-amber-700/50', text: 'text-amber-300' },
  REQUESTED: { label: 'Solicitado', bg: 'bg-indigo-950/60 border border-indigo-700/50', text: 'text-indigo-300' },
  QUOTED: { label: 'Presupuestado', bg: 'bg-cyan-950/60 border border-cyan-700/50', text: 'text-cyan-300' },
  APPROVAL_PENDING: { label: 'Pend. Aprobación', bg: 'bg-orange-950/60 border border-orange-700/50', text: 'text-orange-300' },
  APPROVED: { label: 'Aprobado', bg: 'bg-blue-950/60 border border-blue-700/50', text: 'text-blue-300' },
  ORDERED: { label: 'Pedido', bg: 'bg-sky-950/60 border border-sky-700/50', text: 'text-sky-300' },
  CONFIRMED: { label: 'Confirmado', bg: 'bg-indigo-950/60 border border-indigo-700/50', text: 'text-indigo-300' },
  PARTIALLY_SHIPPED: { label: 'Envío Parcial', bg: 'bg-teal-950/60 border border-teal-700/50', text: 'text-teal-300' },
  SHIPPED: { label: 'Enviado', bg: 'bg-amber-950/60 border border-amber-700/50', text: 'text-amber-300' },
  PARTIALLY_RECEIVED: { label: 'Recibido Parcial', bg: 'bg-teal-950/60 border border-teal-700/50', text: 'text-teal-300' },
  RECEIVED: { label: 'Recibido', bg: 'bg-emerald-950/60 border border-emerald-700/50', text: 'text-emerald-300' },
  INSPECTED: { label: 'Inspeccionado', bg: 'bg-emerald-900 border border-emerald-600', text: 'text-emerald-200' },
  INSTALLED: { label: 'Instalado', bg: 'bg-purple-950/60 border border-purple-700/50', text: 'text-purple-300' },
  COMPLETED: { label: 'Completado', bg: 'bg-emerald-900 border border-emerald-500', text: 'text-emerald-100' },
  CANCELLED: { label: 'Cancelado', bg: 'bg-zinc-800 text-zinc-400', text: 'text-zinc-400' },
  RETURNED: { label: 'Devuelto', bg: 'bg-rose-950/60 border border-rose-700/50', text: 'text-rose-300' },
  INCIDENT: { label: 'Incidencia', bg: 'bg-red-950/60 border border-red-700/50', text: 'text-red-300' },
  UNKNOWN: { label: 'Desconocido', bg: 'bg-slate-800', text: 'text-slate-400' },
};

const PRIORITY_BADGES: Record<ProcurementPriority, { label: string; dot: string }> = {
  LOW: { label: 'Baja', dot: 'bg-slate-500' },
  NORMAL: { label: 'Normal', dot: 'bg-blue-400' },
  HIGH: { label: 'Alta', dot: 'bg-amber-400' },
  CRITICAL: { label: 'Crítica', dot: 'bg-rose-500 animate-pulse' },
};

export const ProcurementItemsTable: React.FC<ProcurementItemsTableProps> = ({
  items,
  onNewItem,
  onEditItem,
  onDeleteItem,
  onRequestQuote,
  onCreateOrder,
  onReceiveItem,
  onReportIncident,
  onInitiateReturn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'description' | 'category' | 'priority' | 'status' | 'date' | 'totalCost'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val || 0);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const desc = item.description || '';
      const supplier = item.supplierName || '';
      const matchSearch =
        desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchSearch && matchCategory && matchStatus && matchPriority;
    });
  }, [items, searchTerm, categoryFilter, statusFilter, priorityFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'description') {
        comparison = (a.description || '').localeCompare(b.description || '');
      } else if (sortBy === 'category') {
        comparison = (a.category || '').localeCompare(b.category || '');
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<ProcurementPriority, number> = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
        comparison = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      } else if (sortBy === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else if (sortBy === 'totalCost') {
        const costA = a.selectedTotalCost ?? a.estimatedTotalCost ?? 0;
        const costB = b.selectedTotalCost ?? b.estimatedTotalCost ?? 0;
        comparison = costA - costB;
      } else if (sortBy === 'date') {
        const dateA = a.requiredDate ? new Date(a.requiredDate).getTime() : 0;
        const dateB = b.requiredDate ? new Date(b.requiredDate).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sortBy, sortOrder]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Table Header / Filters Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por artículo, proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todas las Categorías</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todos los Estados</option>
            {Object.entries(STATUS_BADGES).map(([key, badge]) => (
              <option key={key} value={key}>
                {badge.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todas las Prioridades</option>
            <option value="LOW">Baja</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </div>

        <button
          onClick={onNewItem}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Partida</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('description')}>
                <div className="flex items-center gap-1">
                  <span>Artículo / Ref</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('category')}>
                <div className="flex items-center gap-1">
                  <span>Categoría</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Cant. Requerida</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('totalCost')}>
                <div className="flex items-center gap-1">
                  <span>Coste Total</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Proveedor / Plazo</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('priority')}>
                <div className="flex items-center gap-1">
                  <span>Prioridad</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>Estado</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No se encontraron partidas de aprovisionamiento registradas.
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => {
                const statusBadge = STATUS_BADGES[item.status] || STATUS_BADGES.DRAFT;
                const priorityBadge = PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.NORMAL;
                const unitCost = item.selectedUnitCost ?? item.estimatedUnitCost ?? 0;
                const totalCost = item.selectedTotalCost ?? item.estimatedTotalCost ?? 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{item.description}</span>
                          {item.source !== 'MANUAL' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {item.source}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {item.roomName && <span>Estancia: {item.roomName}</span>}
                          {item.taskName && <span>• Tarea: {item.taskName}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Recibido: {item.receivedQuantity || 0} {item.unit}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-400">
                        {formatCurrency(totalCost)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(unitCost)} / {item.unit}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">
                        {item.supplierName || 'Sin asignar'}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{item.leadTimeDays ? `${item.leadTimeDays} días` : 'Plazo s/d'}</span>
                        {item.requiredDate && (
                          <span>• Necesario: {new Date(item.requiredDate).toLocaleDateString('es-ES')}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${priorityBadge.dot}`} />
                        <span>{priorityBadge.label}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Action Based on Status */}
                        {item.status === 'DRAFT' && (
                          <button
                            onClick={() => onRequestQuote(item)}
                            title="Pedir Cotización"
                            className="p-1 hover:bg-slate-800 rounded text-indigo-400 hover:text-indigo-300"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(item.status === 'DRAFT' || item.status === 'NEEDED' || item.status === 'QUOTED' || item.status === 'APPROVED') && (
                          <button
                            onClick={() => onCreateOrder(item)}
                            title="Emitir Orden de Compra"
                            className="p-1 hover:bg-slate-800 rounded text-blue-400 hover:text-blue-300"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(item.status === 'ORDERED' || item.status === 'SHIPPED' || item.status === 'PARTIALLY_RECEIVED') && (
                          <button
                            onClick={() => onReceiveItem(item)}
                            title="Registrar Entrega / Recepción"
                            className="p-1 hover:bg-slate-800 rounded text-emerald-400 hover:text-emerald-300"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onReportIncident(item)}
                          title="Reportar Incidencia"
                          className="p-1 hover:bg-slate-800 rounded text-amber-400 hover:text-amber-300"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onInitiateReturn(item)}
                          title="Tramitar Devolución"
                          className="p-1 hover:bg-slate-800 rounded text-rose-400 hover:text-rose-300"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditItem(item)}
                          title="Editar"
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          title="Eliminar"
                          className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
