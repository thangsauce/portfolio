'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiPrivate } from '@/lib/api'
import { useDashboardTheme } from './theme-context'

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
function StatCard({ label, value, sub, color, loaded, isLight }: {
  label: string; value: number; sub: string; color: string; loaded: boolean; isLight: boolean
}) {
  return (
    <div style={{
      background: isLight ? 'hsl(0 0% 100%)' : 'hsl(226 12% 11%)',
      border: `1px solid ${isLight ? 'hsl(220 8% 90%)' : 'hsl(226 10% 16%)'}`,
      borderRadius: 14,
      padding: '20px 20px 18px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: isLight ? 'hsl(220 12% 44%)' : 'hsl(220 8% 48%)',
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
        color: loaded
          ? (isLight ? 'hsl(220 20% 16%)' : 'hsl(220 15% 90%)')
          : (isLight ? 'hsl(220 8% 82%)' : 'hsl(220 8% 24%)'),
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
  const { isLight } = useDashboardTheme()
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

  const cardBg     = isLight ? 'hsl(0 0% 100%)'        : 'hsl(226 12% 11%)'
  const cardBorder = isLight ? 'hsl(220 8% 90%)'        : 'hsl(226 10% 16%)'
  const headingCol = isLight ? 'hsl(220 20% 16%)'       : 'hsl(220 15% 90%)'
  const subCol     = isLight ? 'hsl(220 10% 46%)'       : 'hsl(220 6% 42%)'
  const sectionHd  = isLight ? 'hsl(220 16% 32%)'       : 'hsl(220 10% 58%)'
  const dividerCol = isLight ? 'hsl(220 8% 92%)'        : 'hsl(226 10% 13%)'
  const keyCol     = isLight ? 'hsl(220 14% 36%)'       : 'hsl(220 8% 52%)'
  const dotCol     = isLight ? 'hsl(220 6% 68%)'        : 'hsl(220 6% 28%)'
  const valCol     = isLight ? 'hsl(220 10% 50%)'       : 'hsl(220 7% 38%)'
  const tileNormal = isLight ? 'hsl(220 12% 96%)'       : 'hsl(226 12% 13%)'
  const tileBorder = isLight ? 'hsl(220 8% 88%)'        : 'hsl(226 10% 15%)'
  const tileLabelN = isLight ? 'hsl(220 18% 28%)'       : 'hsl(220 10% 62%)'
  const tileLabelH = isLight ? 'hsl(158 48% 36%)'       : 'hsl(158 58% 60%)'
  const tileSub    = isLight ? 'hsl(220 10% 52%)'       : 'hsl(220 6% 34%)'
  const clockCol   = isLight ? 'hsl(220 16% 30%)'       : 'hsl(220 10% 62%)'
  const clockSub   = isLight ? 'hsl(220 10% 52%)'       : 'hsl(220 6% 34%)'

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
            color: headingCol, margin: '0 0 5px',
          }}>
            {greeting || 'Welcome back'}
          </h1>
          <p style={{
            fontSize: 13, color: subCol, margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {date}
          </p>
        </div>

        {/* Clock */}
        <div style={{
          padding: '10px 18px',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 12,
          textAlign: 'right',
        }}>
          <div style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 22, letterSpacing: '0.04em',
            color: clockCol,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {time}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 400,
            color: clockSub, marginTop: 5,
            letterSpacing: '-0.01em',
          }}>
            Local time
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
            isLight={isLight}
          />
        ))}
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>

        {/* System status */}
        <div style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 14,
          padding: '20px',
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
            color: sectionHd,
            margin: '0 0 16px',
          }}>
            System Status
          </h3>
          {SYSTEM.map(({ key, val }) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: `1px solid ${dividerCol}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: 'hsl(158 64% 42%)',
                  boxShadow: '0 0 5px hsl(158 64% 42% / 0.5)',
                }} />
                <span style={{
                  fontSize: 13, color: keyCol, letterSpacing: '-0.01em',
                }}>
                  {key}
                </span>
                <span style={{ fontSize: 13, color: dotCol }}>·</span>
                <span style={{
                  fontSize: 12, color: valCol, letterSpacing: '-0.01em',
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
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 14,
          padding: '20px',
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
            color: sectionHd,
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
                  borderRadius: 12,
                  border: `1px solid ${hovered === href ? 'hsl(158 64% 42% / 0.3)' : tileBorder}`,
                  background: hovered === href
                    ? (isLight ? 'hsl(158 64% 42% / 0.06)' : 'hsl(158 64% 42% / 0.07)')
                    : tileNormal,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(href)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{
                  fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
                  color: hovered === href ? tileLabelH : tileLabelN,
                  marginBottom: 4,
                  transition: 'color 0.15s',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 11, color: tileSub, letterSpacing: '-0.01em',
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
