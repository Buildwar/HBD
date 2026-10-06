import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type {
  GeneralSettingsDto,
  ProjectSettingsDto,
  AISettingsDto,
  UpdateAISettingsInput,
  StorageSummaryDto,
  SecuritySettingsDto,
  SystemHealthDto,
  SystemDiagnosticsResultDto,
  AuditLogEntryDto,
} from '@hbd/shared';

// Helper to format bytes to human readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Helper to get directory size recursively
function getDirectorySizeBytes(dirPath: string): { totalSize: number; fileCount: number } {
  let totalSize = 0;
  let fileCount = 0;

  if (!fs.existsSync(dirPath)) {
    return { totalSize, fileCount };
  }

  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    try {
      if (item.isDirectory()) {
        const sub = getDirectorySizeBytes(fullPath);
        totalSize += sub.totalSize;
        fileCount += sub.fileCount;
      } else if (item.isFile()) {
        const stat = fs.statSync(fullPath);
        totalSize += stat.size;
        fileCount += 1;
      }
    } catch {
      // Ignore inaccessible files
    }
  }

  return { totalSize, fileCount };
}

export class SettingsService {
  // In-memory store fallback when database is offline or in CI/test runners
  private static memoryStore: Map<string, string> = new Map();
  private static isDbOffline = false;

  private static async getRawSetting(key: string): Promise<string | null> {
    if (!this.isDbOffline) {
      try {
        const setting = await prisma.appSetting.findUnique({
          where: { key },
        });
        if (setting && setting.value) {
          this.memoryStore.set(key, setting.value);
          return setting.value;
        }
      } catch (err: any) {
        if (
          err?.name === 'PrismaClientInitializationError' ||
          err?.message?.includes("Can't reach database server")
        ) {
          this.isDbOffline = true;
        }
      }
    }
    return this.memoryStore.get(key) || null;
  }

  private static async setRawSetting(
    key: string,
    value: string,
    description: string,
    isPublic: boolean
  ): Promise<void> {
    this.memoryStore.set(key, value);
    if (!this.isDbOffline) {
      try {
        await prisma.appSetting.upsert({
          where: { key },
          create: {
            key,
            value,
            description,
            isPublic,
          },
          update: {
            value,
          },
        });
      } catch (err: any) {
        if (
          err?.name === 'PrismaClientInitializationError' ||
          err?.message?.includes("Can't reach database server")
        ) {
          this.isDbOffline = true;
        }
      }
    }
  }

  private static async deleteRawSetting(key: string): Promise<void> {
    this.memoryStore.delete(key);
    if (!this.isDbOffline) {
      try {
        await prisma.appSetting.deleteMany({
          where: { key },
        });
      } catch (err: any) {
        if (
          err?.name === 'PrismaClientInitializationError' ||
          err?.message?.includes("Can't reach database server")
        ) {
          this.isDbOffline = true;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 1. GENERAL SETTINGS
  // -------------------------------------------------------------
  static async getGeneralSettings(): Promise<GeneralSettingsDto> {
    const defaultSettings: GeneralSettingsDto = {
      displayUnit: 'm',
      areaUnit: 'm2',
      defaultCurrency: 'EUR',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberSeparator: 'comma_dot',
      confirmOnDelete: true,
      confirmOnReset: true,
      showTooltips: true,
    };

    const raw = await this.getRawSetting('general_settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }

    return defaultSettings;
  }

  static async updateGeneralSettings(
    data: Partial<GeneralSettingsDto>,
    userId?: string
  ): Promise<GeneralSettingsDto> {
    const current = await this.getGeneralSettings();
    const updated = { ...current, ...data };

    await this.setRawSetting(
      'general_settings',
      JSON.stringify(updated),
      'Preferencias generales del sistema HBD',
      true
    );

    await logger.audit('SYSTEM', 'Configuración general actualizada', userId);
    return updated;
  }

  // -------------------------------------------------------------
  // 2. PROJECT SETTINGS
  // -------------------------------------------------------------
  static async getProjectSettings(): Promise<ProjectSettingsDto> {
    const defaultSettings: ProjectSettingsDto = {
      defaultWallHeight: 2.6,
      defaultWallThickness: 0.15,
      defaultInitialView: '2d',
      autoSaveIntervalSeconds: 60,
      defaultPropertyType: 'APARTMENT',
      defaultSnapGrid: true,
      defaultSnapGridSize: 0.1,
    };

    const raw = await this.getRawSetting('project_settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }

    return defaultSettings;
  }

  static async updateProjectSettings(
    data: Partial<ProjectSettingsDto>,
    userId?: string
  ): Promise<ProjectSettingsDto> {
    const current = await this.getProjectSettings();
    const updated = { ...current, ...data };

    await this.setRawSetting(
      'project_settings',
      JSON.stringify(updated),
      'Parámetros por defecto para nuevos proyectos y modelado',
      true
    );

    await logger.audit('PROJECT', 'Configuración de proyectos actualizada', userId);
    return updated;
  }

  // -------------------------------------------------------------
  // 3. AI & VISION SETTINGS
  // -------------------------------------------------------------
  static async getAISettings(): Promise<AISettingsDto> {
    const defaultSettings: AISettingsDto = {
      provider: (ENV.AI_PROVIDER as any) || 'mock',
      visionProvider: (ENV.AI_VISION_PROVIDER as any) || 'mock',
      model: ENV.AI_MODEL || 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2048,
      isMockMode: (ENV.AI_PROVIDER || 'mock') === 'mock',
      hasCustomApiKey: Boolean(ENV.AI_API_KEY && ENV.AI_API_KEY.length > 5),
      hasCustomVisionApiKey: Boolean(ENV.AI_VISION_API_KEY && ENV.AI_VISION_API_KEY.length > 5),
      apiKeyMasked: ENV.AI_API_KEY && ENV.AI_API_KEY.length > 4
        ? `••••••••••••${ENV.AI_API_KEY.slice(-4)}`
        : undefined,
      visionApiKeyMasked: ENV.AI_VISION_API_KEY && ENV.AI_VISION_API_KEY.length > 4
        ? `••••••••••••${ENV.AI_VISION_API_KEY.slice(-4)}`
        : undefined,
    };

    const raw = await this.getRawSetting('ai_settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const provider = parsed.provider || defaultSettings.provider;
        const visionProvider = parsed.visionProvider || defaultSettings.visionProvider;
        const rawApiKey = parsed.apiKey || ENV.AI_API_KEY;
        const rawVisionApiKey = parsed.visionApiKey || ENV.AI_VISION_API_KEY;

        return {
          provider,
          visionProvider,
          model: parsed.model || defaultSettings.model,
          temperature: typeof parsed.temperature === 'number' ? parsed.temperature : defaultSettings.temperature,
          maxTokens: typeof parsed.maxTokens === 'number' ? parsed.maxTokens : defaultSettings.maxTokens,
          isMockMode: provider === 'mock',
          hasCustomApiKey: Boolean(rawApiKey && rawApiKey.length > 5),
          hasCustomVisionApiKey: Boolean(rawVisionApiKey && rawVisionApiKey.length > 5),
          apiKeyMasked: rawApiKey && rawApiKey.length > 4 ? `••••••••••••${rawApiKey.slice(-4)}` : undefined,
          visionApiKeyMasked: rawVisionApiKey && rawVisionApiKey.length > 4 ? `••••••••••••${rawVisionApiKey.slice(-4)}` : undefined,
        };
      } catch {
        return defaultSettings;
      }
    }

    return defaultSettings;
  }

  static async updateAISettings(
    input: UpdateAISettingsInput,
    userId?: string
  ): Promise<AISettingsDto> {
    let currentStored: any = {};
    const raw = await this.getRawSetting('ai_settings');
    if (raw) {
      try {
        currentStored = JSON.parse(raw);
      } catch {
        currentStored = {};
      }
    }

    const updatedStored = {
      ...currentStored,
      ...(input.provider !== undefined && { provider: input.provider }),
      ...(input.visionProvider !== undefined && { visionProvider: input.visionProvider }),
      ...(input.model !== undefined && { model: input.model }),
      ...(input.temperature !== undefined && { temperature: input.temperature }),
      ...(input.maxTokens !== undefined && { maxTokens: input.maxTokens }),
      ...(input.apiKey && { apiKey: input.apiKey }),
      ...(input.visionApiKey && { visionApiKey: input.visionApiKey }),
    };

    await this.setRawSetting(
      'ai_settings',
      JSON.stringify(updatedStored),
      'Configuración del motor de Inteligencia Artificial y Visión',
      false
    );

    await logger.audit('AI', 'Ajustes del motor de Inteligencia Artificial actualizados', userId);
    return this.getAISettings();
  }

  // -------------------------------------------------------------
  // 4. STORAGE & CLEANUP
  // -------------------------------------------------------------
  static async getStorageSummary(): Promise<StorageSummaryDto> {
    const uploadDir = ENV.UPLOAD_DIR;
    const { totalSize: uploadsSizeBytes, fileCount: uploadsCount } = getDirectorySizeBytes(uploadDir);

    let projectsCount = 0;
    let floorPlansCount = 0;
    let rendersCount = 0;
    let digitalTwinsCount = 0;
    let documentsCount = 0;
    let scratchFilesCount = 0;

    try {
      const [pCount, fpCount, rCount, dtCount] = await Promise.all([
        prisma.project.count(),
        prisma.floorPlan.count(),
        prisma.render.count(),
        prisma.furnitureTwin.count(),
      ]);
      projectsCount = pCount;
      floorPlansCount = fpCount;
      rendersCount = rCount;
      digitalTwinsCount = dtCount;
      documentsCount = 0;
    } catch {
      // Fallback if some tables are empty or count fails
    }

    // Check temp scratch directory
    const scratchDir = path.resolve(uploadDir, 'temp');
    if (fs.existsSync(scratchDir)) {
      const { fileCount } = getDirectorySizeBytes(scratchDir);
      scratchFilesCount = fileCount;
    }

    // Estimate database footprint (proportional to total record count ~ 2KB per record baseline + 5MB base)
    const estimatedDbBytes = (projectsCount + floorPlansCount + rendersCount + digitalTwinsCount + documentsCount) * 4096 + 8 * 1024 * 1024;

    return {
      databaseSizeBytes: estimatedDbBytes,
      uploadsSizeBytes,
      projectsCount,
      floorPlansCount,
      rendersCount,
      digitalTwinsCount,
      documentsCount,
      uploadsCount,
      scratchFilesCount,
      formattedDatabaseSize: formatBytes(estimatedDbBytes),
      formattedUploadsSize: formatBytes(uploadsSizeBytes),
    };
  }

  static async cleanupScratchStorage(userId?: string): Promise<{ cleanedFiles: number; freedBytes: number }> {
    const uploadDir = ENV.UPLOAD_DIR;
    const scratchDir = path.resolve(uploadDir, 'temp');
    let cleanedFiles = 0;
    let freedBytes = 0;

    if (fs.existsSync(scratchDir)) {
      const items = fs.readdirSync(scratchDir);
      for (const item of items) {
        const fullPath = path.join(scratchDir, item);
        try {
          const stat = fs.statSync(fullPath);
          freedBytes += stat.size;
          fs.unlinkSync(fullPath);
          cleanedFiles++;
        } catch {
          // Ignore
        }
      }
    }

    await logger.audit('SYSTEM', `Limpieza de almacenamiento temporal ejecutada: ${cleanedFiles} archivos eliminados (${formatBytes(freedBytes)})`, userId);
    return { cleanedFiles, freedBytes };
  }

  // -------------------------------------------------------------
  // 5. SECURITY SETTINGS
  // -------------------------------------------------------------
  static async getSecuritySettings(): Promise<SecuritySettingsDto> {
    const defaultSettings: SecuritySettingsDto = {
      passwordMinLength: 6,
      passwordRequireUppercase: false,
      passwordRequireNumber: false,
      passwordRequireSpecial: false,
      sessionTimeoutHours: 168, // 7 days
      maxActiveSessions: 5,
      auditLogRetentionDays: 90,
    };

    const raw = await this.getRawSetting('security_settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }

    return defaultSettings;
  }

  static async updateSecuritySettings(
    data: Partial<SecuritySettingsDto>,
    userId?: string
  ): Promise<SecuritySettingsDto> {
    const current = await this.getSecuritySettings();
    const updated = { ...current, ...data };

    await this.setRawSetting(
      'security_settings',
      JSON.stringify(updated),
      'Políticas de seguridad, contraseñas y sesiones',
      false
    );

    await logger.audit('AUTH', 'Políticas de seguridad del sistema actualizadas', userId);
    return updated;
  }

  // -------------------------------------------------------------
  // 6. AUDIT LOGS
  // -------------------------------------------------------------
  static async getAuditLogs(limit = 50): Promise<AuditLogEntryDto[]> {
    try {
      const logs = await prisma.systemLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return logs.map((l) => ({
        id: l.id,
        userId: l.userId,
        userName: l.user?.name || 'Sistema',
        userEmail: l.user?.email,
        action: l.module,
        entity: l.level,
        entityId: undefined,
        details: l.metadata as any,
        createdAt: l.createdAt.toISOString(),
      }));
    } catch {
      return [];
    }
  }

  // -------------------------------------------------------------
  // 7. SYSTEM HEALTH & DIAGNOSTICS
  // -------------------------------------------------------------
  static async getSystemHealth(): Promise<SystemHealthDto> {
    let dbConnected = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbConnected = false;
    }

    const aiSettings = await this.getAISettings();
    const mem = process.memoryUsage();

    return {
      frontendStatus: 'online',
      backendStatus: 'online',
      databaseStatus: dbConnected ? 'online' : 'offline',
      storageStatus: fs.existsSync(ENV.UPLOAD_DIR) ? 'online' : 'degraded',
      aiStatus: aiSettings.isMockMode ? 'mock_mode' : 'configured',
      nodeVersion: process.version,
      platform: `${process.platform} (${process.arch})`,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageBytes: mem.heapUsed,
      memoryUsageFormatted: formatBytes(mem.heapUsed),
      timestamp: new Date().toISOString(),
    };
  }

  static async runSystemDiagnostics(userId?: string): Promise<SystemDiagnosticsResultDto> {
    const startTime = Date.now();
    const checks: SystemDiagnosticsResultDto['checks'] = [];

    // 1. Check Database Connectivity
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.push({
        id: 'db_connection',
        name: 'Conexión a Base de Datos PostgreSQL',
        status: 'ok',
        message: 'Conexión activa y respondiendo a consultas SQL.',
        durationMs: Date.now() - dbStart,
      });
    } catch (e: any) {
      checks.push({
        id: 'db_connection',
        name: 'Conexión a Base de Datos PostgreSQL',
        status: 'error',
        message: `Error al conectar con PostgreSQL: ${e.message}`,
        durationMs: Date.now() - dbStart,
      });
    }

    // 2. Check Database Tables & Prisma Models
    const modelStart = Date.now();
    try {
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();
      checks.push({
        id: 'db_schema',
        name: 'Integridad del Esquema y Modelos Prisma',
        status: 'ok',
        message: `Modelos cargados correctamente (${userCount} usuarios, ${projectCount} proyectos registrados).`,
        durationMs: Date.now() - modelStart,
      });
    } catch (e: any) {
      checks.push({
        id: 'db_schema',
        name: 'Integridad del Esquema y Modelos Prisma',
        status: 'error',
        message: `Fallo al consultar tablas del sistema: ${e.message}`,
        durationMs: Date.now() - modelStart,
      });
    }

    // 3. Check Storage & Uploads Directory Writeability
    const storageStart = Date.now();
    try {
      if (!fs.existsSync(ENV.UPLOAD_DIR)) {
        fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
      }
      const testFilePath = path.join(ENV.UPLOAD_DIR, `.health_test_${Date.now()}.tmp`);
      fs.writeFileSync(testFilePath, 'HBD_HEALTH_CHECK_OK');
      fs.unlinkSync(testFilePath);

      checks.push({
        id: 'storage_rw',
        name: 'Sistema de Archivos y Directorio de Cargas',
        status: 'ok',
        message: `Directorio de almacenamiento accesible y con permisos de lectura/escritura (${ENV.UPLOAD_DIR}).`,
        durationMs: Date.now() - storageStart,
      });
    } catch (e: any) {
      checks.push({
        id: 'storage_rw',
        name: 'Sistema de Archivos y Directorio de Cargas',
        status: 'warn',
        message: `Advertencia en permisos de almacenamiento: ${e.message}`,
        durationMs: Date.now() - storageStart,
      });
    }

    // 4. Check AI Engine Status
    const aiStart = Date.now();
    const aiSettings = await this.getAISettings();
    if (aiSettings.isMockMode) {
      checks.push({
        id: 'ai_engine',
        name: 'Motor de Inteligencia Artificial y Visión',
        status: 'ok',
        message: 'Modo Demostración / Mock activo. Motor sintético listo para operar sin claves de API externas.',
        durationMs: Date.now() - aiStart,
      });
    } else {
      checks.push({
        id: 'ai_engine',
        name: 'Motor de Inteligencia Artificial y Visión',
        status: 'ok',
        message: `Proveedor real configurado (${aiSettings.provider} / ${aiSettings.model}).`,
        durationMs: Date.now() - aiStart,
      });
    }

    // Determine overall status
    const hasError = checks.some((c) => c.status === 'error');
    const hasWarn = checks.some((c) => c.status === 'warn');
    const overall = hasError ? 'critical' : hasWarn ? 'degraded' : 'healthy';

    await logger.audit('SYSTEM', `Diagnóstico del sistema ejecutado: resultado general ${overall.toUpperCase()}`, userId);

    return {
      checks,
      overall,
      timestamp: new Date().toISOString(),
      durationTotalMs: Date.now() - startTime,
    };
  }

  // -------------------------------------------------------------
  // 8. RESET SECTION SETTINGS
  // -------------------------------------------------------------
  static async resetSection(section: string, userId?: string): Promise<boolean> {
    const keyMap: Record<string, string> = {
      general: 'general_settings',
      projects: 'project_settings',
      ai: 'ai_settings',
      security: 'security_settings',
    };

    const targetKey = keyMap[section];
    if (targetKey) {
      await this.deleteRawSetting(targetKey);
      await logger.audit('SYSTEM', `Restablecidos los ajustes por defecto de la sección: ${section}`, userId);
      return true;
    }
    return false;
  }
}
