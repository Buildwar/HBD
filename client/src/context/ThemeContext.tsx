import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.js';

export type ThemeMode = 'dark' | 'light' | 'system';
export type Density = 'compact' | 'normal' | 'comfortable';

interface ThemeContextType {
  themeMode: ThemeMode;
  accentColor: string;
  borderRadius: string;
  density: Density;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setBorderRadius: (radius: string) => void;
  setDensity: (density: Density) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENT_PALETTES = [
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Spotify Green', hex: '#1db954' },
  { name: 'Electric Indigo', hex: '#6366f1' },
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Rose Red', hex: '#f43f5e' },
  { name: 'Purple Neon', hex: '#a855f7' },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useAuth();

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (user?.themePreferences?.themeMode as ThemeMode) || (localStorage.getItem('hbd_theme_mode') as ThemeMode) || 'dark';
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return user?.themePreferences?.accentColor || localStorage.getItem('hbd_accent_color') || '#10b981';
  });

  const [borderRadius, setBorderRadiusState] = useState<string>(() => {
    return user?.themePreferences?.borderRadius || localStorage.getItem('hbd_border_radius') || '0.75rem';
  });

  const [density, setDensityState] = useState<Density>(() => {
    return (user?.themePreferences?.density as Density) || (localStorage.getItem('hbd_density') as Density) || 'normal';
  });

  useEffect(() => {
    if (user?.themePreferences) {
      if (user.themePreferences.themeMode) setThemeModeState(user.themePreferences.themeMode);
      if (user.themePreferences.accentColor) setAccentColorState(user.themePreferences.accentColor);
      if (user.themePreferences.borderRadius) setBorderRadiusState(user.themePreferences.borderRadius);
      if (user.themePreferences.density) setDensityState(user.themePreferences.density);
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--radius', borderRadius);

    localStorage.setItem('hbd_theme_mode', themeMode);
    localStorage.setItem('hbd_accent_color', accentColor);
    localStorage.setItem('hbd_border_radius', borderRadius);
    localStorage.setItem('hbd_density', density);
  }, [themeMode, accentColor, borderRadius, density]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
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

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        accentColor,
        borderRadius,
        density,
        setThemeMode,
        setAccentColor,
        setBorderRadius,
        setDensity,
      }}
    >
      {children}
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
