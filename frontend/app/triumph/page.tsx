'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const { login, loginWithOAuth, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null)
    setIsLoading(true)
    try {
      await loginWithOAuth(provider)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth sign-in failed')
      setIsLoading(false)
    }
  }

  if (authLoading || isAuthenticated) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'hsl(226 12% 10%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-roboto-flex)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>

        {/* Logo + heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44,
            background: 'hsl(158 64% 36%)',
            borderRadius: 14,
            fontFamily: 'var(--font-anton)',
            fontSize: 16, letterSpacing: '0.04em',
            color: '#fff',
            marginBottom: 18,
          }}>
            TL
          </div>
          <h1 style={{
            fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em',
            color: 'hsl(220 15% 90%)', margin: '0 0 6px',
          }}>
            Welcome back
          </h1>
          <p style={{
            fontSize: 13, color: 'hsl(220 6% 44%)',
            margin: 0, letterSpacing: '-0.01em',
          }}>
            Sign in to your dashboard
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'hsl(226 12% 13%)',
          border: '1px solid hsl(226 10% 18%)',
          borderRadius: 18,
          padding: '28px 28px 24px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* OAuth */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuth('google')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'hsl(226 12% 10%)',
                  color: 'hsl(220 12% 88%)',
                  border: '1px solid hsl(226 10% 20%)',
                  borderRadius: 10,
                  fontSize: 13,
                  letterSpacing: '-0.01em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  fontFamily: 'var(--font-roboto-flex)',
                }}
              >
                Continue with Google
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuth('github')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'hsl(226 12% 10%)',
                  color: 'hsl(220 12% 88%)',
                  border: '1px solid hsl(226 10% 20%)',
                  borderRadius: 10,
                  fontSize: 13,
                  letterSpacing: '-0.01em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  fontFamily: 'var(--font-roboto-flex)',
                }}
              >
                Continue with GitHub
              </button>
            </div>

            <div style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'hsl(220 6% 30%)',
              textAlign: 'center',
            }}>
              or use email and password
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{
                display: 'block', marginBottom: 7,
                fontSize: 12, fontWeight: 500,
                color: 'hsl(220 8% 55%)', letterSpacing: '-0.01em',
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(226 12% 10%)',
                  border: '1px solid hsl(226 10% 20%)',
                  borderRadius: 10,
                  padding: '10px 13px',
                  fontSize: 14, color: 'hsl(220 12% 88%)',
                  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                  fontFamily: 'var(--font-roboto-flex)',
                  letterSpacing: '-0.01em',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'hsl(158 58% 40%)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px hsl(158 64% 36% / 0.15)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'hsl(226 10% 20%)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{
                display: 'block', marginBottom: 7,
                fontSize: 12, fontWeight: 500,
                color: 'hsl(220 8% 55%)', letterSpacing: '-0.01em',
              }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(226 12% 10%)',
                  border: '1px solid hsl(226 10% 20%)',
                  borderRadius: 10,
                  padding: '10px 13px',
                  fontSize: 14, color: 'hsl(220 12% 88%)',
                  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                  fontFamily: 'var(--font-roboto-flex)',
                  letterSpacing: '-0.01em',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'hsl(158 58% 40%)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px hsl(158 64% 36% / 0.15)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'hsl(226 10% 20%)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '11px 13px',
                background: 'hsl(0 62% 50% / 0.09)',
                border: '1px solid hsl(0 62% 50% / 0.22)',
                borderRadius: 10,
                fontSize: 13, color: 'hsl(0 62% 70%)',
                letterSpacing: '-0.01em',
              }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="8" cy="8" r="6.5" />
                  <line x1="8" y1="5" x2="8" y2="8.5" />
                  <circle cx="8" cy="11" r="0.6" fill="currentColor" stroke="none" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '11px',
                background: 'hsl(158 64% 36%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                letterSpacing: '-0.01em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'background 0.15s, opacity 0.15s',
                fontFamily: 'var(--font-roboto-flex)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = 'hsl(158 64% 40%)' }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = 'hsl(158 64% 36%)' }}
            >
              {isLoading ? <><Spinner /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 20,
          fontSize: 12, color: 'hsl(220 6% 30%)',
          letterSpacing: '-0.01em',
        }}>
          Private access only
        </p>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: '_spin 0.75s linear infinite', flexShrink: 0 }}>
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.35" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </>
  )
}
