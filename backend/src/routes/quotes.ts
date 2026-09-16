import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { quoteSchema, updateQuoteSchema, paginationSchema } from '../utils/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import {
  ok,
  created,
  badRequest,
  notFound,
  paginated,
  serverError,
} from '../utils/response.js';
import { generateQuoteId } from '../utils/id.js';
import type { QuoteRequest } from '../types/index.js';

const quotes = new Hono<{ Bindings: Env }>();

// POST /api/quotes — public quote submission
quotes.post('/', rateLimit(5, 60_000), async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const result = quoteSchema.safeParse(body);
  if (!result.success) {
    return badRequest(
      result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
    );
  }

  const data = result.data;
  const db = c.env.DB;

  // Generate sequential public ID
  const maxRow = await db
    .prepare('SELECT MAX(id) as maxId FROM quote_requests')
    .first<{ maxId: number | null }>();
  const seq = (maxRow?.maxId ?? 0) + 1;
  const publicId = generateQuoteId(seq);

  try {
    const row = await db
      .prepare(
        `INSERT INTO quote_requests
          (public_request_id, full_name, company_name, email, phone,
           pickup_location, delivery_location, pickup_date, delivery_date,
           freight_type, commodity, weight, pieces, equipment_type, shipment_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id, public_request_id, created_at`
      )
      .bind(
        publicId,
        data.full_name,
        data.company_name ?? null,
        data.email,
        data.phone ?? null,
        data.pickup_location,
        data.delivery_location,
        data.pickup_date ?? null,
        data.delivery_date ?? null,
        data.freight_type,
        data.commodity ?? null,
        data.weight ?? null,
        data.pieces ?? null,
        data.equipment_type ?? null,
        data.shipment_notes ?? null
      )
      .first<{ id: number; public_request_id: string; created_at: string }>();

    return created(
      {
        id: row?.id,
        public_request_id: row?.public_request_id ?? publicId,
        created_at: row?.created_at,
      },
      'Quote request submitted successfully'
    );
  } catch (err) {
    console.error('Quote insert error:', err);
    return serverError('Failed to save quote request');
  }
});

// GET /api/admin/quotes — admin list
quotes.get('/admin', authMiddleware, async (c) => {
  const parseResult = paginationSchema.safeParse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    search: c.req.query('search'),
    status: c.req.query('status'),
  });

  if (!parseResult.success) {
    return badRequest('Invalid query parameters');
  }

  const { page, limit, search, status } = parseResult.data;
  const offset = (page - 1) * limit;
  const db = c.env.DB;

  let where = "WHERE deleted_at IS NULL";
  const params: (string | number)[] = [];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND (full_name LIKE ? OR email LIKE ? OR company_name LIKE ? OR public_request_id LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const countRow = await db
    .prepare(`SELECT COUNT(*) as count FROM quote_requests ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const items = await db
    .prepare(
      `SELECT * FROM quote_requests ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all<QuoteRequest>();

  return paginated(items.results, countRow?.count ?? 0, page, limit);
});

// GET /api/admin/quotes/:id
quotes.get('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  const row = await db
    .prepare('SELECT * FROM quote_requests WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first<QuoteRequest>();

  if (!row) return notFound('Quote request not found');
  return ok(row);
});

// PATCH /api/admin/quotes/:id
quotes.patch('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const result = updateQuoteSchema.safeParse(body);
  if (!result.success) {
    return badRequest(result.error.errors[0]?.message ?? 'Validation failed');
  }

  const db = c.env.DB;
  const data = result.data;
  const updates: string[] = [];
  const params: (string | number)[] = [];

  if (data.status !== undefined) { updates.push('status = ?'); params.push(data.status); }
  if (data.internal_notes !== undefined) { updates.push('internal_notes = ?'); params.push(data.internal_notes); }

  if (updates.length === 0) return badRequest('No fields to update');

  updates.push("updated_at = datetime('now')");
  params.push(id);

  await db
    .prepare(`UPDATE quote_requests SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`)
    .bind(...params)
    .run();

  const updated = await db
    .prepare('SELECT * FROM quote_requests WHERE id = ?')
    .bind(id)
    .first<QuoteRequest>();

  return ok(updated);
});

// DELETE /api/admin/quotes/:id — soft delete
quotes.delete('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  const result = await db
    .prepare("UPDATE quote_requests SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .run();

  if (result.meta.changes === 0) return notFound('Quote request not found');
  return ok({ id }, 'Quote request deleted');
});

export default quotes;
