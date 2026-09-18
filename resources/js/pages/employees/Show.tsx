import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Building2, CalendarDays, Edit, FileText, Mail, MapPin, Phone, Trash2, User } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
    Active:      'bg-emerald-100 text-emerald-700',
    Inactive:    'bg-slate-100 text-slate-600',
    'On Leave':  'bg-amber-100 text-amber-700',
    Terminated:  'bg-red-100 text-red-600',
};

interface Employee {
    id: number; employee_id: string; first_name: string; last_name: string;
    email: string; phone: string | null; dob: string | null; gender: string | null;
    nationality: string | null; address: string | null; city: string | null;
    state: string | null; country: string | null; postal_code: string | null;
    date_of_joining: string | null; contract_type: string; employment_status: string;
    salary: string | null; department: { name: string } | null;
    position: { name: string } | null;
    reporting_manager: { first_name: string; last_name: string; employee_id: string } | null;
    documents: { id: number; document_type: string; file_name: string; file_size: number | null; created_at: string }[];
    history: { id: number; field_name: string; old_value: string | null; new_value: string | null; changed_at: string; changed_by: { name: string } | null }[];
    created_at: string;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Icon size={13} className="text-slate-500" />
            </div>
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{value || '—'}</p>
            </div>
        </div>
    );
}

export default function EmployeeShow({ employee }: { employee: Employee }) {
    const [tab, setTab] = useState<'overview' | 'documents' | 'history'>('overview');
    const [confirmDelete, setConfirmDelete] = useState(false);

    function handleDelete() {
        router.delete(`/employees/${employee.id}`, {
            onSuccess: () => router.visit('/employees'),
        });
    }

    const fullName = `${employee.first_name} ${employee.last_name}`;
    const initials = `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase();

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-5">

                {/* Back + actions */}
                <div className="flex items-center justify-between">
                    <Link href="/employees" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={15} /> Back to Employees
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={`/employees/${employee.id}/edit`}>
                                <Edit size={13} /> Edit
                            </Link>
                        </Button>
                        {!confirmDelete ? (
                            <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                                <Trash2 size={13} /> Remove
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                <span className="text-xs text-red-700">Confirm?</span>
                                <button onClick={handleDelete} className="text-xs font-semibold text-red-600 hover:text-red-800">Yes</button>
                                <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500">Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile header */}
                <Card className="border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-5">
                            <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between flex-wrap gap-3">
                                    <div>
                                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
                                        <p className="text-slate-500 text-sm mt-0.5">{employee.position?.name ?? 'No Position'} · {employee.department?.name ?? 'No Department'}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-mono">{employee.employee_id}</p>
                                    </div>
                                    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', statusColors[employee.employment_status])}>
                                        {employee.employment_status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                                    <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" />{employee.email}</span>
                                    {employee.phone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" />{employee.phone}</span>}
                                    {employee.department && <span className="flex items-center gap-1.5"><Building2 size={13} className="text-slate-400" />{employee.department.name}</span>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {(['overview', 'documents', 'history'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                'px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
                                tab === t
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-900',
                            )}
                        >
                            {t}
                            {t === 'documents' && <span className="ml-1.5 text-xs text-slate-400">({employee.documents.length})</span>}
                        </button>
                    ))}
                </div>

                {/* Tab: Overview */}
                {tab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Card className="border-slate-200">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">Personal</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <InfoRow icon={User} label="Full Name" value={fullName} />
                                <InfoRow icon={Mail} label="Email" value={employee.email} />
                                <InfoRow icon={Phone} label="Phone" value={employee.phone} />
                                <InfoRow icon={CalendarDays} label="Date of Birth" value={employee.dob ? new Date(employee.dob).toLocaleDateString() : null} />
                                <InfoRow icon={User} label="Gender" value={employee.gender} />
                                <InfoRow icon={User} label="Nationality" value={employee.nationality} />
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">Employment</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <InfoRow icon={Briefcase} label="Position" value={employee.position?.name} />
                                <InfoRow icon={Building2} label="Department" value={employee.department?.name} />
                                <InfoRow icon={User} label="Reporting Manager" value={employee.reporting_manager ? `${employee.reporting_manager.first_name} ${employee.reporting_manager.last_name}` : null} />
                                <InfoRow icon={CalendarDays} label="Date of Joining" value={employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : null} />
                                <InfoRow icon={Briefcase} label="Contract Type" value={employee.contract_type} />
                                <InfoRow icon={Briefcase} label="Salary" value={employee.salary ? `Le ${Number(employee.salary).toLocaleString()}` : null} />
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 md:col-span-2">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-700">Address</CardTitle></CardHeader>
                            <CardContent>
                                <InfoRow icon={MapPin} label="Address" value={[employee.address, employee.city, employee.state, employee.postal_code, employee.country].filter(Boolean).join(', ')} />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tab: Documents */}
                {tab === 'documents' && (
                    <Card className="border-slate-200">
                        <CardContent className="p-0">
                            {employee.documents.length === 0 ? (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <FileText size={28} className="text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">No documents uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto"><table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50">
                                            <th className="text-left px-4 py-3 font-medium text-slate-600">Document</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-600">Uploaded</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.documents.map((doc) => (
                                            <tr key={doc.id} className="border-b border-slate-100">
                                                <td className="px-4 py-3 text-slate-900">{doc.file_name}</td>
                                                <td className="px-4 py-3 text-slate-500">{doc.document_type}</td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">{new Date(doc.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table></div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: History */}
                {tab === 'history' && (
                    <Card className="border-slate-200">
                        <CardContent className="p-0">
                            {employee.history.length === 0 ? (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <CalendarDays size={28} className="text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">No employment changes recorded yet.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {employee.history.map((h) => (
                                        <li key={h.id} className="px-4 py-3 flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-900">
                                                    <span className="font-medium capitalize">{h.field_name.replace('_', ' ')}</span>
                                                    {' changed from '}
                                                    <span className="text-slate-500">{h.old_value || '—'}</span>
                                                    {' → '}
                                                    <span className="font-medium text-blue-700">{h.new_value || '—'}</span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {new Date(h.changed_at).toLocaleString()} · by {h.changed_by?.name ?? 'System'}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                )}

            </div>
        </AppLayout>
    );
}
