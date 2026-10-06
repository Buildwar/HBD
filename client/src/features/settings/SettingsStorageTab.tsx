import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HardDrive, Database, Image, FileText, Box, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { settingsService } from '../../services/settings.service.js';
import type { StorageSummaryDto } from '@hbd/shared';

interface SettingsStorageTabProps {
  isAdmin: boolean;
  onShowSavedToast: () => void;
}

export const SettingsStorageTab: React.FC<SettingsStorageTabProps> = ({
  isAdmin,
  onShowSavedToast,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cleanFeedback, setCleanFeedback] = useState<string | null>(null);

  const [storage, setStorage] = useState<StorageSummaryDto>({
    databaseSizeBytes: 0,
    uploadsSizeBytes: 0,
    projectsCount: 0,
    floorPlansCount: 0,
    rendersCount: 0,
    digitalTwinsCount: 0,
    documentsCount: 0,
    uploadsCount: 0,
    scratchFilesCount: 0,
    formattedDatabaseSize: '0 B',
    formattedUploadsSize: '0 B',
  });

  useEffect(() => {
    loadStorage();
  }, []);

  const loadStorage = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsService.getStorageSummary();
      if (res.success && res.data) {
        setStorage(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading storage statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!isAdmin) return;
    try {
      setCleaning(true);
      setError(null);
      setCleanFeedback(null);
      const res = await settingsService.cleanupStorage();
      if (res.success) {
        setCleanFeedback(res.message || 'Storage cleanup completed.');
        await loadStorage();
        onShowSavedToast();
      }
    } catch (err: any) {
      setError(err.message || 'Error executing cleanup');
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">{t('settings.storage.title')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <HardDrive size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('settings.storage.title')}</h3>
              <p className="text-xs text-gray-400">
                {t('settings.storage.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStorage}
              disabled={loading || cleaning}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanup}
                disabled={cleaning}
                className="text-xs flex items-center gap-1.5 text-amber-400 hover:text-amber-300 border-amber-500/30"
              >
                <Trash2 size={14} />
                {cleaning ? '...' : t('settings.storage.reset')}
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

        {cleanFeedback && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{cleanFeedback}</span>
          </div>
        )}

        {/* Resumen Principal de Huella */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Database size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-400">{t("settings.storage.postgres")}</span>
              <p className="text-xl font-bold text-white mt-0.5">{storage.formattedDatabaseSize}</p>
              <span className="text-[11px] text-gray-500">
                {storage.projectsCount} {t('projects.title').toLowerCase()}, {storage.floorPlansCount} {t('nav.plans').toLowerCase()}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <HardDrive size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-400">{t('settings.storage.uploadDir')}</span>
              <p className="text-xl font-bold text-white mt-0.5">{storage.formattedUploadsSize}</p>
              <span className="text-[11px] text-gray-500">
                {storage.uploadsCount} files
              </span>
            </div>
          </div>
        </div>

        {/* Desglose por Tipos de Entidades */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
              <div className="flex items-center gap-2 text-primary-400 text-xs font-semibold mb-1">
                <Image size={15} />
                {t('nav.renders')}
              </div>
              <p className="text-lg font-bold text-white">{storage.rendersCount}</p>
            </div>

            <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
                <Box size={15} />
                {t('products.catalogTab')}
              </div>
              <p className="text-lg font-bold text-white">{storage.digitalTwinsCount}</p>
            </div>

            <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <FileText size={15} />
                {t('documents.title')}
              </div>
              <p className="text-lg font-bold text-white">{storage.documentsCount}</p>
            </div>

            <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                <Trash2 size={15} />
                Cache
              </div>
              <p className="text-lg font-bold text-white">{storage.scratchFilesCount}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
