import { router, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    Briefcase, Calendar, ChevronRight, ExternalLink, MapPin,
    Star, Users, X, Plus, LayoutGrid, List, Mail, Phone, Building2, Clock,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
    id: number; title: string; department: string | null; position: string | null;
    location: string | null; type: string; work_mode: string;
    salary_min: number | null; salary_max: number | null;
    description: string; requirements: string | null;
    status: string; deadline: string | null;
}

interface Application {
    id: number; name: string; email: string; phone: string | null;
    current_title: string | null; current_company: string | null;
    experience_years: number; stage: string; rating: number | null; created_at: string;
}

interface Props {
    job: Job;
    applications: Application[];
    stage_counts: Record<string, number>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STAGES = ['new', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected'];

const STAGE_STYLE: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    new:         { bg: 'bg-slate-50 dark:bg-slate-900',    text: 'text-slate-600 dark:text-slate-400',   border: 'border-slate-200 dark:border-slate-700',   badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    shortlisted: { bg: 'bg-blue-50 dark:bg-blue-950',      text: 'text-blue-700 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800',     badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400' },
    interviewed: { bg: 'bg-purple-50 dark:bg-purple-950',  text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400' },
    offered:     { bg: 'bg-amber-50 dark:bg-amber-950',    text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-800',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400' },
    hired:       { bg: 'bg-green-50 dark:bg-green-950',    text: 'text-green-700 dark:text-green-400',   border: 'border-green-200 dark:border-green-800',   badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400' },
    rejected:    { bg: 'bg-red-50 dark:bg-red-950',        text: 'text-red-700 dark:text-red-400',       border: 'border-red-200 dark:border-red-800',       badge: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' },
};

function StarRating({ value, onChange }: { value: number | null; onChange?: (v: number) => void }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => onChange?.(n)}>
                    <Star size={13} className={cn(value && n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300', onChange && 'cursor-pointer hover:text-amber-400')} />
                </button>
            ))}
        </div>
    );
}

// ─── Kanban card ──────────────────────────────────────────────────────────────

interface AppCardProps {
    app: Application;
    isDragging: boolean;
    onDragStart: (id: number) => void;
    onDragEnd:   () => void;
}

function AppCard({ app, isDragging, onDragStart, onDragEnd }: AppCardProps) {
    const ss = STAGE_STYLE[app.stage];
    const [showInterview, setShowInterview] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        title: 'Interview', scheduled_at: '', duration_minutes: '60',
        mode: 'video', location_or_link: '', interviewer_name: '',
    });

    function moveStage(stage: string) { router.patch(`/applications/${app.id}/stage`, { stage }, { preserveScroll: true }); }
    function rate(rating: number)     { router.patch(`/applications/${app.id}/rating`, { rating }, { preserveScroll: true }); }
    function submitInterview(e: React.FormEvent) {
        e.preventDefault();
        post(`/applications/${app.id}/interviews`, { onSuccess: () => { reset(); setShowInterview(false); } });
    }

    return (
        <div
            draggable
            onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(app.id); }}
            onDragEnd={onDragEnd}
            className={cn(
                'rounded-lg border p-3 space-y-2 cursor-grab active:cursor-grabbing select-none transition-opacity',
                ss.bg, ss.border,
                isDragging && 'opacity-40',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className={cn('font-medium text-sm', ss.text)}>{app.name}</p>
                    <p className="text-xs text-slate-500 truncate">{app.email}</p>
                    {app.current_title && (
                        <p className="text-xs text-slate-400 truncate">
                            {app.current_title}{app.current_company ? ` · ${app.current_company}` : ''}
                        </p>
                    )}
                    {app.experience_years > 0 && <p className="text-xs text-slate-400">{app.experience_years}yr exp</p>}
                </div>
                <button
                    onClick={() => router.delete(`/applications/${app.id}`)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-slate-300 hover:text-red-500 flex-shrink-0"
                >
                    <X size={13} />
                </button>
            </div>

            <StarRating value={app.rating} onChange={rate} />

            <select
                value={app.stage}
                onChange={(e) => moveStage(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded px-2 h-7 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
                {STAGES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            <button
                onClick={() => setShowInterview(!showInterview)}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
                <Plus size={11} /> Schedule interview
            </button>

            {showInterview && (
                <form onSubmit={submitInterview} className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <Input className="h-7 text-xs" placeholder="Interview title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                    <Input type="datetime-local" className="h-7 text-xs" value={data.scheduled_at} onChange={(e) => setData('scheduled_at', e.target.value)} />
                    <select value={data.mode} onChange={(e) => setData('mode', e.target.value)}
                        className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded px-2 h-7 bg-white dark:bg-slate-900">
                        <option value="video">Video</option>
                        <option value="in_person">In Person</option>
                        <option value="phone">Phone</option>
                    </select>
                    <Input className="h-7 text-xs" placeholder="Link or location" value={data.location_or_link} onChange={(e) => setData('location_or_link', e.target.value)} />
                    <div className="flex gap-1">
                        <Button type="submit" size="sm" disabled={processing} className="h-6 text-xs px-2 bg-blue-600 hover:bg-blue-500">Save</Button>
                        <Button type="button" size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setShowInterview(false)}>Cancel</Button>
                    </div>
                </form>
            )}
        </div>
    );
}

// ─── Kanban view ──────────────────────────────────────────────────────────────

function KanbanView({ applications }: { applications: Application[] }) {
    const [draggedId,    setDraggedId]    = useState<number | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);

    const byStage = STAGES.reduce((acc, s) => {
        acc[s] = applications.filter((a) => a.stage === s);
        return acc;
    }, {} as Record<string, Application[]>);

    function onDrop(stage: string) {
        if (draggedId === null) return;
        const app = applications.find((a) => a.id === draggedId);
        if (app && app.stage !== stage) {
            router.patch(`/applications/${draggedId}/stage`, { stage }, { preserveScroll: true });
        }
        setDraggedId(null);
        setDragOverStage(null);
    }

    return (
        <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
                {STAGES.map((stage) => {
                    const ss      = STAGE_STYLE[stage];
                    const cols    = byStage[stage] ?? [];
                    const isOver  = dragOverStage === stage;
                    const canDrop = draggedId !== null && applications.find((a) => a.id === draggedId)?.stage !== stage;

                    return (
                        <div
                            key={stage}
                            className="w-56 flex-shrink-0"
                            onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
                            onDragLeave={() => setDragOverStage(null)}
                            onDrop={() => onDrop(stage)}
                        >
                            {/* Column header */}
                            <div className={cn(
                                'rounded-t-lg px-3 py-2 flex items-center justify-between border border-b-0 transition-colors',
                                ss.bg, ss.border,
                                isOver && canDrop && 'ring-2 ring-inset ring-blue-400',
                            )}>
                                <span className={cn('text-xs font-semibold uppercase tracking-wide', ss.text)}>
                                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                </span>
                                <span className={cn('text-xs font-bold', ss.text)}>{cols.length}</span>
                            </div>

                            {/* Drop zone */}
                            <div className={cn(
                                'rounded-b-lg border min-h-[200px] p-2 space-y-2 transition-colors',
                                ss.border,
                                isOver && canDrop
                                    ? 'bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-inset ring-blue-400'
                                    : 'bg-slate-50/50 dark:bg-slate-900/30',
                            )}>
                                {cols.map((app) => (
                                    <AppCard
                                        key={app.id}
                                        app={app}
                                        isDragging={draggedId === app.id}
                                        onDragStart={setDraggedId}
                                        onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                                    />
                                ))}

                                {/* Empty drop hint */}
                                {cols.length === 0 && isOver && canDrop && (
                                    <div className="flex items-center justify-center h-16 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
                                        <p className="text-xs text-blue-500">Drop here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── List view ────────────────────────────────────────────────────────────────

function ListView({ applications }: { applications: Application[] }) {
    const [stageFilter, setStageFilter] = useState('all');

    const filtered = stageFilter === 'all'
        ? applications
        : applications.filter((a) => a.stage === stageFilter);

    function moveStage(app: Application, stage: string) {
        router.patch(`/applications/${app.id}/stage`, { stage }, { preserveScroll: true });
    }
    function rate(app: Application, rating: number) {
        router.patch(`/applications/${app.id}/rating`, { rating }, { preserveScroll: true });
    }

    return (
        <div className="space-y-3">
            {/* Stage filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {['all', ...STAGES].map((s) => {
                    const count = s === 'all' ? applications.length : applications.filter((a) => a.stage === s).length;
                    return (
                        <button
                            key={s}
                            onClick={() => setStageFilter(s)}
                            className={cn(
                                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                                stageFilter === s
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                            )}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                {filtered.length === 0 ? (
                    <CardContent className="py-12 text-center text-sm text-slate-400">
                        No applicants in this stage.
                    </CardContent>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied</th>
                                    <th className="px-4 py-2.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map((app) => {
                                    const ss = STAGE_STYLE[app.stage];
                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            {/* Applicant */}
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900 dark:text-white">{app.name}</p>
                                                {app.current_title && (
                                                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                        <Building2 size={11} />
                                                        {app.current_title}{app.current_company ? ` · ${app.current_company}` : ''}
                                                    </p>
                                                )}
                                            </td>
                                            {/* Contact */}
                                            <td className="px-4 py-3">
                                                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs">
                                                    <Mail size={11} />{app.email}
                                                </p>
                                                {app.phone && (
                                                    <p className="text-slate-500 flex items-center gap-1.5 text-xs mt-0.5">
                                                        <Phone size={11} />{app.phone}
                                                    </p>
                                                )}
                                            </td>
                                            {/* Experience */}
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                                                {app.experience_years > 0 ? `${app.experience_years} yr` : '—'}
                                            </td>
                                            {/* Rating */}
                                            <td className="px-4 py-3">
                                                <StarRating value={app.rating} onChange={(r) => rate(app, r)} />
                                            </td>
                                            {/* Stage */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={app.stage}
                                                    onChange={(e) => moveStage(app, e.target.value)}
                                                    className={cn('text-xs border rounded-full px-2.5 h-6 font-medium focus:outline-none cursor-pointer', ss.badge, ss.border)}
                                                >
                                                    {STAGES.map((s) => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            {/* Date */}
                                            <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                                                <span className="flex items-center gap-1"><Clock size={11} />{app.created_at}</span>
                                            </td>
                                            {/* Delete */}
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => router.delete(`/applications/${app.id}`)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function JobShow({ job, applications, stage_counts }: Props) {
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [viewMode, setViewMode]           = useState<'kanban' | 'list'>('kanban');

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '', last_name: '', email: '', phone: '',
        current_company: '', current_title: '', experience_years: '0', cover_letter: '',
    });

    function submitApplication(e: React.FormEvent) {
        e.preventDefault();
        post(`/recruitment/${job.id}/apply`, { onSuccess: () => { reset(); setShowApplyForm(false); } });
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-5">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/recruitment" className="hover:text-slate-900 dark:hover:text-white transition-colors">Recruitment</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 dark:text-white font-medium">{job.title}</span>
                </nav>

                {/* Job header */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                            {job.department && <span className="flex items-center gap-1"><Briefcase size={13} />{job.department}</span>}
                            {job.location   && <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>}
                            {job.deadline   && <span className="flex items-center gap-1"><Calendar size={13} />Deadline: {job.deadline}</span>}
                            <span className="flex items-center gap-1"><Users size={13} />{applications.length} applicant{applications.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={`/careers/${job.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ExternalLink size={13} /> Public View
                        </a>
                        <Link href={`/recruitment/${job.id}/edit`} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Edit
                        </Link>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => setShowApplyForm(!showApplyForm)}>
                            <Plus size={14} className="mr-1.5" /> Add Applicant
                        </Button>
                    </div>
                </div>

                {/* Stage summary pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {STAGES.map((s) => {
                        const count = (stage_counts as Record<string,number>)[s] ?? 0;
                        if (!count) return null;
                        const ss = STAGE_STYLE[s];
                        return (
                            <span key={s} className={cn('text-xs font-medium px-2.5 py-1 rounded-full', ss.badge)}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}: {count}
                            </span>
                        );
                    })}
                </div>

                {/* Add applicant form */}
                {showApplyForm && (
                    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Add Applicant</CardTitle>
                            <button onClick={() => setShowApplyForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitApplication} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name *</Label>
                                    <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                    {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name *</Label>
                                    <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</Label>
                                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</Label>
                                    <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Title</Label>
                                    <Input value={data.current_title} onChange={(e) => setData('current_title', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Experience (years)</Label>
                                    <Input type="number" min="0" step="1" value={data.experience_years} onChange={(e) => setData('experience_years', e.target.value)} />
                                </div>
                                <div className="col-span-2 sm:col-span-3 flex gap-3 pt-1">
                                    <Button type="submit" disabled={processing} size="sm" className="bg-blue-600 hover:bg-blue-500">Add Applicant</Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowApplyForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* View toggle + pipeline */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Applications <span className="text-slate-400 font-normal">({applications.length})</span>
                        </p>
                        {/* Toggle */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                                    viewMode === 'kanban'
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                                )}
                            >
                                <LayoutGrid size={13} /> Kanban
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                                )}
                            >
                                <List size={13} /> List
                            </button>
                        </div>
                    </div>

                    {viewMode === 'kanban'
                        ? <KanbanView applications={applications} />
                        : <ListView applications={applications} />
                    }
                </div>

                {/* Job description */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Job Description</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{job.description}</div>
                        {job.requirements && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Requirements</p>
                                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{job.requirements}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
