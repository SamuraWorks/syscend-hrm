import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    byType: { type: string; approved: number; pending: number; rejected: number; total_days: number }[];
    byDept: { department: string; requests: number; days: number }[];
    monthlyTrend: { month: string; requests: number; days: number }[];
    year: number;
    availableYears: number[];
}

export default function LeaveReport({ byType, byDept, monthlyTrend, year, availableYears }: Props) {
    const totalApproved = byType.reduce((s, t) => s + t.approved, 0);
    const totalDays     = byType.reduce((s, t) => s + t.total_days, 0);
    const maxMonth      = Math.max(...monthlyTrend.map(m => m.days), 1);

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/reports" className="flex items-center gap-1.5"><ArrowLeft size={14} /> Reports</Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Leave Report</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{year}</p>
                        </div>
                    </div>
                    <select value={year} onChange={e => router.visit(`/reports/leave?year=${e.target.value}`)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Approved Requests', value: totalApproved },
                        { label: 'Total Days Taken',  value: totalDays.toFixed(1) },
                        { label: 'Leave Types',        value: byType.length },
                        { label: 'Departments',        value: byDept.length },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* By type */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">By Leave Type</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto"><table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        {['Type', 'Approved', 'Pending', 'Rejected', 'Days'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {byType.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">No data for {year}.</td></tr>
                                    ) : byType.map((t, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{t.type}</td>
                                            <td className="px-4 py-3 text-green-600 dark:text-green-400">{t.approved}</td>
                                            <td className="px-4 py-3 text-amber-600 dark:text-amber-400">{t.pending}</td>
                                            <td className="px-4 py-3 text-red-600 dark:text-red-400">{t.rejected}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{t.total_days}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table></div>
                        </CardContent>
                    </Card>

                    {/* Monthly trend */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="px-6 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Days Taken</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-5">
                            <div className="flex items-end gap-1.5 h-20">
                                {monthlyTrend.map(m => (
                                    <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                                        <div
                                            className="w-full rounded-t bg-purple-400 dark:bg-purple-600"
                                            style={{ height: `${Math.max((m.days / maxMonth) * 64, m.days > 0 ? 4 : 0)}px` }}
                                            title={`${m.month}: ${m.days} days`}
                                        />
                                        <span className="text-xs text-slate-400 dark:text-slate-500">{m.month}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* By dept */}
                {byDept.length > 0 && (
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">By Department</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto"><table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        {['Department', 'Requests', 'Days Taken'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {byDept.sort((a, b) => b.days - a.days).map((d, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{d.department}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.requests}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{d.days}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table></div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
