// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const isFormDataBody =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    const config: RequestInit = {
      headers: isFormDataBody
        ? {
            Accept: "application/json",
            ...(options.headers || {}),
          }
        : {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(options.headers || {}),
          },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<any> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Alerts API
  async getAlerts(params?: { status?: string; level?: string; page?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.level) queryParams.append('level', params.level);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/v1/alerts${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getAlert(alertId: number): Promise<any> {
    return this.request(`/v1/alerts/${alertId}`);
  }

  async acknowledgeAlert(alertId: number): Promise<any> {
    return this.request(`/v1/alerts/${alertId}/ack`, {
      method: 'POST',
    });
  }

  async getAlertsStats(): Promise<any> {
    return this.request('/v1/alerts/stats/summary');
  }

  // Sensors API
  async getSensors(params?: { status?: string; type?: string; sector_id?: number; page?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.sector_id) queryParams.append('sector_id', params.sector_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/v1/sensors${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getSensor(sensorId: number): Promise<any> {
    return this.request(`/v1/sensors/${sensorId}`);
  }

  async createSensor(data: { name: string; type: string; sector_id?: number; lat?: number; lng?: number; status?: string; battery_level?: number }): Promise<any> {
    return this.request('/v1/sensors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSensor(sensorId: number, data: { name?: string; type?: string; sector_id?: number; lat?: number; lng?: number; status?: string; battery_level?: number }): Promise<any> {
    return this.request(`/v1/sensors/${sensorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSensor(sensorId: number): Promise<any> {
    return this.request(`/v1/sensors/${sensorId}`, {
      method: 'DELETE',
    });
  }

  async getSensorsStats(): Promise<any> {
    return this.request('/v1/sensors/stats/summary');
  }

  async getSensorTelemetry(sensorId: number, params?: { type?: string; hours?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.hours) queryParams.append('hours', params.hours.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/v1/sensors/${sensorId}/telemetry${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // Sectors API
  async getSectors(): Promise<any> {
    return this.request('/v1/sectors');
  }

  async createSector(data: { name: string; boundary: any; status?: string }): Promise<any> {
    return this.request('/v1/sectors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSectorsGeo(): Promise<any> {
    return this.request('/v1/sectors/geo');
  }

  // Project Areas API
  async getCurrentProjectArea(): Promise<any> {
    return this.request('/v1/project-areas/current');
  }

  async updateCurrentProjectAreaBoundary(boundary: any): Promise<any> {
    return this.request('/v1/project-areas/current/boundary', {
      method: 'PUT',
      body: JSON.stringify({ boundary }),
    });
  }

  // Map overlays
  async getSensorsGeo(): Promise<any> {
    return this.request('/v1/sensors/geo');
  }

  async getMapAlerts(): Promise<any> {
    return this.request('/v1/map/alerts');
  }

  async getHistoricalFires(): Promise<any> {
    return this.request('/v1/map/historical-fires');
  }

  // Reports API
  async getReportsAnalytics(params?: { time_range?: string; report_type?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.time_range) queryParams.append('time_range', params.time_range);
    if (params?.report_type) queryParams.append('report_type', params.report_type);
    
    const queryString = queryParams.toString();
    const endpoint = `/v1/reports/analytics${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async downloadReport(format: 'csv' | 'pdf' | 'excel', params?: { time_range?: string; report_type?: string }): Promise<void> {
    const queryParams = new URLSearchParams();
    if (params?.time_range) queryParams.append('time_range', params.time_range);
    if (params?.report_type) queryParams.append('report_type', params.report_type);
    
    const queryString = queryParams.toString();
    const endpoint = `/v1/reports/export/${format}${queryString ? `?${queryString}` : ''}`;
    const url = `${this.baseURL}${endpoint}`;

    const token = this.getToken();
    const headers: HeadersInit = {
      'Accept': '*/*',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `report.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  // Roles API
  async getRoles(): Promise<any> {
    return this.request('/v1/roles');
  }

  async createRole(data: { role: string; name: string }): Promise<any> {
    return this.request('/v1/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(roleId: number, data: { role?: string; name?: string }): Promise<any> {
    return this.request(`/v1/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(roleId: number): Promise<any> {
    return this.request(`/v1/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // Settings API
  async getSettings(): Promise<any> {
    return this.request('/v1/settings');
  }

  async updateSettings(data: Record<string, any>): Promise<any> {
    return this.request('/v1/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings: data }),
    });
  }

  // Users API
  async getUsers(params?: { search?: string; role_id?: number; page?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role_id) queryParams.append('role_id', params.role_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/v1/users${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getUser(userId: number): Promise<any> {
    return this.request(`/v1/users/${userId}`);
  }

  async createUser(data: FormData | { name: string; email: string; password: string; password_confirmation: string; role_id?: number }): Promise<any> {
    if (data instanceof FormData) {
      return this.request('/v1/users', {
        method: 'POST',
        body: data,
      });
    }

    return this.request('/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(userId: number, data: FormData | { name?: string; email?: string; password?: string; password_confirmation?: string; role_id?: number }): Promise<any> {
    if (data instanceof FormData) {
      // PUT multipart can be flaky in some setups, so we spoof method via POST.
      data.append('_method', 'PUT');
      return this.request(`/v1/users/${userId}`, {
        method: 'POST',
        body: data,
      });
    }

    return this.request(`/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: number): Promise<any> {
    return this.request(`/v1/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard API
  async getDashboardStats(): Promise<any> {
    return this.request('/v1/dashboard/stats');
  }

  async getDashboardLiveSensorData(): Promise<any> {
    return this.request('/v1/dashboard/live-sensor-data');
  }

  async getDashboardRecentAlerts(): Promise<any> {
    return this.request('/v1/dashboard/recent-alerts');
  }

  async getDashboardRiskDistribution(): Promise<any> {
    return this.request('/v1/dashboard/risk-distribution');
  }

  // Helper method to get token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Helper method to set token
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Helper method to remove token
  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiService = new ApiService();