import { Link, router } from '@inertiajs/react';
import { ChevronRight, Pencil, Plus, Settings2, Trash2 } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalaryComponent {
    id: number;
    name: string;
    code: string;
    type: 'earning' | 'deduction' | 'tax';
    calculation_type: 'fixed' | 'percentage_of_basic' | 'percentage_of_gross';
    value: number;
    is_taxable: boolean;
    is_active: boolean;
}

interface Props {
    components: SalaryComponent[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
    earning:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    deduction: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    tax:       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const CALC_TYPE_LABELS: Record<string, string> = {
    fixed:                'Fixed Amount',
    percentage_of_basic:  '% of Basic',
    percentage_of_gross:  '% of Gross',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComponentsIndex({ components }: Props) {
    function handleDelete(id: number, name: string) {
        if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
            router.delete(`/payroll/components/${id}`, { preserveScroll: true });
        }
    }

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
                        Components
                    </span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Salary Components
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Define earnings, deductions and tax components
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        asChild
                    >
                        <Link href="/payroll/components/create">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Component
                        </Link>
                    </Button>
                </div>

                {/* Table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            All Components
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {components.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Settings2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    No salary components yet.
                                </p>
                                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                                    Add your first component to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Name', 'Code', 'Type', 'Calc Type', 'Value', 'Active', 'Actions'].map((col) => (
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
                                        {components.map((comp, idx) => (
                                            <tr
                                                key={comp.id}
                                                className={cn(
                                                    'border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40',
                                                    idx === components.length - 1 && 'border-b-0',
                                                )}
                                            >
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                                    {comp.name}
                                                    {comp.is_taxable && (
                                                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                                            Taxable
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {comp.code}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                                            TYPE_BADGE[comp.type],
                                                        )}
                                                    >
                                                        {comp.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {CALC_TYPE_LABELS[comp.calculation_type] ?? comp.calculation_type}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    {comp.calculation_type === 'fixed'
                                                        ? `Le ${comp.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                                        : `${comp.value}%`}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                            comp.is_active
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                                                        )}
                                                    >
                                                        {comp.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                            asChild
                                                        >
                                                            <Link href={`/payroll/components/${comp.id}/edit`}>
                                                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                            onClick={() => handleDelete(comp.id, comp.name)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
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
