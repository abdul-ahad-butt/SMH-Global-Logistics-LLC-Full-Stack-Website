// Shared domain types

export interface Admin {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  admin_id: number;
  expires_at: string;
  created_at: string;
}

export type QuoteStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'archived';

export interface QuoteRequest {
  id: number;
  public_request_id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  pickup_location: string;
  delivery_location: string;
  pickup_date: string | null;
  delivery_date: string | null;
  freight_type: string;
  commodity: string | null;
  weight: string | null;
  pieces: number | null;
  equipment_type: string | null;
  shipment_notes: string | null;
  status: QuoteStatus;
  internal_notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'unread' | 'read' | 'archived';

export interface ContactMessage {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus =
  | 'Quote Requested'
  | 'Booked'
  | 'Carrier Assigned'
  | 'Pickup Scheduled'
  | 'Picked Up'
  | 'In Transit'
  | 'At Destination'
  | 'Delivered'
  | 'Cancelled';

export interface Shipment {
  id: number;
  tracking_number: string;
  customer_name: string | null;
  customer_email: string | null;
  origin: string;
  destination: string;
  freight_type: string | null;
  pickup_date: string | null;
  estimated_delivery: string | null;
  current_status: ShipmentStatus;
  notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEvent {
  id: number;
  shipment_id: number;
  status: string;
  location: string | null;
  description: string | null;
  event_time: string;
  created_at: string;
}

export interface SiteContent {
  id: number;
  content_key: string;
  content_value: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
