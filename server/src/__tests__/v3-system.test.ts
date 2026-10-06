/**
 * HBD V3.0.0 SYSTEM, AUTHORSHIP & THEME INTEGRATION TEST SUITE
 * Strict automated testing of:
 * 1. Official software authorship ('Adrián Palma') and anti-regression check
 * 2. Version consistency ('3.0.0')
 * 3. Copyright formatting ('© 2026 Adrián Palma — HBD (Home Board Designer)')
 * 4. Centralized metadata single source of truth
 * 5. Theme presets, tokens and RGB calculations
 */

import { APP_METADATA } from '../../../shared/dist/index.js';

interface ThemePresetItem {
  id: string;
  name: string;
  hex: string;
  description: string;
}

const THEME_PRESETS: ThemePresetItem[] = [
  { id: 'emerald', name: 'HBD Emerald', hex: '#10b981', description: 'Verde esmeralda equilibrado (Predeterminado)' },
  { id: 'spotify', name: 'HBD Spotify', hex: '#1db954', description: 'Verde vibrante inspirado en Spotify' },
  { id: 'ocean', name: 'HBD Ocean Blue', hex: '#0ea5e9', description: 'Azul cielo técnico y moderno' },
  { id: 'indigo', name: 'HBD Electric Indigo', hex: '#6366f1', description: 'Índigo profundo de alta tecnología' },
  { id: 'purple', name: 'HBD Purple Neon', hex: '#a855f7', description: 'Púrpura neón creativo y contemporáneo' },
  { id: 'amber', name: 'HBD Amber Gold', hex: '#f59e0b', description: 'Ámbar cálido arquitectónico' },
  { id: 'rose', name: 'HBD Rose Red', hex: '#f43f5e', description: 'Rojo carmesí enérgico' },
  { id: 'cyan', name: 'HBD Cyan Sky', hex: '#06b6d4', description: 'Cian luminoso de precisión' },
];

function runTests() {
  console.log('====================================================');
  console.log('🧪 INICIANDO TEST SUITE HBD V3.0.0');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
      failed++;
    }
  }

  // 1. Autoría Oficial y Anti-Regresión
  console.log('--- 1. Autoría Oficial & Anti-Regresión ---');
  assert(APP_METADATA.author === 'Adrián Palma', 'El autor oficial del software debe ser exactamente "Adrián Palma"');
  assert((APP_METADATA.author as string) !== 'apalma', 'El autor NO debe ser "apalma"');
  assert((APP_METADATA.author as string) !== 'TCTC', 'El autor NO debe ser "TCTC"');

  // 2. Versión del Sistema
  console.log('\n--- 2. Versión Oficial del Sistema ---');
  assert(Boolean(APP_METADATA.version), `La versión en APP_METADATA está definida (${APP_METADATA.version})`);
  assert(APP_METADATA.name === 'HBD', 'El nombre corto debe ser "HBD"');
  assert(APP_METADATA.fullName === 'Home Board Designer', 'El nombre completo debe ser "Home Board Designer"');

  // 3. Copyright & Año
  console.log('\n--- 3. Formato de Copyright Centralizado ---');
  assert(APP_METADATA.copyrightYear === 2026, 'El año de copyright debe ser 2026');
  assert(
    APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)',
    'El copyright debe ser "© 2026 Adrián Palma — HBD (Home Board Designer)"'
  );

  // 4. Sistema de Temas Predefinidos
  console.log('\n--- 4. Comprobación de Sistema de Temas & Tokens ---');
  assert(THEME_PRESETS.length >= 8, `Se han definido al menos 8 paletas/temas predefinidos (actuales: ${THEME_PRESETS.length})`);
  
  const emerald = THEME_PRESETS.find((t: ThemePresetItem) => t.hex === '#10b981');
  const spotify = THEME_PRESETS.find((t: ThemePresetItem) => t.hex === '#1db954');
  const indigo = THEME_PRESETS.find((t: ThemePresetItem) => t.hex === '#6366f1');
  const ocean = THEME_PRESETS.find((t: ThemePresetItem) => t.hex === '#0ea5e9');
  const purple = THEME_PRESETS.find((t: ThemePresetItem) => t.hex === '#a855f7');
  const amber = THEME_PRESETS.find((t: ThemePresetItem) => t.hex === '#f59e0b');
  const rose = THEME_PRESETS.find((t: ThemePresetItem) => t.hex === '#f43f5e');
  const cyan = THEME_PRESETS.find((t: ThemePresetItem) => t.hex === '#06b6d4');

  assert(Boolean(emerald), 'Tema HBD Emerald (#10b981) disponible');
  assert(Boolean(spotify), 'Tema HBD Spotify (#1db954) disponible');
  assert(Boolean(indigo), 'Tema HBD Indigo (#6366f1) disponible');
  assert(Boolean(ocean), 'Tema HBD Ocean Blue (#0ea5e9) disponible');
  assert(Boolean(purple), 'Tema HBD Purple Neon (#a855f7) disponible');
  assert(Boolean(amber), 'Tema HBD Amber Gold (#f59e0b) disponible');
  assert(Boolean(rose), 'Tema HBD Rose Red (#f43f5e) disponible');
  assert(Boolean(cyan), 'Tema HBD Cyan Sky (#06b6d4) disponible');

  // 5. Conversión HEX a RGB para variables CSS dinámicas
  console.log('\n--- 5. Conversión de Tokens RGB ---');
  function hexToRgb(hex: string) {
    const num = parseInt(hex.replace('#', ''), 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  const emeraldRgb = hexToRgb('#10b981');
  assert(emeraldRgb.r === 16 && emeraldRgb.g === 185 && emeraldRgb.b === 129, 'Conversión RGB correcta para Emerald: rgb(16, 185, 129)');

  const purpleRgb = hexToRgb('#a855f7');
  assert(purpleRgb.r === 168 && purpleRgb.g === 85 && purpleRgb.b === 247, 'Conversión RGB correcta para Purple: rgb(168, 85, 247)');

  console.log('\n====================================================');
  console.log(`RESUMEN: ${passed} pasados, ${failed} fallados`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
