import { useForm } from '@inertiajs/react';
import { Shield, Loader2, ExternalLink } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    settings: Record<string, string | null>;
}

export default function AdminSettings({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        recaptcha_enabled:    settings.recaptcha_enabled === '1' || settings.recaptcha_enabled === 'true',
        recaptcha_site_key:   settings.recaptcha_site_key   ?? '',
        recaptcha_secret_key: settings.recaptcha_secret_key ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/settings');
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">Configure integrations and system-wide options.</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* reCAPTCHA */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Shield size={16} className="text-blue-600" />
                                Google reCAPTCHA v2
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-1">
                                Protects the public job application form from bots.{' '}
                                <a
                                    href="https://www.google.com/recaptcha/admin"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                                >
                                    Get keys <ExternalLink size={11} />
                                </a>
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Enable toggle */}
                            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Enable reCAPTCHA</p>
                                    <p className="text-xs text-slate-500">Show reCAPTCHA on public job applications</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('recaptcha_enabled', !data.recaptcha_enabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        data.recaptcha_enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                            data.recaptcha_enabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Site Key (public)</Label>
                                <Input
                                    value={data.recaptcha_site_key}
                                    onChange={(e) => setData('recaptcha_site_key', e.target.value)}
                                    placeholder="6LeIxAcT..."
                                    disabled={!data.recaptcha_enabled}
                                    className="font-mono text-sm"
                                />
                                {errors.recaptcha_site_key && <p className="text-xs text-red-500">{errors.recaptcha_site_key}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Secret Key (private)</Label>
                                <Input
                                    type="password"
                                    value={data.recaptcha_secret_key}
                                    onChange={(e) => setData('recaptcha_secret_key', e.target.value)}
                                    placeholder="6LeIxAcT..."
                                    disabled={!data.recaptcha_enabled}
                                    className="font-mono text-sm"
                                />
                                {errors.recaptcha_secret_key && <p className="text-xs text-red-500">{errors.recaptcha_secret_key}</p>}
                                <p className="text-xs text-slate-400">Never share the secret key. It is verified server-side only.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Public careers link */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <ExternalLink size={16} className="text-blue-600" />
                                Public Careers Page
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Share this link with candidates to view open positions and apply online.
                            </p>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                                <span className="text-sm font-mono text-slate-700 dark:text-slate-300 flex-1 truncate">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/careers
                                </span>
                                <a
                                    href="/careers"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex-shrink-0 flex items-center gap-0.5"
                                >
                                    Open <ExternalLink size={11} />
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                            {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Save Settings
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
