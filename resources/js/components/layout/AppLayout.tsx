import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Bell,
    ChevronDown,
    KeyRound,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    X,
    User,
} from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AppNotification, PageProps } from '@/types';
import { PORTAL_NAV, resolvePortal } from './portal-nav';

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ currentPath, collapsed = false, mobile = false, onNavigate, onToggle }: { currentPath: string; collapsed?: boolean; mobile?: boolean; onNavigate?: () => void; onToggle?: () => void }) {
    const page = usePage<PageProps>().props;
    const { app_settings } = page as any;
    const permissions: string[] = (page.auth?.user as any)?.permissions ?? [];

    const appName       = app_settings?.app_name ?? 'Syscend-HRM';
    const footerCopyright = app_settings?.footer_copyright ?? `© ${new Date().getFullYear()} Syscend-HRM. All rights reserved.`;
    const logoPath      = app_settings?.logo_path;
    const brandColor    = app_settings?.primary_color ?? '#2563eb';

    const can = (permission: string | null) => !permission || permissions.includes(permission);

    // Determine which portal nav to render
    const portalSlug = resolvePortal((page.auth?.user as any)?.roles ?? []);
    const navSections = PORTAL_NAV[portalSlug] ?? PORTAL_NAV.admin;

    return (
        <aside className={`flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ease-in-out ${collapsed ? 'w-16' : 'w-60'}`}>
            {/* Brand + toggle */}
            <div className={`flex h-16 items-center border-b border-slate-100 ${collapsed ? 'justify-between' : ''}`}>
                <Link href="/" className={`flex flex-1 items-center gap-3 px-5 border-r-0 ${collapsed ? 'justify-center px-0' : ''}`} title="Back to home">
                    {logoPath ? (
                        <img src={`/storage/${logoPath}`} alt={appName} className="h-7 w-auto object-contain flex-shrink-0" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm flex-shrink-0" style={{ backgroundColor: brandColor }}>
                            <span className="text-white text-sm font-bold">{appName.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <div className={`min-w-0 ${collapsed ? 'hidden' : 'block'}`}>
                        <p className="font-semibold text-slate-900 text-sm leading-none truncate">{appName}</p>
                        <p className="text-slate-400 text-xs mt-0.5">HR Management</p>
                    </div>
                </Link>
                <button
                    onClick={onToggle}
                    aria-label={mobile ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="mr-1.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                    {mobile ? <X size={16} /> : collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {navSections.map((group) => {
                    const visibleItems = group.items.filter(item => can(item.permission));
                    if (visibleItems.length === 0) return null;
                    return (
                        <div key={group.group}>
                            <p className={`px-2 mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider ${collapsed ? 'sr-only' : 'block'}`}>
                                {group.group}
                            </p>
                            <ul className="space-y-0.5">
                                {visibleItems.map(({ label, href, icon: Icon }) => {
                                    const active = currentPath === href || currentPath.startsWith(href + '/');
                                    return (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                onClick={onNavigate}
                                                title={collapsed ? label : undefined}
                                                className={cn(
                                                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                                                    collapsed && 'justify-center px-0',
                                                    active
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                                )}
                                            >
                                                <Icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
                                                <span className={collapsed ? 'hidden' : 'inline'}>{label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            {/* Footer copyright */}
            <div className="border-t border-slate-100">
                <p className={`text-xs text-slate-400 px-3 py-3 leading-snug ${collapsed ? 'sr-only' : 'block'}`}>{footerCopyright}</p>
            </div>
        </aside>
    );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function NotificationBell({ notifications, unreadCount }: { notifications: AppNotification[]; unreadCount: number }) {
    function markAllRead() {
        router.post('/notifications/mark-all-read', {}, { preserveScroll: true });
    }
    function visitAndRead(n: AppNotification) {
        router.post(`/notifications/${n.id}/mark-read`, {}, {
            preserveScroll: true,
            onSuccess: () => { if (n.url) router.visit(n.url); },
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Notifications {unreadCount > 0 && <span className="ml-1 text-xs font-normal text-slate-400">({unreadCount} unread)</span>}
                    </p>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                            Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">No new notifications</div>
                ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                        {notifications.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => visitAndRead(n)}
                                className="w-full text-left px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block"
                            >
                                <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{n.created_at}</p>
                            </button>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Header({
    user,
    onMenuClick,
    mobileOpen,
}: {
    user: PageProps['auth']['user'];
    onMenuClick: () => void;
    mobileOpen: boolean;
}) {
    const { notifications, unread_count } = usePage<PageProps>().props;

    function logout() {
        router.post('/logout');
    }

    const initials = user?.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'U';

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6">
            <div className="flex items-center gap-2">
                {/* Mobile only: open the slide-in drawer (the toggle lives on the sidebar on desktop) */}
                <button
                    onClick={onMenuClick}
                    aria-label="Open menu"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
                <span className="hidden lg:block text-sm font-semibold text-slate-900 dark:text-white">{user?.roles?.[0] ?? 'Portal'}</span>
            </div>

            <div className="flex items-center gap-2">
                {/* Notifications */}
                <NotificationBell notifications={notifications} unreadCount={unread_count} />

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {initials}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">{user?.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{user?.roles?.[0] ?? 'User'}</p>
                        </div>
                        <ChevronDown size={14} className="text-slate-400" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-52">
                        {/* User info header — plain div, NOT DropdownMenuLabel (requires Menu.Group parent) */}
                        <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                            <p className="font-medium text-sm text-slate-900 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                        </div>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.visit('/profile')}
                        >
                            <User size={14} className="mr-2" /> Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.visit('/profile/password')}
                        >
                            <KeyRound size={14} className="mr-2" /> Change Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={logout}
                            className="text-red-600 cursor-pointer"
                        >
                            <LogOut size={14} className="mr-2" /> Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<PageProps>().props;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Desktop sidebar (collapses to an icon rail) */}
            <div className="hidden lg:block h-full">
                <Sidebar
                    currentPath={currentPath}
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                />
            </div>

            {/* Mobile drawer (slides in/out) */}
            <div
                className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
                aria-hidden={!mobileOpen}
            >
                <div
                    onClick={() => setMobileOpen(false)}
                    className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                />
                <div
                    className={`absolute inset-y-0 left-0 transition-transform duration-200 ease-in-out ${
                        mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <Sidebar
                        currentPath={currentPath}
                        collapsed={false}
                        mobile
                        onNavigate={() => setMobileOpen(false)}
                        onToggle={() => setMobileOpen(false)}
                    />
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                    user={auth.user}
                    onMenuClick={() => setMobileOpen(!mobileOpen)}
                    mobileOpen={mobileOpen}
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
