'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { apiFetch } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  tags: string[]
  published_at: string | null
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BlogPostClient({
  slug,
  onBack,
}: {
  slug: string
  onBack?: () => void
}) {
  const [post,     setPost]     = useState<Post | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    apiFetch<Post>(`/api/blog/${slug}`)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'var(--font-roboto-flex)',
      padding: '96px 24px 96px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Back link */}
        <BackLink onBack={onBack} />

        {loading && (
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'hsl(0 0% 24%)', textTransform: 'uppercase' }}>
            // loading...
          </div>
        )}

        {notFound && (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{
              fontFamily: 'var(--font-anton)', fontSize: 72,
              letterSpacing: '0.05em', color: 'hsl(0 0% 14%)', marginBottom: 16,
            }}>
              404
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'hsl(0 0% 26%)', textTransform: 'uppercase' }}>
              // post not found
            </div>
          </div>
        )}

        {post && (
          <>
            {/* Header */}
            <header style={{ marginBottom: 52, borderBottom: '1px solid hsl(0 0% 11%)', paddingBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.2em', color: 'hsl(var(--foreground) / 0.72)', textTransform: 'uppercase' }}>
                  {formatDate(post.published_at ?? post.created_at)} · {formatTime(post.published_at ?? post.created_at)}
                </span>
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

              <h1 style={{
                fontFamily: 'var(--font-anton)',
                fontSize: 'clamp(34px, 6vw, 60px)',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                color: 'hsl(0 0% 92%)',
                lineHeight: 1.0, margin: 0,
              }}>
                {post.title}
              </h1>
            </header>

            {/* Markdown */}
            <div style={{ fontSize: 16, lineHeight: 1.75, color: 'hsl(0 0% 68%)' }}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 style={{
                      fontFamily: 'var(--font-anton)', fontSize: 38,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      color: 'hsl(0 0% 88%)', margin: '52px 0 20px', lineHeight: 1.05,
                    }}>{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 style={{
                      fontFamily: 'var(--font-anton)', fontSize: 28,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      color: 'hsl(0 0% 84%)', margin: '44px 0 16px', lineHeight: 1.1,
                    }}>{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 style={{
                      fontSize: 18, fontWeight: 600,
                      color: 'hsl(0 0% 76%)', margin: '36px 0 12px',
                    }}>{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 style={{
                      fontSize: 15, fontWeight: 600, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: 'hsl(0 0% 55%)',
                      margin: '28px 0 10px',
                    }}>{children}</h4>
                  ),
                  p: ({ children }) => (
                    <p style={{ margin: '0 0 22px' }}>{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul style={{ margin: '0 0 22px', paddingLeft: 0, listStyle: 'none' }}>{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol style={{ margin: '0 0 22px', paddingLeft: 22 }}>{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li style={{
                      marginBottom: 8, paddingLeft: 20, position: 'relative',
                    }}>
                      <span style={{
                        position: 'absolute', left: 0, top: '0.45em',
                        width: 6, height: 6,
                        background: 'hsl(158 64% 36%)',
                        display: 'inline-block', flexShrink: 0,
                      }} />
                      {children}
                    </li>
                  ),
                  pre: ({ children }) => (
                    <pre style={{
                      background: 'hsl(0 0% 8%)',
                      border: '1px solid hsl(0 0% 15%)',
                      padding: '18px 22px', margin: '0 0 24px',
                      overflowX: 'auto', lineHeight: 1.65,
                    }}>{children}</pre>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = !!className
                    if (isBlock) {
                      return (
                        <code style={{
                          fontFamily: 'monospace', fontSize: 13,
                          color: 'hsl(0 0% 62%)', display: 'block',
                        }}>{children}</code>
                      )
                    }
                    return (
                      <code style={{
                        background: 'hsl(0 0% 11%)',
                        border: '1px solid hsl(0 0% 18%)',
                        padding: '1px 6px',
                        fontFamily: 'monospace', fontSize: 13,
                        color: 'hsl(158 64% 48%)',
                      }}>{children}</code>
                    )
                  },
                  blockquote: ({ children }) => (
                    <blockquote style={{
                      margin: '0 0 24px',
                      padding: '14px 22px',
                      borderLeft: '3px solid hsl(158 64% 36%)',
                      background: 'hsl(158 64% 36% / 0.05)',
                      color: 'hsl(0 0% 54%)',
                    }}>{children}</blockquote>
                  ),
                  hr: () => (
                    <hr style={{ border: 'none', borderTop: '1px solid hsl(0 0% 13%)', margin: '44px 0' }} />
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noreferrer" style={{
                      color: 'hsl(158 64% 48%)',
                      textDecoration: 'underline',
                      textDecorationColor: 'hsl(158 64% 36% / 0.4)',
                    }}>{children}</a>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: 'hsl(0 0% 84%)', fontWeight: 600 }}>{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em style={{ color: 'hsl(0 0% 60%)', fontStyle: 'italic' }}>{children}</em>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 72, paddingTop: 32, borderTop: '1px solid hsl(0 0% 11%)' }}>
              <BackLink onBack={onBack} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function BackLink({ onBack }: { onBack?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href="/blog"
      onClick={() => onBack?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
        color: hovered ? '#ffffff' : 'hsl(var(--foreground) / 0.7)',
        textShadow: hovered ? '0 0 10px rgba(255,255,255,0.55)' : 'none',
        textDecoration: 'none', marginBottom: 52,
        transition: 'color 0.12s, text-shadow 0.12s',
      }}
    >
      ← blog
    </Link>
  )
}
