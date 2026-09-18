import { useForm, usePage, Link } from '@inertiajs/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PageProps } from '@/types';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { app_settings } = usePage<PageProps>().props as any;

    const appName     = app_settings?.app_name ?? 'Syscend-HRM';
    const logoPath    = app_settings?.logo_path;
    const brandColor  = app_settings?.primary_color ?? '#2563eb';

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <Link href="/" title="Back to home" className="inline-block">
                        {logoPath ? (
                            <img src={`/storage/${logoPath}`} alt={appName} className="h-12 w-auto mx-auto mb-4" />
                        ) : (
                            <div
                                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
                                style={{ backgroundColor: brandColor }}
                            >
                                <span className="text-white font-bold text-xl">{appName.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">{appName}</h1>
                    <p className="text-slate-500 text-sm mt-1">Human Resource Management System</p>
                </div>

                <Card className="border-slate-200 bg-white shadow-xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl text-slate-900">Sign in to your account</CardTitle>
                        <CardDescription className="text-slate-500">
                            Enter your credentials to access the system
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-slate-700">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    placeholder="you@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-300 ${
                                        errors.email ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700">
                                        Password
                                    </Label>
                                    <a
                                        href="#"
                                        className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-300 pr-10 ${
                                            errors.password ? 'border-red-500' : ''
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                />
                                <Label htmlFor="remember" className="text-slate-500 text-sm cursor-pointer">
                                    Keep me signed in
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full text-white font-medium h-10 mt-2"
                                style={{ backgroundColor: brandColor }}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        Signing in…
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </form>

                        {/* Demo credentials */}
                        <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden">
                            <div className="px-3 py-2 border-b border-slate-200">
                                <p className="text-xs font-semibold text-slate-700">Demo Accounts</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Password for all: <span className="text-slate-500 font-mono">Admin@1234</span></p>
                            </div>
                            <div className="divide-y divide-slate-200">
                                {[
                                    { role: 'HR Manager', email: 'hr@syscendhrm.test',       color: 'text-purple-600' },
                                    { role: 'Manager',    email: 'manager@syscendhrm.test',  color: 'text-emerald-600' },
                                    { role: 'Employee',   email: 'employee@syscendhrm.test', color: 'text-amber-600' },
                                    { role: 'Recruiter',  email: 'recruiter@syscendhrm.test',color: 'text-rose-600' },
                                    { role: 'Finance',    email: 'finance@syscendhrm.test',  color: 'text-teal-600' },
                                ].map(({ role, email, color }) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => { setData('email', email); setData('password', 'Admin@1234'); }}
                                        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-100 transition-colors text-left group"
                                    >
                                        <span className={`text-xs font-medium ${color}`}>{role}</span>
                                        <span className="text-[10px] text-slate-400 group-hover:text-slate-500 font-mono truncate max-w-[180px]">{email}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-400 text-xs mt-6">
                    © {new Date().getFullYear()} {appName}
                </p>
            </div>
        </div>
    );
}