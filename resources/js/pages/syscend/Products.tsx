import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductRow {
    id: number;
    name: string;
    description: string | null;
    category: string;
    type: string;
    price: number;
    yearly_price: number | null;
    currency: string;
    one_time: boolean;
    is_active: boolean;
    sort: number;
}

interface ProductsProps {
    products: ProductRow[];
}

const CATEGORIES = ['license', 'service'];
const TYPES = ['license', 'deployment', 'training', 'onsite', 'migration', 'domain', 'custom', 'support', 'other'];

const inputCls = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function Products({ products }: ProductsProps) {
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const create = useForm({
        name: '',
        description: '',
        category: 'service',
        type: 'deployment',
        price: '0',
        yearly_price: '',
        currency: '',
        is_active: true,
    });

    const edit = useForm({
        name: '',
        description: '',
        category: 'service',
        type: 'deployment',
        price: '0',
        yearly_price: '',
        currency: '',
        is_active: true,
    });

    const startEdit = (p: ProductRow) => {
        setEditingId(p.id);
        edit.setData({
            name: p.name,
            description: p.description ?? '',
            category: p.category,
            type: p.type,
            price: String(p.price),
            yearly_price: p.yearly_price !== null ? String(p.yearly_price) : '',
            currency: p.currency,
            is_active: p.is_active,
        });
    };

    const submitCreate = () => {
        create.post('/syscend/products', { preserveScroll: true, onSuccess: () => { setCreating(false); create.reset(); } });
    };

    const submitEdit = (id: number) => {
        edit.put(`/syscend/products/${id}`, { preserveScroll: true, onSuccess: () => setEditingId(null) });
    };

    return (
        <AppLayout>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Products & pricing</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        All licence and service prices are configured here — nothing is hard-coded on the website.
                    </p>
                </div>
                <Button type="button" onClick={() => setCreating((c) => !c)} className="bg-blue-600 text-white hover:bg-blue-500">
                    {creating ? <><X size={15} className="mr-1.5" /> Close</> : <><Plus size={15} className="mr-1.5" /> New product</>}
                </Button>
            </div>

            {creating && (
                <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-6">
                    <h2 className="font-semibold text-slate-900">Create product</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="p-name">Name</label>
                            <Input id="p-name" value={create.data.name} onChange={(e) => create.setData('name', e.target.value)} />
                            {create.errors.name && <p className="mt-1 text-xs text-red-600">{create.errors.name}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="p-desc">Description</label>
                            <textarea id="p-desc" rows={2} value={create.data.description} onChange={(e) => create.setData('description', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="p-cat">Category</label>
                            <select id="p-cat" value={create.data.category} onChange={(e) => create.setData('category', e.target.value)} className={inputCls}>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="p-type">Type</label>
                            <select id="p-type" value={create.data.type} onChange={(e) => create.setData('type', e.target.value)} className={inputCls}>
                                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="p-price">Price</label>
                            <Input id="p-price" type="number" min="0" step="0.01" value={create.data.price} onChange={(e) => create.setData('price', e.target.value)} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="p-yearly">Yearly price (optional)</label>
                            <Input id="p-yearly" type="number" min="0" step="0.01" value={create.data.yearly_price} onChange={(e) => create.setData('yearly_price', e.target.value)} placeholder="Empty = not sold yearly" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="p-currency">Currency</label>
                            <Input id="p-currency" value={create.data.currency} onChange={(e) => create.setData('currency', e.target.value)} placeholder="Le" />
                        </div>
                    </div>
                    <Button type="button" onClick={submitCreate} disabled={create.processing} className="mt-4 bg-blue-600 text-white hover:bg-blue-500">
                        {create.processing ? 'Saving…' : 'Save product'}
                    </Button>
                </div>
            )}

            <div className="space-y-3">
                {products.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        {editingId === p.id ? (
                            <div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
                                        <Input value={edit.data.name} onChange={(e) => edit.setData('name', e.target.value)} />
                                        {edit.errors.name && <p className="mt-1 text-xs text-red-600">{edit.errors.name}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                                        <textarea rows={2} value={edit.data.description} onChange={(e) => edit.setData('description', e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                                        <select value={edit.data.category} onChange={(e) => edit.setData('category', e.target.value)} className={inputCls}>
                                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
                                        <select value={edit.data.type} onChange={(e) => edit.setData('type', e.target.value)} className={inputCls}>
                                            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Price</label>
                                        <Input type="number" min="0" step="0.01" value={edit.data.price} onChange={(e) => edit.setData('price', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Yearly price (optional)</label>
                                        <Input type="number" min="0" step="0.01" value={edit.data.yearly_price} onChange={(e) => edit.setData('yearly_price', e.target.value)} placeholder="Empty = not sold yearly" />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Currency</label>
                                        <Input value={edit.data.currency} onChange={(e) => edit.setData('currency', e.target.value)} placeholder="Le" />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" checked={edit.data.is_active} onChange={(e) => edit.setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                                        Active
                                    </label>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button type="button" onClick={() => submitEdit(p.id)} disabled={edit.processing} className="bg-blue-600 text-white hover:bg-blue-500">
                                        {edit.processing ? 'Saving…' : 'Save changes'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setEditingId(null)} className="border-slate-300 text-slate-600">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h3 className="font-semibold text-slate-900">{p.name}</h3>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.category === 'license' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {p.category}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{p.type}</span>
                                            {!p.is_active && (
                                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">disabled</span>
                                            )}
                                        </div>
                                        {p.description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{p.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {p.price > 0 ? `${p.price.toLocaleString()} ${p.currency}` : 'Quote / free'}
                                        </p>
                                        {p.yearly_price !== null && (
                                            <p className="text-xs text-slate-400">
                                                or {p.yearly_price.toLocaleString()} {p.currency}/year
                                            </p>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => startEdit(p)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                                        <Pencil size={13} /> Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm(`Toggle product "${p.name}"?`)) {
                                                router.post(`/syscend/products/${p.id}/toggle`, {}, { preserveScroll: true });
                                            }
                                        }}
                                        className="text-xs font-medium text-slate-500 hover:text-slate-800"
                                    >
                                        {p.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}