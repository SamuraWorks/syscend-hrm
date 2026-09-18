import { Link, router } from '@inertiajs/react';
import {
    Activity, ChevronLeft, ChevronRight, Download, Search, X,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
    id: number;
    user_name: string;
    action: string;
    module: string;
    description: string | null;
    ip_address: string | null;
    created_at: string;
}

interface Paginator {
    data: LogEntry[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface UserOption { id: number; name: string }

interface Props {
    logs: Paginator;
    modules: string[];
    users: UserOption[];
    filters: Record<string, string>;
}

// ─── Action Badge ─────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
    created:        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    updated:        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    deleted:        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    activated:      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    deactivated:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    password_reset: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    exported:       'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    login:          'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
};

function ActionBadge({ action }: { action: string }) {
    return (
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
            ACTION_COLORS[action.toLowerCase()] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
        )}>
            {action.replace(/_/g, ' ')}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogIndex({ logs, modules, users, filters }: Props) {
    const [search, setSearch]   = useState(filters.search   ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo]   = useState(filters.date_to   ?? '');

    function applyFilters(overrides: Record<string, string> = {}) {
        const params = { ...filters, search, date_from: dateFrom, date_to: dateTo, ...overrides };
        // Remove empty values
        Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
        router.get('/admin/audit-log', params, { preserveState: true, replace: true });
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        applyFilters();
    }

    function applyFilter(key: string, value: string) {
        applyFilters({ [key]: value, page: '1' });
    }

    function clearAll() {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/audit-log', {}, { preserveState: true, replace: true });
    }

    function buildExportUrl() {
        const params = new URLSearchParams();
        if (filters.user_id)   params.set('user_id',   filters.user_id);
        if (filters.module)    params.set('module',    filters.module);
        if (filters.search)    params.set('search',    filters.search);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to)   params.set('date_to',   filters.date_to);
        return `/admin/audit-log/export?${params.toString()}`;
    }

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <AppLayout>
            <div className="space-y-5 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity size={22} className="text-blue-600" /> Audit Log
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">{logs.total} total log entries</p>
                    </div>
                    <a
                        href={buildExportUrl()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Download size={14} /> Export CSV
                    </a>
                </div>

                {/* Filter bar */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <div className="relative flex-1 max-w-xs">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Search description…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 h-9 text-sm"
                                    />
                                </div>
                                <Button type="submit" size="sm" variant="secondary">Search</Button>
                            </form>

                            {/* User filter */}
                            <select
                                value={filters.user_id ?? ''}
                                onChange={(e) => applyFilter('user_id', e.target.value)}
                                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                <option value="">All Users</option>
                                {users.map((u) => (
                                    <option key={u.id} value={String(u.id)}>{u.name}</option>
                                ))}
                            </select>

                            {/* Module filter */}
                            <select
                                value={filters.module ?? ''}
                                onChange={(e) => applyFilter('module', e.target.value)}
                                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                <option value="">All Modules</option>
                                {modules.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>

                            {/* Date from */}
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => { setDateFrom(e.target.value); applyFilters({ date_from: e.target.value }); }}
                                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                title="From date"
                            />
                            <span className="text-xs text-slate-400">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => { setDateTo(e.target.value); applyFilters({ date_to: e.target.value }); }}
                                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                title="To date"
                            />

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
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Date / Time</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">User</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Module</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Action</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Description</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Activity size={32} className="text-slate-300" />
                                                <p className="font-medium">No audit logs found</p>
                                                <p className="text-xs">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                                {log.user_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <ActionBadge action={log.action} />
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                {log.description ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                                                {log.ip_address ?? '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500">
                                {logs.from && logs.to ? `Showing ${logs.from}–${logs.to} of ${logs.total}` : `${logs.total} entries`}
                            </p>
                            <div className="flex items-center gap-1">
                                {logs.prev_page_url && (
                                    <Link href={logs.prev_page_url} className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <ChevronLeft size={12} /> Prev
                                    </Link>
                                )}
                                <span className="px-3 py-1.5 text-xs text-slate-500">
                                    Page {logs.current_page} of {logs.last_page}
                                </span>
                                {logs.next_page_url && (
                                    <Link href={logs.next_page_url} className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Next <ChevronRight size={12} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
