import { router } from '@inertiajs/react';
import { CheckCircle2, Circle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface DeploymentStep {
    label: string;
    done: boolean;
}

interface DeploymentRow {
    id: number;
    organization: string;
    status: string;
    domain: string | null;
    ssl: boolean;
    steps: DeploymentStep[];
    steps_done: number;
    steps_total: number;
    notes: string | null;
}

interface Pagination {
    current: number;
    last: number;
    total: number;
}

interface DeploymentsProps {
    deployments: DeploymentRow[];
    pagination: Pagination;
}

const STATUS_COLORS: Record<string, string> = {
    queued: 'bg-slate-100 text-slate-600',
    provisioning: 'bg-blue-50 text-blue-700',
    ready: 'bg-teal-50 text-teal-700',
    deployed: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-red-50 text-red-600',
};

export default function Deployments({ deployments, pagination }: DeploymentsProps) {
    const toggleStep = (id: number, index: number) => {
        router.post(`/syscend/deployments/${id}/steps`, { index }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Deployments</h1>
                <p className="mt-1 text-sm text-slate-500">Tick off provisioning steps as each production installation is brought live.</p>
            </div>

            <div className="space-y-4">
                {deployments.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400">
                        No deployments yet. They are created when a license is issued.
                    </div>
                )}

                {deployments.map((d) => (
                    <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-slate-900">{d.organization}</h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    {d.domain ?? 'No domain configured'}
                                    {d.ssl ? ' · SSL enabled' : ''}
                                </p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[d.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {d.status}
                            </span>
                        </div>

                        <div className="mt-4">
                            <p className="text-xs font-medium text-slate-500">
                                {d.steps_done} of {d.steps_total} steps complete
                            </p>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{ width: `${d.steps_total ? Math.round((d.steps_done / d.steps_total) * 100) : 0}%` }}
                                />
                            </div>
                        </div>

                        {d.steps.length > 0 && (
                            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                {d.steps.map((step, index) => (
                                    <li key={`${d.id}-${index}`}>
                                        <button
                                            type="button"
                                            onClick={() => toggleStep(d.id, index)}
                                            className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                                                step.done
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                                            }`}
                                        >
                                            {step.done ? (
                                                <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-600" />
                                            ) : (
                                                <Circle size={16} className="flex-shrink-0 text-slate-300" />
                                            )}
                                            <span className="truncate">{step.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {d.notes && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{d.notes}</p>}
                    </div>
                ))}
            </div>

            {pagination.last > 1 && (
                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                    <span>Page {pagination.current} of {pagination.last}</span>
                    <div className="flex gap-1">
                        <button
                            type="button"
                            disabled={pagination.current <= 1}
                            onClick={() => router.get('/syscend/deployments', { page: pagination.current - 1 }, { preserveState: true })}
                            className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <button
                            type="button"
                            disabled={pagination.current >= pagination.last}
                            onClick={() => router.get('/syscend/deployments', { page: pagination.current + 1 }, { preserveState: true })}
                            className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}