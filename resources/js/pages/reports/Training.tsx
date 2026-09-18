import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
    byCourse: { course: string; category: string | null; sessions: number; total_enrollments: number; completions: number; completion_rate: number }[];
    byStatus: Record<string, number>;
    byCategory: { category: string; enrollments: number; completions: number; completion_rate: number }[];
    summary: { total_courses: number; total_sessions: number; total_enrollments: number; completions: number; avg_score: number; completion_rate: number };
}

export default function TrainingReport({ byCourse, byStatus, byCategory, summary }: Props) {
    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/reports" className="flex items-center gap-1.5"><ArrowLeft size={14} /> Reports</Link>
                    </Button>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Training Report</h1>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        { label: 'Active Courses',   value: summary.total_courses },
                        { label: 'Sessions',          value: summary.total_sessions },
                        { label: 'Total Enrolled',    value: summary.total_enrollments },
                        { label: 'Completions',       value: summary.completions },
                        { label: 'Completion Rate',   value: summary.completion_rate + '%' },
                        { label: 'Avg Score',         value: summary.avg_score > 0 ? summary.avg_score + '/100' : '—' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Enrollment status donut-like */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="px-6 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enrollment Status</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-5 space-y-2.5">
                            {Object.entries(byStatus).map(([status, count]) => {
                                const total = Object.values(byStatus).reduce((s, v) => s + v, 1);
                                const pct = Math.round(count / total * 100);
                                const color = { enrolled: 'bg-blue-500', completed: 'bg-green-500', dropped: 'bg-slate-400', failed: 'bg-red-500' }[status] ?? 'bg-slate-400';
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-xs mb-0.5">
                                            <span className="text-slate-600 dark:text-slate-400 capitalize">{status}</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{count} <span className="text-slate-400">({pct}%)</span></span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* By category */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">By Category</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        {['Category', 'Enrolled', 'Completed', 'Rate'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {byCategory.map((c, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.category}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.enrollments}</td>
                                            <td className="px-4 py-3 text-green-600 dark:text-green-400">{c.completions}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('font-semibold text-sm', c.completion_rate >= 75 ? 'text-green-600 dark:text-green-400' : c.completion_rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400')}>
                                                    {c.completion_rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Per course table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Course Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        {['Course', 'Category', 'Sessions', 'Enrolled', 'Completed', 'Rate'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {byCourse.sort((a, b) => b.total_enrollments - a.total_enrollments).map((c, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.course}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.category ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.sessions}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.total_enrollments}</td>
                                            <td className="px-4 py-3 text-green-600 dark:text-green-400">{c.completions}</td>
                                            <td className="px-4 py-3 font-semibold">
                                                <span className={c.completion_rate >= 75 ? 'text-green-600 dark:text-green-400' : c.completion_rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                                                    {c.completion_rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
