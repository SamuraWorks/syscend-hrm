import { usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    Briefcase,
    Building2,
    CalendarDays,
    CreditCard,
    Database,
    KeyRound,
    Settings,
    Shield,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import type { PageProps } from '@/types';
import { PortalHeader, KpiCard, QuickAction, SectionCard, EmptyState } from './shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props extends PageProps {
    portal: {
        subtitle: string;
        stats: {
            total_employees: number;
            pending_leaves: number;
            open_positions: number;
            total_departments: number;
            last_payroll_net: string;
            last_payroll_month: string | null;
        };
        system: {
            users: number;
            roles: number;
            permissions: number;
            audit_logs: number;
            last_login: string | null;
        };
        license: {
            enabled: boolean;
            holder: string | null;
            key_provided: boolean;
            status: string;
        };
        early_warnings: {
            no_employees: boolean;
            no_departments: boolean;
            no_users: boolean;
        };
        recent_activity: { id: number; user: string; action: string; module: string; description: string; time: string }[];
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

export default function PortalAdmin() {
    const { auth, portal: p } = usePage<Props>().props;
    const s = p.stats;

    const cards = [
        { label: 'Total Employees', value: s.total_employees, sub: 'active workforce',   subPositive: s.total_employees > 0, icon: Users,     color: 'text-blue-600',     bg: 'bg-blue-50',   href: '/employees' },
        { label: 'Pending Leaves',  value: s.pending_leaves,  sub: 'to review',          subPositive: s.pending_leaves === 0, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50',   href: '/leaves' },
        { label: 'Open Positions',  value: s.open_positions,  sub: 'recruiting now',     subPositive: true,                    icon: Briefcase,  color: 'text-purple-600', bg: 'bg-purple-50', href: '/recruitment' },
        { label: 'Departments',     value: s.total_departments, sub: 'org structure',     subPositive: true,                    icon: Building2,  color: 'text-rose-600',   bg: 'bg-rose-50',   href: '/departments' },
        { label: 'Last Payroll Net',value: s.last_payroll_net ? `Le ${s.last_payroll_net}` : '—', sub: s.last_payroll_month ?? 'No payroll yet', subPositive: true, icon: CreditCard, color: 'text-teal-600', bg: 'bg-teal-50', href: '/payroll' },
    ];

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto">
                <PortalHeader
                    name={auth.user.name}
                    portalLabel="Admin Portal"
                    subtitle={p.subtitle}
                />

                {/* Early warnings */}
                {Object.values(p.early_warnings).some(Boolean) && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
                        <AlertCircle size={18} className="text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-800">
                            {[
                                p.early_warnings.no_users      && 'No user accounts yet — add users to assign logins.',
                                p.early_warnings.no_departments && 'No departments defined.',
                                p.early_warnings.no_employees  && 'No employee records yet.',
                            ].filter(Boolean).join(' ')}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    {cards.map((k) => (
                        <KpiCard key={k.label} {...k} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* System status */}
                    <Card className="border-slate-200">
                        <CardHeader className="border-b border-slate-100 px-5 py-3">
                            <CardTitle className="text-sm font-semibold text-slate-700">System Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50"><Users size={15} className="text-blue-600" /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">{p.system.users} user accounts</p>
                                    <p className="text-xs text-slate-400">across {p.system.roles} roles · {p.system.permissions} permissions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-50"><Database size={15} className="text-indigo-600" /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">{p.system.audit_logs} audit entries</p>
                                    <p className="text-xs text-slate-400">full activity trail recorded</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-teal-50"><KeyRound size={15} className="text-teal-600" /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">
                                        License {p.license.enabled ? p.license.status : 'not enforced'}
                                    </p>
                                    <p className="text-xs text-slate-400">{p.license.holder ?? 'No license holder set'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick actions */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4 space-y-1.5">
                            <p className="text-xs text-slate-500 font-medium mb-3">Quick Actions</p>
                            <QuickAction label="System Settings"       href="/admin/settings"   icon={Settings}     description="Branding, backup, license" />
                            <QuickAction label="Manage Users"          href="/admin/users"      icon={Users}        description="Create and edit user accounts" />
                            <QuickAction label="Roles & Permissions"   href="/admin/roles"      icon={Shield}       description="Configure access" />
                            <QuickAction label="Audit Log"             href="/admin/audit-log" icon={BarChart3}    description="Review system activity" />
                        </CardContent>
                    </Card>

                    {/* Recent activity */}
                    <Card className="border-slate-200">
                        <CardHeader className="border-b border-slate-100 px-5 py-3">
                            <CardTitle className="text-sm font-semibold text-slate-700">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {p.recent_activity.length === 0 ? (
                                <EmptyState icon={BarChart3} message="No activity yet" />
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {p.recent_activity.slice(0, 5).map((a) => (
                                        <div key={a.id} className="flex items-start gap-3 px-4 py-2.5">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-800 truncate">{a.description}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    <span className="font-medium text-slate-600">{a.user}</span> · {a.time}
                                                </p>
                                            </div>
                                            <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize shrink-0', ACTION_COLORS[a.action] ?? 'bg-slate-100 text-slate-600')}>
                                                {a.action}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <SectionCard title="System Overview" actionLabel="System settings" actionHref="/admin/settings">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-slate-100 rounded-b-lg">
                        {[
                            { label: 'Users',       value: p.system.users,         icon: Users },
                            { label: 'Roles',       value: p.system.roles,         icon: Shield },
                            { label: 'Permissions', value: p.system.permissions,   icon: KeyRound },
                            { label: 'Audit Logs',  value: p.system.audit_logs,    icon: Database },
                            { label: 'Departments', value: s.total_departments,    icon: Building2 },
                            { label: 'Employees',   value: s.total_employees,      icon: UserCheck },
                        ].map((it, i) => (
                            <div key={i} className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                                <it.icon size={16} className="text-slate-400" />
                                <p className="text-xl font-bold text-slate-900">{it.value}</p>
                                <p className="text-xs text-slate-500">{it.label}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </AppLayout>
    );
}