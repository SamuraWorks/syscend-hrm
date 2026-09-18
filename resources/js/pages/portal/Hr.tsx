import { usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Briefcase,
    Building2,
    CalendarDays,
    Clock,
    CreditCard,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import type { PageProps } from '@/types';
import { PortalHeader, KpiCard, QuickAction, SectionCard, EmptyState, StatusBadge } from './shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props extends PageProps {
    portal: {
        subtitle: string;
        stats: {
            total_employees: number;
            new_this_month: number;
            present_today: number;
            attendance_rate: number;
            on_leave_today: number;
            pending_leaves: number;
            open_positions: number;
            total_applications: number;
            total_departments: number;
            last_payroll_net: string;
            last_payroll_month: string | null;
            training_completion: number;
        };
        pending_leaves: {
            id: number;
            name: string;
            type: string;
            start_date: string;
            end_date: string;
            days: number;
        }[];
        recent_activity: { id: number; user: string; action: string; module: string; description: string; time: string }[];
        headcount_by_dept: { name: string; count: number }[];
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
    created:  'bg-green-100 text-green-700',
    updated:  'bg-blue-100 text-blue-700',
    deleted:  'bg-red-100 text-red-700',
    approved: 'bg-teal-100 text-teal-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function PortalHr() {
    const { auth, portal: p } = usePage<Props>().props;
    const s = p.stats;

    const cards = [
        { label: 'Total Employees',    value: s.total_employees,   sub: `+${s.new_this_month} this month`, subPositive: s.new_this_month >= 0, icon: Users,       color: 'text-blue-600',    bg: 'bg-blue-50',     href: '/employees' },
        { label: 'Present Today',      value: s.present_today,     sub: `${s.attendance_rate}% rate`,      subPositive: s.attendance_rate >= 80, icon: UserCheck,  color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/attendance' },
        { label: 'On Leave',           value: s.on_leave_today,    sub: `${s.pending_leaves} pending`,      subPositive: s.pending_leaves === 0, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50',   href: '/leaves' },
        { label: 'Open Positions',     value: s.open_positions,    sub: `${s.total_applications} apps`,     subPositive: true, icon: Briefcase,   color: 'text-purple-600', bg: 'bg-purple-50',  href: '/recruitment' },
        { label: 'Departments',        value: s.total_departments, sub: 'Active departments',               subPositive: true, icon: Building2,   color: 'text-rose-600',   bg: 'bg-rose-50',     href: '/departments' },
        { label: 'Last Payroll Net',   value: s.last_payroll_net ? `Le ${s.last_payroll_net}` : '—', sub: s.last_payroll_month ?? 'No payroll yet', subPositive: true, icon: CreditCard, color: 'text-teal-600', bg: 'bg-teal-50', href: '/payroll' },
        { label: 'Training Completion', value: `${s.training_completion}%`, sub: 'Across all courses', subPositive: s.training_completion >= 50, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/training' },
        { label: 'Pending Leaves',     value: s.pending_leaves,    sub: 'requests to review',              subPositive: s.pending_leaves === 0, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', href: '/leaves' },
    ];

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto">
                <PortalHeader
                    name={auth.user.name}
                    portalLabel="HR Portal"
                    subtitle={p.subtitle}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {cards.map((k) => (
                        <KpiCard key={k.label} {...k} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Headcount by department */}
                    <Card className="border-slate-200">
                        <CardHeader className="border-b border-slate-100 px-5 py-3">
                            <CardTitle className="text-sm font-semibold text-slate-700">Headcount by Department</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-3 space-y-2">
                            {p.headcount_by_dept.length === 0 ? <p className="text-xs text-slate-400 py-3">No department data yet.</p>
                                : p.headcount_by_dept.map((d, i) => {
                                    const max = p.headcount_by_dept[0]?.count ?? 1;
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-0.5">
                                                <span className="text-slate-700 truncate max-w-[60%]">{d.name}</span>
                                                <span className="font-semibold text-slate-800">{d.count}</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-slate-100">
                                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${(d.count / max) * 100}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                        </CardContent>
                    </Card>

                    {/* Pending leaves */}
                    <Card className="border-slate-200">
                        <CardHeader className="border-b border-slate-100 px-5 py-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-slate-700">Pending Leaves</CardTitle>
                            {p.pending_leaves > 0 && (
                                <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{p.pending_leaves}</span>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            {p.pending_leaves.length === 0 ? (
                                <EmptyState icon={CalendarDays} message="No pending requests" hint="All leave requests are reviewed." />
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {p.pending_leaves.map((r) => (
                                        <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                                            <div className="p-1.5 rounded-lg bg-amber-50 shrink-0">
                                                <CalendarDays size={13} className="text-amber-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{r.type} · {r.start_date} → {r.end_date} · {r.days}d</p>
                                            </div>
                                            <StatusBadge status="pending" />
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
                            <QuickAction label="Add Employee"      href="/employees/create" icon={Users}        description="Create a new employee record" />
                            <QuickAction label="Approve Leaves"    href="/leaves"           icon={CalendarDays} description="Review pending leave requests" />
                            <QuickAction label="Run Payroll"       href="/payroll"          icon={CreditCard}   description="Process monthly payroll" />
                            <QuickAction label="Post a Job"        href="/recruitment"      icon={Briefcase}    description="Create a new job opening" />
                            <QuickAction label="View Reports"      href="/reports"          icon={TrendingUp}   description="Analytics and exports" />
                        </CardContent>
                    </Card>
                </div>

                {/* Recent activity */}
                <SectionCard title="Recent Activity">
                    {p.recent_activity.length === 0 ? (
                        <EmptyState icon={Clock} message="No activity yet" />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {p.recent_activity.map((a) => (
                                <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <TrendingUp size={13} className="text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-800 truncate">{a.description}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            <span className="font-medium text-slate-600">{a.user}</span> · {a.time}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-xs text-slate-400">{a.module}</span>
                                        <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize', ACTION_COLORS[a.action] ?? 'bg-slate-100 text-slate-600')}>
                                            {a.action}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </AppLayout>
    );
}