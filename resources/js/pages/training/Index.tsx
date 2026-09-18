import { router, useForm } from '@inertiajs/react';
import {
    BookOpen, ChevronRight, Clock, DollarSign,
    Edit2, Plus, Trash2, X, CheckCircle2, Star, Award,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
    id: number; title: string; description: string | null; category: string | null;
    delivery_mode: 'online' | 'in_person' | 'hybrid'; duration_hours: number;
    provider: string | null; cost: number; status: 'active' | 'inactive';
    sessions_count: number; created_by: string;
}

interface CatalogCourse {
    id: number; title: string; category: string | null;
    delivery_mode: string; duration_hours: number;
    provider: string | null; sessions_count: number;
}

interface Enrollment {
    id: number; status: string; score: number | null; feedback: string | null; completed_at: string | null;
    session: { id: number; title: string; start_date: string | null; end_date: string | null; location: string | null } | null;
    course: { id: number; title: string; category: string | null; delivery_mode: string; duration_hours: number; provider: string | null } | null;
}

interface Stats {
    total_courses?: number; total_sessions?: number; total_enrollments?: number; completions?: number;
    enrolled?: number; completed?: number; in_progress?: number; total_hours?: number;
}

interface Props {
    canManage: boolean;
    // manager
    courses?: Course[];
    categories?: string[];
    // employee
    myEnrollments?: Enrollment[];
    catalog?: CatalogCourse[];
    stats: Stats;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DELIVERY_LABELS: Record<string, string> = { online: 'Online', in_person: 'In-Person', hybrid: 'Hybrid' };
const DELIVERY_STYLES: Record<string, string> = {
    online:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    in_person: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    hybrid:    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};
const ENROLL_STATUS: Record<string, { label: string; cls: string }> = {
    enrolled:    { label: 'Enrolled',     cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    in_progress: { label: 'In Progress',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    completed:   { label: 'Completed',    cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    dropped:     { label: 'Dropped',      cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
    failed:      { label: 'Failed',       cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

function fmt(n: number) { return 'Le ' + n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

// ─── Course Form Modal (manager only) ────────────────────────────────────────

function CourseModal({ course, categories, onClose }: { course?: Course; categories: string[]; onClose: () => void }) {
    const isEdit = !!course;
    const { data, setData, post, patch, processing, errors } = useForm({
        title: course?.title ?? '', description: course?.description ?? '',
        category: course?.category ?? '', delivery_mode: course?.delivery_mode ?? 'online',
        duration_hours: course?.duration_hours?.toString() ?? '0',
        provider: course?.provider ?? '', cost: course?.cost?.toString() ?? '0',
        status: course?.status ?? 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) patch(`/training/courses/${course!.id}`, { onSuccess: onClose });
        else post('/training/courses', { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{isEdit ? 'Edit Course' : 'New Training Course'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="e.g. Excel Advanced Skills" />
                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Description <span className="text-slate-400 font-normal">(optional)</span></Label>
                        <textarea rows={3} value={data.description} onChange={e => setData('description', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Input list="categories" value={data.category} onChange={e => setData('category', e.target.value)} placeholder="e.g. Technical" />
                            <datalist id="categories">
                                {['Technical','Soft Skills','Compliance','Leadership','Safety'].map(c => <option key={c} value={c} />)}
                                {categories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Delivery Mode</Label>
                            <select value={data.delivery_mode} onChange={e => setData('delivery_mode', e.target.value as any)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="online">Online</option>
                                <option value="in_person">In-Person</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5"><Label>Duration (hrs)</Label><Input type="number" min="0" value={data.duration_hours} onChange={e => setData('duration_hours', e.target.value)} /></div>
                        <div className="space-y-1.5"><Label>Cost (Le)</Label><Input type="number" min="0" step="0.01" value={data.cost} onChange={e => setData('cost', e.target.value)} /></div>
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <select value={data.status} onChange={e => setData('status', e.target.value as any)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Provider <span className="text-slate-400 font-normal">(optional)</span></Label>
                        <Input value={data.provider} onChange={e => setData('provider', e.target.value)} placeholder="e.g. Coursera / Internal" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">{isEdit ? 'Save Changes' : 'Create Course'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Employee Training View ───────────────────────────────────────────────────

function EmployeeTrainingView({ myEnrollments = [], catalog = [], stats }: { myEnrollments: Enrollment[]; catalog: CatalogCourse[]; stats: Stats }) {
    return (
        <div className="space-y-6">
            {/* Personal stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Enrolled',     value: stats.enrolled ?? 0,     icon: BookOpen,     color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
                    { label: 'Completed',    value: stats.completed ?? 0,     icon: CheckCircle2, color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-900/30' },
                    { label: 'In Progress',  value: stats.in_progress ?? 0,   icon: Clock,        color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30' },
                    { label: 'Total Hours',  value: `${stats.total_hours ?? 0}h`, icon: Award,    color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                ].map(k => (
                    <Card key={k.label} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{k.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{k.value}</p>
                                </div>
                                <div className={cn('p-2 rounded-xl shrink-0', k.bg)}><k.icon size={16} className={k.color} /></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* My enrollments */}
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                    <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">My Enrollments</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {myEnrollments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500">
                            <BookOpen size={28} className="mb-2 opacity-40" />
                            <p className="text-sm">No enrollments yet</p>
                            <p className="text-xs mt-1">Your HR team will enroll you in training sessions</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                        {['Course', 'Session', 'Mode', 'Duration', 'Status', 'Score'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 font-medium text-slate-500 text-xs">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {myEnrollments.map(e => {
                                        const s = ENROLL_STATUS[e.status] ?? ENROLL_STATUS.enrolled;
                                        return (
                                            <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{e.course?.title ?? '—'}</p>
                                                    {e.course?.category && <p className="text-xs text-slate-400">{e.course.category}</p>}
                                                    {e.course?.provider && <p className="text-xs text-slate-400">{e.course.provider}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    <p>{e.session?.title ?? '—'}</p>
                                                    {e.session?.start_date && <p className="text-xs text-slate-400">{e.session.start_date}{e.session.end_date ? ` → ${e.session.end_date}` : ''}</p>}
                                                    {e.session?.location && <p className="text-xs text-slate-400">{e.session.location}</p>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {e.course?.delivery_mode && (
                                                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', DELIVERY_STYLES[e.course.delivery_mode])}>
                                                            {DELIVERY_LABELS[e.course.delivery_mode]}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {e.course?.duration_hours ? <span className="flex items-center gap-1"><Clock size={12} />{e.course.duration_hours}h</span> : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', s.cls)}>{s.label}</span>
                                                    {e.completed_at && <p className="text-[10px] text-slate-400 mt-0.5">{e.completed_at}</p>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {e.score != null ? (
                                                        <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                                                            <Star size={12} className="fill-amber-400 text-amber-400" />{e.score}%
                                                        </span>
                                                    ) : <span className="text-slate-400 text-xs">—</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Course catalog */}
            {catalog.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Available Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {catalog.map(c => (
                                <div key={c.id} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100 leading-snug">{c.title}</p>
                                    {c.provider && <p className="text-xs text-slate-400 mt-0.5">{c.provider}</p>}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {c.category && <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">{c.category}</span>}
                                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded', DELIVERY_STYLES[c.delivery_mode])}>{DELIVERY_LABELS[c.delivery_mode]}</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock size={9} />{c.duration_hours}h</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ─── Manager Training View ────────────────────────────────────────────────────

function ManagerTrainingView({ courses = [], stats, categories = [] }: { courses: Course[]; stats: Stats; categories: string[] }) {
    const [modal, setModal] = useState<'create' | Course | null>(null);

    const deleteCourse = (id: number) => {
        if (!confirm('Delete this course and all its sessions?')) return;
        router.delete(`/training/courses/${id}`, { preserveScroll: true });
    };

    return (
        <>
            {modal && <CourseModal course={modal === 'create' ? undefined : modal} categories={categories} onClose={() => setModal(null)} />}
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Training & Development</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage courses, sessions, and employee enrollments</p>
                    </div>
                    <Button size="sm" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setModal('create')}>
                        <Plus size={14} /> New Course
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Active Courses',  value: stats.total_courses ?? 0,     icon: BookOpen,     color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Sessions',         value: stats.total_sessions ?? 0,    icon: Clock,        color: 'text-purple-600 dark:text-purple-400' },
                        { label: 'Enrollments',      value: stats.total_enrollments ?? 0, icon: ChevronRight, color: 'text-amber-600 dark:text-amber-400' },
                        { label: 'Completions',      value: stats.completions ?? 0,       icon: CheckCircle2, color: 'text-green-600 dark:text-green-400' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {courses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No courses yet. Click "New Course" to add one.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Title', 'Category', 'Mode', 'Duration', 'Cost', 'Sessions', 'Status', 'Actions'].map(col => (
                                                <th key={col} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.map((course, idx) => (
                                            <tr key={course.id} className={cn('border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40', idx === courses.length - 1 && 'border-b-0')}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{course.title}</p>
                                                    {course.provider && <p className="text-xs text-slate-400">{course.provider}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{course.category ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', DELIVERY_STYLES[course.delivery_mode])}>
                                                        {DELIVERY_LABELS[course.delivery_mode]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    <span className="flex items-center gap-1"><Clock size={12} />{course.duration_hours}h</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {course.cost > 0 ? fmt(course.cost) : <span className="text-green-600 dark:text-green-400">Free</span>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{course.sessions_count}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                                        course.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300')}>
                                                        {course.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => router.visit(`/training/courses/${course.id}/sessions/create`)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700">
                                                            <Plus size={11} /> Session
                                                        </button>
                                                        <button onClick={() => setModal(course)} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button onClick={() => deleteCourse(course.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function TrainingIndex(props: Props) {
    const { canManage, courses = [], stats, categories = [], myEnrollments = [], catalog = [] } = props;

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {!canManage && (
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Training</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your enrolled courses and available training</p>
                    </div>
                )}
                {canManage
                    ? <ManagerTrainingView courses={courses} stats={stats} categories={categories} />
                    : <EmployeeTrainingView myEnrollments={myEnrollments} catalog={catalog} stats={stats} />
                }
            </div>
        </AppLayout>
    );
}
