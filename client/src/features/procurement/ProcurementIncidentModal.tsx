/**
 * HBD — HOME BOARD DESIGNER (V18.0.0)
 * Procurement Incident Modal Component
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ProcurementItemDto, ProcurementIncidentType } from '@hbd/shared';

interface ProcurementIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    procurementItemId?: string;
    orderId?: string;
    type: ProcurementIncidentType;
    description: string;
    quantityAffected?: number;
  }) => Promise<void>;
  item?: ProcurementItemDto | null;
}

const INCIDENT_TYPES: { type: ProcurementIncidentType; labelKey: string }[] = [
  { type: 'DAMAGED', labelKey: 'procurement.incidentModal.types.damaged' },
  { type: 'WRONG_VARIANT', labelKey: 'procurement.incidentModal.types.wrongVariant' },
  { type: 'WRONG_PRODUCT', labelKey: 'procurement.incidentModal.types.wrongProduct' },
  { type: 'MISSING', labelKey: 'procurement.incidentModal.types.missing' },
  { type: 'DELAY', labelKey: 'procurement.incidentModal.types.delay' },
  { type: 'QUALITY', labelKey: 'procurement.incidentModal.types.quality' },
  { type: 'QUANTITY', labelKey: 'procurement.incidentModal.types.quantity' },
  { type: 'OTHER', labelKey: 'procurement.incidentModal.types.other' },
];

export const ProcurementIncidentModal: React.FC<ProcurementIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
}) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<ProcurementIncidentType>('DAMAGED');
  const [description, setDescription] = useState<string>('');
  const [quantityAffected, setQuantityAffected] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim() || `${t('procurement.incidentModal.defaultIncidentPrefix')}: ${item?.description || t('procurement.incidentModal.defaultMaterial')}`,
        procurementItemId: item?.id,
        type,
        description: description.trim(),
        quantityAffected: Number(quantityAffected) || 1,
      });
      onClose();
    } catch (err) {
      console.error('Error reporting incident:', err);
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
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t('procurement.incidentModal.title')}</h3>
              <p className="text-xs text-slate-400">{item?.description || t('procurement.incidentModal.defaultSupply')}</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('procurement.incidentModal.fields.titleLabel')}
            </label>
            <input
              type="text"
              placeholder={t('procurement.incidentModal.fields.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('procurement.incidentModal.fields.typeLabel')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProcurementIncidentType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {INCIDENT_TYPES.map((item) => (
                  <option key={item.type} value={item.type}>
                    {t(item.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('procurement.incidentModal.fields.quantityLabel')}
              </label>
              <input
                type="number"
                min="1"
                value={quantityAffected}
                onChange={(e) => setQuantityAffected(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('procurement.incidentModal.fields.descriptionLabel')}
            </label>
            <textarea
              required
              rows={3}
              placeholder={t('procurement.incidentModal.fields.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? t('procurement.incidentModal.buttons.reporting') : t('procurement.incidentModal.buttons.report')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
