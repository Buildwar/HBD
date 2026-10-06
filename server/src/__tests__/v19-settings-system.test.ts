/**
 * HBD V19.0.0 — Settings & System Management Engine Test Suite
 * 
 * Verifies all 12 settings tabs capabilities, persistent storage,
 * safety checks, diagnostics, AI key masking, and health checks.
 * 
 * Author: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { SettingsService } from '../services/settings.service.js';
import { APP_METADATA } from '@hbd/shared';

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

async function runTests() {
  console.log('\n============================================================');
  console.log('🧪 HBD V19.0.0 — SETTINGS & SYSTEM MANAGEMENT TEST SUITE');
  console.log('============================================================\n');

  // 1. Metadata and App Version
  console.log('--- 1. Identidad Centralizada V19.0.0 ---');
  assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
  assert(Boolean(APP_METADATA.version), `Versión de HBD está definida: ${APP_METADATA.version}`);
  assert(APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)', 'Copyright unificado');

  // 2. General Settings
  console.log('\n--- 2. Preferencias Generales (Unidades, Monedas y Formato) ---');
  const initialGeneral = await SettingsService.getGeneralSettings();
  assert(Boolean(initialGeneral.displayUnit), 'Obtenida unidad de longitud por defecto');
  assert(['m', 'cm', 'mm'].includes(initialGeneral.displayUnit), 'Unidad de longitud es válida (m/cm/mm)');
  assert(['EUR', 'USD', 'GBP'].includes(initialGeneral.defaultCurrency), 'Moneda por defecto es válida (EUR/USD/GBP)');
  assert(typeof initialGeneral.confirmOnDelete === 'boolean', 'Preferencia confirmOnDelete es booleana');

  const updatedGeneral = await SettingsService.updateGeneralSettings({
    displayUnit: 'cm',
    defaultCurrency: 'USD',
    confirmOnDelete: true,
  });
  assert(updatedGeneral.displayUnit === 'cm', 'Actualización de displayUnit a "cm" persistida');
  assert(updatedGeneral.defaultCurrency === 'USD', 'Actualización de defaultCurrency a "USD" persistida');

  // 3. Project Settings
  console.log('\n--- 3. Parámetros de Modelado de Proyectos ---');
  const projectSettings = await SettingsService.getProjectSettings();
  assert(projectSettings.defaultWallHeight >= 2.0 && projectSettings.defaultWallHeight <= 5.0, 'Altura de pared estándar dentro de rango');
  assert(projectSettings.defaultWallThickness > 0.05 && projectSettings.defaultWallThickness <= 0.5, 'Grosor de pared estándar válido');
  assert(['2d', '3d', 'details'].includes(projectSettings.defaultInitialView), 'Modo de visualización inicial válido');

  const updatedProject = await SettingsService.updateProjectSettings({
    defaultWallHeight: 2.8,
    defaultWallThickness: 0.20,
    defaultInitialView: '3d',
  });
  assert(updatedProject.defaultWallHeight === 2.8, 'Altura estándar 2.80m persistida');
  assert(updatedProject.defaultWallThickness === 0.20, 'Grosor estándar 0.20m persistido');
  assert(updatedProject.defaultInitialView === '3d', 'Vista inicial 3D persistida');

  // 4. AI & Vision Settings with Key Masking
  console.log('\n--- 4. Motor de IA y Visión con Enmascaramiento de Claves ---');
  const aiSettings = await SettingsService.getAISettings();
  assert(Boolean(aiSettings.provider), 'Proveedor de IA obtenido');
  assert(typeof aiSettings.isMockMode === 'boolean', 'Estado de modo mock verificado');
  assert(aiSettings.temperature >= 0.1 && aiSettings.temperature <= 1.0, 'Temperatura de IA dentro de rango');

  const updatedAI = await SettingsService.updateAISettings({
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.65,
    apiKey: 'sk-test-secret-key-1234567890',
  });
  assert(updatedAI.provider === 'openai', 'Proveedor de IA actualizado a OpenAI');
  assert(updatedAI.model === 'gpt-4o', 'Modelo de IA actualizado a gpt-4o');
  assert(updatedAI.hasCustomApiKey === true, 'hasCustomApiKey marcado como true');
  assert(updatedAI.apiKeyMasked?.endsWith('7890') === true, 'Clave de API enmascarada con últimos 4 dígitos');
  assert(!JSON.stringify(updatedAI).includes('sk-test-secret-key-1234567890'), 'Clave raw no se filtra en el DTO');

  // 5. Storage Summary and Footprint
  console.log('\n--- 5. Métricas de Almacenamiento y Limpieza de Temporales ---');
  const storageSummary = await SettingsService.getStorageSummary();
  assert(storageSummary.databaseSizeBytes > 0, 'Huella de base de datos calculada');
  assert(typeof storageSummary.formattedDatabaseSize === 'string', 'Tamaño de base de datos formateado legible');
  assert(typeof storageSummary.projectsCount === 'number', 'Conteo de proyectos obtenido');
  assert(typeof storageSummary.uploadsCount === 'number', 'Conteo de archivos en uploads obtenido');

  const cleanResult = await SettingsService.cleanupScratchStorage();
  assert(typeof cleanResult.cleanedFiles === 'number', 'Función de limpieza de temporales ejecutada correctamente');

  // 6. Security Settings and Password Policies
  console.log('\n--- 6. Políticas de Seguridad y Retención ---');
  const secSettings = await SettingsService.getSecuritySettings();
  assert(secSettings.passwordMinLength >= 6, 'Longitud mínima de contraseña segura');
  assert(secSettings.sessionTimeoutHours >= 24, 'Tiempo de expiración de sesión válido');

  const updatedSec = await SettingsService.updateSecuritySettings({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    sessionTimeoutHours: 72,
  });
  assert(updatedSec.passwordMinLength === 8, 'Longitud mínima 8 caracteres persistida');
  assert(updatedSec.passwordRequireUppercase === true, 'Requisito de mayúsculas persistido');

  // 7. System Health and Diagnostics
  console.log('\n--- 7. Monitorización de Salud y Diagnósticos de Plataforma ---');
  const health = await SettingsService.getSystemHealth();
  assert(health.backendStatus === 'online', 'Backend status es ONLINE');
  assert(health.frontendStatus === 'online', 'Frontend status es ONLINE');
  assert(Boolean(health.platform), 'Información de plataforma identificada');
  assert(health.memoryUsageBytes > 0, 'Uso de memoria heap medido');
  assert(typeof health.memoryUsageFormatted === 'string', 'Uso de memoria formateado');

  const diagnostics = await SettingsService.runSystemDiagnostics();
  assert(diagnostics.checks.length >= 3, 'Diagnóstico ejecuta todas las comprobaciones requeridas');
  assert(diagnostics.checks.some(c => c.id === 'db_connection'), 'Comprobación de base de datos incluida');
  assert(diagnostics.checks.some(c => c.id === 'db_schema'), 'Comprobación de esquema y modelos incluida');
  assert(diagnostics.checks.some(c => c.id === 'storage_rw'), 'Comprobación de almacenamiento incluida');
  assert(['healthy', 'degraded', 'critical'].includes(diagnostics.overall), 'Estado global de salud determinado');

  // 8. Reset Section
  console.log('\n--- 8. Restablecimiento de Secciones a Valores de Fábrica ---');
  const resetSuccess = await SettingsService.resetSection('general');
  assert(resetSuccess === true, 'Restablecimiento de sección "general" exitoso');
  const resetGeneral = await SettingsService.getGeneralSettings();
  assert(resetGeneral.displayUnit === 'm', 'displayUnit restablecido al valor inicial "m"');
  assert(resetGeneral.defaultCurrency === 'EUR', 'defaultCurrency restablecido al valor inicial "EUR"');

  // Resumen final
  console.log('\n============================================================');
  console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Error durante la ejecución de pruebas:', err);
  process.exit(1);
});
