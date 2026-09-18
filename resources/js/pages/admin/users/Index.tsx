import { Link, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft, ChevronRight, KeyRound, Lock, Plus,
    Search, ShieldCheck, ToggleLeft, ToggleRight, Users, X,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role { id: number; name: string }

interface UserRow {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: Role[];
}

interface Paginator {
    data: UserRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    users: Paginator;
    roles: Role[];
    filters: Record<string, string>;
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }: ConfirmModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full mx-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h2>
                <p className="text-sm text-slate-500 mb-5">{message}</p>
                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
                    <Button
                        size="sm"
                        onClick={onConfirm}
                        className={danger ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersIndex({ users, roles, filters }: Props) {
    const [search, setSearch]     = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? '');
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean; type: 'toggle' | 'reset'; userId: number; userName: string; isActive?: boolean;
    }>({ open: false, type: 'toggle', userId: 0, userName: '' });

    function applySearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/users', { ...filters, search }, { preserveState: true, replace: true });
    }

    function applyRoleFilter(value: string) {
        setRoleFilter(value);
        router.get('/admin/users', { ...filters, role: value, page: 1 }, { preserveState: true, replace: true });
    }

    function clearAll() {
        setSearch('');
        setRoleFilter('');
        router.get('/admin/users', {}, { preserveState: true, replace: true });
    }

    function handleConfirm() {
        const { type, userId } = confirmModal;
        setConfirmModal((prev) => ({ ...prev, open: false }));

        if (type === 'toggle') {
            router.patch(`/admin/users/${userId}/toggle-active`, {}, { preserveScroll: true });
        } else {
            router.patch(`/admin/users/${userId}/reset-password`, {}, { preserveScroll: true });
        }
    }

    const hasFilters = !!(filters.search || filters.role);

    return (
        <AppLayout>
            <div className="space-y-5 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={22} className="text-blue-600" /> User Management
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">{users.total} total system users</p>
                    </div>
                    <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                        <Link href="/admin/users/create">
                            <Plus size={14} /> Add User
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <form onSubmit={applySearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <div className="relative flex-1 max-w-sm">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Search name or email…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 h-9 text-sm"
                                    />
                                </div>
                                <Button type="submit" size="sm" variant="secondary">Search</Button>
                            </form>

                            <select
                                value={roleFilter}
                                onChange={(e) => applyRoleFilter(e.target.value)}
                                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                <option value="">All Roles</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>

                            {hasFilters && (
                                <button onClick={clearAll} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1">
                                    <X size={12} /> Clear
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">User</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Role</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-16 text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={32} className="text-slate-300" />
                                                <p className="font-medium">No users found</p>
                                                <p className="text-xs">Try adjusting your search</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => {
                                        const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                                        const role = user.roles[0]?.name ?? '—';
                                        return (
                                            <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                            <p className="text-xs text-slate-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                                        <ShieldCheck size={10} /> {role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                        user.is_active
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
                                                    )}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/users/${user.id}/edit`}
                                                            className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => setConfirmModal({
                                                                open: true,
                                                                type: 'toggle',
                                                                userId: user.id,
                                                                userName: user.name,
                                                                isActive: user.is_active,
                                                            })}
                                                            className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            {user.is_active ? <ToggleLeft size={12} /> : <ToggleRight size={12} />}
                                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmModal({
                                                                open: true,
                                                                type: 'reset',
                                                                userId: user.id,
                                                                userName: user.name,
                                                            })}
                                                            className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            <KeyRound size={12} /> Reset Pwd
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500">
                                {users.from && users.to ? `Showing ${users.from}–${users.to} of ${users.total}` : `${users.total} users`}
                            </p>
                            <div className="flex items-center gap-1">
                                {users.prev_page_url && (
                                    <Link href={users.prev_page_url} className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <ChevronLeft size={12} /> Prev
                                    </Link>
                                )}
                                <span className="px-3 py-1.5 text-xs text-slate-500">
                                    Page {users.current_page} of {users.last_page}
                                </span>
                                {users.next_page_url && (
                                    <Link href={users.next_page_url} className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Next <ChevronRight size={12} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                title={confirmModal.type === 'toggle'
                    ? (confirmModal.isActive ? 'Deactivate User' : 'Activate User')
                    : 'Reset Password'}
                message={confirmModal.type === 'toggle'
                    ? `Are you sure you want to ${confirmModal.isActive ? 'deactivate' : 'activate'} ${confirmModal.userName}?`
                    : `Reset password for ${confirmModal.userName} to "Admin@1234"?`}
                confirmLabel={confirmModal.type === 'toggle'
                    ? (confirmModal.isActive ? 'Deactivate' : 'Activate')
                    : 'Reset Password'}
                danger={confirmModal.type === 'reset' || confirmModal.isActive}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
            />
        </AppLayout>
    );
}
