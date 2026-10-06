import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  FileWarning,
} from 'lucide-react';
import {
  ExecutionProjectDto,
  ConstructionIncidentDto,
  IncidentPriority,
  IncidentStatus,
  IncidentType,
} from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';

interface ExecutionIncidentsTabProps {
  execution: ExecutionProjectDto;
  onCreateIncident: (incidentData: Partial<ConstructionIncidentDto>) => Promise<void>;
  onUpdateIncident: (incidentId: string, data: Partial<ConstructionIncidentDto>) => Promise<void>;
}

export const ExecutionIncidentsTab: React.FC<ExecutionIncidentsTabProps> = ({
  execution,
  onCreateIncident,
  onUpdateIncident,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<IncidentType>('QUALITY');
  const [priority, setPriority] = useState<IncidentPriority>('MEDIUM');
  const [location, setLocation] = useState<string>('');
  const [responsible, setResponsible] = useState<string>('');

  const [selectedIncident, setSelectedIncident] = useState<ConstructionIncidentDto | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const getPriorityBadge = (p: IncidentPriority) => {
    switch (p) {
      case 'CRITICAL':
        return <Badge variant="danger">CRÍTICA</Badge>;
      case 'HIGH':
        return <Badge variant="warning">ALTA</Badge>;
      case 'MEDIUM':
        return <Badge variant="info">MEDIA</Badge>;
      default:
        return <Badge variant="gray">BAJA</Badge>;
    }
  };

  const getStatusBadge = (s: IncidentStatus) => {
    switch (s) {
      case 'RESOLVED':
      case 'CLOSED':
        return <Badge variant="brand">Resuelta</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="info">En Proceso</Badge>;
      default:
        return <Badge variant="danger">Abierta</Badge>;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreateIncident({
      title,
      description,
      type,
      priority,
      location: location || null,
      responsibleAssignee: responsible || null,
      status: 'OPEN',
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setResponsible('');
  };

  const handleResolve = async (incidentId: string) => {
    await onUpdateIncident(incidentId, {
      status: 'RESOLVED',
      resolutionNotes: resolutionNotes || 'Incidencia subsanada satisfactoriamente en obra.',
      resolutionDate: new Date().toISOString(),
    });
    setSelectedIncident(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('execution.incidents.title', 'Gestión de Incidencias, Seguridad y Desviaciones')}
          </h3>
          <p className="text-xs text-gray-400">
            Registro clasificado por severidad, responsable asignado y advertencias de supervisión profesional.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setIsModalOpen(true)}
        >
          Registrar Incidencia
        </Button>
      </div>

      <div className="space-y-3">
        {execution.incidents.length === 0 ? (
          <Card className="p-8 text-center bg-dark-surface border-dark-border">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-xs text-gray-400">
              No hay incidencias abiertas. La obra progresa según lo previsto.
            </p>
          </Card>
        ) : (
          execution.incidents.map((inc) => (
            <Card key={inc.id} className="p-4 bg-dark-surface border-dark-border space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dark-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">{inc.title}</span>
                  <Badge variant="gray">{inc.type}</Badge>
                  {getPriorityBadge(inc.priority)}
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(inc.status)}
                  {inc.status !== 'RESOLVED' && inc.status !== 'CLOSED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedIncident(inc)}
                    >
                      Resolver
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-300">{inc.description}</p>

              {inc.requiresProReview && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                  <ShieldAlert size={15} className="shrink-0 text-amber-400" />
                  <span>
                    {inc.proReviewNotes ||
                      'Seguridad/Estructura: Requiere supervisión técnica por técnico competente colegiado.'}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 pt-1">
                <div className="flex items-center gap-3">
                  {inc.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {inc.location}
                    </span>
                  )}
                  {inc.responsibleAssignee && (
                    <span>Resp: {inc.responsibleAssignee}</span>
                  )}
                </div>
                <span>Reportada: {inc.dateReported.split('T')[0]}</span>
              </div>

              {inc.resolutionNotes && (
                <div className="p-2.5 rounded-xl bg-dark-card border border-dark-border/40 text-[11px] text-emerald-300">
                  <strong>Resolución ({inc.resolutionDate?.split('T')[0]}):</strong> {inc.resolutionNotes}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Modal Nueva Incidencia */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Incidencia en Obra"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Título de la Incidencia</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Tubería de plomo detectada al demoler, Descuadre en tabique..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white"
              >
                <option value="QUALITY">Calidad / Ejecución</option>
                <option value="DELAY">Retraso de Suministro</option>
                <option value="SAFETY">Seguridad Laboral</option>
                <option value="STRUCTURAL">Estructural / Vicio Oculto</option>
                <option value="INSTALLATION">Instalaciones</option>
                <option value="MATERIAL">Defecto de Material</option>
                <option value="OTHER">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Prioridad / Severidad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Descripción Detallada</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe lo ocurrido y su posible afectación..."
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Ubicación / Estancia</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Cocina, Baño principal, Fachada..."
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Responsable Asignado</label>
              <Input
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Ej. Oficial Fontanero, Proveedor Cerámicas..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Incidencia
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Resolver Incidencia */}
      {selectedIncident && (
        <Modal
          isOpen={Boolean(selectedIncident)}
          onClose={() => setSelectedIncident(null)}
          title={`Resolver Incidencia: ${selectedIncident.title}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-gray-300">
              Registra la acción correctiva ejecutada para cerrar esta incidencia.
            </p>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Notas de Resolución</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Ej. Se sustituyó el tramo de tubería afectado y se verificó estanqueidad..."
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelectedIncident(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => handleResolve(selectedIncident.id)}>
                Marcar como Resuelta
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
