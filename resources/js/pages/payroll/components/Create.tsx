import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateComponent() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        type: 'earning',
        calculation_type: 'fixed',
        value: '',
        description: '',
        is_taxable: false,
        is_active: true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/payroll/components');
    }

    const valueHint =
        data.calculation_type === 'fixed'
            ? 'Fixed amount (Le)'
            : 'Percentage (%)';

    return (
        <AppLayout>
            <div className="space-y-6 p-6 max-w-2xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Link
                        href="/payroll"
                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        Payroll
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link
                        href="/payroll/components"
                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        Components
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                        Add Component
                    </span>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href="/payroll/components">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Add Salary Component
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Define a new earnings, deduction or tax component
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Component Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Basic Salary"
                                    required
                                    className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            {/* Code */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="e.g. basic_salary"
                                    required
                                    className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 font-mono"
                                />
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    e.g. basic_salary, hra
                                </p>
                                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                            </div>

                            {/* Type + Calculation Type */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Type <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="earning">Earning</option>
                                        <option value="deduction">Deduction</option>
                                        <option value="tax">Tax</option>
                                    </select>
                                    {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Calculation Type <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        value={data.calculation_type}
                                        onChange={(e) => setData('calculation_type', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="fixed">Fixed</option>
                                        <option value="percentage_of_basic">% of Basic</option>
                                        <option value="percentage_of_gross">% of Gross</option>
                                    </select>
                                    {errors.calculation_type && (
                                        <p className="text-xs text-red-500">{errors.calculation_type}</p>
                                    )}
                                </div>
                            </div>

                            {/* Value */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Value <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.value}
                                    onChange={(e) => setData('value', e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                                />
                                <p className="text-xs text-slate-400 dark:text-slate-500">{valueHint}</p>
                                {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description
                                </Label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    placeholder="Optional description..."
                                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                                {errors.description && (
                                    <p className="text-xs text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Is Taxable */}
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={data.is_taxable}
                                            onChange={(e) => setData('is_taxable', e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div
                                            className={cn(
                                                'h-5 w-9 rounded-full transition-colors',
                                                data.is_taxable
                                                    ? 'bg-blue-600'
                                                    : 'bg-slate-300 dark:bg-slate-600',
                                            )}
                                        />
                                        <div
                                            className={cn(
                                                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                                                data.is_taxable ? 'left-[18px]' : 'left-0.5',
                                            )}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Is Taxable
                                    </span>
                                </label>

                                {/* Is Active */}
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div
                                            className={cn(
                                                'h-5 w-9 rounded-full transition-colors',
                                                data.is_active
                                                    ? 'bg-blue-600'
                                                    : 'bg-slate-300 dark:bg-slate-600',
                                            )}
                                        />
                                        <div
                                            className={cn(
                                                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                                                data.is_active ? 'left-[18px]' : 'left-0.5',
                                            )}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Is Active
                                    </span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <Button variant="outline" type="button" asChild>
                                    <Link href="/payroll/components">Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {processing ? 'Saving...' : 'Save Component'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
