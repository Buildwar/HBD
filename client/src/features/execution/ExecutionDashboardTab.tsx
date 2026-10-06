import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Layers,
  Package,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';
import { ExecutionProjectDto } from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

interface ExecutionDashboardTabProps {
  execution: ExecutionProjectDto;
  onOpenClientView: () => void;
  onOpenContractorView: () => void;
  onOpenClosureModal: () => void;
  onSelectTab: (tab: string) => void;
}

export const ExecutionDashboardTab: React.FC<ExecutionDashboardTabProps> = ({
  execution,
  onOpenClientView,
  onOpenContractorView,
  onOpenClosureModal,
  onSelectTab,
}) => {
  const { t } = useTranslation();
  const { health, scheduleVariance, costVariance } = execution;

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return <Badge variant="brand">{t('execution.health.onTrack', 'En Plazo / Correcto')}</Badge>;
      case 'AT_RISK':
        return <Badge variant="warning">{t('execution.health.atRisk', 'En Riesgo')}</Badge>;
      case 'DELAYED':
        return <Badge variant="danger">{t('execution.health.delayed', 'Desviado')}</Badge>;
      default:
        return <Badge variant="gray">{t('execution.health.unknown', 'No Determinado')}</Badge>;
    }
  };

  const openIncidents = execution.incidents.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');
  const criticalIncidents = openIncidents.filter((i) => i.priority === 'CRITICAL');
  const pendingApprovals = execution.changeOrders.filter((c) => c.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-6">
      {/* Botones de Vistas de Rol y Acciones de Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-dark-card border border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {t('execution.dashboard.title', 'Centro de Mando de Ejecución y Obra')}
            </h3>
            <p className="text-xs text-gray-400">
              Estado operativo real, aprovisionamientos, diario de obra y control de desviaciones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<UserCheck size={15} className="text-sky-400" />}
            onClick={onOpenClientView}
          >
            {t('execution.clientView.btn', 'Vista Cliente')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<ShieldCheck size={15} className="text-emerald-400" />}
            onClick={onOpenContractorView}
          >
            {t('execution.contractorView.btn', 'Vista Contratista')}
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white shadow-md shadow-brand-500/20"
            icon={<CheckCircle2 size={15} />}
            onClick={onOpenClosureModal}
          >
            {t('execution.closure.btn', 'Cierre de Obra')}
          </Button>
        </div>
      </div>

      {/* 6 Indicadores Independientes de Salud de Obra */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={14} className="text-brand-400" />
          {t('execution.health.title', 'Indicadores de Salud del Proyecto')}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Schedule */}
          <Card className="p-4 bg-dark-surface border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Clock size={14} className="text-sky-400" /> {t('execution.health.schedule', 'Plazos y Cronograma')}
              </span>
              {getHealthBadge(health.scheduleStatus)}
            </div>
            <p className="text-xs text-gray-400">{health.explanations.schedule}</p>
          </Card>

          {/* 2. Cost */}
          <Card className="p-4 bg-dark-surface border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" /> {t('execution.health.cost', 'Control Económico')}
              </span>
              {getHealthBadge(health.costStatus)}
            </div>
            <p className="text-xs text-gray-400">{health.explanations.cost}</p>
          </Card>

          {/* 3. Progress */}
          <Card className="p-4 bg-dark-surface border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Activity size={14} className="text-purple-400" /> {t('execution.health.progress', 'Ritmo de Avance')}
              </span>
              {getHealthBadge(health.progressStatus)}
            </div>
            <p className="text-xs text-gray-400">{health.explanations.progress}</p>
          </Card>

          {/* 4. Materials */}
          <Card className="p-4 bg-dark-surface border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Package size={14} className="text-amber-400" /> {t('execution.health.material', 'Materiales y Acopio')}
              </span>
              {getHealthBadge(health.materialStatus)}
            </div>
            <p className="text-xs text-gray-400">{health.explanations.material}</p>
          </Card>

          {/* 5. Incidents */}
          <Card className="p-4 bg-dark-surface border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-red-400" /> {t('execution.health.incident', 'Incidencias en Obra')}
              </span>
              {getHealthBadge(health.incidentStatus)}
            </div>
            <p className="text-xs text-gray-400">{health.explanations.incident}</p>
          </Card>

          {/* 6. Quality */}
          <Card className="p-4 bg-dark-surface border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-teal-400" /> {t('execution.health.quality', 'Calidad Técnica')}
              </span>
              {getHealthBadge(health.qualityStatus)}
            </div>
            <p className="text-xs text-gray-400">{health.explanations.quality}</p>
          </Card>
        </div>
      </div>

      {/* Tarjetas de Resumen Numérico Comparativo (Estimado vs Real) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={14} className="text-brand-400" /> {t('execution.summary.progress', 'Avance Real')}
          </span>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-2xl font-black text-brand-400">{execution.progress}%</p>
            <div className="flex-1 bg-dark-card rounded-full h-2.5 overflow-hidden border border-dark-border">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${execution.progress}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            {execution.tasks.filter((t) => t.status === 'COMPLETED').length} de {execution.tasks.length} tareas terminadas
          </p>
        </Card>

        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-sky-400" /> {t('execution.summary.schedule', 'Desviación Temporal')}
          </span>
          <p className="text-2xl font-black text-white mt-1">
            {scheduleVariance.delayDays > 0 ? `+${scheduleVariance.delayDays} d` : `${scheduleVariance.actualDurationDays} d`}
          </p>
          <p className="text-[11px] text-gray-400">
            Plan: {scheduleVariance.plannedDurationDays} d • Real estimado: {scheduleVariance.actualDurationDays + scheduleVariance.remainingDurationDays} d
          </p>
        </Card>

        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign size={14} className="text-emerald-400" /> {t('execution.summary.cost', 'Coste Real / Comprometido')}
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {costVariance.actualCost.toFixed(0)} €
          </p>
          <p className="text-[11px] text-gray-400">
            Presupuesto: {costVariance.v11Budget.toFixed(0)} € (Desv: {costVariance.varianceAbsolute >= 0 ? '+' : ''}{costVariance.varianceAbsolute.toFixed(0)} €)
          </p>
        </Card>

        <Card className="p-4 bg-dark-surface border-dark-border space-y-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} /> {t('execution.summary.incidents', 'Atención Requerida')}
          </span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {openIncidents.length + pendingApprovals.length}
          </p>
          <p className="text-[11px] text-gray-400">
            {criticalIncidents.length} críticas • {pendingApprovals.length} cambios pendientes
          </p>
        </Card>
      </div>

      {/* Grid Inferior: Próximos Hitos & Diario Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Hitos */}
        <Card className="p-5 bg-dark-surface border-dark-border space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={15} className="text-brand-400" />
              {t('execution.milestones.title', 'Hitos Principales de Obra')}
            </h4>
            <Button size="sm" variant="ghost" onClick={() => onSelectTab('milestones')}>
              Ver todos
            </Button>
          </div>

          <div className="space-y-2.5">
            {execution.milestones.slice(0, 4).map((ms) => (
              <div
                key={ms.id}
                className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border/60 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-200">{ms.title}</p>
                  <p className="text-[11px] text-gray-400">Objetivo: {ms.targetDate.split('T')[0]}</p>
                </div>
                <Badge
                  variant={
                    ms.status === 'COMPLETED'
                      ? 'brand'
                      : ms.status === 'IN_PROGRESS'
                      ? 'info'
                      : ms.status === 'DELAYED'
                      ? 'danger'
                      : 'gray'
                  }
                >
                  {ms.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Diario de Obra Reciente */}
        <Card className="p-5 bg-dark-surface border-dark-border space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet size={15} className="text-sky-400" />
              {t('execution.dailyLogs.title', 'Últimos Diarios de Obra')}
            </h4>
            <Button size="sm" variant="ghost" onClick={() => onSelectTab('dailyLogs')}>
              Ver todos
            </Button>
          </div>

          <div className="space-y-2.5">
            {execution.dailyLogs.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">
                No hay registros en el diario de obra todavía.
              </p>
            ) : (
              execution.dailyLogs.slice(0, 3).map((dl) => (
                <div
                  key={dl.id}
                  className="p-3 rounded-xl bg-dark-card border border-dark-border/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-400">{dl.date.split('T')[0]}</span>
                    <span className="text-[11px] text-gray-400">{dl.weatherConditions || 'Soleado / Normal'}</span>
                  </div>
                  {dl.observations && (
                    <p className="text-gray-300 text-[11px] line-clamp-2">{dl.observations}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
