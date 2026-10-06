/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Item Create/Edit Modal Component
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import {
  ProcurementItemDto,
  ProcurementCategory,
  ProcurementPriority,
  ProcurementStatus,
} from '@hbd/shared';

interface ProcurementItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    description: string;
    category: ProcurementCategory;
    priority?: ProcurementPriority;
    status?: ProcurementStatus;
    quantity: number;
    unit: string;
    estimatedUnitCost: number;
    supplierName?: string;
    leadTimeDays?: number;
    requiredDate?: string;
    notes?: string;
  }) => Promise<void>;
  item?: ProcurementItemDto | null;
}

const CATEGORIES: { value: ProcurementCategory; label: string }[] = [
  { value: 'RENOVATION_MATERIAL', label: 'Material de Reforma' },
  { value: 'FURNITURE', label: 'Mobiliario' },
  { value: 'APPLIANCE', label: 'Electrodomésticos' },
  { value: 'EQUIPMENT', label: 'Equipamiento' },
  { value: 'LIGHTING', label: 'Iluminación' },
  { value: 'DECORATION', label: 'Decoración' },
  { value: 'PLUMBING', label: 'Fontanería & Sanitarios' },
  { value: 'ELECTRICAL', label: 'Electricidad' },
  { value: 'CARPENTRY', label: 'Carpintería' },
  { value: 'FLOORING', label: 'Pavimentos & Suelos' },
  { value: 'PAINT', label: 'Pintura' },
  { value: 'TOOLS', label: 'Herramientas' },
  { value: 'SAFETY', label: 'Seguridad' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'OTHER', label: 'Otros' },
];

export const ProcurementItemModal: React.FC<ProcurementItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
}) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProcurementCategory>('RENOVATION_MATERIAL');
  const [priority, setPriority] = useState<ProcurementPriority>('NORMAL');
  const [status, setStatus] = useState<ProcurementStatus>('DRAFT');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('ud');
  const [estimatedUnitCost, setEstimatedUnitCost] = useState<number>(0);
  const [supplierName, setSupplierName] = useState<string>('');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [requiredDate, setRequiredDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setDescription(item.description || '');
      setCategory(item.category || 'RENOVATION_MATERIAL');
      setPriority(item.priority || 'NORMAL');
      setStatus(item.status || 'DRAFT');
      setQuantity(item.quantity || 1);
      setUnit(item.unit || 'ud');
      setEstimatedUnitCost(item.estimatedUnitCost || 0);
      setSupplierName(item.supplierName || '');
      setLeadTimeDays(item.leadTimeDays || 7);
      setRequiredDate(
        item.requiredDate ? item.requiredDate.split('T')[0] : ''
      );
      setNotes(item.notes || '');
    } else {
      setDescription('');
      setCategory('RENOVATION_MATERIAL');
      setPriority('NORMAL');
      setStatus('DRAFT');
      setQuantity(1);
      setUnit('ud');
      setEstimatedUnitCost(0);
      setSupplierName('');
      setLeadTimeDays(7);
      setRequiredDate('');
      setNotes('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        description: description.trim(),
        category,
        priority,
        status,
        quantity: Number(quantity) || 1,
        unit: unit.trim() || 'ud',
        estimatedUnitCost: Number(estimatedUnitCost) || 0,
        supplierName: supplierName.trim() || undefined,
        leadTimeDays: Number(leadTimeDays) || 0,
        requiredDate: requiredDate ? new Date(requiredDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {item ? 'Editar Partida de Aprovisionamiento' : 'Nueva Partida de Aprovisionamiento'}
              </h3>
              <p className="text-xs text-slate-400">Gestión de Compras y Suministros</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción del Artículo / Material *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Grifería empotrada monomando negro mate"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProcurementCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProcurementPriority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="LOW">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProcurementStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="DRAFT">Borrador</option>
                <option value="NEEDED">Necesario</option>
                <option value="REQUESTED">Solicitado</option>
                <option value="QUOTED">Presupuestado</option>
                <option value="APPROVED">Aprobado</option>
                <option value="ORDERED">Pedido</option>
                <option value="RECEIVED">Recibido</option>
                <option value="INSTALLED">Instalado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cantidad Requerida
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Unidad de Medida
              </label>
              <input
                type="text"
                placeholder="ud, m², ml, kg, lote..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Coste Unit. Estimado (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedUnitCost}
                onChange={(e) => setEstimatedUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Proveedor Recomendado
              </label>
              <input
                type="text"
                placeholder="Leroy Merlin, Porcelanosa..."
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Plazo Entrega (Días)
              </label>
              <input
                type="number"
                min="0"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Fecha Necesaria en Obra
              </label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Notas / Especificaciones Técnicas
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre acabado, lote, instrucciones de recepción..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
              disabled={loading || !description.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Partida'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
