import { createMiddleware } from 'hono/factory'
import { createClient } from '@supabase/supabase-js'
import type { Env, Variables } from '../index'

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
    const header = c.req.header('Authorization')
    if (!header?.startsWith('Bearer ')) {
      return c.json({ error: 'Missing Authorization header' }, 401)
    }

    const token = header.slice(7)

    // Always validate server-side via getUser() — never trust a client-decoded JWT
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('userId', user.id)
    await next()
  }
)
