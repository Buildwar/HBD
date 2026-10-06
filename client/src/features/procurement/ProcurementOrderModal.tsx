/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Order Create Modal Component
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { ProcurementItemDto } from '@hbd/shared';

interface ProcurementOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    orderNumber?: string;
    supplierId?: string;
    supplierName: string;
    orderDate?: string;
    expectedDeliveryDate?: string;
    notes?: string;
    lines: Array<{
      procurementItemId?: string;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice?: number;
    }>;
  }) => Promise<void>;
  items: ProcurementItemDto[];
  selectedItem?: ProcurementItemDto | null;
}

export const ProcurementOrderModal: React.FC<ProcurementOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  items,
  selectedItem,
}) => {
  const [supplierName, setSupplierName] = useState<string>(
    selectedItem?.supplierName || 'Proveedor Principal'
  );
  const [orderNumber, setOrderNumber] = useState<string>(
    `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    selectedItem?.requiredDate
      ? selectedItem.requiredDate.split('T')[0]
      : ''
  );
  const [notes, setNotes] = useState<string>('');
  const [selectedLines, setSelectedLines] = useState<
    Array<{
      procurementItemId?: string;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
    }>
  >(
    selectedItem
      ? [
          {
            procurementItemId: selectedItem.id,
            description: selectedItem.description,
            quantity: selectedItem.quantity,
            unit: selectedItem.unit,
            unitPrice: selectedItem.selectedUnitCost ?? selectedItem.estimatedUnitCost,
            totalPrice: selectedItem.selectedTotalCost ?? selectedItem.estimatedTotalCost,
          },
        ]
      : []
  );
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddItemToOrder = (itemId: string) => {
    const item = items.find((it) => it.id === itemId);
    if (!item) return;
    if (selectedLines.some((l) => l.procurementItemId === item.id)) return;

    const unitCost = item.selectedUnitCost ?? item.estimatedUnitCost ?? 0;
    const totalCost = item.selectedTotalCost ?? item.estimatedTotalCost ?? unitCost * item.quantity;

    setSelectedLines((prev) => [
      ...prev,
      {
        procurementItemId: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: unitCost,
        totalPrice: totalCost,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setSelectedLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalAmount = selectedLines.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || selectedLines.length === 0) return;
    setLoading(true);
    try {
      await onSubmit({
        orderNumber: orderNumber.trim() || undefined,
        supplierName: supplierName.trim(),
        orderDate: orderDate ? new Date(orderDate).toISOString() : undefined,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
        lines: selectedLines.map((l) => ({
          procurementItemId: l.procurementItemId,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitPrice: l.unitPrice,
          totalPrice: l.totalPrice,
        })),
      });
      onClose();
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Emitir Orden de Compra (PO)</h3>
              <p className="text-xs text-slate-400">Generación formal de pedido a proveedor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número de Orden / Pedido *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Proveedor *
              </label>
              <input
                type="text"
                required
                placeholder="Nombre de la empresa o distribuidor"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Fecha de Emisión
              </label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Fecha Prevista de Entrega
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lines selection */}
          <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Líneas del Pedido ({selectedLines.length})
              </label>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItemToOrder(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1 focus:outline-none"
                >
                  <option value="">+ Añadir artículo al pedido...</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.description} ({it.quantity} {it.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedLines.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                Selecciona al menos un artículo para emitir la orden.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white">{line.description}</div>
                      <div className="text-slate-400 text-[11px]">
                        {line.quantity} {line.unit} × {line.unitPrice} € ={' '}
                        <strong className="text-emerald-400">{line.totalPrice} €</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">Total Pedido:</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalAmount)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Instrucciones / Condiciones de Pago & Entrega
            </label>
            <textarea
              rows={2}
              placeholder="Condiciones de pago 30 días, entrega en obra en horario de mañana..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || selectedLines.length === 0 || !supplierName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Generando...' : 'Emitir Orden de Compra'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
