import { router } from '@inertiajs/react';
import { CreditCard, Download, TrendingDown, TrendingUp, Wallet, Calendar } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Payslip {
    id: number;
    payroll_run_id: number;
    month: number;
    year: number;
    month_label: string;
    basic_salary: number;
    gross_salary: number;
    total_earnings: number;
    total_deductions: number;
    tax_amount: number;
    net_salary: number;
    working_days: number;
    paid_days: number;
    status: string;
    paid_at: string | null;
}

interface Props {
    payslips: Payslip[];
    hasEmployee: boolean;
    employee?: { name: string; employee_id: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return 'Le ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_STYLE: Record<string, string> = {
    paid:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    draft:   'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function MyPayslips({ payslips, hasEmployee, employee }: Props) {
    if (!hasEmployee) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                        <CreditCard size={28} className="text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Employee Record Linked</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                        Your account isn't linked to an employee profile. Contact HR to set this up.
                    </p>
                </div>
            </AppLayout>
        );
    }

    const latest   = payslips[0] ?? null;
    const totalPaid = payslips.filter(p => p.status === 'paid').reduce((s, p) => s + p.net_salary, 0);
    const avgNet   = payslips.length > 0 ? payslips.reduce((s, p) => s + p.net_salary, 0) / payslips.length : 0;

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Payslips</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {employee?.name} · {employee?.employee_id}
                    </p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Payslips',  value: payslips.length,    icon: CreditCard, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
                        { label: 'Latest Net Pay',  value: latest ? fmt(latest.net_salary) : '—', icon: Wallet, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
                        { label: 'Avg Net Pay',     value: fmt(avgNet),        icon: TrendingUp,  color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                        { label: 'Total Earned',    value: fmt(totalPaid),     icon: Calendar,    color: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-50 dark:bg-teal-900/30' },
                    ].map(k => (
                        <Card key={k.label} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{k.label}</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 leading-tight">{k.value}</p>
                                    </div>
                                    <div className={cn('p-2 rounded-xl shrink-0', k.bg)}>
                                        <k.icon size={16} className={k.color} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Payslips list */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payslip History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {payslips.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center">
                                <CreditCard size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No payslips yet</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Payslips will appear here once payroll is processed</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                            {['Period', 'Basic', 'Earnings', 'Deductions', 'Tax', 'Net Pay', 'Days', 'Status', ''].map(h => (
                                                <th key={h} className="text-left px-4 py-3 font-medium text-slate-500 text-xs whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {payslips.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{p.month_label}</p>
                                                    {p.paid_at && <p className="text-xs text-slate-400">Paid {p.paid_at}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(p.basic_salary)}</td>
                                                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <span className="flex items-center gap-1"><TrendingUp size={11} />{fmt(p.total_earnings)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-red-500 dark:text-red-400">
                                                    <span className="flex items-center gap-1"><TrendingDown size={11} />{fmt(p.total_deductions)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{fmt(p.tax_amount)}</td>
                                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{fmt(p.net_salary)}</td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{p.paid_days}/{p.working_days}d</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', STATUS_STYLE[p.status] ?? STATUS_STYLE.draft)}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => router.visit(`/payroll/runs/${p.payroll_run_id}/payslips/${p.id}`)}
                                                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        <Download size={12} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
