'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { apiPrivate } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type Status   = 'todo' | 'in_progress' | 'done'
type Priority = 'low' | 'medium' | 'high'
type FilterTab = 'all' | Status

type Todo = {
  id: string
  title: string
  status: Status
  priority: Priority
  due_date: string | null
  created_at: string
  updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nextStatus(s: Status): Status {
  return s === 'todo' ? 'in_progress' : s === 'in_progress' ? 'done' : 'todo'
}
function nextPriority(p: Priority): Priority {
  return p === 'low' ? 'medium' : p === 'medium' ? 'high' : 'low'
}
function isOverdue(due: string | null, done: boolean): boolean {
  if (!due || done) return false
  return new Date(due) < new Date(new Date().toDateString())
}

const PRIORITY_COLOR: Record<Priority, string> = {
  low:    'hsl(200 60% 45%)',
  medium: 'hsl(45 80% 48%)',
  high:   'hsl(0 62% 52%)',
}
const STATUS_GLYPH: Record<Status, string> = {
  todo:        '[ ]',
  in_progress: '[~]',
  done:        '[✓]',
}
const STATUS_COLOR: Record<Status, string> = {
  todo:        'hsl(0 0% 30%)',
  in_progress: 'hsl(158 64% 42%)',
  done:        'hsl(0 0% 22%)',
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const sv = {
  width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none',
  stroke: 'currentColor', strokeWidth: '1.5',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  style: { display: 'block' as const },
}
function IcTrash() { return <svg {...sv}><polyline points="2,5 14,5"/><path d="M5 5V3h6v2"/><path d="M4 5l1 9h6l1-9"/></svg> }
function IcPlus()  { return <svg {...sv}><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg> }

// ─── Todo Row ─────────────────────────────────────────────────────────────────
function TodoRow({
  todo,
  onUpdate,
  onDelete,
  autoFocus,
}: {
  todo: Todo
  onUpdate: (id: string, patch: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  autoFocus?: boolean
}) {
  const [title,      setTitle]      = useState(todo.title)
  const [editing,    setEditing]    = useState(autoFocus ?? false)
  const [editingDate, setEditingDate] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [hovered,    setHovered]    = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dateRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [autoFocus])

  useEffect(() => {
    if (editingDate && dateRef.current) dateRef.current.showPicker?.()
  }, [editingDate])

  // Keep local title in sync if todo updates externally
  useEffect(() => { setTitle(todo.title) }, [todo.title])

  const isDone   = todo.status === 'done'
  const overdue  = isOverdue(todo.due_date, isDone)

  async function handleTitleBlur() {
    setEditing(false)
    const trimmed = title.trim()
    if (!trimmed) { setTitle(todo.title); return }
    if (trimmed !== todo.title) await onUpdate(todo.id, { title: trimmed })
  }

  async function handleDateBlur(e: React.FocusEvent<HTMLInputElement>) {
    setEditingDate(false)
    const val = e.target.value || null
    if (val !== todo.due_date) await onUpdate(todo.id, { due_date: val })
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDel(false) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 0',
        borderBottom: '1px solid hsl(0 0% 11%)',
        opacity: isDone ? 0.38 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Status glyph */}
      <button
        onClick={() => onUpdate(todo.id, { status: nextStatus(todo.status) })}
        title="cycle status"
        style={{
          fontFamily: 'monospace',
          fontSize: 11, letterSpacing: '0.02em',
          color: STATUS_COLOR[todo.status],
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, flexShrink: 0, userSelect: 'none',
          transition: 'color 0.12s',
          minWidth: 30,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'hsl(158 64% 52%)'}
        onMouseLeave={e => e.currentTarget.style.color = STATUS_COLOR[todo.status]}
      >
        {STATUS_GLYPH[todo.status]}
      </button>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') inputRef.current?.blur()
              if (e.key === 'Escape') { setTitle(todo.title); setEditing(false) }
            }}
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-roboto-flex)',
              fontSize: 12, letterSpacing: '0.03em',
              color: 'hsl(0 0% 84%)',
              caretColor: 'hsl(158 64% 36%)',
            }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            style={{
              fontSize: 12, letterSpacing: '0.03em',
              color: isDone ? 'hsl(0 0% 32%)' : 'hsl(0 0% 70%)',
              textDecoration: isDone ? 'line-through' : 'none',
              textDecorationColor: 'hsl(0 0% 28%)',
              cursor: 'text',
              display: 'block',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {todo.title}
          </span>
        )}
      </div>

      {/* Priority badge */}
      <button
        onClick={() => onUpdate(todo.id, { priority: nextPriority(todo.priority) })}
        title="cycle priority"
        style={{
          fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: PRIORITY_COLOR[todo.priority],
          background: 'none',
          border: `1px solid ${PRIORITY_COLOR[todo.priority]}28`,
          padding: '2px 7px', cursor: 'pointer', flexShrink: 0,
          fontFamily: 'var(--font-roboto-flex)',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = `${PRIORITY_COLOR[todo.priority]}80`}
        onMouseLeave={e => e.currentTarget.style.borderColor = `${PRIORITY_COLOR[todo.priority]}28`}
      >
        {todo.priority === 'low' ? 'lo' : todo.priority === 'medium' ? 'md' : 'hi'}
      </button>

      {/* Due date */}
      <div style={{ flexShrink: 0, minWidth: 76, textAlign: 'right' }}>
        {editingDate ? (
          <input
            ref={dateRef}
            type="date"
            defaultValue={todo.due_date ?? ''}
            onBlur={handleDateBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') dateRef.current?.blur()
              if (e.key === 'Escape') setEditingDate(false)
            }}
            style={{
              background: 'hsl(0 0% 7%)',
              border: '1px solid hsl(0 0% 22%)',
              color: 'hsl(0 0% 60%)', fontSize: 10,
              padding: '2px 5px', outline: 'none',
              fontFamily: 'var(--font-roboto-flex)',
              colorScheme: 'dark', width: 110,
            }}
          />
        ) : (
          <span
            onClick={() => setEditingDate(true)}
            style={{
              fontSize: 10, letterSpacing: '0.08em',
              color: overdue ? 'hsl(0 62% 52%)' : todo.due_date ? 'hsl(0 0% 34%)' : 'hsl(0 0% 20%)',
              cursor: 'pointer', display: 'inline-block',
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'hsl(0 0% 52%)'}
            onMouseLeave={e => e.currentTarget.style.color = overdue ? 'hsl(0 62% 52%)' : todo.due_date ? 'hsl(0 0% 34%)' : 'hsl(0 0% 20%)'}
          >
            {todo.due_date ?? '—'}
          </span>
        )}
      </div>

      {/* Delete */}
      <div style={{ flexShrink: 0, width: 44, display: 'flex', justifyContent: 'flex-end' }}>
        {confirmDel ? (
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => onDelete(todo.id)}
              style={{ color: 'hsl(0 62% 52%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, letterSpacing: '0.12em', padding: 0, fontFamily: 'var(--font-roboto-flex)' }}
            >
              rm
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              style={{ color: 'hsl(0 0% 28%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, letterSpacing: '0.12em', padding: 0, fontFamily: 'var(--font-roboto-flex)' }}
            >
              no
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDel(true)}
            style={{
              color: 'hsl(0 0% 28%)', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, display: 'flex',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.12s, color 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'hsl(0 62% 52%)'}
            onMouseLeave={e => e.currentTarget.style.color = 'hsl(0 0% 28%)'}
          >
            <IcTrash />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TodosPage() {
  const [todos,    setTodos]    = useState<Todo[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<FilterTab>('all')
  const [creating, setCreating] = useState(false)
  const [newId,    setNewId]    = useState<string | null>(null)

  useEffect(() => {
    apiPrivate<Todo[]>('/todos')
      .then(setTodos)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function createTodo() {
    setCreating(true)
    try {
      const todo = await apiPrivate<Todo>('/todos', {
        method: 'POST',
        body: JSON.stringify({ title: 'untitled', status: 'todo', priority: 'medium' }),
      })
      setTodos(prev => [todo, ...prev])
      setNewId(todo.id)
      setFilter('all')
    } catch {}
    setCreating(false)
  }

  const updateTodo = useCallback(async (
    id: string,
    patch: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at'>>,
  ) => {
    try {
      const updated = await apiPrivate<Todo>(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      })
      setTodos(prev => prev.map(t => t.id === id ? updated : t))
    } catch {}
  }, [])

  async function deleteTodo(id: string) {
    try {
      await apiPrivate(`/todos/${id}`, { method: 'DELETE' })
      setTodos(prev => prev.filter(t => t.id !== id))
      if (newId === id) setNewId(null)
    } catch {}
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',         label: 'all'         },
    { key: 'todo',        label: 'todo'        },
    { key: 'in_progress', label: 'in progress' },
    { key: 'done',        label: 'done'        },
  ]

  const counts: Record<FilterTab, number> = {
    all:         todos.length,
    todo:        todos.filter(t => t.status === 'todo').length,
    in_progress: todos.filter(t => t.status === 'in_progress').length,
    done:        todos.filter(t => t.status === 'done').length,
  }

  const filtered = filter === 'all' ? todos : todos.filter(t => t.status === filter)

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'hsl(0 0% 26%)' }}>
            // todos
          </span>
          {counts.todo > 0 && (
            <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.12em', color: 'hsl(158 64% 36%)' }}>
              {counts.todo} pending
            </span>
          )}
        </div>

        <button
          onClick={createTodo}
          disabled={creating}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 10, letterSpacing: '0.18em',
            color: creating ? 'hsl(0 0% 28%)' : 'hsl(158 64% 42%)',
            background: 'none', border: 'none',
            cursor: creating ? 'not-allowed' : 'pointer',
            padding: 0, transition: 'color 0.12s',
            fontFamily: 'var(--font-roboto-flex)',
          }}
          onMouseEnter={e => { if (!creating) e.currentTarget.style.color = 'hsl(158 64% 60%)' }}
          onMouseLeave={e => { if (!creating) e.currentTarget.style.color = 'hsl(158 64% 42%)' }}
        >
          <IcPlus /> new
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderBottom: '1px solid hsl(0 0% 14%)' }}>
        {TABS.map(({ key, label }) => {
          const active = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: active ? 'hsl(158 64% 52%)' : 'hsl(0 0% 28%)',
                background: 'none', border: 'none',
                borderBottom: `1px solid ${active ? 'hsl(158 64% 36%)' : 'transparent'}`,
                padding: '6px 12px 7px',
                cursor: 'pointer', transition: 'color 0.12s',
                marginBottom: -1,
                fontFamily: 'var(--font-roboto-flex)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'hsl(0 0% 48%)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'hsl(0 0% 28%)' }}
            >
              {label}
              <span style={{ marginLeft: 6, color: active ? 'hsl(158 64% 36%)' : 'hsl(0 0% 20%)' }}>
                {counts[key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 0 8px',
        fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
        color: 'hsl(0 0% 20%)',
        borderBottom: '1px solid hsl(0 0% 13%)',
      }}>
        <span style={{ minWidth: 30 }}>st</span>
        <span style={{ flex: 1 }}>task</span>
        <span>pri</span>
        <span style={{ minWidth: 76, textAlign: 'right' }}>due</span>
        <span style={{ width: 44 }} />
      </div>

      {/* List */}
      {loading && (
        <div style={{ padding: '20px 0', fontSize: 9, letterSpacing: '0.25em', color: 'hsl(0 0% 22%)', textTransform: 'uppercase' }}>
          // loading...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: '20px 0', fontSize: 9, letterSpacing: '0.25em', color: 'hsl(0 0% 22%)', textTransform: 'uppercase' }}>
          // {filter === 'all' ? 'no todos yet' : `no ${filter.replace('_', ' ')} todos`}
        </div>
      )}

      {filtered.map(todo => (
        <TodoRow
          key={todo.id}
          todo={todo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          autoFocus={todo.id === newId}
        />
      ))}
    </div>
  )
}
