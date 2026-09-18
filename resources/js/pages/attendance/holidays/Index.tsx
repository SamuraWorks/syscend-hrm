import { Link, router } from '@inertiajs/react';
import { CalendarDays, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Holiday {
    id: number;
    name: string;
    date: string;
    is_recurring: boolean;
    type: string;
    description: string | null;
}

const typeBadge: Record<string, string> = {
    public:     'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    optional:   'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    restricted: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
};

export default function HolidaysIndex({ holidays, canManage }: { holidays: Holiday[]; canManage: boolean }) {
    function destroy(id: number) {
        if (confirm('Delete this holiday?')) router.delete(`/holidays/${id}`);
    }

    const today = new Date().toISOString().slice(0, 10);
    const upcoming = holidays.filter(h => h.date >= today);
    const past     = holidays.filter(h => h.date < today);

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Holidays</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {upcoming.length} upcoming · {past.length} past
                        </p>
                    </div>
                    {canManage && (
                        <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                            <Link href="/holidays/create"><Plus size={14} /> Add Holiday</Link>
                        </Button>
                    )}
                </div>

                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    {holidays.length === 0 ? (
                        <CardContent className="flex flex-col items-center py-14 text-center">
                            <CalendarDays size={32} className="text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-500">No holidays added yet</p>
                            {canManage && (
                                <Link href="/holidays/create">
                                    <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-500">
                                        <Plus size={14} className="mr-1.5" /> Add first holiday
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {holidays.map((h) => {
                                const isPast = h.date < today;
                                return (
                                    <div key={h.id} className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isPast ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-slate-100 dark:bg-slate-800' : 'bg-indigo-100 dark:bg-indigo-950'}`}>
                                                <CalendarDays size={16} className={isPast ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{h.name}</p>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeBadge[h.type] ?? ''}`}>{h.type}</span>
                                                    {h.is_recurring && <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Recurring</span>}
                                                    {!isPast && h.date === today && <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.5 rounded font-medium">Today</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                {h.description && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">{h.description}</p>}
                                            </div>
                                        </div>
                                        {canManage && (
                                            <div className="flex items-center gap-1">
                                                <Link href={`/holidays/${h.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors">
                                                    <Pencil size={14} />
                                                </Link>
                                                <button onClick={() => destroy(h.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
