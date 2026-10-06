import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileSpreadsheet,
  Plus,
  Sun,
  Users,
  CheckSquare,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { ExecutionProjectDto, SiteDailyLogDto } from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';

interface ExecutionDailyLogsTabProps {
  execution: ExecutionProjectDto;
  onCreateDailyLog: (logData: Partial<SiteDailyLogDto>) => Promise<void>;
}

export const ExecutionDailyLogsTab: React.FC<ExecutionDailyLogsTabProps> = ({
  execution,
  onCreateDailyLog,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weatherConditions, setWeatherConditions] = useState<string>('Soleado / 22°C');
  const [workersText, setWorkersText] = useState<string>('Albañilería (2), Fontanería (1)');
  const [tasksText, setTasksText] = useState<string>('Rozas de fontanería, tabiquería pladur salón');
  const [observations, setObservations] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateDailyLog({
      date: new Date(date).toISOString(),
      weatherConditions,
      workersPresent: workersText.split(',').map((w) => w.trim()).filter(Boolean),
      tasksPerformed: tasksText.split(',').map((t) => t.trim()).filter(Boolean),
      observations: observations || null,
    });
    setIsModalOpen(false);
    setObservations('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('execution.dailyLogs.title', 'Diario Cronológico de Obra (Site Log)')}
          </h3>
          <p className="text-xs text-gray-400">
            Registro diario de personal presente, tareas realizadas, incidencias y notas de campo.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo Diario del Día
        </Button>
      </div>

      <div className="space-y-4">
        {execution.dailyLogs.length === 0 ? (
          <Card className="p-8 text-center bg-dark-surface border-dark-border">
            <FileSpreadsheet size={32} className="mx-auto text-gray-500 mb-2" />
            <p className="text-xs text-gray-400">
              No hay anotaciones en el diario de obra todavía.
            </p>
          </Card>
        ) : (
          execution.dailyLogs.map((log) => (
            <Card key={log.id} className="p-5 bg-dark-surface border-dark-border space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dark-border/60 pb-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-brand-400 text-sm">{log.date.split('T')[0]}</span>
                  {log.weatherConditions && (
                    <span className="px-2 py-0.5 rounded-md bg-dark-card border border-dark-border text-gray-400 text-[11px] flex items-center gap-1">
                      <Sun size={12} className="text-amber-400" /> {log.weatherConditions}
                    </span>
                  )}
                </div>
                {log.createdByName && (
                  <span className="text-[11px] text-gray-400">Registrado por: {log.createdByName}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {log.workersPresent.length > 0 && (
                  <div className="p-3 rounded-xl bg-dark-card border border-dark-border/40 space-y-1">
                    <span className="font-semibold text-gray-300 flex items-center gap-1.5 text-[11px]">
                      <Users size={13} className="text-sky-400" /> Personal y Cuadrillas
                    </span>
                    <p className="text-gray-200 text-[11px]">{log.workersPresent.join(', ')}</p>
                  </div>
                )}

                {log.tasksPerformed.length > 0 && (
                  <div className="p-3 rounded-xl bg-dark-card border border-dark-border/40 space-y-1">
                    <span className="font-semibold text-gray-300 flex items-center gap-1.5 text-[11px]">
                      <CheckSquare size={13} className="text-emerald-400" /> Trabajos Realizados
                    </span>
                    <p className="text-gray-200 text-[11px]">{log.tasksPerformed.join(', ')}</p>
                  </div>
                )}
              </div>

              {log.observations && (
                <div className="p-3 rounded-xl bg-dark-card/60 border border-dark-border/40 text-xs text-gray-300">
                  <span className="font-bold text-gray-400 block text-[10px] uppercase mb-0.5">
                    Observaciones:
                  </span>
                  <p className="text-[11px]">{log.observations}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Modal Añadir Diario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Entrada en el Diario de Obra"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Fecha</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Meteorología</label>
              <Input
                value={weatherConditions}
                onChange={(e) => setWeatherConditions(e.target.value)}
                placeholder="Soleado, Lluvia, Viento..."
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Personal Presente (separar por comas)
            </label>
            <Input
              value={workersText}
              onChange={(e) => setWorkersText(e.target.value)}
              placeholder="Ej. 2 albañiles, 1 fontanero, 1 electricista"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Tareas Realizadas (separar por comas)
            </label>
            <Input
              value={tasksText}
              onChange={(e) => setTasksText(e.target.value)}
              placeholder="Ej. Demolición alicatado, replanteo de enchufes..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Observaciones de Campo</label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Cualquier incidencia menor o avance destacable del día..."
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Diario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
