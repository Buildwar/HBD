import {
  ExecutionProjectDto,
  SiteDailyLogDto,
  ConstructionIncidentDto,
  ConstructionChangeOrderDto,
  QualityInspectionDto,
  MaterialDeliveryDto,
  SitePhotoDto,
  ProjectClosureDto,
  ClientViewDto,
  ContractorViewDto,
} from '@hbd/shared';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const executionService = {
  async getExecutionProject(projectId: string): Promise<{ success: boolean; data: ExecutionProjectDto }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/execution`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar la ejecución del proyecto');
    return res.json();
  },

  async updateExecutionProject(
    executionId: string,
    data: Partial<ExecutionProjectDto>
  ): Promise<{ success: boolean; data: ExecutionProjectDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar la ejecución');
    return res.json();
  },

  async updateProgress(
    executionId: string,
    data: {
      taskId?: string;
      status?: string;
      progress?: number;
      actualDurationDays?: number;
      actualStart?: string;
      actualEnd?: string;
    }
  ): Promise<{ success: boolean; data: ExecutionProjectDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar el progreso');
    return res.json();
  },

  async getDailyLogs(executionId: string): Promise<{ success: boolean; data: SiteDailyLogDto[] }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/daily-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar diarios de obra');
    return res.json();
  },

  async createDailyLog(
    executionId: string,
    data: Partial<SiteDailyLogDto>
  ): Promise<{ success: boolean; data: SiteDailyLogDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/daily-logs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear diario de obra');
    return res.json();
  },

  async createIncident(
    executionId: string,
    data: Partial<ConstructionIncidentDto>
  ): Promise<{ success: boolean; data: ConstructionIncidentDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/incidents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar incidencia');
    return res.json();
  },

  async updateIncident(
    incidentId: string,
    data: Partial<ConstructionIncidentDto>
  ): Promise<{ success: boolean; data: ConstructionIncidentDto }> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar incidencia');
    return res.json();
  },

  async createChangeOrder(
    executionId: string,
    data: Partial<ConstructionChangeOrderDto> & { costImpact?: number; timeImpactDays?: number }
  ): Promise<{ success: boolean; data: ConstructionChangeOrderDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/change-orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar orden de cambio');
    return res.json();
  },

  async updateChangeOrder(
    changeOrderId: string,
    data: { decision?: string; comments?: string }
  ): Promise<{ success: boolean; data: ConstructionChangeOrderDto }> {
    const res = await fetch(`${API_BASE}/change-orders/${changeOrderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al procesar orden de cambio');
    return res.json();
  },

  async createInspection(
    executionId: string,
    data: Partial<QualityInspectionDto>
  ): Promise<{ success: boolean; data: QualityInspectionDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/inspections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar inspección');
    return res.json();
  },

  async createDelivery(
    executionId: string,
    data: Partial<MaterialDeliveryDto>
  ): Promise<{ success: boolean; data: MaterialDeliveryDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/deliveries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar entrega de material');
    return res.json();
  },

  async createPhoto(
    executionId: string,
    data: Partial<SitePhotoDto>
  ): Promise<{ success: boolean; data: SitePhotoDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/photos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al subir fotografía');
    return res.json();
  },

  async closeExecutionProject(
    executionId: string,
    data: { forceClose?: boolean; notes?: string }
  ): Promise<{ success: boolean; data: ProjectClosureDto; message?: string }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Error al cerrar la obra');
    }
    return result;
  },

  async getClientView(executionId: string): Promise<{ success: boolean; data: ClientViewDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/client-view`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener vista de cliente');
    return res.json();
  },

  async getContractorView(executionId: string): Promise<{ success: boolean; data: ContractorViewDto }> {
    const res = await fetch(`${API_BASE}/execution/${executionId}/contractor-view`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener vista de contratista');
    return res.json();
  },
};
