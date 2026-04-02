'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiPrivate } from '@/lib/api'

// ── Types ───────────────────────────────────────────────────────────────────
type Stats = { notes: number; pending: number; learning: number; docs: number }

// ── Config ──────────────────────────────────────────────────────────────────
const SYSTEM = [
  { key: 'api',    val: 'api.thangle.me' },
  { key: 'auth',   val: 'supabase'       },
  { key: 'db',     val: 'postgresql'     },
  { key: 'deploy', val: 'cloudflare'     },
]

const QUICK = [
  { label: 'portfolio',  sub: 'manage cms',   href: '/dashboard/portfolio' },
  { label: 'new note',   sub: 'open editor',  href: '/dashboard/notes'     },
  { label: 'todos',      sub: 'task board',   href: '/dashboard/todos'     },
  { label: 'write post', sub: 'blog editor',  href: '/dashboard/blog'      },
]

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, cmd, borderGrad, loaded }: {
  label: string; value: number; cmd: string
  borderGrad: string; loaded: boolean
}) {
  return (
    <div style={{ padding: 1, background: borderGrad }}>
      <div style={{ background: 'hsl(222 14% 8%)', padding: '20px 18px 16px' }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'hsl(220 7% 32%)', marginBottom: 14,
        }}>
          {cmd}
        </div>
        <div style={{
          fontFamily: 'var(--font-anton)',
          fontSize: 44, letterSpacing: '0.02em', lineHeight: 1,
          color: loaded ? 'hsl(220 12% 86%)' : 'hsl(220 8% 26%)',
          marginBottom: 8,
          transition: 'color 0.4s',
        }}>
          {loaded ? value : '—'}
        </div>
        <div style={{
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'lowercase',
          color: 'hsl(220 7% 34%)',
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [time,     setTime]     = useState('')
  const [date,     setDate]     = useState('')
  const [greeting, setGreeting] = useState('')
  const [mounted,  setMounted]  = useState(false)
  const [stats,    setStats]    = useState<Stats | null>(null)
  const [hovered,  setHovered]  = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    function tick() {
      const now = new Date()
      const h   = now.getHours()
      setGreeting(h < 12 ? 'good morning' : h < 17 ? 'good afternoon' : 'good evening')
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)

    Promise.all([
      apiPrivate<{ id: string }[]>('/notes').catch(() => []),
      apiPrivate<{ id: string; status: string }[]>('/todos').catch(() => []),
      apiPrivate<{ id: string; status: string }[]>('/learning').catch(() => []),
      apiPrivate<{ id: string }[]>('/project-docs').catch(() => []),
    ]).then(([notes, todos, learning, docs]) => {
      setStats({
        notes:    notes.length,
        pending:  todos.filter(t => t.status !== 'done').length,
        learning: learning.filter(l => l.status === 'learning').length,
        docs:     docs.length,
      })
    })

    return () => clearInterval(id)
  }, [])

  return (
    <div
      className={`transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ maxWidth: 960, fontFamily: 'var(--font-roboto-flex)' }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 28,
      }}>
        <div>
          <div style={{
            fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'hsl(158 64% 40%)', marginBottom: 8,
          }}>
            // session active
          </div>
          <h1 style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'hsl(220 12% 86%)', lineHeight: 1, margin: '0 0 8px',
          }}>
            {greeting || 'welcome back'}
          </h1>
          <div style={{
            fontSize: 11, color: 'hsl(220 7% 38%)', letterSpacing: '0.06em',
          }}>
            {date}
          </div>
        </div>

        {/* Live clock */}
        <div style={{
          padding: '12px 18px',
          border: '1px solid hsl(222 14% 15%)',
          background: 'hsl(222 14% 8%)',
          textAlign: 'right',
        }}>
          <div style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 26, letterSpacing: '0.08em',
            color: 'hsl(220 10% 68%)',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {time}
          </div>
          <div style={{
            fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'hsl(220 7% 28%)', marginTop: 5,
          }}>
            local time
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
        marginBottom: 12,
      }}>
        <StatCard
          label="total notes"
          value={stats?.notes ?? 0}
          cmd="notes.count()"
          borderGrad="linear-gradient(135deg, hsl(158 64% 36% / 0.55), hsl(222 14% 14%))"
          loaded={stats !== null}
        />
        <StatCard
          label="active tasks"
          value={stats?.pending ?? 0}
          cmd="todos.pending()"
          borderGrad="linear-gradient(135deg, hsl(40 90% 50% / 0.45), hsl(222 14% 14%))"
          loaded={stats !== null}
        />
        <StatCard
          label="in progress"
          value={stats?.learning ?? 0}
          cmd="learning.active()"
          borderGrad="linear-gradient(135deg, hsl(193 100% 47% / 0.38), hsl(222 14% 14%))"
          loaded={stats !== null}
        />
        <StatCard
          label="project docs"
          value={stats?.docs ?? 0}
          cmd="docs.count()"
          borderGrad="linear-gradient(135deg, hsl(280 65% 60% / 0.38), hsl(222 14% 14%))"
          loaded={stats !== null}
        />
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>

        {/* System status */}
        <div style={{
          border: '1px solid hsl(222 13% 15%)',
          background: 'hsl(222 14% 8%)',
          padding: '18px 20px',
        }}>
          <div style={{
            fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'hsl(220 7% 28%)', marginBottom: 16,
          }}>
            // system.status
          </div>
          {SYSTEM.map(({ key, val }) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 0',
              borderBottom: '1px solid hsl(222 13% 12%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                  background: 'hsl(158 64% 42%)',
                  boxShadow: '0 0 5px hsl(158 64% 42% / 0.5)',
                }} />
                <span style={{ fontSize: 11, color: 'hsl(220 7% 34%)', letterSpacing: '0.08em' }}>{key}</span>
                <span style={{ fontSize: 10, color: 'hsl(220 7% 22%)' }}>→</span>
                <span style={{ fontSize: 11, color: 'hsl(220 8% 50%)', letterSpacing: '0.04em' }}>{val}</span>
              </div>
              <span style={{
                fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'hsl(158 64% 44%)',
              }}>
                ok
              </span>
            </div>
          ))}
        </div>

        {/* Quick access */}
        <div style={{
          border: '1px solid hsl(222 13% 15%)',
          background: 'hsl(222 14% 8%)',
          padding: '18px 20px',
        }}>
          <div style={{
            fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'hsl(220 7% 28%)', marginBottom: 14,
          }}>
            // quick.access
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {QUICK.map(({ label, sub, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'block',
                  padding: '12px 14px',
                  border: `1px solid ${hovered === href ? 'hsl(158 64% 36% / 0.35)' : 'hsl(222 13% 14%)'}`,
                  background: hovered === href ? 'hsl(158 64% 36% / 0.07)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(href)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, letterSpacing: '0.05em',
                  color: hovered === href ? 'hsl(158 64% 58%)' : 'hsl(220 8% 48%)',
                  marginBottom: 4,
                  transition: 'color 0.15s',
                }}>
                  <span style={{
                    fontSize: 9,
                    color: hovered === href ? 'hsl(158 64% 44%)' : 'hsl(220 7% 26%)',
                    transition: 'color 0.15s',
                  }}>
                    →
                  </span>
                  {label}
                </div>
                <div style={{
                  fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'hsl(220 7% 28%)',
                }}>
                  {sub}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
