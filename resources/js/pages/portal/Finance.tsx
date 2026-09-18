import { usePage } from '@inertiajs/react';
import {
    Banknote,
    BarChart3,
    Briefcase,
    CalendarClock,
    CreditCard,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import type { PageProps } from '@/types';
import { PortalHeader, KpiCard, QuickAction, SectionCard, EmptyState, StatusBadge } from './shared';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props extends PageProps {
    portal: {
        subtitle: string;
        latest_run: {
            title: string;
            month_year: string;
            total_net: string;
            total_gross: string;
            total_employees: number;
            status: string;
        } | null;
        ytd_net: string;
        total_runs: number;
        draft_runs: number;
        approved_runs: number;
        paid_runs: number;
        recent_runs: {
            id: number;
            title: string;
            month_year: string;
            total_net: string;
            total_employees: number;
            status: string;
        }[];
        total_staff: number;
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortalFinance() {
    const { auth, portal: p } = usePage<Props>().props;

    const cards = [
        { label: 'YTD Net Payroll',   value: `Le ${p.ytd_net}`,  sub: 'paid this year',   subPositive: true,          icon: Wallet,      color: 'text-teal-600',   bg: 'bg-teal-50',   href: '/payroll' },
        { label: 'Payroll Runs',      value: p.total_runs,       sub: `${p.paid_runs} paid`, subPositive: p.draft_runs === 0, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', href: '/payroll' },
        { label: 'Awaiting Finalisation', value: p.draft_runs,   sub: p.draft_runs === 0 ? 'all runs finalised' : 'runs to review', subPositive: p.draft_runs === 0, icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/payroll' },
        { label: 'Employees Paid',    value: p.total_staff,      sub: 'in latest run',    subPositive: true,           icon: Users,      color: 'text-purple-600', bg: 'bg-purple-50', href: '/payroll' },
    ];

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto">
                <PortalHeader
                    name={auth.user.name}
                    portalLabel="Finance Portal"
                    subtitle={p.subtitle}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {cards.map((k) => (
                        <KpiCard key={k.label} {...k} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Latest payroll run */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium mb-3">Latest Payroll Run</p>
                            {p.latest_run ? (
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{p.latest_run.title}</p>
                                            <p className="text-xs text-slate-400">{p.latest_run.month_year} · {p.latest_run.total_employees} employees</p>
                                        </div>
                                        <StatusBadge status={p.latest_run.status} />
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-3 space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Net Paid</span>
                                            <span className="font-semibold text-slate-800">{p.latest_run.total_net}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Gross</span>
                                            <span className="font-semibold text-slate-800">{p.latest_run.total_gross}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState icon={Banknote} message="No payroll runs yet" hint="Create your first run from Payroll." />
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent runs */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium mb-3">Recent Payroll Runs</p>
                            {p.recent_runs.length === 0 ? (
                                <EmptyState icon={BarChart3} message="No runs yet" />
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {p.recent_runs.map((r) => (
                                        <div key={r.id} className="flex items-center gap-3 py-2.5">
                                            <div className="p-1.5 rounded-lg bg-teal-50 shrink-0">
                                                <CreditCard size={13} className="text-teal-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{r.month_year}</p>
                                                <p className="text-xs text-slate-400 truncate">{r.total_employees} employees · {r.total_net}</p>
                                            </div>
                                            <StatusBadge status={r.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick actions */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4 space-y-1.5">
                            <p className="text-xs text-slate-500 font-medium mb-3">Quick Actions</p>
                            <QuickAction label="Run Payroll"         href="/payroll/runs/create" icon={CreditCard} description="Create a new payroll run" />
                            <QuickAction label="Manage Components"   href="/payroll/components"  icon={Banknote}   description="Salary components and allowances" />
                            <QuickAction label="Salary Structures"   href="/payroll/structures"  icon={Wallet}      description="Configure pay structures" />
                            <QuickAction label="Payroll Report"      href="/reports/payroll"     icon={TrendingUp}  description="Financial analytics" />
                        </CardContent>
                    </Card>
                </div>

                {/* Payroll summary strip */}
                <Card className="border-slate-200">
                    <CardContent className="p-4 flex flex-wrap gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-50"><Wallet size={16} className="text-green-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500">Paid Runs</p>
                                <p className="text-lg font-bold text-slate-900">{p.paid_runs}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50"><Briefcase size={16} className="text-blue-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500">Approved</p>
                                <p className="text-lg font-bold text-slate-900">{p.approved_runs}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-50"><CalendarClock size={16} className="text-amber-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500">In Draft</p>
                                <p className="text-lg font-bold text-slate-900">{p.draft_runs}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}