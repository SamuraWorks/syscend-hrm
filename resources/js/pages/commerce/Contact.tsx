import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PageProps } from '@/types';

export default function Contact() {
    const { commerce } = usePage<PageProps>().props as any;
    const salesEmail = commerce?.sales_email ?? 'sales@syscendhrm.test';
    const salesPhone = commerce?.sales_phone;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const mailtoHref = `mailto:${salesEmail}?subject=${encodeURIComponent('Syscend-HRM enquiry from ' + (name || 'website'))}&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
    )}`;

    return (
        <MarketingLayout>
            <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
                <div className="mx-auto max-w-6xl px-6 py-20 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Contact</p>
                    <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold text-slate-900 tracking-tight">
                        Talk to the Syscend team
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                        Questions about licensing, deployment, training or a custom feature — we usually reply within one
                        business day.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6 py-16">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
                                <Mail size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Email us</h2>
                                <p className="mt-0.5 text-sm text-slate-500 break-all">{salesEmail}</p>
                            </div>
                        </div>

                        {salesPhone ? (
                            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
                                    <Phone size={18} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">Call or WhatsApp</h2>
                                    <p className="mt-0.5 text-sm text-slate-500">{salesPhone}</p>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
                                <MapPin size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Visit us</h2>
                                <p className="mt-0.5 text-sm text-slate-500">Freetown, Sierra Leone</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
                                <Clock size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Response time</h2>
                                <p className="mt-0.5 text-sm text-slate-500">Within one business day</p>
                            </div>
                        </div>
                    </div>

                    <form
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        action={mailtoHref}
                        method="get"
                    >
                        <h2 className="text-lg font-bold text-slate-900">Send a message</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            This opens your email app addressed to {salesEmail}.
                        </p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="contact-name">Your name</label>
                                <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="contact-email">Your email</label>
                                <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@company.com" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="contact-message">Message</label>
                                <textarea
                                    id="contact-message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Tell us about your organisation and what you need…"
                                />
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium">
                            Send via email <ArrowRight size={16} className="ml-1.5" />
                        </Button>
                        <p className="mt-3 text-center text-xs text-slate-400">
                            Prefer to buy directly?{' '}
                            <Link href="/get-started" className="text-blue-600 hover:underline">Start a purchase request</Link>.
                        </p>
                    </form>
                </div>
            </section>
        </MarketingLayout>
    );
}