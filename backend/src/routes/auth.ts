import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { loginSchema } from '../utils/validation.js';
import { verifyPassword } from '../utils/crypto.js';
import { generateSessionId } from '../utils/id.js';
import { setSessionCookie, clearSessionCookie, authMiddleware } from '../middleware/auth.js';
import { ok, unauthorized, badRequest, serverError } from '../utils/response.js';

const auth = new Hono<{ Bindings: Env }>();

// POST /api/auth/login
auth.post('/login', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return badRequest(result.error.errors[0]?.message ?? 'Validation failed');
  }

  const { email, password } = result.data;
  const db = c.env.DB;

  const admin = await db
    .prepare('SELECT id, email, password_hash FROM admins WHERE email = ? COLLATE NOCASE')
    .bind(email.toLowerCase())
    .first<{ id: number; email: string; password_hash: string }>();

  if (!admin) {
    // Prevent timing attacks — still hash even if admin not found
    await verifyPassword(password, 'dummy:dummy');
    return unauthorized('Invalid email or password');
  }

  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    return unauthorized('Invalid email or password');
  }

  // Create session
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

  try {
    await db
      .prepare(
        'INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)'
      )
      .bind(sessionId, admin.id, expiresAt)
      .run();
  } catch {
    return serverError('Failed to create session');
  }

  const isProduction = !c.req.url.includes('localhost');
  const cookie = setSessionCookie(sessionId, isProduction);

  return new Response(
    JSON.stringify({ success: true, data: { email: admin.email } }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    }
  );
});

// POST /api/auth/logout
auth.post('/logout', authMiddleware, async (c) => {
  const sessionId = c.get('sessionId' as never) as string;
  const db = c.env.DB;

  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();

  return new Response(
    JSON.stringify({ success: true, message: 'Logged out' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie(),
      },
    }
  );
});

// GET /api/auth/me
auth.get('/me', authMiddleware, async (c) => {
  const adminEmail = c.get('adminEmail' as never) as string;
  const adminId = c.get('adminId' as never) as number;
  return ok({ id: adminId, email: adminEmail });
});

export default auth;
