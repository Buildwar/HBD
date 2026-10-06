import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, Save, RotateCcw, AlertCircle, History } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { settingsService } from '../../services/settings.service.js';
import type { SecuritySettingsDto, AuditLogEntryDto } from '@hbd/shared';

interface SettingsSecurityTabProps {
  isAdmin: boolean;
  onShowSavedToast: () => void;
  onOpenChangePasswordModal: () => void;
}

export const SettingsSecurityTab: React.FC<SettingsSecurityTabProps> = ({
  isAdmin,
  onShowSavedToast,
  onOpenChangePasswordModal,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SecuritySettingsDto>({
    passwordMinLength: 6,
    passwordRequireUppercase: false,
    passwordRequireNumber: false,
    passwordRequireSpecial: false,
    sessionTimeoutHours: 168,
    maxActiveSessions: 5,
    auditLogRetentionDays: 90,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntryDto[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [secRes, logsRes] = await Promise.all([
        settingsService.getSecuritySettings(),
        isAdmin ? settingsService.getAuditLogs(15) : Promise.resolve({ success: true, data: [] }),
      ]);

      if (secRes.success && secRes.data) {
        setSettings(secRes.data);
      }
      if (logsRes.success && logsRes.data) {
        setAuditLogs(logsRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      setSaving(true);
      setError(null);
      const res = await settingsService.updateSecuritySettings(settings);
      if (res.success && res.data) {
        setSettings(res.data);
        onShowSavedToast();
      }
    } catch (err: any) {
      setError(err.message || 'Error saving security settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!isAdmin) return;
    try {
      setResetting(true);
      setError(null);
      await settingsService.resetSection('security');
      await loadData();
      onShowSavedToast();
    } catch (err: any) {
      setError(err.message || 'Error resetting security settings');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">{t('settings.security.title')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Acciones de Cuenta y Contraseña del Usuario */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('settings.account.changePassword')}</h3>
              <p className="text-xs text-gray-400">
                {t('settings.security.subtitle')}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onOpenChangePasswordModal}
            className="text-xs flex items-center gap-1.5 shrink-0"
          >
            <Lock size={14} />
            {t('settings.account.changePassword')}
          </Button>
        </div>
      </Card>

      {/* Políticas Globales de Seguridad (Admin) */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t('settings.security.title')}</h3>
                <p className="text-xs text-gray-400">
                  {t('settings.security.subtitle')}
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={resetting || saving}
                className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white"
              >
                <RotateCcw size={14} />
                {resetting ? '...' : t('settings.security.reset')}
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requisitos de Contraseña */}
            <div className="space-y-4 p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {t('settings.security.jwtExpiry')}
              </h4>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  JWT Session Expiry
                </label>
                <select
                  disabled={!isAdmin}
                  value={settings.sessionTimeoutHours}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeoutHours: parseInt(e.target.value, 10) })
                  }
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                >
                  <option value={24}>24 Hours</option>
                  <option value={72}>72 Hours</option>
                  <option value={168}>7 Days</option>
                  <option value={720}>30 Days</option>
                </select>
              </div>
            </div>

            {/* Sesiones y Auditoría */}
            <div className="space-y-4 p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {t('settings.security.rateLimit')}
              </h4>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Audit Log Retention (Days)
                </label>
                <select
                  disabled={!isAdmin}
                  value={settings.auditLogRetentionDays}
                  onChange={(e) =>
                    setSettings({ ...settings, auditLogRetentionDays: parseInt(e.target.value, 10) })
                  }
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                >
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={365}>365 Days</option>
                </select>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-4 border-t border-dark-border/60">
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6"
              >
                <Save size={16} />
                {saving ? '...' : t('settings.security.save')}
              </Button>
            </div>
          )}
        </Card>
      </form>

      {/* Registro de Auditoría (Admin) */}
      {isAdmin && auditLogs.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-gray-400" />
            <h4 className="text-sm font-bold text-white">Audit Log</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-dark-card text-gray-400 uppercase font-semibold border-b border-dark-border">
                <tr>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Entity</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-card/40">
                    <td className="px-4 py-2 font-mono">{log.action}</td>
                    <td className="px-4 py-2">{log.entity}</td>
                    <td className="px-4 py-2">{log.userId}</td>
                    <td className="px-4 py-2 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
