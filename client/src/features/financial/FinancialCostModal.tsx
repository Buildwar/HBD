/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Cost Modal Component — Create/Edit Single Cost Line Item
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import {
  CostItemDto,
  CreateCostItemInput,
  UpdateCostItemInput,
  CostCategory,
  CostStatus,
} from '@hbd/shared';
import { X, Save, Tag, DollarSign } from 'lucide-react';

interface FinancialCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CostItemDto | null;
  projectId: string;
  onSave: (data: CreateCostItemInput | UpdateCostItemInput) => Promise<void>;
}

const CATEGORIES: { value: CostCategory; label: string }[] = [
  { value: 'RENOVATION', label: 'Reforma & Obra' },
  { value: 'FURNITURE', label: 'Mobiliario' },
  { value: 'APPLIANCES', label: 'Electrodomésticos' },
  { value: 'EQUIPMENT', label: 'Equipamiento & Clima' },
  { value: 'PROFESSIONAL_SERVICES', label: 'Servicios Profesionales' },
  { value: 'LOGISTICS', label: 'Logística & Montaje' },
  { value: 'PERMITS', label: 'Licencias & Tasas' },
  { value: 'CONTINGENCY', label: 'Contingencia' },
  { value: 'OTHER', label: 'Otros Gastos' },
];

export const FinancialCostModal: React.FC<FinancialCostModalProps> = ({
  isOpen,
  onClose,
  item,
  projectId,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CostCategory>('RENOVATION');
  const [subcategory, setSubcategory] = useState('MASONRY');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('ud');
  const [estimatedUnitCost, setEstimatedUnitCost] = useState<number>(0);
  const [estimatedTotalCost, setEstimatedTotalCost] = useState<number>(0);
  const [actualTotalCost, setActualTotalCost] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<CostStatus>('ESTIMATED');
  const [roomName, setRoomName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category);
      setSubcategory(item.subcategory || 'MISCELLANEOUS');
      setQuantity(item.quantity || 1);
      setUnit(item.unit || 'ud');
      setEstimatedUnitCost(item.estimatedUnitCost || 0);
      setEstimatedTotalCost(item.estimatedTotalCost || 0);
      setActualTotalCost(item.actualTotalCost ?? undefined);
      setStatus(item.status || 'ESTIMATED');
      setRoomName(item.roomName || '');
      setSupplierName(item.supplierName || '');
      setNotes(item.notes || '');
    } else {
      setName('');
      setCategory('RENOVATION');
      setSubcategory('MASONRY');
      setQuantity(1);
      setUnit('ud');
      setEstimatedUnitCost(0);
      setEstimatedTotalCost(0);
      setActualTotalCost(undefined);
      setStatus('ESTIMATED');
      setRoomName('');
      setSupplierName('');
      setNotes('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleUnitCostChange = (val: number) => {
    setEstimatedUnitCost(val);
    setEstimatedTotalCost(Number((val * (quantity || 1)).toFixed(2)));
  };

  const handleQuantityChange = (val: number) => {
    setQuantity(val);
    if (estimatedUnitCost > 0) {
      setEstimatedTotalCost(Number((estimatedUnitCost * val).toFixed(2)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave({
        projectId,
        name: name.trim(),
        category,
        subcategory: subcategory.trim() as any,
        quantity: Number(quantity) || 1,
        unit: unit.trim() || 'ud',
        estimatedUnitCost: Number(estimatedUnitCost) || 0,
        estimatedTotalCost: Number(estimatedTotalCost) || 0,
        actualTotalCost: actualTotalCost !== undefined && actualTotalCost !== null ? Number(actualTotalCost) : undefined,
        status,
        roomName: roomName.trim() || undefined,
        supplierName: supplierName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {item ? 'Editar Partida de Coste' : 'Nueva Partida de Coste'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Concepto / Nombre */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nombre / Concepto *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Alicatado cerámico baño principal"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Categoría Principal *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CostCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategoría */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Subcategoría</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Ej. TILING, MASONRY, SOFAS..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Cantidad y Unidad */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Cantidad y Unidad</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 1)}
                  className="w-2/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="m², ud, ml"
                  className="w-1/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Estado de la Partida</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CostStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ESTIMATED">Estimado</option>
                <option value="QUOTED">Presupuestado</option>
                <option value="APPROVED">Aprobado</option>
                <option value="COMMITTED">Comprometido / Contratado</option>
                <option value="PAID">Pagado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            {/* Precio Unitario Estimado */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Precio Unitario Estimado (€)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={estimatedUnitCost || ''}
                onChange={(e) => handleUnitCostChange(parseFloat(e.target.value) || 0)}
                placeholder="45"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Coste Total Estimado */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Coste Total Estimado (€) *</label>
              <input
                type="number"
                min="0"
                step="any"
                value={estimatedTotalCost || ''}
                onChange={(e) => setEstimatedTotalCost(parseFloat(e.target.value) || 0)}
                placeholder="450"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Coste Total Real (si ya se conoce) */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Coste Total Real / Facturado (€)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={actualTotalCost !== undefined ? actualTotalCost : ''}
                onChange={(e) =>
                  setActualTotalCost(e.target.value === '' ? undefined : parseFloat(e.target.value))
                }
                placeholder="Opcional (si difiere de la estimación)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Estancia */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Estancia Asignada</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Ej. Baño 1, Salón, General..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Proveedor */}
            <div className="md:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Proveedor / Contratista</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Ej. Reformas Palma S.L., IKEA, Leroy Merlin..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Observaciones</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles de colocación, modelo o condiciones de garantía..."
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
              <span>{isSaving ? 'Guardando...' : 'Guardar Partida'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
