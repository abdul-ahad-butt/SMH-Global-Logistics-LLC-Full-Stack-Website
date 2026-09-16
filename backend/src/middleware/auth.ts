import type { Context, Next } from 'hono';
import type { Env } from '../types/env.js';
import { unauthorized } from '../utils/response.js';

const SESSION_COOKIE = 'smh_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const sessionId = getCookieValue(c.req.raw.headers.get('cookie') ?? '', SESSION_COOKIE);

  if (!sessionId) {
    return unauthorized();
  }

  const db = c.env.DB;
  const session = await db
    .prepare(
      `SELECT s.id, s.admin_id, s.expires_at, a.email
       FROM sessions s
       JOIN admins a ON a.id = s.admin_id
       WHERE s.id = ? AND s.expires_at > datetime('now')`
    )
    .bind(sessionId)
    .first<{ id: string; admin_id: number; expires_at: string; email: string }>();

  if (!session) {
    return unauthorized('Session expired or invalid');
  }

  // Attach admin info to context
  c.set('adminId' as never, session.admin_id);
  c.set('adminEmail' as never, session.email);
  c.set('sessionId' as never, session.id);

  await next();
}

export function setSessionCookie(sessionId: string, isProduction: boolean): string {
  const expires = new Date(Date.now() + SESSION_DURATION_MS).toUTCString();
  const secure = isProduction ? '; Secure' : '';
  return `${SESSION_COOKIE}=${sessionId}; HttpOnly${secure}; SameSite=Lax; Path=/; Expires=${expires}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}
