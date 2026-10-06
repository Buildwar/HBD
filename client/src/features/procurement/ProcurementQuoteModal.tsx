/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Quote Modal Component
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { ProcurementItemDto } from '@hbd/shared';

interface ProcurementQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    procurementItemId: string;
    supplierName: string;
    unitPrice: number;
    estimatedDeliveryDays?: number;
    validUntil?: string;
    notes?: string;
  }) => Promise<void>;
  items: ProcurementItemDto[];
  selectedItemId?: string;
}

export const ProcurementQuoteModal: React.FC<ProcurementQuoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  items,
  selectedItemId,
}) => {
  const [procurementItemId, setProcurementItemId] = useState<string>(
    selectedItemId || (items[0]?.id || '')
  );
  const [supplierName, setSupplierName] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState<number>(7);
  const [validUntil, setValidUntil] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentItem = items.find((it) => it.id === (selectedItemId || procurementItemId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !procurementItemId) return;
    setLoading(true);
    try {
      await onSubmit({
        procurementItemId: selectedItemId || procurementItemId,
        supplierName: supplierName.trim(),
        unitPrice: Number(unitPrice) || 0,
        estimatedDeliveryDays: Number(estimatedDeliveryDays) || undefined,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error adding quote:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Registrar Cotización de Proveedor</h3>
              <p className="text-xs text-slate-400">Comparativa de ofertas y plazos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!selectedItemId && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Artículo a Cotizar *
              </label>
              <select
                value={procurementItemId}
                onChange={(e) => setProcurementItemId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.description} ({it.quantity} {it.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentItem && selectedItemId && (
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-xs">
              <div className="font-semibold text-white">{currentItem.description}</div>
              <div className="text-slate-400 mt-0.5">
                Requerido: {currentItem.quantity} {currentItem.unit} • Est: {currentItem.estimatedUnitCost} €/{currentItem.unit}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre del Proveedor / Tienda *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Distribuidor Oficial, BricoDepot, Porcelanosa..."
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Precio Unitario Oferta (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plazo Estimado (Días)
              </label>
              <input
                type="number"
                min="0"
                value={estimatedDeliveryDays}
                onChange={(e) => setEstimatedDeliveryDays(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Validez de la Oferta Hasta
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Notas / Condiciones de la Oferta
            </label>
            <textarea
              rows={2}
              placeholder="Descuento por volumen incluido, portes pagados..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
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
              disabled={loading || !supplierName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Cotización'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
