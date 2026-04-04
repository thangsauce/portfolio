import type { Context, Next } from 'hono'

/**
 * Simple sliding-window rate limiter.
 *
 * State is module-level, so it persists across requests within the same
 * Cloudflare Worker instance (instances are reused for the lifetime of the
 * isolate). This catches burst attacks effectively per-instance.
 *
 * For cross-instance distributed limiting, bind a Cloudflare KV namespace
 * or use the Workers Rate Limiting API in wrangler.toml.
 */

const store = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000 // 1 minute

function getIp(c: Context): string {
  return (
    c.req.header('CF-Connecting-IP') ??
    c.req.header('X-Forwarded-For')?.split(',')[0].trim() ??
    'unknown'
  )
}

export function rateLimit(maxPerMinute: number) {
  return async (c: Context, next: Next) => {
    const ip  = getIp(c)
    const key = `${ip}:${maxPerMinute}`
    const now = Date.now()

    let entry = store.get(key)
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + WINDOW_MS }
      store.set(key, entry)
    }

    entry.count++

    // Prune stale entries on ~1% of requests to prevent unbounded growth
    if (Math.random() < 0.01) {
      for (const [k, v] of store) {
        if (now >= v.resetAt) store.delete(k)
      }
    }

    if (entry.count > maxPerMinute) {
      c.header('Retry-After', '60')
      return c.json({ error: 'Too many requests' }, 429)
    }

    await next()
  }
}
