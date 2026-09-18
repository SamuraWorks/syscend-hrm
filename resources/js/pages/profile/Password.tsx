import { useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function PasswordField({
    label, value, onChange, error, placeholder = '••••••••',
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</Label>
            <div className="relative">
                <Input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default function ProfilePassword() {
    const { data, setData, put, processing, errors, recentlySuccessful, reset } = useForm({
        current_password: '',
        password:         '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put('/profile/password', {
            onSuccess: () => reset(),
        });
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-5">
                <Link href="/profile" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={15} /> Back to Profile Settings
                </Link>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                        <KeyRound size={20} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h1>
                        <p className="text-sm text-slate-500">Make sure your new password is at least 8 characters.</p>
                    </div>
                </div>

                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Update Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <PasswordField
                                label="Current Password"
                                value={data.current_password}
                                onChange={(v) => setData('current_password', v)}
                                error={errors.current_password}
                            />
                            <PasswordField
                                label="New Password"
                                value={data.password}
                                onChange={(v) => setData('password', v)}
                                error={errors.password}
                                placeholder="Min 8 chars, mixed case + numbers"
                            />
                            <PasswordField
                                label="Confirm New Password"
                                value={data.password_confirmation}
                                onChange={(v) => setData('password_confirmation', v)}
                                error={errors.password_confirmation}
                            />

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                                    {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                                    Update Password
                                </Button>
                                {recentlySuccessful && (
                                    <span className="text-sm text-emerald-600 font-medium">Password updated!</span>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Password must be at least 8 characters and include uppercase, lowercase, and a number.
                </p>
            </div>
        </AppLayout>
    );
}
