export interface AppSettingDto {
  id: string;
  key: string;
  value: string;
  description?: string;
  isPublic: boolean;
  updatedAt: string;
}

export interface SystemInfoResponseDto {
  appName: string;
  tagline: string;
  author: string;
  version: string;
  copyright: string;
  environment: string;
  uptimeSeconds: number;
  databaseConnected: boolean;
  stats: {
    usersCount: number;
    projectsCount: number;
    floorPlansCount: number;
    rendersCount?: number;
    productsCount?: number;
    procurementOrdersCount?: number;
  };
}

export interface GeneralSettingsDto {
  displayUnit: 'm' | 'cm' | 'mm';
  areaUnit: 'm2' | 'sqft';
  defaultCurrency: 'EUR' | 'USD' | 'GBP';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '24h' | '12h';
  numberSeparator: 'comma_dot' | 'dot_comma';
  confirmOnDelete: boolean;
  confirmOnReset: boolean;
  showTooltips: boolean;
}

export interface ProjectSettingsDto {
  defaultWallHeight: number; // in meters (e.g. 2.6)
  defaultWallThickness: number; // in meters (e.g. 0.15)
  defaultInitialView: '2d' | '3d' | 'details';
  autoSaveIntervalSeconds: number; // 0 for disabled, or 30, 60, 120, 300
  defaultPropertyType: 'APARTMENT' | 'HOUSE' | 'OFFICE' | 'COMMERCIAL';
  defaultSnapGrid: boolean;
  defaultSnapGridSize: number; // in meters (e.g. 0.1)
}

export interface AISettingsDto {
  provider: 'mock' | 'gemini' | 'openai';
  visionProvider: 'mock' | 'gemini' | 'openai';
  model: string;
  temperature: number;
  maxTokens: number;
  isMockMode: boolean;
  hasCustomApiKey: boolean;
  hasCustomVisionApiKey: boolean;
  apiKeyMasked?: string;
  visionApiKeyMasked?: string;
}

export interface UpdateAISettingsInput {
  provider?: 'mock' | 'gemini' | 'openai';
  visionProvider?: 'mock' | 'gemini' | 'openai';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  visionApiKey?: string;
}

export interface StorageSummaryDto {
  databaseSizeBytes: number;
  uploadsSizeBytes: number;
  projectsCount: number;
  floorPlansCount: number;
  rendersCount: number;
  digitalTwinsCount: number;
  documentsCount: number;
  uploadsCount: number;
  scratchFilesCount: number;
  formattedDatabaseSize: string;
  formattedUploadsSize: string;
}

export interface SecuritySettingsDto {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  sessionTimeoutHours: number;
  maxActiveSessions: number;
  auditLogRetentionDays: number;
}

export interface SystemHealthDto {
  frontendStatus: 'online' | 'degraded' | 'offline';
  backendStatus: 'online' | 'degraded' | 'offline';
  databaseStatus: 'online' | 'degraded' | 'offline';
  storageStatus: 'online' | 'degraded' | 'offline';
  aiStatus: 'configured' | 'mock_mode' | 'unconfigured';
  nodeVersion: string;
  platform: string;
  uptimeSeconds: number;
  memoryUsageBytes: number;
  memoryUsageFormatted: string;
  timestamp: string;
}

export interface DiagnosticCheckItem {
  id: string;
  name: string;
  status: 'ok' | 'warn' | 'error';
  message: string;
  durationMs: number;
}

export interface SystemDiagnosticsResultDto {
  checks: DiagnosticCheckItem[];
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  durationTotalMs: number;
}

export interface AuditLogEntryDto {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface ActiveSessionDto {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: string;
  ipAddress: string;
  userAgent: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface UpdatePasswordInput {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
