import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  User,
  Users,
  Shield,
  Palette,
  Globe,
  FolderKanban,
  Brain,
  HardDrive,
  Lock,
  Server,
  Info,
  Check,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Input } from '../components/ui/Input.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme, ACCENT_PALETTES, ThemeMode, Density } from '../context/ThemeContext.js';
import { settingsService, SystemInfo } from '../services/settings.service.js';
import { APP_CONFIG } from '../config/app.config.js';

type TabType =
  | 'general'
  | 'account'
  | 'users'
  | 'roles'
  | 'appearance'
  | 'language'
  | 'projects'
  | 'ai'
  | 'storage'
  | 'security'
  | 'system'
  | 'about';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    borderRadius,
    setBorderRadius,
    density,
    setDensity,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [isSavedAlert, setIsSavedAlert] = useState<boolean>(false);

  // Perfil / Cuenta edit
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      const [aboutRes, usersRes, rolesRes] = await Promise.all([
        settingsService.getAboutInfo().catch(() => null),
        settingsService.getUsers().catch(() => null),
        settingsService.getRoles().catch(() => null),
      ]);
      if (aboutRes?.data) setSystemInfo(aboutRes.data);
      if (usersRes?.data) setUsersList(usersRes.data);
      if (rolesRes?.data) setRolesList(rolesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ name, email });
      setIsSavedAlert(true);
      setTimeout(() => setIsSavedAlert(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    if (user) {
      updateUserProfile({ language: lang }).catch(console.error);
    }
  };

  const tabs = [
    { id: 'general' as TabType, label: t('settings.tabs.general'), icon: SettingsIcon },
    { id: 'account' as TabType, label: t('settings.tabs.account'), icon: User },
    { id: 'appearance' as TabType, label: t('settings.tabs.appearance'), icon: Palette },
    { id: 'language' as TabType, label: t('settings.tabs.language'), icon: Globe },
    { id: 'users' as TabType, label: t('settings.tabs.users'), icon: Users, adminOnly: true },
    { id: 'roles' as TabType, label: t('settings.tabs.roles'), icon: Shield, adminOnly: true },
    { id: 'projects' as TabType, label: t('settings.tabs.projects'), icon: FolderKanban },
    { id: 'ai' as TabType, label: t('settings.tabs.ai'), icon: Brain },
    { id: 'storage' as TabType, label: t('settings.tabs.storage'), icon: HardDrive },
    { id: 'security' as TabType, label: t('settings.tabs.security'), icon: Lock },
    { id: 'system' as TabType, label: t('settings.tabs.system'), icon: Server },
    { id: 'about' as TabType, label: t('settings.tabs.about'), icon: Info },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <div className="p-8 max-w-7xl mx-auto w-full">
        {isSavedAlert && (
          <div className="mb-6 p-4 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold flex items-center gap-2">
            <Check size={16} />
            {t('settings.savedSuccess')}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navegación Lateral de Pestañas */}
          <div className="space-y-1">
            {tabs.map((tab) => {
              if (tab.adminOnly && user?.role?.name !== 'ADMIN') return null;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white font-semibold shadow-md shadow-brand-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-dark-surface'
                  }`}
                >
                  <tab.icon size={17} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido de la Pestaña Activa */}
          <div className="lg:col-span-3">
            {/* 1. APARIENCIA */}
            {activeTab === 'appearance' && (
              <Card className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Personalización de Apariencia</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Ajusta el tema visual, colores de acento, bordes y densidad según tu preferencia.
                  </p>
                </div>

                {/* Modo de tema */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {t('settings.appearance.themeMode')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setThemeMode('dark')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        themeMode === 'dark'
                          ? 'bg-dark-card border-brand-500 text-white shadow-lg'
                          : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                      }`}
                    >
                      <Moon size={20} className={themeMode === 'dark' ? 'text-brand-400' : ''} />
                      <span className="text-xs font-semibold">{t('settings.appearance.dark')}</span>
                    </button>

                    <button
                      onClick={() => setThemeMode('light')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        themeMode === 'light'
                          ? 'bg-dark-card border-brand-500 text-white shadow-lg'
                          : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                      }`}
                    >
                      <Sun size={20} className={themeMode === 'light' ? 'text-brand-400' : ''} />
                      <span className="text-xs font-semibold">{t('settings.appearance.light')}</span>
                    </button>

                    <button
                      onClick={() => setThemeMode('system')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        themeMode === 'system'
                          ? 'bg-dark-card border-brand-500 text-white shadow-lg'
                          : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                      }`}
                    >
                      <Laptop size={20} className={themeMode === 'system' ? 'text-brand-400' : ''} />
                      <span className="text-xs font-semibold">{t('settings.appearance.system')}</span>
                    </button>
                  </div>
                </div>

                {/* Color de Acento */}
                <div className="space-y-3 pt-4 border-t border-dark-border/50">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {t('settings.appearance.accentColor')}
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {ACCENT_PALETTES.map((pal) => (
                      <button
                        key={pal.hex}
                        onClick={() => setAccentColor(pal.hex)}
                        className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          accentColor === pal.hex
                            ? 'bg-dark-card border-white text-white shadow-md'
                            : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: pal.hex }}
                        />
                        <span>{pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Radio de Bordes */}
                <div className="space-y-3 pt-4 border-t border-dark-border/50">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {t('settings.appearance.borderRadius')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Reducido (8px)', value: '0.5rem' },
                      { label: 'Normal (12px)', value: '0.75rem' },
                      { label: 'Redondeado (16px)', value: '1rem' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setBorderRadius(item.value)}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                          borderRadius === item.value
                            ? 'bg-dark-card border-brand-500 text-white'
                            : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Densidad */}
                <div className="space-y-3 pt-4 border-t border-dark-border/50">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {t('settings.appearance.density')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['compact', 'normal', 'comfortable'] as Density[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={`p-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                          density === d
                            ? 'bg-dark-card border-brand-500 text-white'
                            : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                        }`}
                      >
                        {t(`settings.appearance.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* 2. IDIOMA */}
            {activeTab === 'language' && (
              <Card className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">Configuración de Idioma (i18n)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Selecciona tu idioma preferido para toda la plataforma.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                      i18n.language.startsWith('es')
                        ? 'bg-dark-card border-brand-500 text-white'
                        : 'bg-dark-surface border-dark-border text-gray-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">Español (Castellano)</p>
                      <p className="text-xs text-gray-400 mt-0.5">Idioma nativo y predeterminado</p>
                    </div>
                    {i18n.language.startsWith('es') && <Badge variant="brand">Activo</Badge>}
                  </button>

                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                      i18n.language.startsWith('en')
                        ? 'bg-dark-card border-brand-500 text-white'
                        : 'bg-dark-surface border-dark-border text-gray-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">English (International)</p>
                      <p className="text-xs text-gray-400 mt-0.5">English localization</p>
                    </div>
                    {i18n.language.startsWith('en') && <Badge variant="brand">Active</Badge>}
                  </button>
                </div>
              </Card>
            )}

            {/* 3. CUENTA */}
            {activeTab === 'account' && (
              <Card className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">Información de Cuenta</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Gestiona tus datos personales y credenciales.</p>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-4">
                  <Input
                    label="Nombre Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label="Nombre de Usuario"
                    value={user?.username || ''}
                    disabled
                    helperText="El nombre de usuario no es modificable directamente."
                  />

                  <div className="pt-3">
                    <Button type="submit">{t('settings.saveChanges')}</Button>
                  </div>
                </form>
              </Card>
            )}

            {/* 4. USUARIOS (Admin) */}
            {activeTab === 'users' && (
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Gestión de Usuarios</h3>
                    <p className="text-xs text-gray-400">Usuarios registrados en la plataforma HBD.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-dark-card text-gray-400 uppercase font-semibold border-b border-dark-border">
                      <tr>
                        <th className="px-4 py-3">Usuario</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Rol</th>
                        <th className="px-4 py-3">Proyectos</th>
                        <th className="px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/50">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-dark-card/40">
                          <td className="px-4 py-3 font-semibold text-white">{u.name} ({u.username})</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant="brand">{u.role?.name || 'USER'}</Badge>
                          </td>
                          <td className="px-4 py-3">{u.projectsCount || 0}</td>
                          <td className="px-4 py-3">
                            <Badge variant={u.isActive ? 'success' : 'danger'}>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* 5. ROLES (Admin) */}
            {activeTab === 'roles' && (
              <Card className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Roles del Sistema (RBAC)</h3>
                  <p className="text-xs text-gray-400">Roles predefinidos y permisos asociados.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rolesList.map((role) => (
                    <div key={role.id} className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{role.name}</h4>
                        <Badge variant="gray">{role._count?.users || 0} usuarios</Badge>
                      </div>
                      <p className="text-xs text-gray-400">{role.description}</p>
                      <div className="pt-2 flex flex-wrap gap-1">
                        {role.permissions?.map((p: any) => (
                          <span key={p.permission.id} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-surface text-gray-400 border border-dark-border">
                            {p.permission.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 6. ACERCA DE */}
            {activeTab === 'about' && (
              <Card className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">{APP_CONFIG.name}</h3>
                  <p className="text-xs text-brand-400 font-semibold mt-0.5">{APP_CONFIG.tagline}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1">
                    <span className="text-gray-400 font-medium">Desarrollado y propiedad de</span>
                    <p className="text-base font-bold text-white">{APP_CONFIG.author}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1">
                    <span className="text-gray-400 font-medium">Versión del Sistema</span>
                    <p className="text-base font-bold text-brand-400">v{APP_CONFIG.version}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1 sm:col-span-2">
                    <span className="text-gray-400 font-medium">Copyright & Propiedad Intelectual</span>
                    <p className="text-sm font-semibold text-gray-200">{APP_CONFIG.copyright}</p>
                  </div>
                </div>

                {systemInfo && (
                  <div className="pt-4 border-t border-dark-border/50 space-y-3">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Estado de Infraestructura
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                        <span className="text-gray-400">Base de Datos</span>
                        <p className="font-bold text-emerald-400 mt-0.5">PostgreSQL Conectado</p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                        <span className="text-gray-400">Entorno</span>
                        <p className="font-bold text-white mt-0.5 capitalize">{systemInfo.environment}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                        <span className="text-gray-400">Tiempo de Actividad</span>
                        <p className="font-bold text-sky-400 mt-0.5">{systemInfo.uptimeSeconds} seg</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* OTRAS PESTAÑAS PREPARADAS */}
            {['general', 'projects', 'ai', 'storage', 'security', 'system'].includes(activeTab) && (
              <Card className="space-y-4 text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-dark-card flex items-center justify-center text-gray-400 mx-auto">
                  <SettingsIcon size={24} />
                </div>
                <h4 className="text-base font-bold text-white capitalize">
                  Configuración de {activeTab}
                </h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Módulo configurado en la arquitectura central de HBD. Las opciones avanzadas se activarán en sus fases correspondientes.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
