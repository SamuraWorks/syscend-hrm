import { Link, router, useForm } from '@inertiajs/react';
import { ChevronRight, Edit2, Users, X } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeSalary {
    id: number;
    name: string;
    employee_id: string;
    department: string;
    position: string;
    basic_salary: number | null;
    structure: string | null;
    effective_date: string | null;
}

interface SalaryStructure {
    id: number;
    name: string;
}

interface Props {
    employees: EmployeeSalary[];
    structures: SalaryStructure[];
}

// ─── Inline Form ──────────────────────────────────────────────────────────────

function AssignForm({
    employee,
    structures,
    onClose,
}: {
    employee: EmployeeSalary;
    structures: SalaryStructure[];
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: employee.id,
        basic_salary: employee.basic_salary ? String(employee.basic_salary) : '',
        salary_structure_id: '',
        effective_date: employee.effective_date ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/payroll/salaries', {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    }

    return (
        <tr className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30">
            <td colSpan={7} className="px-4 py-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Basic Salary <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.basic_salary}
                                onChange={(e) => setData('basic_salary', e.target.value)}
                                placeholder="0.00"
                                required
                                className="h-8 w-36 text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                            />
                            {errors.basic_salary && (
                                <p className="text-xs text-red-500">{errors.basic_salary}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Salary Structure <span className="text-red-500">*</span>
                            </Label>
                            <select
                                value={data.salary_structure_id}
                                onChange={(e) => setData('salary_structure_id', e.target.value)}
                                required
                                className="h-8 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select structure...</option>
                                {structures.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {errors.salary_structure_id && (
                                <p className="text-xs text-red-500">{errors.salary_structure_id}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Effective Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={data.effective_date}
                                onChange={(e) => setData('effective_date', e.target.value)}
                                required
                                className="h-8 w-40 text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                            />
                            {errors.effective_date && (
                                <p className="text-xs text-red-500">{errors.effective_date}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {processing ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </form>
            </td>
        </tr>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalariesIndex({ employees, structures }: Props) {
    const [openId, setOpenId] = useState<number | null>(null);

    function toggleForm(id: number) {
        setOpenId((prev) => (prev === id ? null : id));
    }

    function formatCurrency(amount: number | null): string {
        if (amount == null) return '—';
        return 'Le ' + amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
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
                        Employee Salaries
                    </span>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Employee Salaries
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Assign or update salary structures and basic pay for employees
                    </p>
                </div>

                {/* Table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            All Employees ({employees.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {employees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    No employees found.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {[
                                                'Employee', 'ID', 'Department',
                                                'Current Structure', 'Basic Salary',
                                                'Effective Date', 'Action',
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
                                        {employees.map((emp, idx) => (
                                            <>
                                                <tr
                                                    key={emp.id}
                                                    className={cn(
                                                        'border-b border-slate-100 dark:border-slate-800 transition-colors',
                                                        openId === emp.id
                                                            ? 'bg-blue-50/30 dark:bg-blue-900/10'
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40',
                                                        openId !== emp.id && idx === employees.length - 1 && 'border-b-0',
                                                    )}
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                            {emp.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                                            {emp.position}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                        {emp.employee_id}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                        {emp.department ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                        {emp.structure ? (
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                                                                {emp.structure}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-slate-500 text-xs">
                                                                Not assigned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                        {formatCurrency(emp.basic_salary)}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                        {emp.effective_date ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            variant={openId === emp.id ? 'default' : 'outline'}
                                                            size="sm"
                                                            className={cn(
                                                                'h-8',
                                                                openId === emp.id
                                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                    : '',
                                                            )}
                                                            onClick={() => toggleForm(emp.id)}
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                                                            {emp.basic_salary ? 'Update' : 'Assign'}
                                                        </Button>
                                                    </td>
                                                </tr>

                                                {/* Inline form */}
                                                {openId === emp.id && (
                                                    <AssignForm
                                                        key={`form-${emp.id}`}
                                                        employee={emp}
                                                        structures={structures}
                                                        onClose={() => setOpenId(null)}
                                                    />
                                                )}
                                            </>
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
