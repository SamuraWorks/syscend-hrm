import { usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import type { PageProps } from '@/types';
import { PortalHeader, KpiCard, QuickAction, SectionCard, EmptyState, StatusBadge } from './shared';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props extends PageProps {
    portal: {
        team_total: number;
        team_active: number;
        present_today: number;
        absent_today: number;
        on_leave_today: number;
        pending_leaves: number;
        attendance_rate: number;
        department: string | null;
        team_by_position: { name: string; count: number }[];
        pending_approvals: {
            id: number;
            name: string;
            type: string;
            start_date: string;
            end_date: string;
            days: number;
        }[];
        team_leaves: {
            id: number;
            name: string;
            type: string;
            start_date: string;
            end_date: string;
            days: number;
            status: string;
        }[];
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortalManager() {
    const { auth, portal: p } = usePage<Props>().props;

    const cards = [
        { label: 'Team Members',    value: p.team_total,    sub: `${p.team_active} active`, subPositive: true,  icon: Users,       color: 'text-blue-600',     bg: 'bg-blue-50',     href: '/employees' },
        { label: 'Present Today',   value: p.present_today, sub: `${p.attendance_rate}% rate`, subPositive: p.attendance_rate >= 80, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/attendance' },
        { label: 'On Leave',        value: p.on_leave_today,sub: 'across your team', subPositive: true,           icon: CalendarDays, color: 'text-amber-600',  bg: 'bg-amber-50',   href: '/leaves' },
        { label: 'Pending Approvals', value: p.pending_leaves, sub: p.pending_leaves === 0 ? 'All caught up' : 'leave requests', subPositive: p.pending_leaves === 0, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', href: '/leaves' },
    ];

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto">
                <PortalHeader
                    name={auth.user.name}
                    portalLabel="Manager Portal"
                    subtitle={p.department ? `Here's what's happening across ${p.department} today.` : "Here's what's happening across your team today."}
                    badgeText={p.department ?? 'Manager'}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {cards.map((k) => (
                        <KpiCard key={k.label} {...k} value={k.value} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Team by position */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium mb-3">Team by Position</p>
                            {p.team_by_position.length === 0 ? (
                                <p className="text-xs text-slate-400 py-3">No position data yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {p.team_by_position.map((d, i) => {
                                        const max = p.team_by_position[0]?.count ?? 1;
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
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending approvals */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-slate-500 font-medium">Awaiting Your Approval</p>
                                {p.pending_leaves > 0 && (
                                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{p.pending_leaves}</span>
                                )}
                            </div>
                            {p.pending_approvals.length === 0 ? (
                                <EmptyState icon={CheckCircle2} message="No pending approvals" hint="You're all caught up." />
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {p.pending_approvals.map((r) => (
                                        <div key={r.id} className="flex items-center gap-3 py-2.5">
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
                            <QuickAction label="Approve Leaves"   href="/leaves"       icon={CalendarDays} description="Review pending team requests" />
                            <QuickAction label="View My Team"     href="/employees"    icon={Users}        description="Browse people and profiles" />
                            <QuickAction label="Review Reports"   href="/reports"      icon={TrendingUp}   description="Analytics and exports" />
                            <QuickAction label="Team Attendance"  href="/attendance"   icon={Clock}        description="Monitor check-ins and check-outs" />
                        </CardContent>
                    </Card>
                </div>

                {/* Recent team leave activity */}
                <div className="mt-6">
                    <SectionCard title="Recent Team Leave" actionLabel="Manage leaves" actionHref="/leaves">
                        {p.team_leaves.length === 0 ? (
                            <EmptyState icon={CalendarDays} message="No leave activity yet" />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {p.team_leaves.map((l) => (
                                    <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                                        <div className="p-1.5 rounded-lg bg-indigo-50 shrink-0">
                                            <Building2 size={13} className="text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{l.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{l.type} · {l.start_date} → {l.end_date} · {l.days}d</p>
                                        </div>
                                        <StatusBadge status={l.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}