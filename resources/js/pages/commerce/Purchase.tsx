import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Building2,
    Check,
    KeyRound,
    Palette,
    ShieldCheck,
    ShoppingBag,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    description: string | null;
    category: string;
    type: string;
    price: number;
    yearly_price: number | null;
    currency: string;
    one_time: boolean;
}

interface PurchaseProps {
    products: Product[];
    maxQty: number;
}

const STEPS = [
    { icon: ShoppingBag, label: 'Package' },
    { icon: Building2, label: 'Organisation' },
    { icon: Palette, label: 'Branding' },
    { icon: BadgeCheck, label: 'Review' },
];

const ORG_FIELDS: { key: keyof ContactForm; label: string; required?: boolean; type?: string; span?: boolean }[] = [
    { key: 'name', label: 'Organisation name', required: true },
    { key: 'short_name', label: 'Short name (optional)' },
    { key: 'industry', label: 'Industry' },
    { key: 'country', label: 'Country' },
    { key: 'size', label: 'Organisation size', required: true },
    { key: 'website', label: 'Website' },
    { key: 'contact_name', label: 'Contact person', required: true },
    { key: 'contact_position', label: 'Contact position' },
    { key: 'contact_email', label: 'Contact email', required: true, type: 'email' },
    { key: 'contact_phone', label: 'Contact phone' },
    { key: 'address', label: 'Address', span: true },
];

interface ContactForm {
    name: string;
    short_name: string;
    industry: string;
    country: string;
    size: string;
    website: string;
    contact_name: string;
    contact_position: string;
    contact_email: string;
    contact_phone: string;
    address: string;
}

const EMPTY_ORG: ContactForm = {
    name: '',
    short_name: '',
    industry: '',
    country: '',
    size: '',
    website: '',
    contact_name: '',
    contact_position: '',
    contact_email: '',
    contact_phone: '',
    address: '',
};

export default function Purchase({ products }: PurchaseProps) {
    const { app_settings, commerce } = usePage<PageProps>().props as any;
    const currency = commerce?.currency ?? 'Le';

    const license = products.find((p) => p.category === 'license');
    const services = products.filter((p) => p.category === 'service');

    const [step, setStep] = useState(0);
    const [term, setTerm] = useState<'one-time' | 'yearly'>('one-time');
    const [selectedLicense, setSelectedLicense] = useState<Record<number, number>>(
        license ? { [license.id]: 1 } : {}
    );
    const [serviceQty, setServiceQty] = useState<Record<number, number>>({});
    const [org, setOrg] = useState<ContactForm>(EMPTY_ORG);
    const [branding, setBranding] = useState({
        primary_color: app_settings?.primary_color ?? '#2563eb',
        secondary_color: app_settings?.secondary_color ?? '',
        login_background: '',
        login_welcome: app_settings?.login_welcome ?? 'Welcome back, please sign in.',
        footer_copyright: '',
    });

    const form = useForm({
        items: [] as { product_id: number; qty: number; term: string }[],
        organization: { ...EMPTY_ORG },
        branding,
    });

    // ─── Totals ────────────────────────────────────────────────────────────────

    const priceOf = (product: Product) =>
        term === 'yearly' && product.yearly_price !== null ? product.yearly_price : product.price;

    const lineItems = useMemo(() => {
        const lines: { product: Product; qty: number }[] = [];

        for (const [productId, qty] of Object.entries(selectedLicense)) {
            const product = products.find((p) => p.id === Number(productId));
            if (product && qty > 0) lines.push({ product, qty });
        }

        for (const [productId, qty] of Object.entries(serviceQty)) {
            const product = products.find((p) => p.id === Number(productId));
            if (product && qty > 0) lines.push({ product, qty });
        }

        return lines;
    }, [selectedLicense, serviceQty, products]);

    const total = lineItems.reduce((sum, { product, qty }) => sum + priceOf(product) * qty, 0);

    // ─── Step guards ───────────────────────────────────────────────────────────

    const canNext = step === 0
        ? lineItems.length > 0
        : step === 1
            ? (org.name.trim() !== '' && org.contact_name.trim() !== '' && org.contact_email.trim() !== '' && org.size.trim() !== '')
            : true;

    const isServiceSelected = (id: number) => (serviceQty[id] ?? 0) > 0;

    const toggleService = (id: number, price: number) => {
        setServiceQty((prev) => {
            const next = { ...prev };
            if ((next[id] ?? 0) > 0) {
                delete next[id];
            } else {
                next[id] = 1;
            }
            return next;
        });
    };

    const submit = () => {
        form.setData('items', lineItems.map(({ product, qty }) => ({
            product_id: product.id,
            qty,
            term: product.category === 'license' ? term : 'one-time',
        })));
        form.setData('organization', org);
        form.setData('branding', branding);
        form.post('/get-started/submit');
    };

    const inputCls = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

    return (
        <MarketingLayout>
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-6xl px-6 py-10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Get Syscend-HRM</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Purchase request</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        Choose your package, tell us about your organisation, and pick the branding you want on your
                        production installation. You can review everything before submitting.
                    </p>

                    <ol className="mt-8 flex flex-wrap items-center gap-2">
                        {STEPS.map(({ icon: Icon, label }, index) => (
                            <li key={label} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => index < step && setStep(index)}
                                    className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                        index === step
                                            ? 'bg-blue-600 text-white'
                                            : index < step
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {index < step ? <Check size={14} /> : <Icon size={14} />}
                                    {label}
                                </button>
                                {index < STEPS.length - 1 && <span className="h-px w-5 bg-slate-200" />}
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <div>
                        {step === 0 && (
                            <div className="space-y-5">
                                {license && (
                                    <div className="rounded-2xl border-2 border-blue-600 bg-blue-50/40 p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                                    <KeyRound size={18} className="text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="font-semibold text-slate-900">{license.name}</h2>
                                                    <p className="text-xs text-slate-500">Required — choose a license term</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm text-slate-600">{license.description}</p>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() => setTerm('one-time')}
                                                className={`rounded-xl border p-4 text-left transition-all ${
                                                    term === 'one-time'
                                                        ? 'border-blue-600 bg-white shadow-sm'
                                                        : 'border-slate-200 bg-white/60 hover:border-blue-300'
                                                }`}
                                            >
                                                <span className="text-sm font-semibold text-slate-900">One-time</span>
                                                <span className="text-xs text-slate-500">Perpetual license</span>
                                                <p className="mt-2 text-lg font-bold text-slate-900">
                                                    {currency} {license.price.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-400">Pay once, own forever.</p>
                                            </button>

                                            {license.yearly_price !== null && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTerm('yearly')}
                                                    className={`rounded-xl border p-4 text-left transition-all ${
                                                        term === 'yearly'
                                                            ? 'border-blue-600 bg-white shadow-sm'
                                                            : 'border-slate-200 bg-white/60 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <span className="text-sm font-semibold text-slate-900">Yearly</span>
                                                    <span className="text-xs text-slate-500">Annual renewal</span>
                                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                                        {currency} {license.yearly_price.toLocaleString()}
                                                        <span className="text-xs font-medium text-slate-400"> / year</span>
                                                    </p>
                                                    <p className="text-xs text-slate-400">Billed annually, renew when due.</p>
                                                </button>
                                            )}
                                        </div>
                                        <p className="mt-3 text-xs text-slate-400">
                                            {term === 'yearly'
                                                ? 'Yearly licenses are valid for 12 months and can be renewed before expiry.'
                                                : 'One-time licenses never expire.'}
                                        </p>
                                    </div>
                                )}

                                <h2 className="text-lg font-bold text-slate-900">Add professional services</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {services.map((s) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => toggleService(s.id, s.price)}
                                            className={`rounded-2xl border p-5 text-left transition-all ${
                                                isServiceSelected(s.id)
                                                    ? 'border-blue-600 bg-blue-50/40'
                                                    : 'border-slate-200 bg-white hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                                                <span
                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                                        isServiceSelected(s.id)
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'border-slate-300'
                                                    }`}
                                                >
                                                    {isServiceSelected(s.id) && <Check size={12} />}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{s.description}</p>
                                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                                {s.price > 0 ? `${s.currency || currency} ${s.price.toLocaleString()}` : 'Quote available'}
                                            </p>
                                            {isServiceSelected(s.id) && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setServiceQty((p) => ({ ...p, [s.id]: Math.max(1, (p[s.id] ?? 1) - 1) })); }}
                                                        className="h-7 w-7 rounded-md border border-slate-300 text-sm"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-semibold">{serviceQty[s.id]}</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setServiceQty((p) => ({ ...p, [s.id]: Math.min(99, (p[s.id] ?? 1) + 1) })); }}
                                                        className="h-7 w-7 rounded-md border border-slate-300 text-sm"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-xs text-slate-400">
                                    Selected totals are estimates — final pricing is confirmed by our team before any
                                    payment. Add-on prices that show "Quote available" are agreed with sales.
                                </p>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <h2 className="text-lg font-bold text-slate-900">Organisation details</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Who are we building this installation for? This becomes your production organization
                                    record.
                                </p>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {ORG_FIELDS.map((field) => (
                                        <div key={field.key} className={field.span ? 'sm:col-span-2' : ''}>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`org-${field.key}`}>
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            {field.key === 'address' ? (
                                                <textarea
                                                    id={`org-${field.key}`}
                                                    rows={2}
                                                    value={org[field.key]}
                                                    onChange={(e) => setOrg((p) => ({ ...p, [field.key]: e.target.value }))}
                                                    className={inputCls}
                                                />
                                            ) : (
                                                <Input
                                                    id={`org-${field.key}`}
                                                    type={field.type ?? 'text'}
                                                    required={field.required}
                                                    value={org[field.key]}
                                                    onChange={(e) => setOrg((p) => ({ ...p, [field.key]: e.target.value }))}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                    <h2 className="text-lg font-bold text-slate-900">White-label branding</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        These colors, welcome message and copyright are applied to your production
                                        installation — login page, sidebar, headers, payslips and more.
                                    </p>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="brand-primary">Primary color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="brand-primary"
                                                    type="color"
                                                    value={branding.primary_color}
                                                    onChange={(e) => setBranding((p) => ({ ...p, primary_color: e.target.value }))}
                                                    className="h-9 w-12 rounded-md border border-slate-300 bg-white"
                                                />
                                                <Input value={branding.primary_color} onChange={(e) => setBranding((p) => ({ ...p, primary_color: e.target.value }))} className="font-mono" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="brand-secondary">Secondary color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="brand-secondary"
                                                    type="color"
                                                    value={branding.secondary_color || '#ffffff'}
                                                    onChange={(e) => setBranding((p) => ({ ...p, secondary_color: e.target.value }))}
                                                    className="h-9 w-12 rounded-md border border-slate-300 bg-white"
                                                />
                                                <Input value={branding.secondary_color} onChange={(e) => setBranding((p) => ({ ...p, secondary_color: e.target.value }))} className="font-mono" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="brand-bg">Login background color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="brand-bg"
                                                    type="color"
                                                    value={branding.login_background || '#ffffff'}
                                                    onChange={(e) => setBranding((p) => ({ ...p, login_background: e.target.value }))}
                                                    className="h-9 w-12 rounded-md border border-slate-300 bg-white"
                                                />
                                                <Input value={branding.login_background} onChange={(e) => setBranding((p) => ({ ...p, login_background: e.target.value }))} className="font-mono" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="brand-welcome">Login welcome message</label>
                                            <Input id="brand-welcome" value={branding.login_welcome} onChange={(e) => setBranding((p) => ({ ...p, login_welcome: e.target.value }))} />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="brand-copyright">Footer copyright text</label>
                                            <Input id="brand-copyright" value={branding.footer_copyright} onChange={(e) => setBranding((p) => ({ ...p, footer_copyright: e.target.value }))} placeholder={`© ${new Date().getFullYear()} ${org.name || 'Your Organisation'}. All rights reserved.`} />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                    <p className="text-sm font-semibold text-slate-900">Live preview — login page</p>
                                    <div
                                        className="mt-4 rounded-xl border border-slate-200 p-8"
                                        style={{ backgroundColor: branding.login_background || '#f1f5f9' }}
                                    >
                                        <div className="mx-auto max-w-sm">
                                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                                                        style={{ backgroundColor: branding.primary_color }}
                                                    >
                                                        <span className="text-white text-xs font-bold">
                                                            {(org.name || 'S').charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900">{org.name || 'Your Organisation'}</span>
                                                </div>
                                                <p className="mt-4 text-sm text-slate-600">{branding.login_welcome}</p>
                                                <div className="mt-4 space-y-2">
                                                    <div className="h-9 rounded-md border border-slate-300 bg-slate-50" />
                                                    <div className="h-9 rounded-md border border-slate-300 bg-slate-50" />
                                                    <button
                                                        type="button"
                                                        className="h-9 w-full rounded-md text-sm font-medium text-white"
                                                        style={{ backgroundColor: branding.primary_color }}
                                                    >
                                                        Sign in
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                    <h2 className="text-lg font-bold text-slate-900">Review your purchase request</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Submitting creates a tracked request. Our team will contact{' '}
                                        <span className="font-medium text-slate-700">{org.contact_email || org.email || 'you'}</span>{' '}
                                        to confirm pricing and payment.
                                    </p>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Organisation</p>
                                            <p className="mt-1 text-sm font-semibold text-slate-900">{org.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {[org.country, org.size].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</p>
                                            <p className="mt-1 text-sm font-semibold text-slate-900">{org.contact_name}</p>
                                            <p className="text-sm text-slate-500">
                                                {org.contact_email}{org.contact_phone ? ` · ${org.contact_phone}` : ''}
                                            </p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Branding</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                <span
                                                    className="h-6 w-6 rounded-full border border-slate-300"
                                                    style={{ backgroundColor: branding.primary_color }}
                                                />
                                                {branding.secondary_color && (
                                                    <span
                                                        className="h-6 w-6 rounded-full border border-slate-300"
                                                        style={{ backgroundColor: branding.secondary_color }}
                                                    />
                                                )}
                                                {branding.login_background && (
                                                    <span
                                                        className="h-6 w-6 rounded-full border border-slate-300"
                                                        style={{ backgroundColor: branding.login_background }}
                                                    />
                                                )}
                                                <span className="text-sm text-slate-500">{branding.login_welcome}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
                                        <div className="overflow-x-auto"><table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-2.5 font-medium">Item</th>
                                                    <th className="px-4 py-2.5 text-center font-medium">Qty</th>
                                                    <th className="px-4 py-2.5 text-right font-medium">Estimate</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {lineItems.map(({ product, qty }) => (
                                                    <tr key={product.id}>
                                                        <td className="px-4 py-2.5 text-slate-900">
                                                            <span className="font-medium">{product.name}</span>
                                                            {product.category === 'license' && (
                                                                <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium capitalize text-blue-700">
                                                                    {term}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center text-slate-500">{qty}</td>
                                                        <td className="px-4 py-2.5 text-right text-slate-700">
                                                            {priceOf(product) > 0 ? `${currency} ${(priceOf(product) * qty).toLocaleString()}` : 'Quote'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table></div>
                                    </div>

                                    {form.errors && Object.keys(form.errors).length > 0 && (
                                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                            <p className="font-semibold">Please fix the following:</p>
                                            <ul className="mt-1 list-inside list-disc">
                                                {Object.values(form.errors).map((error, i) => (
                                                    <li key={i}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                                        <p className="text-sm text-slate-500">
                                            Estimate total:{' '}
                                            <span className="text-lg font-bold text-slate-900">
                                                {currency} {total.toLocaleString()}
                                            </span>
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={submit}
                                            disabled={form.processing}
                                            size="lg"
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
                                        >
                                            {form.processing ? 'Submitting…' : 'Submit purchase request'} <ArrowRight size={16} className="ml-1.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex items-center justify-between">
                            <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="border-slate-300 bg-white text-slate-700">
                                <ArrowLeft size={15} className="mr-1.5" /> Back
                            </Button>
                            {step < 3 && (
                                <Button type="button" onClick={() => setStep((s) => Math.min(3, s + 1))} disabled={!canNext} className="bg-blue-600 hover:bg-blue-500 text-white">
                                    Continue <ArrowRight size={15} className="ml-1.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Order summary */}
                    <aside>
                        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Order summary</h2>
                                <ShieldCheck size={16} className="text-emerald-600" />
                            </div>
                            <ul className="mt-4 space-y-3">
                                {lineItems.length === 0 && <li className="text-sm text-slate-400">Nothing selected yet.</li>}
                                {lineItems.map(({ product, qty }) => (
                                    <li key={product.id} className="flex items-start justify-between gap-2 text-sm">
                                        <span className="text-slate-600">
                                            {product.name}
                                            {product.category === 'license' && (
                                                <span className="text-xs capitalize text-slate-400"> · {term}</span>
                                            )}
                                            {qty > 1 && <span className="text-slate-400"> ×{qty}</span>}
                                        </span>
                                        <span className="font-medium text-slate-900">
                                            {priceOf(product) > 0 ? `${currency} ${(priceOf(product) * qty).toLocaleString()}` : 'Quote'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-sm font-medium text-slate-500">Total (estimate)</span>
                                <span className="text-lg font-bold text-slate-900">
                                    {currency} {total.toLocaleString()}
                                </span>
                            </div>
                            <p className="mt-4 text-xs text-slate-400 leading-relaxed">{commerce?.payment_note}</p>
                            <p className="mt-3 text-xs text-slate-400">
                                Need help?{' '}
                                <Link href="/contact" className="text-blue-600 hover:underline">Contact sales</Link>.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
        </MarketingLayout>
    );
}