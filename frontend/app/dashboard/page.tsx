'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiPrivate } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────────────
type Stats = { notes: number; pending: number; learning: number; docs: number }

// ── Config ───────────────────────────────────────────────────────────────────
const SYSTEM = [
  { key: 'API',    val: 'api.thangle.me' },
  { key: 'Auth',   val: 'Supabase'       },
  { key: 'DB',     val: 'PostgreSQL'     },
  { key: 'Deploy', val: 'Cloudflare'     },
]

const QUICK = [
  { label: 'Portfolio CMS', sub: 'Manage projects',   href: '/dashboard/portfolio' },
  { label: 'Notes',         sub: 'Open editor',       href: '/dashboard/notes'     },
  { label: 'Task Board',    sub: 'View todos',        href: '/dashboard/todos'     },
  { label: 'Write Post',    sub: 'Blog editor',       href: '/dashboard/blog'      },
]

const STAT_COLORS = [
  'hsl(158 64% 42%)',
  'hsl(40 90% 55%)',
  'hsl(193 80% 50%)',
  'hsl(280 60% 62%)',
]

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, loaded }: {
  label: string; value: number; sub: string; color: string; loaded: boolean
}) {
  return (
    <div style={{
      background: 'hsl(226 12% 11%)',
      border: '1px solid hsl(226 10% 16%)',
      borderRadius: 10,
      padding: '20px 20px 18px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: 'hsl(220 8% 48%)',
          letterSpacing: '-0.01em',
        }}>
          {label}
        </span>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, opacity: 0.65,
        }} />
      </div>

      <div style={{
        fontFamily: 'var(--font-anton)',
        fontSize: 44, letterSpacing: '-0.01em', lineHeight: 1,
        color: loaded ? 'hsl(220 15% 90%)' : 'hsl(220 8% 24%)',
        marginBottom: 8,
        transition: 'color 0.4s',
      }}>
        {loaded ? value : '—'}
      </div>

      <div style={{
        fontSize: 11, color: color,
        opacity: 0.75, letterSpacing: '-0.01em',
      }}>
        {sub}
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
      setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
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
          <h1 style={{
            fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em',
            color: 'hsl(220 15% 90%)', margin: '0 0 5px',
          }}>
            {greeting || 'Welcome back'}
          </h1>
          <p style={{
            fontSize: 13, color: 'hsl(220 6% 42%)', margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {date}
          </p>
        </div>

        {/* Clock */}
        <div style={{
          padding: '10px 18px',
          background: 'hsl(226 12% 11%)',
          border: '1px solid hsl(226 10% 16%)',
          borderRadius: 8,
          textAlign: 'right',
        }}>
          <div style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 22, letterSpacing: '0.04em',
            color: 'hsl(220 10% 62%)',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {time}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 500,
            color: 'hsl(220 6% 30%)', marginTop: 5,
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Local Time
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        marginBottom: 12,
      }}>
        {([
          { label: 'Notes',        sub: 'Total created',  value: stats?.notes    ?? 0 },
          { label: 'Active Tasks', sub: 'Not completed',  value: stats?.pending  ?? 0 },
          { label: 'Learning',     sub: 'In progress',    value: stats?.learning ?? 0 },
          { label: 'Project Docs', sub: 'Total docs',     value: stats?.docs     ?? 0 },
        ] as const).map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            sub={s.sub}
            color={STAT_COLORS[i]}
            loaded={stats !== null}
          />
        ))}
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>

        {/* System status */}
        <div style={{
          background: 'hsl(226 12% 11%)',
          border: '1px solid hsl(226 10% 16%)',
          borderRadius: 10,
          padding: '20px',
        }}>
          <h3 style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'hsl(220 6% 36%)',
            margin: '0 0 16px',
          }}>
            System Status
          </h3>
          {SYSTEM.map(({ key, val }) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid hsl(226 10% 13%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: 'hsl(158 64% 42%)',
                  boxShadow: '0 0 5px hsl(158 64% 42% / 0.5)',
                }} />
                <span style={{
                  fontSize: 13, color: 'hsl(220 8% 52%)', letterSpacing: '-0.01em',
                }}>
                  {key}
                </span>
                <span style={{ fontSize: 13, color: 'hsl(220 6% 28%)' }}>·</span>
                <span style={{
                  fontSize: 12, color: 'hsl(220 7% 38%)', letterSpacing: '-0.01em',
                }}>
                  {val}
                </span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: 'hsl(158 58% 46%)',
                background: 'hsl(158 64% 42% / 0.1)',
                padding: '2px 8px', borderRadius: 4,
              }}>
                Operational
              </span>
            </div>
          ))}
        </div>

        {/* Quick access */}
        <div style={{
          background: 'hsl(226 12% 11%)',
          border: '1px solid hsl(226 10% 16%)',
          borderRadius: 10,
          padding: '20px',
        }}>
          <h3 style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'hsl(220 6% 36%)',
            margin: '0 0 14px',
          }}>
            Quick Access
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {QUICK.map(({ label, sub, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'block',
                  padding: '14px',
                  borderRadius: 8,
                  border: `1px solid ${hovered === href ? 'hsl(158 64% 42% / 0.3)' : 'hsl(226 10% 15%)'}`,
                  background: hovered === href ? 'hsl(158 64% 42% / 0.07)' : 'hsl(226 12% 13%)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(href)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{
                  fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
                  color: hovered === href ? 'hsl(158 58% 60%)' : 'hsl(220 10% 62%)',
                  marginBottom: 4,
                  transition: 'color 0.15s',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 11, color: 'hsl(220 6% 34%)', letterSpacing: '-0.01em',
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
