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
    <div style={{
      minHeight: '100vh',
      fontFamily: 'var(--font-roboto-flex)',
      padding: '96px 24px 80px',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 72 }}>
          <div style={{
            fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase',
            color: 'hsl(158 64% 36%)', marginBottom: 18,
          }}>
            // thangle.me
          </div>
          <h1 style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 'clamp(56px, 10vw, 96px)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'hsl(0 0% 94%)',
            lineHeight: 0.9, margin: 0,
          }}>
            BLOG
          </h1>
        </div>

        {/* States */}
        {loading && (
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'hsl(0 0% 24%)', textTransform: 'uppercase' }}>
            // loading...
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ padding: '48px 0', fontSize: 10, letterSpacing: '0.3em', color: 'hsl(0 0% 24%)', textTransform: 'uppercase' }}>
            // no posts yet
          </div>
        )}

        {/* Post list */}
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}

        {!loading && posts.length > 0 && (
          <div style={{ borderTop: '1px solid hsl(0 0% 12%)' }} />
        )}
      </div>
    </div>
  )
}

function PostRow({ post }: { post: PostItem }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderTop: '1px solid hsl(0 0% 12%)',
          padding: `28px ${hovered ? '12px' : '0'}`,
          margin: `0 ${hovered ? '-12px' : '0'}`,
          display: 'grid',
          gridTemplateColumns: '100px 1fr',
          gap: '0 28px',
          background: hovered ? 'hsl(158 64% 36% / 0.03)' : 'transparent',
          transition: 'all 0.18s ease',
          cursor: 'pointer',
        }}
      >
        {/* Date */}
        <div style={{
          fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'hsl(0 0% 28%)', paddingTop: 5, lineHeight: 1.4,
        }}>
          {post.published_at ? formatDate(post.published_at) : ''}
        </div>

        {/* Content */}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 'clamp(20px, 3vw, 27px)',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            color: hovered ? 'hsl(0 0% 95%)' : 'hsl(0 0% 87%)',
            margin: '0 0 10px', lineHeight: 1.1,
            transition: 'color 0.18s',
          }}>
            {post.title}
          </h2>

          {post.excerpt && (
            <p style={{
              fontSize: 14, lineHeight: 1.65,
              color: 'hsl(0 0% 46%)', margin: '0 0 12px',
            }}>
              {post.excerpt}
            </p>
          )}

          {post.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'hsl(158 64% 36%)',
                  border: '1px solid hsl(158 64% 36% / 0.22)',
                  padding: '2px 8px',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
