/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Quotes Comparison Tab Component
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useMemo } from 'react';
import {
  Send,
  CheckCircle,
  XCircle,
  Award,
  Zap,
  Clock,
  DollarSign,
  Building,
  Plus,
  Filter,
} from 'lucide-react';
import { SupplierQuoteDto, ProcurementItemDto } from '@hbd/shared';

interface ProcurementQuotesTabProps {
  quotes: SupplierQuoteDto[];
  items: ProcurementItemDto[];
  onAcceptQuote: (quoteId: string) => void;
  onRejectQuote?: (quoteId: string) => void;
  onNewQuoteRequest: (itemId?: string) => void;
}

export const ProcurementQuotesTab: React.FC<ProcurementQuotesTabProps> = ({
  quotes,
  items,
  onAcceptQuote,
  onRejectQuote,
  onNewQuoteRequest,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('ALL');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val || 0);

  // Group quotes by procurementItem
  const quotesByItem = useMemo(() => {
    const map = new Map<string, SupplierQuoteDto[]>();
    quotes.forEach((q) => {
      const list = map.get(q.procurementItemId) || [];
      list.push(q);
      map.set(q.procurementItemId, list);
    });
    return map;
  }, [quotes]);

  const itemsWithQuotes = useMemo(() => {
    if (selectedItemId !== 'ALL') {
      return items.filter((it) => it.id === selectedItemId);
    }
    return items.filter((it) => quotesByItem.has(it.id));
  }, [items, selectedItemId, quotesByItem]);

  return (
    <div className="space-y-6">
      {/* Top filter & action bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full md:w-72"
          >
            <option value="ALL">Todos los artículos cotizados ({quotesByItem.size})</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.description}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onNewQuoteRequest()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-colors w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Solicitar Cotización</span>
        </button>
      </div>

      {/* Quote Comparison Matrices */}
      {itemsWithQuotes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No hay cotizaciones de proveedores registradas para los artículos seleccionados.
        </div>
      ) : (
        <div className="space-y-6">
          {itemsWithQuotes.map((item) => {
            const itemQuotes = quotesByItem.get(item.id) || [];
            const minPrice = itemQuotes.length > 0 ? Math.min(...itemQuotes.map((q) => q.unitPrice)) : 0;
            const minLeadTime =
              itemQuotes.length > 0
                ? Math.min(...itemQuotes.map((q) => q.estimatedDeliveryDays || 9999))
                : 0;

            return (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                {/* Header for item */}
                <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.description}</span>
                      <span className="text-xs text-slate-400">• Requerido: {item.quantity} {item.unit}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Categoría: {item.category} | Precio objetivo: {formatCurrency(item.estimatedUnitCost)}/{item.unit}
                    </div>
                  </div>
                  <button
                    onClick={() => onNewQuoteRequest(item.id)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Añadir cotización para este artículo</span>
                  </button>
                </div>

                {/* Quotes Cards Grid */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itemQuotes.map((q) => {
                    const isBestPrice = q.unitPrice === minPrice;
                    const isFastest = q.estimatedDeliveryDays === minLeadTime && (q.estimatedDeliveryDays ?? 0) > 0;
                    const isSelected = q.status === 'SELECTED';
                    const isRejected = q.status === 'REJECTED';

                    return (
                      <div
                        key={q.id}
                        className={`rounded-xl p-4 border relative transition-all ${
                          isSelected
                            ? 'bg-emerald-950/20 border-emerald-500/60 shadow-md'
                            : isRejected
                            ? 'bg-slate-900/40 border-slate-800 opacity-60'
                            : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        {/* Status Badges & Highlights */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="font-bold text-white text-xs">{q.supplierName}</span>
                          </div>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-600">
                              SELECCIONADA
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                              RECHAZADA
                            </span>
                          )}
                        </div>

                        {/* Price & Lead time details */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Precio Unitario:</span>
                            <div className="flex items-center gap-1 font-bold text-white">
                              <span>{formatCurrency(q.unitPrice)}</span>
                              {isBestPrice && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 text-[10px]">
                                  <Award className="w-3 h-3" /> Mejor Precio
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Importe Total:</span>
                            <span className="font-bold text-emerald-400">
                              {formatCurrency(q.totalPrice || q.unitPrice * item.quantity)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Plazo de Entrega:</span>
                            <div className="flex items-center gap-1 text-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{q.estimatedDeliveryDays ? `${q.estimatedDeliveryDays} días` : 'No especificado'}</span>
                              {isFastest && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 text-[10px]">
                                  <Zap className="w-3 h-3" /> Más Rápido
                                </span>
                              )}
                            </div>
                          </div>

                          {q.validUntil && (
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Validez hasta:</span>
                              <span>{new Date(q.validUntil).toLocaleDateString('es-ES')}</span>
                            </div>
                          )}

                          {q.notes && (
                            <div className="p-2 bg-slate-900/60 rounded text-[11px] text-slate-400 mt-2">
                              {q.notes}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {q.status !== 'SELECTED' && q.status !== 'REJECTED' && (
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/60">
                            <button
                              onClick={() => onAcceptQuote(q.id)}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Seleccionar Ganadora</span>
                            </button>
                            {onRejectQuote && (
                              <button
                                onClick={() => onRejectQuote(q.id)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs font-medium transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
