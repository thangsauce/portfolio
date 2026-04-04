'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { apiPrivate, apiFetch } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type DocItem = {
  id: string
  title: string
  portfolio_project_id: string | null
  created_at: string
  updated_at: string
}

type Doc = DocItem & { content: string }

type PortfolioProject = {
  id: string
  title: string
  slug: string
}

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

// ─── Icons ────────────────────────────────────────────────────────────────────
const sv = { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style: { display: 'block' as const } }
function IcPlus()   { return <svg {...sv}><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg> }
function IcTrash()  { return <svg {...sv}><polyline points="2,5 14,5"/><path d="M5 5V3h6v2"/><path d="M4 5l1 9h6l1-9"/></svg> }
function IcSearch() { return <svg {...sv}><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg> }
function IcChevronLeft() { return <svg {...sv}><polyline points="10 3 5 8 10 13" /></svg> }
function IcChevronRight() { return <svg {...sv}><polyline points="6 3 11 8 6 13" /></svg> }

// ─── Doc Editor ───────────────────────────────────────────────────────────────
function DocEditor({
  doc,
  projects,
  onSave,
  onDelete,
}: {
  doc: Doc
  projects: PortfolioProject[]
  onSave: (id: string, patch: Partial<Doc>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [title,      setTitle]      = useState(doc.title)
  const [content,    setContent]    = useState(doc.content)
  const [linkedId,   setLinkedId]   = useState(doc.portfolio_project_id ?? '')
  const [tab,        setTab]        = useState<'edit' | 'preview'>('edit')
  const [status,     setStatus]     = useState<'idle' | 'saving' | 'saved'>('idle')
  const [confirmDel, setConfirmDel] = useState(false)

  const titleRef   = useRef(doc.title)
  const contentRef = useRef(doc.content)
  const linkedRef  = useRef(doc.portfolio_project_id ?? '')
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitle(doc.title);     titleRef.current   = doc.title
    setContent(doc.content); contentRef.current = doc.content
    const l = doc.portfolio_project_id ?? ''
    setLinkedId(l);          linkedRef.current  = l
    setStatus('idle')
    setTab('edit')
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [doc.id])

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('saving')
    timerRef.current = setTimeout(async () => {
      try {
        await onSave(doc.id, {
          title:                titleRef.current,
          content:              contentRef.current,
          portfolio_project_id: linkedRef.current || null,
        })
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2500)
      } catch {
        setStatus('idle')
      }
    }, 2000)
  }, [doc.id, onSave])

  function handleTitle(val: string)   { setTitle(val);   titleRef.current   = val; scheduleSave() }
  function handleContent(val: string) { setContent(val); contentRef.current = val; scheduleSave() }
  function handleLink(val: string)    { setLinkedId(val); linkedRef.current  = val; scheduleSave() }

  const linkedProject = projects.find(p => p.id === linkedId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '18px 36px 0', flexShrink: 0, borderBottom: '1px solid hsl(var(--dash-border-subtle))' }}>

        {/* Top row: save status | tabs | delete */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 20, marginBottom: 12 }}>
          <div style={{
            fontSize: 9,
            color: status === 'saved' ? 'hsl(158 64% 42%)' : status === 'saving' ? 'hsl(var(--dash-fg-dim))' : 'transparent',
            transition: 'color 0.2s',
          }}>
            {status === 'saved' ? 'Saved' : 'Saving...'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Tab switcher */}
            <div style={{ display: 'flex' }}>
              {(['edit', 'preview'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    fontSize: 9,
                    color: tab === t ? 'hsl(158 64% 52%)' : 'hsl(var(--dash-fg-dim))',
                    background: 'none', border: 'none',
                    borderBottom: `1px solid ${tab === t ? 'hsl(158 64% 36%)' : 'transparent'}`,
                    padding: '3px 10px 4px',
                    cursor: 'pointer', transition: 'color 0.12s',
                    fontFamily: 'var(--font-roboto-flex)',
                  }}
                  onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = 'hsl(var(--dash-fg-muted))' }}
                  onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = 'hsl(var(--dash-fg-dim))' }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Delete */}
            {confirmDel ? (
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => onDelete(doc.id)} style={{ color: 'hsl(0 62% 52%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: 'var(--font-roboto-flex)' }}>Delete</button>
                <button onClick={() => setConfirmDel(false)} style={{ color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: 'var(--font-roboto-flex)' }}>Cancel</button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDel(true)}
                style={{
                  color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'hsl(0 62% 52%)'}
                onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--dash-fg-dim))'}
              >
                <IcTrash />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={e => handleTitle(e.target.value)}
          placeholder="Document title"
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            fontFamily: 'var(--font-anton)',
            fontSize: 24, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'hsl(var(--dash-fg))', caretColor: 'hsl(158 64% 36%)',
            marginBottom: 14,
          }}
        />

        {/* Link to project */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: 'hsl(var(--dash-fg-dim))', flexShrink: 0 }}>Project</span>
          <div style={{ position: 'relative' }}>
            <select
              value={linkedId}
              onChange={e => handleLink(e.target.value)}
              style={{
                background: 'hsl(var(--dash-input))',
                border: `1px solid ${linkedId ? 'hsl(158 64% 36% / 0.35)' : 'hsl(var(--dash-border))'}`,
                color: linkedId ? 'hsl(158 64% 42%)' : 'hsl(var(--dash-fg-muted))',
                fontSize: 10,
                padding: '4px 24px 4px 8px', outline: 'none',
                fontFamily: 'var(--font-roboto-flex)',
                appearance: 'none', cursor: 'pointer',
                transition: 'border-color 0.15s',
                borderRadius: 6,
              }}
            >
              <option value="">— none —</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <span style={{
              position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
              fontSize: 8, color: 'hsl(var(--dash-fg-dim))', pointerEvents: 'none',
            }}>▾</span>
          </div>
          {linkedProject && (
            <span style={{ fontSize: 9, color: 'hsl(var(--dash-fg-dim))' }}>
              → {linkedProject.slug}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'edit' ? (
          <textarea
            value={content}
            onChange={e => handleContent(e.target.value)}
            placeholder="Write documentation in markdown..."
            style={{
              flex: 1, width: '100%', boxSizing: 'border-box',
              background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontFamily: 'var(--font-roboto-flex)', fontSize: 13,
              color: 'hsl(var(--dash-fg-muted))', caretColor: 'hsl(158 64% 36%)',
              lineHeight: 1.7, padding: '16px 36px',
            }}
          />
        ) : (
          <div style={{
            flex: 1, overflow: 'auto',
            background: 'hsl(var(--dash-content))',
            padding: '24px 36px',
            fontSize: 14, lineHeight: 1.75,
            color: 'hsl(var(--dash-fg-muted))',
            fontFamily: 'var(--font-roboto-flex)',
          }}>
            {content.trim() ? (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 30, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'hsl(var(--dash-fg))', margin: '0 0 18px', lineHeight: 1.1 }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-anton)', fontSize: 22, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'hsl(var(--dash-fg))', margin: '34px 0 14px', lineHeight: 1.15 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, color: 'hsl(var(--dash-fg-muted))', margin: '26px 0 10px' }}>{children}</h3>,
                  p: ({ children }) => <p style={{ margin: '0 0 16px' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ margin: '0 0 16px', paddingLeft: 0, listStyle: 'none' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '0 0 16px', paddingLeft: 20 }}>{children}</ol>,
                  li: ({ children }) => (
                    <li style={{ marginBottom: 6, paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'hsl(158 64% 36%)' }}>–</span>
                      {children}
                    </li>
                  ),
                  pre: ({ children }) => <pre style={{ background: 'hsl(var(--dash-input))', border: '1px solid hsl(var(--dash-border-subtle))', borderRadius: 6, padding: '13px 16px', margin: '0 0 16px', overflowX: 'auto', lineHeight: 1.6 }}>{children}</pre>,
                  code: ({ children, className }) => className ? (
                    <code style={{ fontFamily: 'monospace', fontSize: 12, color: 'hsl(var(--dash-fg-muted))', display: 'block' }}>{children}</code>
                  ) : (
                    <code style={{ background: 'hsl(var(--dash-input))', border: '1px solid hsl(var(--dash-border))', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace', fontSize: 12, color: 'hsl(158 64% 44%)' }}>{children}</code>
                  ),
                  blockquote: ({ children }) => <blockquote style={{ margin: '0 0 16px', padding: '10px 16px', borderLeft: '2px solid hsl(158 64% 36%)', background: 'hsl(158 64% 36% / 0.05)', color: 'hsl(var(--dash-fg-muted))' }}>{children}</blockquote>,
                  hr: () => <hr style={{ border: 'none', borderTop: '1px solid hsl(var(--dash-border-subtle))', margin: '32px 0' }} />,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" style={{ color: 'hsl(158 64% 44%)', textDecoration: 'underline', textDecorationColor: 'hsl(158 64% 36% / 0.35)' }}>{children}</a>,
                  strong: ({ children }) => <strong style={{ color: 'hsl(var(--dash-fg))', fontWeight: 600 }}>{children}</strong>,
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <div style={{ fontSize: 10, color: 'hsl(var(--dash-fg-dim))' }}>
                Nothing to preview
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectDocsPage() {
  const [docs,       setDocs]       = useState<DocItem[]>([])
  const [activeDoc,  setActiveDoc]  = useState<Doc | null>(null)
  const [projects,   setProjects]   = useState<PortfolioProject[]>([])
  const [loading,    setLoading]    = useState(true)
  const [loadingDoc, setLoadingDoc] = useState(false)
  const [creating,   setCreating]   = useState(false)
  const [importingMd, setImportingMd] = useState(false)
  const [isDropActive, setIsDropActive] = useState(false)
  const [search,     setSearch]     = useState('')
  const [hoveredId,  setHoveredId]  = useState<string | null>(null)
  const [isLeftMinimized, setIsLeftMinimized] = useState(false)
  const mdInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    Promise.all([
      apiPrivate<DocItem[]>('/project-docs'),
      apiFetch<PortfolioProject[]>('/api/portfolio/projects'),
    ])
      .then(([d, p]) => { setDocs(d); setProjects(p) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function selectDoc(id: string) {
    if (activeDoc?.id === id) return
    setLoadingDoc(true)
    try {
      const doc = await apiPrivate<Doc>(`/project-docs/${id}`)
      setActiveDoc(doc)
    } catch {}
    setLoadingDoc(false)
  }

  async function createDoc() {
    setCreating(true)
    try {
      const doc = await apiPrivate<Doc>('/project-docs', {
        method: 'POST',
        body: JSON.stringify({ title: 'Untitled', content: '' }),
      })
      const item: DocItem = { id: doc.id, title: doc.title, portfolio_project_id: doc.portfolio_project_id, created_at: doc.created_at, updated_at: doc.updated_at }
      setDocs(prev => [item, ...prev])
      setActiveDoc(doc)
    } catch {}
    setCreating(false)
  }

  function fileNameToTitle(name: string) {
    const noExt = name.replace(/\.md$/i, '')
    const spaced = noExt.replace(/[-_]+/g, ' ').trim()
    return spaced || 'Untitled'
  }

  async function importMarkdownFile(file: File) {
    const isMd = /\.md$/i.test(file.name) || file.type === 'text/markdown' || file.type === 'text/plain'
    if (!isMd) return

    setImportingMd(true)
    try {
      const content = await file.text()
      const title = fileNameToTitle(file.name)
      const doc = await apiPrivate<Doc>('/project-docs', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      })
      const item: DocItem = {
        id: doc.id,
        title: doc.title,
        portfolio_project_id: doc.portfolio_project_id,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }
      setDocs((prev) => [item, ...prev])
      setActiveDoc(doc)
    } catch {
      // silent for consistency with existing page interactions
    } finally {
      setImportingMd(false)
      setIsDropActive(false)
    }
  }

  const saveDoc = useCallback(async (id: string, patch: Partial<Doc>) => {
    await apiPrivate(`/project-docs/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
    setDocs(prev => prev.map(d => d.id === id ? { ...d, ...patch, updated_at: new Date().toISOString() } : d))
    setActiveDoc(prev => prev?.id === id ? { ...prev, ...patch } : prev)
  }, [])

  async function deleteDoc(id: string) {
    try {
      await apiPrivate(`/project-docs/${id}`, { method: 'DELETE' })
      setDocs(prev => prev.filter(d => d.id !== id))
      if (activeDoc?.id === id) setActiveDoc(null)
    } catch {}
  }

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))
  const filtered   = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))

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
        width: isLeftMinimized ? 72 : 256,
        minWidth: isLeftMinimized ? 72 : 256,
        flexShrink: 0,
        background: 'hsl(var(--dash-panel))',
        borderRight: '1px solid hsl(var(--dash-border))',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'width 180ms ease, min-width 180ms ease',
      }}>
        <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid hsl(var(--dash-border-subtle))', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            {!isLeftMinimized && <span style={{ fontSize: 10, color: 'hsl(var(--dash-fg-dim))' }}>Docs</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: isLeftMinimized ? 'auto' : 0 }}>
              <button
                onClick={() => setIsLeftMinimized(prev => !prev)}
                title={isLeftMinimized ? 'Expand panel' : 'Minimize panel'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--dash-fg-dim))',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'hsl(var(--dash-fg-muted))' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'hsl(var(--dash-fg-dim))' }}
              >
                {isLeftMinimized ? <IcChevronRight /> : <IcChevronLeft />}
              </button>
              {!isLeftMinimized && (
                <button onClick={createDoc} disabled={creating}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 10,
                    color: creating ? 'hsl(var(--dash-fg-dim))' : 'hsl(158 64% 42%)',
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
              )}
            </div>
          </div>
          {!isLeftMinimized && (
            <>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--dash-fg-dim))', pointerEvents: 'none', display: 'flex' }}>
                  <IcSearch />
                </div>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="search docs..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '6px 10px 6px 28px',
                    background: 'hsl(var(--dash-input))',
                    border: '1px solid hsl(var(--dash-border))',
                    color: 'hsl(var(--dash-fg))',
                    fontSize: 11,
                    outline: 'none', fontFamily: 'var(--font-roboto-flex)',
                    borderRadius: 6,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 10,
                  border: `1px dashed ${isDropActive ? 'hsl(158 64% 42%)' : 'hsl(var(--dash-border))'}`,
                  background: isDropActive ? 'hsl(158 64% 36% / 0.08)' : 'hsl(var(--dash-input))',
                  padding: '9px 10px',
                  borderRadius: 6,
                  transition: 'all 0.12s',
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDropActive(true) }}
                onDragLeave={(e) => { e.preventDefault(); setIsDropActive(false) }}
                onDrop={async (e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (file) await importMarkdownFile(file)
                  setIsDropActive(false)
                }}
              >
                <div style={{ fontSize: 9, color: 'hsl(var(--dash-fg-dim))', marginBottom: 6 }}>
                  Import
                </div>
                <div style={{ fontSize: 10, color: 'hsl(var(--dash-fg-muted))', marginBottom: 7 }}>
                  drop a `.md` file here
                </div>
                <button
                  onClick={() => mdInputRef.current?.click()}
                  disabled={importingMd}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 10,
                    color: importingMd ? 'hsl(var(--dash-fg-dim))' : 'hsl(158 64% 46%)',
                    background: 'none',
                    border: '1px solid hsl(158 64% 22%)',
                    padding: '5px 8px',
                    borderRadius: 6,
                    cursor: importingMd ? 'not-allowed' : 'pointer',
                  }}
                >
                  {importingMd ? 'importing...' : 'choose .md'}
                </button>
                <input
                  ref={mdInputRef}
                  type="file"
                  accept=".md,text/markdown,text/plain"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) await importMarkdownFile(file)
                    e.currentTarget.value = ''
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '16px 14px', fontSize: 10, color: 'hsl(var(--dash-fg-dim))' }}>
              Loading...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: '16px 14px', fontSize: 10, color: 'hsl(var(--dash-fg-dim))' }}>
              No docs yet
            </div>
          )}
          {filtered.map(doc => {
            const isActive = activeDoc?.id === doc.id
            const isHov    = hoveredId === doc.id
            const linked   = doc.portfolio_project_id ? projectMap[doc.portfolio_project_id] : null
            return (
              <div key={doc.id}
                onClick={() => selectDoc(doc.id)}
                onMouseEnter={() => setHoveredId(doc.id)}
                onMouseLeave={() => setHoveredId(null)}
                title={doc.title || 'Untitled'}
                style={{
                  borderLeft: `2px solid ${isActive ? 'hsl(158 64% 36%)' : 'transparent'}`,
                  background: isActive ? 'hsl(158 64% 36% / 0.07)' : isHov ? 'hsl(var(--dash-bg))' : 'transparent',
                  transition: 'all 0.1s', cursor: 'pointer',
                  padding: isLeftMinimized ? '10px 8px' : '10px 12px 10px 10px',
                  display: 'flex',
                  flexDirection: isLeftMinimized ? 'column' : 'initial',
                  alignItems: isLeftMinimized ? 'center' : 'stretch',
                  gap: isLeftMinimized ? 4 : 0,
                }}
              >
                <div style={{
                  fontSize: isLeftMinimized ? 10 : 12,
                  color: isActive ? 'hsl(var(--dash-fg))' : 'hsl(var(--dash-fg-muted))',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: linked ? 2 : 3,
                  width: isLeftMinimized ? '100%' : 'auto',
                  textAlign: isLeftMinimized ? 'center' : 'left',
                }}>
                  {isLeftMinimized ? (doc.title || 'Untitled').slice(0, 2).toUpperCase() : (doc.title || 'Untitled')}
                </div>
                {!isLeftMinimized && linked && (
                  <div style={{
                    fontSize: 9, color: 'hsl(158 64% 28%)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 2,
                  }}>
                    → {linked.title}
                  </div>
                )}
                <div style={{ fontSize: 9, color: 'hsl(var(--dash-fg-dim))', textAlign: isLeftMinimized ? 'center' : 'left' }}>
                  {reltime(doc.updated_at)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'hsl(var(--dash-content))' }}>

        {!activeDoc && !loadingDoc && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: 10, color: 'hsl(var(--dash-fg-dim))' }}>
              Select a doc to start
            </div>
            <button onClick={createDoc}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 11,
                color: 'hsl(158 64% 42%)',
                background: 'none', border: '1px solid hsl(158 64% 18%)',
                padding: '7px 18px', cursor: 'pointer', transition: 'all 0.12s',
                borderRadius: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'hsl(158 64% 58%)'; e.currentTarget.style.borderColor = 'hsl(158 64% 30%)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'hsl(158 64% 42%)'; e.currentTarget.style.borderColor = 'hsl(158 64% 18%)' }}
            >
              <IcPlus /> new doc
            </button>
          </div>
        )}

        {loadingDoc && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, color: 'hsl(var(--dash-fg-dim))' }}>
              Loading...
            </div>
          </div>
        )}

        {activeDoc && !loadingDoc && (
          <DocEditor
            key={activeDoc.id}
            doc={activeDoc}
            projects={projects}
            onSave={saveDoc}
            onDelete={deleteDoc}
          />
        )}
      </div>
    </div>
  )
}
