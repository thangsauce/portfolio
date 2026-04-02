import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSupabase } from '../../lib/supabase'
import type { Env, Variables } from '../../index'

const blog = new Hono<{ Bindings: Env; Variables: Variables }>()

const postBody = z.object({
  title:        z.string().min(1).max(500),
  slug:         z.string().regex(/^[a-z0-9-]+$/).max(200),
  content:      z.string().default(''),
  excerpt:      z.string().nullable().optional(),
  published:    z.boolean().default(false),
  published_at: z.string().nullable().optional(),
  tags:         z.array(z.string()).default([]),
})

// List all posts (including drafts)
blog.get('/', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('blog_posts')
    .select('id, title, slug, excerpt, tags, published, published_at, created_at, updated_at')
    .order('created_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Single post by id
blog.get('/:id', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('blog_posts')
    .select('*')
    .eq('id', c.req.param('id'))
    .single()
  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json(data)
})

// Create post
blog.post('/', zValidator('json', postBody), async (c) => {
  const body = c.req.valid('json')
  // Auto-set published_at when publishing
  if (body.published && !body.published_at) {
    body.published_at = new Date().toISOString()
  }
  const { data, error } = await getSupabase(c.env)
    .from('blog_posts')
    .insert(body)
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

// Update post
blog.put('/:id', zValidator('json', postBody.partial()), async (c) => {
  const body = c.req.valid('json')
  // Auto-set published_at when first publishing
  if (body.published && !body.published_at) {
    body.published_at = new Date().toISOString()
  }
  const { data, error } = await getSupabase(c.env)
    .from('blog_posts')
    .update(body)
    .eq('id', c.req.param('id'))
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Delete post
blog.delete('/:id', async (c) => {
  const { error } = await getSupabase(c.env)
    .from('blog_posts')
    .delete()
    .eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default blog
