import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    Building2,
    ClipboardList,
    CreditCard,
    KeyRound,
    Store,
    UserCheck,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface Recent {
    id: number;
    reference: string;
    status_label: string;
    total: number;
    currency: string;
    organization: { name: string };
    created_at: string | null;
}

interface DashboardProps {
    stats: {
        total_requests: number;
        awaiting_payment: number;
        pending_revenue: number;
        paid_revenue: number;
        paid_requests: number;
        confirmed_revenue: number;
        organizations: number;
        active_licenses: number;
        deployments: number;
        products: number;
        total_users: number;
        active_users: number;
        users_this_month: number;
    };
    currency: string;
    users_by_role: Record<string, number>;
    recent: Recent[];
}

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-blue-50 text-blue-700',
    awaiting_payment: 'bg-amber-50 text-amber-700',
    payment_confirmed: 'bg-emerald-50 text-emerald-700',
    license_issued: 'bg-purple-50 text-purple-700',
    configuration: 'bg-indigo-50 text-indigo-700',
    deployment: 'bg-cyan-50 text-cyan-700',
    training: 'bg-teal-50 text-teal-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
};

const ROLE_COLORS: Record<string, string> = {
    'Syscend Admin': 'bg-slate-900 text-white',
    Admin: 'bg-indigo-50 text-indigo-700',
    'HR Manager': 'bg-blue-50 text-blue-700',
    Manager: 'bg-cyan-50 text-cyan-700',
    Employee: 'bg-slate-100 text-slate-600',
    Recruiter: 'bg-purple-50 text-purple-700',
    Finance: 'bg-emerald-50 text-emerald-700',
};

export default function Dashboard({ stats, currency, users_by_role, recent }: DashboardProps) {
    const money = (v: number) => `${currency} ${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

    const cards = [
        { label: 'Total requests', value: stats.total_requests, icon: ClipboardList, color: 'bg-blue-600' },
        { label: 'Awaiting payment', value: stats.awaiting_payment, icon: Wallet, color: 'bg-amber-500' },
        { label: 'Organizations', value: stats.organizations, icon: Building2, color: 'bg-indigo-600' },
        { label: 'Paid orders', value: stats.paid_requests, icon: CreditCard, color: 'bg-emerald-600' },
        { label: 'Active licenses', value: stats.active_licenses, icon: KeyRound, color: 'bg-teal-600' },
        { label: 'Deployments in progress', value: stats.deployments, icon: Boxes, color: 'bg-cyan-600' },
        { label: 'Total users', value: stats.total_users, icon: Users, color: 'bg-slate-700' },
        { label: 'Active users', value: stats.active_users, icon: UserCheck, color: 'bg-sky-600' },
        { label: 'Active products', value: stats.products, icon: Store, color: 'bg-purple-600' },
    ];

    return (
        <AppLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Operations dashboard</h1>
                <p className="mt-1 text-sm text-slate-500">Who's paying, who's using the workspace — at a glance.</p>
            </div>

            {/* Revenue */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Wallet size={14} className="text-amber-500" /> Unconfirmed revenue
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{money(stats.pending_revenue)}</p>
                    <p className="text-xs text-slate-400">awaiting payment + confirmed, not yet licensed</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <CreditCard size={14} className="text-emerald-600" /> Paid
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{money(stats.paid_revenue)}</p>
                    <p className="text-xs text-slate-400">{stats.paid_requests} paid order{stats.paid_requests === 1 ? '' : 's'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Boxes size={14} className="text-blue-600" /> Licensed &amp; delivered
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{money(stats.confirmed_revenue)}</p>
                    <p className="text-xs text-slate-400">orders that moved to license issued or beyond</p>
                </div>
            </div>

            {/* Key metrics */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">{label}</p>
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${color}`}>
                                <Icon size={15} />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                    </div>
                ))}
            </div>

            {/* Users by role + recent requests */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Workspace users</h2>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            +{stats.users_this_month} this month
                        </span>
                    </div>
                    <div className="mt-4 space-y-2.5">
                        {Object.entries(users_by_role).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {role}
                                </span>
                                <span className="text-sm font-semibold text-slate-700">{count}</span>
                            </div>
                        ))}
                        {Object.keys(users_by_role).length === 0 && (
                            <p className="text-sm text-slate-400">No users yet.</p>
                        )}
                    </div>
                    <Link href="/syscend/users" className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:underline">
                        View all users <UserPlus size={14} />
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h2 className="font-semibold text-slate-900">Recent purchase requests</h2>
                        <Link href="/syscend/requests" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto"><table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-50">
                            {recent.length === 0 && (
                                <tr><td className="px-6 py-8 text-center text-slate-400">No purchase requests yet.</td></tr>
                            )}
                            {recent.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3">
                                        <Link href={`/syscend/requests/${r.id}`} className="font-mono text-xs font-semibold text-blue-600 hover:underline">
                                            {r.reference}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{r.organization.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status_label.toLowerCase().replace(' ', '_')] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {r.status_label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                                        {r.total.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table></div>
                </div>
            </div>
        </AppLayout>
    );
}