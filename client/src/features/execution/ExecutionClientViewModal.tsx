import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  DollarSign,
  Camera,
  Layers,
} from 'lucide-react';
import { ClientViewDto } from '@hbd/shared';
import { Modal } from '../../components/ui/Modal.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

interface ExecutionClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientView: ClientViewDto | null;
}

export const ExecutionClientViewModal: React.FC<ExecutionClientViewModalProps> = ({
  isOpen,
  onClose,
  clientView,
}) => {
  const { t } = useTranslation();

  if (!clientView) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resumen de Obra para Cliente — ${clientView.projectName}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-xs">
        {/* Cabecera de Progreso */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/40 to-dark-card border border-brand-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-200">Avance Global de la Reforma</span>
            <span className="text-xl font-black text-brand-400">{clientView.progress}%</span>
          </div>

          <div className="w-full bg-dark-card rounded-full h-3 overflow-hidden border border-dark-border">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${clientView.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Inicio: {clientView.startDate?.split('T')[0] || 'En curso'}</span>
            <span>Fin previsto: {clientView.plannedEndDate?.split('T')[0] || 'Próximamente'}</span>
          </div>
        </div>

        {/* Resumen Económico Aprobado (Sin márgenes ni costes internos de subcontrata) */}
        {clientView.budgetSummary && (
          <Card className="p-4 bg-dark-surface border-dark-border space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <DollarSign size={13} className="text-emerald-400" /> Resumen Económico del Proyecto
            </h4>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-dark-card border border-dark-border/40">
                <span className="text-[10px] text-gray-400 block">Presupuesto Aprobado</span>
                <strong className="text-sm font-bold text-white">
                  {clientView.budgetSummary.initialBudget.toFixed(2)} €
                </strong>
              </div>
              <div className="p-2 rounded-xl bg-dark-card border border-dark-border/40">
                <span className="text-[10px] text-gray-400 block">Cambios Aprobados</span>
                <strong className="text-sm font-bold text-amber-400">
                  +{clientView.budgetSummary.approvedChanges.toFixed(2)} €
                </strong>
              </div>
              <div className="p-2 rounded-xl bg-dark-card border border-dark-border/40">
                <span className="text-[10px] text-gray-400 block">Total Actual</span>
                <strong className="text-sm font-bold text-emerald-400">
                  {clientView.budgetSummary.currentTotal.toFixed(2)} €
                </strong>
              </div>
            </div>
          </Card>
        )}

        {/* Hitos Completados */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
            <Calendar size={13} className="text-sky-400" /> Hitos Clave y Entregas
          </h4>

          <div className="space-y-1.5">
            {clientView.completedMilestones.map((ms) => (
              <div
                key={ms.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-dark-card border border-dark-border/40 text-[11px]"
              >
                <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-brand-400" /> {ms.title}
                </span>
                <Badge variant="brand">COMPLETADO</Badge>
              </div>
            ))}

            {clientView.upcomingMilestones.map((ms) => (
              <div
                key={ms.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-dark-card/60 border border-dark-border/30 text-[11px]"
              >
                <span className="font-medium text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-500" /> {ms.title}
                </span>
                <span className="text-gray-400">{ms.targetDate.split('T')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Galería de Fotografías Recientes */}
        {clientView.recentPhotos.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <Camera size={13} className="text-brand-400" /> Galería de Evolución de la Vivienda
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {clientView.recentPhotos.slice(0, 6).map((ph) => (
                <div key={ph.id} className="aspect-video rounded-xl overflow-hidden border border-dark-border">
                  <img
                    src={ph.photoUrl}
                    alt={ph.caption || 'Foto'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-dark-border">
          <Button variant="secondary" onClick={onClose}>
            Cerrar Vista Cliente
          </Button>
        </div>
      </div>
    </Modal>
  );
};
