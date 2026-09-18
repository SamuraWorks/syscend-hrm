import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import { Button } from '@/components/ui/button';
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

interface PricingProps {
    products: Product[];
}

function formatPrice(currency: string, price: number): string {
    return `${currency} ${price.toLocaleString()}`;
}

export default function Pricing({ products }: PricingProps) {
    const { commerce } = usePage<PageProps>().props as any;
    const currency = commerce?.currency ?? 'Le';

    const license = products.find((p) => p.category === 'license');
    const services = products.filter((p) => p.category === 'service');

    return (
        <MarketingLayout>
            <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
                <div className="mx-auto max-w-6xl px-6 py-20 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Pricing</p>
                    <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold text-slate-900 tracking-tight">
                        Own it forever — or pay yearly if you prefer.
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                        A single one-time license as standard, or an annual license if that suits your budget better.
                        Add professional services that fit how you want to roll out. Prices are configured by our team.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-16">
                {/* License card */}
                <div className="mx-auto max-w-xl rounded-3xl border-2 border-blue-600 bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                        <KeyRound size={22} className="text-white" />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-slate-900">Syscend-HRM License</h2>
                    <p className="mt-1 text-sm text-slate-500">One-time or yearly · includes all HR modules</p>
                    <p className="mt-5 text-4xl font-bold text-slate-900">
                        {license ? formatPrice(license.currency || currency, license.price) : 'Contact us'}
                    </p>
                    {license?.yearly_price != null && (
                        <p className="mt-1 text-sm text-slate-500">
                            or {formatPrice(license.currency || currency, license.yearly_price)}
                            <span className="text-slate-400"> / year</span>
                        </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">one-time · self-hosted · no subscription needed</p>
                    <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-slate-600">
                        {[
                            'All eight HR modules included',
                            'Unlimited employees',
                            'White-label branding (logo, colors, domain)',
                            'Your own infrastructure, your own data',
                            'License key issued after first payment',
                            license?.yearly_price != null
                                ? 'Yearly option — renew annually, valid for 12 months'
                                : 'One-time perpetual license — never expires',
                        ].map((line) => (
                            <li key={line} className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                    <Button asChild size="lg" className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium">
                        <Link href="/get-started">Get Syscend-HRM <ArrowRight size={16} className="ml-1.5" /></Link>
                    </Button>
                </div>

                {/* Services */}
                <h2 className="mt-16 text-center text-2xl font-bold text-slate-900">Professional services</h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
                    Optional one-time add-ons to make your rollout smooth. Prices are agreed with our team before you pay.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((s) => (
                        <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                    {s.one_time ? 'One-time' : 'Quote'}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.description}</p>
                            <p className="mt-4 text-sm font-semibold text-slate-700">
                                {s.price > 0 ? formatPrice(s.currency || currency, s.price) : 'Quote available'}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 pb-20">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <Mail size={20} className="mx-auto text-blue-600" />
                    <h2 className="mt-3 text-xl font-bold text-slate-900">Need a tailored package?</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Every licence order is reviewed by a human. Tell us about your organisation and we will confirm
                        pricing before any payment.
                    </p>
                    <Button asChild variant="outline" size="lg" className="mt-6 border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                        <Link href="/contact">Contact sales</Link>
                    </Button>
                </div>
            </section>
        </MarketingLayout>
    );
}