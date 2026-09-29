export const APP_CONFIG = {
  name: 'HBD — Home Board Designer',
  shortName: 'HBD',
  fullName: 'Home Board Designer',
  tagline: 'Diseña, mide y visualiza tu vivienda.',
  description: 'Plataforma profesional para digitalizar viviendas a partir de planos arquitectónicos, calcular distancias y superficies, y crear modelos 2D/3D con gemelo digital.',
  author: 'Adrián Palma',
  authorTitle: 'Desarrollador y Propietario del Proyecto',
  version: '9.0.0',
  copyrightYear: 2026,
  copyright: '© 2026 Adrián Palma — HBD (Home Board Designer)',
  apiUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api',
};
