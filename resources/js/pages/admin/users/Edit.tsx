import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Role { id: number; name: string }

interface UserData {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Props {
    user: UserData;
    roles: Role[];
}

export default function UserEdit({ user, roles }: Props) {
    const [showPwd, setShowPwd] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name:     user.name,
        email:    user.email,
        password: '',
        role:     user.roles[0]?.name ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-5">
                <div className="flex items-center gap-3">
                    <Link href="/admin/users" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={15} /> Back to Users
                    </Link>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit User</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Update user details for {user.name}.</p>
                </div>

                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-base">User Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            {/* Password (optional) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">
                                    New Password
                                    <span className="ml-1.5 text-xs text-slate-400 font-normal">(leave blank to keep current)</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPwd ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>

                            {/* Role */}
                            <div className="space-y-1.5">
                                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a role…</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/users">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
