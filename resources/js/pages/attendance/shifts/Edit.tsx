import { router, useForm } from '@inertiajs/react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Shift {
    id: number; name: string; start_time: string; end_time: string;
    break_minutes: number; color: string; is_active: boolean;
}

export default function ShiftEdit({ shift }: { shift: Shift }) {
    const { data, setData, put, processing, errors } = useForm({
        name: shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        break_minutes: String(shift.break_minutes),
        color: shift.color,
        is_active: shift.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/shifts/${shift.id}`);
    }

    return (
        <AppLayout>
            <div className="max-w-xl mx-auto space-y-5">
                <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/attendance" className="hover:text-slate-900 dark:hover:text-white transition-colors">Attendance</Link>
                    <ChevronRight size={14} />
                    <Link href="/shifts" className="hover:text-slate-900 dark:hover:text-white transition-colors">Shifts</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 dark:text-white font-medium">Edit</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit — {shift.name}</h1>

                <form onSubmit={submit} className="space-y-5">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Shift Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shift Name *</Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time *</Label>
                                <Input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} />
                                {errors.start_time && <p className="text-xs text-red-500">{errors.start_time}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Time *</Label>
                                <Input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} />
                                {errors.end_time && <p className="text-xs text-red-500">{errors.end_time}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Break (minutes)</Label>
                                <Input type="number" value={data.break_minutes} onChange={(e) => setData('break_minutes', e.target.value)} min="0" max="120" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="h-9 w-12 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-500 font-mono">{data.color}</span>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300"
                                />
                                <Label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Active</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                            {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit('/shifts')}>Cancel</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
