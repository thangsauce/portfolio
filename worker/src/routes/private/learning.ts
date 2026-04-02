import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSupabase } from '../../lib/supabase'
import type { Env, Variables } from '../../index'

const learning = new Hono<{ Bindings: Env; Variables: Variables }>()

const itemBody = z.object({
  title:    z.string().min(1).max(500),
  status:   z.enum(['to_learn', 'learning', 'learned']).default('to_learn'),
  category: z.string().max(100).nullable().optional(),
  notes:    z.string().nullable().optional(),
})

learning.get('/', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('learning_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

learning.post('/', zValidator('json', itemBody), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('learning_items')
    .insert(c.req.valid('json'))
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

learning.put('/:id', zValidator('json', itemBody.partial()), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('learning_items')
    .update(c.req.valid('json'))
    .eq('id', c.req.param('id'))
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

learning.delete('/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('learning_items')
    .delete()
    .eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default learning
