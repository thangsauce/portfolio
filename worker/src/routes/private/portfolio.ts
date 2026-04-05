import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSupabase } from '../../lib/supabase'
import type { Env, Variables } from '../../index'

const r = new Hono<{ Bindings: Env; Variables: Variables }>()
const RESUME_BUCKET = 'portfolio-assets'
const RESUME_PATH = 'resume/resume.pdf'
const PROJECTS_PATH = 'projects'
const projectCategorySchema = z.preprocess(
  (value) => (value === 'it_systems' ? 'network' : value),
  z.enum(['web_development', 'cybersecurity', 'network']),
)

// ── Projects ──────────────────────────────────────────────────────────────────

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().nullish(),
  long_description: z.string().nullish(),
  done_for: z.string().nullish(),
  category: projectCategorySchema.default('web_development'),
  tech_stack: z.array(z.string()).default([]),
  source_code_url: z.string().url().or(z.literal('')).nullish(),
  live_url: z.string().url().or(z.literal('')).nullish(),
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
  order_index: z.number().int().default(0),
})

const stackSchema = z.object({
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

r.get('/currently_using', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('currently_using').select('*').order('order_index')
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

const currentlyUsingSchema = z.object({
  name: z.string().min(1),
  icon_url: z.string().optional(),
  order_index: z.number().int().default(0),
})

r.post('/currently_using', zValidator('json', currentlyUsingSchema), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('currently_using').insert(c.req.valid('json')).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

r.put('/currently_using/:id', zValidator('json', currentlyUsingSchema.partial()), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('currently_using').update(c.req.valid('json')).eq('id', c.req.param('id')).select().single()
  if (error || !data) return c.json({ error: error?.message ?? 'Not found' }, error ? 500 : 404)
  return c.json(data)
})

r.delete('/currently_using/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('currently_using').delete().eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// ── Stacks ────────────────────────────────────────────────────────────────────

r.get('/stacks', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('stacks').select('*').order('order_index')
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

r.post('/stacks', zValidator('json', stackSchema), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('stacks').insert(c.req.valid('json')).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

r.put('/stacks/:id', zValidator('json', stackSchema.partial()), async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('stacks').update(c.req.valid('json')).eq('id', c.req.param('id')).select().single()
  if (error || !data) return c.json({ error: error?.message ?? 'Not found' }, error ? 500 : 404)
  return c.json(data)
})

r.delete('/stacks/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('stacks').delete().eq('id', c.req.param('id'))
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
  featured: z.boolean().default(false),
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

// ── Resume (PDF upload) ──────────────────────────────────────────────────────

r.get('/resume', async (c) => {
  const supabase = getSupabase(c.env)
  const { data: listed, error: listError } = await supabase.storage
    .from(RESUME_BUCKET)
    .list('resume', { search: 'resume.pdf', limit: 10 })

  // If storage bucket is missing/not ready, still allow dashboard to load default resume.
  if (listError) {
    return c.json({ url: '/resume.pdf', hasCustom: false })
  }

  const hasCustom = (listed ?? []).some((f) => f.name === 'resume.pdf')
  if (!hasCustom) {
    return c.json({ url: '/resume.pdf', hasCustom: false })
  }

  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(RESUME_PATH)
  return c.json({ url: data.publicUrl, hasCustom: true })
})

r.post('/resume', async (c) => {
  const form = await c.req.formData()
  const file = form.get('file')

  if (!file || typeof file === 'string') {
    return c.json({ error: 'Expected a file field named "file"' }, 400)
  }

  const uploaded = file as { type?: string; arrayBuffer: () => Promise<ArrayBuffer> }
  if (uploaded.type !== 'application/pdf') {
    return c.json({ error: 'Resume must be a PDF file' }, 400)
  }

  const bytes = new Uint8Array(await uploaded.arrayBuffer())
  const supabase = getSupabase(c.env)
  const { error } = await supabase.storage.from(RESUME_BUCKET).upload(RESUME_PATH, bytes, {
    upsert: true,
    contentType: 'application/pdf',
    cacheControl: '3600',
  })
  if (error) return c.json({ error: `${error.message} (bucket "${RESUME_BUCKET}")` }, 500)

  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(RESUME_PATH)
  return c.json({ url: data.publicUrl, hasCustom: true })
})

// ── Project image upload ─────────────────────────────────────────────────────

r.post('/project-images', async (c) => {
  const form = await c.req.formData()
  const file = form.get('file')
  const folderRaw = form.get('folder')

  if (!file || typeof file === 'string') {
    return c.json({ error: 'Expected a file field named "file"' }, 400)
  }

  const folder = typeof folderRaw === 'string' && ['thumbnail', 'long', 'gallery'].includes(folderRaw)
    ? folderRaw
    : 'gallery'

  const uploaded = file as {
    name?: string
    type?: string
    size?: number
    arrayBuffer: () => Promise<ArrayBuffer>
  }

  if (!uploaded.type || !uploaded.type.startsWith('image/')) {
    return c.json({ error: 'Only image files are allowed' }, 400)
  }

  const maxSizeBytes = 10 * 1024 * 1024
  if ((uploaded.size ?? 0) > maxSizeBytes) {
    return c.json({ error: 'Image must be 10MB or smaller' }, 400)
  }

  const byName = uploaded.name?.split('.').pop()?.toLowerCase() ?? ''
  const byMime = uploaded.type.split('/')[1]?.toLowerCase().replace('jpeg', 'jpg') ?? ''
  const ext = /^[a-z0-9]+$/.test(byName) ? byName : (/^[a-z0-9]+$/.test(byMime) ? byMime : 'jpg')
  const objectPath = `${PROJECTS_PATH}/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const bytes = new Uint8Array(await uploaded.arrayBuffer())
  const supabase = getSupabase(c.env)
  const { error } = await supabase.storage.from(RESUME_BUCKET).upload(objectPath, bytes, {
    upsert: false,
    contentType: uploaded.type,
    cacheControl: '3600',
  })

  if (error) return c.json({ error: `${error.message} (bucket "${RESUME_BUCKET}")` }, 500)

  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(objectPath)
  return c.json({ url: data.publicUrl, path: objectPath })
})

export default r
