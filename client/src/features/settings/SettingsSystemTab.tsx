import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Activity, CheckCircle2, AlertTriangle, AlertCircle, XCircle, RefreshCw, Play, Cpu, HardDrive, Database, Globe } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { settingsService } from '../../services/settings.service.js';
import type { SystemHealthDto, SystemDiagnosticsResultDto } from '@hbd/shared';

interface SettingsSystemTabProps {
  isAdmin: boolean;
}

export const SettingsSystemTab: React.FC<SettingsSystemTabProps> = ({ isAdmin }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [runningDiag, setRunningDiag] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [health, setHealth] = useState<SystemHealthDto | null>(null);
  const [diagResult, setDiagResult] = useState<SystemDiagnosticsResultDto | null>(null);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsService.getSystemHealth();
      if (res.success && res.data) {
        setHealth(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading system health');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostics = async () => {
    if (!isAdmin) return;
    try {
      setRunningDiag(true);
      setError(null);
      const res = await settingsService.runSystemDiagnostics();
      if (res.success && res.data) {
        setDiagResult(res.data);
        await loadHealth();
      }
    } catch (err: any) {
      setError(err.message || 'Error running diagnostics');
    } finally {
      setRunningDiag(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'online':
      case 'configured':
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ONLINE
          </span>
        );
      case 'mock_mode':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            MOCK
          </span>
        );
      case 'degraded':
      case 'warn':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            OFFLINE
          </span>
        );
    }
  };

  if (loading && !health) {
    return (
      <Card className="p-8 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">{t('settings.system.title')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Server size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('settings.system.title')}</h3>
              <p className="text-xs text-gray-400">
                {t('settings.system.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadHealth}
              disabled={loading || runningDiag}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </Button>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunDiagnostics}
                disabled={runningDiag}
                className="text-xs flex items-center gap-1.5"
              >
                <Play size={14} className={runningDiag ? 'animate-spin' : ''} />
                {runningDiag ? '...' : 'Diagnostics'}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tarjetas de Salud de Servicios */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Globe size={14} className="text-primary-400" />
              Frontend
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">React UI</span>
              {getStatusBadge(health?.frontendStatus)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Server size={14} className="text-sky-400" />
              Backend API
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Node / Express</span>
              {getStatusBadge(health?.backendStatus)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Database size={14} className="text-indigo-400" />
              PostgreSQL
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Prisma ORM</span>
              {getStatusBadge(health?.databaseStatus)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <HardDrive size={14} className="text-emerald-400" />
              {t('settings.storage.uploadDir')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{t("settings.system.localDisk")}</span>
              {getStatusBadge(health?.storageStatus)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Cpu size={14} className="text-purple-400" />
              {t('settings.ai.designHeading')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{t("settings.system.aiCore")}</span>
              {getStatusBadge(health?.aiStatus)}
            </div>
          </div>
        </div>

        {/* Métricas del Entorno */}
        {health && (
          <div className="p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40 space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              {t('about.environment')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                <span className="text-gray-500 text-[11px]">{t('settings.system.platform')}</span>
                <p className="font-bold text-white mt-1">{health.platform}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                <span className="text-gray-500 text-[11px]">{t('settings.system.nodeVersion')}</span>
                <p className="font-bold text-white mt-1">{health.nodeVersion}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                <span className="text-gray-500 text-[11px]">{t("settings.system.heapMemory")}</span>
                <p className="font-bold text-emerald-400 mt-1">{health.memoryUsageFormatted}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                <span className="text-gray-500 text-[11px]">{t('about.uptime')}</span>
                <p className="font-bold text-sky-400 mt-1">{health.uptimeSeconds} s</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultado del Diagnóstico */}
        {diagResult && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Activity size={15} className="text-primary-400" />
                Diagnostics Report ({new Date(diagResult.timestamp).toLocaleTimeString()})
              </h4>
              <span className="text-xs text-gray-400">
                Total: {diagResult.durationTotalMs} ms
              </span>
            </div>

            <div className="space-y-2">
              {diagResult.checks.map((check) => (
                <div
                  key={check.id}
                  className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-start justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {check.status === 'ok' ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : check.status === 'warn' ? (
                      <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-white">{check.name}</p>
                      <p className="text-gray-400 mt-0.5">{check.message}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono shrink-0">
                    {check.durationMs} ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
