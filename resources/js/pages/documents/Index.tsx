import { router, useForm } from '@inertiajs/react';
import {
    AlertTriangle, CheckCircle2, Download, Edit2,
    FileText, Plus, Trash2, X,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Document {
    id: number;
    title: string;
    category: string;
    description: string | null;
    file_name: string;
    file_size: number;
    visibility: 'all' | 'hr_only' | 'managers';
    expiry_date: string | null;
    is_expired: boolean;
    status: 'active' | 'archived';
    uploaded_by: string;
    acknowledgements_count: number;
    acknowledged: boolean;
    created_at: string;
}

interface Stats {
    total: number;
    expiring: number;
    expired: number;
    employee_docs: number;
}

interface Props {
    documents: Document[];
    stats: Stats;
    categories: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VISIBILITY_LABELS: Record<string, string> = {
    all:      'All Employees',
    hr_only:  'HR Only',
    managers: 'Managers',
};

const CATEGORY_COLORS: Record<string, string> = {
    Policy:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Contract:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Compliance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Form:       'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    Other:      'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

function fileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ categories, onClose }: { categories: string[]; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm<{
        title: string; category: string; description: string;
        visibility: string; expiry_date: string; file: File | null;
    }>({
        title: '', category: '', description: '',
        visibility: 'all', expiry_date: '', file: null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/documents', { forceFormData: true, onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Upload Document</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="e.g. Employee Code of Conduct" />
                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Input
                                list="doc-categories"
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                placeholder="e.g. Policy"
                            />
                            <datalist id="doc-categories">
                                {['Policy', 'Contract', 'Compliance', 'Form', 'Other', ...categories].map(c => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Visibility</Label>
                            <select
                                value={data.visibility}
                                onChange={e => setData('visibility', e.target.value)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Employees</option>
                                <option value="hr_only">HR Only</option>
                                <option value="managers">Managers</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Description <span className="text-slate-400 font-normal">(optional)</span></Label>
                        <textarea
                            rows={2}
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Expiry Date <span className="text-slate-400 font-normal">(optional)</span></Label>
                        <Input type="date" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label>File <span className="text-slate-400 font-normal">(max 20 MB)</span></Label>
                        <input
                            type="file"
                            onChange={e => setData('file', e.target.files?.[0] ?? null)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-blue-50 dark:file:bg-blue-900/30 file:px-3 file:py-1 file:text-xs file:font-medium file:text-blue-600 dark:file:text-blue-400"
                        />
                        {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">Upload</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ doc, onClose }: { doc: Document; onClose: () => void }) {
    const { data, setData, patch, processing } = useForm({
        title:       doc.title,
        category:    doc.category,
        description: doc.description ?? '',
        visibility:  doc.visibility,
        expiry_date: doc.expiry_date ?? '',
        status:      doc.status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/documents/${doc.id}`, { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Edit Document</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input value={data.title} onChange={e => setData('title', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Input value={data.category} onChange={e => setData('category', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Visibility</Label>
                            <select value={data.visibility} onChange={e => setData('visibility', e.target.value as any)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="all">All Employees</option>
                                <option value="hr_only">HR Only</option>
                                <option value="managers">Managers</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Expiry Date</Label>
                            <Input type="date" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <select value={data.status} onChange={e => setData('status', e.target.value as any)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentsIndex({ documents, stats, categories }: Props) {
    const [showUpload, setShowUpload] = useState(false);
    const [editDoc, setEditDoc] = useState<Document | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'archived' | 'expired'>('all');

    const filtered = documents.filter(d => {
        if (filter === 'all')      return true;
        if (filter === 'expired')  return d.is_expired;
        if (filter === 'active')   return d.status === 'active' && !d.is_expired;
        if (filter === 'archived') return d.status === 'archived';
        return true;
    });

    const deleteDoc = (id: number) => {
        if (!confirm('Delete this document permanently?')) return;
        router.delete(`/documents/${id}`, { preserveScroll: true });
    };

    const acknowledge = (id: number) => {
        router.post(`/documents/${id}/acknowledge`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout>
            {showUpload && <UploadModal categories={categories} onClose={() => setShowUpload(false)} />}
            {editDoc    && <EditModal doc={editDoc} onClose={() => setEditDoc(null)} />}

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Documents & Compliance</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage company policies, contracts, and compliance documents</p>
                    </div>
                    <Button size="sm" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowUpload(true)}>
                        <Plus size={14} /> Upload Document
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Active Documents',  value: stats.total,        color: 'text-blue-600' },
                        { label: 'Expiring (30 days)', value: stats.expiring,     color: 'text-amber-600' },
                        { label: 'Expired',            value: stats.expired,      color: 'text-red-600' },
                        { label: 'Employee Docs',      value: stats.employee_docs, color: 'text-purple-600' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit">
                    {(['all', 'active', 'expired', 'archived'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                'px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                                filter === f
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Documents table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Company Documents ({filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No documents found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Document', 'Category', 'Visibility', 'Expiry', 'Acknowledged', 'Uploaded', 'Actions'].map(col => (
                                                <th key={col} className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((doc, idx) => (
                                            <tr key={doc.id} className={cn('border-b border-slate-100 dark:border-slate-800', idx === filtered.length - 1 && 'border-b-0')}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={14} className="text-slate-400 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500">{doc.file_name} · {fileSize(doc.file_size)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS.Other)}>
                                                        {doc.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{VISIBILITY_LABELS[doc.visibility]}</td>
                                                <td className="px-4 py-3">
                                                    {doc.expiry_date ? (
                                                        <span className={cn('inline-flex items-center gap-1 text-xs', doc.is_expired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')}>
                                                            {doc.is_expired && <AlertTriangle size={11} />}
                                                            {doc.expiry_date}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500">No expiry</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {doc.acknowledged ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                            <CheckCircle2 size={12} /> Acknowledged
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => acknowledge(doc.id)}
                                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                        >
                                                            Acknowledge
                                                        </button>
                                                    )}
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{doc.acknowledgements_count} total</p>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <p>{doc.uploaded_by}</p>
                                                    <p className="text-slate-400 dark:text-slate-500">{doc.created_at}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`/documents/${doc.id}/download`}
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
                                                            <Download size={14} />
                                                        </a>
                                                        <button
                                                            onClick={() => setEditDoc(doc)}
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteDoc(doc.id)}
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
