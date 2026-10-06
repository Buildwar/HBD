import { api } from './api.js';
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
  SystemInfoResponseDto,
} from '@hbd/shared';

export type SystemInfo = SystemInfoResponseDto;

export interface UserItem {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string | null;
  language?: string;
  themePreferences?: Record<string, any>;
  roleId: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  isActive: boolean;
  projectsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  permissions?: Array<{
    permission: {
      id: string;
      code: string;
      name: string;
      description: string;
    };
  }>;
  _count?: {
    users: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const settingsService = {
  // About info
  async getAboutInfo(): Promise<{ success: boolean; data: SystemInfoResponseDto }> {
    return api.get<{ success: boolean; data: SystemInfoResponseDto }>('/about');
  },

  async getSystemInfo(): Promise<SystemInfoResponseDto> {
    const res = await api.get<{ success: boolean; data: SystemInfoResponseDto }>('/about');
    return res.data;
  },

  // Public settings
  async getPublicSettings(): Promise<ApiResponse<Record<string, string>>> {
    return api.get<ApiResponse<Record<string, string>>>('/settings/public');
  },

  // User management
  async getUsers(): Promise<ApiResponse<UserItem[]>> {
    return api.get<ApiResponse<UserItem[]>>('/users');
  },

  async createUser(data: {
    email: string;
    username: string;
    name: string;
    password: string;
    roleId: string;
    language?: string;
  }): Promise<ApiResponse<UserItem>> {
    return api.post<ApiResponse<UserItem>>('/users', data);
  },

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      roleId?: string;
      isActive?: boolean;
      language?: string;
      password?: string;
    }
  ): Promise<ApiResponse<UserItem>> {
    return api.patch<ApiResponse<UserItem>>(`/users/${id}`, data);
  },

  async toggleUserStatus(id: string): Promise<ApiResponse<UserItem>> {
    return api.post<ApiResponse<UserItem>>(`/users/${id}/toggle-status`, {});
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/users/${id}`);
  },

  async getRoles(): Promise<ApiResponse<RoleItem[]>> {
    return api.get<ApiResponse<RoleItem[]>>('/users/roles');
  },

  // General settings
  async getGeneralSettings(): Promise<ApiResponse<GeneralSettingsDto>> {
    return api.get<ApiResponse<GeneralSettingsDto>>('/settings/general');
  },

  async updateGeneralSettings(
    data: Partial<GeneralSettingsDto>
  ): Promise<ApiResponse<GeneralSettingsDto>> {
    return api.patch<ApiResponse<GeneralSettingsDto>>('/settings/general', data);
  },

  // Project preferences
  async getProjectSettings(): Promise<ApiResponse<ProjectSettingsDto>> {
    return api.get<ApiResponse<ProjectSettingsDto>>('/settings/projects');
  },

  async updateProjectSettings(
    data: Partial<ProjectSettingsDto>
  ): Promise<ApiResponse<ProjectSettingsDto>> {
    return api.patch<ApiResponse<ProjectSettingsDto>>('/settings/projects', data);
  },

  // AI & Vision configuration
  async getAISettings(): Promise<ApiResponse<AISettingsDto>> {
    return api.get<ApiResponse<AISettingsDto>>('/settings/ai');
  },

  async updateAISettings(
    data: UpdateAISettingsInput
  ): Promise<ApiResponse<AISettingsDto>> {
    return api.patch<ApiResponse<AISettingsDto>>('/settings/ai', data);
  },

  // Storage & Cleanup
  async getStorageSummary(): Promise<ApiResponse<StorageSummaryDto>> {
    return api.get<ApiResponse<StorageSummaryDto>>('/settings/storage');
  },

  async cleanupStorage(): Promise<ApiResponse<{ cleanedFiles: number; freedBytes: number }>> {
    return api.post<ApiResponse<{ cleanedFiles: number; freedBytes: number }>>('/settings/storage/cleanup');
  },

  // Security policies
  async getSecuritySettings(): Promise<ApiResponse<SecuritySettingsDto>> {
    return api.get<ApiResponse<SecuritySettingsDto>>('/settings/security');
  },

  async updateSecuritySettings(
    data: Partial<SecuritySettingsDto>
  ): Promise<ApiResponse<SecuritySettingsDto>> {
    return api.patch<ApiResponse<SecuritySettingsDto>>('/settings/security', data);
  },

  // Security Audit Logs
  async getAuditLogs(limit = 50): Promise<ApiResponse<AuditLogEntryDto[]>> {
    return api.get<ApiResponse<AuditLogEntryDto[]>>(`/settings/audit-logs?limit=${limit}`);
  },

  // Technical Health & Diagnostics
  async getSystemHealth(): Promise<ApiResponse<SystemHealthDto>> {
    return api.get<ApiResponse<SystemHealthDto>>('/settings/health');
  },

  async runSystemDiagnostics(): Promise<ApiResponse<SystemDiagnosticsResultDto>> {
    return api.post<ApiResponse<SystemDiagnosticsResultDto>>('/settings/diagnostics');
  },

  // Reset section
  async resetSection(section: string): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`/settings/reset/${section}`);
  },
};
