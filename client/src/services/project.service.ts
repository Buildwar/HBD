import { api } from './api.js';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  propertyType?: string | null;
  userId: string;
  isArchived: boolean;
  thumbnail?: string | null;
  floorsCount: number;
  roomsCount: number;
  totalAreaM2: number;
  createdAt: string;
  updatedAt: string;
  floors?: any[];
}

export const projectService = {
  async getProjects(all = false): Promise<{ success: boolean; data: Project[] }> {
    return api.get<{ success: boolean; data: Project[] }>(`/projects${all ? '?all=true' : ''}`);
  },

  async getProjectById(id: string): Promise<{ success: boolean; data: any }> {
    return api.get<{ success: boolean; data: any }>(`/projects/${id}`);
  },

  async createProject(data: {
    name: string;
    description?: string;
    address?: string;
    propertyType?: string;
  }): Promise<{ success: boolean; data: Project }> {
    return api.post<{ success: boolean; data: Project }>('/projects', data);
  },

  async updateProject(id: string, data: Partial<Project>): Promise<{ success: boolean; data: Project }> {
    return api.patch<{ success: boolean; data: Project }>(`/projects/${id}`, data);
  },

  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/projects/${id}`);
  },

  async duplicateProject(id: string): Promise<{ success: boolean; data: Project }> {
    return api.post<{ success: boolean; data: Project }>(`/projects/${id}/duplicate`);
  },

  async createFloor(projectId: string, data: { name: string; level?: number; heightM?: number }): Promise<{ success: boolean; data: any }> {
    return api.post<{ success: boolean; data: any }>(`/projects/${projectId}/floors`, data);
  },
};
