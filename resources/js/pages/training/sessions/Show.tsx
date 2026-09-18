import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Enrollment {
    id: number;
    employee_id: number;
    employee_name: string;
    department: string | null;
    position: string | null;
    status: 'enrolled' | 'completed' | 'dropped' | 'failed';
    score: number | null;
    feedback: string | null;
    completed_at: string | null;
}

interface AvailableEmployee {
    id: number;
    name: string;
    department: string | null;
    position: string | null;
}

interface SessionData {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    location: string | null;
    max_participants: number;
    status: string;
    notes: string | null;
    course: {
        id: number;
        title: string;
        duration_hours: number;
        category: string | null;
        delivery_mode: string;
    };
    enrollments: Enrollment[];
}

interface Props {
    session: SessionData;
    available_employees: AvailableEmployee[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    enrolled:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    dropped:   'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    failed:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const SESSION_STATUS_STYLES: Record<string, string> = {
    scheduled:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    ongoing:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    completed:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

// ─── Enroll Modal ─────────────────────────────────────────────────────────────

function EnrollModal({ sessionId, employees, onClose }: {
    sessionId: number;
    employees: AvailableEmployee[];
    onClose: () => void;
}) {
    const [selected, setSelected] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);

    const toggle = (id: number) => setSelected(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

    const enroll = () => {
        if (selected.length === 0) return;
        setProcessing(true);
        router.post(`/training/sessions/${sessionId}/enroll`, { employee_ids: selected }, {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Enroll Employees</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                </div>

                {employees.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        All active employees are already enrolled.
                    </div>
                ) : (
                    <>
                        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                            {employees.map(emp => (
                                <label key={emp.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(emp.id)}
                                        onChange={() => toggle(emp.id)}
                                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{emp.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{emp.department} · {emp.position}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{selected.length} selected</span>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                                <Button
                                    size="sm"
                                    disabled={selected.length === 0 || processing}
                                    onClick={enroll}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Enroll {selected.length > 0 ? `(${selected.length})` : ''}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Update Enrollment Modal ──────────────────────────────────────────────────

function UpdateEnrollmentModal({ enrollment, onClose }: { enrollment: Enrollment; onClose: () => void }) {
    const { data, setData, patch, processing } = useForm({
        status:   enrollment.status,
        score:    enrollment.score?.toString() ?? '',
        feedback: enrollment.feedback ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/training/enrollments/${enrollment.id}`, { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Update Enrollment</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{enrollment.employee_name}</p>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                        <select
                            value={data.status}
                            onChange={e => setData('status', e.target.value as any)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="enrolled">Enrolled</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    {(data.status === 'completed' || data.status === 'failed') && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Score (0–100)</label>
                            <input
                                type="number" min="0" max="100"
                                value={data.score}
                                onChange={e => setData('score', e.target.value)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Feedback <span className="text-slate-400 font-normal">(optional)</span></label>
                        <textarea
                            rows={3}
                            value={data.feedback}
                            onChange={e => setData('feedback', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                        <Button type="submit" size="sm" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SessionShow({ session, available_employees }: Props) {
    const [showEnroll, setShowEnroll] = useState(false);
    const [editEnrollment, setEditEnrollment] = useState<Enrollment | null>(null);

    const removeEnrollment = (id: number) => {
        if (!confirm('Remove this enrollment?')) return;
        router.delete(`/training/enrollments/${id}`, { preserveScroll: true });
    };

    const updateStatus = (status: string) => {
        if (!confirm(`Mark session as "${status}"?`)) return;
        router.patch(`/training/sessions/${session.id}`, { status }, { preserveScroll: true });
    };

    const completions = session.enrollments.filter(e => e.status === 'completed').length;

    return (
        <AppLayout>
            {showEnroll && (
                <EnrollModal
                    sessionId={session.id}
                    employees={available_employees}
                    onClose={() => setShowEnroll(false)}
                />
            )}
            {editEnrollment && (
                <UpdateEnrollmentModal
                    enrollment={editEnrollment}
                    onClose={() => setEditEnrollment(null)}
                />
            )}

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/training" className="flex items-center gap-1.5 mt-0.5">
                                <ArrowLeft size={14} /> Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{session.title}</h1>
                            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                {session.course.title} · {session.start_date} — {session.end_date}
                                <span className={cn('ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize', SESSION_STATUS_STYLES[session.status])}>
                                    {session.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {session.status === 'scheduled' && (
                            <Button variant="outline" size="sm" onClick={() => updateStatus('ongoing')} className="flex items-center gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20">
                                Mark Ongoing
                            </Button>
                        )}
                        {session.status === 'ongoing' && (
                            <Button variant="outline" size="sm" onClick={() => updateStatus('completed')} className="flex items-center gap-1.5 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20">
                                <CheckCircle2 size={13} /> Mark Completed
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => setShowEnroll(true)}
                            disabled={session.status === 'completed' || session.status === 'cancelled'}
                        >
                            <UserPlus size={14} /> Enroll Employees
                        </Button>
                    </div>
                </div>

                {/* Info pills */}
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: 'Location',       value: session.location ?? 'TBD' },
                        { label: 'Max Seats',       value: session.max_participants === 0 ? 'Unlimited' : session.max_participants.toString() },
                        { label: 'Enrolled',        value: session.enrollments.length.toString() },
                        { label: 'Completions',     value: completions.toString() },
                        { label: 'Delivery',        value: session.course.delivery_mode.replace('_', '-') },
                        { label: 'Duration',        value: `${session.course.duration_hours}h` },
                    ].map(info => (
                        <div key={info.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5">
                            <p className="text-xs text-slate-400 dark:text-slate-500">{info.label}</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{info.value}</p>
                        </div>
                    ))}
                </div>

                {/* Enrollments table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Enrollments ({session.enrollments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {session.enrollments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No employees enrolled yet.</p>
                                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Click "Enroll Employees" to add participants.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Employee', 'Department', 'Status', 'Score', 'Completed', 'Actions'].map(col => (
                                                <th key={col} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {session.enrollments.map((e, idx) => (
                                            <tr key={e.id} className={cn('border-b border-slate-100 dark:border-slate-800', idx === session.enrollments.length - 1 && 'border-b-0')}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{e.employee_name}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">{e.position}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.department ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_STYLES[e.status])}>
                                                        {e.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                    {e.score !== null ? `${e.score}/100` : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.completed_at ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setEditEnrollment(e)}
                                                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={() => removeEnrollment(e.id)}
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
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
        </AppLayout>
    );
}
