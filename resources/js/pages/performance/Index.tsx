import { router, useForm } from '@inertiajs/react';
import {
    ChevronRight, Plus, Target, X, Star, CheckCircle2,
    Clock, TrendingUp, BookOpen, AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Cycle { id: number; name: string; start_date?: string; end_date?: string; status: string; created_by?: string; goals_count?: number; reviews_count?: number; ratings_count?: number; }

interface MyReview  { id: number; type: string; status: string; overall_comments: string | null; submitted_at: string | null; avg_score: number | null; cycle: { id: number; name: string; status: string }; }
interface MyGoal    { id: number; title: string; description: string | null; weight: number; progress: number; status: string; due_date: string | null; cycle: { id: number; name: string; status: string }; }
interface MyRating  { id: number; self_score: number | null; manager_score: number | null; final_score: number | null; rating_label: string | null; finalised_at: string | null; cycle: { id: number; name: string }; }

interface Props {
    canManage: boolean;
    // manager
    cycles?: Cycle[];
    // employee
    hasEmployee?: boolean;
    myReviews?: MyReview[];
    myGoals?: MyGoal[];
    myRatings?: MyRating[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REVIEW_STATUS: Record<string, { label: string; cls: string }> = {
    pending:   { label: 'Pending',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    submitted: { label: 'Submitted',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    finalised: { label: 'Finalised',  cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    not_started:{ label: 'Not Started',cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
};

const GOAL_STATUS: Record<string, { label: string; cls: string }> = {
    active:    { label: 'Active',    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    draft:     { label: 'Draft',     cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
};

const CYCLE_STATUS: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    closed: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

function StarRating({ score }: { score: number | null }) {
    if (!score) return <span className="text-slate-400 text-xs">—</span>;
    return (
        <span className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} className={s <= Math.round(score) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'} />
            ))}
            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">{score.toFixed(1)}</span>
        </span>
    );
}

// ─── Create Cycle Modal ───────────────────────────────────────────────────────

function CreateCycleModal({ onClose }: { onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({ name: '', start_date: '', end_date: '' });
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">New Performance Cycle</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); post('/performance/cycles', { onSuccess: onClose }); }} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Cycle Name</Label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Q1 2026 Appraisal" />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Start Date</Label>
                            <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>End Date</Label>
                            <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">Create Cycle</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Employee Performance View ────────────────────────────────────────────────

function EmployeePerformanceView({ myReviews = [], myGoals = [], myRatings = [], cycles = [], hasEmployee }: {
    myReviews: MyReview[]; myGoals: MyGoal[]; myRatings: MyRating[]; cycles: Cycle[]; hasEmployee: boolean;
}) {
    const [showGoalForm, setShowGoalForm] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        cycle_id: cycles.find(c => c.status === 'active')?.id?.toString() ?? '',
        title: '', description: '', weight: '10', due_date: '',
    });

    function submitGoal(e: React.FormEvent) {
        e.preventDefault();
        post('/performance/goals', { onSuccess: () => { reset(); setShowGoalForm(false); } });
    }

    const activeCycles = cycles.filter(c => c.status === 'active');
    const completedGoals = myGoals.filter(g => g.status === 'completed').length;
    const avgProgress = myGoals.length > 0 ? Math.round(myGoals.reduce((s, g) => s + g.progress, 0) / myGoals.length) : 0;
    const latestRating = myRatings[0] ?? null;

    return (
        <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'My Reviews',      value: myReviews.length,  icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
                    { label: 'My Goals',         value: myGoals.length,    icon: Target,       color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                    { label: 'Goals Completed',  value: completedGoals,    icon: Star,         color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-900/30' },
                    { label: 'Avg Goal Progress',value: `${avgProgress}%`, icon: TrendingUp,   color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30' },
                ].map(k => (
                    <Card key={k.label} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{k.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{k.value}</p>
                                </div>
                                <div className={cn('p-2 rounded-xl shrink-0', k.bg)}>
                                    <k.icon size={16} className={k.color} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Latest rating */}
            {latestRating && (
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Latest Performance Rating — {latestRating.cycle.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Self Review</p>
                                <StarRating score={latestRating.self_score} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Manager Review</p>
                                <StarRating score={latestRating.manager_score} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Final Score</p>
                                {latestRating.final_score ? (
                                    <div className="flex items-center gap-2">
                                        <StarRating score={latestRating.final_score} />
                                        {latestRating.rating_label && (
                                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">{latestRating.rating_label}</span>
                                        )}
                                    </div>
                                ) : <span className="text-xs text-slate-400">Not finalised</span>}
                            </div>
                        </div>
                        {latestRating.finalised_at && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Finalised on {latestRating.finalised_at}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* My Goals */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">My Goals</CardTitle>
                        {activeCycles.length > 0 && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowGoalForm(v => !v)}>
                                <Plus size={12} /> Add Goal
                            </Button>
                        )}
                    </CardHeader>

                    {showGoalForm && (
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/20">
                            <form onSubmit={submitGoal} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-xs">Cycle</Label>
                                        <select value={data.cycle_id} onChange={e => setData('cycle_id', e.target.value)}
                                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-8 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none">
                                            {activeCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-xs">Goal Title *</Label>
                                        <Input className="h-8 text-sm" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="e.g. Complete certification" />
                                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Weight (%)</Label>
                                        <Input className="h-8 text-sm" type="number" min="0" max="100" value={data.weight} onChange={e => setData('weight', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Due Date</Label>
                                        <Input className="h-8 text-sm" type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" size="sm" disabled={processing} className="h-7 text-xs bg-blue-600 hover:bg-blue-500">Save</Button>
                                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowGoalForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <CardContent className="p-0">
                        {myGoals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
                                <Target size={24} className="mb-2 opacity-40" />
                                <p className="text-sm">No goals set yet</p>
                                {activeCycles.length > 0 && <p className="text-xs mt-1">Click "Add Goal" to set your first goal</p>}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {myGoals.map(g => {
                                    const s = GOAL_STATUS[g.status] ?? GOAL_STATUS.draft;
                                    return (
                                        <div key={g.id} className="px-5 py-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{g.title}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{g.cycle.name} {g.due_date ? `· Due ${g.due_date}` : ''}</p>
                                                </div>
                                                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0', s.cls)}>{s.label}</span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="mt-2">
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                                    <span>Progress</span><span>{g.progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={cn('h-full rounded-full', g.progress === 100 ? 'bg-green-500' : 'bg-blue-500')} style={{ width: `${g.progress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* My Reviews */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">My Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {myReviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
                                <CheckCircle2 size={24} className="mb-2 opacity-40" />
                                <p className="text-sm">No reviews yet</p>
                                <p className="text-xs mt-1">Reviews will appear when your manager starts an appraisal cycle</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {myReviews.map(r => {
                                    const s = REVIEW_STATUS[r.status] ?? REVIEW_STATUS.not_started;
                                    return (
                                        <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.cycle.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{r.type} review</span>
                                                    {r.avg_score && <StarRating score={r.avg_score} />}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', s.cls)}>{s.label}</span>
                                                {r.status === 'pending' && (
                                                    <Button size="sm" className="h-6 text-[10px] px-2 bg-blue-600 hover:bg-blue-500"
                                                        onClick={() => router.visit(`/performance/reviews/${r.id}`)}>
                                                        Fill
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* All ratings history */}
            {myRatings.length > 1 && (
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rating History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {myRatings.map(r => (
                                <div key={r.id} className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.cycle.name}</p>
                                    <div><p className="text-xs text-slate-400 mb-0.5">Self</p><StarRating score={r.self_score} /></div>
                                    <div><p className="text-xs text-slate-400 mb-0.5">Manager</p><StarRating score={r.manager_score} /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Final</p>
                                        {r.final_score
                                            ? <div className="flex items-center gap-1"><StarRating score={r.final_score} />{r.rating_label && <span className="text-xs font-semibold text-green-600 dark:text-green-400">{r.rating_label}</span>}</div>
                                            : <span className="text-xs text-slate-400">Pending</span>}
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

// ─── Manager Performance View ─────────────────────────────────────────────────

function ManagerPerformanceView({ cycles = [] }: { cycles: Cycle[] }) {
    const [showCreate, setShowCreate] = useState(false);
    return (
        <>
            {showCreate && <CreateCycleModal onClose={() => setShowCreate(false)} />}
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Performance Management</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage appraisal cycles, goals, and reviews</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={() => router.visit('/performance/goals')}>
                            <Target size={14} /> My Goals
                        </Button>
                        <Button size="sm" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowCreate(true)}>
                            <Plus size={14} /> New Cycle
                        </Button>
                    </div>
                </div>

                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Appraisal Cycles</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {cycles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No cycles yet. Click "New Cycle" to start.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Cycle Name', 'Period', 'Goals', 'Reviews', 'Status', 'Created By', ''].map(col => (
                                                <th key={col} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cycles.map((cycle, idx) => (
                                            <tr key={cycle.id}
                                                className={cn('border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer', idx === cycles.length - 1 && 'border-b-0')}
                                                onClick={() => router.visit(`/performance/cycles/${cycle.id}`)}>
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{cycle.name}</td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{cycle.start_date} — {cycle.end_date}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{cycle.goals_count}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{cycle.reviews_count}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', CYCLE_STATUS[cycle.status] ?? '')}>{cycle.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{cycle.created_by}</td>
                                                <td className="px-4 py-3 text-right"><ChevronRight size={16} className="inline text-slate-400" /></td>
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

export default function PerformanceIndex(props: Props) {
    const { canManage, cycles = [], hasEmployee, myReviews = [], myGoals = [], myRatings = [] } = props;

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {!canManage && (
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Performance</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your goals, reviews, and ratings</p>
                    </div>
                )}
                {canManage
                    ? <ManagerPerformanceView cycles={cycles} />
                    : <EmployeePerformanceView myReviews={myReviews} myGoals={myGoals} myRatings={myRatings} cycles={cycles} hasEmployee={hasEmployee ?? false} />
                }
            </div>
        </AppLayout>
    );
}
