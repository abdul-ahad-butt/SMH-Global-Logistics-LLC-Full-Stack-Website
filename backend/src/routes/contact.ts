import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { contactSchema, updateMessageSchema, paginationSchema } from '../utils/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { ok, created, badRequest, notFound, paginated, serverError } from '../utils/response.js';
import type { ContactMessage } from '../types/index.js';

const contact = new Hono<{ Bindings: Env }>();

// POST /api/contact — public contact form
contact.post('/', rateLimit(3, 60_000), async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return badRequest(
      result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
    );
  }

  const data = result.data;
  const db = c.env.DB;

  try {
    const row = await db
      .prepare(
        `INSERT INTO contact_messages (name, company, email, phone, subject, message)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING id, created_at`
      )
      .bind(
        data.name,
        data.company ?? null,
        data.email,
        data.phone ?? null,
        data.subject,
        data.message
      )
      .first<{ id: number; created_at: string }>();

    return created({ id: row?.id }, 'Message sent successfully');
  } catch (err) {
    console.error('Contact insert error:', err);
    return serverError('Failed to save message');
  }
});

// GET /api/admin/messages
contact.get('/admin', authMiddleware, async (c) => {
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

  if (status) { where += ' AND status = ?'; params.push(status); }
  if (search) {
    where += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countRow = await db
    .prepare(`SELECT COUNT(*) as count FROM contact_messages ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const items = await db
    .prepare(`SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all<ContactMessage>();

  return paginated(items.results, countRow?.count ?? 0, page, limit);
});

// PATCH /api/admin/messages/:id
contact.patch('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  let body: unknown;
  try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }

  const result = updateMessageSchema.safeParse(body);
  if (!result.success) return badRequest(result.error.errors[0]?.message ?? 'Validation failed');

  const db = c.env.DB;
  await db
    .prepare(`UPDATE contact_messages SET status = ?, updated_at = datetime('now') WHERE id = ? AND deleted_at IS NULL`)
    .bind(result.data.status, id)
    .run();

  const updated = await db
    .prepare('SELECT * FROM contact_messages WHERE id = ?')
    .bind(id)
    .first<ContactMessage>();

  if (!updated) return notFound('Message not found');
  return ok(updated);
});

// DELETE /api/admin/messages/:id — soft delete
contact.delete('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  const result = await db
    .prepare("UPDATE contact_messages SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .run();

  if (result.meta.changes === 0) return notFound('Message not found');
  return ok({ id }, 'Message deleted');
});

export default contact;
