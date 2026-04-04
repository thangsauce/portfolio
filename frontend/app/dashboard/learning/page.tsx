'use client'

import { Fragment, useState, useEffect, useRef, useCallback } from 'react'
import { apiPrivate } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type LStatus = 'to_learn' | 'learning' | 'learned'
type LearningItem = {
  id: string
  title: string
  status: LStatus
  category: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUSES: LStatus[] = ['to_learn', 'learning', 'learned']

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

const COL_CONFIG: Record<
  LStatus,
  { label: string; headerColor: string; bg: string; countColor: string; addColor: string; addHoverColor: string; dropColor: string }
> = {
  to_learn: {
    label:       'Lesson',
    headerColor: 'hsl(0 72% 58%)',
    bg:          'hsl(0 72% 58% / 0.06)',
    countColor:  'hsl(0 72% 58% / 0.9)',
    addColor:    'hsl(0 72% 58% / 0.85)',
    addHoverColor:'hsl(0 80% 62%)',
    dropColor:   'hsl(0 72% 58% / 0.7)',
  },
  learning: {
    label:       'Learning',
    headerColor: 'hsl(212 90% 58%)',
    bg:          'hsl(212 90% 58% / 0.06)',
    countColor:  'hsl(212 90% 58% / 0.9)',
    addColor:    'hsl(212 90% 58% / 0.85)',
    addHoverColor:'hsl(212 96% 64%)',
    dropColor:   'hsl(212 90% 58% / 0.7)',
  },
  learned: {
    label:       'Learned',
    headerColor: 'hsl(145 68% 42%)',
    bg:          'hsl(145 68% 42% / 0.06)',
    countColor:  'hsl(145 68% 42% / 0.9)',
    addColor:    'hsl(145 68% 42% / 0.85)',
    addHoverColor:'hsl(145 74% 48%)',
    dropColor:   'hsl(145 68% 42% / 0.7)',
  },
}

// ─── Icon ─────────────────────────────────────────────────────────────────────
const sv = {
  width: 11, height: 11, viewBox: '0 0 16 16', fill: 'none',
  stroke: 'currentColor', strokeWidth: '1.8',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  style: { display: 'block' as const },
}
function IcTrash() { return <svg {...sv}><polyline points="2,5 14,5"/><path d="M5 5V3h6v2"/><path d="M4 5l1 9h6l1-9"/></svg> }

// ─── Inline Add ───────────────────────────────────────────────────────────────
function InlineAdd({
  onSubmit, onCancel, accentColor,
}: {
  onSubmit: (t: string) => Promise<void>
  onCancel: () => void
  accentColor?: string
}) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  async function handleBlur() {
    const t = value.trim()
    if (t) await onSubmit(t)
    else onCancel()
  }

  return (
    <div style={{
      background: 'hsl(var(--dash-card))',
      border: `1px solid ${accentColor ?? 'hsl(158 64% 36% / 0.35)'}`,
      borderRadius: 8,
      padding: '10px 12px', marginBottom: 6,
    }}>
      <input
        ref={ref}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => { if (e.key === 'Enter') ref.current?.blur(); if (e.key === 'Escape') onCancel() }}
        placeholder="what to learn..."
        style={{
          width: '100%', background: 'none', border: 'none', outline: 'none',
          fontFamily: 'var(--font-roboto-flex)',
          fontSize: 14, letterSpacing: '0.03em',
          color: 'hsl(var(--dash-fg))',
          caretColor: 'hsl(158 64% 36%)',
        }}
      />
    </div>
  )
}

function AddCard({
  onClick, label, color,
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
        color: 'hsl(var(--dash-fg-muted))',
        cursor: 'pointer',
        transition: 'filter 0.12s, border-color 0.12s, color 0.12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.filter = 'brightness(1.08)'
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.color = color
      }}
      onMouseLeave={e => {
        e.currentTarget.style.filter = 'brightness(1)'
        e.currentTarget.style.borderColor = 'hsl(var(--dash-border))'
        e.currentTarget.style.color = 'hsl(var(--dash-fg-muted))'
      }}
    >
      + {label}
    </button>
  )
}

// ─── Learning Card ────────────────────────────────────────────────────────────
function LearningCard({
  item, onUpdate, onDelete, canMoveLeft, canMoveRight, onDragStart, onDragEnd,
}: {
  item: LearningItem
  onUpdate: (id: string, patch: Partial<LearningItem>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  canMoveLeft: boolean
  canMoveRight: boolean
  onDragStart: (item: LearningItem) => void
  onDragEnd: () => void
}) {
  const [hovered,    setHovered]    = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [editTitle,  setEditTitle]  = useState(false)
  const [title,      setTitle]      = useState(item.title)
  const [editCat,    setEditCat]    = useState(false)
  const [category,   setCategory]   = useState(item.category ?? '')
  const [editNotes,  setEditNotes]  = useState(false)
  const [notes,      setNotes]      = useState(item.notes ?? '')

  const titleRef = useRef<HTMLInputElement>(null)
  const catRef   = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (editTitle && titleRef.current) titleRef.current.focus() }, [editTitle])
  useEffect(() => { if (editCat   && catRef.current)   catRef.current.focus()   }, [editCat])
  useEffect(() => { if (editNotes && notesRef.current) notesRef.current.focus() }, [editNotes])

  useEffect(() => { setTitle(item.title)            }, [item.title])
  useEffect(() => { setCategory(item.category ?? '') }, [item.category])
  useEffect(() => { setNotes(item.notes ?? '')       }, [item.notes])

  async function saveTitle() {
    setEditTitle(false)
    const t = title.trim()
    if (!t) { setTitle(item.title); return }
    if (t !== item.title) await onUpdate(item.id, { title: t })
  }

  async function saveCategory() {
    setEditCat(false)
    const c = category.trim() || null
    if (c !== item.category) await onUpdate(item.id, { category: c })
  }

  async function saveNotes() {
    setEditNotes(false)
    const n = notes.trim() || null
    if (n !== item.notes) await onUpdate(item.id, { notes: n })
  }

  function moveLeft() {
    const idx = STATUSES.indexOf(item.status)
    if (idx > 0) onUpdate(item.id, { status: STATUSES[idx - 1] })
  }
  function moveRight() {
    const idx = STATUSES.indexOf(item.status)
    if (idx < STATUSES.length - 1) onUpdate(item.id, { status: STATUSES[idx + 1] })
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDel(false) }}
      draggable
      onDragStart={() => onDragStart(item)}
      onDragEnd={onDragEnd}
      style={{
        background: 'hsl(var(--dash-card))',
        border: `1px solid ${hovered ? 'hsl(var(--dash-fg-dim) / 0.3)' : 'hsl(var(--dash-border))'}`,
        borderRadius: 10,
        padding: '13px 14px', marginBottom: 8,
        transition: 'border-color 0.12s, box-shadow 0.12s',
        boxShadow: hovered ? '0 6px 16px hsl(0 0% 0% / 0.12)' : 'none',
        cursor: 'grab',
      }}
    >
      {/* Title */}
      {editTitle ? (
        <input
          ref={titleRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={e => { if (e.key === 'Enter') titleRef.current?.blur(); if (e.key === 'Escape') { setTitle(item.title); setEditTitle(false) } }}
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            fontFamily: 'var(--font-roboto-flex)',
            fontSize: 14, letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg))',
            caretColor: 'hsl(158 64% 36%)', marginBottom: 6,
          }}
        />
      ) : (
        <div
          onClick={() => setEditTitle(true)}
          style={{
            fontSize: 14, letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg-muted))',
            cursor: 'text', marginBottom: 6,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </div>
      )}

      {/* Category */}
      {editCat ? (
        <input
          ref={catRef}
          value={category}
          onChange={e => setCategory(e.target.value)}
          onBlur={saveCategory}
          onKeyDown={e => { if (e.key === 'Enter') catRef.current?.blur(); if (e.key === 'Escape') { setCategory(item.category ?? ''); setEditCat(false) } }}
          placeholder="category..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            fontFamily: 'var(--font-roboto-flex)',
            fontSize: 11, letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg))',
            caretColor: 'hsl(158 64% 36%)', marginBottom: 6, width: '100%',
          }}
        />
      ) : (
        <div
          onClick={() => setEditCat(true)}
          style={{
            fontSize: 11, letterSpacing: '0.03em',
            color: item.category ? 'hsl(var(--dash-fg))' : 'hsl(var(--dash-fg-muted))',
            cursor: 'text', marginBottom: 6,
          }}
        >
          {item.category ?? '+ category'}
        </div>
      )}

      {/* Notes */}
      {editNotes ? (
        <textarea
          ref={notesRef}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={saveNotes}
          onKeyDown={e => { if (e.key === 'Escape') { setNotes(item.notes ?? ''); setEditNotes(false) } }}
          placeholder="notes..."
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'hsl(var(--dash-input))',
            border: '1px solid hsl(var(--dash-border))',
            borderRadius: 8,
            outline: 'none', resize: 'none',
            fontFamily: 'var(--font-roboto-flex)',
            fontSize: 12, letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg))',
            caretColor: 'hsl(158 64% 36%)', padding: '5px 7px',
            marginBottom: 8,
          }}
        />
      ) : item.notes ? (
        <div
          onClick={() => setEditNotes(true)}
          style={{
            fontSize: 12, letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg-muted))',
            cursor: 'text', marginBottom: 8, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          } as React.CSSProperties}
        >
          {item.notes}
        </div>
      ) : (
        <div
          onClick={() => setEditNotes(true)}
          style={{
            fontSize: 11, letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg-muted))',
            cursor: 'text', marginBottom: 8,
          }}
        >
          + notes
        </div>
      )}

      {/* Footer: arrows + delete */}
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.02em',
          color: 'hsl(var(--dash-fg-dim))',
          marginBottom: 7,
        }}
      >
        Created {formatDateTime(item.created_at)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {canMoveLeft && (
            <button
              onClick={moveLeft}
              style={{
                fontSize: 13,
                color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none',
                cursor: 'pointer', padding: '0 4px', transition: 'color 0.1s',
                borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'hsl(158 64% 42%)'}
              onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--dash-fg-dim))'}
            >
              ←
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={moveRight}
              style={{
                fontSize: 13,
                color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none',
                cursor: 'pointer', padding: '0 4px', transition: 'color 0.1s',
                borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'hsl(158 64% 42%)'}
              onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--dash-fg-dim))'}
            >
              →
            </button>
          )}
        </div>

        <div>
          {confirmDel ? (
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => onDelete(item.id)}
                style={{
                  color: 'hsl(0 62% 52%)', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12, letterSpacing: '0.03em',
                  padding: 0, fontFamily: 'var(--font-roboto-flex)', borderRadius: 4,
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                style={{
                  color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12, letterSpacing: '0.03em',
                  padding: 0, fontFamily: 'var(--font-roboto-flex)', borderRadius: 4,
                }}
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              style={{
                color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, display: 'flex',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.12s, color 0.12s',
                borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'hsl(0 62% 52%)'}
              onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--dash-fg-dim))'}
            >
              <IcTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LearningPage() {
  const [items,    setItems]    = useState<LearningItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [addingTo, setAddingTo] = useState<LStatus | null>(null)
  const [draggingItem, setDraggingItem] = useState<LearningItem | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<LStatus | null>(null)
  const [activeStatus, setActiveStatus] = useState<LStatus | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [colWidths, setColWidths] = useState<[number, number, number]>([1, 1, 1])
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    apiPrivate<LearningItem[]>('/learning')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const saved = window.localStorage.getItem('dashboard-learning-col-widths')
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

  async function createItem(status: LStatus, title: string) {
    try {
      const item = await apiPrivate<LearningItem>('/learning', {
        method: 'POST',
        body: JSON.stringify({ title, status }),
      })
      setItems(prev => [...prev, item])
    } catch {}
    setAddingTo(null)
  }

  const updateItem = useCallback(async (id: string, patch: Partial<LearningItem>) => {
    try {
      const updated = await apiPrivate<LearningItem>(`/learning/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      })
      setItems(prev => prev.map(i => i.id === id ? updated : i))
    } catch {}
  }, [])

  async function deleteItem(id: string) {
    try {
      await apiPrivate(`/learning/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {}
  }

  async function moveItemToStatus(item: LearningItem, status: LStatus) {
    if (item.status === status) return
    await updateItem(item.id, { status })
  }

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
      window.localStorage.setItem('dashboard-learning-col-widths', JSON.stringify(colWidths))
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div style={{ position: 'relative', isolation: 'isolate', maxWidth: 1120, margin: '0 auto' }}>
      {loading ? (
        <div style={{ fontSize: 13, color: 'hsl(var(--dash-fg-dim))', position: 'relative', zIndex: 1 }}>
          Loading...
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 12, position: 'relative', zIndex: 1 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search learning..."
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
            <div
              ref={containerRef}
              style={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}
              onMouseLeave={() => setActiveStatus(null)}
            >
              {STATUSES.map((status, colIdx) => (
                <Fragment key={status}>
                  <div style={{ flex: `${colWidths[colIdx]} 1 0`, minWidth: 260, paddingRight: colIdx < STATUSES.length - 1 ? 8 : 0 }}>
                    {renderColumn(status, colIdx)}
                  </div>
                  {colIdx < STATUSES.length - 1 && (
                    <div
                      onMouseDown={(e) => beginResize(colIdx, e)}
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
                position: 'relative',
                zIndex: 1,
              }}
              onMouseLeave={() => setActiveStatus(null)}
            >
              {STATUSES.map((status, colIdx) => (
                <div key={status}>{renderColumn(status, colIdx)}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )

  function renderColumn(status: LStatus, colIdx: number) {
    const conf = COL_CONFIG[status]
    const q = search.trim().toLowerCase()
    const colItems = items.filter(i => {
      if (i.status !== status) return false
      if (!q) return true
      return (
        i.title.toLowerCase().includes(q) ||
        (i.category ?? '').toLowerCase().includes(q) ||
        (i.notes ?? '').toLowerCase().includes(q)
      )
    })
    const isDropTarget = dragOverStatus === status && draggingItem !== null
    const isActive = activeStatus === status
    const hasActive = activeStatus !== null

    return (
      <div
        key={status}
        onMouseEnter={() => setActiveStatus(status)}
        onClick={() => setActiveStatus(status)}
        onDragOver={(e) => {
          if (!draggingItem) return
          e.preventDefault()
          setDragOverStatus(status)
        }}
        onDragLeave={() => {
          if (dragOverStatus === status) setDragOverStatus(null)
        }}
        onDrop={async (e) => {
          e.preventDefault()
          if (draggingItem) await moveItemToStatus(draggingItem, status)
          setDragOverStatus(null)
          setDraggingItem(null)
        }}
        style={{
          background: conf.bg,
          border: '1px solid hsl(var(--dash-border))',
          borderRadius: 12,
          padding: 12,
          outline: isDropTarget ? `1px dashed ${conf.dropColor}` : 'none',
          boxShadow: isDropTarget ? `inset 0 0 0 1px ${conf.dropColor}` : 'none',
          transform: hasActive ? (isActive ? 'scale(1.03)' : 'scale(0.965)') : 'scale(1)',
          opacity: hasActive ? (isActive ? 1 : 0.58) : 1,
          filter: hasActive ? (isActive ? 'none' : 'saturate(0.75)') : 'none',
          transition: 'outline-color 0.12s, box-shadow 0.12s, transform 220ms ease, opacity 220ms ease, filter 220ms ease',
          zIndex: isActive ? 2 : 1,
        }}
      >

        {/* Column header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 14, letterSpacing: '0.01em', color: conf.headerColor, fontFamily: 'var(--font-roboto-flex)', fontWeight: 600 }}>
              {conf.label}
            </span>
            <span style={{ fontSize: 12, color: conf.countColor, fontFamily: 'var(--font-roboto-flex)' }}>
              {colItems.length}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            maxHeight: 360,
            overflowY: 'auto',
            paddingRight: 2,
            marginBottom: 8,
          }}
        >
          {colItems.map(item => (
            <LearningCard
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onDelete={deleteItem}
              canMoveLeft={colIdx > 0}
              canMoveRight={colIdx < STATUSES.length - 1}
              onDragStart={(dragItem) => setDraggingItem(dragItem)}
              onDragEnd={() => {
                setDraggingItem(null)
                setDragOverStatus(null)
              }}
            />
          ))}
          {colItems.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: 'hsl(var(--dash-fg-dim))',
                padding: '6px 4px 10px',
              }}
            >
              No matching items
            </div>
          )}
        </div>

        {/* Inline add at bottom of each column */}
        {addingTo === status ? (
          <InlineAdd
            onSubmit={title => createItem(status, title)}
            onCancel={() => setAddingTo(null)}
            accentColor={conf.addColor}
          />
        ) : (
          <AddCard
            onClick={() => setAddingTo(status)}
            label="New"
            color={conf.addColor}
          />
        )}
      </div>
    )
  }
}
