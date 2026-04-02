import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import type { Env } from '../index'

const portfolio = new Hono<{ Bindings: Env }>()
const RESUME_BUCKET = 'portfolio-assets'
const RESUME_PATH = 'resume/resume.pdf'

// Public routes — select only fields needed for display, never expose internal metadata
portfolio.get('/projects', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('portfolio_projects')
    .select('id, title, slug, description, done_for, tech_stack, source_code_url, live_url, images, featured, category, year, order_index')
    .order('order_index')
  if (error) return c.json({ error: 'Failed to fetch projects' }, 500)
  return c.json((data ?? []).map((project) => ({
    ...project,
    category: project.category === 'it_systems' ? 'network' : project.category,
  })))
})

portfolio.get('/projects/:slug', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('portfolio_projects')
    .select('id, title, slug, description, long_description, done_for, tech_stack, source_code_url, live_url, images, featured, category, year')
    .eq('slug', c.req.param('slug'))
    .single()
  if (error || !data) return c.json({ error: 'Project not found' }, 404)
  return c.json({
    ...data,
    category: data.category === 'it_systems' ? 'network' : data.category,
  })
})

portfolio.get('/skills', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('skills')
    .select('id, name, order_index')
    .order('order_index')
  if (error) return c.json({ error: 'Failed to fetch skills' }, 500)
  return c.json(data)
})

portfolio.get('/currently_using', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('currently_using')
    .select('id, name, icon_url, order_index')
    .order('order_index')
  if (error) return c.json({ error: 'Failed to fetch currently using items' }, 500)
  return c.json(data)
})

portfolio.get('/stacks', async (c) => {
  const { data, error } = await getSupabase(c.env)
    .from('stacks')
    .select('id, name, category, icon_url, order_index')
    .order('order_index')
  if (error) return c.json({ error: 'Failed to fetch stacks' }, 500)
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

portfolio.get('/resume', async (c) => {
  const supabase = getSupabase(c.env)
  const { data: listed, error: listError } = await supabase.storage
    .from(RESUME_BUCKET)
    .list('resume', { search: 'resume.pdf', limit: 10 })

  // If storage bucket is missing/not ready, fall back to local static resume.
  if (listError) return c.json({ url: '/resume.pdf', hasCustom: false })

  const hasCustom = (listed ?? []).some((f) => f.name === 'resume.pdf')
  if (!hasCustom) return c.json({ url: '/resume.pdf', hasCustom: false })

  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(RESUME_PATH)
  return c.json({ url: data.publicUrl, hasCustom: true })
})

export default portfolio
