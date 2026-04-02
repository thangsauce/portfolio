'use client'

import { useState, useEffect } from 'react'

const STATS = [
  { label: 'notes',        value: '--', cmd: 'notes.list()',     accent: 'hsl(158 64% 36%)' },
  { label: 'todos',        value: '--', cmd: 'todos.pending()',  accent: 'hsl(40 90% 50%)'  },
  { label: 'lesson',       value: '--', cmd: 'lesson.active()',  accent: 'hsl(193 100% 47%)'},
  { label: 'project docs', value: '--', cmd: 'docs.count()',     accent: 'hsl(280 65% 60%)' },
]

const QUICK_LINKS = [
  { label: 'portfolio cms',  href: '/dashboard/portfolio' },
  { label: 'new note',       href: '/dashboard/notes'     },
  { label: 'todos',          href: '/dashboard/todos'     },
  { label: 'write post',     href: '/dashboard/blog'      },
]

const SYSTEM = [
  { key: 'api',    value: 'api.thangle.me' },
  { key: 'auth',   value: 'supabase'       },
  { key: 'db',     value: 'postgresql'     },
  { key: 'deploy', value: 'cloudflare'     },
]

export default function DashboardPage() {
  const [time, setTime]         = useState('')
  const [date, setDate]         = useState('')
  const [greeting, setGreeting] = useState('')
  const [mounted, setMounted]   = useState(false)
  const [hovered, setHovered]   = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    function tick() {
      const now = new Date()
      const h = now.getHours()
      setGreeting(h < 12 ? 'good morning' : h < 17 ? 'good afternoon' : 'good evening')
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className={`transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ maxWidth: 960, fontFamily: 'var(--font-roboto-flex)' }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <p style={{
          fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase',
          color: 'hsl(158 64% 36%)', marginBottom: 10,
        }}>
          $ initialize_session --mode interactive
        </p>
        <h1 style={{
          fontFamily: 'var(--font-anton)',
          fontSize: 30, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'hsl(0 0% 87%)', lineHeight: 1, marginBottom: 10,
        }}>
          {greeting || 'welcome back'}
        </h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          fontSize: 11, color: 'hsl(0 0% 32%)', letterSpacing: '0.1em',
        }}>
          <span>{date}</span>
          <span style={{ color: 'hsl(0 0% 20%)' }}>|</span>
          <span style={{ color: 'hsl(0 0% 48%)', fontVariantNumeric: 'tabular-nums' }}>{time}</span>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
        marginBottom: 24,
      }}>
        {STATS.map(({ label, value, cmd, accent }) => (
          <div key={label} style={{
            border: '1px solid hsl(0 0% 18%)',
            background: 'hsl(0 0% 8%)',
            padding: '18px 18px 16px',
          }}>
            <div style={{
              fontSize: 9, letterSpacing: '0.28em',
              color: accent, textTransform: 'uppercase',
              marginBottom: 14, opacity: 0.75,
            }}>
              {cmd}
            </div>
            <div style={{
              fontFamily: 'var(--font-anton)',
              fontSize: 38, color: 'hsl(0 0% 42%)',
              letterSpacing: '0.05em', lineHeight: 1,
              marginBottom: 8,
            }}>
              {value}
            </div>
            <div style={{
              fontSize: 10, color: 'hsl(0 0% 32%)',
              letterSpacing: '0.2em', textTransform: 'lowercase',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom panels ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

        {/* System status */}
        <div style={{
          border: '1px solid hsl(0 0% 18%)',
          background: 'hsl(0 0% 8%)',
          padding: '18px 20px',
        }}>
          <div style={{
            fontSize: 9, letterSpacing: '0.3em', color: 'hsl(0 0% 28%)',
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            // system.status
          </div>
          {SYSTEM.map(({ key, value }) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 0',
              borderBottom: '1px solid hsl(0 0% 13%)',
              fontSize: 11,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'hsl(0 0% 30%)', letterSpacing: '0.1em' }}>{key}</span>
                <span style={{ color: 'hsl(0 0% 20%)', fontSize: 10 }}>→</span>
                <span style={{ color: 'hsl(0 0% 48%)', fontSize: 10, letterSpacing: '0.05em' }}>{value}</span>
              </div>
              <span style={{
                fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
                color: 'hsl(158 64% 42%)',
              }}>
                ok
              </span>
            </div>
          ))}
        </div>

        {/* Quick access */}
        <div style={{
          border: '1px solid hsl(0 0% 18%)',
          background: 'hsl(0 0% 8%)',
          padding: '18px 20px',
        }}>
          <div style={{
            fontSize: 9, letterSpacing: '0.3em', color: 'hsl(0 0% 28%)',
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            // quick.access
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {QUICK_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 0',
                  borderBottom: '1px solid hsl(0 0% 13%)',
                  fontSize: 12, letterSpacing: '0.1em',
                  color: hovered === href ? 'hsl(158 64% 55%)' : 'hsl(0 0% 42%)',
                  textDecoration: 'none',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={() => setHovered(href)}
                onMouseLeave={() => setHovered(null)}
              >
                <span style={{
                  color: hovered === href ? 'hsl(158 64% 36%)' : 'hsl(0 0% 22%)',
                  transition: 'color 0.12s',
                  fontSize: 10,
                }}>
                  {'>'}
                </span>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
