import {
    BarChart3,
    BookOpen,
    Briefcase,
    CalendarDays,
    CreditCard,
    FileText,
    ShieldCheck,
    Star,
    Users,
} from 'lucide-react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

const FEATURE_GROUPS = [
    {
        icon: Users,
        group: 'People',
        items: [
            { title: 'Employee profiles', description: 'Central records for every team member with documents and history.' },
            { title: 'Departments & positions', description: 'Organise your structure and keep every headcount defined.' },
            { title: 'Onboarding', description: 'Add employees with roles, contracts and self-service access.' },
        ],
    },
    {
        icon: CalendarDays,
        group: 'Time & Leave',
        items: [
            { title: 'Attendance tracking', description: 'Shifts, check-ins and a monthly overview for accurate records.' },
            { title: 'Leave management', description: 'Requests, approvals and balances per leave type, all in one calendar.' },
            { title: 'Holidays', description: 'Company-wide public holidays visible to every employee.' },
        ],
    },
    {
        icon: CreditCard,
        group: 'Payroll',
        items: [
            { title: 'Salary structures', description: 'Reusable structures and components for consistent pay.' },
            { title: 'Payroll runs', description: 'Generate runs, approve, and produce payslips in your local currency.' },
            { title: 'Payslips', description: 'Self-service payslips every employee can access.' },
        ],
    },
    {
        icon: Briefcase,
        group: 'Talent',
        items: [
            { title: 'Recruitment', description: 'Post jobs, collect applications and manage your hiring pipeline.' },
            { title: 'Performance reviews', description: 'Cycles, goals and structured reviews for continuous growth.' },
            { title: 'Training', description: 'Courses, sessions and enrolment to build team capability.' },
        ],
    },
    {
        icon: BarChart3,
        group: 'Reports & Documents',
        items: [
            { title: 'Reports', description: 'Headcount, attendance, leave, payroll and training insights.' },
            { title: 'Documents', description: 'Central document store with employee acknowledgements.' },
            { title: 'Audit log', description: 'Every meaningful action recorded for accountability.' },
        ],
    },
    {
        icon: ShieldCheck,
        group: 'Security & Admin',
        items: [
            { title: 'Role-based access', description: 'Granular permissions for Admin, HR, Finance, Managers and more.' },
            { title: 'Portal per role', description: 'Each role lands on a purpose-built portal experience.' },
            { title: 'Self-hosted', description: 'Your data lives on infrastructure you control.' },
        ],
    },
];

export default function Features() {
    return (
        <MarketingLayout>
            <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
                <div className="mx-auto max-w-6xl px-6 py-20 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Features</p>
                    <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold text-slate-900 tracking-tight">
                        Everything your HR team needs, in one self-hosted platform
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                        Eight integrated modules — people, time, leave, payroll, recruitment, performance, training and
                        reporting — working together so your data never lives in two places.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-16">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {FEATURE_GROUPS.map(({ icon: Icon, group, items }) => (
                        <div key={group} className="rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10">
                                <Icon size={18} className="text-blue-600" />
                            </div>
                            <h2 className="font-semibold text-slate-900">{group}</h2>
                            <ul className="mt-4 space-y-4">
                                {items.map((item) => (
                                    <li key={item.title} className="border-l-2 border-slate-100 pl-3">
                                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                        <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 pb-20">
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <BookOpen size={22} className="mx-auto text-blue-600" />
                    <h2 className="mt-3 text-2xl font-bold text-slate-900">See every module with real data</h2>
                    <p className="mx-auto mt-2 max-w-xl text-slate-500">
                        The demo workspace is pre-loaded with realistic employees, leave, payroll and more. Sign in with
                        any demo account.
                    </p>
                    <Button asChild size="lg" className="mt-6 bg-blue-600 hover:bg-blue-500 text-white">
                        <Link href="/login">Explore the demo <ArrowRight size={16} className="ml-1.5" /></Link>
                    </Button>
                </div>
            </section>
        </MarketingLayout>
    );
}