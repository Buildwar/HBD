/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Return Modal Component
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { X, RotateCcw, CheckCircle2 } from 'lucide-react';
import { ProcurementItemDto } from '@hbd/shared';

interface ProcurementReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    procurementItemId: string;
    quantity: number;
    reason: string;
    refundAmount?: number;
    notes?: string;
  }) => Promise<void>;
  item?: ProcurementItemDto | null;
}

export const ProcurementReturnModal: React.FC<ProcurementReturnModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
}) => {
  const unitCost = item?.selectedUnitCost ?? item?.estimatedUnitCost ?? 0;
  const [quantity, setQuantity] = useState<number>(item?.receivedQuantity || 1);
  const [reason, setReason] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<number>(
    unitCost * (item?.receivedQuantity || 1)
  );
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        procurementItemId: item.id,
        quantity: Number(quantity),
        reason: reason.trim(),
        refundAmount: Number(refundAmount) || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error initiating return:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Tramitar Devolución a Proveedor</h3>
              <p className="text-xs text-slate-400">{item.description}</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cant. a Devolver ({item.unit})
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={quantity}
                onChange={(e) => {
                  const q = parseFloat(e.target.value) || 0;
                  setQuantity(q);
                  setRefundAmount(q * unitCost);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Importe Estimado Abono (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Motivo de la Devolución *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Material defectuoso, error en pedido, no encaja en dimensiones..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Instrucciones / Notas de Envío
            </label>
            <input
              type="text"
              placeholder="Etiqueta generada, recogida programada para..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
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
              disabled={loading || !reason.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Tramitando...' : 'Confirmar Devolución'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
