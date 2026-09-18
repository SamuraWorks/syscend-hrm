import { useEffect, useRef, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Briefcase, MapPin, Clock, Monitor, Wallet, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
    id: number; title: string; department: string | null; position: string | null;
    location: string | null; type: string; work_mode: string;
    salary_min: number | null; salary_max: number | null;
    description: string; requirements: string | null; deadline: string | null;
}

interface Recaptcha { enabled: boolean; site_key: string; }

declare global {
    interface Window {
        grecaptcha: any;
        __onRecaptchaLoad?: () => void;
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
    full_time: 'Full Time', part_time: 'Part Time',
    contract: 'Contract', internship: 'Internship',
};
const MODE_LABEL: Record<string, string> = {
    onsite: 'On-site', remote: 'Remote', hybrid: 'Hybrid',
};

function formatSalary(min: number | null, max: number | null): string | null {
    if (!min && !max) return null;
    const fmt = (n: number) => `Le ${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
}

// ─── ReCaptcha widget ─────────────────────────────────────────────────────────

function ReCaptcha({ siteKey, onVerify }: { siteKey: string; onVerify: (token: string | null) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef    = useRef<number | null>(null);

    useEffect(() => {
        const render = () => {
            if (!containerRef.current || widgetRef.current !== null) return;
            widgetRef.current = window.grecaptcha.render(containerRef.current, {
                sitekey: siteKey,
                callback: onVerify,
                'expired-callback': () => onVerify(null),
                'error-callback':   () => onVerify(null),
            });
        };

        if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.render) {
            render();
        } else {
            window.__onRecaptchaLoad = render;
            if (!document.getElementById('g-recaptcha-script')) {
                const s = document.createElement('script');
                s.id    = 'g-recaptcha-script';
                s.src   = 'https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoad&render=explicit';
                s.async = true;
                s.defer = true;
                document.head.appendChild(s);
            }
        }
    }, [siteKey]);

    return <div ref={containerRef} className="mt-1" />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CareersShow({ job, recaptcha, applied }: { job: Job; recaptcha: Recaptcha; applied: boolean }) {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const salary = formatSalary(job.salary_min, job.salary_max);

    const { data, setData, post, processing, errors } = useForm({
        first_name: '', last_name: '', email: '', phone: '',
        current_company: '', current_title: '', experience_years: '',
        cover_letter: '', g_recaptcha_response: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (recaptcha.enabled && !captchaToken) return;
        setData('g_recaptcha_response', captchaToken ?? '');
        post(`/careers/${job.id}/apply`);
    }

    // sync captcha token into form data before submit
    useEffect(() => {
        setData('g_recaptcha_response', captchaToken ?? '');
    }, [captchaToken]);

    if (applied) {
        return (
            <PublicLayout>
                <div className="max-w-lg mx-auto text-center py-20">
                    <CheckCircle2 size={56} className="mx-auto text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
                    <p className="text-slate-500">
                        Thank you for applying to <strong>{job.title}</strong>. We'll review your application and get back to you soon.
                    </p>
                    <Link href="/careers" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
                        ← View other openings
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
                <Link href="/careers" className="hover:text-slate-900 transition-colors">Careers</Link>
                <ChevronRight size={14} />
                <span className="text-slate-900 font-medium">{job.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: job details */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
                        {job.department && <p className="text-slate-500 mt-1">{job.department}</p>}

                        <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-500">
                            {job.location && <span className="flex items-center gap-1.5"><MapPin size={13} />{job.location}</span>}
                            <span className="flex items-center gap-1.5"><Briefcase size={13} />{TYPE_LABEL[job.type] ?? job.type}</span>
                            <span className="flex items-center gap-1.5"><Monitor size={13} />{MODE_LABEL[job.work_mode] ?? job.work_mode}</span>
                            {salary && <span className="flex items-center gap-1.5"><Wallet size={13} />{salary}</span>}
                            {job.deadline && <span className="flex items-center gap-1.5"><Clock size={13} />Deadline: {job.deadline}</span>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h2 className="font-semibold text-slate-900">Job Description</h2>
                        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{job.description}</div>

                        {job.requirements && (
                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="font-semibold text-slate-900 mb-2">Requirements</h3>
                                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: apply form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-20">
                        <h2 className="font-semibold text-slate-900 mb-4">Apply for this role</h2>

                        <form onSubmit={submit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-slate-600">First Name *</Label>
                                    <Input className="h-8 text-sm" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                    {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-slate-600">Last Name *</Label>
                                    <Input className="h-8 text-sm" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                                    {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-600">Email *</Label>
                                <Input className="h-8 text-sm" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-600">Phone</Label>
                                <Input className="h-8 text-sm" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-600">Current Title</Label>
                                <Input className="h-8 text-sm" value={data.current_title} onChange={(e) => setData('current_title', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-600">Current Company</Label>
                                <Input className="h-8 text-sm" value={data.current_company} onChange={(e) => setData('current_company', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-600">Years of Experience</Label>
                                <Input className="h-8 text-sm" type="number" min="0" max="50" step="1" value={data.experience_years} onChange={(e) => setData('experience_years', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-600">Cover Letter</Label>
                                <textarea
                                    rows={4}
                                    value={data.cover_letter}
                                    onChange={(e) => setData('cover_letter', e.target.value)}
                                    placeholder="Tell us why you'd be a great fit..."
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                />
                            </div>

                            {/* reCAPTCHA */}
                            {recaptcha.enabled && recaptcha.site_key && (
                                <div className="space-y-1">
                                    <ReCaptcha siteKey={recaptcha.site_key} onVerify={setCaptchaToken} />
                                    {errors.captcha && <p className="text-xs text-red-500">{errors.captcha}</p>}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={processing || (recaptcha.enabled && !captchaToken)}
                                className="w-full bg-blue-600 hover:bg-blue-500"
                            >
                                {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                                Submit Application
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
