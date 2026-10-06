import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  ArrowRight,
  AlertTriangle,
  Building,
  Maximize2,
  DoorOpen,
  Square,
  Sparkles,
  Info,
} from 'lucide-react';
import { ConstructionComparisonResult } from '@hbd/shared';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';

interface ConstructionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: ConstructionComparisonResult | null;
}

export const ConstructionComparisonModal: React.FC<ConstructionComparisonModalProps> = ({
  isOpen,
  onClose,
  comparison,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !comparison) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('construction.comparisonModal.title', 'Comparador de Obra: Estado Actual vs Estado Propuesto')}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Banner de Aviso de Validación Profesional */}
        {comparison.proValidationNotes.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-amber-400">
                Aviso Técnico Importante
              </span>
              {comparison.proValidationNotes.map((note, i) => (
                <p key={i}>{note}</p>
              ))}
            </div>
          </div>
        )}

        {/* Resumen Comparativo en Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-dark-card/60 border-dark-border text-center space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Estado Actual (Existente)
            </span>
            <div className="space-y-1 text-xs text-gray-300">
              <p className="text-lg font-bold text-white">
                {comparison.existingSummary.totalAreaM2} m²
              </p>
              <p>{comparison.existingSummary.roomCount} estancias</p>
              <p>{comparison.existingSummary.wallCount} muros de partición</p>
              <p>{comparison.existingSummary.doorCount} puertas • {comparison.existingSummary.windowCount} ventanas</p>
            </div>
          </Card>

          <div className="flex flex-col items-center justify-center text-center p-2">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mb-1">
              <ArrowRight size={20} />
            </div>
            <span className="text-xs font-bold text-brand-400">Reforma Proyectada</span>
            <span className="text-[11px] text-gray-400">
              {comparison.demolitions.wallsToDemolishCount} demoliciones • {comparison.newConstructions.newWallsCount} muros nuevos
            </span>
          </div>

          <Card className="p-4 bg-brand-500/10 border-brand-500/30 text-center space-y-2">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
              Estado Propuesto (Reforma)
            </span>
            <div className="space-y-1 text-xs text-gray-300">
              <p className="text-lg font-bold text-emerald-400">
                {comparison.proposedSummary.totalAreaM2} m²
              </p>
              <p>{comparison.proposedSummary.roomCount} estancias</p>
              <p>{comparison.proposedSummary.wallCount} muros de partición</p>
              <p>{comparison.proposedSummary.doorCount} puertas • {comparison.proposedSummary.windowCount} ventanas</p>
            </div>
          </Card>
        </div>

        {/* Tabla de Métricas de Diferencia */}
        <div className="rounded-xl border border-dark-border overflow-hidden bg-dark-surface">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-dark-card border-b border-dark-border text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Indicador</th>
                <th className="py-2.5 px-4 text-center">Actual</th>
                <th className="py-2.5 px-4 text-center">Propuesto</th>
                <th className="py-2.5 px-4 text-center">Diferencia</th>
                <th className="py-2.5 px-4">Interpretación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40 font-mono">
              {comparison.metrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-dark-hover/30">
                  <td className="py-2.5 px-4 font-sans font-medium text-white">{m.category}</td>
                  <td className="py-2.5 px-4 text-center text-gray-400">
                    {m.existingValue} {m.unit}
                  </td>
                  <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">
                    {m.proposedValue} {m.unit}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        m.difference > 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : m.difference < 0
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-dark-card text-gray-400'
                      }`}
                    >
                      {m.difference > 0 ? `+${m.difference}` : m.difference} {m.unit}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans text-gray-400 text-[11px]">
                    {m.interpretation || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
