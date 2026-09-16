// Frontend shared types — mirrors backend types
export type QuoteStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'archived';
export type MessageStatus = 'unread' | 'read' | 'archived';
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
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
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
  created_at: string;
  updated_at: string;
  events?: ShipmentEvent[];
}

export interface PublicShipment {
  tracking_number: string;
  origin: string;
  destination: string;
  freight_type: string | null;
  pickup_date: string | null;
  estimated_delivery: string | null;
  current_status: ShipmentStatus;
  created_at: string;
  updated_at: string;
  events: ShipmentEvent[];
}

export interface SiteContent {
  id: number;
  content_key: string;
  content_value: string;
  updated_at: string;
}

export interface SiteContentMap {
  [key: string]: string;
}

export interface AdminStats {
  totalQuotes: number;
  newQuotes: number;
  totalMessages: number;
  unreadMessages: number;
  activeShipments: number;
  deliveredShipments: number;
  recentActivity: { day: string; count: number }[];
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

// Quote form steps
export interface QuoteFormData {
  // Step 1: Contact Info
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  // Step 2: Shipment Details
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  delivery_date: string;
  freight_type: 'general' | 'refrigerated' | 'produce' | '';
  commodity: string;
  weight: string;
  pieces: string;
  equipment_type: string;
  shipment_notes: string;
}

export interface Admin {
  id: number;
  email: string;
}
