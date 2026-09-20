import axios from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  QuoteRequest,
  QuoteFormData,
  ContactMessage,
  Shipment,
  PublicShipment,
  ShipmentEvent,
  SiteContent,
  SiteContentMap,
  AdminStats,
  Admin,
} from '../types/index.js';

const baseURL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') + '/api'
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractData<T>(res: { data: ApiResponse<T> }): T {
  if (!res.data.success || res.data.data === undefined) {
    throw new Error(res.data.error ?? 'Unknown error');
  }
  return res.data.data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string): Promise<{ email: string }> => {
    const res = await api.post<ApiResponse<{ email: string }>>('/auth/login', { email, password });
    return extractData(res);
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  me: async (): Promise<Admin> => {
    const res = await api.get<ApiResponse<Admin>>('/auth/me');
    return extractData(res);
  },
};

// ── Public Quote ──────────────────────────────────────────────────────────────
export const quotesApi = {
  submit: async (data: QuoteFormData): Promise<{ id: number; public_request_id: string; created_at: string }> => {
    const payload = {
      ...data,
      pieces: data.pieces ? parseInt(data.pieces, 10) : undefined,
    };
    const res = await api.post<ApiResponse<{ id: number; public_request_id: string; created_at: string }>>('/quotes', payload);
    return extractData(res);
  },

  // Admin
  adminList: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    const res = await api.get<ApiResponse<PaginatedResponse<QuoteRequest>>>('/admin/quotes', { params });
    return extractData(res);
  },
  adminGet: async (id: number | string): Promise<QuoteRequest> => {
    const res = await api.get<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}`);
    return extractData(res);
  },
  adminUpdate: async (id: number | string, data: { status?: string; internal_notes?: string }): Promise<QuoteRequest> => {
    const res = await api.patch<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}`, data);
    return extractData(res);
  },
  adminDelete: async (id: number | string): Promise<void> => {
    await api.delete(`/admin/quotes/${id}`);
  },
};

// ── Public Contact ────────────────────────────────────────────────────────────
export const contactApi = {
  submit: async (data: {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<{ id: number }> => {
    const res = await api.post<ApiResponse<{ id: number }>>('/contact', data);
    return extractData(res);
  },

  // Admin
  adminList: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    const res = await api.get<ApiResponse<PaginatedResponse<ContactMessage>>>('/admin/messages', { params });
    return extractData(res);
  },
  adminUpdate: async (id: number | string, status: string): Promise<ContactMessage> => {
    const res = await api.patch<ApiResponse<ContactMessage>>(`/admin/messages/${id}`, { status });
    return extractData(res);
  },
  adminDelete: async (id: number | string): Promise<void> => {
    await api.delete(`/admin/messages/${id}`);
  },
};

// ── Shipments ─────────────────────────────────────────────────────────────────
export const shipmentsApi = {
  track: async (trackingNumber: string): Promise<PublicShipment> => {
    const res = await api.get<ApiResponse<PublicShipment>>(`/shipments/${trackingNumber.toUpperCase()}`);
    return extractData(res);
  },

  // Admin
  adminList: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    const res = await api.get<ApiResponse<PaginatedResponse<Shipment>>>('/admin/shipments', { params });
    return extractData(res);
  },
  adminGet: async (id: number | string): Promise<Shipment & { events: ShipmentEvent[] }> => {
    const res = await api.get<ApiResponse<Shipment & { events: ShipmentEvent[] }>>(`/admin/shipments/${id}`);
    return extractData(res);
  },
  adminCreate: async (data: Partial<Shipment>): Promise<{ id: number; tracking_number: string }> => {
    const res = await api.post<ApiResponse<{ id: number; tracking_number: string }>>('/admin/shipments', data);
    return extractData(res);
  },
  adminUpdate: async (id: number | string, data: Partial<Shipment>): Promise<Shipment> => {
    const res = await api.patch<ApiResponse<Shipment>>(`/admin/shipments/${id}`, data);
    return extractData(res);
  },
  adminDelete: async (id: number | string): Promise<void> => {
    await api.delete(`/admin/shipments/${id}`);
  },
  adminAddEvent: async (
    id: number | string,
    event: { status: string; location?: string; description?: string; event_time?: string }
  ): Promise<{ events: ShipmentEvent[] }> => {
    const res = await api.post<ApiResponse<{ events: ShipmentEvent[] }>>(`/admin/shipments/${id}/events`, event);
    return extractData(res);
  },
};

// ── Content ───────────────────────────────────────────────────────────────────
export const contentApi = {
  getAll: async (): Promise<SiteContentMap> => {
    const res = await api.get<ApiResponse<SiteContentMap>>('/content');
    return extractData(res);
  },
  adminGetAll: async (): Promise<SiteContent[]> => {
    const res = await api.get<ApiResponse<SiteContent[]>>('/admin/content');
    return extractData(res);
  },
  adminUpdate: async (key: string, value: string): Promise<SiteContent> => {
    const res = await api.patch<ApiResponse<SiteContent>>(`/admin/content/${key}`, { content_value: value });
    return extractData(res);
  },
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsApi = {
  get: async (): Promise<AdminStats> => {
    const res = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return extractData(res);
  },
};

export default api;
