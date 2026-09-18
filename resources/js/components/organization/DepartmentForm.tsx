import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Department { id: number; name: string }
interface Manager    { id: number; first_name: string; last_name: string; employee_id: string }

interface FormData {
    name: string;
    description: string;
    parent_id: string;
    head_id: string;
    cost_center: string;
    [key: string]: string;
}

interface Props {
    data: FormData;
    errors: Partial<Record<keyof FormData, string>>;
    processing: boolean;
    setData: (key: string, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    parents: Department[];
    managers: Manager[];
    submitLabel?: string;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</Label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
            {children}
        </select>
    );
}

export default function DepartmentForm({
    data, errors, processing, setData, onSubmit, onCancel,
    parents, managers, submitLabel = 'Save Department',
}: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Department Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Department Name *" error={errors.name}>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Engineering" />
                    </Field>
                    <Field label="Cost Center" error={errors.cost_center}>
                        <Input value={data.cost_center} onChange={(e) => setData('cost_center', e.target.value)} placeholder="e.g. CC-001" />
                    </Field>
                    <Field label="Parent Department" error={errors.parent_id}>
                        <Select value={data.parent_id} onChange={(v) => setData('parent_id', v)}>
                            <option value="">No parent (top-level)</option>
                            {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </Field>
                    <Field label="Department Head" error={errors.head_id}>
                        <Select value={data.head_id} onChange={(v) => setData('head_id', v)}>
                            <option value="">No head assigned</option>
                            {managers.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.first_name} {m.last_name} ({m.employee_id})
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <div className="sm:col-span-2 space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            placeholder="Brief description of this department..."
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                    {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                    {submitLabel}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );
}
