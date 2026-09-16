import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { updateContentSchema } from '../utils/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { ok, badRequest, notFound } from '../utils/response.js';
import type { SiteContent } from '../types/index.js';

const content = new Hono<{ Bindings: Env }>();

// GET /api/content — public read of all content keys
content.get('/', async (c) => {
  const db = c.env.DB;
  const rows = await db
    .prepare('SELECT content_key, content_value FROM site_content ORDER BY content_key')
    .all<{ content_key: string; content_value: string }>();

  // Convert to key/value map
  const map: Record<string, string> = {};
  for (const row of rows.results) {
    map[row.content_key] = row.content_value;
  }

  return ok(map);
});

// PATCH /api/admin/content/:key — admin update
content.patch('/admin/:key', authMiddleware, async (c) => {
  const key = c.req.param('key');
  let body: unknown;
  try { body = await c.req.json(); } catch { return badRequest('Invalid JSON body'); }

  const result = updateContentSchema.safeParse(body);
  if (!result.success) {
    return badRequest(result.error.errors[0]?.message ?? 'Validation failed');
  }

  const db = c.env.DB;

  // Check key exists
  const existing = await db
    .prepare('SELECT id FROM site_content WHERE content_key = ?')
    .bind(key)
    .first<{ id: number }>();

  if (!existing) return notFound(`Content key '${key}' not found`);

  await db
    .prepare(`UPDATE site_content SET content_value = ?, updated_at = datetime('now') WHERE content_key = ?`)
    .bind(result.data.content_value, key)
    .run();

  const updated = await db
    .prepare('SELECT * FROM site_content WHERE content_key = ?')
    .bind(key)
    .first<SiteContent>();

  return ok(updated);
});

// GET /api/admin/content — admin list of all content
content.get('/admin', authMiddleware, async (c) => {
  const db = c.env.DB;
  const rows = await db
    .prepare('SELECT * FROM site_content ORDER BY content_key')
    .all<SiteContent>();

  return ok(rows.results);
});

export default content;
