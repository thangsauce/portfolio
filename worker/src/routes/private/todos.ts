import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSupabase } from '../../lib/supabase'
import type { Env, Variables } from '../../index'

const todos = new Hono<{ Bindings: Env; Variables: Variables }>()

const todoBody = z.object({
  title:    z.string().min(1).max(500),
  status:   z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().nullable().optional(),
})

const TODO_TABLE_CANDIDATES = ['todos', 'todo_items'] as const

async function withTodoTable<T>(
  c: { env: Env },
  run: (table: string) => Promise<{ data: T | null; error: { message: string } | null }>
) {
  let lastError: string | null = null
  for (const table of TODO_TABLE_CANDIDATES) {
    const { data, error } = await run(table)
    if (!error) return { data, error: null }
    lastError = error.message
  }
  return { data: null, error: { message: lastError ?? 'Todos table unavailable' } }
}

// List all todos
todos.get('/', async (c) => {
  const supabase = getSupabase(c.env) as any
  const { data, error } = await withTodoTable(c, (table) =>
    supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
  )
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

// Create todo
todos.post('/', zValidator('json', todoBody), async (c) => {
  const body = c.req.valid('json')
  const userId = c.get('userId')
  const supabase = getSupabase(c.env) as any

  // Be tolerant across schema drift in production by falling back
  // to progressively smaller insert payloads.
  const candidates: Array<Record<string, unknown>> = [
    { ...body, user_id: userId },
    body,
    { title: body.title, status: body.status, user_id: userId },
    { title: body.title, status: body.status },
    { title: body.title, user_id: userId },
    { title: body.title },
  ]

  let lastError: string | null = null
  for (const table of TODO_TABLE_CANDIDATES) {
    for (const payload of candidates) {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single()
      if (!error) return c.json(data, 201)
      lastError = error.message
    }
  }

  return c.json({ error: lastError ?? 'Failed to create todo' }, 500)
})

// Update todo
todos.put('/:id', zValidator('json', todoBody.partial()), async (c) => {
  const body = c.req.valid('json')
  const supabase = getSupabase(c.env) as any
  const { data, error } = await withTodoTable(c, (table) =>
    supabase
      .from(table)
      .update(body)
      .eq('id', c.req.param('id'))
      .select()
      .single()
  )
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Delete todo
todos.delete('/:id', async (c) => {
  const supabase = getSupabase(c.env) as any
  const { error } = await withTodoTable(c, (table) =>
    supabase
      .from(table)
      .delete()
      .eq('id', c.req.param('id'))
  )
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

export default todos
