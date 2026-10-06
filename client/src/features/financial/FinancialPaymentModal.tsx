/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Payment Modal Component — Register a Project Payment
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { CostItemDto, CreatePaymentInput } from '@hbd/shared';
import { X, CreditCard, Save } from 'lucide-react';

interface FinancialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  item: CostItemDto | null;
  onSave: (data: CreatePaymentInput) => Promise<void>;
}

export const FinancialPaymentModal: React.FC<FinancialPaymentModalProps> = ({
  isOpen,
  onClose,
  projectId,
  item,
  onSave,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'CREDIT_CARD' | 'CASH' | 'CHECK' | 'FINANCING' | 'OTHER'>('TRANSFER');
  const [payee, setPayee] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [invoiceRef, setInvoiceRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setAmount(item.pendingAmount > 0 ? item.pendingAmount : (item.actualTotalCost ?? item.estimatedTotalCost));
      setPayee(item.supplierName || '');
      setInvoiceRef(item.invoiceRef || '');
      setNotes(`Pago de partida: ${item.name}`);
    } else {
      setAmount(0);
      setPayee('');
      setInvoiceRef('');
      setNotes('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    try {
      setIsSaving(true);
      await onSave({
        projectId,
        costItemId: item?.id,
        amount: Number(amount),
        paymentDate,
        paymentMethod,
        payee: payee.trim() || undefined,
        reference: reference.trim() || undefined,
        invoiceRef: invoiceRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Registrar Pago o Desembolso</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {item && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
              <div className="font-semibold text-white">{item.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Coste Total: {item.actualTotalCost ?? item.estimatedTotalCost} € | Ya pagado: {item.paidAmount} € | Pendiente: {item.pendingAmount} €
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Importe */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Importe del Pago (€) *</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Fecha de Pago */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Fecha del Pago *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="TRANSFER">Transferencia Bancaria</option>
                <option value="CREDIT_CARD">Tarjeta</option>
                <option value="CASH">Efectivo</option>
                <option value="CHECK">Pagaré / Cheque</option>
                <option value="FINANCING">Financiación</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            {/* Beneficiario */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Beneficiario / Proveedor</label>
              <input
                type="text"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                placeholder="Ej. Palma Reformas S.L."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Nº Factura */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Nº Factura / Certificación</label>
              <input
                type="text"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                placeholder="Ej. FAC-2026-042"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Referencia Bancaria */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Referencia / Justificante</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. TRF-987412"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Concepto / Notas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles del pago o certificación correspondiente..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Registrando...' : 'Confirmar Pago'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
