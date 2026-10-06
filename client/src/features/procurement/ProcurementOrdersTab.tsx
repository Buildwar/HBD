/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Orders Tab Component — Purchase Orders & Supplier Lifecycle
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import {
  FileText,
  Truck,
  Building,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
} from 'lucide-react';
import { ProcurementOrderDto, ProcurementOrderStatus } from '@hbd/shared';

interface ProcurementOrdersTabProps {
  orders: ProcurementOrderDto[];
  onNewOrder: () => void;
  onReceiveOrder: (order: ProcurementOrderDto) => void;
  onUpdateOrderStatus?: (orderId: string, status: ProcurementOrderStatus) => void;
}

const ORDER_STATUS_LABELS: Record<ProcurementOrderStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Borrador', bg: 'bg-slate-800', text: 'text-slate-300' },
  SUBMITTED: { label: 'Enviado a Proveedor', bg: 'bg-blue-950/60 border border-blue-700/50', text: 'text-blue-300' },
  CONFIRMED: { label: 'Confirmado por Proveedor', bg: 'bg-indigo-950/60 border border-indigo-700/50', text: 'text-indigo-300' },
  PARTIALLY_SHIPPED: { label: 'Envío Parcial', bg: 'bg-teal-950/60 border border-teal-700/50', text: 'text-teal-300' },
  SHIPPED: { label: 'Enviado / En Tránsito', bg: 'bg-amber-950/60 border border-amber-700/50', text: 'text-amber-300' },
  PARTIALLY_RECEIVED: { label: 'Entrega Parcial', bg: 'bg-teal-950/60 border border-teal-700/50', text: 'text-teal-300' },
  RECEIVED: { label: 'Recibido Completo', bg: 'bg-emerald-950/60 border border-emerald-700/50', text: 'text-emerald-300' },
  CANCELLED: { label: 'Cancelado', bg: 'bg-zinc-800', text: 'text-zinc-400' },
  CLOSED: { label: 'Cerrado', bg: 'bg-slate-800 text-slate-400', text: 'text-slate-400' },
};

export const ProcurementOrdersTab: React.FC<ProcurementOrdersTabProps> = ({
  orders,
  onNewOrder,
  onReceiveOrder,
  onUpdateOrderStatus,
}) => {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val || 0);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="text-xs text-slate-300 font-medium">
          Total órdenes de compra: <strong className="text-white">{orders.length}</strong>
        </div>
        <button
          onClick={onNewOrder}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Compra</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No hay órdenes de compra emitidas todavía.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            const statusConfig = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.DRAFT;

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all"
              >
                {/* Order Header Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {order.orderNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-500" />
                          {order.supplierName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(order.orderDate).toLocaleDateString('es-ES')}
                        </span>
                        {order.expectedDeliveryDate && (
                          <span className="flex items-center gap-1 text-amber-300/80">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Entrega prevista: {new Date(order.expectedDeliveryDate).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Importe Total</div>
                      <div className="font-extrabold text-emerald-400 text-base">
                        {formatCurrency(order.total)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {(order.status === 'SUBMITTED' || order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'PARTIALLY_RECEIVED') && (
                        <button
                          onClick={() => onReceiveOrder(order)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Recibir Entrega</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Lines */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/60 border-t border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Líneas del Pedido ({order.lines.length})
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">Descripción</th>
                            <th className="py-2 px-3">Cant. Pedida</th>
                            <th className="py-2 px-3">Cant. Recibida</th>
                            <th className="py-2 px-3">Precio Unitario</th>
                            <th className="py-2 px-3">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {order.lines.map((line) => (
                            <tr key={line.id}>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-white">{line.description}</div>
                                {line.notes && (
                                  <div className="text-[10px] text-slate-400">{line.notes}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-200">
                                {line.quantity} {line.unit}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={line.receivedQuantity >= line.quantity ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                                  {line.receivedQuantity} {line.unit}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-300">
                                {formatCurrency(line.unitPrice)}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-emerald-400">
                                {formatCurrency(line.totalPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
