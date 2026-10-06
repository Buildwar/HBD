import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ExecutionProjectDto, ProjectClosureChecklist } from '@hbd/shared';
import { Modal } from '../../components/ui/Modal.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { SiteManagementEngine } from '@hbd/shared';

interface ExecutionClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  execution: ExecutionProjectDto;
  onCloseProject: (data: { forceClose?: boolean; notes?: string }) => Promise<void>;
}

export const ExecutionClosureModal: React.FC<ExecutionClosureModalProps> = ({
  isOpen,
  onClose,
  execution,
  onCloseProject,
}) => {
  const { t } = useTranslation();
  const [closureNotes, setClosureNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checklist: ProjectClosureChecklist = SiteManagementEngine.validateProjectClosure(execution);

  const handleClose = async (force: boolean = false) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onCloseProject({ forceClose: force, notes: closureNotes });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cerrar la obra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cierre Técnico y Liquidación de Obra (Project Closure)"
      maxWidth="lg"
    >
      <div className="space-y-6 text-xs">
        <p className="text-gray-300">
          El proceso de cierre valida todas las condiciones técnicas y administrativas antes de archivar la obra y emitir el informe final.
        </p>

        {/* Lista de Comprobaciones Previas */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-brand-400" /> Verificación de Requisitos de Cierre
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
              <span>1. Tareas de obra finalizadas</span>
              {checklist.tasksCompleted ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
            </div>

            <div className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
              <span>2. Incidencias cerradas</span>
              {checklist.incidentsClosed ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
            </div>

            <div className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
              <span>3. Ensayos y Calidad Apto</span>
              {checklist.inspectionsPassed ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
            </div>

            <div className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
              <span>4. Materiales contabilizados</span>
              {checklist.materialsAccounted ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
            </div>

            <div className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
              <span>5. Hitos completados</span>
              {checklist.milestonesCompleted ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
            </div>

            <div className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
              <span>6. Fotografías finales (DESPUÉS)</span>
              {checklist.finalPhotosRecorded ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-amber-400" />
              )}
            </div>
          </div>
        </div>

        {/* Bloqueos o Alertas si existen */}
        {checklist.blockers.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-xs text-red-400">
              <AlertTriangle size={15} /> Elementos pendientes para el cierre:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {checklist.blockers.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Observaciones de Cierre */}
        <div>
          <label className="block text-gray-300 font-semibold mb-1">
            Dictamen o Conclusiones Finales de Dirección de Obra
          </label>
          <textarea
            rows={3}
            value={closureNotes}
            onChange={(e) => setClosureNotes(e.target.value)}
            placeholder="Observaciones de recepción, llaves entregadas, periodo de garantía..."
            className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 text-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {!checklist.canClose && (
              <Button
                variant="outline"
                onClick={() => handleClose(true)}
                disabled={isSubmitting}
                className="text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
              >
                Cerrar con Excepciones
              </Button>
            )}

            <Button
              variant="primary"
              onClick={() => handleClose(false)}
              disabled={isSubmitting || !checklist.canClose}
              icon={<CheckCircle2 size={15} />}
            >
              {isSubmitting ? 'Cerrando Obra...' : 'Confirmar Cierre de Obra'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
