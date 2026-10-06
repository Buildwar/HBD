import { APP_CONFIG } from '../config/app.config.js';

interface RequestOptions extends RequestInit {
  data?: any;
}

class ApiClient {
  private baseUrl: string = APP_CONFIG.apiUrl;

  private getToken(): string | null {
    return localStorage.getItem('hbd_token');
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (options.data) {
      config.body = JSON.stringify(options.data);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Redirigir al login si no estamos ya en él
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('hbd_token');
          localStorage.removeItem('hbd_user');
          window.location.href = '/login';
        }
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error en la petición al servidor.');
      }

      return result;
    } catch (error: any) {
      throw error;
    }
  }

  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data, headers });
  }

  patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data, headers });
  }

  put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data, headers });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Error al subir archivo.');
    }
    return result;
  }
}

export const api = new ApiClient();
export const apiClient = api;
