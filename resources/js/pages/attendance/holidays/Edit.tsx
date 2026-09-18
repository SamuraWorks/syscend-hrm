import { router, useForm } from '@inertiajs/react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Holiday {
    id: number; name: string; date: string; is_recurring: boolean; type: string; description: string | null;
}

export default function HolidayEdit({ holiday }: { holiday: Holiday }) {
    const { data, setData, put, processing, errors } = useForm({
        name: holiday.name,
        date: holiday.date,
        is_recurring: holiday.is_recurring,
        type: holiday.type,
        description: holiday.description ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/holidays/${holiday.id}`);
    }

    return (
        <AppLayout>
            <div className="max-w-xl mx-auto space-y-5">
                <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/attendance" className="hover:text-slate-900 dark:hover:text-white transition-colors">Attendance</Link>
                    <ChevronRight size={14} />
                    <Link href="/holidays" className="hover:text-slate-900 dark:hover:text-white transition-colors">Holidays</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 dark:text-white font-medium">Edit</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit — {holiday.name}</h1>

                <form onSubmit={submit} className="space-y-5">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Holiday Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Holiday Name *</Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date *</Label>
                                <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</Label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="public">Public</option>
                                    <option value="optional">Optional</option>
                                    <option value="restricted">Restricted</option>
                                </select>
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_recurring"
                                    checked={data.is_recurring}
                                    onChange={(e) => setData('is_recurring', e.target.checked)}
                                    className="rounded border-slate-300"
                                />
                                <Label htmlFor="is_recurring" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    Recurring yearly
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                            {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit('/holidays')}>Cancel</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
