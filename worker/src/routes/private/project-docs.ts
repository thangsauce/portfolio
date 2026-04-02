import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSupabase } from '../../lib/supabase'
import type { Env, Variables } from '../../index'

const docs = new Hono<{ Bindings: Env; Variables: Variables }>()

const docBody = z.object({
  title:                z.string().min(1).max(500),
  content:              z.string().default(''),
  portfolio_project_id: z.string().uuid().nullable().optional(),
})

// List all docs (no content)
docs.get('/', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('project_docs')
    .select('id, title, portfolio_project_id, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Single doc with content
docs.get('/:id', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('project_docs')
    .select('*')
    .eq('id', c.req.param('id'))
    .single()
  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json(data)
})

// Create
docs.post('/', zValidator('json', docBody), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('project_docs')
    .insert(c.req.valid('json'))
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

// Update
docs.put('/:id', zValidator('json', docBody.partial()), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('project_docs')
    .update(c.req.valid('json'))
    .eq('id', c.req.param('id'))
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Delete
docs.delete('/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('project_docs')
    .delete()
    .eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default docs
