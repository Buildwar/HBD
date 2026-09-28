/**
 * HBD — HOME BOARD DESIGNER
 * Configuración centralizada de marca, autoría y versión.
 * Modificar únicamente desde este archivo o mediante variables de entorno en runtime.
 */

export const APP_METADATA = {
  name: 'HBD — Home Board Designer',
  shortName: 'HBD',
  tagline: 'Diseña, mide y visualiza tu vivienda.',
  description: 'Plataforma profesional para digitalizar viviendas a partir de planos arquitectónicos, calcular distancias y superficies, y crear modelos 2D/3D con gemelo digital.',
  author: 'apalma',
  authorTitle: 'Desarrollador y Propietario del Proyecto',
  version: '1.0.0',
  copyright: '© 2026 apalma — HBD (Home Board Designer)',
  repositoryUrl: 'https://github.com/apalma/hbd-home-board-designer',
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en', 'fr', 'de', 'it', 'pt'] as const,
  defaultTheme: 'dark',
  defaultAccentColor: '#10b981', // Emerald green
} as const;

export type SupportedLanguage = (typeof APP_METADATA.supportedLanguages)[number];
