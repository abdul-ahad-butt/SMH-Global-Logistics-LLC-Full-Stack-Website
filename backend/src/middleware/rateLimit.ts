import type { Context, Next } from 'hono';
import type { Env } from '../types/env.js';
import { tooManyRequests } from '../utils/response.js';

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10; // per window per IP per endpoint

export function rateLimit(maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const ip =
      c.req.raw.headers.get('cf-connecting-ip') ??
      c.req.raw.headers.get('x-forwarded-for') ??
      'unknown';
    const endpoint = new URL(c.req.url).pathname;
    const db = c.env.DB;

    const windowStart = new Date(Date.now() - windowMs).toISOString();

    // Count requests in window
    const row = await db
      .prepare(
        `SELECT COUNT(*) as count FROM rate_limit_log
         WHERE ip = ? AND endpoint = ? AND window_start > ?`
      )
      .bind(ip, endpoint, windowStart)
      .first<{ count: number }>();

    if (row && row.count >= maxRequests) {
      return tooManyRequests();
    }

    // Record this request
    await db
      .prepare(
        `INSERT INTO rate_limit_log (ip, endpoint, window_start) VALUES (?, ?, datetime('now'))`
      )
      .bind(ip, endpoint)
      .run();

    // Cleanup old records (async, don't await to not block response)
    db.prepare(`DELETE FROM rate_limit_log WHERE window_start < ?`)
      .bind(windowStart)
      .run()
      .catch(() => {});

    await next();
  };
}
