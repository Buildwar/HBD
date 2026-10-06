/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Receiving & Delivery Modal Component
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { X, Truck, CheckCircle2 } from 'lucide-react';
import { ProcurementItemDto, ProcurementOrderDto } from '@hbd/shared';

interface ProcurementReceivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    orderId?: string;
    procurementItemId?: string;
    receivedQuantity: number;
    damagedQuantity?: number;
    missingQuantity?: number;
    deliveryDate: string;
    carrier?: string;
    trackingNumber?: string;
    deliveryNoteNumber?: string;
    notes?: string;
  }) => Promise<void>;
  item?: ProcurementItemDto | null;
  order?: ProcurementOrderDto | null;
}

export const ProcurementReceivingModal: React.FC<ProcurementReceivingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  order,
}) => {
  const [receivedQuantity, setReceivedQuantity] = useState<number>(
    item ? Math.max(0, item.quantity - (item.receivedQuantity || 0)) : 1
  );
  const [damagedQuantity, setDamagedQuantity] = useState<number>(0);
  const [missingQuantity, setMissingQuantity] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [carrier, setCarrier] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        procurementItemId: item?.id,
        orderId: order?.id,
        receivedQuantity: Number(receivedQuantity),
        damagedQuantity: Number(damagedQuantity) || 0,
        missingQuantity: Number(missingQuantity) || 0,
        deliveryDate: new Date(deliveryDate).toISOString(),
        carrier: carrier.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        deliveryNoteNumber: deliveryNoteNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error recording delivery:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Registrar Recepción de Mercancía</h3>
              <p className="text-xs text-slate-400">
                {item ? item.description : order ? `Orden ${order.orderNumber}` : 'Entrega'}
              </p>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cant. Recibida ({item?.unit || 'uds'})
              </label>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1">
                Cant. Dañada
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={damagedQuantity}
                onChange={(e) => setDamagedQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-rose-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Cant. Faltante
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={missingQuantity}
                onChange={(e) => setMissingQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-amber-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Fecha de Entrega
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nº Albarán / Remisión
              </label>
              <input
                type="text"
                placeholder="ALB-2026-..."
                value={deliveryNoteNumber}
                onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Transportista / Logística
              </label>
              <input
                type="text"
                placeholder="DHL, Seur, Propio..."
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nº Seguimiento / Tracking
              </label>
              <input
                type="text"
                placeholder="1Z9999..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Observaciones del estado del paquete / material
            </label>
            <textarea
              rows={2}
              placeholder="Cajas en buen estado, embalaje intacto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Confirmar Recepción'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
