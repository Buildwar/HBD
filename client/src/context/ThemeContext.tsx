import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.js';

export type ThemeMode = 'dark' | 'light' | 'system';
export type Density = 'compact' | 'normal' | 'comfortable';
export type SidebarMode = 'expanded' | 'compact';

export interface ThemePreset {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'emerald', name: 'HBD Emerald', hex: '#10b981', description: 'Verde esmeralda equilibrado (Predeterminado)' },
  { id: 'spotify', name: 'HBD Spotify', hex: '#1db954', description: 'Verde vibrante inspirado en Spotify' },
  { id: 'ocean', name: 'HBD Ocean Blue', hex: '#0ea5e9', description: 'Azul cielo técnico y moderno' },
  { id: 'indigo', name: 'HBD Electric Indigo', hex: '#6366f1', description: 'Índigo profundo de alta tecnología' },
  { id: 'purple', name: 'HBD Purple Neon', hex: '#a855f7', description: 'Púrpura neón creativo y contemporáneo' },
  { id: 'amber', name: 'HBD Amber Gold', hex: '#f59e0b', description: 'Ámbar cálido arquitectónico' },
  { id: 'rose', name: 'HBD Rose Red', hex: '#f43f5e', description: 'Rojo carmesí enérgico' },
  { id: 'cyan', name: 'HBD Cyan Sky', hex: '#06b6d4', description: 'Cian luminoso de precisión' },
];

// Re-export for compatibility
export const ACCENT_PALETTES = THEME_PRESETS;

interface ThemeContextType {
  themeMode: ThemeMode;
  accentColor: string;
  borderRadius: string;
  density: Density;
  sidebarMode: SidebarMode;
  toastMessage: string | null;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setBorderRadius: (radius: string) => void;
  setDensity: (density: Density) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleSidebar: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to convert HEX to RGB components
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num) || cleaned.length !== 6) {
    return { r: 16, g: 185, b: 129 }; // Default emerald
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper to darken or lighten a hex color
function adjustColor(hex: string, amount: number): string {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  let num = parseInt(cleaned, 16);
  if (isNaN(num)) return hex;

  let r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount));
  let b = Math.min(255, Math.max(0, (num & 255) + amount));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useAuth();

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (user?.themePreferences?.themeMode as ThemeMode) ||
      (localStorage.getItem('hbd_theme_mode') as ThemeMode) ||
      'dark';
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return user?.themePreferences?.accentColor ||
      localStorage.getItem('hbd_accent_color') ||
      '#10b981';
  });

  const [borderRadius, setBorderRadiusState] = useState<string>(() => {
    return user?.themePreferences?.borderRadius ||
      localStorage.getItem('hbd_border_radius') ||
      '0.75rem';
  });

  const [density, setDensityState] = useState<Density>(() => {
    return (user?.themePreferences?.density as Density) ||
      (localStorage.getItem('hbd_density') as Density) ||
      'normal';
  });

  const [sidebarMode, setSidebarModeState] = useState<SidebarMode>(() => {
    return (user?.themePreferences?.sidebarMode as SidebarMode) ||
      (localStorage.getItem('hbd_sidebar_mode') as SidebarMode) ||
      'expanded';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Sync state if user object changes (e.g. on login)
  useEffect(() => {
    if (user?.themePreferences) {
      if (user.themePreferences.themeMode) setThemeModeState(user.themePreferences.themeMode as ThemeMode);
      if (user.themePreferences.accentColor) setAccentColorState(user.themePreferences.accentColor);
      if (user.themePreferences.borderRadius) setBorderRadiusState(user.themePreferences.borderRadius);
      if (user.themePreferences.density) setDensityState(user.themePreferences.density as Density);
      if (user.themePreferences.sidebarMode) setSidebarModeState(user.themePreferences.sidebarMode as SidebarMode);
    }
  }, [user]);

  // Apply CSS variables and tokens to DOM dynamically
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      themeMode === 'dark' ||
      (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    const rgb = hexToRgb(accentColor);
    const hoverColor = adjustColor(accentColor, isDark ? -18 : -25);
    const activeColor = adjustColor(accentColor, isDark ? -35 : -40);

    root.style.setProperty('--primary-r', rgb.r.toString());
    root.style.setProperty('--primary-g', rgb.g.toString());
    root.style.setProperty('--primary-b', rgb.b.toString());
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--color-primary', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    root.style.setProperty('--color-primary-hover', hoverColor);
    root.style.setProperty('--color-primary-active', activeColor);
    root.style.setProperty('--color-primary-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`);
    root.style.setProperty('--radius', borderRadius);

    // Save to localStorage
    localStorage.setItem('hbd_theme_mode', themeMode);
    localStorage.setItem('hbd_accent_color', accentColor);
    localStorage.setItem('hbd_border_radius', borderRadius);
    localStorage.setItem('hbd_density', density);
    localStorage.setItem('hbd_sidebar_mode', sidebarMode);
  }, [themeMode, accentColor, borderRadius, density, sidebarMode]);

  // Handler for system theme preference change in real-time
  useEffect(() => {
    if (themeMode !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    showNotification(`Tema cambiado a ${mode === 'dark' ? 'Oscuro' : mode === 'light' ? 'Claro' : 'Sistema'}`);
    if (user) {
      updateUserProfile({
        themePreferences: {
          ...user.themePreferences,
          themeMode: mode,
        },
      }).catch(console.error);
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    const preset = THEME_PRESETS.find((p) => p.hex.toLowerCase() === color.toLowerCase());
    const name = preset ? preset.name : color;
    showNotification(`Color de acento: ${name}`);
    if (user) {
      updateUserProfile({
        themePreferences: {
          ...user.themePreferences,
          accentColor: color,
        },
      }).catch(console.error);
    }
  };

  const setBorderRadius = (radius: string) => {
    setBorderRadiusState(radius);
    if (user) {
      updateUserProfile({
        themePreferences: {
          ...user.themePreferences,
          borderRadius: radius,
        },
      }).catch(console.error);
    }
  };

  const setDensity = (d: Density) => {
    setDensityState(d);
    if (user) {
      updateUserProfile({
        themePreferences: {
          ...user.themePreferences,
          density: d,
        },
      }).catch(console.error);
    }
  };

  const setSidebarMode = (mode: SidebarMode) => {
    setSidebarModeState(mode);
    if (user) {
      updateUserProfile({
        themePreferences: {
          ...user.themePreferences,
          sidebarMode: mode,
        },
      }).catch(console.error);
    }
  };

  const toggleSidebar = () => {
    const nextMode = sidebarMode === 'expanded' ? 'compact' : 'expanded';
    setSidebarMode(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        accentColor,
        borderRadius,
        density,
        sidebarMode,
        toastMessage,
        setThemeMode,
        setAccentColor,
        setBorderRadius,
        setDensity,
        setSidebarMode,
        toggleSidebar,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-dark-card/95 border border-brand-500/40 text-brand-400 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
            <span>✓ {toastMessage}</span>
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
