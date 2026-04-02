'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { apiPrivate } from '@/lib/api'
import { useDashboardTheme } from '../theme-context'

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

function getColConfig(isLight: boolean) {
  return {
    to_learn: {
      label: 'To Learn',
      headerColor: isLight ? 'hsl(220 12% 44%)' : 'hsl(0 0% 30%)',
      bg: isLight ? 'hsl(220 10% 96%)' : 'hsl(0 0% 8%)',
      countColor: isLight ? 'hsl(220 8% 56%)' : 'hsl(0 0% 22%)',
    },
    learning: {
      label: 'In Progress',
      headerColor: isLight ? 'hsl(158 48% 38%)' : 'hsl(158 64% 42%)',
      bg: isLight ? 'hsl(158 64% 42% / 0.06)' : 'hsl(158 64% 36% / 0.04)',
      countColor: isLight ? 'hsl(158 48% 36%)' : 'hsl(158 64% 28%)',
    },
    learned: {
      label: 'Learned',
      headerColor: isLight ? 'hsl(158 40% 36%)' : 'hsl(158 64% 28%)',
      bg: isLight ? 'hsl(220 10% 96%)' : 'hsl(0 0% 8%)',
      countColor: isLight ? 'hsl(220 8% 56%)' : 'hsl(0 0% 22%)',
    },
  }
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
  isLight, onSubmit, onCancel,
}: {
  isLight: boolean
  onSubmit: (t: string) => Promise<void>
  onCancel: () => void
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
      background: isLight ? 'hsl(0 0% 100%)' : 'hsl(0 0% 12%)',
      border: '1px solid hsl(158 64% 36% / 0.35)',
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
          fontSize: 12, letterSpacing: '0.03em',
          color: isLight ? 'hsl(220 18% 14%)' : 'hsl(0 0% 84%)',
          caretColor: 'hsl(158 64% 36%)',
        }}
      />
    </div>
  )
}

// ─── Learning Card ────────────────────────────────────────────────────────────
function LearningCard({
  isLight, item, onUpdate, onDelete, canMoveLeft, canMoveRight, onDragStart, onDragEnd,
}: {
  isLight: boolean
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

  const arrowColor = isLight ? 'hsl(220 8% 56%)' : 'hsl(0 0% 26%)'
  const trashColor = isLight ? 'hsl(220 8% 60%)' : 'hsl(0 0% 28%)'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDel(false) }}
      draggable
      onDragStart={() => onDragStart(item)}
      onDragEnd={onDragEnd}
      style={{
        background: isLight ? 'hsl(0 0% 100%)' : 'hsl(0 0% 12%)',
        border: `1px solid ${hovered
          ? (isLight ? 'hsl(220 8% 82%)' : 'hsl(0 0% 22%)')
          : (isLight ? 'hsl(220 8% 90%)' : 'hsl(0 0% 16%)')}`,
        borderRadius: 8,
        padding: '10px 12px', marginBottom: 6,
        transition: 'border-color 0.12s',
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
            fontSize: 12, letterSpacing: '0.03em',
            color: isLight ? 'hsl(220 18% 14%)' : 'hsl(0 0% 84%)',
            caretColor: 'hsl(158 64% 36%)', marginBottom: 6,
          }}
        />
      ) : (
        <div
          onClick={() => setEditTitle(true)}
          style={{
            fontSize: 12, letterSpacing: '0.03em',
            color: isLight ? 'hsl(220 18% 22%)' : 'hsl(0 0% 72%)',
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
            fontSize: 9, letterSpacing: '0.04em',
            color: 'hsl(158 64% 36%)',
            caretColor: 'hsl(158 64% 36%)', marginBottom: 6, width: '100%',
          }}
        />
      ) : (
        <div
          onClick={() => setEditCat(true)}
          style={{
            fontSize: 9, letterSpacing: '0.04em',
            color: item.category ? 'hsl(158 64% 30%)' : (isLight ? 'hsl(220 8% 72%)' : 'hsl(0 0% 18%)'),
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
            background: isLight ? 'hsl(0 0% 97%)' : 'hsl(0 0% 8%)',
            border: `1px solid ${isLight ? 'hsl(220 8% 88%)' : 'hsl(0 0% 18%)'}`,
            borderRadius: 8,
            outline: 'none', resize: 'none',
            fontFamily: 'var(--font-roboto-flex)',
            fontSize: 10, letterSpacing: '0.03em',
            color: isLight ? 'hsl(220 12% 40%)' : 'hsl(0 0% 55%)',
            caretColor: 'hsl(158 64% 36%)', padding: '5px 7px',
            marginBottom: 8,
          }}
        />
      ) : item.notes ? (
        <div
          onClick={() => setEditNotes(true)}
          style={{
            fontSize: 10, letterSpacing: '0.03em',
            color: isLight ? 'hsl(220 10% 48%)' : 'hsl(0 0% 34%)',
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
            fontSize: 9, letterSpacing: '0.04em',
            color: isLight ? 'hsl(220 8% 72%)' : 'hsl(0 0% 18%)',
            cursor: 'text', marginBottom: 8,
          }}
        >
          + notes
        </div>
      )}

      {/* Footer: arrows + delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {canMoveLeft && (
            <button
              onClick={moveLeft}
              style={{
                fontSize: 11,
                color: arrowColor, background: 'none', border: 'none',
                cursor: 'pointer', padding: '0 4px', transition: 'color 0.1s',
                borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'hsl(158 64% 42%)'}
              onMouseLeave={e => e.currentTarget.style.color = arrowColor}
            >
              ←
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={moveRight}
              style={{
                fontSize: 11,
                color: arrowColor, background: 'none', border: 'none',
                cursor: 'pointer', padding: '0 4px', transition: 'color 0.1s',
                borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'hsl(158 64% 42%)'}
              onMouseLeave={e => e.currentTarget.style.color = arrowColor}
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
                  cursor: 'pointer', fontSize: 11, letterSpacing: '0.03em',
                  padding: 0, fontFamily: 'var(--font-roboto-flex)', borderRadius: 4,
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                style={{
                  color: trashColor, background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 11, letterSpacing: '0.03em',
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
                color: trashColor, background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, display: 'flex',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.12s, color 0.12s',
                borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'hsl(0 62% 52%)'}
              onMouseLeave={e => e.currentTarget.style.color = trashColor}
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
  const { isLight } = useDashboardTheme()
  const [items,    setItems]    = useState<LearningItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [addingTo, setAddingTo] = useState<LStatus | null>(null)
  const [draggingItem, setDraggingItem] = useState<LearningItem | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<LStatus | null>(null)

  const COL = getColConfig(isLight)

  useEffect(() => {
    apiPrivate<LearningItem[]>('/learning')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function createItem(status: LStatus, title: string) {
    try {
      const item = await apiPrivate<LearningItem>('/learning', {
        method: 'POST',
        body: JSON.stringify({ title, status }),
      })
      setItems(prev => [item, ...prev])
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

  return (
    <div>
      {loading ? (
        <div style={{ fontSize: 12, color: isLight ? 'hsl(220 8% 56%)' : 'hsl(0 0% 22%)' }}>
          Loading...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'start' }}>
          {STATUSES.map((status, colIdx) => {
            const conf = COL[status]
            const colItems = items.filter(i => i.status === status)
            const isDropTarget = dragOverStatus === status && draggingItem !== null
            return (
              <div
                key={status}
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
                  borderRadius: 8,
                  padding: 12,
                  outline: isDropTarget ? '1px dashed hsl(158 64% 42% / 0.7)' : 'none',
                  boxShadow: isDropTarget ? 'inset 0 0 0 1px hsl(158 64% 42% / 0.2)' : 'none',
                  transition: 'outline-color 0.12s, box-shadow 0.12s',
                }}
              >

                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 11, letterSpacing: '0.02em', color: conf.headerColor, fontFamily: 'var(--font-roboto-flex)' }}>
                      {conf.label}
                    </span>
                    <span style={{ fontSize: 10, color: conf.countColor, fontFamily: 'var(--font-roboto-flex)' }}>
                      {colItems.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setAddingTo(status)}
                    style={{
                      fontSize: 11, letterSpacing: '0.02em',
                      color: 'hsl(158 64% 36%)', background: 'none', border: 'none',
                      cursor: 'pointer', padding: 0, transition: 'color 0.12s',
                      fontFamily: 'var(--font-roboto-flex)',
                      borderRadius: 4,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'hsl(158 64% 58%)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'hsl(158 64% 36%)'}
                  >
                    + Add
                  </button>
                </div>

                {/* Inline add */}
                {addingTo === status && (
                  <InlineAdd
                    isLight={isLight}
                    onSubmit={title => createItem(status, title)}
                    onCancel={() => setAddingTo(null)}
                  />
                )}

                {/* Cards */}
                {colItems.map(item => (
                  <LearningCard
                    key={item.id}
                    isLight={isLight}
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
