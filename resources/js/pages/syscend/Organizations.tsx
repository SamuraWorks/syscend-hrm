import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';

interface OrganizationRow {
    id: number;
    name: string;
    country: string | null;
    size: string | null;
    contact: string | null;
    email: string | null;
    requests_count: number;
    licenses_count: number;
}

interface Pagination {
    current: number;
    last: number;
    total: number;
}

interface OrganizationsProps {
    organizations: OrganizationRow[];
    pagination: Pagination;
}

export default function Organizations({ organizations, pagination }: OrganizationsProps) {
    const [search, setSearch] = useState('');

    const applySearch = () => {
        router.get('/syscend/organizations', { search: search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
                <p className="mt-1 text-sm text-slate-500">Every customer organization created through purchases or provisioning.</p>
            </div>

            <div className="mb-5 flex items-center gap-2">
                <div className="relative w-full sm:w-auto">
                    <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                        placeholder="Search organization…"
                        className="pl-9 w-full sm:w-64"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto"><table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                        <tr>
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium">Country</th>
                            <th className="px-5 py-3 font-medium">Size</th>
                            <th className="px-5 py-3 font-medium">Contact</th>
                            <th className="px-5 py-3 font-medium">Email</th>
                            <th className="px-5 py-3 text-center font-medium">Requests</th>
                            <th className="px-5 py-3 text-center font-medium">Licenses</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {organizations.length === 0 && (
                            <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No organizations found.</td></tr>
                        )}
                        {organizations.map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50">
                                <td className="px-5 py-3 font-medium text-slate-900">{o.name}</td>
                                <td className="px-5 py-3 text-slate-500">{o.country ?? '—'}</td>
                                <td className="px-5 py-3 text-slate-500">{o.size ?? '—'}</td>
                                <td className="px-5 py-3 text-slate-500">{o.contact ?? '—'}</td>
                                <td className="px-5 py-3 text-slate-500 break-all">{o.email ?? '—'}</td>
                                <td className="px-5 py-3 text-center text-slate-600">{o.requests_count}</td>
                                <td className="px-5 py-3 text-center text-slate-600">{o.licenses_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>

                {pagination.last > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
                        <span>Page {pagination.current} of {pagination.last} ({pagination.total} total)</span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                disabled={pagination.current <= 1}
                                onClick={() => router.get('/syscend/organizations', { page: pagination.current - 1, search: search || undefined }, { preserveState: true })}
                                className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                disabled={pagination.current >= pagination.last}
                                onClick={() => router.get('/syscend/organizations', { page: pagination.current + 1, search: search || undefined }, { preserveState: true })}
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