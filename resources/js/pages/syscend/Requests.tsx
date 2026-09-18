import { Link, router } from '@inertiajs/react';
import { ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';

interface RequestRow {
    id: number;
    reference: string;
    status: string;
    status_label: string;
    currency: string;
    total: number;
    organization: { name: string; contact: string | null; email: string | null };
    created_at: string | null;
}

interface Pagination {
    current: number;
    last: number;
    total: number;
    per_page: number;
    records_start: number;
    records_end: number;
}

interface RequestsProps {
    requests: RequestRow[];
    pagination: Pagination;
    filters: { status: string | null; search: string | null };
}

const STATUS_FILTERS = ['', 'draft', 'submitted', 'awaiting_payment', 'payment_confirmed', 'license_issued', 'configuration', 'deployment', 'training', 'completed', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-blue-50 text-blue-700',
    awaiting_payment: 'bg-amber-50 text-amber-700',
    payment_confirmed: 'bg-emerald-50 text-emerald-700',
    license_issued: 'bg-purple-50 text-purple-700',
    configuration: 'bg-indigo-50 text-indigo-700',
    deployment: 'bg-cyan-50 text-cyan-700',
    training: 'bg-teal-50 text-teal-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
};

export default function Requests({ requests, pagination, filters }: RequestsProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (status: string) => {
        router.get('/syscend/requests', { status: status || undefined, search: search || undefined }, { preserveState: true, replace: true });
    };

    const applySearch = () => {
        router.get('/syscend/requests', { status: filters.status || undefined, search: search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Purchase requests</h1>
                <p className="mt-1 text-sm text-slate-500">Track the full journey from enquiry to completed deployment.</p>
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((status) => {
                        const label = status === '' ? 'All' : status.replace('_', ' ');
                        return (
                            <button
                                key={status || 'all'}
                                type="button"
                                onClick={() => applyFilters(status)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                                    (filters.status ?? '') === status
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                            placeholder="Search reference or organisation…"
                            className="pl-9 w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto"><table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                        <tr>
                            <th className="px-5 py-3 font-medium">Reference</th>
                            <th className="px-5 py-3 font-medium">Organization</th>
                            <th className="px-5 py-3 font-medium">Contact</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 text-right font-medium">Total</th>
                            <th className="px-5 py-3 font-medium">Created</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {requests.length === 0 && (
                            <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No requests match your filters.</td></tr>
                        )}
                        {requests.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50">
                                <td className="px-5 py-3">
                                    <Link href={`/syscend/requests/${r.id}`} className="font-mono text-xs font-semibold text-blue-600 hover:underline">
                                        {r.reference}
                                    </Link>
                                </td>
                                <td className="px-5 py-3 font-medium text-slate-900">{r.organization.name}</td>
                                <td className="px-5 py-3 text-slate-500">{r.organization.contact ?? '—'}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {r.status_label}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-slate-900">{r.total.toLocaleString()}</td>
                                <td className="px-5 py-3 text-xs text-slate-400">{r.created_at ?? '—'}</td>
                                <td className="px-5 py-3 text-right">
                                    <Link href={`/syscend/requests/${r.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                                        Open <ArrowRight size={13} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>

                {pagination.last > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
                        <span>
                            Showing {pagination.records_start}–{pagination.records_end} of {pagination.total}
                        </span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                disabled={pagination.current <= 1}
                                onClick={() => router.get('/syscend/requests', { page: pagination.current - 1, status: filters.status || undefined, search: filters.search || undefined }, { preserveState: true })}
                                className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                disabled={pagination.current >= pagination.last}
                                onClick={() => router.get('/syscend/requests', { page: pagination.current + 1, status: filters.status || undefined, search: filters.search || undefined }, { preserveState: true })}
                                className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}