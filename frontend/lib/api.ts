import { createClient } from './supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await createClient().auth.getSession()
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}
}

/** Fetch from a public API endpoint (no auth required) */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<T>
}

/** Fetch from a private API endpoint (Bearer token required) */
export async function apiPrivate<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/api/private${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...init?.headers,
    },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<T>
}
