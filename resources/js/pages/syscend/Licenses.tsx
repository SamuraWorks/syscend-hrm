import { router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

interface LicenseRow {
    id: number;
    license_key: string;
    organization: string;
    license_type: string;
    status: string;
    issued_at: string | null;
    expires_at: string | null;
    product: string | null;
}

interface Pagination {
    current: number;
    last: number;
    total: number;
}

interface LicensesProps {
    licenses: LicenseRow[];
    pagination: Pagination;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    active: 'bg-emerald-50 text-emerald-700',
    suspended: 'bg-amber-50 text-amber-700',
    expired: 'bg-slate-100 text-slate-500',
    revoked: 'bg-red-50 text-red-600',
};

export default function Licenses({ licenses, pagination }: LicensesProps) {
    const runAction = (id: number, action: string) => {
        router.post(`/syscend/licenses/${id}/${action}`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Licenses</h1>
                <p className="mt-1 text-sm text-slate-500">
                    One-time (perpetual) or yearly production licenses issued to customer organizations.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto"><table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                        <tr>
                            <th className="px-5 py-3 font-medium">License key</th>
                            <th className="px-5 py-3 font-medium">Organization</th>
                            <th className="px-5 py-3 font-medium">Term</th>
                            <th className="px-5 py-3 font-medium">Product</th>
                            <th className="px-5 py-3 font-medium">Issued</th>
                            <th className="px-5 py-3 font-medium">Expires</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {licenses.length === 0 && (
                            <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">No licenses issued yet.</td></tr>
                        )}
                        {licenses.map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50">
                                <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800">{l.license_key}</td>
                                <td className="px-5 py-3 font-medium text-slate-900">{l.organization}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${l.license_type === 'yearly' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                        {l.license_type === 'yearly' ? 'Yearly' : 'One-time'}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-slate-500">{l.product ?? '—'}</td>
                                <td className="px-5 py-3 text-xs text-slate-400">{l.issued_at ?? '—'}</td>
                                <td className="px-5 py-3 text-xs text-slate-500">{l.expires_at ?? 'Never'}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[l.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {l.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex gap-1.5">
                                        {l.license_type === 'yearly' && !['revoked', 'suspended'].includes(l.status) && (
                                            <Button type="button" size="sm" onClick={() => runAction(l.id, 'extend')} className="bg-blue-600 text-white hover:bg-blue-500">
                                                Extend +1yr
                                            </Button>
                                        )}
                                        {l.status !== 'active' && (
                                            <Button type="button" size="sm" onClick={() => runAction(l.id, 'activate')} className="bg-emerald-600 text-white hover:bg-emerald-500">
                                                Activate
                                            </Button>
                                        )}
                                        {l.status === 'active' && (
                                            <Button type="button" size="sm" onClick={() => runAction(l.id, 'suspend')} className="bg-amber-500 text-white hover:bg-amber-400">
                                                Suspend
                                            </Button>
                                        )}
                                        {!['revoked', 'suspended'].includes(l.status) && (
                                            <Button type="button" size="sm" variant="outline" onClick={() => runAction(l.id, 'revoke')} className="border-red-200 text-red-600 hover:bg-red-50">
                                                Revoke
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>

                {pagination.last > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
                        <span>Page {pagination.current} of {pagination.last}</span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                disabled={pagination.current <= 1}
                                onClick={() => router.get('/syscend/licenses', { page: pagination.current - 1 }, { preserveState: true })}
                                className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                disabled={pagination.current >= pagination.last}
                                onClick={() => router.get('/syscend/licenses', { page: pagination.current + 1 }, { preserveState: true })}
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