import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    CreditCard,
    Download,
    Eye,
    RefreshCw,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PayslipLine {
    name: string;
    type: 'earning' | 'deduction' | 'tax';
    amount: number;
}

interface Payslip {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_code: string;
    department: string;
    basic_salary: number;
    gross_salary: number;
    total_earnings: number;
    total_deductions: number;
    tax_amount: number;
    net_salary: number;
    working_days: number;
    paid_days: number;
    status: string;
    lines: PayslipLine[];
}

interface PayrollRun {
    id: number;
    title: string;
    month: number;
    year: number;
    status: 'draft' | 'approved' | 'paid';
    total_employees: number;
    total_gross: number;
    total_deductions: number;
    total_net: number;
}

interface Props {
    run: PayrollRun;
    payslips: Payslip[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
    return 'Le ' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

const PAYSLIP_STATUS_STYLES: Record<string, string> = {
    pending:  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    paid:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    valueClass,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    valueClass?: string;
}) {
    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {label}
                        </p>
                        <p className={cn('mt-1 text-xl font-bold', valueClass ?? 'text-slate-900 dark:text-slate-100')}>
                            {value}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2.5">
                        <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShowPayrollRun({ run, payslips }: Props) {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    function toggleExpand(id: number) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function handlePost(url: string) {
        router.post(url, {}, { preserveScroll: true });
    }

    function handleDelete() {
        if (confirm('Are you sure you want to delete this payroll run? This action cannot be undone.')) {
            router.delete(`/payroll/runs/${run.id}`);
        }
    }

    const RUN_STATUS_STYLES: Record<string, string> = {
        draft:    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
        approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        paid:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Link
                        href="/payroll"
                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        Payroll
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                        {run.title}
                    </span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {run.title}
                        </h1>
                        <span
                            className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                RUN_STATUS_STYLES[run.status],
                            )}
                        >
                            {run.status}
                        </span>
                    </div>

                    {/* Action buttons based on status */}
                    <div className="flex items-center gap-2">
                        <a
                            href={`/payroll/runs/${run.id}/export`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <Download size={14} /> Export
                        </a>
                        {run.status === 'draft' && (
                            <>
                                <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={() => handlePost(`/payroll/runs/${run.id}/regenerate`)}>
                                    <RefreshCw size={14} /> Regenerate
                                </Button>
                                <Button size="sm" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handlePost(`/payroll/runs/${run.id}/approve`)}>
                                    <CheckCircle size={14} /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="flex items-center gap-1.5 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={handleDelete}>
                                    <Trash2 size={14} /> Delete
                                </Button>
                            </>
                        )}
                        {run.status === 'approved' && (
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handlePost(`/payroll/runs/${run.id}/mark-paid`)}
                            >
                                <CreditCard size={14} />
                                Mark as Paid
                            </Button>
                        )}
                        {run.status === 'paid' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-300">
                                <CheckCircle className="h-4 w-4" />
                                Paid
                            </span>
                        )}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Employees"
                        value={String(run.total_employees)}
                        icon={Users}
                    />
                    <StatCard
                        label="Total Gross"
                        value={formatCurrency(run.total_gross)}
                        icon={CreditCard}
                        valueClass="text-slate-900 dark:text-slate-100"
                    />
                    <StatCard
                        label="Total Deductions"
                        value={formatCurrency(run.total_deductions)}
                        icon={AlertTriangle}
                        valueClass="text-red-600 dark:text-red-400"
                    />
                    <StatCard
                        label="Total Net"
                        value={formatCurrency(run.total_net)}
                        icon={CheckCircle}
                        valueClass="text-green-600 dark:text-green-400"
                    />
                </div>

                {/* Payslips Table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Payslips ({payslips.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {payslips.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    No payslips generated.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {[
                                                '', 'Employee', 'Code', 'Department',
                                                'Basic', 'Earnings', 'Deductions', 'Tax',
                                                'Net', 'Days', 'Status', '',
                                            ].map((col, i) => (
                                                <th
                                                    key={i}
                                                    className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payslips.map((slip, idx) => {
                                            const isExpanded = expandedIds.has(slip.id);
                                            return (
                                                <>
                                                    <tr
                                                        key={slip.id}
                                                        onClick={() => toggleExpand(slip.id)}
                                                        className={cn(
                                                            'cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40',
                                                            isExpanded && 'bg-slate-50 dark:bg-slate-800/40',
                                                            idx === payslips.length - 1 && !isExpanded && 'border-b-0',
                                                        )}
                                                    >
                                                        <td className="px-4 py-3 text-slate-400 dark:text-slate-500">
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                            {slip.employee_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                                            {slip.employee_code}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                            {slip.department}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                            {formatCurrency(slip.basic_salary)}
                                                        </td>
                                                        <td className="px-4 py-3 text-green-600 dark:text-green-400 whitespace-nowrap">
                                                            {formatCurrency(slip.total_earnings)}
                                                        </td>
                                                        <td className="px-4 py-3 text-red-600 dark:text-red-400 whitespace-nowrap">
                                                            {formatCurrency(slip.total_deductions)}
                                                        </td>
                                                        <td className="px-4 py-3 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                                                            {formatCurrency(slip.tax_amount)}
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                            {formatCurrency(slip.net_salary)}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                            {slip.paid_days}/{slip.working_days}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={cn(
                                                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                                                    PAYSLIP_STATUS_STYLES[slip.status] ??
                                                                        'bg-slate-100 text-slate-600',
                                                                )}
                                                            >
                                                                {slip.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            <Link
                                                                href={`/payroll/runs/${run.id}/payslips/${slip.id}`}
                                                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                                                            >
                                                                <Eye size={13} /> View
                                                            </Link>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded lines */}
                                                    {isExpanded && (
                                                        <tr
                                                            key={`${slip.id}-lines`}
                                                            className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20"
                                                        >
                                                            <td colSpan={11} className="px-8 py-4">
                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                                    {(['earning', 'deduction', 'tax'] as const).map((type) => {
                                                                        const filtered = slip.lines.filter((l) => l.type === type);
                                                                        if (filtered.length === 0) return null;
                                                                        const TYPE_LABELS = {
                                                                            earning: 'Earnings',
                                                                            deduction: 'Deductions',
                                                                            tax: 'Taxes',
                                                                        };
                                                                        const TYPE_COLORS = {
                                                                            earning: 'text-green-700 dark:text-green-400',
                                                                            deduction: 'text-red-700 dark:text-red-400',
                                                                            tax: 'text-amber-700 dark:text-amber-400',
                                                                        };
                                                                        return (
                                                                            <div key={type}>
                                                                                <p className={cn('text-xs font-semibold uppercase tracking-wide mb-2', TYPE_COLORS[type])}>
                                                                                    {TYPE_LABELS[type]}
                                                                                </p>
                                                                                <div className="space-y-1">
                                                                                    {filtered.map((line, li) => (
                                                                                        <div
                                                                                            key={li}
                                                                                            className="flex justify-between text-xs text-slate-600 dark:text-slate-400"
                                                                                        >
                                                                                            <span>{line.name}</span>
                                                                                            <span className="font-medium">
                                                                                                {formatCurrency(line.amount)}
                                                                                            </span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
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
