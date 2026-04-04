'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch, apiPrivate } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────────────
type Stats = { notes: number; pending: number; learning: number; docs: number }
type HealthState = 'operational' | 'degraded' | 'down'
type HealthService = { key: string; val: string; status: HealthState; error?: string | null }
type HealthPayload = {
  ok: boolean
  timestamp: string
  services: {
    api: HealthService
    auth: HealthService
    db: HealthService
    deploy: HealthService
  }
}

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
      background: 'hsl(var(--dash-card))',
      border: '1px solid hsl(var(--dash-border))',
      borderRadius: 14,
      padding: '20px 20px 18px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: 'hsl(var(--dash-fg-dim))',
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
        color: loaded ? 'hsl(var(--dash-fg))' : 'hsl(var(--dash-border))',
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
  const [health,   setHealth]   = useState<HealthPayload | null>(null)
  const [hovered,  setHovered]  = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)

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

    apiFetch<HealthPayload>('/health')
      .then((res) => setHealth(res))
      .catch(() => setHealth(null))

    return () => {
      clearInterval(id)
      mq.removeEventListener('change', onChange)
    }
  }, [])

  const systemRows = health
    ? [health.services.api, health.services.auth, health.services.db, health.services.deploy]
    : SYSTEM.map((s) => ({ ...s, status: 'degraded' as HealthState }))

  const statusTheme = (status: HealthState) => {
    if (status === 'operational') {
      return {
        dot: 'hsl(158 64% 42%)',
        dotShadow: '0 0 5px hsl(158 64% 42% / 0.5)',
        pillColor: 'hsl(158 58% 46%)',
        pillBg: 'hsl(158 64% 42% / 0.1)',
        label: 'Operational',
      }
    }
    if (status === 'degraded') {
      return {
        dot: 'hsl(40 90% 55%)',
        dotShadow: '0 0 5px hsl(40 90% 55% / 0.45)',
        pillColor: 'hsl(40 90% 56%)',
        pillBg: 'hsl(40 90% 56% / 0.12)',
        label: 'Degraded',
      }
    }
    return {
      dot: 'hsl(0 62% 52%)',
      dotShadow: '0 0 5px hsl(0 62% 52% / 0.45)',
      pillColor: 'hsl(0 62% 55%)',
      pillBg: 'hsl(0 62% 55% / 0.12)',
      label: 'Down',
    }
  }

  return (
    <div
      className={`transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ maxWidth: 960, fontFamily: 'var(--font-roboto-flex)' }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'flex-end',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        gap: isMobile ? 12 : 0,
        marginBottom: 20,
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? 20 : 24, fontWeight: 600, letterSpacing: '-0.02em',
            color: 'hsl(var(--dash-fg))', margin: '0 0 5px',
          }}>
            {greeting || 'Welcome back'}
          </h1>
          <p style={{
            fontSize: isMobile ? 12 : 13, color: 'hsl(var(--dash-fg-muted))', margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {date}
          </p>
        </div>

        {/* Clock */}
        <div style={{
          padding: isMobile ? '8px 12px' : '10px 18px',
          background: 'hsl(var(--dash-card))',
          border: '1px solid hsl(var(--dash-border))',
          borderRadius: 12,
          textAlign: isMobile ? 'left' : 'right',
        }}>
          <div style={{
            fontFamily: 'var(--font-anton)',
            fontSize: isMobile ? 18 : 22, letterSpacing: '0.04em',
            color: 'hsl(var(--dash-fg-muted))',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {time}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 400,
            color: 'hsl(var(--dash-fg-muted))', marginTop: 5,
            letterSpacing: '-0.01em',
          }}>
            Local time
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12,
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginTop: 12 }}>

        {/* System status */}
        <div style={{
          background: 'hsl(var(--dash-card))',
          border: '1px solid hsl(var(--dash-border))',
          borderRadius: 14,
          padding: '20px',
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
            color: 'hsl(var(--dash-fg-muted))',
            margin: '0 0 16px',
          }}>
            System Status
          </h3>
          {systemRows.map(({ key, val, status }) => {
            const tone = statusTheme(status)
            return (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid hsl(var(--dash-border-subtle))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: tone.dot,
                  boxShadow: tone.dotShadow,
                }} />
                <span style={{
                  fontSize: 13, color: 'hsl(var(--dash-fg-muted))', letterSpacing: '-0.01em',
                }}>
                  {key}
                </span>
                <span style={{ fontSize: 13, color: 'hsl(var(--dash-border))' }}>·</span>
                <span style={{
                  fontSize: 12, color: 'hsl(var(--dash-fg-dim))', letterSpacing: '-0.01em',
                }}>
                  {val}
                </span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: tone.pillColor,
                background: tone.pillBg,
                padding: '2px 8px', borderRadius: 4,
              }}>
                {tone.label}
              </span>
            </div>
          )})}
        </div>

        {/* Quick access */}
        <div style={{
          background: 'hsl(var(--dash-card))',
          border: '1px solid hsl(var(--dash-border))',
          borderRadius: 14,
          padding: '20px',
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
            color: 'hsl(var(--dash-fg-muted))',
            margin: '0 0 14px',
          }}>
            Quick Access
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
            {QUICK.map(({ label, sub, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'block',
                  padding: '14px',
                  borderRadius: 12,
                  border: `1px solid ${hovered === href ? 'hsl(158 64% 42% / 0.3)' : 'hsl(var(--dash-border))'}`,
                  background: hovered === href
                    ? 'hsl(158 64% 42% / 0.07)'
                    : 'hsl(var(--dash-bg))',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(href)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{
                  fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
                  color: hovered === href ? 'hsl(158 58% 60%)' : 'hsl(var(--dash-fg))',
                  marginBottom: 4,
                  transition: 'color 0.15s',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 11, color: 'hsl(var(--dash-fg-dim))', letterSpacing: '-0.01em',
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
