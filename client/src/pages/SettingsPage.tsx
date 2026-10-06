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
  Power,
  Pipette,
  Key,
  Store,
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
import { useTheme, THEME_PRESETS, Density } from '../context/ThemeContext.js';
import { settingsService, SystemInfo } from '../services/settings.service.js';
import { APP_CONFIG } from '../config/app.config.js';
import { HbdLogo } from '../components/common/HbdLogo.js';
import {
  SettingsGeneralTab,
  SettingsProjectsTab,
  SettingsAITab,
  SettingsStorageTab,
  SettingsSecurityTab,
  SettingsSystemTab,
  SettingsPasswordModal,
} from '../features/settings/index.js';
import { RetailerAdminSettingsTab } from '../features/retail-catalog/RetailerAdminSettingsTab.js';

type TabType =
  | 'appearance'
  | 'language'
  | 'account'
  | 'users'
  | 'roles'
  | 'general'
  | 'projects'
  | 'ai'
  | 'retailers'
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

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  // Gestor de usuarios (Admin)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState<boolean>(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState<boolean>(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<any | null>(null);
  const [confirmToggleUser, setConfirmToggleUser] = useState<any | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<any | null>(null);

  // Formulario nuevo usuario
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRoleId, setNewUserRoleId] = useState('');
  const [userActionError, setUserActionError] = useState<string | null>(null);

  const isAdmin = user?.role?.name === 'ADMIN';

  useEffect(() => {
    loadSettingsData();
  }, []);

  useEffect(() => {
    setCustomHex(accentColor);
  }, [accentColor]);

  const loadSettingsData = async () => {
    try {
      const info = await settingsService.getSystemInfo();
      setSystemInfo(info);
      if (isAdmin) {
        const [usersRes, rolesRes] = await Promise.all([
          settingsService.getUsers(),
          settingsService.getRoles(),
        ]);
        if (usersRes.success && usersRes.data) setUsersList(usersRes.data);
        if (rolesRes.success && rolesRes.data) {
          setRolesList(rolesRes.data);
          if (rolesRes.data.length > 0 && !newUserRoleId) {
            setNewUserRoleId(rolesRes.data[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading settings info:', err);
    }
  };

  const showSavedToast = () => {
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    showSavedToast();
  };

  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setAccentColor(hex);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ name, email });
      showSavedToast();
    } catch (err) {
      console.error('Error saving account:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);
    try {
      const res = await settingsService.createUser({
        name: newUserName,
        username: newUserUsername,
        email: newUserEmail,
        password: newUserPassword,
        roleId: newUserRoleId,
      });
      if (res.success) {
        setIsCreateUserModalOpen(false);
        setNewUserName('');
        setNewUserUsername('');
        setNewUserEmail('');
        setNewUserPassword('');
        loadSettingsData();
        showSavedToast();
      } else {
        setUserActionError(res.error || 'Error al crear usuario');
      }
    } catch (err: any) {
      setUserActionError(err.message || 'Error al crear usuario');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;
    setUserActionError(null);
    try {
      const res = await settingsService.updateUser(selectedUserToEdit.id, {
        name: selectedUserToEdit.name,
        email: selectedUserToEdit.email,
        roleId: selectedUserToEdit.roleId,
      });
      if (res.success) {
        setIsEditUserModalOpen(false);
        setSelectedUserToEdit(null);
        loadSettingsData();
        showSavedToast();
      } else {
        setUserActionError(res.error || 'Error al editar usuario');
      }
    } catch (err: any) {
      setUserActionError(err.message || 'Error al editar usuario');
    }
  };

  const handleToggleUserStatus = async () => {
    if (!confirmToggleUser) return;
    try {
      await settingsService.toggleUserStatus(confirmToggleUser.id);
      loadSettingsData();
      showSavedToast();
    } catch (err) {
      console.error('Error toggling user status:', err);
    } finally {
      setConfirmToggleUser(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    try {
      await settingsService.deleteUser(confirmDeleteUser.id);
      loadSettingsData();
      showSavedToast();
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setConfirmDeleteUser(null);
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
    { id: 'retailers' as TabType, label: t('settings.tabs.retailers'), icon: Store, adminOnly: true },
    { id: 'storage' as TabType, label: t('settings.tabs.storage'), icon: HardDrive, adminOnly: true },
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
              if (tab.adminOnly && !isAdmin) return null;
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
                    <h3 className="text-base font-bold text-white">{t('settings.appearance.title')}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t('settings.appearance.subtitle')}
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

                  {/* Paletas de Acento HBD */}
                  <div className="space-y-3 pt-4 border-t border-dark-border/50">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      {t('settings.appearance.accentColor')}
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

                  {/* Selector HEX Personalizado */}
                  <div className="space-y-3 pt-4 border-t border-dark-border/50">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <Pipette size={14} className="text-brand-400" />
                      {t('settings.appearance.customColor')}
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
                    </div>
                  </div>

                  {/* Radio de Bordes */}
                  <div className="space-y-3 pt-4 border-t border-dark-border/50">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      {t('settings.appearance.borderRadius')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: t('settings.appearance.radiusSm'), value: '0.5rem' },
                        { label: t('settings.appearance.radiusMd'), value: '0.75rem' },
                        { label: t('settings.appearance.radiusLg'), value: '1rem' },
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
                  <h3 className="text-base font-bold text-white">{t('settings.language.title')}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t('settings.language.subtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                      (i18n.language || 'es').startsWith('es')
                        ? 'bg-dark-card border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-dark-surface border-dark-border text-gray-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">{t('settings.language.spanish')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t('settings.language.spanishDesc')}</p>
                    </div>
                    {(i18n.language || 'es').startsWith('es') && <Badge variant="brand">{t('settings.language.active')}</Badge>}
                  </button>

                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                      (i18n.language || 'es').startsWith('en')
                        ? 'bg-dark-card border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-dark-surface border-dark-border text-gray-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">{t('settings.language.english')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t('settings.language.englishDesc')}</p>
                    </div>
                    {(i18n.language || 'es').startsWith('en') && <Badge variant="brand">{t('settings.language.active')}</Badge>}
                  </button>
                </div>
              </Card>
            )}

            {/* 3. CUENTA */}
            {activeTab === 'account' && (
              <Card className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">{t('settings.account.title')}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{t('settings.account.subtitle')}</p>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-4">
                  <Input
                    label={t('settings.account.nameLabel')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label={t('settings.account.emailLabel')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label={t('settings.users.username')}
                    value={user?.username || ''}
                    disabled
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-dark-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Key size={14} />
                      {t('settings.account.changePassword')}
                    </Button>
                    <Button type="submit">{t('settings.account.saveProfile')}</Button>
                  </div>
                </form>
              </Card>
            )}

            {/* 4. USUARIOS (Admin) */}
            {activeTab === 'users' && (
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{t('settings.users.title')}</h3>
                    <p className="text-xs text-gray-400">{t('settings.users.subtitle')}</p>
                  </div>
                  <Button
                    size="sm"
                    icon={<Plus size={15} />}
                    onClick={() => setIsCreateUserModalOpen(true)}
                  >
                    {t('settings.users.newUser')}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-dark-card text-gray-400 uppercase font-semibold border-b border-dark-border">
                      <tr>
                        <th className="px-4 py-3">{t('settings.users.username')}</th>
                        <th className="px-4 py-3">{t('settings.users.email')}</th>
                        <th className="px-4 py-3">{t('settings.users.role')}</th>
                        <th className="px-4 py-3">{t('projects.title')}</th>
                        <th className="px-4 py-3">{t('settings.users.status')}</th>
                        <th className="px-4 py-3 text-right">{t('settings.users.actions')}</th>
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
                              {u.isActive ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedUserToEdit({ ...u, roleId: u.roleId });
                                  setIsEditUserModalOpen(true);
                                }}
                                title={t('settings.users.edit')}
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-dark-hover"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setConfirmToggleUser(u)}
                                title={t('settings.users.toggleActive')}
                                className={`p-1.5 rounded-lg hover:bg-dark-hover ${
                                  u.isActive ? 'text-gray-400 hover:text-amber-400' : 'text-gray-400 hover:text-emerald-400'
                                }`}
                              >
                                <Power size={14} />
                              </button>
                              {u.id !== user?.id && (
                                <button
                                  onClick={() => setConfirmDeleteUser(u)}
                                  title={t('settings.users.delete')}
                                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-dark-hover"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
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
                  <h3 className="text-base font-bold text-white">{t('settings.roles.title')}</h3>
                  <p className="text-xs text-gray-400">{t('settings.roles.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rolesList.map((role) => (
                    <div key={role.id} className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{role.name}</h4>
                        <Badge variant="gray">{role._count?.users || 0} {t('settings.roles.usersCount')}</Badge>
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

            {/* 6. GENERAL */}
            {activeTab === 'general' && (
              <SettingsGeneralTab isAdmin={isAdmin} onShowSavedToast={showSavedToast} />
            )}

            {/* 7. PROYECTOS */}
            {activeTab === 'projects' && (
              <SettingsProjectsTab isAdmin={isAdmin} onShowSavedToast={showSavedToast} />
            )}

            {/* 8. IA Y VISION */}
            {activeTab === 'ai' && (
              <SettingsAITab isAdmin={isAdmin} onShowSavedToast={showSavedToast} />
            )}

            {/* 9. RETAILERS Y CATÁLOGO CONECTADO */}
            {activeTab === 'retailers' && (
              <RetailerAdminSettingsTab isAdmin={isAdmin} onShowSavedToast={showSavedToast} />
            )}

            {/* 10. ALMACENAMIENTO */}
            {activeTab === 'storage' && (
              <SettingsStorageTab isAdmin={isAdmin} onShowSavedToast={showSavedToast} />
            )}

            {/* 10. SEGURIDAD */}
            {activeTab === 'security' && (
              <SettingsSecurityTab
                isAdmin={isAdmin}
                onShowSavedToast={showSavedToast}
                onOpenChangePasswordModal={() => setIsPasswordModalOpen(true)}
              />
            )}

            {/* 11. SISTEMA */}
            {activeTab === 'system' && (
              <SettingsSystemTab isAdmin={isAdmin} />
            )}

            {/* 12. ACERCA DE (THE ONLY PLACE WHERE VERSION IS DISPLAYED) */}
            {activeTab === 'about' && (
              <Card className="space-y-6">
                <div className="flex items-center gap-4">
                  <HbdLogo variant="horizontal" mode="dark" className="h-11 w-auto max-w-[240px]" alt="HBD — Home Board Designer" />
                </div>

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
                        <p className="font-bold text-emerald-400 mt-0.5">PostgreSQL {t('about.connected')}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                        <span className="text-gray-400">{t('about.environment')}</span>
                        <p className="font-bold text-white mt-0.5 capitalize">{systemInfo.environment}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
                        <span className="text-gray-400">{t('about.uptime')}</span>
                        <p className="font-bold text-sky-400 mt-0.5">{systemInfo.uptimeSeconds} s</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      <SettingsPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => showSavedToast()}
      />

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        title={t('settings.users.newUser')}
        description={t('settings.users.newUserDesc')}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {userActionError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {userActionError}
            </div>
          )}
          <Input
            label={t('settings.users.name')}
            placeholder={t('settings.users.placeholderName')}
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
          />
          <Input
            label={t('settings.users.username')}
            placeholder={t('settings.users.placeholderUsername')}
            value={newUserUsername}
            onChange={(e) => setNewUserUsername(e.target.value)}
            required
          />
          <Input
            label={t('settings.users.email')}
            type="email"
            placeholder={t('settings.users.placeholderEmail')}
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
          />
          <Input
            label={t('settings.users.passwordLabel')}
            type="password"
            placeholder={t('settings.users.placeholderPassword')}
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              {t('settings.users.role')}
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" icon={<Plus size={16} />}>
              {t('settings.users.newUser')}
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
        title={t('settings.users.edit')}
        description={t('settings.users.editUserDesc')}
      >
        {selectedUserToEdit && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <Input
              label={t('settings.users.name')}
              value={selectedUserToEdit.name}
              onChange={(e) =>
                setSelectedUserToEdit({ ...selectedUserToEdit, name: e.target.value })
              }
              required
            />
            <Input
              label={t('settings.users.email')}
              type="email"
              value={selectedUserToEdit.email}
              onChange={(e) =>
                setSelectedUserToEdit({ ...selectedUserToEdit, email: e.target.value })
              }
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {t('settings.users.role')}
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
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save')}</Button>
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
          title={confirmToggleUser.isActive ? t('settings.users.deactivateAccount') : t('settings.users.reactivateAccount')}
          description={t('settings.users.toggleAccountConfirm').replace('{action}', confirmToggleUser.isActive ? t('settings.users.deactivate') : t('settings.users.reactivate')).replace('{name}', confirmToggleUser.name).replace('{username}', confirmToggleUser.username)}
          confirmText={confirmToggleUser.isActive ? t('settings.users.deactivate') : t('settings.users.reactivate')}
          variant={confirmToggleUser.isActive ? 'danger' : 'primary'}
        />
      )}

      {/* Diálogo de Confirmación para Eliminar Usuario */}
      {confirmDeleteUser && (
        <ConfirmDialog
          isOpen={Boolean(confirmDeleteUser)}
          onClose={() => setConfirmDeleteUser(null)}
          onConfirm={handleDeleteUser}
          title={t('settings.users.delete')}
          description={t('settings.users.deleteConfirm')}
          confirmText={t('common.delete')}
          variant="danger"
        />
      )}
    </div>
  );
};
