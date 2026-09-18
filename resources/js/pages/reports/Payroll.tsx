import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RunRow {
    month: string; month_num: number; status: string;
    employees: number; gross: number; deductions: number; net: number;
}
interface Props {
    runs: RunRow[];
    summary: { total_gross: number; total_net: number; total_deductions: number; avg_per_employee: number; runs_count: number };
    year: number;
    availableYears: number[];
}

function fmt(n: number) { return 'Le ' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const STATUS_STYLE: Record<string, string> = {
    draft:    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    paid:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default function PayrollReport({ runs, summary, year, availableYears }: Props) {
    const maxNet = Math.max(...runs.map(r => r.net), 1);

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/reports" className="flex items-center gap-1.5"><ArrowLeft size={14} /> Reports</Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Payroll Report</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{year}</p>
                        </div>
                    </div>
                    <select
                        value={year}
                        onChange={e => router.visit(`/reports/payroll?year=${e.target.value}`)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Total Gross',          value: fmt(summary.total_gross) },
                        { label: 'Total Net',             value: fmt(summary.total_net) },
                        { label: 'Total Deductions',      value: fmt(summary.total_deductions) },
                        { label: 'Avg Net / Run',         value: fmt(summary.avg_per_employee) },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Bar chart */}
                {runs.length > 0 && (
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="px-6 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Net Pay by Month</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-5">
                            <div className="flex items-end gap-2 h-24">
                                {runs.map(r => (
                                    <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className="w-full rounded-t bg-blue-500 dark:bg-blue-600 transition-all"
                                            style={{ height: `${Math.max((r.net / maxNet) * 80, 4)}px` }}
                                            title={`${r.month}: ${fmt(r.net)}`}
                                        />
                                        <span className="text-xs text-slate-400 dark:text-slate-500">{r.month.slice(0, 3)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Runs table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Monthly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {runs.length === 0 ? (
                            <p className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">No payroll runs for {year}.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Month', 'Status', 'Employees', 'Gross', 'Deductions', 'Net'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {runs.map((r, i) => (
                                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{r.month}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[r.status] ?? ''}`}>{r.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.employees}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(r.gross)}</td>
                                                <td className="px-4 py-3 text-red-600 dark:text-red-400">{fmt(r.deductions)}</td>
                                                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{fmt(r.net)}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold">
                                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200" colSpan={3}>Total</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{fmt(summary.total_gross)}</td>
                                            <td className="px-4 py-3 text-red-600 dark:text-red-400">{fmt(summary.total_deductions)}</td>
                                            <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{fmt(summary.total_net)}</td>
                                        </tr>
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
