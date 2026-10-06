import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
} from 'lucide-react';
import { ExecutionProjectDto, MilestoneStatus } from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';

interface ExecutionMilestonesTabProps {
  execution: ExecutionProjectDto;
}

export const ExecutionMilestonesTab: React.FC<ExecutionMilestonesTabProps> = ({ execution }) => {
  const { t } = useTranslation();

  const getMilestoneBadge = (s: MilestoneStatus) => {
    switch (s) {
      case 'COMPLETED':
        return <Badge variant="brand">Completado</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="info">En Curso</Badge>;
      case 'DELAYED':
        return <Badge variant="danger">Retrasado</Badge>;
      default:
        return <Badge variant="gray">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white">
          {t('execution.milestones.title', 'Hitos Contractuales y Cronograma de Ejecución')}
        </h3>
        <p className="text-xs text-gray-400">
          Fechas clave de replanteo, fin de demoliciones, cerramientos, instalaciones y entrega de obra.
        </p>
      </div>

      <div className="space-y-3">
        {execution.milestones.map((ms, idx) => (
          <Card key={ms.id} className="p-4 bg-dark-surface border-dark-border space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flag size={14} className="text-brand-400" />
                    {ms.title}
                  </h4>
                  {ms.description && (
                    <p className="text-xs text-gray-400">{ms.description}</p>
                  )}
                </div>
              </div>

              <div>{getMilestoneBadge(ms.status)}</div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-dark-border/40">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-sky-400" /> Fecha Objetivo: <strong>{ms.targetDate.split('T')[0]}</strong>
              </span>
              {ms.actualDate && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={12} /> Fecha Real: {ms.actualDate.split('T')[0]}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
