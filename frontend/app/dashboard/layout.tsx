'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

// ── SVG icon props ──────────────────────────────────────────
const ip = {
  width: 14,
  height: 14,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  style: { flexShrink: 0 as const },
}

// ── Icons ───────────────────────────────────────────────────
function IconOverview() {
  return (
    <svg {...ip}>
      <rect x="1" y="1" width="6" height="6" rx="0.5" />
      <rect x="9" y="1" width="6" height="6" rx="0.5" />
      <rect x="1" y="9" width="6" height="6" rx="0.5" />
      <rect x="9" y="9" width="6" height="6" rx="0.5" />
    </svg>
  )
}
function IconPortfolio() {
  return (
    <svg {...ip}>
      <rect x="1" y="5" width="14" height="10" rx="1" />
      <path d="M5 5V4a2 2 0 012-2h2a2 2 0 012 2v1" />
      <line x1="1" y1="9.5" x2="15" y2="9.5" />
    </svg>
  )
}
function IconNotes() {
  return (
    <svg {...ip}>
      <path d="M3 2h10v10l-3 3H3z" />
      <line x1="5.5" y1="6" x2="10.5" y2="6" />
      <line x1="5.5" y1="9" x2="8" y2="9" />
      <path d="M10 12v3l3-3h-3z" />
    </svg>
  )
}
function IconTodos() {
  return (
    <svg {...ip}>
      <rect x="1" y="1" width="14" height="14" rx="1" />
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

// ── Nav config ──────────────────────────────────────────────
const NAV = [
  { href: '/dashboard',           label: 'overview',  Icon: IconOverview,  exact: true },
  { href: '/dashboard/portfolio', label: 'portfolio', Icon: IconPortfolio              },
  { href: '/dashboard/notes',     label: 'notes',     Icon: IconNotes                  },
  { href: '/dashboard/todos',     label: 'todos',     Icon: IconTodos                  },
  { href: '/dashboard/learning',  label: 'learning',  Icon: IconLearning               },
  { href: '/dashboard/projects',  label: 'projects',  Icon: IconProjects               },
  { href: '/dashboard/blog',      label: 'blog',      Icon: IconBlog                   },
]

// ── Session indicator ───────────────────────────────────────
function SessionDot() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      fontSize: 9, letterSpacing: '0.25em', color: 'hsl(0 0% 30%)',
      textTransform: 'uppercase',
    }}>
      <span style={{
        display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
        background: 'hsl(158 64% 40%)',
        animation: 'session-blink 2.5s ease-in-out infinite',
      }} />
      session active
      <style jsx>{`
        @keyframes session-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
      `}</style>
    </div>
  )
}

// ── Layout ──────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) return null

  const segments = pathname.replace(/^\/dashboard\/?/, '').split('/').filter(Boolean)

  return (
    <div
      className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', overflow: 'hidden',
        fontFamily: 'var(--font-roboto-flex)',
        background: 'hsl(0 0% 10%)',
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside style={{
        width: 232, minWidth: 232, flexShrink: 0,
        background: 'hsl(0 0% 7%)',
        borderRight: '1px solid hsl(0 0% 16%)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Branding */}
        <div style={{
          padding: '20px 20px 14px',
          borderBottom: '1px solid hsl(0 0% 14%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            {/* TL badge */}
            <div style={{
              width: 28, height: 28, flexShrink: 0,
              background: 'hsl(158 64% 36%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-anton)',
              fontSize: 11, letterSpacing: '0.05em',
              color: 'hsl(0 0% 98%)',
            }}>
              TL
            </div>
            <div style={{
              fontFamily: 'var(--font-anton)',
              fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'hsl(0 0% 78%)',
            }}>
              thangle.me
            </div>
          </div>
          <div style={{
            paddingLeft: 38,
            fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'hsl(158 64% 36%)',
          }}>
            // admin
          </div>
        </div>

        {/* Nav */}
        <nav data-lenis-prevent style={{ flex: 1, paddingTop: 6, overflowY: 'auto' }}>
          <div style={{
            padding: '8px 18px 6px',
            fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'hsl(0 0% 26%)',
          }}>
            // nav
          </div>

          {NAV.map(({ href, label, Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            const isHov = hoveredNav === href && !isActive
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 18px',
                  fontSize: 11, letterSpacing: '0.12em', textTransform: 'lowercase',
                  textDecoration: 'none',
                  color: isActive ? 'hsl(158 64% 58%)' : isHov ? 'hsl(0 0% 62%)' : 'hsl(0 0% 40%)',
                  background: isActive ? 'hsl(158 64% 36% / 0.08)' : isHov ? 'hsl(0 0% 10%)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? 'hsl(158 64% 36%)' : 'transparent'}`,
                  transition: 'color 0.12s, background 0.12s',
                }}
                onMouseEnter={() => setHoveredNav(href)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User / logout */}
        <div style={{ borderTop: '1px solid hsl(0 0% 14%)', padding: '14px 18px' }}>
          <div style={{
            fontSize: 10, color: 'hsl(0 0% 30%)', letterSpacing: '0.08em',
            marginBottom: 11,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.email ?? '—'}
          </div>
          <button
            onClick={async () => { await logout(); router.push('/login') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'hsl(0 62% 52%)',
              background: 'none', border: 'none', padding: 0,
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'hsl(0 62% 68%)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'hsl(0 62% 52%)')}
          >
            <IconLogout />
            exit_session
          </button>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: 44, minHeight: 44, flexShrink: 0,
          background: 'hsl(0 0% 8.5%)',
          borderBottom: '1px solid hsl(0 0% 15%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px',
        }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: 'hsl(0 0% 35%)' }}>
            <span style={{ color: 'hsl(158 64% 36%)' }}>~</span>
            {' / '}
            {segments.length === 0
              ? <span style={{ color: 'hsl(0 0% 62%)' }}>overview</span>
              : segments.map((seg, i) => (
                <span key={i}>
                  {i > 0 && <span style={{ color: 'hsl(0 0% 28%)' }}> / </span>}
                  <span style={{ color: i === segments.length - 1 ? 'hsl(0 0% 62%)' : 'hsl(0 0% 35%)' }}>
                    {seg}
                  </span>
                </span>
              ))
            }
          </div>

          <SessionDot />
        </header>

        {/* Main */}
        <main data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
