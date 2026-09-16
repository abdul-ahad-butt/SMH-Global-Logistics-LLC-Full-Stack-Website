import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import {
  createShipmentSchema,
  updateShipmentSchema,
  addEventSchema,
  paginationSchema,
} from '../utils/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { ok, created, badRequest, notFound, paginated, serverError } from '../utils/response.js';
import { generateTrackingNumber } from '../utils/id.js';
import type { Shipment, ShipmentEvent } from '../types/index.js';

const shipments = new Hono<{ Bindings: Env }>();

// GET /api/shipments/:trackingNumber — public tracking
shipments.get('/track/:trackingNumber', async (c) => {
  const trackingNumber = c.req.param('trackingNumber').toUpperCase();
  const db = c.env.DB;

  const shipment = await db
    .prepare('SELECT * FROM shipments WHERE tracking_number = ? AND deleted_at IS NULL')
    .bind(trackingNumber)
    .first<Shipment>();

  if (!shipment) return notFound('Shipment not found. Please check your tracking number.');

  const events = await db
    .prepare(
      'SELECT * FROM shipment_events WHERE shipment_id = ? ORDER BY event_time ASC'
    )
    .bind(shipment.id)
    .all<ShipmentEvent>();

  // For public view, omit sensitive fields (customer email, internal notes)
  const publicShipment = {
    tracking_number: shipment.tracking_number,
    origin: shipment.origin,
    destination: shipment.destination,
    freight_type: shipment.freight_type,
    pickup_date: shipment.pickup_date,
    estimated_delivery: shipment.estimated_delivery,
    current_status: shipment.current_status,
    created_at: shipment.created_at,
    updated_at: shipment.updated_at,
    events: events.results,
  };

  return ok(publicShipment);
});

// GET /api/admin/shipments
shipments.get('/admin', authMiddleware, async (c) => {
  const parseResult = paginationSchema.safeParse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    search: c.req.query('search'),
    status: c.req.query('status'),
  });

  if (!parseResult.success) return badRequest('Invalid query parameters');

  const { page, limit, search, status } = parseResult.data;
  const offset = (page - 1) * limit;
  const db = c.env.DB;

  let where = 'WHERE deleted_at IS NULL';
  const params: (string | number)[] = [];

  if (status) { where += ' AND current_status = ?'; params.push(status); }
  if (search) {
    where += ' AND (tracking_number LIKE ? OR customer_name LIKE ? OR origin LIKE ? OR destination LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const countRow = await db
    .prepare(`SELECT COUNT(*) as count FROM shipments ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const items = await db
    .prepare(`SELECT * FROM shipments ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all<Shipment>();

  return paginated(items.results, countRow?.count ?? 0, page, limit);
});

// GET /api/admin/shipments/:id
shipments.get('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  const shipment = await db
    .prepare('SELECT * FROM shipments WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first<Shipment>();

  if (!shipment) return notFound('Shipment not found');

  const events = await db
    .prepare('SELECT * FROM shipment_events WHERE shipment_id = ? ORDER BY event_time ASC')
    .bind(id)
    .all<ShipmentEvent>();

  return ok({ ...shipment, events: events.results });
});

// POST /api/admin/shipments
shipments.post('/admin', authMiddleware, async (c) => {
  let body: unknown;
  try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }

  const result = createShipmentSchema.safeParse(body);
  if (!result.success) {
    return badRequest(result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
  }

  const data = result.data;
  const db = c.env.DB;

  // Generate tracking number
  const maxRow = await db
    .prepare('SELECT MAX(id) as maxId FROM shipments')
    .first<{ maxId: number | null }>();
  const seq = (maxRow?.maxId ?? 0) + 1;
  const trackingNumber = generateTrackingNumber(seq);

  try {
    const row = await db
      .prepare(
        `INSERT INTO shipments
          (tracking_number, customer_name, customer_email, origin, destination,
           freight_type, pickup_date, estimated_delivery, current_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id, tracking_number, created_at`
      )
      .bind(
        trackingNumber,
        data.customer_name ?? null,
        data.customer_email || null,
        data.origin,
        data.destination,
        data.freight_type ?? null,
        data.pickup_date ?? null,
        data.estimated_delivery ?? null,
        data.current_status ?? 'Quote Requested',
        data.notes ?? null
      )
      .first<{ id: number; tracking_number: string; created_at: string }>();

    // Insert initial event
    if (row) {
      await db
        .prepare(
          `INSERT INTO shipment_events (shipment_id, status, description)
           VALUES (?, ?, ?)`
        )
        .bind(row.id, data.current_status ?? 'Quote Requested', 'Shipment record created')
        .run();
    }

    return created({ id: row?.id, tracking_number: row?.tracking_number }, 'Shipment created');
  } catch (err) {
    console.error('Shipment insert error:', err);
    return serverError('Failed to create shipment');
  }
});

// PATCH /api/admin/shipments/:id
shipments.patch('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  let body: unknown;
  try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }

  const result = updateShipmentSchema.safeParse(body);
  if (!result.success) {
    return badRequest(result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
  }

  const data = result.data;
  const db = c.env.DB;
  const updates: string[] = [];
  const params: (string | number | null)[] = [];

  const fieldMap: Record<string, keyof typeof data> = {
    customer_name: 'customer_name',
    customer_email: 'customer_email',
    origin: 'origin',
    destination: 'destination',
    freight_type: 'freight_type',
    pickup_date: 'pickup_date',
    estimated_delivery: 'estimated_delivery',
    current_status: 'current_status',
    notes: 'notes',
  };

  for (const [col, key] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      updates.push(`${col} = ?`);
      params.push((data[key] as string | null | undefined) ?? null);
    }
  }

  if (updates.length === 0) return badRequest('No fields to update');

  updates.push("updated_at = datetime('now')");
  params.push(id);

  await db
    .prepare(`UPDATE shipments SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`)
    .bind(...params)
    .run();

  const updated = await db
    .prepare('SELECT * FROM shipments WHERE id = ?')
    .bind(id)
    .first<Shipment>();

  return ok(updated);
});

// DELETE /api/admin/shipments/:id — soft delete
shipments.delete('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  const result = await db
    .prepare("UPDATE shipments SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .run();

  if (result.meta.changes === 0) return notFound('Shipment not found');
  return ok({ id }, 'Shipment deleted');
});

// POST /api/admin/shipments/:id/events
shipments.post('/admin/:id/events', authMiddleware, async (c) => {
  const id = c.req.param('id');
  let body: unknown;
  try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }

  const result = addEventSchema.safeParse(body);
  if (!result.success) {
    return badRequest(result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
  }

  const data = result.data;
  const db = c.env.DB;

  // Verify shipment exists
  const shipment = await db
    .prepare('SELECT id FROM shipments WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first<{ id: number }>();

  if (!shipment) return notFound('Shipment not found');

  try {
    await db
      .prepare(
        `INSERT INTO shipment_events (shipment_id, status, location, description, event_time)
         VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')))`
      )
      .bind(
        id,
        data.status,
        data.location ?? null,
        data.description ?? null,
        data.event_time ?? null
      )
      .run();

    // Update shipment current_status to match latest event
    await db
      .prepare(`UPDATE shipments SET current_status = ?, updated_at = datetime('now') WHERE id = ?`)
      .bind(data.status, id)
      .run();

    const events = await db
      .prepare('SELECT * FROM shipment_events WHERE shipment_id = ? ORDER BY event_time ASC')
      .bind(id)
      .all<ShipmentEvent>();

    return created({ events: events.results }, 'Event added');
  } catch (err) {
    console.error('Event insert error:', err);
    return serverError('Failed to add event');
  }
});

export default shipments;
