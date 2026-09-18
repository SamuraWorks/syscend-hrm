import { Link, router } from '@inertiajs/react';
import {
    Building2,
    ChevronRight,
    CreditCard,
    Eye,
    LayoutList,
    Play,
    Settings2,
    Users,
} from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

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
    run_by: string;
    created_at: string;
}

interface Props {
    runs: PayrollRun[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function formatCurrency(amount: number): string {
    return 'Le ' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

const STATUS_STYLES: Record<string, string> = {
    draft:    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    paid:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PayrollIndex({ runs }: Props) {
    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Payroll
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Manage monthly payroll runs
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/payroll/components" className="flex items-center gap-1.5">
                                <Settings2 size={14} /> Salary Components
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/payroll/structures" className="flex items-center gap-1.5">
                                <LayoutList size={14} /> Structures
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/payroll/salaries" className="flex items-center gap-1.5">
                                <Users size={14} /> Employee Salaries
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            asChild
                        >
                            <Link href="/payroll/runs/create" className="flex items-center gap-1.5">
                                <Play size={14} /> Run Payroll
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Payroll Runs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {runs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <CreditCard className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    No payroll runs yet.
                                </p>
                                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                                    Click "Run Payroll" to create your first payroll run.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {[
                                                'Title', 'Month / Year', 'Employees',
                                                'Gross', 'Deductions', 'Net',
                                                'Status', 'Run By', 'Actions',
                                            ].map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {runs.map((run, idx) => (
                                            <tr
                                                key={run.id}
                                                className={cn(
                                                    'border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40',
                                                    idx === runs.length - 1 && 'border-b-0',
                                                )}
                                            >
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                                    {run.title}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {MONTH_NAMES[run.month]} {run.year}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    {run.total_employees}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {formatCurrency(run.total_gross)}
                                                </td>
                                                <td className="px-4 py-3 text-red-600 dark:text-red-400 whitespace-nowrap">
                                                    {formatCurrency(run.total_deductions)}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                    {formatCurrency(run.total_net)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                                            STATUS_STYLES[run.status],
                                                        )}
                                                    >
                                                        {run.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    {run.run_by}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                        asChild
                                                    >
                                                        <Link href={`/payroll/runs/${run.id}`}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Link>
                                                    </Button>
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
