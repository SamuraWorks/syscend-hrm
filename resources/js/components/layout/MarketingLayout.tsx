import { Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, Mail, MapPin, Rocket, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SYS_BRAND } from '@/lib/syscend-brand';

const NAV_LINKS = [
    { label: 'Home',         href: '/' },
    { label: 'Features',     href: '/features' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing',      href: '/pricing' },
    { label: 'Demo',         href: '/login' },
    { label: 'Contact',      href: '/contact' },
];

function BrandLogo(cendLogo: string | null, appName: string, brandColor: string) {
    return cendLogo ? (
        <img src={`/storage/${cendLogo}`} alt={appName} className="h-8 w-auto object-contain" />
    ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm" style={{ backgroundColor: brandColor }}>
            <span className="text-white text-sm font-bold">{appName.charAt(0).toUpperCase()}</span>
        </div>
    );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-3" title="Back to home">
                        {BrandLogo(SYS_BRAND.logoPath, SYS_BRAND.name, SYS_BRAND.primaryColor)}
                        <span className="font-semibold text-slate-900 text-sm">{SYS_BRAND.name}</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.label} href={link.href} className="hover:text-slate-900 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-2.5">
                        <Button asChild variant="outline" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                            <Link href="/login">Try the demo</Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-medium">
                            <Link href="/get-started">Get Syscend-HRM <ArrowRight size={15} className="ml-1" /></Link>
                        </Button>
                    </div>
                </div>

                {/* Mobile nav links */}
                <nav className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-slate-100 px-6 py-2.5 text-sm text-slate-600">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.label} href={link.href} className="whitespace-nowrap hover:text-slate-900 transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile CTA row */}
                <div className="border-t border-slate-100 px-6 py-2.5 flex md:hidden items-center gap-2.5">
                    <Button asChild variant="outline" size="sm" className="flex-1 border-slate-300 bg-white text-slate-700">
                        <Link href="/login" className="w-full">Try the demo</Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                        <Link href="/get-started" className="w-full">Get Syscend-HRM</Link>
                    </Button>
                </div>
            </header>

            <main>{children}</main>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-6xl px-6 py-14">
                    <div className="grid gap-10 md:grid-cols-12">
                        {/* Brand */}
                        <div className="md:col-span-4">
                            <div className="flex items-center gap-2.5">
                                {BrandLogo(SYS_BRAND.logoPath, SYS_BRAND.name, SYS_BRAND.primaryColor)}
                                <span className="font-semibold text-slate-900 text-sm">{SYS_BRAND.name}</span>
                            </div>
                            <p className="mt-4 max-w-xs text-sm text-slate-500 leading-relaxed">
                                {SYS_BRAND.tagline}. Deployed and fully branded for your organisation, with real users,
                                real data and no subscriptions.
                            </p>
                            <ul className="mt-5 space-y-2 text-sm text-slate-500">
                                <li className="flex items-center gap-2.5">
                                    <MapPin size={14} className="text-slate-400" /> {SYS_BRAND.location}
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Mail size={14} className="text-slate-400" />
                                    <a href={`mailto:${SYS_BRAND.email}`} className="hover:text-blue-600 transition-colors">{SYS_BRAND.email}</a>
                                </li>
                            </ul>
                        </div>

                        {/* Product */}
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-semibold text-slate-900">Product</h4>
                            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                                <li><Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-blue-600 transition-colors">How it works</Link></li>
                                <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                                <li><Link href="/login" className="hover:text-blue-600 transition-colors">Demo workspace</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div className="md:col-span-3">
                            <h4 className="text-sm font-semibold text-slate-900">Company</h4>
                            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                                <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
                                <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-slate-400" /> Self-hosted &amp; open source</li>
                                <li className="flex items-center gap-2"><Rocket size={14} className="text-slate-400" /> Deployment &amp; training</li>
                                <li className="flex items-center gap-2"><Briefcase size={14} className="text-slate-400" /> One-time license</li>
                            </ul>
                        </div>

                        {/* Demo */}
                        <div className="md:col-span-3">
                            <h4 className="text-sm font-semibold text-slate-900">Try it right now</h4>
                            <p className="mt-4 text-sm text-slate-500">Explore the demo workspace — every account's password is</p>
                            <p className="mt-1.5 inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">Admin@1234</p>
                            <div className="mt-3 space-y-1 text-xs text-slate-400">
                                <p>admin@syscendhrm.test</p>
                                <p>hr@syscendhrm.test</p>
                            </div>
                            <Button asChild size="sm" className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-medium">
                                <Link href="/login">Open the demo <ArrowRight size={14} className="ml-1" /></Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
                        <p className="text-xs text-slate-400">{SYS_BRAND.copyright()}</p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            Powered by Syscend
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}