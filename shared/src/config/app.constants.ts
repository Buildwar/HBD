/**
 * HBD — HOME BOARD DESIGNER
 * Configuración centralizada de marca, autoría, copyright y versión.
 * ÚNICA FUENTE DE VERDAD para la identidad del software.
 */

export const APP_METADATA = {
  name: 'HBD',
  fullName: 'Home Board Designer',
  displayName: 'HBD — Home Board Designer',
  shortName: 'HBD',
  tagline: 'Diseña, mide y visualiza tu vivienda.',
  description: 'Plataforma profesional para digitalizar viviendas a partir de planos arquitectónicos, calcular distancias y superficies, y crear modelos 2D/3D con gemelo digital.',
  author: 'Adrián Palma',
  authorTitle: 'Desarrollador y Propietario del Proyecto',
  version: '1.24.5',
  phase: 'V24',
  copyrightYear: 2026,
  copyright: '© 2026 Adrián Palma — HBD (Home Board Designer)',
  repositoryUrl: 'https://github.com/Buildwar/HBD.git',
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'] as const,
  defaultTheme: 'dark',
  defaultAccentColor: '#10b981', // Emerald green
} as const;

export type SupportedLanguage = (typeof APP_METADATA.supportedLanguages)[number];
