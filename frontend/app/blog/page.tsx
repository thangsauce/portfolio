'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import BlogPostClient from './[slug]/BlogPostClient'

// ─── Types ────────────────────────────────────────────────────────────────────
type PostItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  tags: string[]
  published_at: string | null
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function postTime(post: PostItem): number {
  const raw = post.published_at ?? post.created_at
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? 0 : t
}

function toIsoDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function postIsoDate(post: PostItem): string | null {
  const raw = post.published_at ?? post.created_at
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  return toIsoDate(date)
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [posts,   setPosts]   = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [dateQuery, setDateQuery] = useState('')
  const [page, setPage] = useState(1)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [calendarOffset, setCalendarOffset] = useState({ x: 0, y: 0 })
  const [draggingCalendar, setDraggingCalendar] = useState(false)

  useEffect(() => {
    const syncSlugFromUrl = () => {
      const sp = new URLSearchParams(window.location.search)
      const raw = (sp.get('slug') || '').trim()
      setSelectedSlug(raw.length > 0 ? raw : null)
    }
    syncSlugFromUrl()
    window.addEventListener('popstate', syncSlugFromUrl)
    return () => window.removeEventListener('popstate', syncSlugFromUrl)
  }, [])

  useEffect(() => {
    apiFetch<PostItem[]>('/api/blog')
      .then((data) => {
        const sorted = [...data].sort((a, b) => postTime(b) - postTime(a))
        setPosts(sorted)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (selectedSlug) {
    return <BlogPostClient slug={selectedSlug} />
  }

  const normalizedQuery = query.trim().toLowerCase()
  const postDays = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((post) => {
      const iso = postIsoDate(post)
      if (iso) set.add(iso)
    })
    return set
  }, [posts])

  const filteredPosts = posts.filter((post) => {
    const inText = !normalizedQuery || [
      post.title,
      post.excerpt ?? '',
      post.tags.join(' '),
      post.slug,
    ].join(' ').toLowerCase().includes(normalizedQuery)

    if (!inText) return false
    if (!dateQuery) return true

    const iso = postIsoDate(post)
    if (!iso) return false
    return iso === dateQuery
  })

  const pageSize = 4
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const pagePosts = filteredPosts.slice(pageStart, pageStart + pageSize)

  useEffect(() => {
    setPage(1)
  }, [query, dateQuery])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const monthLabel = calendarMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const year = calendarMonth.getFullYear()
  const month = calendarMonth.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  const calendarCells: Array<{ iso: string; day: number; inMonth: boolean; hasPost: boolean }> = []
  for (let i = 0; i < 42; i += 1) {
    if (i < firstWeekday) {
      const day = prevMonthDays - firstWeekday + i + 1
      const d = new Date(year, month - 1, day)
      const iso = toIsoDate(d)
      calendarCells.push({ iso, day, inMonth: false, hasPost: postDays.has(iso) })
      continue
    }
    if (i < firstWeekday + daysInMonth) {
      const day = i - firstWeekday + 1
      const d = new Date(year, month, day)
      const iso = toIsoDate(d)
      calendarCells.push({ iso, day, inMonth: true, hasPost: postDays.has(iso) })
      continue
    }
    const day = i - (firstWeekday + daysInMonth) + 1
    const d = new Date(year, month + 1, day)
    const iso = toIsoDate(d)
    calendarCells.push({ iso, day, inMonth: false, hasPost: postDays.has(iso) })
  }

  const dragState = useMemo(
    () => ({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 }),
    [],
  )

  const handleCalendarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.active = true
    dragState.startX = e.clientX
    dragState.startY = e.clientY
    dragState.originX = calendarOffset.x
    dragState.originY = calendarOffset.y
    setDraggingCalendar(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleCalendarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.active) return
    const dx = e.clientX - dragState.startX
    const dy = e.clientY - dragState.startY
    setCalendarOffset({
      x: dragState.originX + dx,
      y: dragState.originY + dy,
    })
  }

  const handleCalendarPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.active = false
    setDraggingCalendar(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <section className="relative min-h-screen pt-28 pb-20 md:pt-36">
      <div className="container max-w-5xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-primary font-mono text-xl leading-none select-none">&lt;</span>
          <h2 className="text-xl uppercase leading-none tracking-widest">BLOG</h2>
          <span className="text-primary font-mono text-xl leading-none select-none">&gt;</span>
        </div>

        <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase tracking-[0.08em] text-foreground mb-4">
              Thoughts & Notes
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Projects, lessons, and experiments in web development, cybersecurity, network, or life in general.
            </p>

            <div className="mt-4 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search words..."
                className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary/55"
              />
              <div className="flex items-center justify-start gap-3 text-left">
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 whitespace-nowrap">
                  {dateQuery ? `Date filter: ${dateQuery}` : 'No date filter'}
                </span>
                {dateQuery && (
                  <button
                    type="button"
                    onClick={() => setDateQuery('')}
                    className="h-8 rounded-full border border-border px-3 text-[10px] uppercase tracking-[0.16em] hover:border-primary/45 hover:text-primary transition-colors"
                  >
                    Clear Date
                  </button>
                )}
              </div>
            </div>
          </div>

          <div
            className={`w-full max-w-[260px] rounded-2xl border border-border bg-background-light/40 p-2.5 sm:p-3 select-none ${draggingCalendar ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ transform: `translate(${calendarOffset.x}px, ${calendarOffset.y}px)` }}
            onPointerDown={handleCalendarPointerDown}
            onPointerMove={handleCalendarPointerMove}
            onPointerUp={handleCalendarPointerUp}
            onPointerCancel={handleCalendarPointerUp}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="h-7 w-7 rounded-full border border-border text-xs hover:border-primary/45 hover:text-primary transition-colors"
                aria-label="Previous month"
              >
                ‹
              </button>
              <p className="text-[10px] uppercase tracking-[0.16em] text-foreground/85">{monthLabel}</p>
              <button
                type="button"
                onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="h-7 w-7 rounded-full border border-border text-xs hover:border-primary/45 hover:text-primary transition-colors"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <div key={`${d}-${idx}`} className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                const isSelected = dateQuery === cell.iso
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setDateQuery(cell.iso)}
                    className={`relative h-7 rounded-full text-[11px] transition-colors ${
                      isSelected
                        ? 'border border-primary/60 text-primary bg-primary/10'
                        : cell.inMonth
                          ? 'border border-border/50 text-foreground/90 hover:border-primary/45 hover:text-primary'
                          : 'border border-transparent text-muted-foreground/35 hover:text-muted-foreground/60'
                    }`}
                    aria-label={`Filter by ${cell.iso}`}
                  >
                    <span>{cell.day}</span>
                    {cell.hasPost && (
                      <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary/90" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {loading && (
          <p className="w-full max-w-sm text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
            Loading posts...
          </p>
        )}

        {!loading && filteredPosts.length === 0 && (
          <p className="w-full text-center text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
            No posts yet.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {pagePosts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>

        {!loading && filteredPosts.length > 0 && (
          <div className="pointer-events-none fixed bottom-5 left-1/2 z-20 -translate-x-1/2">
            <div className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-border bg-background/85 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="h-8 rounded-full border border-border px-3 text-[10px] uppercase tracking-[0.16em] disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/45 hover:text-primary transition-colors"
              >
                Prev
              </button>
              <p className="min-w-[92px] text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground/75">
                Page {safePage} / {totalPages}
              </p>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="h-8 rounded-full border border-border px-3 text-[10px] uppercase tracking-[0.16em] disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/45 hover:text-primary transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function PostRow({ post }: { post: PostItem }) {
  const raw = post.published_at ?? post.created_at
  return (
    <Link href={`/blog?slug=${encodeURIComponent(post.slug)}`} className="block text-inherit no-underline">
      <article className="group rounded-xl border border-border bg-background-light/35 px-5 py-5 sm:px-6 sm:py-6 transition-all duration-300 hover:border-primary/45 hover:bg-background-light/55">
        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-3">
          {post.published_at ? (
            <span>{formatDate(raw)} · {formatTime(raw)}</span>
          ) : (
            <span>Draft · {formatDate(raw)} · {formatTime(raw)}</span>
          )}
        </div>

        <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-[0.06em] leading-tight text-foreground transition-colors duration-300 group-hover:text-primary mb-3">
          {post.title}
        </h3>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          {post.excerpt?.trim() || 'No description yet.'}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-[0.2em] text-primary border border-primary/25 px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  )
}
