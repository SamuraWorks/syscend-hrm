import { router, useForm, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    CalendarCheck, CalendarDays, ChevronLeft, ChevronRight,
    Clock, List, Plus, Trash2, X, BadgeCheck, Timer, XCircle,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee { id: number; name: string; employee_id: string; }
interface ShiftRef  { id: number; name: string; color: string; }
interface AttendanceRecord {
    id: number; date: string;
    employee: Employee | null;
    shift: ShiftRef | null;
    check_in: string | null;
    check_out: string | null;
    worked_minutes: number | null;
    status: string;
    notes: string | null;
}

interface Props {
    records: AttendanceRecord[];
    employees: Employee[];
    shifts: ShiftRef[];
    month: string;
    selected_employee: number | null;
    canManage: boolean;
    myEmployee: { id: number; name: string; employee_id: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
    present:  { bg: 'bg-green-100 dark:bg-green-950',  text: 'text-green-700 dark:text-green-400',  dot: 'bg-green-500'  },
    absent:   { bg: 'bg-red-100 dark:bg-red-950',      text: 'text-red-700 dark:text-red-400',      dot: 'bg-red-500'    },
    late:     { bg: 'bg-amber-100 dark:bg-amber-950',  text: 'text-amber-700 dark:text-amber-400',  dot: 'bg-amber-500'  },
    half_day: { bg: 'bg-orange-100 dark:bg-orange-950',text: 'text-orange-700 dark:text-orange-400',dot: 'bg-orange-500' },
    on_leave: { bg: 'bg-blue-100 dark:bg-blue-950',    text: 'text-blue-700 dark:text-blue-400',    dot: 'bg-blue-500'   },
};

const STATUS_ICON: Record<string, React.ElementType> = {
    present: BadgeCheck, late: Timer, absent: XCircle,
    half_day: Clock, on_leave: CalendarDays,
};

function fmtMinutes(m: number | null) {
    if (!m) return '—';
    const h = Math.floor(m / 60), min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

function shiftMonth(m: string, dir: number) {
    const [y, mo] = m.split('-').map(Number);
    const d = new Date(y, mo - 1 + dir, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(m: string) {
    const [y, mo] = m.split('-').map(Number);
    return new Date(y, mo - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

// ─── Calendar grid ────────────────────────────────────────────────────────────

function CalendarView({ month, records, canManage }: { month: string; records: AttendanceRecord[]; canManage: boolean }) {
    const [y, mo] = month.split('-').map(Number);
    const firstDay    = new Date(y, mo - 1, 1).getDay();
    const daysInMonth = new Date(y, mo, 0).getDate();
    const today       = new Date().toISOString().slice(0, 10);

    const byDate: Record<string, AttendanceRecord[]> = {};
    for (const r of records) {
        if (!byDate[r.date]) byDate[r.date] = [];
        byDate[r.date].push(r);
    }

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[640px] border-b border-slate-100 dark:border-slate-800">
                {DAYS.map((d) => (
                    <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 min-w-[640px] divide-x divide-y divide-slate-100 dark:divide-slate-800">
                {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} className="h-24 bg-slate-50/50 dark:bg-slate-900/30" />;
                    const dateStr  = `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const recs     = byDate[dateStr] ?? [];
                    const isToday  = dateStr === today;
                    const isWeekend = [0, 6].includes(new Date(dateStr).getDay());

                    return (
                        <div key={dateStr} className={cn('h-24 p-1.5 flex flex-col gap-1 overflow-hidden', isWeekend && 'bg-slate-50/70 dark:bg-slate-900/40')}>
                            <span className={cn('self-start text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                                isToday ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
                            )}>{day}</span>

                            {recs.slice(0, canManage ? 3 : 1).map((r) => {
                                const sc = STATUS_COLOR[r.status];
                                return (
                                    <div key={r.id} className={cn('flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate', sc.bg, sc.text)}
                                        title={`${canManage ? (r.employee?.name ?? '') + ' · ' : ''}${r.status.replace('_', ' ')}${r.check_in ? ` · In: ${r.check_in}` : ''}${r.check_out ? ` Out: ${r.check_out}` : ''}`}>
                                        <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', sc.dot)} />
                                        <span className="truncate">
                                            {canManage
                                                ? (r.employee?.name ?? r.status)
                                                : r.check_in ? `In: ${r.check_in}${r.check_out ? ` · Out: ${r.check_out}` : ''}` : r.status.replace('_', ' ')
                                            }
                                        </span>
                                    </div>
                                );
                            })}
                            {canManage && recs.length > 3 && (
                                <span className="text-xs text-slate-400 px-1">+{recs.length - 3} more</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── List view ────────────────────────────────────────────────────────────────

function ListView({ records, onDelete, canManage }: { records: AttendanceRecord[]; onDelete: (id: number) => void; canManage: boolean }) {
    if (records.length === 0) {
        return (
            <div className="flex flex-col items-center py-14 text-center">
                <CalendarCheck size={32} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No attendance records for this period</p>
            </div>
        );
    }

    const headers = canManage
        ? ['Date', 'Employee', 'Shift', 'In / Out', 'Worked', 'Status', '']
        : ['Date', 'Shift', 'Check In', 'Check Out', 'Worked', 'Status'];

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        {headers.map((h) => (
                            <th key={h} className="text-left px-4 py-3 font-medium text-slate-500 text-xs">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {records.map((r) => {
                        const sc = STATUS_COLOR[r.status];
                        const StatusIcon = STATUS_ICON[r.status] ?? Clock;
                        return (
                            <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                                    {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </td>
                                {canManage && (
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900 dark:text-white">{r.employee?.name ?? '—'}</p>
                                        <p className="text-xs text-slate-400">{r.employee?.employee_id}</p>
                                    </td>
                                )}
                                <td className="px-4 py-3">
                                    {r.shift ? (
                                        <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: r.shift.color + '22', color: r.shift.color }}>
                                            {r.shift.name}
                                        </span>
                                    ) : <span className="text-slate-400 text-xs">—</span>}
                                </td>
                                {canManage ? (
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {r.check_in ?? '—'} / {r.check_out ?? '—'}
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{r.check_in ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{r.check_out ?? '—'}</td>
                                    </>
                                )}
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                    <span className="flex items-center gap-1"><Clock size={12} />{fmtMinutes(r.worked_minutes)}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', sc.bg, sc.text)}>
                                        <StatusIcon size={10} />
                                        {r.status.replace('_', ' ')}
                                    </span>
                                </td>
                                {canManage && (
                                    <td className="px-4 py-3">
                                        <button onClick={() => onDelete(r.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={13} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AttendanceIndex({ records, employees, shifts, month, selected_employee, canManage, myEmployee }: Props) {
    const [view, setView]         = useState<'calendar' | 'list'>('calendar');
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        employee_id: myEmployee ? String(myEmployee.id) : '',
        shift_id: '', date: new Date().toISOString().slice(0, 10),
        check_in: '', check_out: '', status: 'present', notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/attendance', { onSuccess: () => { reset(); setShowForm(false); } });
    }

    function deleteRecord(id: number) {
        if (confirm('Delete this record?')) router.delete(`/attendance/${id}`);
    }

    function navigate(params: Record<string, string | number | null>) {
        router.get('/attendance', params as Record<string, string>, { preserveState: true });
    }

    function changeMonth(dir: number) {
        navigate({ month: shiftMonth(month, dir), ...(selected_employee ? { employee_id: selected_employee } : {}) });
    }

    const summary = records.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Worked hours total for employee view
    const totalWorked = records.reduce((sum, r) => sum + (r.worked_minutes ?? 0), 0);

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {canManage ? 'Attendance' : 'My Attendance'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {canManage
                                ? `${records.length} records · ${monthLabel(month)}`
                                : `${monthLabel(month)} · ${fmtMinutes(totalWorked)} worked`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canManage && (
                            <>
                                <Link href="/shifts" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    Shifts
                                </Link>
                                <Link href="/holidays" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    Holidays
                                </Link>
                            </>
                        )}
                        <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500" onClick={() => setShowForm(true)}>
                            <Plus size={14} /> {canManage ? 'Record' : 'Log Attendance'}
                        </Button>
                    </div>
                </div>

                {/* Controls bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Employee filter — managers only */}
                    {canManage ? (
                        <select
                            value={selected_employee ?? ''}
                            onChange={(e) => navigate({ month, ...(e.target.value ? { employee_id: e.target.value } : {}) })}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[200px]"
                        >
                            <option value="">All employees</option>
                            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    ) : (
                        /* Employee: show their own name as a static chip */
                        myEmployee && (
                            <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{myEmployee.name}</span>
                                <span className="text-xs text-blue-400 dark:text-blue-500">{myEmployee.employee_id}</span>
                            </div>
                        )
                    )}

                    <div className="flex items-center gap-3">
                        {/* Month navigator */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[140px] text-center">{monthLabel(month)}</span>
                            <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* View toggle */}
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <button onClick={() => setView('calendar')} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                                view === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800')}>
                                <CalendarDays size={14} /> Calendar
                            </button>
                            <button onClick={() => setView('list')} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                                view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800')}>
                                <List size={14} /> List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary chips */}
                {records.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_COLOR).map(([status, sc]) => {
                            const count = summary[status] ?? 0;
                            if (!count) return null;
                            return (
                                <span key={status} className={cn('text-xs px-2.5 py-1 rounded-full font-medium', sc.bg, sc.text)}>
                                    {status.replace('_', ' ')}: {count}
                                </span>
                            );
                        })}
                        {!canManage && totalWorked > 0 && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Total: {fmtMinutes(totalWorked)}
                            </span>
                        )}
                    </div>
                )}

                {/* Record / Log form */}
                {showForm && (
                    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                                {canManage ? 'Record Attendance' : 'Log My Attendance'}
                            </CardTitle>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {/* Employee dropdown — managers only */}
                                {canManage && (
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee *</Label>
                                        <select
                                            value={data.employee_id}
                                            onChange={(e) => setData('employee_id', e.target.value)}
                                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="">Select employee</option>
                                            {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* Employee info chip — employee view */}
                                {!canManage && myEmployee && (
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee</Label>
                                        <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{myEmployee.name}</span>
                                            <span className="text-xs text-slate-400">{myEmployee.employee_id}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date *</Label>
                                    <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status *</Label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="present">Present</option>
                                        <option value="late">Late</option>
                                        <option value="half_day">Half Day</option>
                                        {canManage && <option value="absent">Absent</option>}
                                        {canManage && <option value="on_leave">On Leave</option>}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shift</Label>
                                    <select
                                        value={data.shift_id}
                                        onChange={(e) => setData('shift_id', e.target.value)}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">No shift</option>
                                        {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Check In</Label>
                                    <Input type="time" value={data.check_in} onChange={(e) => setData('check_in', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Check Out</Label>
                                    <Input type="time" value={data.check_out} onChange={(e) => setData('check_out', e.target.value)} />
                                </div>
                                <div className="col-span-2 sm:col-span-3 flex gap-3 pt-1">
                                    <Button type="submit" disabled={processing} size="sm" className="bg-blue-600 hover:bg-blue-500">Save</Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Main view */}
                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    {view === 'calendar'
                        ? <CalendarView month={month} records={records} canManage={canManage} />
                        : <ListView records={records} onDelete={deleteRecord} canManage={canManage} />
                    }
                </Card>
            </div>
        </AppLayout>
    );
}
