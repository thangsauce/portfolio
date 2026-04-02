import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSupabase } from '../../lib/supabase'
import type { Env, Variables } from '../../index'

const notes = new Hono<{ Bindings: Env; Variables: Variables }>()

const noteBody = z.object({
  title:   z.string().min(1).max(500).default('Untitled'),
  content: z.array(z.any()).default([]),
})

// List all notes (id, title, updated_at only — no content for perf)
notes.get('/', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('notes')
    .select('id, title, updated_at, created_at')
    .order('updated_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Get single note with full content
notes.get('/:id', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('notes')
    .select('*')
    .eq('id', c.req.param('id'))
    .single()
  if (error) return c.json({ error: error.message }, 404)
  return c.json(data)
})

// Create note
notes.post('/', zValidator('json', noteBody), async (c) => {
  const body = c.req.valid('json')
  const { data, error } = await getSupabase(c.env)
    .from('notes')
    .insert(body)
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

// Update note
notes.put('/:id', zValidator('json', noteBody.partial()), async (c) => {
  const body = c.req.valid('json')
  const { data, error } = await getSupabase(c.env)
    .from('notes')
    .update(body)
    .eq('id', c.req.param('id'))
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Delete note
notes.delete('/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('notes')
    .delete()
    .eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default notes
