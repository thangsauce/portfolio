import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSupabase } from '../../lib/supabase'
import type { Env, Variables } from '../../index'

const r = new Hono<{ Bindings: Env; Variables: Variables }>()

// ── Projects ──────────────────────────────────────────────────────────────────

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  long_description: z.string().optional(),
  tech_stack: z.array(z.string()).default([]),
  source_code_url: z.string().url().optional().or(z.literal('')),
  images: z.object({
    thumbnail: z.string().default(''),
    long: z.string().default(''),
    gallery: z.array(z.string()).default([]),
  }).default({ thumbnail: '', long: '', gallery: [] }),
  featured: z.boolean().default(false),
  year: z.number().int().optional(),
  order_index: z.number().int().default(0),
})

r.get('/projects', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('portfolio_projects').select('*').order('order_index')
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

r.post('/projects', zValidator('json', projectSchema), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('portfolio_projects').insert(c.req.valid('json')).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

r.put('/projects/:id', zValidator('json', projectSchema.partial()), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('portfolio_projects').update(c.req.valid('json')).eq('id', c.req.param('id')).select().single()
  if (error || !data) return c.json({ error: error?.message ?? 'Not found' }, error ? 500 : 404)
  return c.json(data)
})

r.delete('/projects/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('portfolio_projects').delete().eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// ── Skills ────────────────────────────────────────────────────────────────────

const skillSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  icon_url: z.string().optional(),
  order_index: z.number().int().default(0),
})

r.get('/skills', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('skills').select('*').order('order_index')
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

r.post('/skills', zValidator('json', skillSchema), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('skills').insert(c.req.valid('json')).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

r.put('/skills/:id', zValidator('json', skillSchema.partial()), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('skills').update(c.req.valid('json')).eq('id', c.req.param('id')).select().single()
  if (error || !data) return c.json({ error: error?.message ?? 'Not found' }, error ? 500 : 404)
  return c.json(data)
})

r.delete('/skills/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('skills').delete().eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// ── Certifications ────────────────────────────────────────────────────────────

const certSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().optional(),
  issue_date: z.string().optional(),
  credential_id: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  order_index: z.number().int().default(0),
})

r.get('/certifications', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('certifications').select('*').order('order_index')
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

r.post('/certifications', zValidator('json', certSchema), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('certifications').insert(c.req.valid('json')).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

r.put('/certifications/:id', zValidator('json', certSchema.partial()), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('certifications').update(c.req.valid('json')).eq('id', c.req.param('id')).select().single()
  if (error || !data) return c.json({ error: error?.message ?? 'Not found' }, error ? 500 : 404)
  return c.json(data)
})

r.delete('/certifications/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('certifications').delete().eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// ── Experiences ───────────────────────────────────────────────────────────────

const expSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  description: z.array(z.string()).default([]),
  order_index: z.number().int().default(0),
})

r.get('/experiences', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('experiences').select('*').order('order_index')
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

r.post('/experiences', zValidator('json', expSchema), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('experiences').insert(c.req.valid('json')).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

r.put('/experiences/:id', zValidator('json', expSchema.partial()), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('experiences').update(c.req.valid('json')).eq('id', c.req.param('id')).select().single()
  if (error || !data) return c.json({ error: error?.message ?? 'Not found' }, error ? 500 : 404)
  return c.json(data)
})

r.delete('/experiences/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('experiences').delete().eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

export default r
