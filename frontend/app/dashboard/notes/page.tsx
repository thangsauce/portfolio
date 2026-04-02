'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiPrivate } from '@/lib/api'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/react/style.css'
import '@blocknote/mantine/style.css'

// ─── Types ────────────────────────────────────────────────────────────────────
type NoteItem = { id: string; title: string; updated_at: string; created_at: string }
type Note     = NoteItem & { content: any[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function reltime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const sv = { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style: { display: 'block' as const } }
function IcPlus()   { return <svg {...sv}><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg> }
function IcTrash()  { return <svg {...sv}><polyline points="2,5 14,5"/><path d="M5 5V3h6v2"/><path d="M4 5l1 9h6l1-9"/></svg> }
function IcSearch() { return <svg {...sv}><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg> }

// ─── BlockNote editor (keyed per note — remounts on note switch) ──────────────
function NoteEditor({
  note,
  onSave,
}: {
  note: Note
  onSave: (id: string, title: string, content: any[]) => Promise<void>
}) {
  const [title, setTitle]       = useState(note.title)
  const [status, setStatus]     = useState<'idle' | 'saving' | 'saved'>('idle')
  const titleRef                = useRef(note.title)
  const contentRef              = useRef<any[]>(note.content ?? [])
  const timerRef                = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useCreateBlockNote({
    initialContent: note.content?.length ? note.content : undefined,
  })

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('saving')
    timerRef.current = setTimeout(async () => {
      try {
        await onSave(note.id, titleRef.current, contentRef.current)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2500)
      } catch {
        setStatus('idle')
      }
    }, 1500)
  }, [note.id, onSave])

  useEffect(() => {
    return editor.onChange(() => {
      contentRef.current = editor.document as any[]
      scheduleSave()
    })
  }, [editor, scheduleSave])

  function handleTitle(val: string) {
    setTitle(val)
    titleRef.current = val
    scheduleSave()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Editor header */}
      <div style={{ padding: '18px 36px 0', flexShrink: 0, borderBottom: '1px solid hsl(0 0% 14%)' }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
          height: 14, marginBottom: 12,
          color: status === 'saved' ? 'hsl(158 64% 42%)' : status === 'saving' ? 'hsl(0 0% 32%)' : 'transparent',
          transition: 'color 0.2s',
        }}>
          {status === 'saved' ? '// saved' : '// saving...'}
        </div>

        <input
          value={title}
          onChange={e => handleTitle(e.target.value)}
          placeholder="Untitled"
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            fontFamily: 'var(--font-anton)',
            fontSize: 26, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'hsl(0 0% 87%)',
            caretColor: 'hsl(158 64% 36%)',
            marginBottom: 18,
          }}
        />

        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(0 0% 34%)', textTransform: 'uppercase' }}>
            created: {formatDateTime(note.created_at)}
          </span>
          <span style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(0 0% 34%)', textTransform: 'uppercase' }}>
            last edited: {formatDateTime(note.updated_at)}
          </span>
        </div>
      </div>

      {/* BlockNote */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <BlockNoteView editor={editor} theme="dark" />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const [notes,       setNotes]       = useState<NoteItem[]>([])
  const [activeNote,  setActiveNote]  = useState<Note | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [loadingNote, setLoadingNote] = useState(false)
  const [creating,    setCreating]    = useState(false)
  const [search,      setSearch]      = useState('')
  const [confirmDel,  setConfirmDel]  = useState<string | null>(null)
  const [hoveredId,   setHoveredId]   = useState<string | null>(null)

  // Load list on mount
  useEffect(() => {
    apiPrivate<NoteItem[]>('/notes')
      .then(setNotes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function selectNote(id: string) {
    if (activeNote?.id === id) return
    setLoadingNote(true)
    try {
      const note = await apiPrivate<Note>(`/notes/${id}`)
      setActiveNote(note)
    } catch {}
    setLoadingNote(false)
  }

  async function createNote() {
    setCreating(true)
    try {
      const note = await apiPrivate<Note>('/notes', {
        method: 'POST',
        body: JSON.stringify({ title: 'Untitled', content: [] }),
      })
      const item: NoteItem = { id: note.id, title: note.title, updated_at: note.updated_at, created_at: note.created_at }
      setNotes(prev => [item, ...prev])
      setActiveNote(note)
    } catch {}
    setCreating(false)
  }

  const saveNote = useCallback(async (id: string, title: string, content: any[]) => {
    const updated = await apiPrivate<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    })
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, title: updated.title, updated_at: updated.updated_at, created_at: updated.created_at } : n
    ))
    setActiveNote(prev => (prev && prev.id === id ? updated : prev))
  }, [])

  async function deleteNote(id: string) {
    try {
      await apiPrivate(`/notes/${id}`, { method: 'DELETE' })
      setNotes(prev => prev.filter(n => n.id !== id))
      if (activeNote?.id === id) setActiveNote(null)
    } catch {}
    setConfirmDel(null)
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 44px)',
      margin: '-32px -28px',
      fontFamily: 'var(--font-roboto-flex)',
      overflow: 'hidden',
    }}>

      {/* ── Left panel ──────────────────────────────────── */}
      <div style={{
        width: 256, minWidth: 256, flexShrink: 0,
        background: 'hsl(0 0% 7%)',
        borderRight: '1px solid hsl(0 0% 16%)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid hsl(0 0% 13%)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <span style={{ fontSize: 9, letterSpacing: '0.3em', color: 'hsl(0 0% 26%)', textTransform: 'uppercase' }}>
              // notes
            </span>
            <button onClick={createNote} disabled={creating}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10, letterSpacing: '0.18em',
                color: creating ? 'hsl(0 0% 28%)' : 'hsl(158 64% 42%)',
                background: 'none', border: 'none',
                cursor: creating ? 'not-allowed' : 'pointer',
                padding: 0, transition: 'color 0.12s',
              }}
              onMouseEnter={e => { if (!creating) e.currentTarget.style.color = 'hsl(158 64% 60%)' }}
              onMouseLeave={e => { if (!creating) e.currentTarget.style.color = 'hsl(158 64% 42%)' }}
            >
              <IcPlus /> new
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'hsl(0 0% 26%)', pointerEvents: 'none', display: 'flex' }}>
              <IcSearch />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="search notes..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '6px 10px 6px 28px',
                background: 'hsl(0 0% 5%)', border: '1px solid hsl(0 0% 17%)',
                color: 'hsl(0 0% 62%)', fontSize: 11, letterSpacing: '0.04em',
                outline: 'none', fontFamily: 'var(--font-roboto-flex)',
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '16px 14px', fontSize: 9, letterSpacing: '0.25em', color: 'hsl(0 0% 24%)', textTransform: 'uppercase' }}>
              // loading...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: '16px 14px', fontSize: 9, letterSpacing: '0.25em', color: 'hsl(0 0% 24%)', textTransform: 'uppercase' }}>
              // no notes yet
            </div>
          )}
          {filtered.map(note => {
            const isActive = activeNote?.id === note.id
            const isHov    = hoveredId === note.id
            return (
              <div key={note.id}
                onMouseEnter={() => setHoveredId(note.id)}
                onMouseLeave={() => { setHoveredId(null); if (confirmDel === note.id) setConfirmDel(null) }}
                style={{
                  borderLeft: `2px solid ${isActive ? 'hsl(158 64% 36%)' : 'transparent'}`,
                  background: isActive ? 'hsl(158 64% 36% / 0.07)' : isHov ? 'hsl(0 0% 10%)' : 'transparent',
                  transition: 'all 0.1s', cursor: 'pointer',
                }}
              >
                <div style={{ padding: '10px 12px 10px 10px', display: 'flex', alignItems: 'flex-start', gap: 6 }}
                  onClick={() => selectNote(note.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, letterSpacing: '0.03em',
                      color: isActive ? 'hsl(0 0% 82%)' : 'hsl(0 0% 55%)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 3,
                    }}>
                      {note.title || 'Untitled'}
                    </div>
                    <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'hsl(0 0% 26%)', textTransform: 'uppercase' }}>
                      edited {reltime(note.updated_at)}
                    </div>
                    <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'hsl(0 0% 30%)', textTransform: 'uppercase', marginTop: 2 }}>
                      created {formatDateTime(note.created_at)}
                    </div>
                  </div>

                  {/* Delete */}
                  <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                    {confirmDel === note.id ? (
                      <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <button onClick={() => deleteNote(note.id)}
                          style={{ color: 'hsl(0 62% 52%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, letterSpacing: '0.12em', padding: 0 }}>
                          rm
                        </button>
                        <button onClick={() => setConfirmDel(null)}
                          style={{ color: 'hsl(0 0% 28%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, letterSpacing: '0.12em', padding: 0 }}>
                          no
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDel(note.id)}
                        style={{
                          color: 'hsl(0 0% 28%)', background: 'none', border: 'none', cursor: 'pointer',
                          padding: 0, display: 'flex',
                          opacity: isHov ? 1 : 0,
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
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'hsl(0 0% 10%)' }}>

        {!activeNote && !loadingNote && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'hsl(0 0% 22%)', textTransform: 'uppercase' }}>
              // select a note or create one
            </div>
            <button onClick={createNote}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 11, letterSpacing: '0.15em',
                color: 'hsl(158 64% 42%)',
                background: 'none', border: '1px solid hsl(158 64% 18%)',
                padding: '7px 18px', cursor: 'pointer', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'hsl(158 64% 58%)'; e.currentTarget.style.borderColor = 'hsl(158 64% 30%)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'hsl(158 64% 42%)'; e.currentTarget.style.borderColor = 'hsl(158 64% 18%)' }}
            >
              <IcPlus /> new note
            </button>
          </div>
        )}

        {loadingNote && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'hsl(0 0% 22%)', textTransform: 'uppercase' }}>
              // loading...
            </div>
          </div>
        )}

        {activeNote && !loadingNote && (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onSave={saveNote}
          />
        )}
      </div>
    </div>
  )
}
