import { Link, router } from '@inertiajs/react';
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LeaveType {
    id: number; name: string; code: string; days_allowed: number;
    is_paid: boolean; is_carry_forward: boolean; max_carry_forward: number;
    allow_half_day: boolean; color: string; is_active: boolean; description: string | null;
}

export default function LeaveTypesIndex({ types }: { types: LeaveType[] }) {
    function destroy(id: number) {
        if (confirm('Delete this leave type?')) router.delete(`/leave/types/${id}`);
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-5">
                <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/leaves" className="hover:text-slate-900 dark:hover:text-white transition-colors">Leave</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 dark:text-white font-medium">Leave Types</span>
                </nav>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Types</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{types.length} types configured</p>
                    </div>
                    <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                        <Link href="/leave/types/create"><Plus size={14} /> Add Type</Link>
                    </Button>
                </div>

                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    {types.length === 0 ? (
                        <CardContent className="flex flex-col items-center py-14 text-center">
                            <p className="text-sm font-medium text-slate-500">No leave types configured yet</p>
                            <Link href="/leave/types/create">
                                <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-500"><Plus size={14} className="mr-1.5" /> Add first type</Button>
                            </Link>
                        </CardContent>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {types.map((t) => (
                                <div key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                            style={{ backgroundColor: t.color + '22', color: t.color }}>
                                            {t.code}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-slate-900 dark:text-white text-sm">{t.name}</p>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{t.days_allowed} days/yr</span>
                                                {t.is_paid && <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-1.5 py-0.5 rounded">Paid</span>}
                                                {t.is_carry_forward && <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 px-1.5 py-0.5 rounded">Carry forward up to {t.max_carry_forward}d</span>}
                                                {t.allow_half_day && <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 px-1.5 py-0.5 rounded">½ day</span>}
                                                {!t.is_active && <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Inactive</span>}
                                            </div>
                                            {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/leave/types/${t.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors">
                                            <Pencil size={14} />
                                        </Link>
                                        <button onClick={() => destroy(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
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
