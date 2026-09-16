-- ============================================================
-- SMH Global Logistics LLC — D1 Database Schema
-- Migration: 0001_initial
-- ============================================================

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT  NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Sessions (HttpOnly cookie auth)
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,          -- UUID v4
  admin_id    INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Quote Requests
CREATE TABLE IF NOT EXISTS quote_requests (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  public_request_id TEXT    NOT NULL UNIQUE,  -- SMH-QT-YYYY-NNNNN
  full_name         TEXT    NOT NULL,
  company_name      TEXT,
  email             TEXT    NOT NULL,
  phone             TEXT,
  pickup_location   TEXT    NOT NULL,
  delivery_location TEXT    NOT NULL,
  pickup_date       TEXT,
  delivery_date     TEXT,
  freight_type      TEXT    NOT NULL,         -- general|refrigerated|produce
  commodity         TEXT,
  weight            TEXT,
  pieces            INTEGER,
  equipment_type    TEXT,
  shipment_notes    TEXT,
  status            TEXT    NOT NULL DEFAULT 'new',  -- new|reviewing|quoted|accepted|declined|archived
  internal_notes    TEXT,
  deleted_at        TEXT,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(email);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  company     TEXT,
  email       TEXT    NOT NULL,
  phone       TEXT,
  subject     TEXT    NOT NULL,
  message     TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'unread',  -- unread|read|archived
  deleted_at  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_number     TEXT    NOT NULL UNIQUE,   -- SMH-000001
  customer_name       TEXT,
  customer_email      TEXT,
  origin              TEXT    NOT NULL,
  destination         TEXT    NOT NULL,
  freight_type        TEXT,
  pickup_date         TEXT,
  estimated_delivery  TEXT,
  current_status      TEXT    NOT NULL DEFAULT 'Quote Requested',
  notes               TEXT,
  deleted_at          TEXT,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(current_status);

-- Shipment Events (timeline)
CREATE TABLE IF NOT EXISTS shipment_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status      TEXT    NOT NULL,
  location    TEXT,
  description TEXT,
  event_time  TEXT    NOT NULL DEFAULT (datetime('now')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON shipment_events(shipment_id);

-- Site Content (CMS key/value)
CREATE TABLE IF NOT EXISTS site_content (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  content_key   TEXT    NOT NULL UNIQUE,
  content_value TEXT    NOT NULL DEFAULT '',
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Rate Limit Log
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ip            TEXT    NOT NULL,
  endpoint      TEXT    NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_endpoint ON rate_limit_log(ip, endpoint);

-- ── Default site content ─────────────────────────────────────────────────────
INSERT OR IGNORE INTO site_content (content_key, content_value) VALUES
  ('hero_headline', 'Reliable Freight. Smarter Logistics.'),
  ('hero_subtext', 'SMH Global Logistics LLC coordinates freight and logistics services with a focus on dependable communication and efficient transportation across the United States.'),
  ('hero_cta_primary', 'Request a Quote'),
  ('hero_cta_secondary', 'Contact Us'),
  ('about_intro', 'SMH Global Logistics LLC is a licensed freight brokerage based in Mount Dora, Florida. We coordinate freight and logistics services across the United States, connecting shippers with qualified transportation providers.'),
  ('about_mission', 'Our mission is to deliver reliable, transparent, and efficient freight coordination services. We are committed to clear communication and dependable service for every shipment.'),
  ('contact_phone', '(407) 271-6983'),
  ('contact_address', '5879 Ansley Way, Mount Dora, FL 32757'),
  ('contact_mailing', '5424 Lake Street, Tangerine, FL 32777'),
  ('business_hours', 'Monday – Friday: 8:00 AM – 5:00 PM EST'),
  ('footer_tagline', 'Reliable freight coordination across the United States.'),
  ('social_linkedin', ''),
  ('social_facebook', ''),
  ('social_twitter', ''),
  ('faq_1_q', 'How do I request a freight quote?'),
  ('faq_1_a', 'You can request a quote by completing our online quote request form. Provide your shipment details including pickup/delivery locations, freight type, and weight. We will review your request and follow up with a quote.'),
  ('faq_2_q', 'What information is needed for a quote?'),
  ('faq_2_a', 'We typically need: pickup and delivery locations, desired pickup and delivery dates, type of freight, commodity description, weight, and any special handling requirements.'),
  ('faq_3_q', 'What types of freight do you handle?'),
  ('faq_3_a', 'We coordinate freight for general cargo, refrigerated food products, and fresh produce. As a licensed freight broker, we connect shippers with qualified carriers suited to their specific freight needs.'),
  ('faq_4_q', 'How can I track a shipment?'),
  ('faq_4_a', 'Once your shipment is booked and in transit, you will receive a tracking number (format: SMH-XXXXXX). Enter this number on our Track Shipment page to view the current status and history of your shipment.'),
  ('faq_5_q', 'How do I contact SMH Global Logistics LLC?'),
  ('faq_5_a', 'You can reach us by phone at (407) 271-6983, or by completing the contact form on our website. Our mailing address is 5424 Lake Street, Tangerine, FL 32777.'),
  ('faq_6_q', 'What is your USDOT number?'),
  ('faq_6_a', 'Our USDOT number is 3145157. You can verify our operating status on the FMCSA website at safer.fmcsa.dot.gov.'),
  ('faq_7_q', 'What is your MC number?'),
  ('faq_7_a', 'Our MC number is MC-101721. We are authorized as a Broker of Property (Except Household Goods) for interstate operations.');
