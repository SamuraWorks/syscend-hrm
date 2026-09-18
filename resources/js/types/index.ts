// Global TypeScript interfaces for Syscend-HRM

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive';
    mfa_enabled: boolean;
    roles: Role[];
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    url: string | null;
    created_at: string;
}

// Inertia shared props
export interface PageProps {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    notifications: AppNotification[];
    unread_count: number;
}
