import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FolderKanban,
  FileSpreadsheet,
  Armchair,
  Box,
  Sparkles,
  Settings,
  User,
  Info,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { APP_CONFIG } from '../../config/app.config.js';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const mainNav = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/projects', label: t('nav.projects'), icon: FolderKanban },
    { to: '/plans', label: t('nav.plans'), icon: FileSpreadsheet, badge: 'V2' },
    { to: '/furniture', label: t('nav.furniture'), icon: Armchair, badge: 'V4' },
    { to: '/viewer3d', label: t('nav.viewer3d'), icon: Box, badge: 'V5' },
    { to: '/renders', label: t('nav.renders'), icon: Sparkles, badge: 'V7' },
  ];

  const bottomNav = [
    { to: '/settings', label: t('nav.settings'), icon: Settings },
    { to: '/profile', label: t('nav.profile'), icon: User },
    { to: '/about', label: t('nav.about'), icon: Info },
  ];

  return (
    <aside className="w-64 bg-dark-surface border-r border-dark-border/80 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-dark-border/50">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Layers size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
            HBD
            <span className="text-[10px] px-1.5 py-0.2 bg-brand-500/20 text-brand-400 font-semibold rounded-md border border-brand-500/30">
              v{APP_CONFIG.version}
            </span>
          </h1>
          <p className="text-[11px] text-dark-muted font-medium truncate max-w-[140px]">
            Home Board Designer
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Menú Principal
        </div>
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-dark-hover'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-dark-card border border-dark-border text-gray-400 group-hover:text-gray-200">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Sistema
        </div>
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-dark-card text-brand-400 border border-dark-border font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-dark-hover'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-dark-border/60 bg-dark-bg/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-dark-card/60 border border-dark-border/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-100 truncate">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.role?.name || 'USER'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title={t('nav.logout')}
            className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
