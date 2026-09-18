import { Link, router } from '@inertiajs/react';
import { ChevronRight, Clock, Plus, Pencil, Trash2 } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Shift {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    break_minutes: number;
    color: string;
    is_active: boolean;
}

export default function ShiftsIndex({ shifts }: { shifts: Shift[] }) {
    function destroy(id: number) {
        if (confirm('Delete this shift?')) {
            router.delete(`/shifts/${id}`);
        }
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-5">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/attendance" className="hover:text-slate-900 dark:hover:text-white transition-colors">Attendance</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 dark:text-white font-medium">Shifts</span>
                </nav>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shifts</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{shifts.length} shifts configured</p>
                    </div>
                    <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                        <Link href="/shifts/create"><Plus size={14} /> Add Shift</Link>
                    </Button>
                </div>

                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    {shifts.length === 0 ? (
                        <CardContent className="flex flex-col items-center py-14 text-center">
                            <Clock size={32} className="text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-500">No shifts yet</p>
                            <Link href="/shifts/create">
                                <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-500">
                                    <Plus size={14} className="mr-1.5" /> Add first shift
                                </Button>
                            </Link>
                        </CardContent>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {shifts.map((shift) => (
                                <div key={shift.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: shift.color + '22' }}
                                        >
                                            <Clock size={16} style={{ color: shift.color }} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900 dark:text-white text-sm">{shift.name}</p>
                                                {!shift.is_active && (
                                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Inactive</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {shift.start_time} – {shift.end_time}
                                                {shift.break_minutes > 0 && ` · ${shift.break_minutes}min break`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/shifts/${shift.id}/edit`}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </Link>
                                        <button
                                            onClick={() => destroy(shift.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
