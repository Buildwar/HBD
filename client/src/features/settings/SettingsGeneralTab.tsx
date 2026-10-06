import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { settingsService } from '../../services/settings.service.js';
import type { GeneralSettingsDto } from '@hbd/shared';

interface SettingsGeneralTabProps {
  isAdmin: boolean;
  onShowSavedToast: () => void;
}

export const SettingsGeneralTab: React.FC<SettingsGeneralTabProps> = ({
  isAdmin,
  onShowSavedToast,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<GeneralSettingsDto>({
    displayUnit: 'm',
    areaUnit: 'm2',
    defaultCurrency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberSeparator: 'comma_dot',
    confirmOnDelete: true,
    confirmOnReset: true,
    showTooltips: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsService.getGeneralSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la configuración general');
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
      const res = await settingsService.updateGeneralSettings(settings);
      if (res.success) {
        onShowSavedToast();
      } else {
        setError(res.error || 'Error al guardar');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!isAdmin) return;
    try {
      setResetting(true);
      setError(null);
      await settingsService.resetSection('general');
      await loadSettings();
      onShowSavedToast();
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la configuración');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">{t('settings.general.loading')}</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('settings.general.title')}</h3>
              <p className="text-xs text-gray-400">
                {t('settings.general.subtitle')}
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
              {resetting ? t('settings.general.resetting') : t('settings.general.reset')}
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
          {/* Unidades de Medida */}
          <div className="space-y-4 p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              {t('settings.general.unitsHeading')}
            </h4>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.general.displayUnit')}
              </label>
              <select
                disabled={!isAdmin}
                value={settings.displayUnit}
                onChange={(e) =>
                  setSettings({ ...settings, displayUnit: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="m">Metros (m)</option>
                <option value="cm">Centímetros (cm)</option>
                <option value="mm">Milímetros (mm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.general.areaUnit')}
              </label>
              <select
                disabled={!isAdmin}
                value={settings.areaUnit}
                onChange={(e) =>
                  setSettings({ ...settings, areaUnit: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="m2">m²</option>
                <option value="sqft">sq ft</option>
              </select>
            </div>
          </div>

          {/* Formato y Moneda */}
          <div className="space-y-4 p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              {t('settings.general.currencyHeading')}
            </h4>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.general.defaultCurrency')}
              </label>
              <select
                disabled={!isAdmin}
                value={settings.defaultCurrency}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCurrency: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="EUR">Euro (€ - EUR)</option>
                <option value="USD">USD ($ - USD)</option>
                <option value="GBP">GBP (£ - GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.general.dateFormat')}
              </label>
              <select
                disabled={!isAdmin}
                value={settings.dateFormat}
                onChange={(e) =>
                  setSettings({ ...settings, dateFormat: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.general.numberSeparator')}
              </label>
              <select
                disabled={!isAdmin}
                value={settings.numberSeparator}
                onChange={(e) =>
                  setSettings({ ...settings, numberSeparator: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="comma_dot">1.250,50 (Europe)</option>
                <option value="dot_comma">1,250.50 (US / UK)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Diálogos de Confirmación y UX */}
        <div className="p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40 space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            {t('settings.general.confirmationsHeading')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-lg bg-dark-card border border-dark-border cursor-pointer hover:border-dark-border/80">
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={settings.confirmOnDelete}
                onChange={(e) =>
                  setSettings({ ...settings, confirmOnDelete: e.target.checked })
                }
                className="w-4 h-4 text-primary-500 rounded bg-dark-bg border-dark-border"
              />
              <span className="text-xs text-gray-200">
                {t('settings.general.confirmOnDelete')}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-dark-card border border-dark-border cursor-pointer hover:border-dark-border/80">
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={settings.showTooltips}
                onChange={(e) =>
                  setSettings({ ...settings, showTooltips: e.target.checked })
                }
                className="w-4 h-4 text-primary-500 rounded bg-dark-bg border-dark-border"
              />
              <span className="text-xs text-gray-200">
                {t('settings.general.showTooltips')}
              </span>
            </label>
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
              {saving ? '...' : t('settings.general.save')}
            </Button>
          </div>
        )}
      </Card>
    </form>
  );
};
