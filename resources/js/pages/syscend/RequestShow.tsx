import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Boxes,
    CheckCircle2,
    Circle,
    Clock,
    KeyRound,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

interface RequestItem {
    name: string;
    category: string;
    qty: number;
    unit_price: number;
    line_total: number;
    term: string;
    period_months: number | null;
}

interface TimelineStep {
    status: string;
    label: string;
    current: boolean;
    done: boolean;
}

interface OrganizationInfo {
    id: number;
    name: string;
    contact: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
}

interface RequestInfo {
    id: number;
    reference: string;
    status: string;
    status_label: string;
    currency: string;
    subtotal: number;
    total: number;
    notes: string | null;
    submitted_at: string | null;
    payment_confirmed_at: string | null;
    created_at: string;
    organization: OrganizationInfo;
    items: RequestItem[];
    license: { id: number; license_key: string; status: string; license_type: string; expires_at: string | null } | null;
    deployment: { id: number; status: string; domain: string | null } | null;
    allowed_actions: string[];
    timeline: TimelineStep[];
}

interface RequestShowProps {
    request: RequestInfo;
}

const ACTION_LABELS: Record<string, string> = {
    submit: 'Mark as submitted',
    'awaiting-payment': 'Mark awaiting payment',
    'confirm-payment': 'Confirm payment',
    'issue-license': 'Issue license',
    'start-configuration': 'Start configuration',
    'start-deployment': 'Start deployment',
    'finish-training': 'Finish training',
    complete: 'Complete order',
    cancel: 'Cancel request',
};

export default function RequestShow({ request }: RequestShowProps) {
    const [busy, setBusy] = useState<string | null>(null);
    const r = request;

    const runAction = (action: string) => {
        setBusy(action);
        router.post(`/syscend/requests/${r.id}/${action}`, {}, {
            preserveScroll: true,
            onFinish: () => setBusy(null),
        });
    };

    const destructive = ['cancel'];

    return (
        <AppLayout>
            <Link href="/syscend/requests" className="mb-5 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                <ArrowLeft size={15} /> Back to requests
            </Link>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{r.reference}</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {r.organization.name} · created {r.created_at}
                        {r.submitted_at ? ` · submitted ${r.submitted_at}` : ''}
                        {r.payment_confirmed_at ? ` · paid ${r.payment_confirmed_at}` : ''}
                    </p>
                    <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {r.status_label}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {r.allowed_actions.map((action) => (
                        <Button
                            key={action}
                            type="button"
                            onClick={() => runAction(action)}
                            disabled={busy !== null}
                            className={
                                destructive.includes(action)
                                    ? 'bg-red-600 text-white hover:bg-red-500'
                                    : 'bg-blue-600 text-white hover:bg-blue-500'
                            }
                        >
                            {busy === action ? 'Working…' : ACTION_LABELS[action] ?? action}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Timeline */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Progress</h2>
                    <ol className="mt-6 grid gap-4 sm:grid-cols-4">
                        {r.timeline.map((step, i) => (
                            <li key={step.status} className="relative flex sm:block items-start gap-3">
                                {i < r.timeline.length - 1 && (
                                    <span
                                        className={`absolute hidden sm:block h-0.5 ${
                                            step.done ? 'bg-emerald-500' : 'bg-slate-200'
                                        }`}
                                        style={{ width: 'calc(100% - 2.5rem)', left: '2.5rem', top: '1.25rem' }}
                                    />
                                )}
                                <span
                                    className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 bg-white ${
                                        step.done
                                            ? 'border-emerald-500 text-emerald-600'
                                            : step.current
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-slate-200 text-slate-300'
                                    }`}
                                >
                                    {step.done ? <CheckCircle2 size={18} /> : step.current ? <Clock size={18} /> : <Circle size={18} />}
                                </span>
                                <span className="sm:mt-3">
                                    <span className={`block text-sm font-semibold ${step.done || step.current ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {step.label}
                                    </span>
                                    {step.current && <span className="text-xs text-blue-600">In progress</span>}
                                </span>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Order items</h3>
                            <ul className="mt-3 divide-y divide-slate-50 rounded-xl border border-slate-200">
                                {r.items.map((item) => (
                                    <li key={item.name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                        <span className="text-slate-600">
                                            {item.name}
                                            {item.category === 'license' && (
                                                <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium capitalize text-blue-700">
                                                    {item.term}
                                                </span>
                                            )}
                                            {item.qty > 1 && <span className="text-slate-400"> ×{item.qty}</span>}
                                        </span>
                                        <span className="font-medium text-slate-900">
                                            {item.line_total > 0 ? `${r.currency} ${item.line_total.toLocaleString()}` : 'Quote'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Organization</h3>
                            <div className="mt-3 space-y-2 rounded-xl border border-slate-200 p-4 text-sm">
                                <p className="font-semibold text-slate-900">{r.organization.name}</p>
                                <p className="text-slate-500">{r.organization.country || '—'}</p>
                                <p className="text-slate-600">{(r.organization.contact ?? '—')}</p>
                                <p className="text-slate-600 break-all">{r.organization.email ?? '—'}</p>
                                <p className="text-slate-600">{r.organization.phone ?? '—'}</p>
                            </div>
                        </div>
                    </div>

                    {r.notes && (
                        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <span className="font-semibold">Notes: </span>{r.notes}
                        </div>
                    )}
                </div>

                {/* License + deployment */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center gap-2">
                            <KeyRound size={16} className="text-emerald-600" />
                            <h3 className="font-semibold text-slate-900">License</h3>
                        </div>
                        {r.license ? (
                            <>
                                <p className="mt-3 break-all font-mono text-sm font-semibold text-emerald-700">
                                    {r.license.license_key}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.license.license_type === 'yearly' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                        {r.license.license_type === 'yearly' ? 'Yearly' : 'One-time'}
                                    </span>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                        {r.license.status}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    {r.license.expires_at ? `Expires ${r.license.expires_at}` : 'Perpetual — never expires'}
                                </p>
                            </>
                        ) : (
                            <p className="mt-3 text-sm text-slate-400">
                                Not issued yet. Confirm payment and issue the license to activate this order.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center gap-2">
                            <Boxes size={16} className="text-cyan-600" />
                            <h3 className="font-semibold text-slate-900">Deployment</h3>
                        </div>
                        {r.deployment ? (
                            <>
                                <p className="mt-3 text-sm text-slate-600">
                                    Status: <span className="font-medium text-slate-900">{r.deployment.status}</span>
                                </p>
                                <p className="mt-1 text-sm text-slate-500">Domain: {r.deployment.domain ?? '—'}</p>
                                <Link
                                    href="/syscend/deployments"
                                    className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
                                >
                                    Manage steps →
                                </Link>
                            </>
                        ) : (
                            <p className="mt-3 text-sm text-slate-400">
                                A deployment is created automatically when the license is issued.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h3 className="font-semibold text-slate-900">Order summary</h3>
                        <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-slate-500">Estimated total</span>
                            <span className="text-lg font-bold text-slate-900">
                                {r.currency} {Math.round(r.total).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}