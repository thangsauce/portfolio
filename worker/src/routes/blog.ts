import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import type { Env } from '../index'

const blog = new Hono<{ Bindings: Env }>()

// List published posts (no content — listing only)
blog.get('/', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('blog_posts')
    .select('id, title, slug, excerpt, tags, published_at, created_at')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Single published post
blog.get('/:slug', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('blog_posts')
    .select('id, title, slug, content, excerpt, tags, published_at, created_at')
    .eq('slug', c.req.param('slug'))
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .single()
  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json(data)
})

export default blog
