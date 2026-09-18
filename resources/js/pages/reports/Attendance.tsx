import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DeptRow { department: string; employees: number; avg_present: number; avg_late: number; avg_absent: number; attendance_rate: number }
interface DayRow  { date: string; present: number; late: number; absent: number }

interface Props {
    byDept: DeptRow[];
    dailyTrend: DayRow[];
    month: number; year: number; workingDays: number;
}

const MONTHS = ['', 'January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AttendanceReport({ byDept, dailyTrend, month, year, workingDays }: Props) {
    const avgRate = byDept.length ? (byDept.reduce((s, d) => s + d.attendance_rate, 0) / byDept.length).toFixed(1) : '—';
    const maxDay = Math.max(...dailyTrend.map(d => d.present + d.late), 1);

    const changeMonth = (delta: number) => {
        let m = month + delta, y = year;
        if (m > 12) { m = 1; y++; }
        if (m < 1)  { m = 12; y--; }
        router.visit(`/reports/attendance?month=${m}&year=${y}`);
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/reports" className="flex items-center gap-1.5"><ArrowLeft size={14} /> Reports</Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Attendance Report</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{MONTHS[month]} {year} · {workingDays} working days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeMonth(-1)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">←</button>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{MONTHS[month]} {year}</span>
                        <button onClick={() => changeMonth(1)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">→</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Working Days',     value: workingDays },
                        { label: 'Avg Attendance %', value: avgRate + '%' },
                        { label: 'Departments',      value: byDept.length },
                        { label: 'Total Records',    value: dailyTrend.reduce((s, d) => s + d.present + d.late + d.absent, 0) },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Daily trend chart */}
                {dailyTrend.length > 0 && (
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="px-6 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daily Attendance</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-5">
                            <div className="flex items-end gap-0.5 h-20 overflow-x-auto">
                                {dailyTrend.map(d => {
                                    const total = d.present + d.late + d.absent;
                                    const h = Math.max((total / maxDay) * 64, 4);
                                    return (
                                        <div key={d.date} className="flex flex-col items-center gap-0.5 flex-shrink-0 w-5" title={`${d.date}: ${d.present}P ${d.late}L ${d.absent}A`}>
                                            <div style={{ height: `${h}px` }} className="w-full flex flex-col overflow-hidden rounded-t">
                                                <div className="bg-green-400 dark:bg-green-600" style={{ flex: d.present }} />
                                                <div className="bg-amber-400 dark:bg-amber-600" style={{ flex: d.late }} />
                                                <div className="bg-red-400 dark:bg-red-700" style={{ flex: d.absent }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Present</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Late</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Absent</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* By dept table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">By Department</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {byDept.length === 0 ? (
                            <p className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">No attendance data for this month.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Department', 'Employees', 'Avg Present', 'Avg Late', 'Avg Absent', 'Rate'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {byDept.sort((a, b) => b.attendance_rate - a.attendance_rate).map((d, i) => (
                                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{d.department}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.employees}</td>
                                                <td className="px-4 py-3 text-green-600 dark:text-green-400">{d.avg_present}</td>
                                                <td className="px-4 py-3 text-amber-600 dark:text-amber-400">{d.avg_late}</td>
                                                <td className="px-4 py-3 text-red-600 dark:text-red-400">{d.avg_absent}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                                            <div className={cn('h-full rounded-full', d.attendance_rate >= 90 ? 'bg-green-500' : d.attendance_rate >= 70 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${d.attendance_rate}%` }} />
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{d.attendance_rate}%</span>
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
