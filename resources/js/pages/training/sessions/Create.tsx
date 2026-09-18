import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    course: { id: number; title: string };
}

export default function SessionCreate({ course }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title:            course.title + ' — Session',
        start_date:       '',
        end_date:         '',
        location:         '',
        max_participants: '0',
        notes:            '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/training/courses/${course.id}/sessions`);
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-6 max-w-2xl">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/training" className="flex items-center gap-1.5">
                            <ArrowLeft size={14} /> Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Schedule Session</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{course.title}</p>
                    </div>
                </div>

                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Session Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Session Title</Label>
                                <Input value={data.title} onChange={e => setData('title', e.target.value)} />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                    {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>End Date</Label>
                                    <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                                    {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Location <span className="text-slate-400 font-normal">(optional)</span></Label>
                                    <Input value={data.location} onChange={e => setData('location', e.target.value)} placeholder="e.g. Room 3A / Zoom" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Max Participants <span className="text-slate-400 font-normal">(0 = unlimited)</span></Label>
                                    <Input type="number" min="0" value={data.max_participants} onChange={e => setData('max_participants', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
                                <textarea
                                    rows={3}
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/training">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Schedule Session
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
