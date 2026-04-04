import { createClient } from './supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const supabase = createClient()

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json() as { error?: string; message?: string }
    return data.error || data.message || `API error ${res.status}`
  } catch {
    return `API error ${res.status}`
  }
}

async function authHeaders(): Promise<HeadersInit> {
  const buildAuth = (token?: string): HeadersInit => {
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  }

  const first = await supabase.auth.getSession()
  const firstToken = first.data.session?.access_token
  if (firstToken) return buildAuth(firstToken)

  // Brief retry for race on initial hydration/navigation.
  await new Promise((resolve) => setTimeout(resolve, 120))
  const second = await supabase.auth.getSession()
  const secondToken = second.data.session?.access_token
  if (secondToken) return buildAuth(secondToken)

  // Final recovery attempt if token exists but is stale.
  try {
    await supabase.auth.refreshSession()
    const third = await supabase.auth.getSession()
    return buildAuth(third.data.session?.access_token)
  } catch {
    return {}
  }
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
