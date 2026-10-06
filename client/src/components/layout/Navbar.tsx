import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, actions }) => {
  const { t, i18n } = useTranslation();
  const { themeMode, setThemeMode } = useTheme();

  const currentLang = i18n.language || 'es';

  const toggleLanguage = () => {
    const nextLang = currentLang.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-dark-border/60 bg-dark-surface/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        {title && <h2 className="text-lg font-bold text-gray-100 leading-none">{title}</h2>}
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <div className="h-4 w-[1px] bg-dark-border mx-1" />

        {/* Selector de idioma */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-dark-card border border-dark-border hover:bg-dark-hover transition-colors"
          title={t('common.changeLanguage')}
        >
          <Globe size={14} />
          <span className="uppercase">{currentLang.substring(0, 2)}</span>
        </button>

        {/* Selector de tema rápido */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-gray-300 hover:text-white bg-dark-card border border-dark-border hover:bg-dark-hover transition-colors"
          title={t('common.changeTheme')}
        >
          {themeMode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
};
