import { router } from '@inertiajs/react';
import { CheckCircle2, Search, SearchX, UserCog, UserX } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';

interface PortalUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    roles: string[];
    last_login_at: string | null;
    created_at: string | null;
}

interface Props {
    users: PortalUser[];
    roles: string[];
    pagination: { current: number; last: number; total: number; per_page: number; records_start: number; records_end: number };
    filters: { role: string | null; search: string | null };
}

const ROLE_COLORS: Record<string, string> = {
    'Syscend Admin': 'bg-slate-900 text-white',
    Admin: 'bg-indigo-50 text-indigo-700',
    'HR Manager': 'bg-blue-50 text-blue-700',
    Manager: 'bg-cyan-50 text-cyan-700',
    Employee: 'bg-slate-100 text-slate-600',
    Recruiter: 'bg-purple-50 text-purple-700',
    Finance: 'bg-emerald-50 text-emerald-700',
};

export default function Users({ users, roles, pagination, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    const applyFilters = () => {
        router.get('/syscend/users', {
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(role ? { role } : {}),
        }, { preserveState: true, replace: true });
    };

    const go = (page: number) => {
        router.get('/syscend/users', {
            ...(filters.search ? { search: filters.search } : {}),
            ...(filters.role ? { role: filters.role } : {}),
            page,
        }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                <p className="mt-1 text-sm text-slate-500">Everyone with access to the workspace, their roles and activity.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Search name, email or phone…"
                                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            onBlur={() => applyFilters()}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">All roles</option>
                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={applyFilters}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto"><table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Contact</th>
                            <th className="px-4 py-3 font-medium">Roles</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Last login</th>
                            <th className="px-6 py-3 font-medium">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center">
                                    <SearchX size={22} className="mx-auto text-slate-300" />
                                    <p className="mt-2 text-slate-400">No users match your filters.</p>
                                </td>
                            </tr>
                        )}
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                            {u.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="font-medium text-slate-800">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="block text-slate-600">{u.email}</span>
                                    {u.phone && <span className="block text-xs text-slate-400">{u.phone}</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {(u.roles.length ? u.roles : ['No role']).map((r) => (
                                            <span key={r} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[r] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {u.is_active ? (
                                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                            <CheckCircle2 size={13} /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                                            <UserX size={13} /> Disabled
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-500">{u.last_login_at ?? 'Never'}</td>
                                <td className="px-6 py-3 text-slate-500">{u.created_at ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>

                {pagination.total > pagination.per_page && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm text-slate-500">
                        <span>{pagination.records_start}–{pagination.records_end} of {pagination.total}</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={pagination.current <= 1}
                                onClick={() => go(pagination.current - 1)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <span className="px-2 py-1.5">Page {pagination.current} of {pagination.last}</span>
                            <button
                                type="button"
                                disabled={pagination.current >= pagination.last}
                                onClick={() => go(pagination.current + 1)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                <UserCog size={13} /> Last login is recorded on every sign-in.
            </p>
        </AppLayout>
    );
}