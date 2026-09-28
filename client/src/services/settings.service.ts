import { api } from './api.js';

export interface SystemInfo {
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
  };
}

export const settingsService = {
  async getAboutInfo(): Promise<{ success: boolean; data: SystemInfo }> {
    return api.get<{ success: boolean; data: SystemInfo }>('/about');
  },

  async getPublicSettings(): Promise<{ success: boolean; data: Record<string, string> }> {
    return api.get<{ success: boolean; data: Record<string, string> }>('/settings/public');
  },

  async getUsers(): Promise<{ success: boolean; data: any[] }> {
    return api.get<{ success: boolean; data: any[] }>('/users');
  },

  async getRoles(): Promise<{ success: boolean; data: any[] }> {
    return api.get<{ success: boolean; data: any[] }>('/users/roles');
  },

  async createUser(data: any): Promise<{ success: boolean; data: any }> {
    return api.post<{ success: boolean; data: any }>('/users', data);
  },

  async updateUser(id: string, data: any): Promise<{ success: boolean; data: any }> {
    return api.patch<{ success: boolean; data: any }>(`/users/${id}`, data);
  },
};
