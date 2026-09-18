import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Circle, Clock, KeyRound } from 'lucide-react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import { Button } from '@/components/ui/button';

interface PurchaseStatus {
    reference: string;
    status: string;
    status_label: string;
    currency: string;
    total: number;
    submitted_at: string | null;
    payment_note: string | null;
    organization: { name: string; contact: string | null; email: string | null };
    items: { name: string; category: string; qty: number; unit_price: number; line_total: number; term: string }[];
}

interface Step {
    status: string;
    label: string;
    current: boolean;
    done: boolean;
}

interface StatusProps {
    purchase: PurchaseStatus;
    steps: Step[];
    license: { license_key: string; status: string; license_type: string; expires_at: string | null } | null;
}

export default function Status({ purchase, steps, license }: StatusProps) {
    return (
        <MarketingLayout>
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-4xl px-6 py-10 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Purchase request</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">
                        {purchase.reference}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        {purchase.organization.name}
                        {purchase.submitted_at ? ` · submitted ${purchase.submitted_at}` : ''}
                    </p>
                    <span className="mt-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                        Status: {purchase.status_label}
                    </span>
                </div>
            </section>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {/* Timeline */}
                <section className="rounded-2xl border border-slate-200 bg-white p-8">
                    <h2 className="text-lg font-bold text-slate-900">Progress</h2>
                    <ol className="mt-6 grid gap-0 sm:grid-cols-4">
                        {steps.map((step, i) => (
                            <li key={step.status} className="relative flex sm:block items-start gap-3">
                                {i < steps.length - 1 && (
                                    <span
                                        className={`absolute left-5 top-5 hidden sm:block h-0.5 w-full ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        style={{ width: 'calc(100% - 2.5rem)', left: '2.5rem' }}
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
                </section>

                {license && (
                    <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8">
                        <div className="flex items-center gap-3">
                            <KeyRound size={20} className="text-emerald-600" />
                            <h2 className="text-lg font-bold text-slate-900">License issued</h2>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">Your production license key:</p>
                        <p className="mt-3 inline-block rounded-lg bg-white px-4 py-2 font-mono text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            {license.license_key}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            {license.license_type === 'yearly'
                                ? `Status: ${license.status} · Yearly license · ${license.expires_at ? `expires ${license.expires_at}` : ''}`
                                : `Status: ${license.status} · Perpetual license`}
                        </p>
                    </section>
                )}

                {/* Order details */}
                <section className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-7">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Order summary</h2>
                        <ul className="mt-4 space-y-3">
                            {purchase.items.map((item) => (
                                <li key={item.name} className="flex items-start justify-between gap-2 text-sm">
                                    <span className="text-slate-600">
                                        {item.name}
                                        {item.category === 'license' && (
                                            <span className="text-xs capitalize text-slate-400"> · {item.term}</span>
                                        )}
                                        {item.qty > 1 && <span className="text-slate-400"> ×{item.qty}</span>}
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        {item.line_total > 0 ? `${purchase.currency} ${item.line_total.toLocaleString()}` : 'Quote'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-sm font-medium text-slate-500">Estimated total</span>
                            <span className="text-lg font-bold text-slate-900">
                                {purchase.currency} {Math.round(purchase.total).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-7">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">What happens next</h2>
                        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                            {purchase.payment_note || 'Our team will contact you shortly to confirm your order and payment details.'}
                        </p>
                        <p className="mt-3 text-sm text-slate-500">
                            Contact person: <span className="font-medium text-slate-800">{purchase.organization.contact || '—'}</span>
                            {purchase.organization.email ? ` (${purchase.organization.email})` : ''}
                        </p>
                        <p className="mt-3 text-xs text-slate-400">
                            Changes? <Link href="/contact" className="text-blue-600 hover:underline">Contact our team</Link>.
                        </p>
                        <Button asChild className="mt-5 bg-blue-600 hover:bg-blue-500 text-white font-medium">
                            <Link href="/">Back to home <ArrowRight size={15} className="ml-1.5" /></Link>
                        </Button>
                    </div>
                </section>
            </main>
        </MarketingLayout>
    );
}