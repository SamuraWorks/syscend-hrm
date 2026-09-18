import { router, useForm } from '@inertiajs/react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LeaveTypeCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '', code: '', days_allowed: '15', is_paid: true,
        is_carry_forward: false, max_carry_forward: '0',
        allow_half_day: true, color: '#3b82f6', is_active: true, description: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/leave/types');
    }

    return (
        <AppLayout>
            <div className="max-w-xl mx-auto space-y-5">
                <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/leaves" className="hover:text-slate-900 dark:hover:text-white transition-colors">Leave</Link>
                    <ChevronRight size={14} />
                    <Link href="/leave/types" className="hover:text-slate-900 dark:hover:text-white transition-colors">Leave Types</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 dark:text-white font-medium">Add Leave Type</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Leave Type</h1>

                <form onSubmit={submit} className="space-y-5">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name *</Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Annual Leave" />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Code *</Label>
                                <Input value={data.code} onChange={(e) => setData('code', e.target.value.toUpperCase())} placeholder="AL" maxLength={20} />
                                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Days Allowed / Year *</Label>
                                <Input type="number" value={data.days_allowed} onChange={(e) => setData('days_allowed', e.target.value)} min="1" max="365" />
                                {errors.days_allowed && <p className="text-xs text-red-500">{errors.days_allowed}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Color</Label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={data.color} onChange={(e) => setData('color', e.target.value)}
                                        className="h-9 w-12 rounded border border-slate-200 dark:border-slate-700 cursor-pointer" />
                                    <span className="text-sm text-slate-500 font-mono">{data.color}</span>
                                </div>
                            </div>

                            <div className="col-span-2 grid grid-cols-2 gap-3">
                                {([
                                    ['is_paid',          'Paid leave'],
                                    ['is_carry_forward', 'Carry forward unused days'],
                                    ['allow_half_day',   'Allow half-day requests'],
                                    ['is_active',        'Active'],
                                ] as const).map(([field, label]) => (
                                    <label key={field} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                                        <input type="checkbox" checked={data[field] as boolean}
                                            onChange={(e) => setData(field, e.target.checked)} className="rounded border-slate-300" />
                                        {label}
                                    </label>
                                ))}
                            </div>

                            {data.is_carry_forward && (
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Carry Forward (days)</Label>
                                    <Input type="number" value={data.max_carry_forward} onChange={(e) => setData('max_carry_forward', e.target.value)} min="0" />
                                </div>
                            )}

                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                            {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Create Leave Type
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit('/leave/types')}>Cancel</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
