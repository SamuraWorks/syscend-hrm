import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Circle, Plus, Target, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Goal {
    id: number;
    title: string;
    description: string | null;
    weight: number;
    progress: number;
    status: 'draft' | 'active' | 'completed';
    due_date: string | null;
}

interface CycleOption {
    id: number;
    name: string;
    status: 'active' | 'closed';
}

interface Props {
    cycles: CycleOption[];
    selected_cycle: CycleOption | null;
    goals: Goal[];
    has_employee: boolean;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ goal }: { goal: Goal }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(goal.progress.toString());

    const save = () => {
        const progress = Math.max(0, Math.min(100, parseInt(val) || 0));
        router.patch(`/performance/goals/${goal.id}`, { progress }, {
            onSuccess: () => setEditing(false),
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all',
                        goal.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${goal.progress}%` }}
                />
            </div>
            {editing ? (
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
                        className="w-14 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                    />
                    <span className="text-xs text-slate-500">%</span>
                    <button onClick={save} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Save</button>
                    <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                </div>
            ) : (
                <button
                    onClick={() => setEditing(true)}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 min-w-[32px] text-right"
                >
                    {goal.progress}%
                </button>
            )}
        </div>
    );
}

// ─── Add Goal Modal ────────────────────────────────────────────────────────────

function AddGoalModal({ cycleId, onClose }: { cycleId: number; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        cycle_id: cycleId.toString(),
        title: '',
        description: '',
        weight: '0',
        due_date: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/performance/goals', { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Add Goal</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Goal Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            placeholder="e.g. Improve customer satisfaction score"
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description <span className="text-slate-400 font-normal">(optional)</span></Label>
                        <textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the goal..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="weight">Weight (%)</Label>
                            <Input
                                id="weight"
                                type="number"
                                min="0"
                                max="100"
                                value={data.weight}
                                onChange={e => setData('weight', e.target.value)}
                            />
                            {errors.weight && <p className="text-xs text-red-500">{errors.weight}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="due_date">Due Date <span className="text-slate-400 font-normal">(optional)</span></Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={e => setData('due_date', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Add Goal
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    active:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default function GoalsIndex({ cycles, selected_cycle, goals, has_employee }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const totalWeight = goals.reduce((s, g) => s + g.weight, 0);

    const deleteGoal = (id: number) => {
        if (!confirm('Delete this goal?')) return;
        router.delete(`/performance/goals/${id}`, { preserveScroll: true });
    };

    return (
        <AppLayout>
            {showAdd && selected_cycle && (
                <AddGoalModal cycleId={selected_cycle.id} onClose={() => setShowAdd(false)} />
            )}

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Goals</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Track and update your performance goals
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Cycle selector */}
                        <select
                            value={selected_cycle?.id ?? ''}
                            onChange={e => router.visit(`/performance/goals?cycle_id=${e.target.value}`)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {cycles.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {selected_cycle?.status === 'active' && (
                            <Button
                                size="sm"
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => setShowAdd(true)}
                            >
                                <Plus size={14} /> Add Goal
                            </Button>
                        )}
                    </div>
                </div>

                {!has_employee ? (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-700 dark:text-amber-300">
                        No employee record linked to your account. Contact HR to be assigned an employee profile.
                    </div>
                ) : !selected_cycle ? (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                        No performance cycles available yet.
                    </div>
                ) : (
                    <>
                        {/* Weight summary */}
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Total weight:</span>
                            <span className={cn('font-semibold', totalWeight === 100 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400')}>
                                {totalWeight}%
                            </span>
                            {totalWeight !== 100 && totalWeight > 0 && (
                                <span className="text-amber-500 dark:text-amber-400 text-xs">(should equal 100%)</span>
                            )}
                        </div>

                        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    Goals — {selected_cycle.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {goals.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <Target className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">No goals yet.</p>
                                        {selected_cycle.status === 'active' && (
                                            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                                                Click "Add Goal" to set your first goal.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {goals.map(goal => (
                                            <div key={goal.id} className="px-6 py-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="mt-0.5 flex-shrink-0">
                                                            {goal.status === 'completed'
                                                                ? <CheckCircle2 size={16} className="text-green-500" />
                                                                : <Circle size={16} className="text-slate-300 dark:text-slate-600" />
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                                                    {goal.title}
                                                                </p>
                                                                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_STYLES[goal.status])}>
                                                                    {goal.status}
                                                                </span>
                                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                                    Weight: {goal.weight}%
                                                                </span>
                                                                {goal.due_date && (
                                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                                        Due: {goal.due_date}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {goal.description && (
                                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                                    {goal.description}
                                                                </p>
                                                            )}
                                                            <div className="mt-2 max-w-xs">
                                                                <ProgressBar goal={goal} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {selected_cycle.status === 'active' && (
                                                        <button
                                                            onClick={() => deleteGoal(goal.id)}
                                                            className="flex-shrink-0 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
