import { router, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { CalendarDays, Check, Clock, Plus, X } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee { id: number; name: string; employee_id: string; }
interface LeaveType { id: number; name: string; code: string; color: string; days_allowed: number; allow_half_day: boolean; }
interface LeaveRequest {
    id: number;
    employee: Employee | null;
    leave_type: { id: number; name: string; code: string; color: string } | null;
    start_date: string; end_date: string; days: number;
    is_half_day: boolean; half_day_period: string | null;
    reason: string; status: string;
    approver_comment: string | null; actioned_at: string | null; created_at: string;
}

interface Props {
    requests: LeaveRequest[];
    employees: Employee[];
    types: LeaveType[];
    status: string;
    canManage: boolean;
    myEmployee: { id: number; name: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
    pending:   { bg: 'bg-amber-100 dark:bg-amber-950',  text: 'text-amber-700 dark:text-amber-400'  },
    approved:  { bg: 'bg-green-100 dark:bg-green-950',  text: 'text-green-700 dark:text-green-400'  },
    rejected:  { bg: 'bg-red-100 dark:bg-red-950',      text: 'text-red-700 dark:text-red-400'      },
    cancelled: { bg: 'bg-slate-100 dark:bg-slate-800',  text: 'text-slate-500 dark:text-slate-400'  },
};

const FILTERS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

// ─── Leave Request form ───────────────────────────────────────────────────────

function ApplyForm({ employees, types, onClose, canManage, myEmployee }: {
    employees: Employee[]; types: LeaveType[]; onClose: () => void;
    canManage: boolean; myEmployee: { id: number; name: string } | null;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: canManage ? '' : String(myEmployee?.id ?? ''),
        leave_type_id: '', start_date: '', end_date: '',
        is_half_day: false, half_day_period: 'morning', reason: '',
    });

    const selectedType = types.find((t) => String(t.id) === data.leave_type_id);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/leaves', { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Apply for Leave</CardTitle>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Employee selector — only visible to managers/HR */}
                    {canManage && (
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee *</Label>
                            <select value={data.employee_id} onChange={(e) => setData('employee_id', e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                <option value="">Select employee</option>
                                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            {errors.employee_id && <p className="text-xs text-red-500">{errors.employee_id}</p>}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Leave Type *</Label>
                        <select value={data.leave_type_id} onChange={(e) => setData('leave_type_id', e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option value="">Select type</option>
                            {types.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.days_allowed}d/yr)</option>)}
                        </select>
                        {errors.leave_type_id && <p className="text-xs text-red-500">{errors.leave_type_id}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date *</Label>
                        <Input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                        {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Date *</Label>
                        <Input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                        {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
                    </div>

                    {selectedType?.allow_half_day && (
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Half Day?</Label>
                            <div className="flex items-center gap-3 h-9">
                                <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                    <input type="checkbox" checked={data.is_half_day}
                                        onChange={(e) => setData('is_half_day', e.target.checked)} className="rounded border-slate-300" />
                                    Half day
                                </label>
                                {data.is_half_day && (
                                    <select value={data.half_day_period} onChange={(e) => setData('half_day_period', e.target.value)}
                                        className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 h-8 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="col-span-2 sm:col-span-3 space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason *</Label>
                        <textarea value={data.reason} onChange={(e) => setData('reason', e.target.value)} rows={2}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                        {errors.reason && <p className="text-xs text-red-500">{errors.reason}</p>}
                    </div>

                    <div className="col-span-2 sm:col-span-3 flex gap-3 pt-1">
                        <Button type="submit" disabled={processing} size="sm" className="bg-blue-600 hover:bg-blue-500">Submit Request</Button>
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Action modal ─────────────────────────────────────────────────────────────

function ActionModal({ leave, action, onClose }: { leave: LeaveRequest; action: 'approve' | 'reject'; onClose: () => void }) {
    const { data, setData, post, processing } = useForm({ approver_comment: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/leaves/${leave.id}/${action}`, { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <Card className="w-full max-w-md border-slate-200 dark:border-slate-700 shadow-xl">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white capitalize">{action} Leave</CardTitle>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                        <p><strong>{leave.employee?.name}</strong> — {leave.leave_type?.name}</p>
                        <p className="text-xs mt-0.5">{leave.start_date} → {leave.end_date} · {leave.days} day(s)</p>
                        <p className="text-xs mt-0.5 italic">{leave.reason}</p>
                    </div>
                    <form onSubmit={submit} className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Comment (optional)</Label>
                            <textarea value={data.approver_comment} onChange={(e) => setData('approver_comment', e.target.value)} rows={2}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing} size="sm"
                                className={action === 'approve' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}>
                                {action === 'approve' ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
                                {action === 'approve' ? 'Approve' : 'Reject'}
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeaveIndex({ requests, employees, types, status, canManage, myEmployee }: Props) {
    const [showForm, setShowForm]   = useState(false);
    const [actionTarget, setAction] = useState<{ leave: LeaveRequest; action: 'approve' | 'reject' } | null>(null);

    function filterByStatus(s: string) {
        router.get('/leaves', s !== 'all' ? { status: s } : {}, { preserveState: true });
    }

    function cancel(id: number) {
        if (confirm('Cancel this leave request?')) router.post(`/leaves/${id}/cancel`);
    }

    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Management</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {requests.length} requests{pendingCount > 0 && ` · ${pendingCount} pending`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/leaves/calendar" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Calendar
                        </Link>
                        {canManage && (
                            <Link href="/leave/types" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                Leave Types
                            </Link>
                        )}
                        <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500" onClick={() => setShowForm(true)}>
                            <Plus size={14} /> Apply Leave
                        </Button>
                    </div>
                </div>

                {/* Apply form */}
                {showForm && <ApplyForm employees={employees} types={types} onClose={() => setShowForm(false)} canManage={canManage} myEmployee={myEmployee} />}

                {/* Status filter tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => filterByStatus(f)}
                            className={cn(
                                'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
                                status === f
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white',
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Requests list */}
                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    {requests.length === 0 ? (
                        <CardContent className="flex flex-col items-center py-14 text-center">
                            <CalendarDays size={32} className="text-slate-300 mb-2" />
                            <p className="text-sm text-slate-500">No leave requests found</p>
                        </CardContent>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {requests.map((r) => {
                                const ss = STATUS_STYLE[r.status] ?? STATUS_STYLE.cancelled;
                                return (
                                    <div key={r.id} className="flex items-start justify-between px-5 py-4 gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <div className="flex items-start gap-4 min-w-0">
                                            {/* Type colour bar */}
                                            <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: r.leave_type?.color ?? '#94a3b8' }} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{r.employee?.name}</p>
                                                    <span className="text-xs text-slate-400">{r.employee?.employee_id}</span>
                                                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: (r.leave_type?.color ?? '#3b82f6') + '22', color: r.leave_type?.color ?? '#3b82f6' }}>
                                                        {r.leave_type?.name}
                                                    </span>
                                                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ss.bg, ss.text)}>
                                                        {r.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock size={11} /> {r.start_date} → {r.end_date}
                                                        {r.is_half_day && ` · ½ day (${r.half_day_period})`}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{r.days} day(s)</span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">{r.reason}</p>
                                                {r.approver_comment && (
                                                    <p className="text-xs text-slate-500 mt-0.5 italic">"{r.approver_comment}"</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {canManage && r.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => setAction({ leave: r, action: 'approve' })}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900 rounded-lg transition-colors"
                                                    >
                                                        <Check size={12} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setAction({ leave: r, action: 'reject' })}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 rounded-lg transition-colors"
                                                    >
                                                        <X size={12} /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {['pending', 'approved'].includes(r.status) && (
                                                <button
                                                    onClick={() => cancel(r.id)}
                                                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* Action modal */}
            {actionTarget && (
                <ActionModal
                    leave={actionTarget.leave}
                    action={actionTarget.action}
                    onClose={() => setAction(null)}
                />
            )}
        </AppLayout>
    );
}
