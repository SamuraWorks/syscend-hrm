import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

// ─── Portal header ────────────────────────────────────────────────────────────

export function PortalHeader({
    name,
    portalLabel,
    subtitle,
    badgeText,
    badgeColor,
}: {
    name: string;
    portalLabel: string;
    subtitle: string;
    badgeText?: string;
    badgeColor?: string;
}) {
    return (
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {greeting()}, {name.split(' ')[0]}
                </h1>
                <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            </div>
            <Badge
                variant="secondary"
                className={cn('text-xs px-3 py-1', badgeColor)}
            >
                {badgeText ?? portalLabel}
            </Badge>
        </div>
    );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

export function KpiCard({
    label,
    value,
    sub,
    subPositive = true,
    icon: Icon,
    color,
    bg,
    href,
}: {
    label: string;
    value: string | number;
    sub?: string;
    subPositive?: boolean;
    icon: React.ElementType;
    color: string;
    bg: string;
    href: string;
}) {
    return (
        <Link href={href}>
            <Card className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1 leading-none">{value}</p>
                            {sub && (
                                <p className={cn('text-xs mt-1.5 flex items-center gap-0.5', subPositive ? 'text-emerald-600' : 'text-amber-600')}>
                                    {sub}
                                </p>
                            )}
                        </div>
                        <div className={cn('p-2 rounded-xl shrink-0', bg)}>
                            <Icon size={18} className={color} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

// ─── Quick action row ─────────────────────────────────────────────────────────

export function QuickAction({
    label,
    href,
    icon: Icon,
    description,
}: {
    label: string;
    href: string;
    icon: React.ElementType;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
        >
            <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
                <Icon size={15} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-500 truncate">{description}</p>
            </div>
            <ArrowUpRight size={13} className="text-slate-400 group-hover:text-blue-500 shrink-0" />
        </Link>
    );
}

// ─── Section card ─────────────────────────────────────────────────────────────

export function SectionCard({
    title,
    actionLabel,
    actionHref,
    children,
}: {
    title: string;
    actionLabel?: string;
    actionHref?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 px-5 py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">{title}</CardTitle>
                {actionLabel && actionHref && (
                    <Link href={actionHref} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                        {actionLabel} <ArrowUpRight size={11} />
                    </Link>
                )}
            </CardHeader>
            <CardContent className="p-0">{children}</CardContent>
        </Card>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({
    icon: Icon,
    message,
    hint,
}: {
    icon: React.ElementType;
    message: string;
    hint?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
            <Icon size={22} className="mb-2 opacity-40" />
            <p className="text-sm">{message}</p>
            {hint && <p className="text-xs mt-1 text-slate-400">{hint}</p>}
        </div>
    );
}

// ─── Status dot for lists ─────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
    pending:   { label: 'Pending',   cls: 'bg-amber-100  text-amber-700'  },
    approved:  { label: 'Approved',  cls: 'bg-green-100  text-green-700'  },
    rejected:  { label: 'Rejected',  cls: 'bg-red-100    text-red-700'    },
    cancelled: { label: 'Cancelled', cls: 'bg-slate-100  text-slate-600'  },
    paid:      { label: 'Paid',      cls: 'bg-green-100  text-green-700'  },
    new:       { label: 'New',       cls: 'bg-blue-100   text-blue-700'   },
    shortlisted: { label: 'Shortlisted', cls: 'bg-indigo-100 text-indigo-700' },
    interviewed: { label: 'Interviewed', cls: 'bg-purple-100 text-purple-700' },
    offered:   { label: 'Offered',   cls: 'bg-teal-100   text-teal-700'   },
};

export function StatusBadge({ status }: { status: string }) {
    const s = STATUS_STYLE[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
    return (
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', s.cls)}>
            {s.label}
        </span>
    );
}
