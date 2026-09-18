import { useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    user: { name: string; email: string };
}

export default function ProfileEdit({ user }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name:  user.name,
        email: user.email,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put('/profile');
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-5">
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <User size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
                        <p className="text-sm text-slate-500">Update your name and email address.</p>
                    </div>
                </div>

                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Your name"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                                    {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                                    Save Changes
                                </Button>
                                {recentlySuccessful && (
                                    <span className="text-sm text-emerald-600 font-medium">Saved!</span>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="pt-1">
                    <Link
                        href="/profile/password"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Want to change your password?
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
