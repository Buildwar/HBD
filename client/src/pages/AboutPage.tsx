import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Layers, CheckCircle2, Server, Database, User, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { APP_CONFIG } from '../config/app.config.js';
import { HbdLogo } from '../components/common/HbdLogo.js';
import { settingsService, SystemInfo } from '../services/settings.service.js';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    settingsService.getAboutInfo().then((res) => {
      if (res.data) setSystemInfo(res.data);
    }).catch(console.error);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={t('about.title')}
        subtitle={t('about.subtitle')}
      />

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Tarjeta Principal de Identidad */}
        <Card className="p-8 bg-gradient-to-br from-dark-surface via-dark-card to-dark-bg border-dark-border text-center flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center mb-1">
            <HbdLogo variant="horizontal" mode="dark" className="h-16 w-auto max-w-[320px] object-contain" alt="HBD — Home Board Designer" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white">{APP_CONFIG.name}</h2>
            <p className="text-sm font-semibold text-brand-400">{APP_CONFIG.tagline}</p>
          </div>

          <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
            {APP_CONFIG.description}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Badge variant="brand" size="md">{t('about.version')} {APP_CONFIG.version}</Badge>
          </div>
        </Card>

        {/* Autoría y Créditos Oficiales */}
        <Card className="space-y-4 p-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <User size={15} className="text-brand-400" />
            {t('about.authorshipAndOwnership')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1">
              <span className="text-gray-400">{t('about.developedBy')}</span>
              <p className="text-base font-bold text-white">{APP_CONFIG.author}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1">
              <span className="text-gray-400">{t('about.version')}</span>
              <p className="text-base font-bold text-brand-400">{APP_CONFIG.version}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1 sm:col-span-2">
              <span className="text-gray-400">{t('about.copyright')}</span>
              <p className="text-sm font-semibold text-gray-200">{APP_CONFIG.copyright}</p>
            </div>
          </div>
        </Card>

        {/* Estado del Sistema */}
        <Card className="space-y-4 p-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400" />
            {t('about.systemStatus')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1">
              <div className="flex items-center gap-2 text-gray-400">
                <Database size={14} className="text-emerald-400" />
                <span>{t('about.database')}</span>
              </div>
              <p className="text-sm font-bold text-emerald-400">{t('about.dbStatusActive')}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1">
              <div className="flex items-center gap-2 text-gray-400">
                <Server size={14} className="text-sky-400" />
                <span>{t('about.environment')}</span>
              </div>
              <p className="text-sm font-bold text-white capitalize">{systemInfo?.environment || 'development'}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1">
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 size={14} className="text-indigo-400" />
                <span>{t('about.platform')}</span>
              </div>
              <p className="text-sm font-bold text-indigo-400">{t('about.platformStatus')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
