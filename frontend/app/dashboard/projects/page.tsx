'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { apiPrivate, apiFetch } from '@/lib/api'
import { useDashboardTheme } from '../theme-context'

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

// ─── Doc Editor ───────────────────────────────────────────────────────────────
function DocEditor({
  doc,
  projects,
  onSave,
  onDelete,
  isLight,
}: {
  doc: Doc
  projects: PortfolioProject[]
  onSave: (id: string, patch: Partial<Doc>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLight: boolean
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

  const tabInactiveColor = isLight ? 'hsl(220 8% 52%)' : 'hsl(0 0% 28%)'
  const trashColor       = isLight ? 'hsl(220 8% 62%)' : 'hsl(0 0% 28%)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '18px 36px 0', flexShrink: 0, borderBottom: `1px solid ${isLight ? 'hsl(220 8% 90%)' : 'hsl(0 0% 14%)'}` }}>

        {/* Top row: save status | tabs | delete */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 20, marginBottom: 12 }}>
          <div style={{
            fontSize: 9,
            color: status === 'saved' ? 'hsl(158 64% 42%)' : status === 'saving' ? (isLight ? 'hsl(220 8% 60%)' : 'hsl(0 0% 32%)') : 'transparent',
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
                    color: tab === t ? 'hsl(158 64% 52%)' : tabInactiveColor,
                    background: 'none', border: 'none',
                    borderBottom: `1px solid ${tab === t ? 'hsl(158 64% 36%)' : 'transparent'}`,
                    padding: '3px 10px 4px',
                    cursor: 'pointer', transition: 'color 0.12s',
                    fontFamily: 'var(--font-roboto-flex)',
                  }}
                  onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = isLight ? 'hsl(220 8% 36%)' : 'hsl(0 0% 48%)' }}
                  onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = tabInactiveColor }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Delete */}
            {confirmDel ? (
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => onDelete(doc.id)} style={{ color: 'hsl(0 62% 52%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: 'var(--font-roboto-flex)' }}>Delete</button>
                <button onClick={() => setConfirmDel(false)} style={{ color: trashColor, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: 'var(--font-roboto-flex)' }}>Cancel</button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDel(true)}
                style={{
                  color: trashColor, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'hsl(0 62% 52%)'}
                onMouseLeave={e => e.currentTarget.style.color = trashColor}
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
            color: isLight ? 'hsl(220 20% 14%)' : 'hsl(0 0% 87%)', caretColor: 'hsl(158 64% 36%)',
            marginBottom: 14,
          }}
        />

        {/* Link to project */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: isLight ? 'hsl(220 8% 54%)' : 'hsl(0 0% 26%)', flexShrink: 0 }}>Project</span>
          <div style={{ position: 'relative' }}>
            <select
              value={linkedId}
              onChange={e => handleLink(e.target.value)}
              style={{
                background: isLight ? 'hsl(0 0% 97%)' : 'hsl(0 0% 8%)',
                border: `1px solid ${linkedId ? 'hsl(158 64% 36% / 0.35)' : (isLight ? 'hsl(220 8% 88%)' : 'hsl(0 0% 18%)')}`,
                color: linkedId ? 'hsl(158 64% 42%)' : (isLight ? 'hsl(220 10% 48%)' : 'hsl(0 0% 34%)'),
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
              fontSize: 8, color: isLight ? 'hsl(220 8% 56%)' : 'hsl(0 0% 30%)', pointerEvents: 'none',
            }}>▾</span>
          </div>
          {linkedProject && (
            <span style={{ fontSize: 9, color: isLight ? 'hsl(220 8% 54%)' : 'hsl(0 0% 30%)' }}>
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
              color: isLight ? 'hsl(220 14% 34%)' : 'hsl(0 0% 60%)', caretColor: 'hsl(158 64% 36%)',
              lineHeight: 1.7, padding: '16px 36px',
            }}
          />
        ) : (
          <div style={{
            flex: 1, overflow: 'auto',
            background: isLight ? 'hsl(0 0% 99%)' : 'hsl(0 0% 9%)',
            padding: '24px 36px',
            fontSize: 14, lineHeight: 1.75,
            color: isLight ? 'hsl(220 14% 28%)' : 'hsl(0 0% 65%)',
            fontFamily: 'var(--font-roboto-flex)',
          }}>
            {content.trim() ? (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 30, letterSpacing: '0.05em', textTransform: 'uppercase', color: isLight ? 'hsl(220 18% 14%)' : 'hsl(0 0% 86%)', margin: '0 0 18px', lineHeight: 1.1 }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-anton)', fontSize: 22, letterSpacing: '0.05em', textTransform: 'uppercase', color: isLight ? 'hsl(220 18% 18%)' : 'hsl(0 0% 80%)', margin: '34px 0 14px', lineHeight: 1.15 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, color: isLight ? 'hsl(220 16% 24%)' : 'hsl(0 0% 70%)', margin: '26px 0 10px' }}>{children}</h3>,
                  p: ({ children }) => <p style={{ margin: '0 0 16px' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ margin: '0 0 16px', paddingLeft: 0, listStyle: 'none' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '0 0 16px', paddingLeft: 20 }}>{children}</ol>,
                  li: ({ children }) => (
                    <li style={{ marginBottom: 6, paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'hsl(158 64% 36%)' }}>–</span>
                      {children}
                    </li>
                  ),
                  pre: ({ children }) => <pre style={{ background: isLight ? 'hsl(220 8% 96%)' : 'hsl(0 0% 7%)', border: `1px solid ${isLight ? 'hsl(220 8% 90%)' : 'hsl(0 0% 13%)'}`, borderRadius: 6, padding: '13px 16px', margin: '0 0 16px', overflowX: 'auto', lineHeight: 1.6 }}>{children}</pre>,
                  code: ({ children, className }) => className ? (
                    <code style={{ fontFamily: 'monospace', fontSize: 12, color: isLight ? 'hsl(220 12% 38%)' : 'hsl(0 0% 56%)', display: 'block' }}>{children}</code>
                  ) : (
                    <code style={{ background: isLight ? 'hsl(220 8% 94%)' : 'hsl(0 0% 11%)', border: `1px solid ${isLight ? 'hsl(220 8% 88%)' : 'hsl(0 0% 16%)'}`, borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace', fontSize: 12, color: 'hsl(158 64% 44%)' }}>{children}</code>
                  ),
                  blockquote: ({ children }) => <blockquote style={{ margin: '0 0 16px', padding: '10px 16px', borderLeft: '2px solid hsl(158 64% 36%)', background: 'hsl(158 64% 36% / 0.05)', color: isLight ? 'hsl(220 10% 46%)' : 'hsl(0 0% 50%)' }}>{children}</blockquote>,
                  hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${isLight ? 'hsl(220 8% 90%)' : 'hsl(0 0% 13%)'}`, margin: '32px 0' }} />,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" style={{ color: 'hsl(158 64% 44%)', textDecoration: 'underline', textDecorationColor: 'hsl(158 64% 36% / 0.35)' }}>{children}</a>,
                  strong: ({ children }) => <strong style={{ color: isLight ? 'hsl(220 18% 18%)' : 'hsl(0 0% 80%)', fontWeight: 600 }}>{children}</strong>,
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <div style={{ fontSize: 10, color: isLight ? 'hsl(220 14% 28%)' : 'hsl(0 0% 20%)' }}>
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
  const { isLight } = useDashboardTheme()

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

  const emptyTextColor = isLight ? 'hsl(220 10% 48%)' : 'hsl(0 0% 24%)'

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
        background: isLight ? 'hsl(0 0% 100%)' : 'hsl(0 0% 7%)',
        borderRight: `1px solid ${isLight ? 'hsl(220 8% 88%)' : 'hsl(0 0% 16%)'}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 14px 12px', borderBottom: `1px solid ${isLight ? 'hsl(220 8% 92%)' : 'hsl(0 0% 13%)'}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <span style={{ fontSize: 10, color: isLight ? 'hsl(220 8% 54%)' : 'hsl(0 0% 26%)' }}>Docs</span>
            <button onClick={createDoc} disabled={creating}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10,
                color: creating ? (isLight ? 'hsl(220 8% 62%)' : 'hsl(0 0% 28%)') : 'hsl(158 64% 42%)',
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
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: isLight ? 'hsl(220 8% 56%)' : 'hsl(0 0% 26%)', pointerEvents: 'none', display: 'flex' }}>
              <IcSearch />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="search docs..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '6px 10px 6px 28px',
                background: isLight ? 'hsl(0 0% 97%)' : 'hsl(0 0% 5%)',
                border: `1px solid ${isLight ? 'hsl(220 8% 88%)' : 'hsl(0 0% 17%)'}`,
                color: isLight ? 'hsl(220 14% 32%)' : 'hsl(0 0% 62%)',
                fontSize: 11,
                outline: 'none', fontFamily: 'var(--font-roboto-flex)',
                borderRadius: 6,
              }}
            />
          </div>

          <div
            style={{
              marginTop: 10,
              border: `1px dashed ${isDropActive ? 'hsl(158 64% 42%)' : (isLight ? 'hsl(220 8% 78%)' : 'hsl(0 0% 24%)')}`,
              background: isDropActive ? 'hsl(158 64% 36% / 0.08)' : (isLight ? 'hsl(0 0% 97%)' : 'hsl(0 0% 6%)'),
              padding: '9px 10px',
              borderRadius: 6,
              transition: 'all 0.12s',
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDropActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDropActive(false)
            }}
            onDrop={async (e) => {
              e.preventDefault()
              const file = e.dataTransfer.files?.[0]
              if (file) await importMarkdownFile(file)
              setIsDropActive(false)
            }}
          >
            <div style={{ fontSize: 9, color: isLight ? 'hsl(220 10% 48%)' : 'hsl(0 0% 34%)', marginBottom: 6 }}>
              Import
            </div>
            <div style={{ fontSize: 10, color: isLight ? 'hsl(220 10% 44%)' : 'hsl(0 0% 44%)', marginBottom: 7 }}>
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
                color: importingMd ? (isLight ? 'hsl(220 8% 56%)' : 'hsl(0 0% 30%)') : 'hsl(158 64% 46%)',
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
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '16px 14px', fontSize: 10, color: emptyTextColor }}>
              Loading...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: '16px 14px', fontSize: 10, color: emptyTextColor }}>
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
                style={{
                  borderLeft: `2px solid ${isActive ? 'hsl(158 64% 36%)' : 'transparent'}`,
                  background: isActive ? 'hsl(158 64% 36% / 0.07)' : isHov ? (isLight ? 'hsl(220 8% 96%)' : 'hsl(0 0% 10%)') : 'transparent',
                  transition: 'all 0.1s', cursor: 'pointer',
                  padding: '10px 12px 10px 10px',
                }}
              >
                <div style={{
                  fontSize: 12,
                  color: isActive ? (isLight ? 'hsl(220 20% 14%)' : 'hsl(0 0% 82%)') : (isLight ? 'hsl(220 12% 40%)' : 'hsl(0 0% 55%)'),
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: linked ? 2 : 3,
                }}>
                  {doc.title || 'Untitled'}
                </div>
                {linked && (
                  <div style={{
                    fontSize: 9, color: isLight ? 'hsl(158 48% 36%)' : 'hsl(158 64% 28%)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 2,
                  }}>
                    → {linked.title}
                  </div>
                )}
                <div style={{ fontSize: 9, color: isLight ? 'hsl(220 8% 54%)' : 'hsl(0 0% 26%)' }}>
                  {reltime(doc.updated_at)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: isLight ? 'hsl(0 0% 98%)' : 'hsl(0 0% 10%)' }}>

        {!activeDoc && !loadingDoc && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: 10, color: isLight ? 'hsl(220 12% 40%)' : 'hsl(0 0% 22%)' }}>
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
            <div style={{ fontSize: 10, color: isLight ? 'hsl(220 12% 40%)' : 'hsl(0 0% 22%)' }}>
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
            isLight={isLight}
          />
        )}
      </div>
    </div>
  )
}
