import { api } from './api.js';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string | null;
  language: string;
  themePreferences: {
    themeMode: 'dark' | 'light' | 'system';
    accentColor: string;
    borderRadius?: string;
    density?: 'compact' | 'normal' | 'comfortable';
  };
  roleId: string;
  role?: {
    id: string;
    name: string;
    description: string;
    permissions?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expiresIn: string;
  };
}

export const authService = {
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    const trimmed = emailOrUsername.trim();
    const res = await api.post<AuthResponse>('/auth/login', {
      identifier: trimmed,
      emailOrUsername: trimmed,
      username: trimmed,
      password,
    });
    if (res.data?.token) {
      localStorage.setItem('hbd_token', res.data.token);
      localStorage.setItem('hbd_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async register(email: string, username: string, name: string, password: string, language?: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', { email, username, name, password, language });
    if (res.data?.token) {
      localStorage.setItem('hbd_token', res.data.token);
      localStorage.setItem('hbd_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    return api.get<{ success: boolean; data: User }>('/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; data: User }> {
    const res = await api.patch<{ success: boolean; data: User }>('/auth/profile', data);
    if (res.data) {
      localStorage.setItem('hbd_user', JSON.stringify(res.data));
    }
    return res;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  logout(): void {
    localStorage.removeItem('hbd_token');
    localStorage.removeItem('hbd_user');
  },

  getCurrentUser(): User | null {
    const saved = localStorage.getItem('hbd_user');
    return saved ? JSON.parse(saved) : null;
  },
};
