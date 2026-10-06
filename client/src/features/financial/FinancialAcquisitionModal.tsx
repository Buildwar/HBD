/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Acquisition Modal Component — Property Purchase Costs Management
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { PropertyAcquisitionDto, SavePropertyAcquisitionInput } from '@hbd/shared';
import { X, Building2, Save, Trash2, Calculator } from 'lucide-react';

interface FinancialAcquisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  acquisition: PropertyAcquisitionDto | null;
  onSave: (data: SavePropertyAcquisitionInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export const FinancialAcquisitionModal: React.FC<FinancialAcquisitionModalProps> = ({
  isOpen,
  onClose,
  acquisition,
  onSave,
  onDelete,
}) => {
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [notaryFees, setNotaryFees] = useState<number>(0);
  const [registryFees, setRegistryFees] = useState<number>(0);
  const [transferTax, setTransferTax] = useState<number>(0);
  const [agencyFees, setAgencyFees] = useState<number>(0);
  const [legalFees, setLegalFees] = useState<number>(0);
  const [renovationTax, setRenovationTax] = useState<number>(0);
  const [valuationFees, setValuationFees] = useState<number>(0);
  const [otherAcquisitionFees, setOtherAcquisitionFees] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (acquisition) {
      setPurchasePrice(acquisition.purchasePrice || 0);
      setNotaryFees(acquisition.notaryFees || 0);
      setRegistryFees(acquisition.registryFees || 0);
      setTransferTax(acquisition.transferTax || 0);
      setAgencyFees(acquisition.agencyFees || 0);
      setLegalFees(acquisition.legalFees || 0);
      setRenovationTax(acquisition.renovationTax || 0);
      setValuationFees(acquisition.valuationFees || 0);
      setOtherAcquisitionFees(acquisition.otherAcquisitionFees || 0);
      setNotes(acquisition.notes || '');
    } else {
      setPurchasePrice(0);
      setNotaryFees(0);
      setRegistryFees(0);
      setTransferTax(0);
      setAgencyFees(0);
      setLegalFees(0);
      setRenovationTax(0);
      setValuationFees(0);
      setOtherAcquisitionFees(0);
      setNotes('');
    }
  }, [acquisition, isOpen]);

  if (!isOpen) return null;

  const totalCalculated =
    Number(purchasePrice || 0) +
    Number(notaryFees || 0) +
    Number(registryFees || 0) +
    Number(transferTax || 0) +
    Number(agencyFees || 0) +
    Number(legalFees || 0) +
    Number(renovationTax || 0) +
    Number(valuationFees || 0) +
    Number(otherAcquisitionFees || 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave({
        projectId: acquisition?.projectId || '',
        purchasePrice: Number(purchasePrice) || 0,
        notaryFees: Number(notaryFees) || 0,
        registryFees: Number(registryFees) || 0,
        transferTax: Number(transferTax) || 0,
        agencyFees: Number(agencyFees) || 0,
        legalFees: Number(legalFees) || 0,
        renovationTax: Number(renovationTax) || 0,
        valuationFees: Number(valuationFees) || 0,
        otherAcquisitionFees: Number(otherAcquisitionFees) || 0,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEstimateTaxes = () => {
    if (purchasePrice > 0) {
      // 8% average ITP / Transfer tax in Spain
      setTransferTax(Math.round(purchasePrice * 0.08));
      // Standard notary (~1.000 €)
      setNotaryFees(1000);
      // Standard registry (~600 €)
      setRegistryFees(600);
      // Standard valuation (~400 €)
      setValuationFees(400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Adquisición del Inmueble & Gastos de Compra</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-lg text-xs">
            <div className="text-blue-300">
              Introduce el precio de compra y los tributos / honorarios notariales y registrales asociados.
            </div>
            <button
              type="button"
              onClick={handleEstimateTaxes}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold px-2.5 py-1 bg-blue-500/20 rounded shrink-0 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Autoestimar Impuestos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Precio de Compraventa */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Precio de Compraventa del Inmueble (€) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={purchasePrice || ''}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                placeholder="200000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Impuestos (ITP / AJD / IVA) */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Impuesto Transmisiones (ITP / IVA / AJD) (€)
              </label>
              <input
                type="number"
                min="0"
                value={transferTax || ''}
                onChange={(e) => setTransferTax(parseFloat(e.target.value) || 0)}
                placeholder="16000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Notaría */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Honorarios de Notaría (€)</label>
              <input
                type="number"
                min="0"
                value={notaryFees || ''}
                onChange={(e) => setNotaryFees(parseFloat(e.target.value) || 0)}
                placeholder="1000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Registro de la Propiedad */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Registro de la Propiedad (€)</label>
              <input
                type="number"
                min="0"
                value={registryFees || ''}
                onChange={(e) => setRegistryFees(parseFloat(e.target.value) || 0)}
                placeholder="600"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Honorarios Agencia / Inmobiliaria */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Agencia / Inmobiliaria (€)</label>
              <input
                type="number"
                min="0"
                value={agencyFees || ''}
                onChange={(e) => setAgencyFees(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Asesoría Legal / Gestoría */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Gestoría / Asesoría Legal (€)</label>
              <input
                type="number"
                min="0"
                value={legalFees || ''}
                onChange={(e) => setLegalFees(parseFloat(e.target.value) || 0)}
                placeholder="500"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tasación */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tasación Hipotecaria (€)</label>
              <input
                type="number"
                min="0"
                value={valuationFees || ''}
                onChange={(e) => setValuationFees(parseFloat(e.target.value) || 0)}
                placeholder="400"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="text-xs">
            <label className="block text-slate-400 font-medium mb-1">Notas / Observaciones</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referencia catastral, entidad bancaria o condiciones especiales..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Total Preview */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Total Inversión Inmobiliaria Adquisición:
            </span>
            <span className="text-xl font-black text-blue-400">
              {formatCurrency(totalCalculated)}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {acquisition && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center space-x-1.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Inmueble</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
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
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Adquisición'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
