'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiPrivate } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type PostItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  tags: string[]
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

type Post = PostItem & { content: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'untitled'
}

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
function IcPanel()  { return <svg {...sv}><rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/><line x1="6" y1="2.5" x2="6" y2="13.5"/></svg> }

// ─── Post Editor ──────────────────────────────────────────────────────────────
function PostEditor({
  post,
  onSave,
  onDelete,
  onPublishToggle,
}: {
  post: Post
  onSave: (id: string, data: Partial<Post>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onPublishToggle: (id: string, published: boolean) => Promise<void>
}) {
  const [title,      setTitle]      = useState(post.title)
  const [slug,       setSlug]       = useState(post.slug)
  const [tags,       setTags]       = useState(post.tags.join(', '))
  const [excerpt,    setExcerpt]    = useState(post.excerpt ?? '')
  const [content,    setContent]    = useState(post.content)
  const [status,     setStatus]     = useState<'idle' | 'saving' | 'saved'>('idle')
  const [confirmDel, setConfirmDel] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  const titleRef   = useRef(post.title)
  const slugRef    = useRef(post.slug)
  const tagsRef    = useRef(post.tags.join(', '))
  const excerptRef = useRef(post.excerpt ?? '')
  const contentRef = useRef(post.content)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const changeConfirmedRef = useRef(false)

  useEffect(() => {
    setTitle(post.title);   titleRef.current   = post.title
    setSlug(post.slug);     slugRef.current    = post.slug
    const t = post.tags.join(', ')
    setTags(t);             tagsRef.current    = t
    setExcerpt(post.excerpt ?? ''); excerptRef.current = post.excerpt ?? ''
    setContent(post.content); contentRef.current = post.content
    setSlugManual(false)
    changeConfirmedRef.current = false
    setStatus('idle')
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [post.id])

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('saving')
    timerRef.current = setTimeout(async () => {
      try {
        if (!changeConfirmedRef.current) {
          const confirmed = window.confirm('Are you sure you want to apply these blog changes?')
          if (!confirmed) {
            setStatus('idle')
            return
          }
          changeConfirmedRef.current = true
        }
        const parsedTags = tagsRef.current.split(',').map(t => t.trim()).filter(Boolean)
        await onSave(post.id, {
          title:   titleRef.current,
          slug:    slugRef.current,
          tags:    parsedTags,
          excerpt: excerptRef.current || null,
          content: contentRef.current,
        })
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2500)
      } catch {
        setStatus('idle')
      }
    }, 2000)
  }, [post.id, onSave])

  function handleTitle(val: string) {
    setTitle(val); titleRef.current = val
    if (!slugManual) {
      const derived = toSlug(val)
      setSlug(derived); slugRef.current = derived
    }
    scheduleSave()
  }

  function handleSlug(val: string) {
    setSlug(val); slugRef.current = val
    setSlugManual(true)
    scheduleSave()
  }

  function handleTags(val: string)    { setTags(val);    tagsRef.current    = val; scheduleSave() }
  function handleExcerpt(val: string) { setExcerpt(val); excerptRef.current = val; scheduleSave() }
  function handleContent(val: string) { setContent(val); contentRef.current = val; scheduleSave() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '18px 36px 0', flexShrink: 0,
        borderBottom: '1px solid hsl(var(--dash-border-subtle))',
      }}>
        {/* Save status */}
        <div style={{
          fontSize: 11,
          height: 14, marginBottom: 12,
          color: status === 'saved' ? 'hsl(158 64% 42%)' : status === 'saving' ? 'hsl(var(--dash-fg-dim))' : 'transparent',
          transition: 'color 0.2s',
          fontFamily: 'var(--font-roboto-flex)',
        }}>
          {status === 'saved' ? 'Saved' : 'Saving...'}
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={e => handleTitle(e.target.value)}
          placeholder="Post title"
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            fontFamily: 'var(--font-anton)',
            fontSize: 24, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'hsl(var(--dash-fg))', caretColor: 'hsl(158 64% 36%)',
            marginBottom: 14,
          }}
        />

        {/* Slug + Tags */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, color: 'hsl(var(--dash-fg-dim))', flexShrink: 0, fontFamily: 'var(--font-roboto-flex)' }}>Slug</span>
            <input
              value={slug}
              onChange={e => handleSlug(e.target.value)}
              placeholder="post-slug"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.04em',
                color: 'hsl(158 64% 36%)', caretColor: 'hsl(158 64% 36%)',
                flex: 1, minWidth: 0,
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, color: 'hsl(var(--dash-fg-dim))', flexShrink: 0, fontFamily: 'var(--font-roboto-flex)' }}>Tags</span>
            <input
              value={tags}
              onChange={e => handleTags(e.target.value)}
              placeholder="tag1, tag2"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontFamily: 'var(--font-roboto-flex)', fontSize: 11, letterSpacing: '0.04em',
                color: 'hsl(var(--dash-fg-muted))', caretColor: 'hsl(158 64% 36%)',
                flex: 1, minWidth: 0,
              }}
            />
          </div>
        </div>

        {/* Excerpt */}
        <textarea
          value={excerpt}
          onChange={e => handleExcerpt(e.target.value)}
          placeholder="Excerpt (optional)..."
          rows={2}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'none', border: 'none', outline: 'none', resize: 'none',
            fontFamily: 'var(--font-roboto-flex)', fontSize: 12, letterSpacing: '0.03em',
            color: 'hsl(var(--dash-fg-muted))', caretColor: 'hsl(158 64% 36%)',
            marginBottom: 16, lineHeight: 1.55,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '14px 36px 0', display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={content}
          onChange={e => handleContent(e.target.value)}
          placeholder="Write in markdown..."
          style={{
            flex: 1, width: '100%', boxSizing: 'border-box',
            background: 'none', border: 'none', outline: 'none', resize: 'none',
            fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.02em',
            color: 'hsl(var(--dash-fg-muted))', caretColor: 'hsl(158 64% 36%)',
            lineHeight: 1.7,
          }}
        />
      </div>

      {/* Bottom bar */}
      <div style={{
        flexShrink: 0, padding: '12px 36px',
        borderTop: '1px solid hsl(var(--dash-border-subtle))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={() => onPublishToggle(post.id, !post.published)}
            style={{
              fontSize: 11,
              color: post.published ? 'hsl(0 62% 52%)' : 'hsl(158 64% 42%)',
              background: 'none',
              border: `1px solid ${post.published ? 'hsl(0 62% 52% / 0.28)' : 'hsl(158 64% 36% / 0.28)'}`,
              borderRadius: 6,
              padding: '4px 12px', cursor: 'pointer', transition: 'all 0.12s',
              fontFamily: 'var(--font-roboto-flex)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {post.published ? 'Unpublish' : 'Publish'}
          </button>

          <span style={{
            fontSize: 10,
            color: post.published ? 'hsl(158 64% 40%)' : 'hsl(var(--dash-fg-dim))',
            fontFamily: 'var(--font-roboto-flex)',
          }}>
            {post.published ? 'live' : 'draft'}
          </span>
        </div>

        <div>
          {confirmDel ? (
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => onDelete(post.id)} style={{ color: 'hsl(0 62% 52%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: 'var(--font-roboto-flex)' }}>Delete</button>
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
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BlogDashboardPage() {
  const [posts,       setPosts]       = useState<PostItem[]>([])
  const [activePost,  setActivePost]  = useState<Post | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [loadingPost, setLoadingPost] = useState(false)
  const [creating,    setCreating]    = useState(false)
  const [search,      setSearch]      = useState('')
  const [hoveredId,   setHoveredId]   = useState<string | null>(null)
  const [leftWidth, setLeftWidth] = useState(280)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [resizing, setResizing] = useState(false)

  const BLOG_LEFT_MIN = 240
  const BLOG_LEFT_MAX = 560
  const BLOG_LEFT_WIDTH_KEY = 'dashboard.blog.leftWidth'
  const BLOG_LEFT_COLLAPSED_KEY = 'dashboard.blog.leftCollapsed'

  useEffect(() => {
    const savedWidth = window.localStorage.getItem(BLOG_LEFT_WIDTH_KEY)
    const savedCollapsed = window.localStorage.getItem(BLOG_LEFT_COLLAPSED_KEY)
    const parsedWidth = Number(savedWidth)
    if (!Number.isNaN(parsedWidth) && parsedWidth >= BLOG_LEFT_MIN && parsedWidth <= BLOG_LEFT_MAX) {
      setLeftWidth(parsedWidth)
    }
    setLeftCollapsed(savedCollapsed === '1')
  }, [])

  useEffect(() => {
    window.localStorage.setItem(BLOG_LEFT_WIDTH_KEY, String(leftWidth))
  }, [leftWidth])

  useEffect(() => {
    window.localStorage.setItem(BLOG_LEFT_COLLAPSED_KEY, leftCollapsed ? '1' : '0')
  }, [leftCollapsed])

  useEffect(() => {
    if (!resizing) return
    const onMove = (e: MouseEvent) => {
      const next = Math.max(BLOG_LEFT_MIN, Math.min(BLOG_LEFT_MAX, e.clientX))
      setLeftWidth(next)
    }
    const onUp = () => {
      setResizing(false)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [resizing])

  useEffect(() => {
    apiPrivate<PostItem[]>('/blog')
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function selectPost(id: string) {
    if (activePost?.id === id) return
    setLoadingPost(true)
    try {
      const post = await apiPrivate<Post>(`/blog/${id}`)
      setActivePost(post)
    } catch {}
    setLoadingPost(false)
  }

  async function createPost() {
    setCreating(true)
    try {
      const slug = `post-${Date.now()}`
      const post = await apiPrivate<Post>('/blog', {
        method: 'POST',
        body: JSON.stringify({ title: 'Untitled', slug, content: '', published: false, tags: [] }),
      })
      const item: PostItem = {
        id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt,
        tags: post.tags, published: post.published, published_at: post.published_at,
        created_at: post.created_at, updated_at: post.updated_at,
      }
      setPosts(prev => [item, ...prev])
      setActivePost(post)
    } catch {}
    setCreating(false)
  }

  const savePost = useCallback(async (id: string, data: Partial<Post>) => {
    await apiPrivate(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p))
    setActivePost(prev => prev?.id === id ? { ...prev, ...data } : prev)
  }, [])

  async function deletePost(id: string) {
    try {
      await apiPrivate(`/blog/${id}`, { method: 'DELETE' })
      setPosts(prev => prev.filter(p => p.id !== id))
      if (activePost?.id === id) setActivePost(null)
    } catch {}
  }

  async function togglePublish(id: string, published: boolean) {
    const patch: Partial<Post> = { published }
    if (published) patch.published_at = new Date().toISOString()
    await savePost(id, patch)
  }

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{
      display: 'flex',
      position: 'relative',
      height: 'calc(100vh - 44px)',
      margin: '-32px -28px',
      fontFamily: 'var(--font-roboto-flex)',
      overflow: 'hidden',
    }}>

      {leftCollapsed && (
        <button
          onClick={() => setLeftCollapsed(false)}
          title="Show posts panel"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'hsl(var(--dash-fg-muted))',
            background: 'hsl(var(--dash-panel))',
            border: '1px solid hsl(var(--dash-border))',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          <IcPanel /> posts
        </button>
      )}

      {/* ── Left panel ──────────────────────────────────── */}
      <div style={{
        width: leftCollapsed ? 0 : leftWidth,
        minWidth: leftCollapsed ? 0 : leftWidth,
        flexShrink: 0,
        background: 'hsl(var(--dash-panel))',
        borderRight: leftCollapsed ? 'none' : '1px solid hsl(var(--dash-border))',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: resizing ? 'none' : 'width 0.18s ease',
      }}>

        {/* Header */}
        <div style={{
          padding: '14px 14px 12px',
          borderBottom: '1px solid hsl(var(--dash-border-subtle))',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <span style={{ fontSize: 11, color: 'hsl(var(--dash-fg-dim))' }}>
              Posts
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setLeftCollapsed(true)}
                title="Minimize posts panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  color: 'hsl(var(--dash-fg-dim))',
                  background: 'none',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.12s',
                  fontFamily: 'var(--font-roboto-flex)',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'hsl(var(--dash-fg-muted))' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'hsl(var(--dash-fg-dim))' }}
              >
                <IcPanel />
              </button>
              <button onClick={createPost} disabled={creating}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11,
                  color: creating ? 'hsl(var(--dash-fg-dim))' : 'hsl(158 64% 42%)',
                  background: 'none', border: 'none',
                  borderRadius: 6,
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
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
              color: 'hsl(var(--dash-fg-dim))',
              pointerEvents: 'none', display: 'flex',
            }}>
              <IcSearch />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="search posts..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '6px 10px 6px 28px',
                background: 'hsl(var(--dash-input))',
                border: '1px solid hsl(var(--dash-border))',
                borderRadius: 6,
                color: 'hsl(var(--dash-fg))',
                fontSize: 11, letterSpacing: '0.04em',
                outline: 'none', fontFamily: 'var(--font-roboto-flex)',
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '16px 14px', fontSize: 11, color: 'hsl(var(--dash-fg-dim))' }}>
              Loading...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: '16px 14px', fontSize: 11, color: 'hsl(var(--dash-fg-dim))' }}>
              No posts yet
            </div>
          )}
          {filtered.map(post => {
            const isActive = activePost?.id === post.id
            const isHov    = hoveredId === post.id
            return (
              <div key={post.id}
                onClick={() => selectPost(post.id)}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  borderLeft: `2px solid ${isActive ? 'hsl(158 64% 36%)' : 'transparent'}`,
                  background: isActive ? 'hsl(158 64% 36% / 0.07)' : isHov ? 'hsl(var(--dash-bg))' : 'transparent',
                  transition: 'all 0.1s', cursor: 'pointer',
                  padding: '10px 12px 10px 10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <div style={{
                    fontSize: 12, letterSpacing: '0.03em',
                    color: isActive ? 'hsl(var(--dash-fg))' : 'hsl(var(--dash-fg-muted))',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1, marginRight: 8,
                  }}>
                    {post.title || 'Untitled'}
                  </div>
                  <span style={{
                    fontSize: 9, letterSpacing: '0.06em', flexShrink: 0,
                    color: post.published ? 'hsl(158 64% 42%)' : 'hsl(var(--dash-fg-dim))',
                  }}>
                    {post.published ? 'live' : 'draft'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'hsl(var(--dash-fg-dim))' }}>
                  {reltime(post.updated_at)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!leftCollapsed && (
        <div
          onMouseDown={() => setResizing(true)}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize blog list panel"
          style={{
            width: 6,
            cursor: 'col-resize',
            background: 'transparent',
            position: 'relative',
            zIndex: 2,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--dash-border-subtle))' }}
          onMouseLeave={e => { if (!resizing) e.currentTarget.style.background = 'transparent' }}
        />
      )}

      {/* ── Right panel ─────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'hsl(var(--dash-content))',
      }}>

        {!activePost && !loadingPost && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: 11, color: 'hsl(var(--dash-fg-dim))' }}>
              Select a post to start
            </div>
            <button onClick={createPost}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 11,
                color: 'hsl(158 64% 42%)',
                background: 'none', border: '1px solid hsl(158 64% 18%)',
                borderRadius: 8,
                padding: '7px 18px', cursor: 'pointer', transition: 'all 0.12s',
                fontFamily: 'var(--font-roboto-flex)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'hsl(158 64% 58%)'; e.currentTarget.style.borderColor = 'hsl(158 64% 30%)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'hsl(158 64% 42%)'; e.currentTarget.style.borderColor = 'hsl(158 64% 18%)' }}
            >
              <IcPlus /> new post
            </button>
          </div>
        )}

        {loadingPost && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, color: 'hsl(var(--dash-fg-dim))' }}>
              Loading...
            </div>
          </div>
        )}

        {activePost && !loadingPost && (
          <PostEditor
            key={activePost.id}
            post={activePost}
            onSave={savePost}
            onDelete={deletePost}
            onPublishToggle={togglePublish}
          />
        )}
      </div>
    </div>
  )
}
