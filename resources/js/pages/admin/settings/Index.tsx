import { useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    DatabaseBackup,
    Eye,
    EyeOff,
    Globe,
    ImageIcon,
    KeyRound,
    Mail,
    MessageSquare,
    Palette,
    Save,
    Send,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { useRef, useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    settings: Record<string, string | null>;
    license?: {
        valid: boolean;
        enabled: boolean;
        holder: string;
        expires_at: string | null;
        days_remaining: number | null;
        error: string | null;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const TIMEZONES = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Dubai', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Singapore',
    'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
];

const DATE_FORMATS = [
    { value: 'Y-m-d', label: 'YYYY-MM-DD' },
    { value: 'd/m/Y', label: 'DD/MM/YYYY' },
    { value: 'm/d/Y', label: 'MM/DD/YYYY' },
    { value: 'd-m-Y', label: 'DD-MM-YYYY' },
    { value: 'M d, Y', label: 'Mon DD, YYYY' },
];

const SMS_PROVIDERS = [
    { value: 'twilio',        label: 'Twilio' },
    { value: 'nexmo',         label: 'Nexmo' },
    { value: 'vonage',        label: 'Vonage' },
    { value: 'africastalking', label: "Africa's Talking" },
    { value: 'custom',        label: 'Custom' },
];

const SMS_PROVIDER_HINTS: Record<string, { apiKey: string; apiSecret: string; from: string }> = {
    twilio:        { apiKey: 'Account SID', apiSecret: 'Auth Token', from: 'Twilio Phone Number (e.g. +15550001234)' },
    nexmo:         { apiKey: 'API Key', apiSecret: 'API Secret', from: 'Sender Name / Number' },
    vonage:        { apiKey: 'API Key', apiSecret: 'API Secret', from: 'Sender Name / Number' },
    africastalking: { apiKey: 'Username', apiSecret: 'API Key', from: 'Sender ID / Shortcode' },
    custom:        { apiKey: 'API Key', apiSecret: 'API Secret', from: 'From Number / Name' },
};

const TABS = [
    { id: 'general',    label: 'General',    icon: Building2 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'regional',   label: 'Regional',   icon: Globe },
    { id: 'payroll',    label: 'Payroll',    icon: Wallet },
    { id: 'email',      label: 'Email',      icon: Mail },
    { id: 'sms',        label: 'SMS',        icon: MessageSquare },
    { id: 'system',     label: 'System',     icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─── Password field with toggle ───────────────────────────────────────────────

function PasswordInput({
    id,
    value,
    onChange,
    placeholder,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pr-10"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                tabIndex={-1}
            >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
}

// ─── Select helper ────────────────────────────────────────────────────────────

function Select({
    id,
    value,
    onChange,
    children,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
}) {
    return (
        <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {children}
        </select>
    );
}

// ─── Flash Banner ─────────────────────────────────────────────────────────────

function FlashBanner() {
    const { flash } = usePage().props as any;
    if (!flash?.success && !flash?.error) return null;
    return (
        <div
            className={cn(
                'rounded-lg px-4 py-3 text-sm font-medium mb-5',
                flash?.success
                    ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
            )}
        >
            {flash?.success ?? flash?.error}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemSettingsIndex({ settings, license }: Props) {
    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [showSmsSecret, setShowSmsSecret] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoMsg, setLogoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [testEmailAddress, setTestEmailAddress] = useState('');
    const [testEmailSending, setTestEmailSending] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        // General
        org_name:             settings.org_name             ?? '',
        org_email:            settings.org_email            ?? '',
        org_phone:            settings.org_phone            ?? '',
        org_address:          settings.org_address          ?? '',
        // Payroll
        financial_year_start: settings.financial_year_start ?? '1',
        // Regional
        timezone:             settings.timezone             ?? 'UTC',
        date_format:          settings.date_format          ?? 'Y-m-d',
        currency:             settings.currency             ?? 'SLL',
        currency_symbol:      settings.currency_symbol      ?? 'Le',
        // Appearance
        app_name:             settings.app_name             ?? 'Syscend-HRM',
        primary_color:        settings.primary_color        ?? '#2563eb',
        footer_copyright:     settings.footer_copyright     ?? `© ${new Date().getFullYear()} Syscend-HRM. All rights reserved.`,
        // Email
        mail_mailer:          settings.mail_mailer          ?? 'smtp',
        mail_host:            settings.mail_host            ?? '',
        mail_port:            settings.mail_port            ?? '587',
        mail_username:        settings.mail_username        ?? '',
        mail_password:        settings.mail_password        ?? '',
        mail_encryption:      settings.mail_encryption      ?? 'tls',
        mail_from_address:    settings.mail_from_address    ?? '',
        mail_from_name:       settings.mail_from_name       ?? 'Syscend-HRM',
        // SMS
        sms_provider:         settings.sms_provider         ?? 'twilio',
        sms_api_key:          settings.sms_api_key          ?? '',
        sms_api_secret:       settings.sms_api_secret       ?? '',
        sms_from:             settings.sms_from             ?? '',
        sms_enabled:          settings.sms_enabled === '1' || (settings.sms_enabled as any) === true ? true : false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/settings');
    }

    // Logo upload via fetch + FormData
    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoUploading(true);
        setLogoMsg(null);
        const formData = new FormData();
        formData.append('logo', file);
        // Get CSRF token from meta tag
        const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        const csrfToken = csrfMeta?.content ?? '';
        try {
            const res = await fetch('/admin/settings/upload-logo', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
                body: formData,
            });
            if (res.ok) {
                setLogoMsg({ type: 'success', text: 'Logo uploaded successfully. Reload to see changes.' });
                // Reload after brief delay so user sees message
                setTimeout(() => window.location.reload(), 1500);
            } else {
                const json = await res.json().catch(() => ({}));
                setLogoMsg({ type: 'error', text: json?.message ?? 'Upload failed.' });
            }
        } catch {
            setLogoMsg({ type: 'error', text: 'Network error during upload.' });
        } finally {
            setLogoUploading(false);
            // Reset input so same file can be re-selected
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    }

    // Test email
    async function handleTestEmail(e: React.FormEvent) {
        e.preventDefault();
        if (!testEmailAddress) return;
        setTestEmailSending(true);
        const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        const csrfToken = csrfMeta?.content ?? '';
        const formData = new FormData();
        formData.append('test_email', testEmailAddress);
        try {
            const res = await fetch('/admin/settings/test-email', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
                body: formData,
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok) {
                // Flash is server-side; show local alert
                alert(json?.message ?? 'Test email sent.');
            } else {
                alert(json?.message ?? 'Failed to send test email.');
            }
        } catch {
            alert('Network error when sending test email.');
        } finally {
            setTestEmailSending(false);
        }
    }

    const smsHints = SMS_PROVIDER_HINTS[data.sms_provider] ?? SMS_PROVIDER_HINTS.custom;
    const currentLogoPath = settings.logo_path;

    // Database backup
    async function handleBackup(e: React.FormEvent) {
        e.preventDefault();
        setBackingUp(true);
        const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        const csrfToken = csrfMeta?.content ?? '';
        try {
            const res = await fetch('/admin/settings/backup-database', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? 'syscendhrm-backup.sql';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                const json = await res.json().catch(() => ({}));
                alert(json?.message ?? 'Backup failed.');
            }
        } catch {
            alert('Network error during backup.');
        } finally {
            setBackingUp(false);
        }
    }

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Configure organisation-wide settings</p>
                </div>

                {/* Flash banner */}
                <FlashBanner />

                <form onSubmit={submit}>
                    {/* Tab bar — scrollable on small screens */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5 overflow-x-auto">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActiveTab(id)}
                                className={cn(
                                    'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                                    activeTab === id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white',
                                )}
                            >
                                <Icon size={15} /> {label}
                            </button>
                        ))}
                    </div>

                    {/* ── General Tab ── */}
                    {activeTab === 'general' && (
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 size={16} className="text-blue-600" /> Organisation Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="org_name">Organisation Name</Label>
                                        <Input id="org_name" value={data.org_name} onChange={(e) => setData('org_name', e.target.value)} />
                                        {errors.org_name && <p className="text-xs text-red-500">{errors.org_name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="org_email">Organisation Email</Label>
                                        <Input id="org_email" type="email" value={data.org_email} onChange={(e) => setData('org_email', e.target.value)} />
                                        {errors.org_email && <p className="text-xs text-red-500">{errors.org_email}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="org_phone">Phone Number</Label>
                                        <Input id="org_phone" value={data.org_phone} onChange={(e) => setData('org_phone', e.target.value)} placeholder="+1 555 000 0000" />
                                        {errors.org_phone && <p className="text-xs text-red-500">{errors.org_phone}</p>}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="org_address">Address</Label>
                                    <textarea
                                        id="org_address"
                                        rows={3}
                                        value={data.org_address}
                                        onChange={(e) => setData('org_address', e.target.value)}
                                        placeholder="Full office address…"
                                        className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                    {errors.org_address && <p className="text-xs text-red-500">{errors.org_address}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Appearance Tab ── */}
                    {activeTab === 'appearance' && (
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Palette size={16} className="text-blue-600" /> Appearance & Branding
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* App name + footer */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="app_name">Application Name</Label>
                                        <Input
                                            id="app_name"
                                            value={data.app_name}
                                            onChange={(e) => setData('app_name', e.target.value)}
                                            placeholder="Syscend-HRM"
                                        />
                                        <p className="text-xs text-slate-400">Shown in sidebar header and browser tab.</p>
                                        {errors.app_name && <p className="text-xs text-red-500">{errors.app_name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="footer_copyright">Footer Copyright</Label>
                                        <Input
                                            id="footer_copyright"
                                            value={data.footer_copyright}
                                            onChange={(e) => setData('footer_copyright', e.target.value)}
                                            placeholder={`© ${new Date().getFullYear()} Syscend-HRM. All rights reserved.`}
                                        />
                                        <p className="text-xs text-slate-400">Shown at the bottom of the sidebar.</p>
                                        {errors.footer_copyright && <p className="text-xs text-red-500">{errors.footer_copyright}</p>}
                                    </div>
                                </div>

                                {/* Brand color */}
                                <div className="space-y-2">
                                    <Label>Primary Brand Colour</Label>
                                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={data.primary_color ?? '#2563eb'}
                                                onChange={(e) => setData('primary_color', e.target.value)}
                                                className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Input
                                                id="primary_color"
                                                value={data.primary_color ?? '#2563eb'}
                                                onChange={(e) => setData('primary_color', e.target.value)}
                                                placeholder="#2563eb"
                                                maxLength={7}
                                                className="w-32 font-mono text-sm"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">Used for sidebar brand, login accent and buttons.</p>
                                        </div>
                                        {/* Live preview swatch */}
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg shadow-sm border border-slate-200" style={{ backgroundColor: data.primary_color ?? '#2563eb' }} />
                                            <div className="text-xs text-slate-500 font-mono">{data.primary_color ?? '#2563eb'}</div>
                                        </div>
                                        {errors.primary_color && <p className="text-xs text-red-500">{errors.primary_color}</p>}
                                    </div>
                                </div>

                                {/* Logo upload */}
                                <div className="space-y-2">
                                    <Label>Organisation Logo</Label>
                                    <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                                        {/* Preview */}
                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                                            {currentLogoPath ? (
                                                <img
                                                    src={`/storage/${currentLogoPath}`}
                                                    alt="Current logo"
                                                    className="h-12 w-12 object-contain"
                                                />
                                            ) : (
                                                <ImageIcon size={24} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                                {currentLogoPath ? 'Logo uploaded' : 'No logo set'}
                                            </p>
                                            <p className="text-xs text-slate-400 mb-2">PNG, JPG, SVG or WebP. Max 2 MB.</p>
                                            <input
                                                ref={logoInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                                className="hidden"
                                                onChange={handleLogoUpload}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={logoUploading}
                                                onClick={() => logoInputRef.current?.click()}
                                                className="gap-1.5 text-xs"
                                            >
                                                <ImageIcon size={13} />
                                                {logoUploading ? 'Uploading…' : 'Choose Logo'}
                                            </Button>
                                        </div>
                                    </div>
                                    {logoMsg && (
                                        <p className={cn('text-xs', logoMsg.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
                                            {logoMsg.text}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Regional Tab ── */}
                    {activeTab === 'regional' && (
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Globe size={16} className="text-blue-600" /> Regional Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Timezone */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select id="timezone" value={data.timezone} onChange={(v) => setData('timezone', v)}>
                                            {TIMEZONES.map((tz) => (
                                                <option key={tz} value={tz}>{tz}</option>
                                            ))}
                                        </Select>
                                        {errors.timezone && <p className="text-xs text-red-500">{errors.timezone}</p>}
                                    </div>

                                    {/* Date format */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="date_format">Date Format</Label>
                                        <Select id="date_format" value={data.date_format} onChange={(v) => setData('date_format', v)}>
                                            {DATE_FORMATS.map((f) => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </Select>
                                        {errors.date_format && <p className="text-xs text-red-500">{errors.date_format}</p>}
                                    </div>

                                    {/* Currency */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="currency">Currency Code</Label>
                                        <Input id="currency" value={data.currency} onChange={(e) => setData('currency', e.target.value)} placeholder="SLL" maxLength={10} />
                                        {errors.currency && <p className="text-xs text-red-500">{errors.currency}</p>}
                                    </div>

                                    {/* Currency symbol */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="currency_symbol">Currency Symbol</Label>
                                        <Input id="currency_symbol" value={data.currency_symbol} onChange={(e) => setData('currency_symbol', e.target.value)} placeholder="Le" maxLength={10} />
                                        {errors.currency_symbol && <p className="text-xs text-red-500">{errors.currency_symbol}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Payroll Tab ── */}
                    {activeTab === 'payroll' && (
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wallet size={16} className="text-blue-600" /> Payroll Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="max-w-xs space-y-1.5">
                                    <Label htmlFor="financial_year_start">Financial Year Start Month</Label>
                                    <Select id="financial_year_start" value={data.financial_year_start} onChange={(v) => setData('financial_year_start', v)}>
                                        {MONTH_NAMES.map((month, idx) => (
                                            <option key={idx + 1} value={String(idx + 1)}>{month}</option>
                                        ))}
                                    </Select>
                                    {errors.financial_year_start && <p className="text-xs text-red-500">{errors.financial_year_start}</p>}
                                    <p className="text-xs text-slate-400">The first month of your organisation's financial year.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Email (SMTP) Tab ── */}
                    {activeTab === 'email' && (
                        <div className="space-y-4">
                            <Card className="border-slate-200 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Mail size={16} className="text-blue-600" /> Email / SMTP Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Mailer */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mail_mailer">Mailer</Label>
                                            <Select id="mail_mailer" value={data.mail_mailer} onChange={(v) => setData('mail_mailer', v)}>
                                                <option value="smtp">SMTP</option>
                                                <option value="sendmail">Sendmail</option>
                                                <option value="log">Log (dev only)</option>
                                            </Select>
                                            {errors.mail_mailer && <p className="text-xs text-red-500">{errors.mail_mailer}</p>}
                                        </div>

                                        {/* Encryption */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mail_encryption">Encryption</Label>
                                            <Select id="mail_encryption" value={data.mail_encryption} onChange={(v) => setData('mail_encryption', v)}>
                                                <option value="tls">TLS</option>
                                                <option value="ssl">SSL</option>
                                                <option value="starttls">STARTTLS</option>
                                                <option value="">None</option>
                                            </Select>
                                            {errors.mail_encryption && <p className="text-xs text-red-500">{errors.mail_encryption}</p>}
                                        </div>

                                        {/* Host */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mail_host">SMTP Host</Label>
                                            <Input id="mail_host" value={data.mail_host} onChange={(e) => setData('mail_host', e.target.value)} placeholder="smtp.mailprovider.com" />
                                            {errors.mail_host && <p className="text-xs text-red-500">{errors.mail_host}</p>}
                                        </div>

                                        {/* Port */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mail_port">Port</Label>
                                            <Input id="mail_port" type="number" value={data.mail_port} onChange={(e) => setData('mail_port', e.target.value)} placeholder="587" />
                                            {errors.mail_port && <p className="text-xs text-red-500">{errors.mail_port}</p>}
                                        </div>

                                        {/* Username */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mail_username">Username</Label>
                                            <Input id="mail_username" value={data.mail_username} onChange={(e) => setData('mail_username', e.target.value)} placeholder="user@mailprovider.com" />
                                            {errors.mail_username && <p className="text-xs text-red-500">{errors.mail_username}</p>}
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mail_password">Password</Label>
                                            <PasswordInput
                                                id="mail_password"
                                                value={data.mail_password}
                                                onChange={(v) => setData('mail_password', v)}
                                                placeholder="SMTP password"
                                            />
                                            {errors.mail_password && <p className="text-xs text-red-500">{errors.mail_password}</p>}
                                        </div>

                                        {/* From Address */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mail_from_address">From Address</Label>
                                            <Input id="mail_from_address" type="email" value={data.mail_from_address} onChange={(e) => setData('mail_from_address', e.target.value)} placeholder="noreply@yourcompany.com" />
                                            {errors.mail_from_address && <p className="text-xs text-red-500">{errors.mail_from_address}</p>}
                                        </div>

                                        {/* From Name */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mail_from_name">From Name</Label>
                                            <Input id="mail_from_name" value={data.mail_from_name} onChange={(e) => setData('mail_from_name', e.target.value)} placeholder="Syscend-HRM" />
                                            {errors.mail_from_name && <p className="text-xs text-red-500">{errors.mail_from_name}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Test Email */}
                            <Card className="border-slate-200 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Send size={16} className="text-blue-600" /> Send Test Email
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleTestEmail} className="flex items-start gap-2">
                                        <div className="flex-1 space-y-1.5">
                                            <Label htmlFor="test_email_address">Recipient Email</Label>
                                            <Input
                                                id="test_email_address"
                                                type="email"
                                                value={testEmailAddress}
                                                onChange={(e) => setTestEmailAddress(e.target.value)}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        <div className="pt-7">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={testEmailSending || !testEmailAddress}
                                                className="gap-1.5 bg-blue-600 hover:bg-blue-500"
                                            >
                                                <Send size={13} />
                                                {testEmailSending ? 'Sending…' : 'Send Test'}
                                            </Button>
                                        </div>
                                    </form>
                                    <p className="text-xs text-slate-400 mt-2">
                                        Saves current SMTP settings temporarily to send a test message. Save settings first for best results.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ── SMS Tab ── */}
                    {activeTab === 'sms' && (
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MessageSquare size={16} className="text-blue-600" /> SMS Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* SMS Enabled toggle */}
                                <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Enable SMS</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Turn on SMS notifications and alerts</p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={data.sms_enabled}
                                        onClick={() => setData('sms_enabled', !data.sms_enabled)}
                                        className={cn(
                                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                            data.sms_enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                                                data.sms_enabled ? 'translate-x-6' : 'translate-x-1',
                                            )}
                                        />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Provider */}
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="sms_provider">SMS Provider</Label>
                                        <Select id="sms_provider" value={data.sms_provider} onChange={(v) => setData('sms_provider', v)}>
                                            {SMS_PROVIDERS.map((p) => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </Select>
                                        {errors.sms_provider && <p className="text-xs text-red-500">{errors.sms_provider}</p>}
                                    </div>

                                    {/* Provider-specific hint */}
                                    <div className="sm:col-span-2">
                                        <div className="rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 text-xs text-blue-700 dark:text-blue-400 space-y-0.5">
                                            <p><span className="font-semibold">API Key field:</span> {smsHints.apiKey}</p>
                                            <p><span className="font-semibold">API Secret field:</span> {smsHints.apiSecret}</p>
                                            <p><span className="font-semibold">From field:</span> {smsHints.from}</p>
                                        </div>
                                    </div>

                                    {/* API Key */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sms_api_key">{smsHints.apiKey}</Label>
                                        <Input
                                            id="sms_api_key"
                                            value={data.sms_api_key}
                                            onChange={(e) => setData('sms_api_key', e.target.value)}
                                            placeholder={smsHints.apiKey}
                                        />
                                        {errors.sms_api_key && <p className="text-xs text-red-500">{errors.sms_api_key}</p>}
                                    </div>

                                    {/* API Secret */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sms_api_secret">{smsHints.apiSecret}</Label>
                                        <div className="relative">
                                            <Input
                                                id="sms_api_secret"
                                                type={showSmsSecret ? 'text' : 'password'}
                                                value={data.sms_api_secret}
                                                onChange={(e) => setData('sms_api_secret', e.target.value)}
                                                placeholder={smsHints.apiSecret}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSmsSecret((s) => !s)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                tabIndex={-1}
                                            >
                                                {showSmsSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                        {errors.sms_api_secret && <p className="text-xs text-red-500">{errors.sms_api_secret}</p>}
                                    </div>

                                    {/* From */}
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="sms_from">From (Number / Name)</Label>
                                        <Input
                                            id="sms_from"
                                            value={data.sms_from}
                                            onChange={(e) => setData('sms_from', e.target.value)}
                                            placeholder={smsHints.from}
                                        />
                                        {errors.sms_from && <p className="text-xs text-red-500">{errors.sms_from}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── System Tab ── */}
                    {activeTab === 'system' && (
                        <div className="space-y-4">
                            {/* Database backup */}
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <DatabaseBackup size={16} className="text-blue-600" /> Database Backup
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Download a full SQL dump of your database. Backups include all employees,
                                        payroll, attendance, documents and system settings. Run backups regularly
                                        and before major changes.
                                    </p>
                                    <Button
                                        onClick={handleBackup}
                                        disabled={backingUp}
                                        className="gap-2 bg-blue-600 hover:bg-blue-500"
                                    >
                                        <DatabaseBackup size={15} />
                                        {backingUp ? 'Creating backup…' : 'Download Database Backup'}
                                    </Button>
                                    <p className="text-xs text-slate-400 mt-2">
                                        Requires <span className="font-mono">mysqldump</span> to be available in your PATH.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* License */}
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <KeyRound size={16} className="text-blue-600" /> License
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {!license?.enabled ? (
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                            Licensing is disabled for this installation. Set{' '}
                                            <span className="font-mono text-xs">LICENSE_ENABLED=true</span> in your
                                            environment to activate licence enforcement.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                {license.valid ? (
                                                    <ShieldCheck size={16} className="text-emerald-600" />
                                                ) : (
                                                    <ShieldCheck size={16} className="text-red-500" />
                                                )}
                                                <span className={cn(
                                                    'text-sm font-medium',
                                                    license.valid ? 'text-emerald-700' : 'text-red-600',
                                                )}>
                                                    {license.valid ? 'Licensed' : 'Not licensed'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                <div className="rounded-lg border border-slate-200 px-3 py-2">
                                                    <p className="text-xs text-slate-400">Licensed to</p>
                                                    <p className="font-medium text-slate-900 mt-0.5">{license.holder || '—'}</p>
                                                </div>
                                                <div className="rounded-lg border border-slate-200 px-3 py-2">
                                                    <p className="text-xs text-slate-400">Expires</p>
                                                    <p className="font-medium text-slate-900 mt-0.5">
                                                        {license.expires_at ?? '—'}
                                                        {license.days_remaining !== null && license.valid && (
                                                            <span className="text-xs text-slate-400 font-normal ml-1">
                                                                ({license.days_remaining} day{license.days_remaining !== 1 ? 's' : ''} left)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {license.error && (
                                                <p className="text-xs text-red-500">{license.error}</p>
                                            )}
                                            <p className="text-xs text-slate-400">
                                                Configure the licence via <span className="font-mono">LICENSE_HOLDER</span> and{' '}
                                                <span className="font-mono">LICENSE_KEY</span> environment variables.
                                            </p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Save button — only relevant for non-logo uploads */}
                    <div className="flex justify-end mt-5">
                        <Button type="submit" disabled={processing} className="gap-2 bg-blue-600 hover:bg-blue-500">
                            <Save size={15} /> {processing ? 'Saving…' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
