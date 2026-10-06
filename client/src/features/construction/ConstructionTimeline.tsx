import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  User,
  CheckSquare,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ConstructionPhaseDto, ConstructionTaskDto, ConstructionTaskStatus } from '@hbd/shared';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

interface ConstructionTimelineProps {
  phases: ConstructionPhaseDto[];
  onToggleTask: (taskId: string, currentStatus: ConstructionTaskStatus) => void;
  onToggleChecklist: (checklistId: string, currentDone: boolean) => void;
  onAddTask: (phaseId: string) => void;
}

export const ConstructionTimeline: React.FC<ConstructionTimelineProps> = ({
  phases,
  onToggleTask,
  onToggleChecklist,
  onAddTask,
}) => {
  const { t } = useTranslation();
  const [expandedPhases, setExpandedPhases] = React.useState<Record<string, boolean>>({
    [phases[0]?.id || '']: true,
  });

  const toggleExpand = (phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const getStatusBadge = (status: ConstructionTaskStatus) => {
    switch (status) {
      case 'DONE':
        return <Badge variant="success">Completado</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="brand">En Curso</Badge>;
      case 'BLOCKED':
        return <Badge variant="danger">Bloqueado</Badge>;
      default:
        return <Badge variant="gray">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {phases.map((phase, idx) => {
        const isExpanded = !!expandedPhases[phase.id];
        const completedTasks = phase.tasks.filter((t) => t.status === 'DONE').length;
        const totalTasks = phase.tasks.length;
        const phaseProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return (
          <div
            key={phase.id}
            className="rounded-2xl bg-dark-surface border border-dark-border/80 overflow-hidden transition-all shadow-sm"
          >
            {/* Cabecera de Fase */}
            <div
              onClick={() => toggleExpand(phase.id)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-card/40 select-none transition-colors"
            >
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-white p-1">
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                      Fase {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{phase.name}</h3>
                    {getStatusBadge(phase.status)}
                  </div>
                  {phase.description && (
                    <p className="text-xs text-gray-400 mt-0.5 max-w-xl truncate">
                      {phase.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={14} className="text-gray-400" />
                  <span>{phase.estimatedDurationDays} días est.</span>
                </div>

                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="w-full bg-dark-card rounded-full h-2 overflow-hidden border border-dark-border">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${phaseProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-300 min-w-[32px] text-right">
                    {phaseProgress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Contenido desplegable: Tareas y Checklist */}
            {isExpanded && (
              <div className="px-5 pb-5 pt-2 border-t border-dark-border/40 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-dark-card/20">
                {/* Columna Izquierda: Tareas (2 columnas en pantallas grandes) */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-brand-400" /> Tareas de la Fase ({completedTasks}/{totalTasks})
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Plus size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTask(phase.id);
                      }}
                      className="text-xs text-brand-400 hover:text-brand-300"
                    >
                      Añadir Tarea
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() =>
                          onToggleTask(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')
                        }
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          task.status === 'DONE'
                            ? 'bg-dark-card/40 border-dark-border/40 text-gray-400'
                            : 'bg-dark-card border-dark-border/80 text-white hover:border-brand-500/50 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.status === 'DONE'}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-brand-500 focus:ring-0 cursor-pointer"
                          />
                          <span
                            className={`text-xs font-medium ${
                              task.status === 'DONE' ? 'line-through text-gray-500' : ''
                            }`}
                          >
                            {task.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {task.assigneeName && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 bg-dark-bg px-2 py-0.5 rounded-md border border-dark-border">
                              <User size={12} /> {task.assigneeName}
                            </span>
                          )}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna Derecha: Checklist de Verificación Técnica */}
                <div className="space-y-3 bg-dark-card/50 p-4 rounded-xl border border-dark-border/60">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-emerald-400" /> Verificaciones de Fase
                  </h4>

                  <div className="space-y-2">
                    {phase.checklists.map((check) => (
                      <label
                        key={check.id}
                        className="flex items-start gap-2.5 cursor-pointer text-xs select-none group"
                      >
                        <input
                          type="checkbox"
                          checked={check.isDone}
                          onChange={() => onToggleChecklist(check.id, check.isDone)}
                          className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                        <span
                          className={`transition-colors ${
                            check.isDone ? 'line-through text-gray-500' : 'text-gray-300 group-hover:text-white'
                          }`}
                        >
                          {check.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
