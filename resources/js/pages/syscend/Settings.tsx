import { useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SettingsProps {
    settings: {
        currency: string;
        sales_email: string;
        sales_phone: string;
        payment_note: string;
    };
}

export default function Settings({ settings }: SettingsProps) {
    const form = useForm({
        currency: settings.currency,
        sales_email: settings.sales_email,
        sales_phone: settings.sales_phone,
        payment_note: settings.payment_note,
    });

    const submit = () => {
        form.post('/syscend/settings', { preserveScroll: true });
    };

    const inputCls = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Sales settings</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Shown on the public website (pricing, purchase flow and contact). Saved to system settings.
                </p>
            </div>

            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-7">
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="s-currency">Currency symbol</label>
                        <Input id="s-currency" value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value)} />
                        {form.errors.currency && <p className="mt-1 text-xs text-red-600">{form.errors.currency}</p>}
                        <p className="mt-1 text-xs text-slate-400">Used for all product prices and order totals.</p>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="s-email">Sales email</label>
                        <Input id="s-email" type="email" value={form.data.sales_email} onChange={(e) => form.setData('sales_email', e.target.value)} />
                        {form.errors.sales_email && <p className="mt-1 text-xs text-red-600">{form.errors.sales_email}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="s-phone">Sales phone / WhatsApp</label>
                        <Input id="s-phone" value={form.data.sales_phone} onChange={(e) => form.setData('sales_phone', e.target.value)} />
                        {form.errors.sales_phone && <p className="mt-1 text-xs text-red-600">{form.errors.sales_phone}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="s-note">Payment note</label>
                        <textarea
                            id="s-note"
                            rows={3}
                            value={form.data.payment_note}
                            onChange={(e) => form.setData('payment_note', e.target.value)}
                            className={inputCls}
                        />
                        {form.errors.payment_note && <p className="mt-1 text-xs text-red-600">{form.errors.payment_note}</p>}
                        <p className="mt-1 text-xs text-slate-400">Shown in the purchase order summary and on the status page.</p>
                    </div>
                </div>

                <Button type="button" onClick={submit} disabled={form.processing} className="mt-6 bg-blue-600 text-white hover:bg-blue-500">
                    {form.processing ? 'Saving…' : 'Save settings'}
                </Button>
            </div>
        </AppLayout>
    );
}