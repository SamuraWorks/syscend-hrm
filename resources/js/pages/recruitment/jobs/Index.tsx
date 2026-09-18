import { Link, router } from '@inertiajs/react';
import { Briefcase, Plus, Pencil, Trash2, Users, ChevronRight, ExternalLink } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Job {
    id: number; title: string; department: string | null;
    location: string | null; type: string; work_mode: string;
    status: string; deadline: string | null;
    applications_count: number; created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    published: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    closed:    'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
};

const TYPE_LABEL: Record<string, string> = {
    full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', internship: 'Internship',
};

const FILTERS = ['all', 'draft', 'published', 'closed'];

export default function RecruitmentIndex({ jobs, status }: { jobs: Job[]; status: string }) {
    function destroy(id: number) {
        if (confirm('Delete this job posting?')) router.delete(`/recruitment/${id}`);
    }

    function filterBy(s: string) {
        router.get('/recruitment', s !== 'all' ? { status: s } : {}, { preserveState: true });
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recruitment</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{jobs.length} job posting{jobs.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                        <Link href="/recruitment/create"><Plus size={14} /> Post Job</Link>
                    </Button>
                </div>

                {/* Status filter tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
                    {FILTERS.map((f) => (
                        <button key={f} onClick={() => filterBy(f)}
                            className={cn('px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
                                status === f ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white')}>
                            {f}
                        </button>
                    ))}
                </div>

                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    {jobs.length === 0 ? (
                        <CardContent className="flex flex-col items-center py-14 text-center">
                            <Briefcase size={32} className="text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-500">No job postings yet</p>
                            <Link href="/recruitment/create">
                                <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-500"><Plus size={14} className="mr-1.5" /> Post first job</Button>
                            </Link>
                        </CardContent>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {jobs.map((job) => (
                                <div key={job.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                                            <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Link href={`/recruitment/${job.id}`} className="font-medium text-slate-900 dark:text-white text-sm hover:text-blue-600 transition-colors">
                                                    {job.title}
                                                </Link>
                                                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_STYLE[job.status])}>{job.status}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-slate-500">
                                                {job.department && <span>{job.department}</span>}
                                                {job.location && <span>· {job.location}</span>}
                                                <span>· {TYPE_LABEL[job.type]}</span>
                                                <span>· {job.work_mode.replace('_', '-')}</span>
                                                {job.deadline && <span>· Deadline: {job.deadline}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <Link href={`/recruitment/${job.id}`} className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <Users size={14} />
                                            {job.applications_count}
                                        </Link>
                                        <div className="flex items-center gap-1">
                                            {job.status === 'published' && (
                                                <a
                                                    href={`/careers/${job.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-lg transition-colors"
                                                    title="View public job page"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <Link href={`/recruitment/${job.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors">
                                                <Pencil size={14} />
                                            </Link>
                                            <button onClick={() => destroy(job.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
