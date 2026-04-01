import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import type { Env } from '../index'

const portfolio = new Hono<{ Bindings: Env }>()

// Public routes — select only fields needed for display, never expose internal metadata
portfolio.get('/projects', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('portfolio_projects')
    .select('id, title, slug, description, tech_stack, source_code_url, images, featured, year, order_index')
    .order('order_index')
  if (error) return c.json({ error: 'Failed to fetch projects' }, 500)
  return c.json(data)
})

portfolio.get('/projects/:slug', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('portfolio_projects')
    .select('id, title, slug, description, long_description, tech_stack, source_code_url, images, featured, year')
    .eq('slug', c.req.param('slug'))
    .single()
  if (error || !data) return c.json({ error: 'Project not found' }, 404)
  return c.json(data)
})

portfolio.get('/skills', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('skills')
    .select('id, name, category, icon_url, order_index')
    .order('order_index')
  if (error) return c.json({ error: 'Failed to fetch skills' }, 500)
  return c.json(data)
})

portfolio.get('/certifications', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('certifications')
    .select('id, name, issuer, issue_date, credential_id, url, order_index')
    .order('order_index')
  if (error) return c.json({ error: 'Failed to fetch certifications' }, 500)
  return c.json(data)
})

portfolio.get('/experiences', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('experiences')
    .select('id, company, role, start_date, end_date, description, order_index')
    .order('order_index')
  if (error) return c.json({ error: 'Failed to fetch experiences' }, 500)
  return c.json(data)
})

export default portfolio
