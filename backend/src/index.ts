import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types/env.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';
import { loginSchema, contactSchema, quoteSchema, updateQuoteSchema, updateMessageSchema, createShipmentSchema, updateShipmentSchema, addEventSchema, updateContentSchema, paginationSchema } from './utils/validation.js';
import { verifyPassword, hashPassword } from './utils/crypto.js';
import { generateSessionId, generateQuoteId, generateTrackingNumber } from './utils/id.js';
import { setSessionCookie, clearSessionCookie } from './middleware/auth.js';
import {
  ok, created, badRequest, notFound, paginated, serverError, unauthorized, tooManyRequests
} from './utils/response.js';
import type { QuoteRequest, ContactMessage, Shipment, ShipmentEvent, SiteContent } from './types/index.js';

const app = new Hono<{ Bindings: Env }>();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use('*', async (c, next) => {
  const allowedOrigins = (c.env.API_ALLOWED_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] ?? '')),
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })(c, next);
});

app.onError((err, _c) => {
  console.error('Unhandled error:', err);
  return serverError('An unexpected error occurred');
});

app.notFound(() =>
  Response.json({ success: false, error: 'Not found' }, { status: 404 })
);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (c) =>
  ok({ status: 'ok', timestamp: new Date().toISOString() })
);

// ════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════
app.post('/api/auth/login', async (c) => {
  let body: unknown;
  try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = loginSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors[0]?.message ?? 'Validation failed');

  const { email, password } = r.data;
  const admin = await c.env.DB
    .prepare('SELECT id, email, password_hash FROM admins WHERE email = ? COLLATE NOCASE')
    .bind(email.toLowerCase())
    .first<{ id: number; email: string; password_hash: string }>();

  const dummyHash = 'aaaa:bbbb';
  const valid = admin ? await verifyPassword(password, admin.password_hash) : (await verifyPassword(password, dummyHash), false);
  if (!admin || !valid) return unauthorized('Invalid email or password');

  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare('INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, admin.id, expiresAt).run();

  const isProduction = !c.req.url.includes('localhost');
  return new Response(JSON.stringify({ success: true, data: { email: admin.email } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': setSessionCookie(sessionId, isProduction) },
  });
});

app.post('/api/auth/logout', authMiddleware, async (c) => {
  const sessionId = c.get('sessionId' as never) as string;
  await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
  return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookie() },
  });
});

app.get('/api/auth/me', authMiddleware, async (c) => {
  return ok({ id: c.get('adminId' as never), email: c.get('adminEmail' as never) });
});

// ════════════════════════════════════════════════════════════════════════
// QUOTES
// ════════════════════════════════════════════════════════════════════════
app.post('/api/quotes', rateLimit(5, 60_000), async (c) => {
  let body: unknown;
  try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = quoteSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));

  const data = r.data;
  const maxRow = await c.env.DB.prepare('SELECT MAX(id) as maxId FROM quote_requests').first<{ maxId: number | null }>();
  const publicId = generateQuoteId((maxRow?.maxId ?? 0) + 1);

  const row = await c.env.DB.prepare(
    `INSERT INTO quote_requests (public_request_id,full_name,company_name,email,phone,pickup_location,delivery_location,pickup_date,delivery_date,freight_type,commodity,weight,pieces,equipment_type,shipment_notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id,public_request_id,created_at`
  ).bind(publicId, data.full_name, data.company_name??null, data.email, data.phone??null, data.pickup_location, data.delivery_location, data.pickup_date??null, data.delivery_date??null, data.freight_type, data.commodity??null, data.weight??null, data.pieces??null, data.equipment_type??null, data.shipment_notes??null)
  .first<{ id: number; public_request_id: string; created_at: string }>();

  return created({ id: row?.id, public_request_id: row?.public_request_id ?? publicId, created_at: row?.created_at }, 'Quote request submitted successfully');
});

app.get('/api/admin/quotes', authMiddleware, async (c) => {
  const pr = paginationSchema.safeParse({ page: c.req.query('page'), limit: c.req.query('limit'), search: c.req.query('search'), status: c.req.query('status') });
  if (!pr.success) return badRequest('Invalid query parameters');
  const { page, limit, search, status } = pr.data;
  const offset = (page - 1) * limit;

  let where = 'WHERE deleted_at IS NULL'; const params: (string|number)[] = [];
  if (status) { where += ' AND status = ?'; params.push(status); }
  if (search) { where += ' AND (full_name LIKE ? OR email LIKE ? OR company_name LIKE ? OR public_request_id LIKE ?)'; const s=`%${search}%`; params.push(s,s,s,s); }

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM quote_requests ${where}`).bind(...params).first<{ count: number }>();
  const items = await c.env.DB.prepare(`SELECT * FROM quote_requests ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all<QuoteRequest>();
  return paginated(items.results, countRow?.count ?? 0, page, limit);
});

app.get('/api/admin/quotes/:id', authMiddleware, async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM quote_requests WHERE id = ? AND deleted_at IS NULL').bind(c.req.param('id')).first<QuoteRequest>();
  if (!row) return notFound('Quote request not found');
  return ok(row);
});

app.patch('/api/admin/quotes/:id', authMiddleware, async (c) => {
  let body: unknown; try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = updateQuoteSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors[0]?.message ?? 'Validation failed');
  const data = r.data; const updates: string[] = []; const params: (string|number)[] = [];
  if (data.status !== undefined) { updates.push('status = ?'); params.push(data.status); }
  if (data.internal_notes !== undefined) { updates.push('internal_notes = ?'); params.push(data.internal_notes); }
  if (updates.length === 0) return badRequest('No fields to update');
  updates.push("updated_at = datetime('now')"); params.push(c.req.param('id'));
  await c.env.DB.prepare(`UPDATE quote_requests SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`).bind(...params).run();
  const updated = await c.env.DB.prepare('SELECT * FROM quote_requests WHERE id = ?').bind(c.req.param('id')).first<QuoteRequest>();
  return ok(updated);
});

app.delete('/api/admin/quotes/:id', authMiddleware, async (c) => {
  const result = await c.env.DB.prepare("UPDATE quote_requests SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL").bind(c.req.param('id')).run();
  if (result.meta.changes === 0) return notFound('Quote request not found');
  return ok({ id: c.req.param('id') }, 'Deleted');
});

// ════════════════════════════════════════════════════════════════════════
// CONTACT
// ════════════════════════════════════════════════════════════════════════
app.post('/api/contact', rateLimit(3, 60_000), async (c) => {
  let body: unknown; try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = contactSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
  const data = r.data;
  const row = await c.env.DB.prepare(`INSERT INTO contact_messages (name,company,email,phone,subject,message) VALUES (?,?,?,?,?,?) RETURNING id,created_at`)
    .bind(data.name, data.company??null, data.email, data.phone??null, data.subject, data.message)
    .first<{ id: number; created_at: string }>();
  return created({ id: row?.id }, 'Message sent successfully');
});

app.get('/api/admin/messages', authMiddleware, async (c) => {
  const pr = paginationSchema.safeParse({ page: c.req.query('page'), limit: c.req.query('limit'), search: c.req.query('search'), status: c.req.query('status') });
  if (!pr.success) return badRequest('Invalid query parameters');
  const { page, limit, search, status } = pr.data;
  const offset = (page - 1) * limit;

  let where = 'WHERE deleted_at IS NULL'; const params: (string|number)[] = [];
  if (status) { where += ' AND status = ?'; params.push(status); }
  if (search) { where += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)'; const s=`%${search}%`; params.push(s,s,s); }

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM contact_messages ${where}`).bind(...params).first<{ count: number }>();
  const items = await c.env.DB.prepare(`SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all<ContactMessage>();
  return paginated(items.results, countRow?.count ?? 0, page, limit);
});

app.patch('/api/admin/messages/:id', authMiddleware, async (c) => {
  let body: unknown; try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = updateMessageSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors[0]?.message ?? 'Validation failed');
  await c.env.DB.prepare(`UPDATE contact_messages SET status = ?, updated_at = datetime('now') WHERE id = ? AND deleted_at IS NULL`).bind(r.data.status, c.req.param('id')).run();
  const updated = await c.env.DB.prepare('SELECT * FROM contact_messages WHERE id = ?').bind(c.req.param('id')).first<ContactMessage>();
  if (!updated) return notFound('Message not found');
  return ok(updated);
});

app.delete('/api/admin/messages/:id', authMiddleware, async (c) => {
  const result = await c.env.DB.prepare("UPDATE contact_messages SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL").bind(c.req.param('id')).run();
  if (result.meta.changes === 0) return notFound('Message not found');
  return ok({ id: c.req.param('id') }, 'Deleted');
});

// ════════════════════════════════════════════════════════════════════════
// SHIPMENTS
// ════════════════════════════════════════════════════════════════════════
app.get('/api/shipments/:trackingNumber', async (c) => {
  const tn = c.req.param('trackingNumber').toUpperCase();
  const shipment = await c.env.DB.prepare('SELECT * FROM shipments WHERE tracking_number = ? AND deleted_at IS NULL').bind(tn).first<Shipment>();
  if (!shipment) return notFound('Shipment not found. Please check your tracking number.');
  const events = await c.env.DB.prepare('SELECT * FROM shipment_events WHERE shipment_id = ? ORDER BY event_time ASC').bind(shipment.id).all<ShipmentEvent>();
  return ok({
    tracking_number: shipment.tracking_number, origin: shipment.origin, destination: shipment.destination,
    freight_type: shipment.freight_type, pickup_date: shipment.pickup_date,
    estimated_delivery: shipment.estimated_delivery, current_status: shipment.current_status,
    created_at: shipment.created_at, updated_at: shipment.updated_at, events: events.results,
  });
});

app.get('/api/admin/shipments', authMiddleware, async (c) => {
  const pr = paginationSchema.safeParse({ page: c.req.query('page'), limit: c.req.query('limit'), search: c.req.query('search'), status: c.req.query('status') });
  if (!pr.success) return badRequest('Invalid query parameters');
  const { page, limit, search, status } = pr.data;
  const offset = (page - 1) * limit;

  let where = 'WHERE deleted_at IS NULL'; const params: (string|number)[] = [];
  if (status) { where += ' AND current_status = ?'; params.push(status); }
  if (search) { where += ' AND (tracking_number LIKE ? OR customer_name LIKE ? OR origin LIKE ? OR destination LIKE ?)'; const s=`%${search}%`; params.push(s,s,s,s); }

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM shipments ${where}`).bind(...params).first<{ count: number }>();
  const items = await c.env.DB.prepare(`SELECT * FROM shipments ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all<Shipment>();
  return paginated(items.results, countRow?.count ?? 0, page, limit);
});

app.get('/api/admin/shipments/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const shipment = await c.env.DB.prepare('SELECT * FROM shipments WHERE id = ? AND deleted_at IS NULL').bind(id).first<Shipment>();
  if (!shipment) return notFound('Shipment not found');
  const events = await c.env.DB.prepare('SELECT * FROM shipment_events WHERE shipment_id = ? ORDER BY event_time ASC').bind(id).all<ShipmentEvent>();
  return ok({ ...shipment, events: events.results });
});

app.post('/api/admin/shipments', authMiddleware, async (c) => {
  let body: unknown; try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = createShipmentSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
  const data = r.data;
  const maxRow = await c.env.DB.prepare('SELECT MAX(id) as maxId FROM shipments').first<{ maxId: number | null }>();
  const tn = generateTrackingNumber((maxRow?.maxId ?? 0) + 1);
  const row = await c.env.DB.prepare(
    `INSERT INTO shipments (tracking_number,customer_name,customer_email,origin,destination,freight_type,pickup_date,estimated_delivery,current_status,notes)
     VALUES (?,?,?,?,?,?,?,?,?,?) RETURNING id,tracking_number,created_at`
  ).bind(tn, data.customer_name??null, data.customer_email||null, data.origin, data.destination, data.freight_type??null, data.pickup_date??null, data.estimated_delivery??null, data.current_status??'Quote Requested', data.notes??null)
  .first<{ id: number; tracking_number: string; created_at: string }>();
  if (row) await c.env.DB.prepare('INSERT INTO shipment_events (shipment_id,status,description) VALUES (?,?,?)').bind(row.id, data.current_status??'Quote Requested', 'Shipment record created').run();
  return created({ id: row?.id, tracking_number: row?.tracking_number }, 'Shipment created');
});

app.patch('/api/admin/shipments/:id', authMiddleware, async (c) => {
  let body: unknown; try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = updateShipmentSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
  const data = r.data; const updates: string[] = []; const params: (string|number|null)[] = [];
  const fields = ['customer_name','customer_email','origin','destination','freight_type','pickup_date','estimated_delivery','current_status','notes'] as const;
  for (const f of fields) { if (data[f] !== undefined) { updates.push(`${f} = ?`); params.push((data[f] as string|null|undefined) ?? null); } }
  if (updates.length === 0) return badRequest('No fields to update');
  updates.push("updated_at = datetime('now')"); params.push(c.req.param('id'));
  await c.env.DB.prepare(`UPDATE shipments SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`).bind(...params).run();
  const updated = await c.env.DB.prepare('SELECT * FROM shipments WHERE id = ?').bind(c.req.param('id')).first<Shipment>();
  return ok(updated);
});

app.delete('/api/admin/shipments/:id', authMiddleware, async (c) => {
  const result = await c.env.DB.prepare("UPDATE shipments SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL").bind(c.req.param('id')).run();
  if (result.meta.changes === 0) return notFound('Shipment not found');
  return ok({ id: c.req.param('id') }, 'Deleted');
});

app.post('/api/admin/shipments/:id/events', authMiddleware, async (c) => {
  let body: unknown; try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = addEventSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
  const data = r.data; const id = c.req.param('id');
  const shipment = await c.env.DB.prepare('SELECT id FROM shipments WHERE id = ? AND deleted_at IS NULL').bind(id).first<{ id: number }>();
  if (!shipment) return notFound('Shipment not found');
  await c.env.DB.prepare(`INSERT INTO shipment_events (shipment_id,status,location,description,event_time) VALUES (?,?,?,?,COALESCE(?,datetime('now')))`)
    .bind(id, data.status, data.location??null, data.description??null, data.event_time??null).run();
  await c.env.DB.prepare(`UPDATE shipments SET current_status = ?, updated_at = datetime('now') WHERE id = ?`).bind(data.status, id).run();
  const events = await c.env.DB.prepare('SELECT * FROM shipment_events WHERE shipment_id = ? ORDER BY event_time ASC').bind(id).all<ShipmentEvent>();
  return created({ events: events.results }, 'Event added');
});

// ════════════════════════════════════════════════════════════════════════
// CONTENT
// ════════════════════════════════════════════════════════════════════════
app.get('/api/content', async (c) => {
  const rows = await c.env.DB.prepare('SELECT content_key, content_value FROM site_content ORDER BY content_key').all<{ content_key: string; content_value: string }>();
  const map: Record<string, string> = {};
  for (const row of rows.results) map[row.content_key] = row.content_value;
  return ok(map);
});

app.get('/api/admin/content', authMiddleware, async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM site_content ORDER BY content_key').all<SiteContent>();
  return ok(rows.results);
});

app.patch('/api/admin/content/:key', authMiddleware, async (c) => {
  const key = c.req.param('key');
  let body: unknown; try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }
  const r = updateContentSchema.safeParse(body);
  if (!r.success) return badRequest(r.error.errors[0]?.message ?? 'Validation failed');
  const existing = await c.env.DB.prepare('SELECT id FROM site_content WHERE content_key = ?').bind(key).first<{ id: number }>();
  if (!existing) return notFound(`Content key '${key}' not found`);
  await c.env.DB.prepare(`UPDATE site_content SET content_value = ?, updated_at = datetime('now') WHERE content_key = ?`).bind(r.data.content_value, key).run();
  const updated = await c.env.DB.prepare('SELECT * FROM site_content WHERE content_key = ?').bind(key).first<SiteContent>();
  return ok(updated);
});

// ════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ════════════════════════════════════════════════════════════════════════
app.get('/api/admin/stats', authMiddleware, async (c) => {
  const [quotes, newQuotes, messages, unreadMessages, activeShipments, deliveredShipments] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as c FROM quote_requests WHERE deleted_at IS NULL").first<{ c: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM quote_requests WHERE status = 'new' AND deleted_at IS NULL").first<{ c: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE deleted_at IS NULL").first<{ c: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status = 'unread' AND deleted_at IS NULL").first<{ c: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM shipments WHERE current_status NOT IN ('Delivered','Cancelled') AND deleted_at IS NULL").first<{ c: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM shipments WHERE current_status = 'Delivered' AND deleted_at IS NULL").first<{ c: number }>(),
  ]);
  const recentQuotes = await c.env.DB.prepare(`SELECT date(created_at) as day, COUNT(*) as count FROM quote_requests WHERE created_at >= datetime('now','-7 days') AND deleted_at IS NULL GROUP BY day ORDER BY day`).all<{ day: string; count: number }>();
  return ok({ totalQuotes: quotes?.c??0, newQuotes: newQuotes?.c??0, totalMessages: messages?.c??0, unreadMessages: unreadMessages?.c??0, activeShipments: activeShipments?.c??0, deliveredShipments: deliveredShipments?.c??0, recentActivity: recentQuotes.results });
});

export default app;
