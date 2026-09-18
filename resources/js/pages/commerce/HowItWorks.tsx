import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Boxes,
    CreditCard,
    GraduationCap,
    LifeBuoy,
    Rocket,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import { Button } from '@/components/ui/button';

const STEPS = [
    {
        icon: Sparkles,
        step: '1. Choose',
        title: 'Choose your package',
        description:
            'Pick the one-time Syscend-HRM license and add any services you need — deployment, training, data migration, a custom domain or custom development.',
    },
    {
        icon: Boxes,
        step: '2. Submit',
        title: 'Submit your purchase request',
        description:
            'Tell us about your organisation and the branding you want (colors, logo, welcome message). You will receive a reference like SHRM-2026-0001 to track progress.',
    },
    {
        icon: CreditCard,
        step: '3. Payment',
        title: 'Pay once',
        description:
            'Our team confirms your order and payment details. It is a one-time license — no subscriptions, no recurring fees.',
    },
    {
        icon: BadgeCheck,
        step: '4. License issued',
        title: 'Receive your license',
        description:
            'Your unique license key (SHRM-XXXX-XXXX-XXXX-XXXX) is issued and your organisation is recorded on our platform.',
    },
    {
        icon: Rocket,
        step: '5. Deployment & configuration',
        title: 'We build your installation',
        description:
            'We provision your production instance: server, database, security hardening and your custom white-label branding.',
    },
    {
        icon: GraduationCap,
        step: '6. Training & go-live',
        title: 'Go live with your team',
        description:
            'Your admins are trained, your real employees and data are moved in, and your organisation uses Syscend-HRM for real.',
    },
];

export default function HowItWorks() {
    return (
        <MarketingLayout>
            <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
                <div className="mx-auto max-w-6xl px-6 py-20 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">How it works</p>
                    <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold text-slate-900 tracking-tight">
                        From purchase to live in a few clear steps
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                        Buy once, own it forever. We handle the heavy lifting so your team starts with a fully-branded,
                        production-ready HR system.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-6 py-16">
                <ol className="space-y-6">
                    {STEPS.map(({ icon: Icon, step, title, description }, index) => (
                        <li
                            key={step}
                            className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"
                        >
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/10">
                                <Icon size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{step}</p>
                                <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
                                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                        <ShieldCheck size={20} className="mx-auto text-emerald-600" />
                        <h3 className="mt-3 text-sm font-semibold text-slate-900">One-time license</h3>
                        <p className="mt-1 text-sm text-slate-500">No subscriptions. Pay once, use forever.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                        <Boxes size={20} className="mx-auto text-blue-600" />
                        <h3 className="mt-3 text-sm font-semibold text-slate-900">Demo vs production</h3>
                        <p className="mt-1 text-sm text-slate-500">The demo workspace never mixes with your real data.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                        <LifeBuoy size={20} className="mx-auto text-amber-600" />
                        <h3 className="mt-3 text-sm font-semibold text-slate-900">Priority support</h3>
                        <p className="mt-1 text-sm text-slate-500">Optional support plans keep your team moving.</p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 pb-20 text-center">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-medium">
                    <Link href="/get-started">Start your purchase <ArrowRight size={16} className="ml-1.5" /></Link>
                </Button>
                <p className="mt-4 text-xs text-slate-400">Questions first? <Link href="/contact" className="text-blue-600 hover:underline">Contact our team</Link>.</p>
            </section>
        </MarketingLayout>
    );
}