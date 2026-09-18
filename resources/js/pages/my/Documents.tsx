import { router } from '@inertiajs/react';
import { Download, FileText, Building2, User, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Doc {
    id: number;
    type: 'personal' | 'company';
    title: string;
    category: string;
    file_name: string;
    file_size: number;
    description?: string | null;
    expiry_date: string | null;
    created_at: string;
    download_url: string;
    acknowledged?: boolean;
}

interface Props {
    myDocs: Doc[];
    companyDocs: Doc[];
    hasEmployee: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocRow({ doc, onAcknowledge }: { doc: Doc; onAcknowledge?: () => void }) {
    const today      = new Date().toISOString().slice(0, 10);
    const isExpired  = doc.expiry_date && doc.expiry_date < today;
    const isExpiring = doc.expiry_date && !isExpired && new Date(doc.expiry_date) <= new Date(Date.now() + 30 * 86400000);

    return (
        <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            {/* Icon */}
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-600 dark:text-blue-400" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{doc.title}</p>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded shrink-0">
                        {doc.category}
                    </span>
                    {isExpired && (
                        <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                            <AlertTriangle size={9} /> Expired
                        </span>
                    )}
                    {isExpiring && (
                        <span className="text-xs bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                            <Clock size={9} /> Expiring soon
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    <span>{doc.file_name}</span>
                    <span>·</span>
                    <span>{fmtSize(doc.file_size)}</span>
                    {doc.expiry_date && <><span>·</span><span>Expires {doc.expiry_date}</span></>}
                    <span>·</span>
                    <span>Added {doc.created_at}</span>
                </div>
                {doc.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{doc.description}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {doc.type === 'company' && !doc.acknowledged && onAcknowledge && (
                    <button
                        onClick={onAcknowledge}
                        className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                    >
                        <CheckCircle2 size={12} /> Acknowledge
                    </button>
                )}
                {doc.type === 'company' && doc.acknowledged && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <CheckCircle2 size={12} className="text-green-500" /> Acknowledged
                    </span>
                )}
                <a
                    href={doc.download_url}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    <Download size={12} /> Download
                </a>
            </div>
        </div>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MyDocuments({ myDocs, companyDocs, hasEmployee }: Props) {
    function acknowledge(docId: number) {
        router.post(`/documents/${docId}/acknowledge`, {}, { preserveScroll: true });
    }

    const totalDocs = myDocs.length + companyDocs.length;
    const unacknowledged = companyDocs.filter(d => !d.acknowledged).length;

    if (!hasEmployee) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                        <FileText size={28} className="text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Employee Record Linked</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                        Your account isn't linked to an employee profile. Contact HR to set this up.
                    </p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Documents</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {totalDocs} document{totalDocs !== 1 ? 's' : ''}
                            {unacknowledged > 0 && (
                                <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">· {unacknowledged} need acknowledgement</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Summary row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'My HR Files',        value: myDocs.length,      icon: User,       color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-900/30' },
                        { label: 'Company Documents',   value: companyDocs.length, icon: Building2,  color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                        { label: 'Needs Acknowledgement', value: unacknowledged,   icon: CheckCircle2,color: 'text-amber-600 dark:text-amber-400',bg: 'bg-amber-50 dark:bg-amber-900/30' },
                    ].map(k => (
                        <Card key={k.label} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{k.label}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{k.value}</p>
                                    </div>
                                    <div className={cn('p-2 rounded-xl shrink-0', k.bg)}>
                                        <k.icon size={16} className={k.color} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* My personal HR documents */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400" />
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">My HR Files</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {myDocs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No personal documents yet</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">HR will upload your contracts, offer letters, and certificates here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {myDocs.map(doc => <DocRow key={doc.id} doc={doc} />)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Company-wide documents */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-slate-400" />
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Documents</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {companyDocs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Building2 size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No company documents shared yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {companyDocs.map(doc => (
                                    <DocRow key={doc.id} doc={doc} onAcknowledge={() => acknowledge(doc.id)} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
