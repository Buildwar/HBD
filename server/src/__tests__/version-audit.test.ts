/**
 * HBD — TEST SUITE DE AUDITORÍA Y CORRECCIÓN DE VERSIONADO VISUAL
 * 
 * Verifica que la versión de HBD únicamente se muestre en "Acerca de"
 * y que ningún menú, sidebar, botón o módulo contenga badges o textos
 * de versiones históricas (V2, V4, V5, V6, V7).
 */

import { APP_METADATA } from '@hbd/shared';
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
console.log('🧪 HBD — AUDITORÍA DE CENTRALIZACIÓN DE VERSIÓN EN "ACERCA DE"');
console.log('============================================================\n');

// 1. Versión Global Centralizada y Autoría Oficial
console.log('--- 1. Identidad Centralizada y Autor Oficial ---');
assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
assert(APP_METADATA.version === '9.0.0', `Versión global centralizada es "${APP_METADATA.version}"`);
assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
assert(
  APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)',
  'Copyright oficial está unificado y exacto'
);

// 2. Auditoría del Sidebar (Menú Lateral)
console.log('\n--- 2. Auditoría del Menú Lateral (Sidebar.tsx) ---');
const sidebarPath = path.resolve(__dirname, '../../../client/src/components/layout/Sidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

// Comprobar que no hay badges de versión en items de navegación
assert(!sidebarContent.includes("badge: 'V2'"), 'Sidebar NO muestra badge V2 en Planos');
assert(!sidebarContent.includes("badge: 'V4'"), 'Sidebar NO muestra badge V4 en Mobiliario');
assert(!sidebarContent.includes("badge: 'V5'"), 'Sidebar NO muestra badge V5 en Vista 3D');
assert(!sidebarContent.includes("badge: 'V7'"), 'Sidebar NO muestra badge V7 en Renders');
assert(!sidebarContent.includes("badge: 'V6'"), 'Sidebar NO muestra badge V6');
assert(!sidebarContent.includes("badge: 'V1'"), 'Sidebar NO muestra badge V1');
assert(sidebarContent.includes('Próximamente'), 'Sidebar conserva etiqueta "Próximamente" para Biblioteca');

// 3. Auditoría de Módulos y Páginas
console.log('\n--- 3. Auditoría de Páginas y Módulos ---');

// Planes
const plansPath = path.resolve(__dirname, '../../../client/src/pages/PlansPage.tsx');
const plansContent = fs.readFileSync(plansPath, 'utf-8');
assert(!plansContent.includes('V4.0.0'), 'PlansPage NO contiene texto "V4.0.0"');
assert(!plansContent.includes('Análisis V4'), 'PlansPage NO contiene texto "Análisis V4"');
assert(plansContent.includes('Motor de Planos Arquitectónicos'), 'PlansPage muestra título limpio');

// Mobiliario
const furniturePath = path.resolve(__dirname, '../../../client/src/pages/FurniturePage.tsx');
const furnitureContent = fs.readFileSync(furniturePath, 'utf-8');
assert(!furnitureContent.includes('V5.0.0'), 'FurniturePage NO contiene texto "V5.0.0"');
assert(!furnitureContent.includes('V4.0.0'), 'FurniturePage NO contiene texto "V4.0.0"');
assert(furnitureContent.includes('Biblioteca de Mobiliario'), 'FurniturePage muestra título limpio');

// Project Detail
const projectDetailPath = path.resolve(__dirname, '../../../client/src/pages/ProjectDetailPage.tsx');
const projectDetailContent = fs.readFileSync(projectDetailPath, 'utf-8');
assert(!projectDetailContent.includes('Plano & Análisis V4'), 'ProjectDetailPage botón no tiene "V4"');
assert(!projectDetailContent.includes('Motor de Planos V4'), 'ProjectDetailPage acción no tiene "V4"');

// Login
const loginPath = path.resolve(__dirname, '../../../client/src/pages/LoginPage.tsx');
const loginContent = fs.readFileSync(loginPath, 'utf-8');
assert(!loginContent.includes('v{APP_CONFIG.version}'), 'LoginPage footer no muestra versión');

// Visor 3D y Renders
const viewer3dPath = path.resolve(__dirname, '../../../client/src/pages/Viewer3DPage.tsx');
const viewer3dContent = fs.readFileSync(viewer3dPath, 'utf-8');
assert(!viewer3dContent.includes('(Fase 5)'), 'Viewer3DPage no contiene "(Fase 5)"');

const rendersPath = path.resolve(__dirname, '../../../client/src/pages/RendersPage.tsx');
const rendersContent = fs.readFileSync(rendersPath, 'utf-8');
assert(!rendersContent.includes('(Fase 7)'), 'RendersPage no contiene "(Fase 7)"');

// 4. Auditoría de la Sección "Acerca de" (Único lugar con versión visible)
console.log('\n--- 4. Presencia Exclusiva en "Acerca de" ---');
const aboutPath = path.resolve(__dirname, '../../../client/src/pages/AboutPage.tsx');
const aboutContent = fs.readFileSync(aboutPath, 'utf-8');
assert(aboutContent.includes('APP_CONFIG.version'), 'AboutPage muestra APP_CONFIG.version');
assert(aboutContent.includes('APP_CONFIG.author'), 'AboutPage muestra APP_CONFIG.author');
assert(aboutContent.includes('APP_CONFIG.copyright'), 'AboutPage muestra APP_CONFIG.copyright');

const settingsPath = path.resolve(__dirname, '../../../client/src/pages/SettingsPage.tsx');
const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
assert(settingsContent.includes("activeTab === 'about'"), 'SettingsPage incluye pestaña "Acerca de"');
assert(!settingsContent.includes('Temas y Personalización V2'), 'SettingsPage pestaña apariencia no tiene "V2"');

// 5. Internacionalización de "Acerca de"
console.log('\n--- 5. Internacionalización de "Acerca de" ---');
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
