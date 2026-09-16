-- ============================================================
-- SMH Global Logistics LLC — Development Seed Data
-- Migration: 0002_seed
-- WARNING: This is DEMO/DEVELOPMENT data only.
-- Do NOT run this in production.
-- ============================================================

-- Demo shipments (clearly labeled as development data)
INSERT OR IGNORE INTO shipments (tracking_number, customer_name, customer_email, origin, destination, freight_type, pickup_date, estimated_delivery, current_status, notes) VALUES
  ('SMH-000001', '[DEMO] Demo Customer A', 'demo@example.com', 'Miami, FL', 'Atlanta, GA', 'General Freight', '2026-09-10', '2026-09-12', 'Delivered', '[DEMO DATA - Development only]'),
  ('SMH-000002', '[DEMO] Demo Customer B', 'demo2@example.com', 'Orlando, FL', 'Charlotte, NC', 'Refrigerated Food', '2026-09-15', '2026-09-17', 'In Transit', '[DEMO DATA - Development only]'),
  ('SMH-000003', '[DEMO] Demo Customer C', 'demo3@example.com', 'Tampa, FL', 'Nashville, TN', 'Fresh Produce', '2026-09-18', '2026-09-20', 'Booked', '[DEMO DATA - Development only]');

-- Demo shipment events
INSERT OR IGNORE INTO shipment_events (shipment_id, status, location, description, event_time) VALUES
  (1, 'Quote Requested', 'Miami, FL', '[DEMO] Quote request received.', '2026-09-08 10:00:00'),
  (1, 'Booked', 'Miami, FL', '[DEMO] Shipment booked and carrier assigned.', '2026-09-09 09:00:00'),
  (1, 'Picked Up', 'Miami, FL', '[DEMO] Freight picked up from origin.', '2026-09-10 08:00:00'),
  (1, 'In Transit', 'Gainesville, FL', '[DEMO] Shipment in transit.', '2026-09-10 14:00:00'),
  (1, 'Delivered', 'Atlanta, GA', '[DEMO] Freight delivered to destination.', '2026-09-12 11:00:00'),
  (2, 'Quote Requested', 'Orlando, FL', '[DEMO] Quote request received.', '2026-09-14 10:00:00'),
  (2, 'Booked', 'Orlando, FL', '[DEMO] Shipment booked.', '2026-09-14 15:00:00'),
  (2, 'Picked Up', 'Orlando, FL', '[DEMO] Freight picked up.', '2026-09-15 07:00:00'),
  (2, 'In Transit', 'Jacksonville, FL', '[DEMO] Shipment in transit.', '2026-09-15 13:00:00'),
  (3, 'Quote Requested', 'Tampa, FL', '[DEMO] Quote request received.', '2026-09-17 09:00:00'),
  (3, 'Booked', 'Tampa, FL', '[DEMO] Shipment confirmed and booked.', '2026-09-17 16:00:00');

-- Demo quote requests
INSERT OR IGNORE INTO quote_requests (public_request_id, full_name, company_name, email, phone, pickup_location, delivery_location, freight_type, commodity, weight, status) VALUES
  ('SMH-QT-2026-00001', '[DEMO] John Smith', 'Demo Corp', 'demo@example.com', '555-0100', 'Miami, FL', 'Atlanta, GA', 'general', 'Electronics', '2000 lbs', 'quoted'),
  ('SMH-QT-2026-00002', '[DEMO] Jane Doe', 'Fresh Foods Inc', 'demo2@example.com', '555-0101', 'Orlando, FL', 'Charlotte, NC', 'refrigerated', 'Dairy Products', '5000 lbs', 'new'),
  ('SMH-QT-2026-00003', '[DEMO] Bob Wilson', 'Farm Fresh LLC', 'demo3@example.com', '555-0102', 'Tampa, FL', 'Nashville, TN', 'produce', 'Citrus Fruits', '8000 lbs', 'new');

-- Demo contact messages
INSERT OR IGNORE INTO contact_messages (name, company, email, phone, subject, message, status) VALUES
  ('[DEMO] Alice Johnson', 'Demo Shipping Co', 'alice@example.com', '555-0200', 'Rate Inquiry', '[DEMO] I would like to inquire about shipping rates for regular produce shipments from Central Florida.', 'unread'),
  ('[DEMO] Carlos Rodriguez', 'Cold Chain Logistics', 'carlos@example.com', '555-0201', 'Refrigerated Capacity', '[DEMO] Do you have regular capacity for refrigerated loads from Florida to the Southeast?', 'read');
