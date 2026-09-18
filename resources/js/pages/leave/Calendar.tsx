import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LeaveEvent {
    id: number; employee: string;
    leave_type: { name: string; color: string };
    start_date: string; end_date: string; days: number;
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

function dateRange(start: string, end: string): string[] {
    const dates: string[] = [];
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    while (s <= e) {
        dates.push(s.toISOString().slice(0, 10));
        s.setDate(s.getDate() + 1);
    }
    return dates;
}

export default function LeaveCalendar({ approved, month }: { approved: LeaveEvent[]; month: string }) {
    const [y, mo] = month.split('-').map(Number);
    const firstDay   = new Date(y, mo - 1, 1).getDay();
    const daysInMonth = new Date(y, mo, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    // Build map: date → events on that day
    const byDate: Record<string, LeaveEvent[]> = {};
    for (const ev of approved) {
        for (const d of dateRange(ev.start_date, ev.end_date)) {
            if (!byDate[d]) byDate[d] = [];
            byDate[d].push(ev);
        }
    }

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function navigate(dir: number) {
        router.get('/leaves/calendar', { month: shiftMonth(month, dir) }, { preserveState: true });
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Calendar</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{approved.length} approved leaves this month</p>
                    </div>
                    <Link href="/leaves" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        ← Leave Requests
                    </Link>
                </div>

                {/* Month navigator */}
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[160px] text-center">{monthLabel(month)}</span>
                    <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Calendar */}
                <Card className="border-slate-200 dark:border-slate-800 overflow-x-auto">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 min-w-[640px] border-b border-slate-100 dark:border-slate-800">
                        {DAYS.map((d) => (
                            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{d}</div>
                        ))}
                    </div>

                    {/* Cells */}
                    <div className="grid grid-cols-7 min-w-[640px] divide-x divide-y divide-slate-100 dark:divide-slate-800">
                        {cells.map((day, i) => {
                            if (!day) return <div key={`e-${i}`} className="h-32 bg-slate-50/50 dark:bg-slate-900/30" />;

                            const dateStr = `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const events  = byDate[dateStr] ?? [];
                            const isToday = dateStr === today;
                            const isWeekend = [0, 6].includes(new Date(dateStr).getDay());

                            return (
                                <div key={dateStr} className={cn('h-32 p-1.5 flex flex-col gap-1 overflow-hidden', isWeekend && 'bg-slate-50/70 dark:bg-slate-900/40')}>
                                    <span className={cn(
                                        'self-start text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                                        isToday ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400',
                                    )}>
                                        {day}
                                    </span>
                                    {events.slice(0, 4).map((ev, idx) => (
                                        <div
                                            key={`${ev.id}-${idx}`}
                                            className="flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate"
                                            style={{ backgroundColor: ev.leave_type.color + '25', color: ev.leave_type.color }}
                                            title={`${ev.employee} · ${ev.leave_type.name}`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.leave_type.color }} />
                                            <span className="truncate">{ev.employee}</span>
                                        </div>
                                    ))}
                                    {events.length > 4 && (
                                        <span className="text-xs text-slate-400 px-1">+{events.length - 4}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Legend */}
                {approved.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {[...new Map(approved.map((e) => [e.leave_type.name, e.leave_type])).values()].map((lt) => (
                            <span key={lt.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lt.color }} />
                                {lt.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
