import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { app_settings } = usePage<PageProps>().props as any;
    const appName     = app_settings?.app_name ?? 'Syscend-HRM';
    const logoPath    = app_settings?.logo_path;
    const brandColor  = app_settings?.primary_color ?? '#2563eb';
    const copyright   = app_settings?.footer_copyright ?? `© ${new Date().getFullYear()} ${appName}. All rights reserved.`;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
<Link href="/" className="flex items-center gap-3" title="Back to home">
                    {logoPath ? (
                        <img src={`/storage/${logoPath}`} alt={appName} className="h-6 w-auto object-contain" />
                    ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: brandColor }}>
                            <span className="text-white text-xs font-bold">{appName.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <span className="font-semibold text-slate-900 text-sm">{appName}</span>
                </Link>
                    <span className="text-slate-300 text-sm">/</span>
                    <span className="text-slate-500 text-sm">Careers</span>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
            <footer className="border-t border-slate-200 mt-16 py-6 text-center text-xs text-slate-400">
                {copyright}
            </footer>
        </div>
    );
}