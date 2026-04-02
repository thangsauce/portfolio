'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[hsl(0_0%_10%)] flex items-center justify-center relative overflow-hidden">
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(158 64% 36% / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(158 64% 36% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(158 64% 36%) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative w-full max-w-sm mx-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        {/* Terminal bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border border-b-0 border-[hsl(0_0%_24%)] rounded-t-lg bg-[hsl(0_0%_14%)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[hsl(0_62%_50%)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[hsl(40_90%_50%)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[hsl(158_64%_36%)]" />
          <span
            className="ml-auto text-[10px] tracking-widest uppercase"
            style={{ color: 'hsl(158 64% 36%)' }}
          >
            auth.thangle.me
          </span>
        </div>

        {/* Main card body */}
        <div className="border border-[hsl(0_0%_24%)] rounded-b-lg bg-[hsl(0_0%_12%)] p-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'hsl(158 64% 36%)' }}>
              $ initialize_session --user admin
            </p>
            <h1
              className="text-2xl uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-anton)', color: 'hsl(0 0% 87%)' }}
            >
              Access Portal
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase"
                style={{ color: 'hsl(158 64% 36%)' }}
              >
                <span>&gt;</span>
                <span>identifier</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-[hsl(0_0%_9%)] border border-[hsl(0_0%_22%)] rounded px-3 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-[hsl(0_0%_35%)]"
                style={{
                  fontFamily: 'var(--font-roboto-flex)',
                  color: 'hsl(0 0% 87%)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(158 64% 36%)'
                  e.currentTarget.style.boxShadow = '0 0 0 1px hsl(158 64% 36% / 0.3)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(0 0% 22%)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase"
                style={{ color: 'hsl(158 64% 36%)' }}
              >
                <span>&gt;</span>
                <span>passkey</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-[hsl(0_0%_9%)] border border-[hsl(0_0%_22%)] rounded px-3 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-[hsl(0_0%_35%)]"
                style={{
                  fontFamily: 'var(--font-roboto-flex)',
                  color: 'hsl(0 0% 87%)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(158 64% 36%)'
                  e.currentTarget.style.boxShadow = '0 0 0 1px hsl(158 64% 36% / 0.3)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(0 0% 22%)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 text-sm py-2 px-3 rounded border border-[hsl(0_62%_40%_/_0.3)] bg-[hsl(0_62%_20%_/_0.15)]">
                <span className="text-[hsl(0_62%_60%)] mt-0.5 shrink-0">✕</span>
                <span style={{ color: 'hsl(0 62% 70%)', fontFamily: 'var(--font-roboto-flex)' }}>
                  {error}
                </span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded text-sm font-semibold tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: 'hsl(158 64% 36%)',
                color: 'hsl(0 0% 98%)',
                fontFamily: 'var(--font-roboto-flex)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.background = 'hsl(158 64% 42%)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'hsl(158 64% 36%)'
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingDots />
                  <span>authenticating</span>
                </span>
              ) : (
                'authenticate →'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] tracking-widest uppercase" style={{ color: 'hsl(0 0% 35%)' }}>
            private access only
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function LoadingDots() {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-current"
          style={{
            animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  )
}
