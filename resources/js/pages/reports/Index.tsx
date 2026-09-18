import { Link } from '@inertiajs/react';
import {
    BarChart2, BookOpen, CalendarDays, ChevronRight,
    CreditCard, Star, TrendingUp, Users,
} from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    summary: {
        total_employees: number;
        total_departments: number;
        last_payroll_net: number;
        last_payroll_month: string | null;
        open_leaves: number;
        training_completion: number;
    };
    headcount_by_dept: { name: string; value: number }[];
    headcount_trend: { month: string; value: number }[];
    payroll_trend: { month: string; gross: number; net: number; deductions: number }[];
    status_breakdown: Record<string, number>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return 'Le ' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

function MiniBarChart({ data, valueKey = 'value', color = 'bg-blue-500' }: {
    data: Record<string, any>[];
    valueKey?: string;
    color?: string;
}) {
    const max = Math.max(...data.map(d => d[valueKey] ?? 0), 1);
    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className={cn('w-full rounded-t transition-all', color)}
                        style={{ height: `${Math.max((d[valueKey] / max) * 52, 4)}px` }}
                        title={`${d.month ?? d.name}: ${d[valueKey]}`}
                    />
                </div>
            ))}
        </div>
    );
}

// ─── Report Nav Card ──────────────────────────────────────────────────────────

function ReportCard({ href, icon: Icon, title, description, color }: {
    href: string; icon: React.ElementType; title: string; description: string; color: string;
}) {
    return (
        <Link href={href} className="group block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
                    <Icon size={18} className="text-white" />
                </div>
                <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors mt-1" />
            </div>
            <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </Link>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportsIndex({ summary, headcount_by_dept, headcount_trend, payroll_trend, status_breakdown }: Props) {
    const totalStatus = Object.values(status_breakdown).reduce((s, v) => s + v, 0) || 1;

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports & Analytics</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Organisation-wide insights across all modules</p>
                </div>

                {/* KPI summary strip */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        { label: 'Active Employees',      value: summary.total_employees,     suffix: '' },
                        { label: 'Departments',            value: summary.total_departments,   suffix: '' },
                        { label: 'Last Payroll Net',       value: fmt(summary.last_payroll_net), suffix: summary.last_payroll_month ?? '' },
                        { label: 'Pending Leaves',         value: summary.open_leaves,         suffix: 'requests' },
                        { label: 'Training Completion',    value: summary.training_completion + '%', suffix: 'overall' },
                    ].map(kpi => (
                        <div key={kpi.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{kpi.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{kpi.label}</p>
                            {kpi.suffix && <p className="text-xs text-slate-400 dark:text-slate-500">{kpi.suffix}</p>}
                        </div>
                    ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Headcount by dept */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="px-5 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Headcount by Department</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <div className="space-y-2">
                                {headcount_by_dept.map(d => {
                                    const max = Math.max(...headcount_by_dept.map(x => x.value), 1);
                                    return (
                                        <div key={d.name}>
                                            <div className="flex justify-between text-xs mb-0.5">
                                                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[160px]">{d.name}</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{d.value}</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${(d.value / max) * 100}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Headcount trend */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="px-5 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Headcount Trend (6 months)</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <MiniBarChart data={headcount_trend} color="bg-indigo-500" />
                            <div className="flex justify-between mt-1">
                                {headcount_trend.map(d => (
                                    <span key={d.month} className="text-xs text-slate-400 dark:text-slate-500">{d.month.split(' ')[0]}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment status */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="px-5 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Employment Status</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <div className="space-y-2.5">
                                {Object.entries(status_breakdown).map(([status, count]) => {
                                    const pct = Math.round((count / totalStatus) * 100);
                                    const color = status === 'Active' ? 'bg-green-500' : status === 'Terminated' ? 'bg-red-400' : 'bg-amber-400';
                                    return (
                                        <div key={status}>
                                            <div className="flex justify-between text-xs mb-0.5">
                                                <span className="text-slate-600 dark:text-slate-400">{status}</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{count} <span className="text-slate-400">({pct}%)</span></span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payroll trend */}
                {payroll_trend.length > 0 && (
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Payroll Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            {['Month', 'Gross', 'Deductions', 'Net'].map(h => (
                                                <th key={h} className="pb-2 text-left font-medium text-slate-500 dark:text-slate-400">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payroll_trend.map((row, i) => (
                                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{row.month}</td>
                                                <td className="py-2.5 text-slate-600 dark:text-slate-400">{fmt(row.gross)}</td>
                                                <td className="py-2.5 text-red-600 dark:text-red-400">{fmt(row.deductions)}</td>
                                                <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">{fmt(row.net)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Report links */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Detailed Reports</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <ReportCard href="/reports/headcount"   icon={Users}       title="Headcount"   description="Dept breakdown, tenure, gender, recent hires" color="bg-blue-500" />
                        <ReportCard href="/reports/payroll"     icon={CreditCard}  title="Payroll"     description="Monthly payroll costs, gross vs net trends"   color="bg-green-500" />
                        <ReportCard href="/reports/attendance"  icon={BarChart2}   title="Attendance"  description="Attendance rates, late/absent by department"   color="bg-amber-500" />
                        <ReportCard href="/reports/leave"       icon={CalendarDays} title="Leave"      description="Leave usage by type, department, and month"    color="bg-purple-500" />
                        <ReportCard href="/reports/training"    icon={BookOpen}    title="Training"    description="Completion rates, scores, category breakdown"   color="bg-indigo-500" />
                        <ReportCard href="/reports/performance" icon={Star}        title="Performance" description="Cycle ratings, scores by department"            color="bg-rose-500" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
