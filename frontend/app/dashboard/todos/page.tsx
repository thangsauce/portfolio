'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { apiPrivate } from '@/lib/api'

type Status = 'todo' | 'in_progress' | 'done'
type Priority = 'low' | 'medium' | 'high'

type Todo = {
  id: string
  title: string
  status: Status
  priority: Priority
  due_date: string | null
  created_at: string
  updated_at: string
}

const STATUSES: Status[] = ['todo', 'in_progress', 'done']

const COL_CONFIG: Record<
  Status,
  {
    label: string
    addColor: string
    addHoverColor: string
    headerColor: string
    borderColor: string
    panelTint: string
    dropBorderColor: string
  }
> = {
  todo: {
    label: 'Todo',
    addColor: 'hsl(var(--dash-fg-muted))',
    addHoverColor: 'hsl(var(--dash-fg))',
    headerColor: 'hsl(0 70% 58%)',
    borderColor: 'hsl(0 70% 58% / 0.35)',
    panelTint: 'hsl(0 70% 58% / 0.06)',
    dropBorderColor: 'hsl(0 70% 58% / 0.75)',
  },
  in_progress: {
    label: 'In Progress',
    addColor: 'hsl(var(--dash-fg-muted))',
    addHoverColor: 'hsl(var(--dash-fg))',
    headerColor: 'hsl(212 88% 58%)',
    borderColor: 'hsl(212 88% 58% / 0.35)',
    panelTint: 'hsl(212 88% 58% / 0.06)',
    dropBorderColor: 'hsl(212 88% 58% / 0.75)',
  },
  done: {
    label: 'Done',
    addColor: 'hsl(var(--dash-fg-muted))',
    addHoverColor: 'hsl(var(--dash-fg))',
    headerColor: 'hsl(150 70% 42%)',
    borderColor: 'hsl(150 70% 42% / 0.35)',
    panelTint: 'hsl(150 70% 42% / 0.06)',
    dropBorderColor: 'hsl(150 70% 42% / 0.75)',
  },
}

const PRIORITY_COLOR: Record<Priority, string> = {
  low: 'hsl(200 60% 45%)',
  medium: 'hsl(45 80% 48%)',
  high: 'hsl(0 62% 52%)',
}

const sv = {
  width: 11,
  height: 11,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.8',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  style: { display: 'block' as const },
}

function IcTrash() {
  return (
    <svg {...sv}>
      <polyline points="2,5 14,5" />
      <path d="M5 5V3h6v2" />
      <path d="M4 5l1 9h6l1-9" />
    </svg>
  )
}

function nextPriority(p: Priority): Priority {
  return p === 'low' ? 'medium' : p === 'medium' ? 'high' : 'low'
}

function isOverdue(due: string | null, done: boolean): boolean {
  if (!due || done) return false
  return new Date(due) < new Date(new Date().toDateString())
}

function formatDateTime(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function InlineAdd({
  onSubmit,
  onCancel,
}: {
  onSubmit: (t: string) => Promise<void>
  onCancel: () => void
}) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  async function submit() {
    const t = value.trim()
    if (t) await onSubmit(t)
    else onCancel()
  }

  return (
    <div
      style={{
        background: 'hsl(var(--dash-card))',
        border: '1px solid hsl(var(--dash-border))',
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 6,
      }}
    >
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            void submit()
          }
          if (e.key === 'Escape') onCancel()
        }}
        placeholder="new task..."
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          outline: 'none',
          fontFamily: 'var(--font-roboto-flex)',
          fontSize: 14,
          letterSpacing: '0.03em',
          color: 'hsl(var(--dash-fg))',
          caretColor: 'hsl(158 64% 36%)',
        }}
      />
    </div>
  )
}

function AddCard({
  onClick,
  label,
  color,
}: {
  onClick: () => void
  label: string
  color: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: '1px dashed hsl(var(--dash-border))',
        borderRadius: 8,
        padding: '10px 12px',
        marginTop: 4,
        fontFamily: 'var(--font-roboto-flex)',
        fontSize: 13,
        letterSpacing: '0.02em',
        color,
        cursor: 'pointer',
        transition: 'filter 0.12s, border-color 0.12s, color 0.12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = 'brightness(1.08)'
        e.currentTarget.style.borderColor = 'hsl(var(--dash-fg-dim))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'brightness(1)'
        e.currentTarget.style.borderColor = 'hsl(var(--dash-border))'
      }}
    >
      + {label}
    </button>
  )
}

function TodoCard({
  todo,
  onUpdate,
  onDelete,
  canMoveLeft,
  canMoveRight,
  onDragStart,
  onDragEnd,
}: {
  todo: Todo
  onUpdate: (id: string, patch: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  canMoveLeft: boolean
  canMoveRight: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [editTitle, setEditTitle] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [editingDate, setEditingDate] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editTitle) titleRef.current?.focus()
  }, [editTitle])

  useEffect(() => {
    if (editingDate) dateRef.current?.showPicker?.()
  }, [editingDate])

  useEffect(() => {
    setTitle(todo.title)
  }, [todo.title])

  const done = todo.status === 'done'
  const overdue = isOverdue(todo.due_date, done)

  async function saveTitle() {
    setEditTitle(false)
    const t = title.trim()
    if (!t) {
      setTitle(todo.title)
      return
    }
    if (t !== todo.title) await onUpdate(todo.id, { title: t })
  }

  async function saveDate(e: React.FocusEvent<HTMLInputElement>) {
    setEditingDate(false)
    const val = e.target.value || null
    if (val !== todo.due_date) await onUpdate(todo.id, { due_date: val })
  }

  function moveLeft() {
    const idx = STATUSES.indexOf(todo.status)
    if (idx > 0) void onUpdate(todo.id, { status: STATUSES[idx - 1] })
  }

  function moveRight() {
    const idx = STATUSES.indexOf(todo.status)
    if (idx < STATUSES.length - 1) void onUpdate(todo.id, { status: STATUSES[idx + 1] })
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setConfirmDel(false)
      }}
      draggable
      onDragStart={() => onDragStart(todo.id)}
      onDragEnd={onDragEnd}
      style={{
        background: 'hsl(var(--dash-card))',
        border: `1px solid ${hovered ? 'hsl(var(--dash-fg-dim) / 0.3)' : 'hsl(var(--dash-border))'}`,
        borderRadius: 10,
        padding: '13px 14px',
        marginBottom: 8,
        transition: 'border-color 0.12s, box-shadow 0.12s',
        boxShadow: hovered ? '0 6px 16px hsl(0 0% 0% / 0.12)' : 'none',
        opacity: done ? 0.6 : 1,
        cursor: 'grab',
      }}
    >
      {editTitle ? (
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') titleRef.current?.blur()
            if (e.key === 'Escape') {
              setTitle(todo.title)
              setEditTitle(false)
            }
          }}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-roboto-flex)',
            fontSize: 14,
            letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg))',
            caretColor: 'hsl(158 64% 36%)',
            marginBottom: 8,
          }}
        />
      ) : (
        <div
          onClick={() => setEditTitle(true)}
          style={{
            fontSize: 14,
            letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg-muted))',
            textDecoration: done ? 'line-through' : 'none',
            cursor: 'text',
            marginBottom: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {todo.title}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        {canMoveLeft ? (
          <button
            onClick={moveLeft}
            style={{
              background: 'none',
              border: 'none',
              color: 'hsl(var(--dash-fg-dim))',
              cursor: 'pointer',
              fontSize: 13,
              padding: '0 2px',
            }}
            title="Move left"
          >
            ←
          </button>
        ) : (
          <span style={{ opacity: 0.25, fontSize: 13, color: 'hsl(var(--dash-border))', padding: '0 2px' }}>←</span>
        )}

        {canMoveRight ? (
          <button
            onClick={moveRight}
            style={{
              background: 'none',
              border: 'none',
              color: 'hsl(var(--dash-fg-dim))',
              cursor: 'pointer',
              fontSize: 13,
              padding: '0 2px',
            }}
            title="Move right"
          >
            →
          </button>
        ) : (
          <span style={{ opacity: 0.25, fontSize: 13, color: 'hsl(var(--dash-border))', padding: '0 2px' }}>→</span>
        )}

        <button
          onClick={() => void onUpdate(todo.id, { priority: nextPriority(todo.priority) })}
          title="cycle priority"
          style={{
            fontSize: 12,
            letterSpacing: '0.03em',
            color: PRIORITY_COLOR[todo.priority],
            background: 'none',
            border: `1px solid ${PRIORITY_COLOR[todo.priority]}28`,
            borderRadius: 6,
            padding: '3px 9px',
            cursor: 'pointer',
            fontFamily: 'var(--font-roboto-flex)',
          }}
        >
          {todo.priority === 'low' ? 'Low' : todo.priority === 'medium' ? 'Mid' : 'High'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.02em',
              color: 'hsl(var(--dash-fg-dim))',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Created {formatDateTime(todo.created_at)}
          </span>
          {editingDate ? (
            <input
              ref={dateRef}
              type="date"
              defaultValue={todo.due_date ?? ''}
              onBlur={saveDate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') dateRef.current?.blur()
                if (e.key === 'Escape') setEditingDate(false)
              }}
              style={{
                background: 'hsl(var(--dash-input))',
                border: '1px solid hsl(var(--dash-border))',
                borderRadius: 6,
                color: 'hsl(var(--dash-fg-muted))',
                fontSize: 12,
                padding: '2px 5px',
                outline: 'none',
                fontFamily: 'var(--font-roboto-flex)',
                colorScheme: 'dark',
                width: 120,
              }}
            />
          ) : (
            <button
              onClick={() => setEditingDate(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                textAlign: 'left',
                fontSize: 12,
                letterSpacing: '0.02em',
                color: overdue
                  ? 'hsl(0 62% 52%)'
                  : todo.due_date
                    ? 'hsl(var(--dash-fg-muted))'
                    : 'hsl(var(--dash-border))',
                cursor: 'pointer',
              }}
            >
              {todo.due_date ?? 'No due date'}
            </button>
          )}
        </div>

        {confirmDel ? (
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => void onDelete(todo.id)}
              style={{
                color: 'hsl(0 62% 52%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                padding: 0,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              style={{
                color: 'hsl(var(--dash-fg-dim))',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                padding: 0,
              }}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDel(true)}
            style={{
              color: 'hsl(var(--dash-fg-dim))',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="delete"
          >
            <IcTrash />
          </button>
        )}
      </div>
    </div>
  )
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [addingStatus, setAddingStatus] = useState<Status | null>(null)
  const [draggingTodoId, setDraggingTodoId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null)
  const [activeStatus, setActiveStatus] = useState<Status | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [colWidths, setColWidths] = useState<[number, number, number]>([1, 1, 1])
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    apiPrivate<Todo[]>('/todos')
      .then(setTodos)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const saved = window.localStorage.getItem('dashboard-todos-col-widths')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as number[]
        if (parsed.length === 3 && parsed.every((n) => Number.isFinite(n) && n > 0.2)) {
          setColWidths([parsed[0], parsed[1], parsed[2]])
        }
      } catch {}
    }
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const updateTodo = useCallback(
    async (id: string, patch: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        const updated = await apiPrivate<Todo>(`/todos/${id}`, {
          method: 'PUT',
          body: JSON.stringify(patch),
        })
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
      } catch {}
    },
    []
  )

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await apiPrivate(`/todos/${id}`, { method: 'DELETE' })
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch {}
  }, [])

  const createTodo = useCallback(async (status: Status, title: string) => {
    try {
      setErrorMsg(null)
      const todo = await apiPrivate<Todo>('/todos', {
        method: 'POST',
        body: JSON.stringify({
          title,
          status,
          priority: 'medium',
          due_date: null,
        }),
      })
      setTodos((prev) => [todo, ...prev])
    } catch (err) {
      // Fallback for stricter schemas that only allow default creation state.
      try {
        const todo = await apiPrivate<Todo>('/todos', {
          method: 'POST',
          body: JSON.stringify({
            title,
            status: 'todo',
            priority: 'medium',
            due_date: null,
          }),
        })
        setTodos((prev) => [todo, ...prev])
        if (status !== 'todo') {
          const moved = await apiPrivate<Todo>(`/todos/${todo.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
          })
          setTodos((prev) => prev.map((t) => (t.id === moved.id ? moved : t)))
        }
      } catch (fallbackErr) {
        const msg = fallbackErr instanceof Error ? fallbackErr.message : (err instanceof Error ? err.message : 'Unable to add todo')
        setErrorMsg(msg)
      }
    }
  }, [])

  function beginResize(handleIndex: number, e: React.MouseEvent<HTMLDivElement>) {
    if (!isDesktop) return
    e.preventDefault()
    const startX = e.clientX
    const start = [...colWidths] as [number, number, number]
    const pairTotal = start[handleIndex] + start[handleIndex + 1]
    const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 1
    const minWidth = 0.6

    const onMove = (ev: MouseEvent) => {
      const deltaFr = ((ev.clientX - startX) / containerWidth) * 3
      const left = Math.max(minWidth, Math.min(pairTotal - minWidth, start[handleIndex] + deltaFr))
      const right = pairTotal - left
      setColWidths((prev) => {
        const next = [...prev] as [number, number, number]
        next[handleIndex] = left
        next[handleIndex + 1] = right
        return next
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.localStorage.setItem('dashboard-todos-col-widths', JSON.stringify(colWidths))
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1040, margin: '0 auto', fontSize: 13, color: 'hsl(var(--dash-fg-dim))' }}>
        Loading...
      </div>
    )
  }

  function renderColumn(status: Status) {
    const config = COL_CONFIG[status]
    const q = search.trim().toLowerCase()
    const items = todos.filter((t) => {
      if (t.status !== status) return false
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q) ||
        (t.due_date ?? '').toLowerCase().includes(q)
      )
    })
    const isActive = activeStatus === status
    const hasActive = activeStatus !== null

    return (
      <section
        key={status}
        onMouseEnter={() => setActiveStatus(status)}
        onClick={() => setActiveStatus(status)}
        onDragOver={(e) => {
          e.preventDefault()
          if (dragOverStatus !== status) setDragOverStatus(status)
        }}
        onDragLeave={() => {
          if (dragOverStatus === status) setDragOverStatus(null)
        }}
        onDrop={() => {
          if (!draggingTodoId) return
          const dragged = todos.find((t) => t.id === draggingTodoId)
          if (dragged && dragged.status !== status) {
            void updateTodo(dragged.id, { status })
          }
          setDraggingTodoId(null)
          setDragOverStatus(null)
        }}
        style={{
          background: `linear-gradient(180deg, ${config.panelTint}, hsl(var(--dash-panel)))`,
          border:
            dragOverStatus === status
              ? `1px solid ${config.dropBorderColor}`
              : `1px solid ${config.borderColor}`,
          borderRadius: 10,
          padding: '14px 12px 12px',
          minHeight: 220,
          transform: hasActive ? (isActive ? 'scale(1.03)' : 'scale(0.965)') : 'scale(1)',
          opacity: hasActive ? (isActive ? 1 : 0.58) : 1,
          filter: hasActive ? (isActive ? 'none' : 'saturate(0.75)') : 'none',
          transition: 'transform 220ms ease, opacity 220ms ease, filter 220ms ease, border-color 160ms ease',
          zIndex: isActive ? 2 : 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            padding: '0 2px',
          }}
        >
          <span
            style={{
              fontSize: 14,
              letterSpacing: '0.02em',
              color: config.headerColor,
            }}
          >
            {config.label}
          </span>
          <span
            style={{
              fontSize: 12,
              letterSpacing: '0.02em',
              color: 'hsl(var(--dash-fg-dim))',
            }}
          >
            {items.length}
          </span>
        </div>

        <div
          style={{
            maxHeight: 360,
            overflowY: 'auto',
            paddingRight: 2,
            marginBottom: 8,
          }}
        >
          {items.map((todo) => {
            const idx = STATUSES.indexOf(todo.status)
            return (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
                canMoveLeft={idx > 0}
                canMoveRight={idx < STATUSES.length - 1}
                onDragStart={(id) => setDraggingTodoId(id)}
                onDragEnd={() => {
                  setDraggingTodoId(null)
                  setDragOverStatus(null)
                }}
              />
            )
          })}
          {items.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: 'hsl(var(--dash-fg-dim))',
                padding: '6px 4px 10px',
              }}
            >
              No matching tasks
            </div>
          )}
        </div>

        {addingStatus === status ? (
          <InlineAdd
            onSubmit={async (title) => {
              await createTodo(status, title)
              setAddingStatus(null)
            }}
            onCancel={() => setAddingStatus(null)}
          />
        ) : (
          <AddCard
            onClick={() => setAddingStatus(status)}
            label="New"
            color={config.addColor}
          />
        )}

        <style jsx>{`
          section button:hover {
            color: ${config.addHoverColor};
          }
        `}</style>
      </section>
    )
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {errorMsg && (
        <div
          style={{
            marginBottom: 10,
            fontSize: 12,
            color: 'hsl(0 72% 58%)',
            background: 'hsl(0 72% 58% / 0.08)',
            border: '1px solid hsl(0 72% 58% / 0.28)',
            borderRadius: 8,
            padding: '8px 10px',
          }}
        >
          {errorMsg}
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search todos..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '9px 11px',
            background: 'hsl(var(--dash-input))',
            border: '1px solid hsl(var(--dash-border))',
            color: 'hsl(var(--dash-fg))',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'var(--font-roboto-flex)',
            borderRadius: 8,
          }}
        />
      </div>
      {isDesktop ? (
        <div ref={containerRef} style={{ display: 'flex', alignItems: 'stretch' }} onMouseLeave={() => setActiveStatus(null)}>
          {STATUSES.map((status, idx) => (
            <Fragment key={status}>
              <div style={{ flex: `${colWidths[idx]} 1 0`, minWidth: 260, paddingRight: idx < STATUSES.length - 1 ? 8 : 0 }}>
                {renderColumn(status)}
              </div>
              {idx < STATUSES.length - 1 && (
                <div
                  onMouseDown={(e) => beginResize(idx, e)}
                  style={{
                    width: 12,
                    cursor: 'col-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ width: 2, height: '38%', borderRadius: 999, background: 'hsl(var(--dash-border))' }} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            alignItems: 'start',
          }}
          onMouseLeave={() => setActiveStatus(null)}
        >
          {STATUSES.map((status) => (
            <div key={status}>{renderColumn(status)}</div>
          ))}
        </div>
      )}
    </div>
  )
}
