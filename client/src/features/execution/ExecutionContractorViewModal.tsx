import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  CheckSquare,
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ContractorViewDto } from '@hbd/shared';
import { Modal } from '../../components/ui/Modal.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

interface ExecutionContractorViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorView: ContractorViewDto | null;
}

export const ExecutionContractorViewModal: React.FC<ExecutionContractorViewModalProps> = ({
  isOpen,
  onClose,
  contractorView,
}) => {
  const { t } = useTranslation();

  if (!contractorView) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Panel de Operario y Cuadrilla — ${contractorView.projectName}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-xs">
        {/* Tareas Pendientes en Obra */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
            <CheckSquare size={13} className="text-brand-400" /> Tareas Asignadas a Ejecutar
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {contractorView.assignedTasks.length === 0 ? (
              <p className="text-gray-400 py-2">No tienes tareas pendientes para hoy.</p>
            ) : (
              contractorView.assignedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border text-[11px]"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-200">{t.name}</span>
                    <p className="text-gray-400">Previsto: {t.plannedDurationDays} días</p>
                  </div>
                  <Badge variant={t.status === 'COMPLETED' ? 'brand' : t.status === 'IN_PROGRESS' ? 'info' : 'gray'}>
                    {t.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Próximas Entregas de Material */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
            <Truck size={13} className="text-sky-400" /> Recepciones de Material Previstas
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {contractorView.upcomingDeliveries.length === 0 ? (
              <p className="text-gray-400 py-2">No hay recepciones programadas pendientes.</p>
            ) : (
              contractorView.upcomingDeliveries.map((del) => (
                <div
                  key={del.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border text-[11px]"
                >
                  <div>
                    <span className="font-bold text-gray-200">{del.materialName}</span>
                    <p className="text-gray-400">
                      {del.quantity} {del.unit} • Fecha: {del.expectedDate.split('T')[0]}
                    </p>
                  </div>
                  <Badge variant="warning">{del.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Checklist de Inicio y Seguridad */}
        {contractorView.todayChecklist.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" /> Checklist de Fase
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {contractorView.todayChecklist.slice(0, 6).map((chk) => (
                <div
                  key={chk.id}
                  className="p-2 rounded-lg bg-dark-card/60 border border-dark-border/40 text-[11px] flex items-center gap-2"
                >
                  <span className={`w-2 h-2 rounded-full ${chk.isDone ? 'bg-brand-500' : 'bg-gray-500'}`} />
                  <span className={chk.isDone ? 'text-gray-400 line-through' : 'text-gray-200'}>
                    {chk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-dark-border">
          <Button variant="secondary" onClick={onClose}>
            Cerrar Vista Operario
          </Button>
        </div>
      </div>
    </Modal>
  );
};
