export interface User {
    id: number;
    email: string;
    username: string;
    role: 'user' | 'admin';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login: string | null;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

// ─── CMS content types ────────────────────────────────────────────────────────

export interface ItSkill {
    id:          number;
    text:        string;
    order_index: number;
    created_at:  string;
}

export interface Certification {
    id:          number;
    name:        string;
    issuer:      string | null;
    date:        string | null;
    cert_id:     string | null;
    url:         string | null;
    order_index: number;
    created_at:  string;
}

export interface ExperienceItem {
    id:          number;
    title:       string;
    company:     string | null;
    duration:    string | null;
    order_index: number;
    created_at:  string;
}

export interface Project {
    id:             number;
    title:          string;
    slug:           string;
    year:           number | null;
    source_code:    string | null;
    description:    string | null;
    role:           string | null;
    tech_stack:     string[];
    thumbnail:      string | null;
    long_thumbnail: string | null;
    images:         string[];
    is_featured:    boolean;
    order_index:    number;
    created_at:     string;
}

export interface StackItem {
    id:          number;
    name:        string;
    icon:        string | null;
    category:    'frontend' | 'backend' | 'database' | 'tools';
    order_index: number;
    created_at:  string;
}
