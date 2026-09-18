import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronRight, Play } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthOption {
    value: number;
    label: string;
}

interface Props {
    months: MonthOption[];
    current_month: number;
    current_year: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreatePayrollRun({ months, current_month, current_year }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        month: current_month,
        year: current_year,
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/payroll/runs');
    }

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
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                        Run Payroll
                    </span>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href="/payroll">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Run Payroll
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Generate payroll for the selected period
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Payroll Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Month */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="month"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Month <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="month"
                                    value={data.month}
                                    onChange={(e) => setData('month', Number(e.target.value))}
                                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                >
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.month && (
                                    <p className="text-xs text-red-500">{errors.month}</p>
                                )}
                            </div>

                            {/* Year */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="year"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Year <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="year"
                                    type="number"
                                    min={2020}
                                    max={2099}
                                    value={data.year}
                                    onChange={(e) => setData('year', Number(e.target.value))}
                                    className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                                />
                                {errors.year && (
                                    <p className="text-xs text-red-500">{errors.year}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="notes"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Notes
                                </Label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    placeholder="Optional notes for this payroll run..."
                                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                                />
                                {errors.notes && (
                                    <p className="text-xs text-red-500">{errors.notes}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link href="/payroll">Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Play className="mr-1.5 h-4 w-4" />
                                    {processing ? 'Running...' : 'Run Payroll'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
