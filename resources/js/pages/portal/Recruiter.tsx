import { usePage } from '@inertiajs/react';
import {
    Briefcase,
    CalendarClock,
    FileText,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import type { PageProps } from '@/types';
import { PortalHeader, KpiCard, QuickAction, SectionCard, EmptyState, StatusBadge } from './shared';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props extends PageProps {
    portal: {
        subtitle: string;
        open_positions: number;
        total_applications: number;
        new_applications: number;
        shortlisted: number;
        active_interviews: number;
        applications_by_stage: { name: string; count: number }[];
        recent_applications: {
            id: number;
            name: string;
            job: string;
            stage: string;
            updated_at: string;
        }[];
        open_jobs: {
            id: number;
            title: string;
            department: string | null;
            applications: number;
            deadline: string | null;
        }[];
    };
}

const STAGE_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-teal-500', 'bg-red-500'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortalRecruiter() {
    const { auth, portal: p } = usePage<Props>().props;

    const cards = [
        { label: 'Open Positions',   value: p.open_positions,   sub: 'currently hiring',        subPositive: true,                  icon: Briefcase,  color: 'text-blue-600',     bg: 'bg-blue-50',  href: '/recruitment' },
        { label: 'Applications',     value: p.total_applications, sub: `+${p.new_applications} new (30d)`, subPositive: p.new_applications >= 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', href: '/recruitment' },
        { label: 'Shortlisted',      value: p.shortlisted,       sub: 'candidates in pipeline', subPositive: true,                  icon: UserPlus,   color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/recruitment' },
        { label: 'Active Interviews', value: p.active_interviews, sub: 'scheduled or in progress', subPositive: true,                icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/recruitment' },
    ];

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto">
                <PortalHeader
                    name={auth.user.name}
                    portalLabel="Recruiter Portal"
                    subtitle={p.subtitle}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {cards.map((k) => (
                        <KpiCard key={k.label} {...k} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Applications by stage */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium mb-3">Applications by Stage</p>
                            {p.applications_by_stage.length === 0 ? (
                                <p className="text-xs text-slate-400 py-3">No applications yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {p.applications_by_stage.map((d, i) => {
                                        const max = p.applications_by_stage[0]?.count ?? 1;
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs mb-0.5">
                                                    <span className="text-slate-700 capitalize truncate max-w-[60%]">{d.name}</span>
                                                    <span className="font-semibold text-slate-800">{d.count}</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-slate-100">
                                                    <div className={cn('h-full rounded-full', STAGE_COLORS[i % STAGE_COLORS.length])} style={{ width: `${(d.count / max) * 100}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Open jobs */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium mb-3">Open Positions</p>
                            {p.open_jobs.length === 0 ? (
                                <EmptyState icon={Briefcase} message="No open positions" hint="Post a job to start hiring." />
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {p.open_jobs.map((j) => (
                                        <div key={j.id} className="flex items-center gap-3 py-2.5">
                                            <div className="p-1.5 rounded-lg bg-blue-50 shrink-0">
                                                <Briefcase size={13} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{j.title}</p>
                                                <p className="text-xs text-slate-400 truncate">{j.department ?? 'General'} · {j.applications} apps{j.deadline ? ` · closes ${j.deadline}` : ''}</p>
                                            </div>
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
                            <QuickAction label="Post a Job"         href="/recruitment/create" icon={Briefcase}    description="Create a new job opening" />
                            <QuickAction label="View Job Postings"  href="/recruitment"       icon={FileText}     description="Browse and manage openings" />
                            <QuickAction label="Review Candidates"  href="/recruitment"       icon={Users}        description="Shortlist and interview" />
                            <QuickAction label="Recruitment Report" href="/reports"           icon={TrendingUp}   description="Pipeline analytics" />
                        </CardContent>
                    </Card>
                </div>

                {/* Recent applications */}
                <SectionCard title="Recent Applications">
                    {p.recent_applications.length === 0 ? (
                        <EmptyState icon={UserPlus} message="No applications yet" />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {p.recent_applications.map((a) => (
                                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                                    <div className="p-1.5 rounded-lg bg-indigo-50 shrink-0">
                                        <Users size={13} className="text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{a.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{a.job} · updated {a.updated_at}</p>
                                    </div>
                                    <StatusBadge status={a.stage} />
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </AppLayout>
    );
}