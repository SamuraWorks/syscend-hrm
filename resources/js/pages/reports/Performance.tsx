import { Link } from '@inertiajs/react';
import { ArrowLeft, Star } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
    cycleSummaries: { id: number; name: string; status: string; start_date: string; end_date: string; ratings_count: number; avg_score: number }[];
    ratingsByLabel: Record<string, number>;
    byDept: { department: string; avg_score: number; count: number }[];
    latestCycle: { id: number; name: string } | null;
}

const LABEL_COLORS: Record<string, string> = {
    Outstanding: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Excellent:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    Good:        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Average:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Poor:        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function ScoreBar({ score }: { score: number }) {
    const pct = (score / 5) * 100;
    const color = score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-blue-500' : score >= 2 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                <Star size={12} className="fill-amber-400 text-amber-400" /> {score.toFixed(2)}
            </span>
        </div>
    );
}

export default function PerformanceReport({ cycleSummaries, ratingsByLabel, byDept, latestCycle }: Props) {
    const totalRatings = Object.values(ratingsByLabel).reduce((s, v) => s + v, 1);

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/reports" className="flex items-center gap-1.5"><ArrowLeft size={14} /> Reports</Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Performance Report</h1>
                        {latestCycle && <p className="text-sm text-slate-500 dark:text-slate-400">Latest: {latestCycle.name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Rating distribution */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="px-6 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Rating Distribution {latestCycle ? `— ${latestCycle.name}` : ''}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-5 space-y-3">
                            {Object.keys(ratingsByLabel).length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500">No finalised ratings yet.</p>
                            ) : (
                                ['Outstanding', 'Excellent', 'Good', 'Average', 'Poor'].map(label => {
                                    const count = ratingsByLabel[label] ?? 0;
                                    if (count === 0) return null;
                                    const pct = Math.round(count / totalRatings * 100);
                                    return (
                                        <div key={label}>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', LABEL_COLORS[label])}>{label}</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{count} <span className="text-slate-400">({pct}%)</span></span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    {/* By dept */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Avg Score by Department</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {byDept.length === 0 ? (
                                <p className="p-6 text-sm text-slate-400 dark:text-slate-500">No data available.</p>
                            ) : (
                                <div className="overflow-x-auto"><table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Department', 'Employees', 'Avg Score'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {byDept.sort((a, b) => b.avg_score - a.avg_score).map((d, i) => (
                                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{d.department}</td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{d.count}</td>
                                                <td className="px-4 py-3"><ScoreBar score={d.avg_score} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table></div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Cycles summary */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Cycle Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    {['Cycle', 'Period', 'Status', 'Finalised', 'Avg Score'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cycleSummaries.map((c, i) => (
                                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                            <Link href={`/performance/cycles/${c.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">{c.name}</Link>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{c.start_date} — {c.end_date}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                                c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            )}>{c.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.ratings_count}</td>
                                        <td className="px-4 py-3">
                                            {c.avg_score > 0 ? <ScoreBar score={c.avg_score} /> : <span className="text-slate-400 dark:text-slate-500">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table></div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
