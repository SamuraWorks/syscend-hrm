import { Link } from '@inertiajs/react';
import { ShieldOff } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
    return (
        <AppLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                    <ShieldOff size={28} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">
                    You don't have permission to access this page. Contact your administrator if you believe this is a mistake.
                </p>
                <Button asChild>
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
