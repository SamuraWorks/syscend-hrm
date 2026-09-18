import { Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    CreditCard,
    Search,
    SearchX,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';

interface Payment {
    id: number;
    reference: string;
    status: string;
    status_label: string;
    organization: string;
    contact_email: string;
    contact_phone: string | null;
    total: number;
    currency: string;
    paid_at: string | null;
    payment_confirmed_at: string | null;
}

interface Props {
    payments: Payment[];
    summary: { total_paid: number; paid_count: number; awaiting: number; currency: string };
    pagination: { current: number; last: number; total: number; per_page: number; records_start: number; records_end: number };
    filters: { status: string | null; search: string | null };
}

const STATUS_COLORS: Record<string, string> = {
    payment_confirmed: 'bg-emerald-50 text-emerald-700',
    license_issued: 'bg-purple-50 text-purple-700',
    configuration: 'bg-indigo-50 text-indigo-700',
    deployment: 'bg-cyan-50 text-cyan-700',
    training: 'bg-teal-50 text-teal-700',
    completed: 'bg-emerald-50 text-emerald-700',
};

export default function Payments({ payments, summary, pagination, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const money = (v: number) => `${summary.currency} ${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

    const applyFilters = (s = status) => {
        router.get('/syscend/payments', {
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(s ? { status: s } : {}),
        }, { preserveState: true, replace: true });
    };

    const go = (page: number) => {
        router.get('/syscend/payments', {
            ...(filters.search ? { search: filters.search } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            page,
        }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
                <p className="mt-1 text-sm text-slate-500">Who has paid, how much, and when.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500"><Wallet size={15} className="text-emerald-600" /> Total collected</div>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{money(summary.total_paid)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500"><CheckCircle2 size={15} className="text-emerald-600" /> Paid orders</div>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{summary.paid_count}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500"><Clock size={15} className="text-amber-500" /> Awaiting payment</div>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{summary.awaiting}</p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Search reference or organization…"
                                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            onBlur={() => applyFilters()}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">All statuses</option>
                            {Object.keys(STATUS_COLORS).map((s) => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={() => applyFilters()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto"><table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                            <th className="px-6 py-3 font-medium">Reference</th>
                            <th className="px-4 py-3 font-medium">Organization</th>
                            <th className="px-4 py-3 font-medium">Amount</th>
                            <th className="px-4 py-3 font-medium">Paid at</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 text-right font-medium">Contact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {payments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center">
                                    <SearchX size={22} className="mx-auto text-slate-300" />
                                    <p className="mt-2 text-slate-400">No payments match your filters.</p>
                                </td>
                            </tr>
                        )}
                        {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3">
                                    <Link href={`/syscend/requests/${p.id}`} className="font-mono text-xs font-semibold text-blue-600 hover:underline">
                                        {p.reference}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-slate-700">{p.organization}</td>
                                <td className="px-4 py-3 font-semibold text-slate-900">{money(p.total)}</td>
                                <td className="px-4 py-3 text-slate-500">{p.paid_at ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {p.status_label}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right text-xs text-slate-500">
                                    <span className="block">{p.contact_email}</span>
                                    {p.contact_phone && <span className="block text-slate-400">{p.contact_phone}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>

                {pagination.total > 0 && (
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
                <CreditCard size={13} /> Payments are recorded when a purchase request is marked payment confirmed.
            </p>
        </AppLayout>
    );
}