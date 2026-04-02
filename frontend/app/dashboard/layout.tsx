'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardThemeContext } from './theme-context'

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
  { href: '/dashboard',           label: 'Overview',    Icon: IconOverview,  exact: true },
  { href: '/dashboard/portfolio', label: 'Portfolio',   Icon: IconPortfolio              },
  { href: '/dashboard/notes',     label: 'Notes',       Icon: IconNotes                  },
  { href: '/dashboard/todos',     label: 'Todos',       Icon: IconTodos                  },
  { href: '/dashboard/learning',  label: 'Lesson',      Icon: IconLearning               },
  { href: '/dashboard/projects',  label: 'Documents',   Icon: IconProjects               },
  { href: '/dashboard/blog',      label: 'Blog',        Icon: IconBlog                   },
]

// ── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()
  const [mounted,      setMounted]      = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const logoEyeRef   = useRef<SVGSVGElement>(null)
  const logoPupilRef = useRef<SVGGElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoggingOut) router.push('/triumph')
  }, [isAuthenticated, isLoading, isLoggingOut, router])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const saved = window.localStorage.getItem('dashboard-theme') as 'dark' | 'light' | null
    const next = saved ?? (mediaQuery.matches ? 'dark' : 'light')
    setTheme(next)

    const savedSidebar = window.localStorage.getItem('dashboard-sidebar-collapsed')
    setIsSidebarCollapsed(savedSidebar === '1')
  }, [])

  useEffect(() => {
    const eye   = logoEyeRef.current
    const pupil = logoPupilRef.current
    if (!eye || !pupil) return

    const onMove = (e: MouseEvent) => {
      const rect = eye.getBoundingClientRect()
      const cx   = rect.left + rect.width / 2
      const cy   = rect.top + rect.height / 2
      const dx   = e.clientX - cx
      const dy   = e.clientY - cy
      const max  = 4.2
      const dist = Math.hypot(dx, dy) || 1
      const clamped = Math.min(max, dist)
      const x = (dx / dist) * clamped
      const y = (dy / dist) * clamped
      pupil.setAttribute('transform', `translate(${x} ${y})`)
    }

    const onLeave = () => { pupil.setAttribute('transform', 'translate(0 0)') }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  if (isLoading || !isAuthenticated) return null

  const segments = pathname.replace(/^\/dashboard\/?/, '').split('/').filter(Boolean)
  const initial  = (user?.email?.[0] ?? 'T').toUpperCase()
  const isLight  = theme === 'light'
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    window.localStorage.setItem('dashboard-theme', next)
  }
  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem('dashboard-sidebar-collapsed', next ? '1' : '0')
      return next
    })
  }

  return (
    <DashboardThemeContext.Provider value={{ isLight, toggleTheme }}>
      <div
        data-theme={theme}
        className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'} fixed inset-0 z-50 flex overflow-hidden font-roboto-flex bg-[hsl(var(--dash-bg))]`}
      >
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className={`${isSidebarCollapsed ? 'w-[76px] min-w-[76px]' : 'w-60 min-w-[240px]'} flex-shrink-0 flex flex-col bg-[hsl(var(--dash-sidebar))] border-r border-border transition-all duration-200`}>

          {/* Logo */}
          <Link
            href="/#banner"
            className={`${isSidebarCollapsed ? 'px-2 py-[14px]' : 'px-4 py-[18px]'} border-b border-border block no-underline`}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center gap-0' : 'gap-3'}`}>
              <div
                className="w-[42px] h-[34px] flex-shrink-0 flex items-center justify-center text-primary rounded-[14px]"
                style={{ boxShadow: '0 0 0 1px hsl(158 64% 36% / 0.28), 0 4px 14px hsl(158 64% 36% / 0.16)' }}
              >
                <svg
                  ref={logoEyeRef}
                  width="32"
                  height="20"
                  viewBox="0 0 44 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <clipPath id="dashboard-eye-clip">
                      <path d="M3 14C7.8 6 14.8 2.5 22 2.5C29.2 2.5 36.2 6 41 14C36.2 22 29.2 25.5 22 25.5C14.8 25.5 7.8 22 3 14Z" />
                    </clipPath>
                  </defs>
                  <path
                    d="M3 14C7.8 6 14.8 2.5 22 2.5C29.2 2.5 36.2 6 41 14C36.2 22 29.2 25.5 22 25.5C14.8 25.5 7.8 22 3 14Z"
                    fill="hsl(var(--dash-sidebar))"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  />
                  <g clipPath="url(#dashboard-eye-clip)">
                    <rect x="0" y="0" width="44" height="28" fill="hsl(var(--dash-sidebar))" />
                    <g ref={logoPupilRef}>
                      <circle cx="22" cy="14" r="5" fill="currentColor" />
                      <circle cx="22" cy="14" r="1.5" fill="hsl(var(--dash-sidebar))" />
                    </g>
                  </g>
                </svg>
              </div>
              {!isSidebarCollapsed && (
              <div>
                <div className="text-sm font-semibold tracking-tight text-foreground leading-tight">
                  thangle.me
                </div>
                <div className="text-[11px] text-primary mt-0.5 tracking-wide">
                  Dashboard
                </div>
              </div>
              )}
            </div>
          </Link>

          <div className={`${isSidebarCollapsed ? 'px-2 py-2' : 'px-3 py-2'} border-b border-border`}>
            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs tracking-tight text-muted-foreground border border-border bg-muted hover:text-foreground transition-colors"
            >
              <svg {...ip}><line x1="3" y1="5" x2="13" y2="5" /><line x1="3" y1="8" x2="13" y2="8" /><line x1="3" y1="11" x2="13" y2="11" /></svg>
              {!isSidebarCollapsed && <span>{'Minimize'}</span>}
            </button>
          </div>

          {/* Nav */}
          <nav data-lenis-prevent className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-2.5'} py-2 overflow-y-auto`}>
            {!isSidebarCollapsed && (
            <div className="text-[11px] font-medium tracking-tight text-muted-foreground px-2 pb-1.5 pt-1">
              Menu
            </div>
            )}

            {NAV.map(({ href, label, Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={[
                    `flex items-center ${isSidebarCollapsed ? 'justify-center gap-0 px-2.5' : 'gap-2.5 px-2.5'} py-[9px] mb-px text-[13px] tracking-tight rounded-xl no-underline transition-colors duration-150`,
                    isActive
                      ? 'font-medium text-primary bg-primary/[0.12]'
                      : 'font-normal text-muted-foreground hover:text-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  <Icon />
                  {!isSidebarCollapsed && <span className="flex-1">{label}</span>}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User */}
          <div className={`${isSidebarCollapsed ? 'px-2 py-2' : 'px-3.5 py-3'} border-t border-border`}>
            {!isSidebarCollapsed && (
            <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-[hsl(var(--dash-bg))] mb-2">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold text-primary"
                style={{
                  background: 'hsl(158 64% 36% / 0.18)',
                  border: '1px solid hsl(158 64% 36% / 0.28)',
                }}
              >
                {initial}
              </div>
              <div className="text-[11px] text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap tracking-tight flex-1">
                {user?.email ?? '—'}
              </div>
            </div>
            )}

            <button
              onClick={async () => {
                setIsLoggingOut(true)
                try { await logout(); router.push('/') }
                catch { setIsLoggingOut(false) }
              }}
              title="Sign Out"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive bg-destructive/[0.08] border border-destructive/[0.15] cursor-pointer transition-colors duration-150 hover:bg-destructive/[0.14] hover:border-destructive/[0.28]"
            >
              <IconLogout />
              {!isSidebarCollapsed && 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Topbar */}
          <header className="h-11 min-h-[44px] flex-shrink-0 bg-[hsl(var(--dash-sidebar))] border-b border-border flex items-center justify-between px-7">
            <div className="flex items-center gap-2">
              <span className="text-[13px] tracking-tight text-muted-foreground">
                Dashboard
              </span>
              {segments.map((seg, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-base leading-none font-light text-muted-foreground">›</span>
                  <span className={[
                    'text-[13px] tracking-tight capitalize',
                    i === segments.length - 1
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground font-normal',
                  ].join(' ')}>
                    {seg}
                  </span>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="mr-2.5 px-3 py-[5px] rounded-full border border-border bg-muted text-muted-foreground text-xs tracking-tight cursor-pointer"
              >
                {isLight ? '🌙 Dark' : '☀ Light'}
              </button>
              <div
                className="w-[7px] h-[7px] rounded-full bg-primary"
                style={{ boxShadow: '0 0 0 2px hsl(158 64% 42% / 0.22)' }}
              />
              <span className="text-xs tracking-tight text-muted-foreground">Online</span>
            </div>
          </header>

          {/* Main */}
          <main data-lenis-prevent className="flex-1 overflow-y-auto py-8 px-7">
            {children}
          </main>
        </div>
      </div>
    </DashboardThemeContext.Provider>
  )
}
