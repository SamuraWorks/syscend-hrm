import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock,
    CreditCard,
    FolderOpen,
    HeartHandshake,
    Layers,
    Lock,
    Mail,
    Menu,
    Monitor,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import CountUp from '@/components/marketing/CountUp';
import Reveal from '@/components/marketing/Reveal';
import { SYS_BRAND } from '@/lib/syscend-brand';

const FEATURES = [
    {
        icon: Users,
        title: 'People Management',
        description:
            'A single source of truth for every employee — profiles, documents, departments, positions and contract history.',
        accent: 'from-blue-500 to-indigo-500',
    },
    {
        icon: Clock,
        title: 'Time & Attendance',
        description:
            'Track shifts, check-ins and daily attendance with an accurate monthly overview for every team member.',
        accent: 'from-emerald-500 to-teal-500',
    },
    {
        icon: CalendarDays,
        title: 'Leave Management',
        description:
            'Let staff request time off, manage balances by leave type and get approvals flowing — all in one calendar.',
        accent: 'from-violet-500 to-purple-500',
    },
    {
        icon: CreditCard,
        title: 'Payroll & Salaries',
        description:
            'Define salary structures and components, run payroll cycles and generate employee payslips in Leones (SLL).',
        accent: 'from-amber-500 to-orange-500',
    },
    {
        icon: Briefcase,
        title: 'Recruitment',
        description:
            'Publish job postings, collect applications on your public careers page and manage your hiring pipeline.',
        accent: 'from-rose-500 to-pink-500',
    },
    {
        icon: Star,
        title: 'Performance & Training',
        description:
            'Run review cycles, set goals, and enrol employees in training courses to keep your team growing.',
        accent: 'from-cyan-500 to-sky-500',
    },
    {
        icon: BarChart3,
        title: 'Reports & Analytics',
        description:
            'Understand your workforce with headcount, attendance, leave, payroll and training reports at a glance.',
        accent: 'from-fuchsia-500 to-purple-500',
    },
    {
        icon: ShieldCheck,
        title: 'Roles & Security',
        description:
            'Granular, role-based permissions, activity audit logs and secure access controls for every function.',
        accent: 'from-slate-600 to-slate-800',
    },
];

const PROCESS = [
    {
        step: '01',
        title: 'Set up your organisation',
        description: 'Configure departments, positions and your HR settings in minutes.',
        icon: Building2,
    },
    {
        step: '02',
        title: 'Add your people',
        description: 'Onboard employees with profiles, contracts and self-service access.',
        icon: FolderOpen,
    },
    {
        step: '03',
        title: 'Run HR daily',
        description: 'Attendance, leave, payroll and performance — all flowing in one place.',
        icon: HeartHandshake,
    },
];

const DEMO_ACCOUNTS = [
    { role: 'HR Manager', email: 'hr@syscendhrm.test', color: 'bg-purple-50 text-purple-700 ring-purple-200' },
    { role: 'Manager', email: 'manager@syscendhrm.test', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    { role: 'Employee', email: 'employee@syscendhrm.test', color: 'bg-amber-50 text-amber-700 ring-amber-200' },
    { role: 'Recruiter', email: 'recruiter@syscendhrm.test', color: 'bg-sky-50 text-sky-700 ring-sky-200' },
    { role: 'Finance', email: 'finance@syscendhrm.test', color: 'bg-rose-50 text-rose-700 ring-rose-200' },
];

const QUOTES = [
    {
        quote:
            'Attendance, leave and payroll used to live in three different spreadsheets. Now it is one system our whole team trusts.',
        name: 'HR Manager',
        initials: 'HM',
    },
    {
        quote:
            'The self-service payslips and documents feature alone saved us hours every month — and our employees love it.',
        name: 'Super Admin',
        initials: 'SA',
    },
];

const MODULE_GROUPS = [
    { name: 'People', items: ['Employees', 'Departments', 'Positions'] },
    { name: 'Operations', items: ['Attendance', 'Shifts', 'Holidays'] },
    { name: 'People Ops', items: ['Leave Management', 'Leave Calendar'] },
    { name: 'Talent', items: ['Recruitment', 'Performance', 'Training'] },
    { name: 'Finance', items: ['Payroll', 'Salary Structures', 'Payslips'] },
    { name: 'Platform', items: ['Reports', 'Documents', 'Audit Logs'] },
];

const MARQUEE_ITEMS = [
    'Employees',
    'Departments',
    'Attendance',
    'Shifts',
    'Leave Management',
    'Payroll',
    'Salary Structures',
    'Payslips',
    'Recruitment',
    'Performance',
    'Training',
    'Reports',
    'Documents',
    'Audit Logs',
];

const STATS = [
    { value: 8, suffix: '+', label: 'Integrated HR modules' },
    { value: 6, suffix: '', label: 'Pre-seeded roles' },
    { value: 100, suffix: '%', label: 'Self-hosted & open source' },
];

const FAQS = [
    {
        q: 'Do I need to install anything to try it?',
        a: 'No. The hosted demo is ready to use — just sign in with any demo account and explore.',
    },
    {
        q: 'Can I run it on my own server?',
        a: 'Yes. {appName} is fully self-hosted, and the entire workspace is open source so you own your data.',
    },
    {
        q: 'Can I pay once or yearly?',
        a: 'Both. Buy a one-time license and own Syscend-HRM forever, or choose the yearly option and pay annually — your choice, configured by our team to fit your budget.',
    },
    {
        q: 'What currency does payroll support?',
        a: 'Payroll works in Leones (SLL) out of the box, with the currency symbol and defaults configurable in settings.',
    },
    {
        q: 'How do roles and permissions work?',
        a: 'Permissions are granular and role-based. Admins can assign roles like HR Manager, Finance or Recruiter with precise access.',
    },
];

const PREVIEW_BARS = [
    { h: 'h-14', color: 'bg-emerald-500', delay: '0ms' },
    { h: 'h-10', color: 'bg-blue-500', delay: '90ms' },
    { h: 'h-16', color: 'bg-blue-500', delay: '180ms' },
    { h: 'h-12', color: 'bg-amber-400', delay: '270ms' },
    { h: 'h-9', color: 'bg-emerald-500', delay: '360ms' },
    { h: 'h-14', color: 'bg-blue-500', delay: '450ms' },
    { h: 'h-11', color: 'bg-blue-500', delay: '540ms' },
    { h: 'h-8', color: 'bg-rose-400', delay: '630ms' },
    { h: 'h-15', color: 'bg-emerald-500', delay: '720ms' },
    { h: 'h-13', color: 'bg-blue-500', delay: '810ms' },
    { h: 'h-11', color: 'bg-blue-500', delay: '900ms' },
    { h: 'h-16', color: 'bg-emerald-500', delay: '990ms' },
];

export default function Home() {
    const appName     = SYS_BRAND.name;
    const logoPath    = SYS_BRAND.logoPath;
    const brandColor  = SYS_BRAND.primaryColor;
    const footerCopyright = SYS_BRAND.copyright();

    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const logo = logoPath ? (
        <img src={`/storage/${logoPath}`} alt={appName} className="h-8 w-auto object-contain" />
    ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm" style={{ backgroundColor: brandColor }}>
            <span className="text-white text-sm font-bold">{appName.charAt(0).toUpperCase()}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Nav */}
            <header
                className={`sticky top-0 z-20 border-b transition-all duration-300 ${
                    scrolled ? 'border-slate-200 bg-white/95 shadow-lg shadow-slate-900/5 backdrop-blur-md' : 'border-transparent bg-white/70 backdrop-blur-sm'
                }`}
            >
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-3">
                        {logo}
                        <span className="font-semibold text-slate-900 text-sm">{appName}</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
                        <Link href="/features" className="hover:text-slate-900 transition-colors">Features</Link>
                        <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">How It Works</Link>
                        <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
                        <Link href="/login" className="hover:text-slate-900 transition-colors">Demo</Link>
                        <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
                    </nav>
                    <div className="hidden md:flex items-center gap-2.5">
                        <Button asChild variant="outline" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                            <Link href="/login">Try the demo</Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-medium">
                            <Link href="/get-started">Get Syscend-HRM <ArrowRight size={15} className="ml-1" /></Link>
                        </Button>
                    </div>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                        className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4">
                        <nav className="flex flex-col gap-1 text-sm text-slate-600">
                            <Link href="/features" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-slate-50">Features</Link>
                            <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-slate-50">How It Works</Link>
                            <Link href="/pricing" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-slate-50">Pricing</Link>
                            <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-slate-50">Demo</Link>
                            <Link href="/contact" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-slate-50">Contact</Link>
                        </nav>
                        <div className="mt-4 flex flex-col gap-2.5">
                            <Button asChild variant="outline" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                                <Link href="/login">Try the demo</Link>
                            </Button>
                            <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-medium">
                                <Link href="/get-started">Get Syscend-HRM <ArrowRight size={15} className="ml-1" /></Link>
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden">
                    {/* Animated backdrop */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-slate-50 to-slate-50" />
                        <div
                            className="absolute inset-0 dot-grid opacity-60"
                            style={{ maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)' }}
                        />
                        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-300/40 blur-3xl animate-blob" />
                        <div className="absolute top-16 right-0 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl animate-blob" style={{ animationDelay: '-5s' }} />
                        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl animate-blob" style={{ animationDelay: '-9s' }} />
                    </div>

                    <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 text-center sm:pt-24">
                        <Reveal delay={0}>
                            <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-blue-700 shadow-sm backdrop-blur">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75 animate-pulse-ring" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                                </span>
                                Open Source HRMS · One-time or yearly licensing
                            </div>
                        </Reveal>

                        <Reveal delay={90}>
                            <h1 className="mx-auto max-w-3xl text-4xl font-bold text-slate-900 leading-[1.1] tracking-tight sm:text-6xl">
                                Run your entire HR operation from{' '}
                                <span className="animate-gradient-x bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent">
                                    one place
                                </span>
                            </h1>
                        </Reveal>

                        <Reveal delay={180}>
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
                                {appName} brings your people, time, leave, payroll, recruitment, performance and training
                                together in a modern, self-hosted platform — deployed and branded for your organisation.
                            </p>
                        </Reveal>

                        <Reveal delay={260}>
                            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Button asChild size="lg" className="btn-shimmer group bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5">
                                    <Link href="/get-started">
                                        Get Syscend-HRM
                                        <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all hover:-translate-y-0.5">
                                    <Link href="/login">Try the live demo</Link>
                                </Button>
                            </div>
                        </Reveal>

                        <Reveal delay={340}>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> No credit card</span>
                                <span className="flex items-center gap-1.5"><Monitor size={14} className="text-slate-400" /> Self-hosted</span>
                                <span className="flex items-center gap-1.5"><Lock size={14} className="text-slate-400" /> Secure by default</span>
                                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-slate-400" /> Own your data</span>
                            </div>
                        </Reveal>
                    </div>

                    {/* Product preview */}
                    <Reveal delay={200} className="relative mx-auto max-w-4xl px-6 pb-14 z-10">
                        <div className="relative">
                            {/* Floating cards */}
                            <div className="absolute -left-4 top-1/4 z-20 hidden md:block animate-float">
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-900/10">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                                        <CheckCircle2 size={16} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800">Leave approved</p>
                                        <p className="text-[11px] text-slate-400">James Wilson · 3 days</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-4 top-1/3 z-20 hidden md:block animate-float" style={{ animationDelay: '-2s' }}>
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-900/10">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                                        <Wallet size={16} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800">Payslips ready</p>
                                        <p className="text-[11px] text-slate-400">September payroll · Le 4.2M</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main window */}
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden transition-transform duration-500 hover:-translate-y-1.5 hover:shadow-slate-900/15">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-3 w-3 rounded-full bg-red-400" />
                                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-400">
                                        <Lock size={11} className="text-emerald-500" />
                                        app.your-company.com
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-5 w-5 rounded-full bg-blue-500 ring-2 ring-white" />
                                        <span className="h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                        <span className="h-5 w-5 rounded-full bg-amber-500 ring-2 ring-white" />
                                    </div>
                                </div>

                                <div className="grid gap-4 p-5 sm:grid-cols-3">
                                    {[
                                        { label: 'Total employees', value: '16', sub: '+2 this month', icon: Users, color: 'bg-blue-600' },
                                        { label: 'Present today', value: '14', sub: '88% attendance', icon: Clock, color: 'bg-emerald-500' },
                                        { label: 'Next payroll', value: 'Le 4.2M', sub: 'Runs 30 Sep', icon: Wallet, color: 'bg-amber-500' },
                                    ].map(({ label, value, sub, icon: Icon, color }) => (
                                        <div key={label} className="rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:border-blue-200 hover:shadow-md">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-500">{label}</p>
                                                <Icon size={16} className={`text-white rounded-full p-0.5 ${color}`} />
                                            </div>
                                            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-slate-500">Attendance this month</p>
                                            <TrendingUp size={14} className="text-emerald-500" />
                                        </div>
                                        <p className="mt-1 text-xl font-bold text-slate-900">94%</p>
                                        <div className="mt-3 flex h-20 items-end gap-1.5">
                                            {PREVIEW_BARS.map((bar, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex-1 rounded-t ${bar.h} ${bar.color} animate-grow-bar`}
                                                    style={{ animationDelay: bar.delay }}
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Present</span>
                                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Late</span>
                                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Leave</span>
                                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" /> Absent</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-slate-500">Recent activity</p>
                                            <Clock size={14} className="text-slate-400" />
                                        </div>
                                        <ul className="mt-3 space-y-2.5">
                                            {[
                                                { text: '3 leave requests pending approval', time: '2m', tone: 'text-amber-600' },
                                                { text: 'Payroll for September generated', time: '1h', tone: 'text-emerald-600' },
                                                { text: '2 new job applications received', time: '3h', tone: 'text-blue-600' },
                                            ].map((a) => (
                                                <li key={a.text} className="flex items-center justify-between gap-3 text-sm">
                                                    <span className="flex items-center gap-2 text-slate-600 truncate">
                                                        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${a.tone}`} />
                                                        {a.text}
                                                    </span>
                                                    <span className="text-xs text-slate-400 flex-shrink-0">{a.time}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-400">
                                            Live dashboard shared with your team · all modules in one workspace
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* Marquee */}
                <section className="border-y border-slate-200 border-dashed bg-white py-6 marquee-track">
                    <div className="mx-auto max-w-6xl px-6">
                        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
                            One workspace for every HR function
                        </p>
                        <div className="marquee-mask overflow-hidden">
                            <div className="flex w-max animate-marquee items-center gap-10">
                                {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                                    <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-slate-400">
                                        <Sparkles size={14} className="text-blue-500" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-6xl px-6 py-14">
                        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                            {STATS.map((s, i) => (
                                <Reveal key={s.label} delay={i * 100} className="text-center">
                                    <p className="text-4xl font-bold text-slate-900 tracking-tight">
                                        <CountUp value={s.value} suffix={s.suffix} />
                                    </p>
                                    <p className="mt-1.5 text-sm text-slate-500">{s.label}</p>
                                </Reveal>
                            ))}
                            <Reveal delay={300} className="text-center">
                                <p className="text-4xl font-bold text-slate-900 tracking-tight">SLL</p>
                                <p className="mt-1.5 text-sm text-slate-500">Local currency support</p>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
                    <Reveal className="mx-auto max-w-2xl text-center mb-16">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Modules</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">Everything your HR team needs</h2>
                        <p className="mt-3 text-slate-500">
                            Eight integrated modules that work together, so your data never lives in two places.
                        </p>
                    </Reveal>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map(({ icon: Icon, title, description, accent }, i) => (
                            <Reveal key={title} delay={(i % 4) * 90}>
                                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5">
                                    <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                                        <Icon size={19} className="text-white" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">{title}</h3>
                                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{description}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Module coverage */}
                <section id="modules" className="border-y border-slate-200 bg-white">
                    <div className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
                        <Reveal className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">Every corner of HR, covered</h2>
                            <p className="mt-3 text-slate-500">
                                From onboarding to offboarding, every function your HR team touches is part of {appName}.
                            </p>
                        </Reveal>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {MODULE_GROUPS.map((group, i) => (
                                <Reveal key={group.name} delay={(i % 3) * 100}>
                                    <div className="h-full rounded-xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                                                <Layers size={14} className="text-blue-600" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-slate-900">{group.name}</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {group.items.map((item) => (
                                                <li key={item} className="flex items-center gap-2 text-sm text-slate-500">
                                                    <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works + demo accounts */}
                <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
                    <Reveal className="mx-auto max-w-2xl text-center mb-16">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Getting started</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">Up and running in minutes</h2>
                        <p className="mt-3 text-slate-500">
                            No complex setup. Sign in, explore the demo workspace, then make it yours.
                        </p>
                    </Reveal>

                    <div className="relative grid gap-5 md:grid-cols-3">
                        <div className="absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-slate-200 md:block" />
                        {PROCESS.map(({ step, title, description, icon: Icon }, i) => (
                            <Reveal key={step} delay={i * 130}>
                                <div className="relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-900/5">
                                    <div className="flex items-center justify-between">
                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25">
                                            <Icon size={20} className="text-white" />
                                        </div>
                                        <span className="text-4xl font-bold text-slate-100">{step}</span>
                                    </div>
                                    <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
                                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={120}>
                        <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
                            <div className="mx-auto max-w-2xl text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                                    <Lock size={20} className="text-blue-600" />
                                </div>
                                <h3 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Try it right now</h3>
                                <p className="mt-2 text-slate-500">
                                    The demo workspace is pre-loaded with realistic data. Every account uses the password{' '}
                                    <span className="font-mono text-slate-700 bg-slate-100 rounded px-1.5 py-0.5">Admin@1234</span>.
                                </p>
                            </div>
                            <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-2">
                                {DEMO_ACCOUNTS.map(({ role, email, color }) => (
                                    <Link
                                        key={email}
                                        href="/login"
                                        className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/5"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            sessionStorage.setItem('hrm-demo-email', email);
                                            window.location.href = '/login';
                                        }}
                                    >
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${color}`}>
                                            {role}
                                        </span>
                                        <span className="text-xs text-slate-500 font-mono truncate group-hover:text-blue-600">
                                            {email}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* Testimonials */}
                <section className="border-y border-slate-200 bg-white">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <Reveal className="mx-auto max-w-2xl text-center mb-14">
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Testimonials</p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">Loved by the people who run HR</h2>
                            <p className="mt-3 text-slate-500">Simple, reliable and built around how HR teams actually work.</p>
                        </Reveal>
                        <div className="grid gap-5 md:grid-cols-2">
                            {QUOTES.map((q, i) => (
                                <Reveal key={q.name} delay={i * 120}>
                                    <figure className="relative h-full rounded-2xl border border-slate-200 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
                                        <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-md">“</span>
                                        <div className="flex gap-0.5 text-amber-400">
                                            {Array.from({ length: 5 }).map((_, s) => (
                                                <Star key={s} size={16} fill="currentColor" strokeWidth={0} />
                                            ))}
                                        </div>
                                        <blockquote className="mt-4 text-slate-700 leading-relaxed">"{q.quote}"</blockquote>
                                        <figcaption className="mt-5 flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-semibold">
                                                {q.initials}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{q.name}</p>
                                                <p className="text-xs text-slate-400">{appName}</p>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
                    <Reveal className="mx-auto max-w-2xl text-center mb-14">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">FAQ</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">Frequently asked questions</h2>
                    </Reveal>
                    <div className="mx-auto max-w-3xl space-y-3">
                        {FAQS.map((faq, i) => {
                            const open = openFaq === i;
                            return (
                                <Reveal key={faq.q} delay={i * 70}>
                                    <div className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${open ? 'border-blue-200 shadow-lg shadow-blue-600/5' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(open ? null : i)}
                                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                        >
                                            <span className="font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="text-blue-600">Q.</span> {faq.q.replace('{appName}', appName)}
                                            </span>
                                            <ChevronDown
                                                size={18}
                                                className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180 text-blue-600' : ''}`}
                                            />
                                        </button>
                                        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden">
                                                <p className="px-5 pb-5 pl-11 text-sm text-slate-500 leading-relaxed">
                                                    {faq.a.replace('{appName}', appName)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </section>

                {/* CTA */}
                <section className="relative isolate overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 animate-aurora" />
                        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob" />
                        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl animate-blob" style={{ animationDelay: '-6s' }} />
                    </div>
                    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
                        <Reveal className="mx-auto max-w-2xl">
                            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">Ready to run your HR in one system?</h2>
                            <p className="mx-auto mt-3 max-w-xl text-blue-100">
                                We deliver your own branded HR platform, fully setup for your team. Pick a one-time license
                                or a yearly plan — deployment, training and support are included.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Button asChild size="lg" className="btn-shimmer group bg-white text-blue-700 font-semibold shadow-lg hover:bg-blue-50 transition-all hover:-translate-y-0.5">
                                    <Link href="/get-started">
                                        Purchase Syscend-HRM
                                        <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur transition-all hover:-translate-y-0.5">
                                    <Link href="/contact">Talk to sales</Link>
                                </Button>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-6xl px-6 py-14">
                    <div className="grid gap-10 md:grid-cols-12">
                        {/* Brand & contact */}
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-2.5">
                                {logo}
                                <span className="font-semibold text-slate-900 text-sm">{appName}</span>
                            </div>
                            <p className="mt-4 max-w-xs text-sm text-slate-500 leading-relaxed">
                                {SYS_BRAND.tagline}. Deployed and fully branded for your organisation — one-time or yearly
                                licensing, no surprises.
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                <a
                                    href="mailto:syscend@gmail.com"
                                    aria-label="Email Syscend"
                                    title="Email Syscend"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Mail size={18} />
                                </a>
                                <a
                                    href="https://wa.me/23279630777"
                                    aria-label="WhatsApp Syscend"
                                    title="WhatsApp"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                                >
                                    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Product */}
                        <div className="md:col-span-3">
                            <h4 className="text-sm font-semibold text-slate-900">Product</h4>
                            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                                <li><Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-blue-600 transition-colors">How it works</Link></li>
                                <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                                <li><Link href="/get-started" className="hover:text-blue-600 transition-colors">Buy Syscend-HRM</Link></li>
                            </ul>
                        </div>

                        {/* Demo */}
                        <div className="md:col-span-4">
                            <h4 className="text-sm font-semibold text-slate-900">Try it right now</h4>
                            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                                Explore the demo workspace with password{' '}
                                <span className="font-mono text-xs text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">Admin@1234</span>.
                            </p>
                            <Button asChild size="sm" className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-medium">
                                <Link href="/login">Open the demo <ArrowRight size={14} className="ml-1" /></Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
                        <p className="text-xs text-slate-400 text-center">{footerCopyright}</p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75 animate-pulse-ring" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
                            </span>
                            Powered by Syscend
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}