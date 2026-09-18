import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComponentOption {
    id: number;
    name: string;
    code: string;
    type: 'earning' | 'deduction' | 'tax';
    calculation_type: string;
    value: number;
}

interface SelectedComponent {
    id: number;
    override_value: string;
}

interface Props {
    components: ComponentOption[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
    earning:   'Earnings',
    deduction: 'Deductions',
    tax:       'Taxes',
};

const TYPE_BADGE: Record<string, string> = {
    earning:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    deduction: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    tax:       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const TYPE_HEADER: Record<string, string> = {
    earning:   'text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
    deduction: 'text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
    tax:       'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateStructure({ components }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true,
        components: [] as SelectedComponent[],
    });

    // Track selected component ids and their override values
    const [selected, setSelected] = useState<Map<number, string>>(new Map());

    function toggleComponent(comp: ComponentOption) {
        setSelected((prev) => {
            const next = new Map(prev);
            if (next.has(comp.id)) {
                next.delete(comp.id);
            } else {
                next.set(comp.id, '');
            }
            // Sync to form data
            const arr: SelectedComponent[] = Array.from(next.entries()).map(([id, ov]) => ({
                id,
                override_value: ov,
            }));
            setData('components', arr);
            return next;
        });
    }

    function setOverride(id: number, value: string) {
        setSelected((prev) => {
            const next = new Map(prev);
            next.set(id, value);
            const arr: SelectedComponent[] = Array.from(next.entries()).map(([cid, ov]) => ({
                id: cid,
                override_value: ov,
            }));
            setData('components', arr);
            return next;
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/payroll/structures');
    }

    const grouped = (['earning', 'deduction', 'tax'] as const).map((type) => ({
        type,
        items: components.filter((c) => c.type === type),
    })).filter((g) => g.items.length > 0);

    return (
        <AppLayout>
            <div className="space-y-6 p-6 max-w-3xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Link
                        href="/payroll"
                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        Payroll
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link
                        href="/payroll/structures"
                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        Structures
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                        Add Structure
                    </span>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href="/payroll/structures">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Add Salary Structure
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Group salary components into a reusable structure
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Details */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Structure Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Standard Structure"
                                        required
                                        className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>

                                {/* Code */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="e.g. STANDARD"
                                        required
                                        className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 font-mono"
                                    />
                                    {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description
                                </Label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                    placeholder="Optional description..."
                                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            {/* Is Active */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={cn(
                                            'h-5 w-9 rounded-full transition-colors',
                                            data.is_active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600',
                                        )}
                                    />
                                    <div
                                        className={cn(
                                            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                                            data.is_active ? 'left-[18px]' : 'left-0.5',
                                        )}
                                    />
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">Is Active</span>
                            </label>
                        </CardContent>
                    </Card>

                    {/* Component Selector */}
                    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    Select Components
                                </CardTitle>
                                {selected.size > 0 && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {selected.size} selected
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {grouped.length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                                    No components available. Add components first.
                                </p>
                            ) : (
                                grouped.map(({ type, items }) => (
                                    <div key={type}>
                                        <div
                                            className={cn(
                                                'px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide border mb-3',
                                                TYPE_HEADER[type],
                                            )}
                                        >
                                            {TYPE_LABELS[type]}
                                        </div>
                                        <div className="space-y-2">
                                            {items.map((comp) => {
                                                const isChecked = selected.has(comp.id);
                                                const overrideVal = selected.get(comp.id) ?? '';
                                                return (
                                                    <div
                                                        key={comp.id}
                                                        className={cn(
                                                            'rounded-lg border transition-colors',
                                                            isChecked
                                                                ? 'border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                                                                : 'border-slate-200 dark:border-slate-700',
                                                        )}
                                                    >
                                                        <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleComponent(comp)}
                                                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                        {comp.name}
                                                                    </span>
                                                                    <span
                                                                        className={cn(
                                                                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                                                                            TYPE_BADGE[comp.type],
                                                                        )}
                                                                    >
                                                                        {comp.type}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                                    Default:{' '}
                                                                    {comp.calculation_type === 'fixed'
                                                                        ? `Le ${comp.value}`
                                                                        : `${comp.value}%`}
                                                                </p>
                                                            </div>
                                                        </label>
                                                        {/* Override input when checked */}
                                                        {isChecked && (
                                                            <div className="px-4 pb-3 flex items-center gap-3">
                                                                <Label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                                    Override Value
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={overrideVal}
                                                                    onChange={(e) => setOverride(comp.id, e.target.value)}
                                                                    placeholder={`Default: ${comp.value}`}
                                                                    className="h-8 text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 max-w-[160px]"
                                                                />
                                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                                    {comp.calculation_type === 'fixed' ? 'Le' : '%'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                            {errors.components && (
                                <p className="text-xs text-red-500">{errors.components as unknown as string}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/payroll/structures">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {processing ? 'Saving...' : 'Save Structure'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
