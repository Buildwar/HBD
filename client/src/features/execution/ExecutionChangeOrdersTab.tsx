import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileEdit,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  ExecutionProjectDto,
  ConstructionChangeOrderDto,
  ChangeOrderStatus,
} from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';

interface ExecutionChangeOrdersTabProps {
  execution: ExecutionProjectDto;
  onCreateChangeOrder: (
    data: Partial<ConstructionChangeOrderDto> & { costImpact?: number; timeImpactDays?: number }
  ) => Promise<void>;
  onUpdateChangeOrder: (changeOrderId: string, data: { decision: string; comments?: string }) => Promise<void>;
}

export const ExecutionChangeOrdersTab: React.FC<ExecutionChangeOrdersTabProps> = ({
  execution,
  onCreateChangeOrder,
  onUpdateChangeOrder,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [costImpact, setCostImpact] = useState<number>(0);
  const [timeImpactDays, setTimeImpactDays] = useState<number>(0);

  const getStatusBadge = (s: ChangeOrderStatus) => {
    switch (s) {
      case 'APPROVED':
      case 'IMPLEMENTED':
        return <Badge variant="brand">Aprobado</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rechazado</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge variant="warning">Pendiente de Aprobación</Badge>;
      default:
        return <Badge variant="gray">Borrador</Badge>;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreateChangeOrder({
      title,
      description,
      reason,
      costImpact,
      timeImpactDays,
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setReason('');
    setCostImpact(0);
    setTimeImpactDays(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('execution.changeOrders.title', 'Órdenes de Cambio y Modificaciones de Proyecto')}
          </h3>
          <p className="text-xs text-gray-400">
            Trazabilidad de modificaciones sobre el plan inicial, cálculo de impacto económico/temporal y aprobaciones.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setIsModalOpen(true)}
        >
          Proponer Orden de Cambio
        </Button>
      </div>

      <div className="space-y-4">
        {execution.changeOrders.length === 0 ? (
          <Card className="p-8 text-center bg-dark-surface border-dark-border">
            <FileEdit size={32} className="mx-auto text-gray-500 mb-2" />
            <p className="text-xs text-gray-400">
              No hay órdenes de cambio registradas. El proyecto sigue el alcance y presupuesto inicial.
            </p>
          </Card>
        ) : (
          execution.changeOrders.map((co) => (
            <Card key={co.id} className="p-5 bg-dark-surface border-dark-border space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-dark-card border border-dark-border text-brand-400 font-bold text-xs">
                    {co.code}
                  </span>
                  <h4 className="text-sm font-bold text-white">{co.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(co.status)}
                  {co.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        icon={<CheckCircle2 size={13} />}
                        onClick={() => onUpdateChangeOrder(co.id, { decision: 'APPROVED' })}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<XCircle size={13} />}
                        onClick={() => onUpdateChangeOrder(co.id, { decision: 'REJECTED' })}
                      >
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-300">
                <p>
                  <strong className="text-gray-400">Descripción:</strong> {co.description}
                </p>
                {co.reason && (
                  <p>
                    <strong className="text-gray-400">Motivo:</strong> {co.reason}
                  </p>
                )}
              </div>

              {/* Impacto Calculado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-dark-card border border-dark-border/60 text-xs">
                <div className="flex items-center gap-2">
                  <DollarSign size={15} className="text-emerald-400 shrink-0" />
                  <span>
                    Impacto Coste:{' '}
                    <strong className={co.impact.costImpact >= 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {co.impact.costImpact >= 0 ? '+' : ''}{co.impact.costImpact.toFixed(2)} €
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-sky-400 shrink-0" />
                  <span>
                    Impacto Plazo:{' '}
                    <strong className={co.impact.timeImpactDays > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {co.impact.timeImpactDays >= 0 ? '+' : ''}{co.impact.timeImpactDays} días
                    </strong>
                  </span>
                </div>
              </div>

              {/* Registro de Aprobaciones */}
              {co.approvals && co.approvals.length > 0 && (
                <div className="pt-2 border-t border-dark-border/40 text-[11px] text-gray-400 space-y-1">
                  <span className="font-bold text-gray-300">Historial de Decisiones:</span>
                  {co.approvals.map((app) => (
                    <div key={app.id} className="flex items-center gap-2">
                      <span>• {app.decisionDate?.split('T')[0]}:</span>
                      <strong className="text-gray-200">{app.decision}</strong>
                      <span>por {app.approvedBy || app.requestedBy}</span>
                      {app.comments && <span className="italic text-gray-400">({app.comments})</span>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Modal Nueva Orden de Cambio */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Proponer Orden de Cambio de Obra"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Título del Cambio</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Cambio de pavimento cerámico a parquet flotante..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Descripción Técnica</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla los materiales sustituidos y las operaciones requeridas..."
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Motivo / Solicitante</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Petición expresa del cliente en reunión de obra..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Impacto en Coste (€)</label>
              <Input
                type="number"
                step="0.01"
                value={costImpact}
                onChange={(e) => setCostImpact(parseFloat(e.target.value) || 0)}
                placeholder="+/- EUR"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Impacto en Plazo (Días)</label>
              <Input
                type="number"
                step="1"
                value={timeImpactDays}
                onChange={(e) => setTimeImpactDays(parseInt(e.target.value, 10) || 0)}
                placeholder="+/- días"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Emitir Propuesta de Cambio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
