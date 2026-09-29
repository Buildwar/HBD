import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  FileSpreadsheet,
  Armchair,
  BookOpen,
  Box,
  Sparkles,
  Camera,
  Settings,
  User,
  Info,
  LogOut,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { APP_CONFIG } from '../../config/app.config.js';

interface SidebarProps {
  onNewProjectClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewProjectClick }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { sidebarMode, toggleSidebar } = useTheme();
  const navigate = useNavigate();

  const isCompact = sidebarMode === 'compact';

  const projectsNav = [
    { to: '/projects', label: t('nav.projects'), icon: FolderKanban },
  ];

  const designNav = [
    { to: '/plans', label: t('nav.plans'), icon: FileSpreadsheet },
    { to: '/furniture', label: t('nav.furniture'), icon: Armchair },
    { to: '#', label: t('nav.library', 'Biblioteca'), icon: BookOpen, isComingSoon: true },
    { to: '/viewer3d', label: t('nav.viewer3d'), icon: Box },
    { to: '/renders', label: t('nav.renders'), icon: Sparkles },
    { to: '/vision', label: t('nav.vision', 'Visión IA'), icon: Camera },
  ];

  const systemNav = [
    { to: '/settings', label: t('nav.settings'), icon: Settings },
    { to: '/profile', label: t('nav.profile'), icon: User },
    { to: '/about', label: t('nav.about'), icon: Info },
  ];

  const handleNavClick = (e: React.MouseEvent, item: any) => {
    if (item.isComingSoon) {
      e.preventDefault();
      alert('Módulo de Biblioteca: Próximamente disponible.');
    }
  };

  return (
    <aside
      className={`bg-dark-surface border-r border-dark-border/80 flex flex-col h-screen select-none transition-all duration-300 z-40 relative ${
        isCompact ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-4 flex items-center justify-between border-b border-dark-border/50 ${isCompact ? 'flex-col gap-2' : ''}`}>
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden group"
          title={APP_CONFIG.name}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 shrink-0 group-hover:scale-105 transition-transform">
            <Layers size={22} className="stroke-[2.5]" />
          </div>
          {!isCompact && (
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                {APP_CONFIG.shortName}
              </h1>
              <p className="text-[11px] text-dark-muted font-medium truncate max-w-[140px]">
                Home Board Designer
              </p>
            </div>
          )}
        </div>

        {/* Toggle Expand/Compact Button */}
        <button
          onClick={toggleSidebar}
          title={isCompact ? 'Expandir menú lateral' : 'Plegar menú lateral'}
          className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-hover transition-colors shrink-0"
        >
          {isCompact ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Dashboard Direct Link */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                : 'text-gray-300 hover:text-white hover:bg-dark-hover'
            } ${isCompact ? 'justify-center px-2' : ''}`
          }
          title={isCompact ? t('nav.dashboard') : undefined}
        >
          <LayoutDashboard size={19} className="shrink-0" />
          {!isCompact && <span>{t('nav.dashboard')}</span>}
        </NavLink>

        {/* Section: PROYECTOS */}
        <div className="space-y-1">
          {!isCompact && (
            <div className="px-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {t('nav.sectionProjects', 'Proyectos')}
            </div>
          )}
          {projectsNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-dark-hover'
                } ${isCompact ? 'justify-center px-2' : ''}`
              }
              title={isCompact ? item.label : undefined}
            >
              <item.icon size={19} className="shrink-0" />
              {!isCompact && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* Quick Create Project Action in Sidebar */}
          <button
            onClick={() => {
              if (onNewProjectClick) {
                onNewProjectClick();
              } else {
                navigate('/dashboard');
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors group ${
              isCompact ? 'justify-center px-2' : ''
            }`}
            title={isCompact ? t('dashboard.newProject') : undefined}
          >
            <PlusCircle size={17} className="shrink-0 group-hover:scale-110 transition-transform" />
            {!isCompact && <span>{t('dashboard.newProject')}</span>}
          </button>
        </div>

        {/* Section: DISEÑO */}
        <div className="space-y-1">
          {!isCompact && (
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {t('nav.sectionDesign', 'Diseño')}
            </div>
          )}
          {designNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={(e) => handleNavClick(e, item)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive && !item.isComingSoon
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                    : item.isComingSoon
                    ? 'text-gray-500 hover:text-gray-400 hover:bg-dark-hover/50 cursor-pointer'
                    : 'text-gray-300 hover:text-white hover:bg-dark-hover'
                } ${isCompact ? 'justify-center px-2' : ''}`
              }
              title={isCompact ? `${item.label} ${item.isComingSoon ? '(Próximamente)' : ''}` : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon size={19} className="shrink-0" />
                {!isCompact && <span>{item.label}</span>}
              </div>
              {!isCompact && item.isComingSoon && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-dark-card border border-dark-border text-gray-500">
                  Próximamente
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Section: SISTEMA */}
        <div className="space-y-1">
          {!isCompact && (
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {t('nav.sectionSystem', 'Sistema')}
            </div>
          )}
          {systemNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-dark-card text-brand-400 border border-dark-border font-semibold shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-dark-hover'
                } ${isCompact ? 'justify-center px-2' : ''}`
              }
              title={isCompact ? item.label : undefined}
            >
              <item.icon size={19} className="shrink-0" />
              {!isCompact && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-dark-border/60 bg-dark-bg/40">
        <div className={`flex items-center justify-between p-2 rounded-xl bg-dark-card/70 border border-dark-border/40 ${isCompact ? 'flex-col gap-2 p-1.5' : ''}`}>
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
            title={`${user?.name || 'Usuario'} (@${user?.username || 'user'})`}
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0 group-hover:scale-105 transition-transform">
              {user?.name?.[0] || 'U'}
            </div>
            {!isCompact && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-100 group-hover:text-brand-400 transition-colors truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{user?.role?.name || 'USER'}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title={t('nav.logout')}
            className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-dark-hover transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
