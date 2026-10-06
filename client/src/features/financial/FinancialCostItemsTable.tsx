/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Cost Items Table Component — Detailed Line Item Management
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import {
  CostItemDto,
  CostCategory,
  CostStatus,
} from '@hbd/shared';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  Building2,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface FinancialCostItemsTableProps {
  items: CostItemDto[];
  onNewItem: () => void;
  onEditItem: (item: CostItemDto) => void;
  onDeleteItem: (itemId: string) => void;
  onRegisterPayment: (item: CostItemDto) => void;
}

const CATEGORY_LABELS: Record<CostCategory, string> = {
  PROPERTY_ACQUISITION: 'Inmueble',
  RENOVATION: 'Reforma',
  FURNITURE: 'Mobiliario',
  APPLIANCES: 'Electrodomésticos',
  EQUIPMENT: 'Equipamiento',
  PROFESSIONAL_SERVICES: 'Profesionales',
  LOGISTICS: 'Logística',
  PERMITS: 'Licencias',
  CONTINGENCY: 'Contingencia',
  OTHER: 'Otros',
};

const STATUS_COLORS: Record<CostStatus, string> = {
  ESTIMATED: 'bg-slate-800 text-slate-300 border-slate-700',
  QUOTED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  APPROVED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  COMMITTED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export const FinancialCostItemsTable: React.FC<FinancialCostItemsTableProps> = ({
  items,
  onNewItem,
  onEditItem,
  onDeleteItem,
  onRegisterPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const formatCurrency = (val?: number | null) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(term);
      const matchRoom = item.roomName?.toLowerCase().includes(term);
      const matchSupplier = item.supplierName?.toLowerCase().includes(term);
      const matchSub = item.subcategory?.toLowerCase().includes(term);
      return matchName || matchRoom || matchSupplier || matchSub;
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, estancia, proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todas las Categorías</option>
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
              <option key={cat} value={cat}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ESTIMATED">Estimado</option>
            <option value="QUOTED">Presupuestado</option>
            <option value="APPROVED">Aprobado</option>
            <option value="COMMITTED">Comprometido</option>
            <option value="PAID">Pagado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          onClick={onNewItem}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Partida</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Partida / Concepto</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3">Estancia</th>
              <th className="py-3 px-3 text-right">Cant.</th>
              <th className="py-3 px-3 text-right">Estimado</th>
              <th className="py-3 px-3 text-right">Coste Real</th>
              <th className="py-3 px-3 text-right">Pagado</th>
              <th className="py-3 px-3 text-right">Pendiente</th>
              <th className="py-3 px-3 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500">
                  No se encontraron partidas de coste que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const effCost = item.actualTotalCost ?? item.estimatedTotalCost;
                const isPaid = item.paidAmount >= effCost && effCost > 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        {item.supplierName && <span>Prov: {item.supplierName}</span>}
                        {item.invoiceRef && <span>Doc: {item.invoiceRef}</span>}
                        {item.source !== 'MANUAL' && (
                          <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px] text-slate-400">
                            {item.source}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-300">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      <div className="text-[10px] text-slate-500">{item.subcategory}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.roomName || <span className="text-slate-500 italic">General</span>}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-300">
                      {formatCurrency(item.estimatedTotalCost)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {item.actualTotalCost !== null && item.actualTotalCost !== undefined
                        ? formatCurrency(item.actualTotalCost)
                        : <span className="text-slate-500 font-normal">—</span>}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-400">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-amber-400">
                      {formatCurrency(item.pendingAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          STATUS_COLORS[item.status] || STATUS_COLORS.ESTIMATED
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {!isPaid && (
                          <button
                            onClick={() => onRegisterPayment(item)}
                            title="Registrar Pago"
                            className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditItem(item)}
                          title="Editar"
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          title="Eliminar"
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
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
