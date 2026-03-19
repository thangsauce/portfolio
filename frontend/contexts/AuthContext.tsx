'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import type { User, AuthState } from '@/types/auth';
import { get, post, setAccessToken } from '@/lib/api';

// ─── Cookie helpers (non-httpOnly, readable by JS for middleware signalling) ──

const isProduction = process.env.NODE_ENV === 'production';
const secureFlag = isProduction ? '; Secure' : '';

function setAuthCookie(): void {
    document.cookie =
        `auth_status=logged_in; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
}

function clearAuthCookie(): void {
    document.cookie = `auth_status=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // On mount: try to restore session via refresh token cookie
    useEffect(() => {
        async function restoreSession() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
                    { method: 'POST', credentials: 'include' },
                );

                if (!res.ok) {
                    setState((prev) => ({ ...prev, isLoading: false }));
                    return;
                }

                const data = await res.json();

                if (data.success && data.data?.accessToken) {
                    setAccessToken(data.data.accessToken);

                    const meRes = await get<{ user: User }>('/api/auth/me');

                    if (meRes.success && meRes.data?.user) {
                        setAuthCookie();
                        setState({
                            user: meRes.data.user,
                            accessToken: data.data.accessToken,
                            isLoading: false,
                            isAuthenticated: true,
                        });
                        return;
                    }
                }
            } catch {
                // Network error or no session — silently fall through
            }

            clearAuthCookie();
            setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
        }

        restoreSession();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await post<{ user: User; accessToken: string }>(
            '/api/auth/login',
            { email, password },
        );

        if (!res.success || !res.data) {
            throw new Error(res.message || 'Login failed');
        }

        setAccessToken(res.data.accessToken);
        setAuthCookie();

        setState({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isLoading: false,
            isAuthenticated: true,
        });
    }, []);

    const register = useCallback(
        async (email: string, password: string) => {
            const res = await post<{ user: User; accessToken: string }>(
                '/api/auth/register',
                { email, password },
            );

            if (!res.success || !res.data) {
                throw new Error(res.message || 'Registration failed');
            }

            setAccessToken(res.data.accessToken);
            setAuthCookie();

            setState({
                user: res.data.user,
                accessToken: res.data.accessToken,
                isLoading: false,
                isAuthenticated: true,
            });
        },
        [],
    );

    const logout = useCallback(async () => {
        try {
            await post('/api/auth/logout');
        } catch {
            // Best-effort — clear local state regardless
        }

        setAccessToken(null);
        clearAuthCookie();

        setState({
            user: null,
            accessToken: null,
            isLoading: false,
            isAuthenticated: false,
        });
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
}
