import type { ApiResponse } from '@/types/auth';

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// In-memory token storage — never hits localStorage or cookies
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface RequestOptions {
    method: string;
    path: string;
    body?: unknown;
    retry?: boolean;
}

async function request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    const { method, path, body, retry = true } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        credentials: 'include', // sends HTTP-only refresh cookie
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Token expired — attempt a silent refresh then retry once
    if (res.status === 401 && retry) {
        const refreshed = await tryRefresh();
        if (refreshed) {
            return request<T>({ ...options, retry: false });
        }
    }

    const data: ApiResponse<T> = await res.json();
    return data;
}

// ─── Silent token refresh ─────────────────────────────────────────────────────

async function tryRefresh(): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!res.ok) return false;

        const data: ApiResponse<{ accessToken: string }> = await res.json();

        if (data.success && data.data?.accessToken) {
            setAccessToken(data.data.accessToken);
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

// ─── Public API methods ───────────────────────────────────────────────────────

export function get<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>({ method: 'GET', path });
}

export function post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>({ method: 'POST', path, body });
}

export function patch<T>(
    path: string,
    body?: unknown,
): Promise<ApiResponse<T>> {
    return request<T>({ method: 'PATCH', path, body });
}

export function del<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>({ method: 'DELETE', path });
}
