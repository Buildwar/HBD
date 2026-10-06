import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderKanban, Save, RotateCcw, AlertCircle, Grid, Layers, Eye } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { settingsService } from '../../services/settings.service.js';
import type { ProjectSettingsDto } from '@hbd/shared';

interface SettingsProjectsTabProps {
  isAdmin: boolean;
  onShowSavedToast: () => void;
}

export const SettingsProjectsTab: React.FC<SettingsProjectsTabProps> = ({
  isAdmin,
  onShowSavedToast,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<ProjectSettingsDto>({
    defaultWallHeight: 2.6,
    defaultWallThickness: 0.15,
    defaultInitialView: '2d',
    autoSaveIntervalSeconds: 60,
    defaultPropertyType: 'APARTMENT',
    defaultSnapGrid: true,
    defaultSnapGridSize: 0.1,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsService.getProjectSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las preferencias de proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      const res = await settingsService.updateProjectSettings(settings);
      if (res.success && res.data) {
        setSettings(res.data);
        onShowSavedToast();
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      setError(null);
      await settingsService.resetSection('projects');
      await loadSettings();
      onShowSavedToast();
    } catch (err: any) {
      setError(err.message || 'Error al restablecer las preferencias');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">{t('settings.projects.title')}</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('settings.projects.title')}</h3>
              <p className="text-xs text-gray-400">
                {t('settings.projects.subtitle')}
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
              {resetting ? '...' : t('settings.projects.reset')}
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
          {/* Dimensiones Estructurales por Defecto */}
          <div className="space-y-4 p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Layers size={15} className="text-primary-400" />
              {t('settings.projects.geometryHeading')}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {t('settings.projects.defaultCeilingHeight')}
              </label>
              <input
                type="number"
                step="0.05"
                min="1.8"
                max="6.0"
                value={settings.defaultWallHeight}
                onChange={(e) =>
                  setSettings({ ...settings, defaultWallHeight: parseFloat(e.target.value) || 2.6 })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {t('settings.projects.defaultWallThickness')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="0.80"
                value={settings.defaultWallThickness}
                onChange={(e) =>
                  setSettings({ ...settings, defaultWallThickness: parseFloat(e.target.value) || 0.15 })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('projects.propertyType')}
              </label>
              <select
                value={settings.defaultPropertyType}
                onChange={(e) =>
                  setSettings({ ...settings, defaultPropertyType: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="APARTMENT">{t('properties.apartment')}</option>
                <option value="HOUSE">{t('properties.house')}</option>
                <option value="OFFICE">{t('projects.office')}</option>
                <option value="COMMERCIAL">{t('projects.commercial')}</option>
              </select>
            </div>
          </div>

          {/* Interfaz y Editor de Plano */}
          <div className="space-y-4 p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Eye size={15} className="text-primary-400" />
              {t('settings.projects.gridHeading')}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.projects.defaultScale')}
              </label>
              <select
                value={settings.defaultInitialView}
                onChange={(e) =>
                  setSettings({ ...settings, defaultInitialView: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="2d">2D Floor Plan</option>
                <option value="3d">3D Viewer</option>
                <option value="details">Project Details</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.projects.autoSaveInterval')}
              </label>
              <select
                value={settings.autoSaveIntervalSeconds}
                onChange={(e) =>
                  setSettings({ ...settings, autoSaveIntervalSeconds: parseInt(e.target.value, 10) })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value={30}>30s</option>
                <option value={60}>60s</option>
                <option value={120}>120s</option>
                <option value={300}>300s</option>
                <option value={0}>Manual</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-dark-card border border-dark-border cursor-pointer hover:border-dark-border/80">
                <input
                  type="checkbox"
                  checked={settings.defaultSnapGrid}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultSnapGrid: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-500 rounded bg-dark-bg border-dark-border"
                />
                <div className="flex items-center gap-2">
                  <Grid size={15} className="text-gray-400" />
                  <span className="text-xs text-gray-200">
                    {t('settings.projects.snapToGrid')}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-dark-border/60">
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6"
          >
            <Save size={16} />
            {saving ? '...' : t('settings.projects.save')}
          </Button>
        </div>
      </Card>
    </form>
  );
};
