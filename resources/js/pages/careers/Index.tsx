import { Link } from '@inertiajs/react';
import { Briefcase, MapPin, Clock, Monitor, Wallet } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';

interface Job {
    id: number; title: string; department: string | null;
    location: string | null; type: string; work_mode: string;
    salary_min: number | null; salary_max: number | null;
    deadline: string | null; created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
    full_time: 'Full Time', part_time: 'Part Time',
    contract: 'Contract', internship: 'Internship',
};

const MODE_LABEL: Record<string, string> = {
    onsite: 'On-site', remote: 'Remote', hybrid: 'Hybrid',
};

function formatSalary(min: number | null, max: number | null): string | null {
    if (!min && !max) return null;
    const fmt = (n: number) => `Le ${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
}

export default function CareersIndex({ jobs }: { jobs: Job[] }) {
    return (
        <PublicLayout>
            {/* Hero */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">Join Our Team</h1>
                <p className="text-slate-500 text-lg max-w-xl mx-auto">
                    Explore open positions and find the role that's right for you.
                </p>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <Briefcase size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium">No open positions at the moment.</p>
                    <p className="text-sm mt-1">Check back soon — we're growing!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-6">{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</p>
                    {jobs.map((job) => {
                        const salary = formatSalary(job.salary_min, job.salary_max);
                        return (
                            <Link
                                key={job.id}
                                href={`/careers/${job.id}`}
                                className="block bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all p-6 group"
                            >
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {job.title}
                                        </h2>
                                        {job.department && (
                                            <p className="text-sm text-slate-500 mt-0.5">{job.department}</p>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex-shrink-0">
                                        Apply Now →
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-slate-500">
                                    {job.location && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={13} /> {job.location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase size={13} /> {TYPE_LABEL[job.type] ?? job.type}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Monitor size={13} /> {MODE_LABEL[job.work_mode] ?? job.work_mode}
                                    </span>
                                    {salary && (
                                        <span className="flex items-center gap-1.5">
                                            <Wallet size={13} /> {salary}
                                        </span>
                                    )}
                                    {job.deadline && (
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={13} /> Deadline: {job.deadline}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </PublicLayout>
    );
}
