import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import portfolio from './routes/portfolio'
import privatePortfolio from './routes/private/portfolio'

export type Env = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ENVIRONMENT: string
}

export type Variables = { userId: string }

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const PROD_ALLOWED_ORIGINS = new Set([
  'https://thangle.me',
  'https://www.thangle.me',
])

app.use('*', cors({
  origin: (origin, c) => {
    if (c.env.ENVIRONMENT === 'development') return origin ?? '*'
    if (origin?.endsWith('.pages.dev')) return origin
    if (origin && PROD_ALLOWED_ORIGINS.has(origin)) return origin
    return 'https://thangle.me'
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.onError((err, c) => {
  console.error('Worker unhandled error:', err)
  return c.json(
    {
      error: err?.message || 'Internal Server Error',
      name: err?.name || 'Error',
    },
    500,
  )
})

app.get('/health', (c) => c.json({ ok: true }))

app.route('/api/portfolio', portfolio)

// All /api/private/* routes require a valid Supabase JWT
app.use('/api/private/*', authMiddleware)
app.route('/api/private/portfolio', privatePortfolio)

export default app
