import { Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight, BarChart3, BookOpen, Briefcase, Building2,
    CalendarCheck, CalendarDays, CheckCircle2, Clock, CreditCard,
    TrendingUp, Users, UserCheck, AlertCircle, MapPin, BadgeCheck,
    Hourglass, XCircle, Coffee, Timer, CalendarClock, Settings,
} from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgStats {
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
    pending_approvals: number;
}

interface AttDay {
    date: string;
    label: string;
    status: 'present' | 'late' | 'absent' | 'no_record';
    check_in: string | null;
    check_out: string | null;
}

interface LeaveBalance {
    type: string;
    color: string;
    code: string;
    entitled: number;
    used: number;
    pending: number;
    carried: number;
    available: number;
}

interface MyLeave {
    id: number;
    type: string;
    color: string;
    start_date: string;
    end_date: string;
    days: number;
    status: string;
    reason: string;
}

interface EmployeeData {
    id: number;
    name: string;
    employee_id: string;
    department: string | null;
    position: string | null;
    contract_type: string | null;
    date_of_joining: string | null;
    tenure_months: number | null;
    today_att: { status: string; check_in: string | null; check_out: string | null; worked_minutes: number | null } | null;
    month_stats: { worked: number; late: number; absent: number; total: number; rate: number };
    att_history: AttDay[];
    leave_balances: LeaveBalance[];
    my_leaves: MyLeave[];
    next_leave: { start_date: string; end_date: string; days: number; type: string | null } | null;
    trainings: { course: string; status: string }[];
}

interface Props extends PageProps {
    isEmployee: boolean;
    // manager/admin
    stats?: OrgStats;
    headcountByDept?: { name: string; count: number }[];
    headcountTrend?: { month: string; count: number }[];
    attendanceTrend?: { date: string; present: number; absent: number }[];
    leaveByType?: { name: string; count: number }[];
    employmentTypes?: Record<string, number>;
    genderBreakdown?: Record<string, number>;
    recentActivity?: { id: number; user: string; action: string; module: string; description: string; time: string }[];
    // employee
    employeeData?: EmployeeData;
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
    created:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    updated:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    deleted:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    approved: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const STATUS_LEAVE: Record<string, { label: string; cls: string }> = {
    pending:   { label: 'Pending',   cls: 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300'  },
    approved:  { label: 'Approved',  cls: 'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300'  },
    rejected:  { label: 'Rejected',  cls: 'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300'    },
    cancelled: { label: 'Cancelled', cls: 'bg-slate-100  text-slate-600  dark:bg-slate-800     dark:text-slate-400'  },
};

function greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

// ─── Chart components ────────────────────────────────────────────────────────

function MiniBarChart({ data, color = 'bg-blue-500' }: { data: { label: string; value: number }[]; color?: string }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-1 h-14">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                        className={cn('w-full rounded-t transition-all', color)}
                        style={{ height: `${Math.max((d.value / max) * 48, d.value > 0 ? 4 : 0)}px` }}
                        title={`${d.label}: ${d.value}`}
                    />
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate w-full text-center">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

function StackedBarChart({ data }: { data: { date: string; present: number; absent: number }[] }) {
    const max = Math.max(...data.map(d => d.present + d.absent), 1);
    return (
        <div className="flex items-end gap-1 h-14">
            {data.map((d, i) => {
                const total = d.present + d.absent;
                const h = Math.max((total / max) * 48, total > 0 ? 4 : 0);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full flex flex-col rounded-t overflow-hidden" style={{ height: `${h}px` }}>
                            <div className="bg-green-400 dark:bg-green-600" style={{ flex: d.present }} />
                            <div className="bg-red-400 dark:bg-red-600"   style={{ flex: d.absent  }} />
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate w-full text-center">{d.date}</span>
                    </div>
                );
            })}
        </div>
    );
}

function BreakdownBars({ data, total }: { data: Record<string, number>; total: number }) {
    const COLORS = ['bg-blue-500','bg-purple-500','bg-green-500','bg-amber-500','bg-red-500','bg-teal-500'];
    const entries = Object.entries(data);
    if (entries.length === 0) return <p className="text-xs text-slate-400 dark:text-slate-500">No data.</p>;
    return (
        <div className="space-y-2">
            {entries.map(([key, count], i) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                    <div key={key}>
                        <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-600 dark:text-slate-400 capitalize">{key}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className={cn('h-full rounded-full', COLORS[i % COLORS.length])} style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function QuickAction({ label, href, icon: Icon, description }: { label: string; href: string; icon: React.ElementType; description: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                <Icon size={15} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{description}</p>
            </div>
            <ArrowUpRight size={13} className="text-slate-400 group-hover:text-blue-500 shrink-0" />
        </Link>
    );
}

// ─── No Employee Record ───────────────────────────────────────────────────────

function NoEmployeeRecord() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                <UserCheck size={28} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Employee Record Linked</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">
                Your user account isn't linked to an employee profile yet. Please contact your HR administrator to set up your employee record.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
                <QuickAction label="My Leaves"    href="/leaves"      icon={CalendarDays} description="View your leave requests" />
                <QuickAction label="Attendance"   href="/attendance"  icon={Clock}        description="View your attendance" />
            </div>
        </div>
    );
}

// ─── Employee Dashboard ───────────────────────────────────────────────────────

function EmployeeDashboard({ data, userName }: { data: EmployeeData; userName: string }) {
    const attStatusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
        present:   { label: 'Present',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30',  icon: BadgeCheck },
        late:      { label: 'Late',      color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/30',      icon: Timer      },
        absent:    { label: 'Absent',    color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/30',          icon: XCircle    },
        on_leave:  { label: 'On Leave',  color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/30',        icon: CalendarDays },
        no_record: { label: 'Not Marked',color: 'text-slate-500 dark:text-slate-400',     bg: 'bg-slate-50 dark:bg-slate-800',         icon: Coffee     },
    };

    const todayStatus = data.today_att?.status ?? 'no_record';
    const attConf     = attStatusConfig[todayStatus] ?? attStatusConfig.no_record;
    const AttIcon     = attConf.icon;

    function workedTime(minutes: number | null) {
        if (!minutes) return '—';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    }

    const attDotColors: Record<string, string> = {
        present:   'bg-emerald-400',
        late:      'bg-amber-400',
        absent:    'bg-red-400',
        no_record: 'bg-slate-200 dark:bg-slate-700',
    };

    const tenureLabel = data.tenure_months != null
        ? data.tenure_months < 12
            ? `${data.tenure_months} month${data.tenure_months !== 1 ? 's' : ''}`
            : `${Math.floor(data.tenure_months / 12)} yr${Math.floor(data.tenure_months / 12) !== 1 ? 's' : ''} ${data.tenure_months % 12 > 0 ? `${data.tenure_months % 12}mo` : ''}`
        : null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Employee info sub-header */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 -mt-2">
                {data.position && <span className="flex items-center gap-1"><Briefcase size={13} /> {data.position}</span>}
                {data.department && <span className="flex items-center gap-1"><Building2 size={13} /> {data.department}</span>}
                {data.date_of_joining && <span className="flex items-center gap-1"><MapPin size={13} /> Joined {data.date_of_joining}</span>}
                {tenureLabel && <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{tenureLabel} tenure</span>}
            </div>

            {/* Today's status + month stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Today */}
                <Card className={cn('col-span-2 sm:col-span-1 border-slate-200 dark:border-slate-700 dark:bg-slate-900')}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Today</p>
                                <p className={cn('text-xl font-bold mt-1 leading-none', attConf.color)}>{attConf.label}</p>
                                {data.today_att?.check_in && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                                        In: {data.today_att.check_in}
                                        {data.today_att.check_out ? ` · Out: ${data.today_att.check_out}` : ''}
                                    </p>
                                )}
                                {data.today_att?.worked_minutes && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Worked: {workedTime(data.today_att.worked_minutes)}</p>
                                )}
                            </div>
                            <div className={cn('p-2 rounded-xl shrink-0', attConf.bg)}>
                                <AttIcon size={18} className={attConf.color} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Worked days */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Days Worked</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.month_stats.worked}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">of {data.month_stats.total} days this month</p>
                    </CardContent>
                </Card>

                {/* Attendance rate */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Attendance Rate</p>
                        <p className={cn('text-2xl font-bold mt-1', data.month_stats.rate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                            {data.month_stats.rate}%
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{data.month_stats.late} late · {data.month_stats.absent} absent</p>
                    </CardContent>
                </Card>

                {/* Next leave */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Next Leave</p>
                        {data.next_leave ? (
                            <>
                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1 leading-snug">{data.next_leave.start_date}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{data.next_leave.type} · {data.next_leave.days}d</p>
                            </>
                        ) : (
                            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">None scheduled</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Attendance history — last 14 days */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attendance — Last 14 Days</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                        <div className="grid grid-cols-7 gap-1.5">
                            {data.att_history.map((d, i) => (
                                <div key={i} className="flex flex-col items-center gap-1" title={`${d.date}: ${d.status}${d.check_in ? ` · In ${d.check_in}` : ''}`}>
                                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold', {
                                        'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300': d.status === 'present',
                                        'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300':         d.status === 'late',
                                        'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400':                 d.status === 'absent',
                                        'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500':            d.status === 'no_record',
                                    })}>
                                        {d.label.charAt(0)}
                                    </div>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{new Date(d.date).getDate()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" /> Present</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> Late</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-400 inline-block" /> Absent</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700 inline-block" /> No record</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-3 space-y-1.5">
                        <QuickAction label="Mark Attendance"  href="/attendance"      icon={Clock}       description="Record your check-in / check-out" />
                        <QuickAction label="Apply for Leave"  href="/leaves"          icon={CalendarDays} description="Submit a new leave request" />
                        <QuickAction label="My Performance"   href="/performance"     icon={TrendingUp}   description="View reviews and goals" />
                        <QuickAction label="My Training"      href="/training"        icon={BookOpen}     description="Enrolled courses and progress" />
                        <QuickAction label="Profile Settings" href="/profile"         icon={UserCheck}    description="Update your personal info" />
                    </CardContent>
                </Card>
            </div>

            {/* Leave balances */}
            {data.leave_balances.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Leave Balances — {new Date().getFullYear()}</CardTitle>
                        <Link href="/leaves" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                            Apply leave <ArrowUpRight size={11} />
                        </Link>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {data.leave_balances.map((b, i) => (
                                <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{b.type}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{b.available}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">available days</p>
                                    <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${b.entitled > 0 ? Math.round((b.used / b.entitled) * 100) : 0}%`, backgroundColor: b.color }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                        <span>{b.used} used</span>
                                        {b.pending > 0 && <span className="text-amber-500">{b.pending} pending</span>}
                                        <span>{b.entitled} total</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* My recent leave requests + Training */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* My leave requests */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">My Leave Requests</CardTitle>
                        <Link href="/leaves" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                            View all <ArrowUpRight size={11} />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.my_leaves.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
                                <CalendarCheck size={20} className="mb-2 opacity-40" />
                                <p className="text-sm">No leave requests yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.my_leaves.map((l) => {
                                    const s = STATUS_LEAVE[l.status] ?? STATUS_LEAVE.pending;
                                    return (
                                        <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: l.color }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{l.type}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{l.start_date} → {l.end_date} · {l.days}d</p>
                                            </div>
                                            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0', s.cls)}>
                                                {s.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Training */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">My Training</CardTitle>
                        <Link href="/training" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                            View all <ArrowUpRight size={11} />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.trainings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
                                <BookOpen size={20} className="mb-2 opacity-40" />
                                <p className="text-sm">No courses enrolled</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.trainings.map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                                        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 shrink-0">
                                            <BookOpen size={13} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{t.course}</p>
                                        </div>
                                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 capitalize', {
                                            'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300': t.status === 'completed',
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300':    t.status === 'enrolled',
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300': t.status === 'in_progress',
                                        })}>
                                            {t.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ─── HR / Manager Dashboard ───────────────────────────────────────────────────

function HRDashboard({ props }: { props: Props }) {
    const { stats, headcountByDept = [], headcountTrend = [], attendanceTrend = [], leaveByType = [], employmentTypes = {}, genderBreakdown = {}, recentActivity = [] } = props;
    if (!stats) return null;

    const permissions: string[] = (props.auth?.user as any)?.permissions ?? [];
    const can = (p: string) => permissions.includes(p);

    const totalEmpTypes = Object.values(employmentTypes).reduce((a, b) => a + b, 0);
    const totalGender   = Object.values(genderBreakdown).reduce((a, b) => a + b, 0);

    const KPI_CARDS = [
        { label: 'Total Employees',    value: stats.total_employees,   sub: `+${stats.new_this_month} this month`, subPositive: stats.new_this_month >= 0, icon: Users,       color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/30',    href: '/employees' },
        { label: 'Present Today',      value: stats.present_today,     sub: `${stats.attendance_rate}% rate`,      subPositive: stats.attendance_rate >= 80,  icon: UserCheck,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', href: '/attendance' },
        { label: 'On Leave',           value: stats.on_leave_today,    sub: `${stats.pending_leaves} pending`,     subPositive: stats.pending_leaves === 0,   icon: CalendarDays,color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/30',  href: '/leaves' },
        { label: 'Open Positions',     value: stats.open_positions,    sub: `${stats.total_applications} apps`,    subPositive: true,                          icon: Briefcase,   color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', href: '/recruitment' },
        { label: 'Departments',        value: stats.total_departments, sub: 'Active departments',                  subPositive: true,                          icon: Building2,   color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-900/30',    href: '/departments' },
        { label: 'Last Payroll Net',   value: stats.last_payroll_net ? `Le ${stats.last_payroll_net}` : '—', sub: stats.last_payroll_month ?? 'No payroll yet', subPositive: true, icon: CreditCard, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/30', href: '/payroll' },
        { label: 'Training Completion',value: `${stats.training_completion}%`, sub: 'Across all courses',         subPositive: stats.training_completion >= 50, icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30', href: '/training' },
        { label: 'Pending Approvals',  value: stats.pending_approvals, sub: 'Leave + interview actions',           subPositive: stats.pending_approvals === 0, icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', href: '/leaves' },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* KPI grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {KPI_CARDS.map((k) => (
                    <Link key={k.label} href={k.href}>
                        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{k.label}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 leading-none">{k.value}</p>
                                        <p className={cn('text-xs mt-1.5 flex items-center gap-0.5', k.subPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                                            <TrendingUp size={10} />{k.sub}
                                        </p>
                                    </div>
                                    <div className={cn('p-2 rounded-xl shrink-0', k.bg)}>
                                        <k.icon size={18} className={k.color} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Headcount Trend</CardTitle></CardHeader>
                    <CardContent className="px-5 pb-4"><MiniBarChart data={headcountTrend.map(d => ({ label: d.month, value: d.count }))} color="bg-blue-500 dark:bg-blue-600" /></CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attendance — Last 7 Days</CardTitle></CardHeader>
                    <CardContent className="px-5 pb-4">
                        <StackedBarChart data={attendanceTrend} />
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400 inline-block" /> Present</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Absent</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Leave This Month</CardTitle></CardHeader>
                    <CardContent className="px-5 pb-4">
                        {leaveByType.length === 0
                            ? <p className="text-xs text-slate-400 dark:text-slate-500 py-4">No approved leave this month.</p>
                            : <MiniBarChart data={leaveByType.map(d => ({ label: d.name, value: d.count }))} color="bg-amber-400 dark:bg-amber-600" />}
                    </CardContent>
                </Card>
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Headcount by Department</CardTitle></CardHeader>
                    <CardContent className="px-5 py-3 space-y-2">
                        {headcountByDept.length === 0 ? <p className="text-xs text-slate-400 dark:text-slate-500 py-3">No department data yet.</p>
                            : headcountByDept.map((d, i) => {
                                const max = headcountByDept[0]?.count ?? 1;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs mb-0.5">
                                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[60%]">{d.name}</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{d.count}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${(d.count / max) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Workforce Breakdown</CardTitle></CardHeader>
                    <CardContent className="px-5 py-3 space-y-4">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">By Contract Type</p>
                            <BreakdownBars data={employmentTypes} total={totalEmpTypes} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">By Gender</p>
                            <BreakdownBars data={genderBreakdown} total={totalGender} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quick Actions</CardTitle></CardHeader>
                    <CardContent className="px-4 py-3 space-y-1.5">
                        {can('employees.create')   && <QuickAction label="Add Employee"      href="/employees/create"  icon={Users}        description="Create a new employee record" />}
                        {can('attendance.mark')    && <QuickAction label="Mark Attendance"   href="/attendance"         icon={Clock}        description="Record check-in / check-out" />}
                        {can('leaves.approve')     && <QuickAction label="Approve Leaves"    href="/leaves"             icon={CalendarDays} description="Review pending leave requests" />}
                        {can('payroll.process')    && <QuickAction label="Run Payroll"       href="/payroll"            icon={CreditCard}   description="Process monthly payroll" />}
                        {!can('payroll.process') && can('payroll.view') && <QuickAction label="View Payroll" href="/payroll" icon={CreditCard} description="View payroll runs and payslips" />}
                        {can('recruitment.create') && <QuickAction label="Post a Job"        href="/recruitment"        icon={Briefcase}    description="Create a new job opening" />}
                        {can('reports.view')       && <QuickAction label="View Reports"      href="/reports"            icon={BarChart3}    description="Analytics and exports" />}
                        {can('admin.settings')     && <QuickAction label="System Settings"   href="/admin/settings"     icon={Settings}     description="Configure system settings" />}
                    </CardContent>
                </Card>
            </div>

            {/* Recent activity */}
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Activity</CardTitle>
                    {can('admin.audit-logs') && (
                        <Link href="/admin/audit-log" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">View all <ArrowUpRight size={11} /></Link>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {recentActivity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <CalendarCheck size={20} className="text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentActivity.map((a) => (
                                <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 size={13} className="text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{a.description}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                            <span className="font-medium text-slate-600 dark:text-slate-400">{a.user}</span> · {a.time}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-xs text-slate-400 dark:text-slate-500">{a.module}</span>
                                        <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize', ACTION_COLORS[a.action] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300')}>
                                            {a.action}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const props = usePage<Props>().props;
    const { auth, isEmployee, employeeData } = props;
    const user = auth.user;
    const role = user?.roles?.[0] ?? 'User';

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header — always shown */}
                <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {greeting()}, {isEmployee && employeeData ? employeeData.name.split(' ')[0] : user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {isEmployee
                                ? 'Here\'s your personal workspace for today.'
                                : 'Here\'s what\'s happening across your organization today.'}
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-xs px-3 py-1">
                        {isEmployee && employeeData ? employeeData.employee_id : role}
                    </Badge>
                </div>

                {isEmployee
                    ? employeeData
                        ? <EmployeeDashboard data={employeeData} userName={user?.name ?? ''} />
                        : <NoEmployeeRecord />
                    : <HRDashboard props={props} />
                }
            </div>
        </AppLayout>
    );
}
