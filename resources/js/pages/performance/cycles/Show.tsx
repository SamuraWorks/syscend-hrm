import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Circle, Clock, Lock, Star, X } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeRow {
    id: number;
    name: string;
    employee_code: string;
    department: string | null;
    position: string | null;
    self_review_id: number | null;
    self_status: 'not_started' | 'pending' | 'submitted' | 'finalised';
    manager_review_id: number | null;
    manager_status: 'not_started' | 'pending' | 'submitted' | 'finalised';
    final_score: number | null;
    rating_label: string | null;
    finalised: boolean;
}

interface CycleData {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'closed';
    created_by: string;
}

interface Props {
    cycle: CycleData;
    employees: EmployeeRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REVIEW_STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    not_started: { label: 'Not Started', icon: Circle,       cls: 'text-slate-400' },
    pending:     { label: 'Pending',     icon: Clock,        cls: 'text-amber-500' },
    submitted:   { label: 'Submitted',   icon: CheckCircle2, cls: 'text-blue-500'  },
    finalised:   { label: 'Finalised',   icon: CheckCircle2, cls: 'text-green-500' },
};

const LABEL_COLORS: Record<string, string> = {
    Outstanding: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Excellent:   'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300',
    Good:        'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
    Average:     'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
    Poor:        'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300',
};

function ReviewStatus({ status }: { status: string }) {
    const cfg = REVIEW_STATUS_CONFIG[status] ?? REVIEW_STATUS_CONFIG.not_started;
    const Icon = cfg.icon;
    return (
        <span className={cn('inline-flex items-center gap-1 text-xs font-medium', cfg.cls)}>
            <Icon size={13} /> {cfg.label}
        </span>
    );
}

// ─── Finalise Modal ────────────────────────────────────────────────────────────

function FinaliseModal({
    cycleId,
    employee,
    onClose,
}: {
    cycleId: number;
    employee: EmployeeRow;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        final_score: employee.final_score?.toString() ?? '3',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/performance/cycles/${cycleId}/employees/${employee.id}/finalise`, {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Finalise Rating
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={18} />
                    </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Set the final score for <strong className="text-slate-700 dark:text-slate-200">{employee.name}</strong>.
                </p>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Final Score (1.00 – 5.00)
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            min="1"
                            max="5"
                            value={data.final_score}
                            onChange={e => setData('final_score', e.target.value)}
                        />
                        {errors.final_score && <p className="text-xs text-red-500">{errors.final_score}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Finalise
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CycleShow({ cycle, employees }: Props) {
    const [finaliseFor, setFinaliseFor] = useState<EmployeeRow | null>(null);

    const closeCycle = () => {
        if (!confirm('Close this cycle? No further changes will be allowed.')) return;
        router.post(`/performance/cycles/${cycle.id}/close`);
    };

    const startReview = (emp: EmployeeRow, type: 'self' | 'manager') => {
        router.visit(`/performance/cycles/${cycle.id}/employees/${emp.id}/review?type=${type}`);
    };

    const submitted   = employees.filter(e => e.finalised).length;
    const total       = employees.length;

    return (
        <AppLayout>
            {finaliseFor && (
                <FinaliseModal
                    cycleId={cycle.id}
                    employee={finaliseFor}
                    onClose={() => setFinaliseFor(null)}
                />
            )}

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/performance" className="flex items-center gap-1.5 mt-0.5">
                                <ArrowLeft size={14} /> Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {cycle.name}
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                {cycle.start_date} — {cycle.end_date}
                                <span className={cn(
                                    'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                                    cycle.status === 'active'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                )}>
                                    {cycle.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    {cycle.status === 'active' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={closeCycle}
                            className="flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            <Lock size={13} /> Close Cycle
                        </Button>
                    )}
                </div>

                {/* Summary pills */}
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: 'Total Employees', value: total },
                        { label: 'Finalised',        value: submitted },
                        { label: 'Pending',           value: total - submitted },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-center min-w-[110px]">
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Employee table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Employee Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {employees.length === 0 ? (
                            <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                                No active employees found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Employee', 'Department', 'Self Review', 'Manager Review', 'Final Score', 'Actions'].map(col => (
                                                <th key={col} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map((emp, idx) => (
                                            <tr
                                                key={emp.id}
                                                className={cn(
                                                    'border-b border-slate-100 dark:border-slate-800',
                                                    idx === employees.length - 1 && 'border-b-0',
                                                )}
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{emp.name}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">{emp.employee_code}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                    {emp.department ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ReviewStatus status={emp.self_status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ReviewStatus status={emp.manager_status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    {emp.finalised ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Star size={13} className="text-amber-400 fill-amber-400" />
                                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                                {emp.final_score?.toFixed(2)}
                                                            </span>
                                                            {emp.rating_label && (
                                                                <span className={cn('ml-1 rounded-full px-2 py-0.5 text-xs font-medium', LABEL_COLORS[emp.rating_label] ?? '')}>
                                                                    {emp.rating_label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {/* Self review button */}
                                                        <button
                                                            onClick={() => startReview(emp, 'self')}
                                                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        >
                                                            Self
                                                        </button>
                                                        {/* Manager review button */}
                                                        <button
                                                            onClick={() => startReview(emp, 'manager')}
                                                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        >
                                                            Manager
                                                        </button>
                                                        {/* Finalise button */}
                                                        {cycle.status === 'active' && emp.manager_status === 'submitted' && !emp.finalised && (
                                                            <button
                                                                onClick={() => setFinaliseFor(emp)}
                                                                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                                            >
                                                                Finalise
                                                            </button>
                                                        )}
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
