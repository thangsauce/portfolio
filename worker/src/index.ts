import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import { getSupabase } from './lib/supabase'
import portfolio from './routes/portfolio'
import privatePortfolio from './routes/private/portfolio'
import privateNotes from './routes/private/notes'
import privateTodos from './routes/private/todos'
import privateLearning from './routes/private/learning'
import blog from './routes/blog'
import privateBlog from './routes/private/blog'
import privateProjectDocs from './routes/private/project-docs'

export type Env = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ENVIRONMENT: string
}

export type Variables = { userId: string }
type HealthState = 'operational' | 'degraded' | 'down'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const PROD_ALLOWED_ORIGINS = new Set([
  'https://thangle.me',
  'https://www.thangle.me',
])

app.use('*', cors({
  origin: (origin, c) => {
    if (c.env.ENVIRONMENT === 'development') return origin ?? 'http://localhost:3000'
    if (origin?.endsWith('.pages.dev')) return origin
    if (origin && PROD_ALLOWED_ORIGINS.has(origin)) return origin
    return 'https://thangle.me'
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.onError((err, c) => {
  console.error('Worker unhandled error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.get('/health', async (c) => {
  const env = c.env
  const now = new Date().toISOString()

  const api = {
    key: 'API',
    val: 'api.thangle.me',
    status: 'operational' as HealthState,
  }

  let authStatus: HealthState = 'degraded'
  let dbStatus: HealthState = 'degraded'
  let authError: string | null = null
  let dbError: string | null = null

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    authStatus = 'down'
    dbStatus = 'down'
    authError = 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    dbError = authError
  } else {
    // 1) Auth service check (Supabase GoTrue)
    try {
      const authRes = await fetch(`${env.SUPABASE_URL}/auth/v1/settings`, {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      })
      authStatus = authRes.ok ? 'operational' : 'down'
      if (!authRes.ok) authError = `Auth HTTP ${authRes.status}`
    } catch (err) {
      authStatus = 'down'
      authError = err instanceof Error ? err.message : 'Auth check failed'
    }

    // 2) DB check (simple read query through service role)
    try {
      const supabase = getSupabase(env)
      const { error } = await supabase
        .from('portfolio_projects')
        .select('id', { count: 'exact', head: true })
        .limit(1)
      if (error) {
        dbStatus = 'down'
        dbError = error.message
      } else {
        dbStatus = 'operational'
      }
    } catch (err) {
      dbStatus = 'down'
      dbError = err instanceof Error ? err.message : 'DB check failed'
    }
  }

  const deployStatus: HealthState =
    env.ENVIRONMENT === 'production' ? 'operational' : 'degraded'

  const services = {
    api,
    auth: { key: 'Auth', val: 'Supabase', status: authStatus, error: authError },
    db: { key: 'DB', val: 'PostgreSQL', status: dbStatus, error: dbError },
    deploy: { key: 'Deploy', val: 'Cloudflare', status: deployStatus },
  }

  const ok =
    services.api.status === 'operational' &&
    services.auth.status === 'operational' &&
    services.db.status === 'operational' &&
    services.deploy.status === 'operational'

  return c.json({
    ok,
    timestamp: now,
    services,
  })
})

app.route('/api/portfolio', portfolio)
app.route('/api/blog', blog)

// All /api/private/* routes require a valid Supabase JWT
app.use('/api/private/*', authMiddleware)
app.route('/api/private/portfolio', privatePortfolio)
app.route('/api/private/notes', privateNotes)
app.route('/api/private/todos', privateTodos)
app.route('/api/private/learning', privateLearning)
app.route('/api/private/blog', privateBlog)
app.route('/api/private/project-docs', privateProjectDocs)

export default app
