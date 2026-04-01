import { createClient } from './supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json() as { error?: string; message?: string }
    return data.error || data.message || `API error ${res.status}`
  } catch {
    return `API error ${res.status}`
  }
}

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await createClient().auth.getSession()
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}
}

/** Fetch from a public API endpoint (no auth required) */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok) throw new Error(await parseApiError(res))
  return res.json() as Promise<T>
}

/** Fetch from a private API endpoint (Bearer token required) */
export async function apiPrivate<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = await authHeaders()
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  const mergedHeaders = new Headers(init?.headers)
  if (!isFormData && !mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json')
  }
  new Headers(auth).forEach((value, key) => mergedHeaders.set(key, value))

  const res = await fetch(`${API_URL}/api/private${path}`, {
    ...init,
    headers: mergedHeaders,
  })
  if (!res.ok) throw new Error(await parseApiError(res))
  return res.json() as Promise<T>
}
