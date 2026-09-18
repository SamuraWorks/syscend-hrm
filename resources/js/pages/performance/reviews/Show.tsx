import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Send, Star } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewItem {
    id: number;
    criteria: string;
    rating: number;
    comments: string | null;
}

interface ReviewData {
    id: number;
    type: 'self' | 'manager';
    status: 'pending' | 'submitted' | 'finalised';
    overall_comments: string | null;
    submitted_at: string | null;
    cycle: { id: number; name: string; status: string };
    employee: {
        id: number;
        name: string;
        employee_code: string;
        department: string | null;
        position: string | null;
    };
    items: ReviewItem[];
}

interface Props {
    review: ReviewData;
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

const STAR_LABELS = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

function StarRating({
    value,
    onChange,
    readonly,
}: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
}) {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <button
                    key={s}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(s)}
                    onMouseEnter={() => !readonly && setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className={cn(
                        'transition-colors focus:outline-none',
                        readonly ? 'cursor-default' : 'cursor-pointer'
                    )}
                >
                    <Star
                        size={18}
                        className={cn(
                            'transition-colors',
                            s <= display
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-none text-slate-300 dark:text-slate-600'
                        )}
                    />
                </button>
            ))}
            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400 min-w-[90px]">
                {STAR_LABELS[display] ?? ''}
            </span>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewShow({ review }: Props) {
    const isReadonly = review.status !== 'pending';

    const { data, setData, post, processing } = useForm({
        items: review.items.map(i => ({
            id: i.id,
            rating: i.rating,
            comments: i.comments ?? '',
        })),
        overall_comments: review.overall_comments ?? '',
    });

    const updateItem = (idx: number, field: 'rating' | 'comments', value: number | string) => {
        const items = [...data.items];
        items[idx] = { ...items[idx], [field]: value };
        setData('items', items);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/performance/reviews/${review.id}/save`, { preserveScroll: true });
    };

    const handleSubmit = () => {
        if (!confirm('Submit this review? You will not be able to edit it afterwards.')) return;
        router.post(`/performance/reviews/${review.id}/submit`, {
            items: data.items,
            overall_comments: data.overall_comments,
        });
    };

    const avgRating = data.items.length
        ? (data.items.reduce((s, i) => s + i.rating, 0) / data.items.length).toFixed(2)
        : '—';

    const typeLabel = review.type === 'self' ? 'Self Assessment' : 'Manager Review';

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/performance/cycles/${review.cycle.id}`} className="flex items-center gap-1.5 mt-0.5">
                                <ArrowLeft size={14} /> Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {typeLabel}
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                {review.cycle.name} · {review.employee.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {review.status === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={processing}
                                    className="flex items-center gap-1.5"
                                >
                                    <Save size={14} /> Save Draft
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleSubmit}
                                    disabled={processing}
                                >
                                    <Send size={14} /> Submit Review
                                </Button>
                            </>
                        )}
                        {isReadonly && (
                            <span className={cn(
                                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
                                review.status === 'submitted'  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                review.status === 'finalised'  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            )}>
                                {review.status}
                                {review.submitted_at && ` · ${review.submitted_at}`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Employee info card */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Employee', value: review.employee.name },
                        { label: 'ID',         value: review.employee.employee_code },
                        { label: 'Department', value: review.employee.department ?? '—' },
                        { label: 'Position',   value: review.employee.position ?? '—' },
                    ].map(info => (
                        <div key={info.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                            <p className="text-xs text-slate-400 dark:text-slate-500">{info.label}</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{info.value}</p>
                        </div>
                    ))}
                </div>

                {/* Review form */}
                <form onSubmit={handleSave}>
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Evaluation Criteria
                            </CardTitle>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                Average: <span className="font-semibold text-slate-800 dark:text-slate-200">{avgRating}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.items.map((item, idx) => (
                                    <div key={item.id} className="px-6 py-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-6">
                                            <div className="sm:w-48 flex-shrink-0">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    {review.items[idx].criteria}
                                                </p>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <StarRating
                                                    value={item.rating}
                                                    onChange={v => updateItem(idx, 'rating', v)}
                                                    readonly={isReadonly}
                                                />
                                                {!isReadonly ? (
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Add comments (optional)..."
                                                        value={item.comments}
                                                        onChange={e => updateItem(idx, 'comments', e.target.value)}
                                                        className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                    />
                                                ) : item.comments ? (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                                        "{item.comments}"
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Overall comments */}
                            <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
                                    Overall Comments
                                </p>
                                {!isReadonly ? (
                                    <textarea
                                        rows={3}
                                        placeholder="Summarise your assessment..."
                                        value={data.overall_comments}
                                        onChange={e => setData('overall_comments', e.target.value)}
                                        className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                    />
                                ) : review.overall_comments ? (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                        "{review.overall_comments}"
                                    </p>
                                ) : (
                                    <p className="text-sm text-slate-400 dark:text-slate-500">No overall comments provided.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
