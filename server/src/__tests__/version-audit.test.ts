/**
 * HBD — TEST SUITE DE AUDITORÍA Y VALIDACIÓN DEL SISTEMA DE VERSIONADO
 * 
 * Verifica las reglas contractuales de versionado semántico estructurado:
 * 1. Mapeo de fases del roadmap a SemVer (V1 -> 1.0.0, V2 -> 1.2.0, ..., V20 -> 1.20.0, V21 -> 1.21.0, V24 -> 1.24.0).
 * 2. Manejo de patches dentro de una fase (1.20.0 -> 1.20.1 -> 1.20.2).
 * 3. Única fuente de verdad sincronizada (version.json, app.constants.ts, app.config.ts, package.json).
 * 4. Presencia exclusiva de la versión en "Configuración -> Acerca de".
 * 5. Coherencia y estructura del CHANGELOG.md.
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { APP_METADATA, VersionEngine } from '@hbd/shared';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('🧪 HBD — AUDITORÍA DE SISTEMA DE VERSIONADO SEMÁNTICO Y FASES');
console.log('============================================================\n');

// -------------------------------------------------------------
// 1. Motor de Versionado Semántico (VersionEngine)
// -------------------------------------------------------------
console.log('--- 1. Mapeo de Fases del Roadmap a Versión Semántica ---');
assert(VersionEngine.phaseToVersion('V1') === '1.0.0', 'Fase V1 mapea a 1.0.0');
assert(VersionEngine.phaseToVersion('V2') === '1.2.0', 'Fase V2 mapea a 1.2.0');
assert(VersionEngine.phaseToVersion('V3') === '1.3.0', 'Fase V3 mapea a 1.3.0');
assert(VersionEngine.phaseToVersion('V10') === '1.10.0', 'Fase V10 mapea a 1.10.0');
assert(VersionEngine.phaseToVersion('V19') === '1.19.0', 'Fase V19 mapea a 1.19.0');
assert(VersionEngine.phaseToVersion('V20') === '1.20.0', 'Fase V20 mapea a 1.20.0');
assert(VersionEngine.phaseToVersion('V21') === '1.21.0', 'Fase V21 mapea a 1.21.0');
assert(VersionEngine.phaseToVersion('V24') === '1.24.0', 'Fase V24 mapea a 1.24.0');

console.log('\n--- 2. Manejo de Correcciones y Patches ---');
assert(VersionEngine.incrementPatch('1.20.0') === '1.20.1', 'Patch 1.20.0 -> 1.20.1');
assert(VersionEngine.incrementPatch('1.20.1') === '1.20.2', 'Patch 1.20.1 -> 1.20.2');
assert(VersionEngine.incrementPatch('1.20.2') === '1.20.3', 'Patch 1.20.2 -> 1.20.3');
assert(VersionEngine.versionToPhase('1.20.0') === 'V20', '1.20.0 pertenece a Fase V20');
assert(VersionEngine.versionToPhase('1.20.3') === 'V20', '1.20.3 pertenece a Fase V20 sin alterar fase');
assert(VersionEngine.versionToPhase('1.0.0') === 'V1', '1.0.0 pertenece a Fase V1');
assert(VersionEngine.versionToPhase('1.2.0') === 'V2', '1.2.0 pertenece a Fase V2');
assert(VersionEngine.isValidSemVer('1.20.0'), '1.20.0 es SemVer válido');
assert(VersionEngine.isValidSemVer('1.20.1'), '1.20.1 es SemVer válido');
assert(!VersionEngine.isValidSemVer('V20'), 'V20 no es SemVer puro (es identificador de fase)');

// -------------------------------------------------------------
// 2. Identidad Centralizada y Sincronización
// -------------------------------------------------------------
console.log('\n--- 3. Identidad Centralizada y Única Fuente de Verdad ---');
assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
assert(APP_METADATA.version === '1.24.5', `Versión global en APP_METADATA es "${APP_METADATA.version}" (Esperado: 1.24.5)`);
assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
assert(
  APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)',
  'Copyright oficial está unificado y exacto'
);

// Comprobar version.json
const versionJsonPath = path.resolve(__dirname, '../../../version.json');
assert(fs.existsSync(versionJsonPath), 'Archivo version.json existe en raíz del proyecto');
const versionJson = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
assert(versionJson.version === '1.24.5', `version.json contiene version "1.24.5"`);
assert(versionJson.phase === 'V24', `version.json contiene phase "V24"`);
assert(versionJson.author === 'Adrián Palma', `version.json contiene author "Adrián Palma"`);

// Comprobar package.json en raíz y workspaces
const rootPackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf-8'));
const sharedPackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../shared/package.json'), 'utf-8'));
const serverPackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../server/package.json'), 'utf-8'));
const clientPackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../client/package.json'), 'utf-8'));

assert(rootPackageJson.version === '1.24.5', 'package.json raíz tiene versión 1.24.5');
assert(sharedPackageJson.version === '1.24.5', 'shared/package.json tiene versión 1.24.5');
assert(serverPackageJson.version === '1.24.5', 'server/package.json tiene versión 1.24.5');
assert(clientPackageJson.version === '1.24.5', 'client/package.json tiene versión 1.24.5');

// Comprobar frontend app.config.ts
const clientConfigPath = path.resolve(__dirname, '../../../client/src/config/app.config.ts');
const clientConfigContent = fs.readFileSync(clientConfigPath, 'utf-8');
assert(clientConfigContent.includes("version: '1.24.5'"), 'client app.config.ts contiene version 1.24.5');

// -------------------------------------------------------------
// 3. Auditoría de la Interfaz (Sidebar y Páginas limpias)
// -------------------------------------------------------------
console.log('\n--- 4. Auditoría de la Interfaz (Sidebar y Menús limpios) ---');
const sidebarPath = path.resolve(__dirname, '../../../client/src/components/layout/Sidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

assert(!sidebarContent.includes("badge: 'V2'"), 'Sidebar NO muestra badge V2');
assert(!sidebarContent.includes("badge: 'V4'"), 'Sidebar NO muestra badge V4');
assert(!sidebarContent.includes("badge: 'V5'"), 'Sidebar NO muestra badge V5');
assert(!sidebarContent.includes("badge: 'V7'"), 'Sidebar NO muestra badge V7');
assert(!sidebarContent.includes("badge: 'V16'"), 'Sidebar NO muestra badge V16');
assert(!sidebarContent.includes("badge: 'V17'"), 'Sidebar NO muestra badge V17');
assert(!sidebarContent.includes("badge: 'V18'"), 'Sidebar NO muestra badge V18');
assert(!sidebarContent.includes("badge: 'V19'"), 'Sidebar NO muestra badge V19');
assert(!sidebarContent.includes("badge: 'V20'"), 'Sidebar NO muestra badge V20');
assert(!sidebarContent.includes("badge: 'V21'"), 'Sidebar NO muestra badge V21');
assert(!sidebarContent.includes("badge: 'V22'"), 'Sidebar NO muestra badge V22');
assert(!sidebarContent.includes("badge: 'V23'"), 'Sidebar NO muestra badge V23');
assert(!sidebarContent.includes("badge: 'V24'"), 'Sidebar NO muestra badge V24');
assert(!sidebarContent.includes("badge: '1.24.0'"), 'Sidebar NO muestra badge 1.24.0');
assert(!sidebarContent.includes("badge: '1.24.1'"), 'Sidebar NO muestra badge 1.24.1');
assert(!sidebarContent.includes("badge: '1.24.2'"), 'Sidebar NO muestra badge 1.24.2');
assert(!sidebarContent.includes("badge: '1.24.3'"), 'Sidebar NO muestra badge 1.24.3');
assert(!sidebarContent.includes("badge: '1.24.4'"), 'Sidebar NO muestra badge 1.24.4');
assert(!sidebarContent.includes("badge: '1.24.5'"), 'Sidebar NO muestra badge 1.24.5');
assert(sidebarContent.includes('/copilot'), 'Sidebar incluye ruta /copilot');
assert(sidebarContent.includes('/properties'), 'Sidebar incluye ruta /properties');
assert(sidebarContent.includes('/catalog'), 'Sidebar incluye ruta /catalog');
assert(sidebarContent.includes('/products'), 'Sidebar incluye ruta /products');
assert(sidebarContent.includes('/infrastructure'), 'Sidebar incluye ruta /infrastructure');
assert(sidebarContent.includes('/ar'), 'Sidebar incluye ruta /ar');
assert(sidebarContent.includes('/financial'), 'Sidebar incluye ruta /financial');
assert(sidebarContent.includes('/procurement'), 'Sidebar incluye ruta /procurement');

// -------------------------------------------------------------
// 4. Presencia Exclusiva en "Acerca de"
// -------------------------------------------------------------
console.log('\n--- 5. Presencia Exclusiva en "Acerca de" ---');
const aboutPath = path.resolve(__dirname, '../../../client/src/pages/AboutPage.tsx');
const aboutContent = fs.readFileSync(aboutPath, 'utf-8');
assert(aboutContent.includes('APP_CONFIG.version'), 'AboutPage muestra APP_CONFIG.version');
assert(aboutContent.includes('APP_CONFIG.author'), 'AboutPage muestra APP_CONFIG.author');
assert(aboutContent.includes('APP_CONFIG.copyright'), 'AboutPage muestra APP_CONFIG.copyright');

const settingsPath = path.resolve(__dirname, '../../../client/src/pages/SettingsPage.tsx');
const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
assert(settingsContent.includes("activeTab === 'about'"), 'SettingsPage incluye pestaña "Acerca de"');

// -------------------------------------------------------------
// 5. Auditoría de CHANGELOG.md
// -------------------------------------------------------------
console.log('\n--- 6. Auditoría de Estructura de CHANGELOG.md ---');
const changelogPath = path.resolve(__dirname, '../../../CHANGELOG.md');
const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
assert(changelogContent.includes('## [1.20.0] — Fase V20'), 'CHANGELOG contiene entrada "[1.20.0] — Fase V20"');
assert(changelogContent.includes('## [1.19.0] — Fase V19'), 'CHANGELOG contiene entrada "[1.19.0] — Fase V19"');
assert(changelogContent.includes('## [1.0.0] — Fase V1'), 'CHANGELOG contiene entrada "[1.0.0] — Fase V1"');
assert(changelogContent.includes('Estructura y Reglas Oficiales de Versionado HBD'), 'CHANGELOG documenta reglas de versionado');

// -------------------------------------------------------------
// 6. Internacionalización de "Acerca de"
// -------------------------------------------------------------
console.log('\n--- 7. Internacionalización de "Acerca de" ---');
const esLocale = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../client/src/i18n/locales/es.json'), 'utf-8'));
const enLocale = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../client/src/i18n/locales/en.json'), 'utf-8'));

assert(esLocale.about.title === 'Acerca de HBD', 'Traducción ES para about.title correcta');
assert(esLocale.about.version === 'Versión', 'Traducción ES para about.version correcta');
assert(esLocale.about.developedBy === 'Desarrollado por', 'Traducción ES para about.developedBy correcta');

assert(enLocale.about.title === 'About HBD', 'Traducción EN para about.title correcta');
assert(enLocale.about.version === 'Version', 'Traducción EN para about.version correcta');
assert(enLocale.about.developedBy === 'Developed by', 'Traducción EN para about.developedBy correcta');

// Resumen final
console.log('\n============================================================');
console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
