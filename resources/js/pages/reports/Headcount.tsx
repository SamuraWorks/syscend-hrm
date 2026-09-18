import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
    byDept: { department: string; active: number; inactive: number; total: number }[];
    byGender: Record<string, number>;
    byEmploymentType: Record<string, number>;
    tenureBuckets: Record<string, number>;
    recentHires: { name: string; department: string | null; position: string | null; joined: string }[];
}

function HorizBar({ value, max, color }: { value: number; max: number; color: string }) {
    return (
        <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={cn('h-full rounded-full', color)} style={{ width: `${Math.max((value / max) * 100, 2)}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-6 text-right">{value}</span>
        </div>
    );
}

export default function HeadcountReport({ byDept, byGender, byEmploymentType, tenureBuckets, recentHires }: Props) {
    const maxDept = Math.max(...byDept.map(d => d.total), 1);
    const totalActive = byDept.reduce((s, d) => s + d.active, 0);

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/reports" className="flex items-center gap-1.5"><ArrowLeft size={14} /> Reports</Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Headcount Report</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{totalActive} active employees</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* By Dept */}
                    <div className="lg:col-span-2">
                        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">By Department</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                {['Department', 'Active', 'Inactive', 'Total', 'Distribution'].map(h => (
                                                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {byDept.map((d, i) => (
                                                <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{d.department}</td>
                                                    <td className="px-4 py-3 text-green-600 dark:text-green-400">{d.active}</td>
                                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{d.inactive}</td>
                                                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{d.total}</td>
                                                    <td className="px-4 py-3 min-w-[140px]">
                                                        <HorizBar value={d.total} max={maxDept} color="bg-blue-500" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side panels */}
                    <div className="space-y-4">
                        {/* Tenure */}
                        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                            <CardHeader className="px-5 pt-5 pb-3">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tenure Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 space-y-2.5">
                                {Object.entries(tenureBuckets).map(([label, count]) => {
                                    const max = Math.max(...Object.values(tenureBuckets), 1);
                                    return (
                                        <div key={label}>
                                            <div className="flex justify-between text-xs mb-0.5">
                                                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{count}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(count / max) * 100}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Gender */}
                        {Object.keys(byGender).length > 0 && (
                            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                                <CardHeader className="px-5 pt-5 pb-3">
                                    <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">By Gender</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 space-y-2">
                                    {Object.entries(byGender).map(([g, count]) => {
                                        const total = Object.values(byGender).reduce((s, v) => s + v, 1);
                                        return (
                                            <div key={g} className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 capitalize">{g}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{count}</span>
                                                    <span className="text-xs text-slate-400">({Math.round(count / total * 100)}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}

                        {/* Employment type */}
                        {Object.keys(byEmploymentType).length > 0 && (
                            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                                <CardHeader className="px-5 pt-5 pb-3">
                                    <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Employment Type</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 space-y-2">
                                    {Object.entries(byEmploymentType).map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-400 capitalize">{type}</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{count}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Recent hires */}
                {recentHires.length > 0 && (
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Hires (last 30 days)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        {['Name', 'Department', 'Position', 'Joined'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentHires.map((h, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{h.name}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{h.department ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{h.position ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{h.joined}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
