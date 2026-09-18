import { Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    BadgeCheck,
    BookOpen,
    Briefcase,
    Building2,
    CalendarCheck,
    CalendarDays,
    Clock,
    Coffee,
    MapPin,
    TrendingUp,
    Timer,
    UserCheck,
    XCircle,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import type { PageProps } from '@/types';
import { PortalHeader, QuickAction, StatusBadge } from './shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

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
    entitled: number;
    used: number;
    pending: number;
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

interface Props extends PageProps {
    portal: {
        name: string;
        employee_id: string;
        department: string | null;
        position: string | null;
        date_of_joining: string | null;
        tenure_label: string | null;
        today_att: {
            status: string;
            check_in: string | null;
            check_out: string | null;
            worked_minutes: number | null;
        } | null;
        month_stats: {
            worked: number;
            late: number;
            absent: number;
            total: number;
            rate: number;
        };
        att_history: AttDay[];
        leave_balances: LeaveBalance[];
        my_leaves: MyLeave[];
        next_leave: {
            start_date: string;
            end_date: string;
            days: number;
            type: string | null;
        } | null;
        trainings: { course: string; status: string }[];
    } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ATT_ICON: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    present:   { label: 'Present',   color: 'text-emerald-600', bg: 'bg-emerald-50', icon: BadgeCheck },
    late:      { label: 'Late',      color: 'text-amber-600',   bg: 'bg-amber-50',   icon: Timer      },
    absent:    { label: 'Absent',    color: 'text-red-600',     bg: 'bg-red-50',     icon: XCircle    },
    no_record: { label: 'Not Marked',color: 'text-slate-500',   bg: 'bg-slate-100',  icon: Coffee     },
};

const ATT_DOT: Record<string, string> = {
    present: 'bg-emerald-400', late: 'bg-amber-400', absent: 'bg-red-400', no_record: 'bg-slate-200',
};

function workedTime(minutes: number | null) {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

export default function PortalEmployee() {
    const { auth, portal } = usePage<Props>().props;
    const p = portal;

    // No linked employee record yet
    if (!p) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                        <UserCheck size={28} className="text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Employee Record Linked</h2>
                    <p className="text-slate-500 text-sm max-w-md mb-6">
                        Your user account isn't linked to an employee profile yet. Please contact your HR administrator to set up your employee record.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
                        <QuickAction label="My Leaves"    href="/leaves"      icon={CalendarDays} description="View your leave requests" />
                        <QuickAction label="Attendance"   href="/attendance"  icon={Clock}        description="View your attendance" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    const attConf = ATT_ICON[p.today_att?.status ?? 'no_record'] ?? ATT_ICON.no_record;
    const AttIcon = attConf.icon;

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto">
                <PortalHeader
                    name={auth.user.name}
                    portalLabel="Employee Portal"
                    subtitle="Your personal workspace for today."
                    badgeText={p.employee_id}
                />

                {/* Role + department line */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 -mt-3 mb-5">
                    {p.position && <span className="flex items-center gap-1"><Briefcase size={13} /> {p.position}</span>}
                    {p.department && <span className="flex items-center gap-1"><Building2 size={13} /> {p.department}</span>}
                    {p.date_of_joining && <span className="flex items-center gap-1"><MapPin size={13} /> Joined {p.date_of_joining}</span>}
                    {p.tenure_label && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.tenure_label}</span>}
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {/* Today */}
                    <Card className="col-span-2 sm:col-span-1 border-slate-200">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Today</p>
                                    <p className={cn('text-xl font-bold mt-1 leading-none', attConf.color)}>{attConf.label}</p>
                                    {p.today_att?.check_in && (
                                        <p className="text-xs text-slate-400 mt-1.5">
                                            In: {p.today_att.check_in}
                                            {p.today_att.check_out ? ` · Out: ${p.today_att.check_out}` : ''}
                                        </p>
                                    )}
                                    {p.today_att?.worked_minutes && (
                                        <p className="text-xs text-slate-400">Worked: {workedTime(p.today_att.worked_minutes)}</p>
                                    )}
                                </div>
                                <div className={cn('p-2 rounded-xl shrink-0', attConf.bg)}>
                                    <AttIcon size={18} className={attConf.color} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium">Days Worked</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{p.month_stats.worked}</p>
                            <p className="text-xs text-slate-400 mt-1.5">of {p.month_stats.total} this month</p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium">Attendance Rate</p>
                            <p className={cn('text-2xl font-bold mt-1', p.month_stats.rate >= 80 ? 'text-emerald-600' : 'text-amber-600')}>
                                {p.month_stats.rate}%
                            </p>
                            <p className="text-xs text-slate-400 mt-1.5">{p.month_stats.late} late · {p.month_stats.absent} absent</p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium">Next Leave</p>
                            {p.next_leave ? (
                                <>
                                    <p className="text-sm font-bold text-blue-600 mt-1 leading-snug">{p.next_leave.start_date}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{p.next_leave.type} · {p.next_leave.days}d</p>
                                </>
                            ) : (
                                <p className="text-sm font-semibold text-slate-400 mt-1">None scheduled</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Attendance history — last 14 days */}
                    <Card className="lg:col-span-2 border-slate-200">
                        <CardHeader className="border-b border-slate-100 px-5 py-3">
                            <CardTitle className="text-sm font-semibold text-slate-700">Attendance — Last 14 Days</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-4">
                            <div className="grid grid-cols-7 gap-1.5">
                                {p.att_history.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1" title={`${d.date}: ${d.status}${d.check_in ? ` · In ${d.check_in}` : ''}`}>
                                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold', {
                                            'bg-emerald-100 text-emerald-700': d.status === 'present',
                                            'bg-amber-100 text-amber-700':     d.status === 'late',
                                            'bg-red-100 text-red-600':         d.status === 'absent',
                                            'bg-slate-100 text-slate-400':    d.status === 'no_record',
                                        })}>
                                            {d.label.charAt(0)}
                                        </div>
                                        <span className="text-[9px] text-slate-400">{new Date(d.date).getDate()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" /> Present</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> Late</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-400 inline-block" /> Absent</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-200 inline-block" /> No record</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-slate-200">
                        <CardHeader className="border-b border-slate-100 px-5 py-3">
                            <CardTitle className="text-sm font-semibold text-slate-700">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-3 space-y-1.5">
                            <QuickAction label="Mark Attendance"  href="/attendance"      icon={Clock}        description="Record your check-in / check-out" />
                            <QuickAction label="Apply for Leave"  href="/leaves"          icon={CalendarDays}  description="Submit a new leave request" />
                            <QuickAction label="My Performance"   href="/performance"     icon={TrendingUp}    description="View reviews and goals" />
                            <QuickAction label="My Training"      href="/training"        icon={BookOpen}      description="Enrolled courses and progress" />
                            <QuickAction label="Profile Settings" href="/profile"         icon={UserCheck}     description="Update your personal info" />
                        </CardContent>
                    </Card>
                </div>

                {/* Leave balances */}
                {p.leave_balances.length > 0 && (
                    <Card className="border-slate-200 mb-6">
                        <CardHeader className="border-b border-slate-100 px-5 py-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-slate-700">Leave Balances — {new Date().getFullYear()}</CardTitle>
                            <Link href="/leaves" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                                Apply leave <ArrowUpRight size={11} />
                            </Link>
                        </CardHeader>
                        <CardContent className="px-5 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {p.leave_balances.map((b, i) => (
                                    <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                                            <span className="text-xs font-semibold text-slate-700 truncate">{b.type}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900">{b.available}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">available days</p>
                                        <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${b.entitled > 0 ? Math.round((b.used / b.entitled) * 100) : 0}%`, backgroundColor: b.color }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
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
                    <Card className="border-slate-200">
                        <CardHeader className="border-b border-slate-100 px-5 py-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-slate-700">My Leave Requests</CardTitle>
                            <Link href="/leaves" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                                View all <ArrowUpRight size={11} />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {p.my_leaves.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                    <CalendarCheck size={20} className="mb-2 opacity-40" />
                                    <p className="text-sm">No leave requests yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {p.my_leaves.map((l) => (
                                        <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: l.color }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800">{l.type}</p>
                                                <p className="text-xs text-slate-400 truncate">{l.start_date} → {l.end_date} · {l.days}d</p>
                                            </div>
                                            <StatusBadge status={l.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardHeader className="border-b border-slate-100 px-5 py-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-slate-700">My Training</CardTitle>
                            <Link href="/training" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                                View all <ArrowUpRight size={11} />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {p.trainings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                    <BookOpen size={20} className="mb-2 opacity-40" />
                                    <p className="text-sm">No courses enrolled</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {p.trainings.map((t, i) => (
                                        <div key={i} className="flex items-center gap-3 px-5 py-3">
                                            <div className="p-1.5 rounded-lg bg-indigo-50 shrink-0">
                                                <BookOpen size={13} className="text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{t.course}</p>
                                            </div>
                                            <StatusBadge status={t.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
