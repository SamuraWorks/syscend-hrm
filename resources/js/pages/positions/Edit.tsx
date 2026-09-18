import { router, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    position:    { id: number; name: string; description: string | null; department_id: number | null; level: string | null; salary_min: string | null; salary_max: string | null };
    departments: { id: number; name: string }[];
}

export default function PositionEdit({ position, departments }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name:          position.name,
        description:   position.description ?? '',
        department_id: String(position.department_id ?? ''),
        level:         position.level ?? '',
        salary_min:    position.salary_min ?? '',
        salary_max:    position.salary_max ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/positions/${position.id}`);
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-5">
                <Link href="/positions" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={15} /> Back to Positions
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit — {position.name}</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Position Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position Name *</Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department *</Label>
                                <select
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="">Select department</option>
                                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                {errors.department_id && <p className="text-xs text-red-500">{errors.department_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Level / Grade</Label>
                                <Input value={data.level} onChange={(e) => setData('level', e.target.value)} placeholder="e.g. L4, Senior" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Min Salary (Le)</Label>
                                <Input type="number" value={data.salary_min} onChange={(e) => setData('salary_min', e.target.value)} min="0" step="1" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Salary (Le)</Label>
                                <Input type="number" value={data.salary_max} onChange={(e) => setData('salary_max', e.target.value)} min="0" step="1" />
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                            {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit('/positions')}>Cancel</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
