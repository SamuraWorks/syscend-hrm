import { router, useForm } from '@inertiajs/react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    departments: { id: number; name: string }[];
    positions:   { id: number; name: string }[];
}

const sel = 'w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

export default function JobCreate({ departments, positions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '', department_id: '', position_id: '',
        location: '', type: 'full_time', work_mode: 'onsite',
        salary_min: '', salary_max: '',
        description: '', requirements: '',
        status: 'draft', deadline: '',
    });

    function submit(e: React.FormEvent) { e.preventDefault(); post('/recruitment'); }

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-5">
                <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/recruitment" className="hover:text-slate-900 dark:hover:text-white transition-colors">Recruitment</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 dark:text-white font-medium">Post Job</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post a Job</h1>

                <form onSubmit={submit} className="space-y-5">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Job Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Title *</Label>
                                <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Senior Software Engineer" />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</Label>
                                <select value={data.department_id} onChange={(e) => setData('department_id', e.target.value)} className={sel}>
                                    <option value="">Select department</option>
                                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position</Label>
                                <select value={data.position_id} onChange={(e) => setData('position_id', e.target.value)} className={sel}>
                                    <option value="">Select position</option>
                                    {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</Label>
                                <Input value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder="e.g. New York, NY" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type *</Label>
                                <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={sel}>
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Work Mode *</Label>
                                <select value={data.work_mode} onChange={(e) => setData('work_mode', e.target.value)} className={sel}>
                                    <option value="onsite">On-site</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Min Salary (Le)</Label>
                                <Input type="number" value={data.salary_min} onChange={(e) => setData('salary_min', e.target.value)} min="0" step="any" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Salary (Le)</Label>
                                <Input type="number" value={data.salary_max} onChange={(e) => setData('salary_max', e.target.value)} min="0" step="any" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Application Deadline</Label>
                                <Input type="date" value={data.deadline} onChange={(e) => setData('deadline', e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status *</Label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={sel}>
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Description *</Label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={5}
                                    placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Requirements</Label>
                                <textarea value={data.requirements} onChange={(e) => setData('requirements', e.target.value)} rows={4}
                                    placeholder="Skills, qualifications, experience required..."
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                            {processing && <Loader2 size={14} className="mr-2 animate-spin" />} Post Job
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit('/recruitment')}>Cancel</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
