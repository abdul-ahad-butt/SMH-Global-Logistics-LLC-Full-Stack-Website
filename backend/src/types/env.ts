// Cloudflare Workers environment type bindings
export interface Env {
  DB: D1Database;
  SESSION_SECRET: string;
  API_ALLOWED_ORIGINS: string;
}
