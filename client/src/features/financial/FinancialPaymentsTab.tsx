/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Payments Tab Component — Disbursements & Payment Tracking
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { ProjectPaymentDto } from '@hbd/shared';
import { CreditCard, Plus, Trash2, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

interface FinancialPaymentsTabProps {
  payments: ProjectPaymentDto[];
  onNewPayment: () => void;
  onDeletePayment: (paymentId: string) => void;
}

export const FinancialPaymentsTab: React.FC<FinancialPaymentsTabProps> = ({
  payments,
  onNewPayment,
  onDeletePayment,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Registro de Pagos y Tesorería</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historial trazable de todos los desembolsos, facturas y transferencias del proyecto
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Desembolsado</div>
            <div className="text-xl font-black text-emerald-400">{formatCurrency(totalPaid)}</div>
          </div>
          <button
            onClick={onNewPayment}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-3">Concepto / Partida</th>
                <th className="py-3 px-3">Beneficiario / Proveedor</th>
                <th className="py-3 px-3">Método</th>
                <th className="py-3 px-3">Referencia / Factura</th>
                <th className="py-3 px-3 text-right">Importe</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se han registrado pagos aún. Haz clic en "Registrar Pago" para añadir desembolsos.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {new Date(p.paymentDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">
                        {p.costItemId ? p.notes || 'Partida vinculada' : p.notes || 'Pago General'}
                      </div>
                      {p.notes && <div className="text-[11px] text-slate-400">{p.notes}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {p.payee || <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {p.reference || p.invoiceRef || <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400 text-sm whitespace-nowrap">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeletePayment(p.id)}
                        title="Eliminar Pago"
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
