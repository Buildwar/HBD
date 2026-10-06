/**
 * HBD — TEST SUITE DE AUDITORÍA Y VALIDACIÓN DE INTERNACIONALIZACIÓN (i18n)
 * 
 * Fase: V24.2 — Internationalization & Translation Hardening
 * Versión: 1.24.2
 * 
 * Verifica las reglas contractuales del sistema i18n:
 * 1. Carga e integridad sintáctica de los diccionarios 'es.json' y 'en.json'.
 * 2. Paridad exacta de claves (100% simetría bidireccional entre español e inglés).
 * 3. Ausencia de traducciones vacías, nulas o con marcadores incompletos.
 * 4. Cobertura completa de todos los módulos del sistema (V1 a V24.2).
 * 5. Configuración de idiomas soportados y de respaldo (fallback) en APP_METADATA.
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
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
console.log('🌐 HBD — AUDITORÍA DE INTERNACIONALIZACIÓN (i18n) V24.2');
console.log('============================================================\n');

// -------------------------------------------------------------
// 1. Configuración de Metadatos de Idioma
// -------------------------------------------------------------
console.log('--- 1. Configuración de Metadatos de Idioma en Shared ---');
assert(APP_METADATA.defaultLanguage === 'es', 'El idioma por defecto es español (es)');
assert(
  Array.isArray(APP_METADATA.supportedLanguages) &&
  APP_METADATA.supportedLanguages.includes('es') &&
  APP_METADATA.supportedLanguages.includes('en'),
  'Los idiomas soportados incluyen "es" y "en"'
);

// -------------------------------------------------------------
// 2. Existencia e Integridad de Archivos de Traducción
// -------------------------------------------------------------
console.log('\n--- 2. Existencia y Validez de Archivos de Traducción ---');
const localesDir = path.resolve(__dirname, '../../../client/src/i18n/locales');
const esPath = path.join(localesDir, 'es.json');
const enPath = path.join(localesDir, 'en.json');

assert(fs.existsSync(esPath), 'El archivo client/src/i18n/locales/es.json existe');
assert(fs.existsSync(enPath), 'El archivo client/src/i18n/locales/en.json existe');

let esLocale: Record<string, any> = {};
let enLocale: Record<string, any> = {};

try {
  esLocale = JSON.parse(fs.readFileSync(esPath, 'utf-8'));
  assert(true, 'es.json es un archivo JSON válido');
} catch (e) {
  assert(false, `Error al parsear es.json: ${(e as Error).message}`);
}

try {
  enLocale = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  assert(true, 'en.json es un archivo JSON válido');
} catch (e) {
  assert(false, `Error al parsear en.json: ${(e as Error).message}`);
}

// -------------------------------------------------------------
// 3. Extracción Recursiva y Paridad de Claves
// -------------------------------------------------------------
console.log('\n--- 3. Extracción y Paridad de Claves Recursivas ---');

function extractKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(extractKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const esKeys = extractKeys(esLocale);
const enKeys = extractKeys(enLocale);

console.log(`  ℹ️ Total de claves en español (es): ${esKeys.length}`);
console.log(`  ℹ️ Total de claves en inglés (en): ${enKeys.length}`);

assert(esKeys.length > 500, `El diccionario español contiene un volumen representativo (${esKeys.length} claves)`);
assert(esKeys.length === enKeys.length, `Total de claves idéntico entre ES (${esKeys.length}) y EN (${enKeys.length})`);

const missingInEn = esKeys.filter(k => !enKeys.includes(k));
const missingInEs = enKeys.filter(k => !esKeys.includes(k));

assert(missingInEn.length === 0, `Cero claves faltantes en inglés (Faltantes: ${missingInEn.join(', ') || '0'})`);
assert(missingInEs.length === 0, `Cero claves faltantes en español (Faltantes: ${missingInEs.join(', ') || '0'})`);

// -------------------------------------------------------------
// 4. Verificación de Cero Valores Vacíos o Inválidos
// -------------------------------------------------------------
console.log('\n--- 4. Validación de Contenido y Ausencia de Valores Vacíos ---');

function findEmptyValues(obj: Record<string, any>, prefix = ''): string[] {
  let empty: string[] = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      empty = empty.concat(findEmptyValues(obj[k], fullKey));
    } else if (typeof obj[k] === 'string') {
      if (obj[k].trim().length === 0) {
        empty.push(fullKey);
      }
    } else if (obj[k] === null || obj[k] === undefined) {
      empty.push(fullKey);
    }
  }
  return empty;
}

const emptyEs = findEmptyValues(esLocale);
const emptyEn = findEmptyValues(enLocale);

assert(emptyEs.length === 0, `Cero valores vacíos en español (Vacíos: ${emptyEs.join(', ') || '0'})`);
assert(emptyEn.length === 0, `Cero valores vacíos en inglés (Vacíos: ${emptyEn.join(', ') || '0'})`);

// -------------------------------------------------------------
// 5. Cobertura de Módulos Críticos del Sistema (V1 - V24)
// -------------------------------------------------------------
console.log('\n--- 5. Cobertura de Espacios de Nombres y Módulos Críticos ---');

const requiredNamespaces = [
  'app',
  'nav',
  'dashboard',
  'projects',
  'properties',
  'property',
  'auth',
  'settings',
  'about',
  'common',
  'plans',
  'furniture',
  'viewer3d',
  'renders',
  'aiDesign',
  'aiVision',
  'construction',
  'intelligence',
  'scenarios',
  'optimization',
  'documents',
  'execution',
  'site',
  'procurement',
  'products',
  'financial',
  'retailCatalog',
  'technicalInfrastructure',
  'ar',
  'copilot'
];

for (const ns of requiredNamespaces) {
  const presentInEs = ns in esLocale;
  const presentInEn = ns in enLocale;
  assert(presentInEs && presentInEn, `Namespace "${ns}" presente en ambos diccionarios (ES: ${presentInEs}, EN: ${presentInEn})`);
}

// -------------------------------------------------------------
// 6. Validación de Valores Clave de Navegación y UI
// -------------------------------------------------------------
console.log('\n--- 6. Verificación de Traducciones Específicas de Navegación ---');

assert(esLocale.nav?.copilot === 'Copiloto IA', 'Traducción ES para nav.copilot');
assert(enLocale.nav?.copilot === 'AI Copilot', 'Traducción EN para nav.copilot');

assert(esLocale.nav?.properties === 'Inmuebles', 'Traducción ES para nav.properties');
assert(enLocale.nav?.properties === 'Properties', 'Traducción EN para nav.properties');

assert(esLocale.nav?.catalog === 'Catálogo', 'Traducción ES para nav.catalog');
assert(enLocale.nav?.catalog === 'Catalog', 'Traducción EN para nav.catalog');

assert(esLocale.nav?.infrastructure === 'Infraestructura', 'Traducción ES para nav.infrastructure');
assert(enLocale.nav?.infrastructure === 'Infrastructure', 'Traducción EN para nav.infrastructure');

assert(esLocale.nav?.ar === 'Realidad Aumentada', 'Traducción ES para nav.ar');
assert(enLocale.nav?.ar === 'Augmented Reality', 'Traducción EN para nav.ar');

// Resumen final
console.log('\n============================================================');
console.log(`📊 RESULTADOS i18n AUDIT: ${passed} pruebas superadas, ${failed} fallos.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
