import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Pause,
  User,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ExecutionProjectDto, ExecutionTaskDto, ExecutionTaskStatus } from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

interface ExecutionTasksTabProps {
  execution: ExecutionProjectDto;
  onUpdateTask: (taskId: string, status: ExecutionTaskStatus, progress: number) => Promise<void>;
}

export const ExecutionTasksTab: React.FC<ExecutionTasksTabProps> = ({
  execution,
  onUpdateTask,
}) => {
  const { t } = useTranslation();

  const getTaskStatusBadge = (status: ExecutionTaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="brand">{t('execution.tasks.completed', 'Completada')}</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="info">{t('execution.tasks.inProgress', 'En Ejecución')}</Badge>;
      case 'BLOCKED':
        return <Badge variant="danger">{t('execution.tasks.blocked', 'Bloqueada')}</Badge>;
      case 'CANCELLED':
        return <Badge variant="gray">{t('execution.tasks.cancelled', 'Cancelada')}</Badge>;
      default:
        return <Badge variant="gray">{t('execution.tasks.notStarted', 'Sin Iniciar')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('execution.tasks.title', 'Paquetes de Trabajo y Tareas de Ejecución')}
          </h3>
          <p className="text-xs text-gray-400">
            Control de avance por partida real, operarios asignados y duración ejecutada.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {execution.workPackages.map((wp) => (
          <Card key={wp.id} className="p-5 bg-dark-surface border-dark-border space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  <Layers size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{wp.name}</h4>
                  <p className="text-[11px] text-gray-400">{wp.description || 'Sin descripción'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-400">{wp.progress}%</span>
                  <p className="text-[10px] text-gray-400">Avance Paquete</p>
                </div>
                <div className="w-24 bg-dark-card rounded-full h-2 overflow-hidden border border-dark-border">
                  <div
                    className="bg-brand-500 h-full rounded-full transition-all"
                    style={{ width: `${wp.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Listado de Tareas del Paquete */}
            <div className="space-y-2">
              {wp.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-dark-card border border-dark-border/60 hover:border-dark-border transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <button
                      onClick={() =>
                        onUpdateTask(
                          task.id,
                          task.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED',
                          task.status === 'COMPLETED' ? 0 : 100
                        )
                      }
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        task.status === 'COMPLETED'
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'border-gray-500 hover:border-brand-400'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <CheckCircle2 size={13} />}
                    </button>

                    <div>
                      <p
                        className={`font-semibold ${
                          task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-100'
                        }`}
                      >
                        {task.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <User size={11} /> {task.assigneeName || 'Sin asignar'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> Prev: {task.plannedDurationDays}d
                          {task.actualDurationDays > 0 ? ` (Real: ${task.actualDurationDays}d)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Control de Progreso Slider */}
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={task.progress}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const newStatus: ExecutionTaskStatus =
                            val === 100 ? 'COMPLETED' : val > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
                          onUpdateTask(task.id, newStatus, val);
                        }}
                        className="w-20 accent-brand-500 cursor-pointer"
                      />
                      <span className="w-8 text-[11px] font-bold text-gray-300 text-right">
                        {task.progress}%
                      </span>
                    </div>

                    {getTaskStatusBadge(task.status)}

                    {/* Acciones Rápidas */}
                    <div className="flex items-center gap-1">
                      {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => onUpdateTask(task.id, 'IN_PROGRESS', Math.max(10, task.progress))}
                          title="Iniciar tarea"
                          className="p-1 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
                        >
                          <Play size={13} />
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => onUpdateTask(task.id, 'BLOCKED', task.progress)}
                          title="Marcar como bloqueada"
                          className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          <Pause size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
