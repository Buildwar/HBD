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
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Power,
  Pipette,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Input } from '../components/ui/Input.js';
import { Modal } from '../components/ui/Modal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import { ThemePreview } from '../components/theme/ThemePreview.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme, THEME_PRESETS, ThemeMode, Density } from '../context/ThemeContext.js';
import { settingsService, SystemInfo } from '../services/settings.service.js';
import { APP_CONFIG } from '../config/app.config.js';

type TabType =
  | 'appearance'
  | 'general'
  | 'account'
  | 'users'
  | 'roles'
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
  const [customHex, setCustomHex] = useState<string>(accentColor);

  // Perfil / Cuenta edit
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Gestor de usuarios (Admin)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState<boolean>(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState<boolean>(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<any | null>(null);
  const [confirmToggleUser, setConfirmToggleUser] = useState<any | null>(null);

  // Formulario nuevo usuario
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRoleId, setNewUserRoleId] = useState('');
  const [userActionError, setUserActionError] = useState<string | null>(null);

  useEffect(() => {
    loadSettingsData();
  }, []);

  useEffect(() => {
    setCustomHex(accentColor);
  }, [accentColor]);

  const loadSettingsData = async () => {
    try {
      const [aboutRes, usersRes, rolesRes] = await Promise.all([
        settingsService.getAboutInfo().catch(() => null),
        settingsService.getUsers().catch(() => null),
        settingsService.getRoles().catch(() => null),
      ]);
      if (aboutRes?.data) setSystemInfo(aboutRes.data);
      if (usersRes?.data) setUsersList(usersRes.data);
      if (rolesRes?.data) {
        setRolesList(rolesRes.data);
        if (rolesRes.data.length > 0 && !newUserRoleId) {
          const defaultRole = rolesRes.data.find((r: any) => r.name === 'USER') || rolesRes.data[0];
          setNewUserRoleId(defaultRole.id);
        }
      }
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

  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setAccentColor(hex);
    }
  };

  // Creación de usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);
    try {
      await settingsService.createUser({
        name: newUserName,
        username: newUserUsername,
        email: newUserEmail,
        password: newUserPassword,
        roleId: newUserRoleId,
      });
      setIsCreateUserModalOpen(false);
      setNewUserName('');
      setNewUserUsername('');
      setNewUserEmail('');
      setNewUserPassword('');
      await loadSettingsData();
    } catch (err: any) {
      setUserActionError(err.message || 'Error al crear usuario');
    }
  };

  // Edición de usuario
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;
    try {
      await settingsService.updateUser(selectedUserToEdit.id, {
        name: selectedUserToEdit.name,
        email: selectedUserToEdit.email,
        roleId: selectedUserToEdit.roleId,
        isActive: selectedUserToEdit.isActive,
      });
      setIsEditUserModalOpen(false);
      setSelectedUserToEdit(null);
      await loadSettingsData();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Alternar estado activo de usuario
  const handleToggleUserStatus = async () => {
    if (!confirmToggleUser) return;
    try {
      await settingsService.updateUser(confirmToggleUser.id, {
        isActive: !confirmToggleUser.isActive,
      });
      setConfirmToggleUser(null);
      await loadSettingsData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'appearance' as TabType, label: t('settings.tabs.appearance'), icon: Palette },
    { id: 'language' as TabType, label: t('settings.tabs.language'), icon: Globe },
    { id: 'account' as TabType, label: t('settings.tabs.account'), icon: User },
    { id: 'users' as TabType, label: t('settings.tabs.users'), icon: Users, adminOnly: true },
    { id: 'roles' as TabType, label: t('settings.tabs.roles'), icon: Shield, adminOnly: true },
    { id: 'general' as TabType, label: t('settings.tabs.general'), icon: SettingsIcon },
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
          <div className="mb-6 p-4 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white font-semibold shadow-md shadow-brand-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-dark-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={17} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.adminOnly && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-card border border-dark-border text-gray-400">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Contenido de la Pestaña Activa */}
          <div className="lg:col-span-3">
            {/* 1. APARIENCIA */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <Card className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Sistema de Temas y Personalización</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Personaliza en tiempo real el modo cromático, paleta de acento, bordes y densidad visual.
                    </p>
                  </div>

                  {/* Modo de tema: Oscuro / Claro / Sistema */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      {t('settings.appearance.themeMode')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setThemeMode('dark')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                          themeMode === 'dark'
                            ? 'bg-dark-card border-brand-500 text-white shadow-lg ring-1 ring-brand-500'
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
                            ? 'bg-dark-card border-brand-500 text-white shadow-lg ring-1 ring-brand-500'
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
                            ? 'bg-dark-card border-brand-500 text-white shadow-lg ring-1 ring-brand-500'
                            : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                        }`}
                      >
                        <Laptop size={20} className={themeMode === 'system' ? 'text-brand-400' : ''} />
                        <span className="text-xs font-semibold">{t('settings.appearance.system')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Temas Predefinidos (Paletas de Acento HBD) */}
                  <div className="space-y-3 pt-4 border-t border-dark-border/50">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Temas Predefinidos HBD ({THEME_PRESETS.length} opciones)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {THEME_PRESETS.map((pal) => {
                        const isSelected = accentColor.toLowerCase() === pal.hex.toLowerCase();
                        return (
                          <button
                            key={pal.id}
                            onClick={() => setAccentColor(pal.hex)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-dark-card border-brand-500 text-white shadow-md ring-1 ring-brand-500'
                                : 'bg-dark-surface border-dark-border text-gray-300 hover:text-white hover:bg-dark-card/50'
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full shadow-md shrink-0 border border-white/20"
                              style={{ backgroundColor: pal.hex }}
                            />
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold truncate">{pal.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{pal.hex}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector de Color Personalizado */}
                  <div className="space-y-3 pt-4 border-t border-dark-border/50">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <Pipette size={14} className="text-brand-400" />
                      Color Personalizado (Selector Hexadecimal)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => handleCustomHexChange(e.target.value)}
                        className="w-12 h-10 rounded-xl cursor-pointer bg-dark-card border border-dark-border p-1"
                      />
                      <Input
                        value={customHex}
                        onChange={(e) => handleCustomHexChange(e.target.value)}
                        placeholder="#10b981"
                        className="max-w-[160px] font-mono uppercase text-xs"
                      />
                      <span className="text-xs text-gray-400">
                        Introduce cualquier código HEX para generar tokens dinámicos en tiempo real.
                      </span>
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
                              ? 'bg-dark-card border-brand-500 text-white ring-1 ring-brand-500'
                              : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Densidad de Interfaz */}
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
                              ? 'bg-dark-card border-brand-500 text-white ring-1 ring-brand-500'
                              : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                          }`}
                        >
                          {t(`settings.appearance.${d}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Previsualización en Tiempo Real */}
                <Card>
                  <ThemePreview />
                </Card>
              </div>
            )}

            {/* 2. IDIOMA */}
            {activeTab === 'language' && (
              <Card className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">Configuración de Idioma (i18n)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Selecciona tu idioma preferido para toda la plataforma HBD.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                      i18n.language.startsWith('es')
                        ? 'bg-dark-card border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-dark-surface border-dark-border text-gray-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">Español (Castellano)</p>
                      <p className="text-xs text-gray-400 mt-0.5">Idioma predeterminado</p>
                    </div>
                    {i18n.language.startsWith('es') && <Badge variant="brand">Activo</Badge>}
                  </button>

                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                      i18n.language.startsWith('en')
                        ? 'bg-dark-card border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-dark-surface border-dark-border text-gray-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">English (International)</p>
                      <p className="text-xs text-gray-400 mt-0.5">English translation</p>
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
                    helperText="El identificador de usuario es único."
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
                    <p className="text-xs text-gray-400">Listado y administración de cuentas de usuario.</p>
                  </div>
                  <Button
                    size="sm"
                    icon={<Plus size={15} />}
                    onClick={() => setIsCreateUserModalOpen(true)}
                  >
                    Nuevo Usuario
                  </Button>
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
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/50">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-dark-card/40">
                          <td className="px-4 py-3 font-semibold text-white">
                            {u.name} <span className="text-gray-400 font-normal">(@{u.username})</span>
                          </td>
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
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUserToEdit({ ...u, roleId: u.roleId });
                                  setIsEditUserModalOpen(true);
                                }}
                                title="Editar usuario"
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-dark-hover"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setConfirmToggleUser(u)}
                                title={u.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                className={`p-1.5 rounded-lg hover:bg-dark-hover ${
                                  u.isActive ? 'text-gray-400 hover:text-amber-400' : 'text-gray-400 hover:text-emerald-400'
                                }`}
                              >
                                <Power size={14} />
                              </button>
                            </div>
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
                  <p className="text-xs text-gray-400">Estructura de permisos granulares por perfil.</p>
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
                          <span key={p.permission?.id || p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-surface text-gray-400 border border-dark-border">
                            {p.permission?.code || p.code}
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
                    <span className="text-gray-400 font-medium">{t('about.developedBy')}</span>
                    <p className="text-base font-bold text-white">{APP_CONFIG.author}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1">
                    <span className="text-gray-400 font-medium">{t('about.version')}</span>
                    <p className="text-base font-bold text-brand-400">{APP_CONFIG.version}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-1 sm:col-span-2">
                    <span className="text-gray-400 font-medium">{t('about.copyright')}</span>
                    <p className="text-sm font-semibold text-gray-200">{APP_CONFIG.copyright}</p>
                  </div>
                </div>

                {systemInfo && (
                  <div className="pt-4 border-t border-dark-border/50 space-y-3">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {t('about.systemStatus')}
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                        <span className="text-gray-400">{t('about.database')}</span>
                        <p className="font-bold text-emerald-400 mt-0.5">PostgreSQL Conectada</p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                        <span className="text-gray-400">{t('about.environment')}</span>
                        <p className="font-bold text-white mt-0.5 capitalize">{systemInfo.environment}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                        <span className="text-gray-400">{t('about.uptime')}</span>
                        <p className="font-bold text-sky-400 mt-0.5">{systemInfo.uptimeSeconds} seg</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* PESTAÑAS ADICIONALES PREPARADAS */}
            {['general', 'projects', 'ai', 'storage', 'security', 'system'].includes(activeTab) && (
              <Card className="space-y-4 text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-dark-card flex items-center justify-center text-gray-400 mx-auto">
                  <SettingsIcon size={24} />
                </div>
                <h4 className="text-base font-bold text-white capitalize">
                  Configuración de {activeTab}
                </h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Módulo configurado en la arquitectura central de HBD. Las opciones avanzadas se activarán próximamente.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        title="Crear Nuevo Usuario"
        description="Añade un nuevo usuario y asígnale su rol en la plataforma."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {userActionError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {userActionError}
            </div>
          )}
          <Input
            label="Nombre Completo"
            placeholder="Ej. Laura González"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
          />
          <Input
            label="Nombre de Usuario"
            placeholder="Ej. lgonzalez"
            value={newUserUsername}
            onChange={(e) => setNewUserUsername(e.target.value)}
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña Inicial"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Rol del Sistema
            </label>
            <select
              value={newUserRoleId}
              onChange={(e) => setNewUserRoleId(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
            >
              {rolesList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border/60">
            <Button type="button" variant="ghost" onClick={() => setIsCreateUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" icon={<Plus size={16} />}>
              Crear Usuario
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUserToEdit(null);
        }}
        title="Editar Usuario"
        description="Modifica los datos del usuario o reasigna su rol."
      >
        {selectedUserToEdit && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <Input
              label="Nombre Completo"
              value={selectedUserToEdit.name}
              onChange={(e) =>
                setSelectedUserToEdit({ ...selectedUserToEdit, name: e.target.value })
              }
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              value={selectedUserToEdit.email}
              onChange={(e) =>
                setSelectedUserToEdit({ ...selectedUserToEdit, email: e.target.value })
              }
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Rol del Sistema
              </label>
              <select
                value={selectedUserToEdit.roleId}
                onChange={(e) =>
                  setSelectedUserToEdit({ ...selectedUserToEdit, roleId: e.target.value })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
              >
                {rolesList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditUserModalOpen(false);
                  setSelectedUserToEdit(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Diálogo de Confirmación para Desactivar/Activar Usuario */}
      {confirmToggleUser && (
        <ConfirmDialog
          isOpen={Boolean(confirmToggleUser)}
          onClose={() => setConfirmToggleUser(null)}
          onConfirm={handleToggleUserStatus}
          title={confirmToggleUser.isActive ? 'Desactivar Cuenta' : 'Reactivar Cuenta'}
          description={`¿Estás seguro de que deseas ${
            confirmToggleUser.isActive ? 'desactivar' : 'reactivar'
          } el acceso para el usuario "${confirmToggleUser.name}" (@${confirmToggleUser.username})?`}
          confirmText={confirmToggleUser.isActive ? 'Desactivar' : 'Reactivar'}
          variant={confirmToggleUser.isActive ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
};
