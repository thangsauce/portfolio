'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [posts,   setPosts]   = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<PostItem[]>('/api/blog')
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="relative min-h-screen pt-28 pb-20 md:pt-36">
      <div className="container max-w-5xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-primary font-mono text-xl leading-none select-none">&lt;</span>
          <h2 className="text-xl uppercase leading-none tracking-widest">BLOG</h2>
          <span className="text-primary font-mono text-xl leading-none select-none">&gt;</span>
        </div>

        <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase tracking-[0.08em] text-foreground mb-4">
          Thoughts & Notes
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed mb-12">
          Writing about projects, lessons, and experiments in web development, cybersecurity, and IT systems.
        </p>

        {loading && (
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
            Loading posts...
          </p>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
            No posts yet.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PostRow({ post }: { post: PostItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block text-inherit no-underline">
      <article className="group rounded-xl border border-border bg-background-light/35 px-5 py-5 sm:px-6 sm:py-6 transition-all duration-300 hover:border-primary/45 hover:bg-background-light/55">
        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-3">
          {post.published_at ? <span>{formatDate(post.published_at)}</span> : <span>Draft</span>}
        </div>

        <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-[0.06em] leading-tight text-foreground transition-colors duration-300 group-hover:text-primary mb-3">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 max-w-3xl">
            {post.excerpt}
          </p>
        )}

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
