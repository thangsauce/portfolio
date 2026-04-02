'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

// ── Icon base props ──────────────────────────────────────────────────────────
const ip = {
  width: 15, height: 15, viewBox: '0 0 16 16',
  fill: 'none', stroke: 'currentColor', strokeWidth: '1.5',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  style: { flexShrink: 0 as const },
}

function IconOverview() {
  return (
    <svg {...ip}>
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}
function IconPortfolio() {
  return (
    <svg {...ip}>
      <rect x="1" y="5" width="14" height="10" rx="1.5" />
      <path d="M5 5V4a2 2 0 012-2h2a2 2 0 012 2v1" />
      <line x1="1" y1="9.5" x2="15" y2="9.5" />
    </svg>
  )
}
function IconNotes() {
  return (
    <svg {...ip}>
      <path d="M3 2h10v10l-3 3H3z" strokeLinejoin="round" />
      <line x1="5.5" y1="6" x2="10.5" y2="6" />
      <line x1="5.5" y1="9" x2="8" y2="9" />
    </svg>
  )
}
function IconTodos() {
  return (
    <svg {...ip}>
      <rect x="1" y="1" width="14" height="14" rx="2" />
      <polyline points="4.5,8 6.5,10 11,5.5" />
    </svg>
  )
}
function IconLearning() {
  return (
    <svg {...ip}>
      <path d="M2 4.5l6-2.5 6 2.5v4.5C14 12 11 14 8 15c-3-1-6-3-6-6V4.5z" />
      <polyline points="5.5,8.5 7.5,10.5 11,6.5" />
    </svg>
  )
}
function IconProjects() {
  return (
    <svg {...ip}>
      <path d="M2 5.5h12v8H2z" />
      <path d="M5 5.5V4a1 1 0 011-1h4a1 1 0 011 1v1.5" />
      <line x1="5" y1="9" x2="11" y2="9" />
      <line x1="5" y1="11.5" x2="8.5" y2="11.5" />
    </svg>
  )
}
function IconBlog() {
  return (
    <svg {...ip}>
      <path d="M11.5 2.5L13.5 4.5l-7.5 7.5H4v-2l7.5-7.5z" />
      <line x1="2" y1="14.5" x2="14" y2="14.5" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg {...ip}>
      <path d="M10.5 3H13a1 1 0 011 1v8a1 1 0 01-1 1h-2.5" />
      <polyline points="7,10.5 2.5,8 7,5.5" />
      <line x1="2.5" y1="8" x2="11" y2="8" />
    </svg>
  )
}

// ── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  { href: '/dashboard',           label: 'Overview',  Icon: IconOverview,  exact: true },
  { href: '/dashboard/portfolio', label: 'Portfolio', Icon: IconPortfolio              },
  { href: '/dashboard/notes',     label: 'Notes',     Icon: IconNotes                  },
  { href: '/dashboard/todos',     label: 'Todos',     Icon: IconTodos                  },
  { href: '/dashboard/learning',  label: 'Learning',  Icon: IconLearning               },
  { href: '/dashboard/projects',  label: 'Projects',  Icon: IconProjects               },
  { href: '/dashboard/blog',      label: 'Blog',      Icon: IconBlog                   },
]

// ── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()
  const [mounted,      setMounted]      = useState(false)
  const [hoveredNav,   setHoveredNav]   = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoggingOut) router.push('/triumph')
  }, [isAuthenticated, isLoading, isLoggingOut, router])

  if (isLoading || !isAuthenticated) return null

  const segments = pathname.replace(/^\/dashboard\/?/, '').split('/').filter(Boolean)
  const initial  = (user?.email?.[0] ?? 'T').toUpperCase()

  return (
    <div
      className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', overflow: 'hidden',
        fontFamily: 'var(--font-roboto-flex)',
        background: 'hsl(226 12% 10%)',
      }}
    >
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside style={{
        width: 240, minWidth: 240, flexShrink: 0,
        background: 'hsl(228 14% 7%)',
        borderRight: '1px solid hsl(226 10% 13%)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Logo */}
        <div style={{
          padding: '18px 16px',
          borderBottom: '1px solid hsl(226 10% 12%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, flexShrink: 0,
              background: 'hsl(158 64% 36%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-anton)', fontSize: 13, letterSpacing: '0.04em',
              color: '#fff',
              boxShadow: '0 0 0 1px hsl(158 64% 36% / 0.35), 0 4px 14px hsl(158 64% 36% / 0.28)',
              borderRadius: 6,
            }}>
              TL
            </div>
            <div>
              <div style={{
                fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em',
                color: 'hsl(220 16% 86%)',
                lineHeight: 1.2,
              }}>
                thangle.me
              </div>
              <div style={{
                fontSize: 11, color: 'hsl(158 55% 48%)',
                marginTop: 2, letterSpacing: '0.01em',
              }}>
                Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav data-lenis-prevent style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'hsl(220 6% 32%)',
            padding: '4px 8px 6px',
          }}>
            Navigation
          </div>

          {NAV.map(({ href, label, Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            const isHov    = hoveredNav === href && !isActive
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px',
                  marginBottom: 1,
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: '-0.01em',
                  textDecoration: 'none',
                  borderRadius: 8,
                  color: isActive ? 'hsl(158 58% 58%)' : isHov ? 'hsl(220 10% 66%)' : 'hsl(220 8% 42%)',
                  background: isActive
                    ? 'hsl(158 64% 42% / 0.12)'
                    : isHov ? 'hsl(226 12% 11%)' : 'transparent',
                  transition: 'color 0.14s, background 0.14s',
                }}
                onMouseEnter={() => setHoveredNav(href)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Icon />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'hsl(158 64% 42%)',
                    boxShadow: '0 0 6px hsl(158 64% 42% / 0.5)',
                    flexShrink: 0,
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid hsl(226 10% 12%)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 10px',
            borderRadius: 8,
            background: 'hsl(226 12% 10%)',
            marginBottom: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'hsl(158 64% 36% / 0.18)',
              border: '1px solid hsl(158 64% 36% / 0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600,
              color: 'hsl(158 58% 54%)',
            }}>
              {initial}
            </div>
            <div style={{
              fontSize: 11, color: 'hsl(220 8% 48%)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              letterSpacing: '-0.01em', flex: 1,
            }}>
              {user?.email ?? '—'}
            </div>
          </div>

          <button
            onClick={async () => {
              setIsLoggingOut(true)
              try { await logout(); router.push('/') }
              catch { setIsLoggingOut(false) }
            }}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '8px 12px',
              borderRadius: 7,
              fontSize: 12, fontWeight: 500,
              color: 'hsl(0 62% 55%)',
              background: 'hsl(0 62% 52% / 0.08)',
              border: '1px solid hsl(0 62% 52% / 0.15)',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'hsl(0 62% 52% / 0.14)'
              e.currentTarget.style.borderColor = 'hsl(0 62% 52% / 0.28)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'hsl(0 62% 52% / 0.08)'
              e.currentTarget.style.borderColor = 'hsl(0 62% 52% / 0.15)'
            }}
          >
            <IconLogout />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: 44, minHeight: 44, flexShrink: 0,
          background: 'hsl(227 13% 9%)',
          borderBottom: '1px solid hsl(226 10% 14%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'hsl(220 6% 30%)', letterSpacing: '-0.01em' }}>
              Dashboard
            </span>
            {segments.map((seg, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'hsl(220 6% 24%)', fontSize: 16, lineHeight: 1, fontWeight: 300 }}>›</span>
                <span style={{
                  fontSize: 13, letterSpacing: '-0.01em',
                  color: i === segments.length - 1 ? 'hsl(220 12% 70%)' : 'hsl(220 8% 40%)',
                  fontWeight: i === segments.length - 1 ? 500 : 400,
                  textTransform: 'capitalize',
                }}>
                  {seg}
                </span>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'hsl(158 64% 42%)',
              boxShadow: '0 0 0 2px hsl(158 64% 42% / 0.22)',
            }} />
            <span style={{ fontSize: 12, color: 'hsl(220 6% 34%)', letterSpacing: '-0.01em' }}>
              Online
            </span>
          </div>
        </header>

        {/* Main */}
        <main data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
