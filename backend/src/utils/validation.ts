import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Quote Request ─────────────────────────────────────────────────────────────
export const quoteSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100),
  company_name: z.string().max(100).optional(),
  email: z.string().email('Invalid email address').max(200),
  phone: z.string().max(30).optional(),
  pickup_location: z.string().min(2, 'Pickup location is required').max(200),
  delivery_location: z.string().min(2, 'Delivery location is required').max(200),
  pickup_date: z.string().optional(),
  delivery_date: z.string().optional(),
  freight_type: z.enum(['general', 'refrigerated', 'produce'], {
    errorMap: () => ({ message: 'Freight type must be general, refrigerated, or produce' }),
  }),
  commodity: z.string().max(200).optional(),
  weight: z.string().max(50).optional(),
  pieces: z.number().int().positive().optional(),
  equipment_type: z.string().max(100).optional(),
  shipment_notes: z.string().max(1000).optional(),
});

export const updateQuoteSchema = z.object({
  status: z.enum(['new', 'reviewing', 'quoted', 'accepted', 'declined', 'archived']).optional(),
  internal_notes: z.string().max(2000).optional(),
});

// ── Contact Message ───────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  company: z.string().max(100).optional(),
  email: z.string().email('Invalid email address').max(200),
  phone: z.string().max(30).optional(),
  subject: z.string().min(2, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export const updateMessageSchema = z.object({
  status: z.enum(['unread', 'read', 'archived']),
});

// ── Shipment ──────────────────────────────────────────────────────────────────
export const createShipmentSchema = z.object({
  customer_name: z.string().max(100).optional(),
  customer_email: z.string().email().max(200).optional().or(z.literal('')),
  origin: z.string().min(2, 'Origin is required').max(200),
  destination: z.string().min(2, 'Destination is required').max(200),
  freight_type: z.string().max(50).optional(),
  pickup_date: z.string().optional(),
  estimated_delivery: z.string().optional(),
  current_status: z
    .enum([
      'Quote Requested',
      'Booked',
      'Carrier Assigned',
      'Pickup Scheduled',
      'Picked Up',
      'In Transit',
      'At Destination',
      'Delivered',
      'Cancelled',
    ])
    .optional(),
  notes: z.string().max(1000).optional(),
});

export const updateShipmentSchema = createShipmentSchema.partial();

export const addEventSchema = z.object({
  status: z.string().min(1, 'Status is required').max(50),
  location: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  event_time: z.string().optional(),
});

// ── Content ───────────────────────────────────────────────────────────────────
export const updateContentSchema = z.object({
  content_value: z.string().max(5000),
});

// ── Pagination ────────────────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});
