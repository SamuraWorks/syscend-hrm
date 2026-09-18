import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Building2, Edit, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Dept {
    id: number; name: string; description: string | null; cost_center: string | null;
    parent: { id: number; name: string } | null;
    head:   { id: number; name: string } | null;
    children: { id: number; name: string; employees_count: number }[];
    positions: { id: number; name: string; employees_count: number }[];
    employees_count: number;
}

export default function DepartmentShow({ department }: { department: Dept }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    function handleDelete() {
        router.delete(`/departments/${department.id}`, {
            onSuccess: () => router.visit('/departments'),
        });
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <Link href="/departments" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={15} /> Back to Departments
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={`/departments/${department.id}/edit`}>
                                <Edit size={13} /> Edit
                            </Link>
                        </Button>
                        {!confirmDelete ? (
                            <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                                <Trash2 size={13} /> Delete
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                <span className="text-xs text-red-700">Confirm delete?</span>
                                <button onClick={handleDelete} className="text-xs font-semibold text-red-600 hover:text-red-800">Yes</button>
                                <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500">Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Header card */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                                <Building2 size={22} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{department.name}</h1>
                                {department.parent && (
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        Sub-department of{' '}
                                        <Link href={`/departments/${department.parent.id}`} className="text-blue-600 hover:underline">
                                            {department.parent.name}
                                        </Link>
                                    </p>
                                )}
                                {department.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{department.description}</p>
                                )}
                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Users size={13} className="text-slate-400" />
                                        {department.employees_count} employees
                                    </span>
                                    {department.cost_center && (
                                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {department.cost_center}
                                        </span>
                                    )}
                                    {department.head && (
                                        <span className="text-slate-500">Head: <span className="font-medium text-slate-800 dark:text-slate-200">{department.head.name}</span></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Sub-departments */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                Sub-departments
                                <span className="text-xs font-normal text-slate-400">{department.children.length}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {department.children.length === 0 ? (
                                <p className="text-sm text-slate-400">No sub-departments.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {department.children.map((c) => (
                                        <li key={c.id} className="flex items-center justify-between">
                                            <Link href={`/departments/${c.id}`} className="text-sm text-blue-600 hover:underline">{c.name}</Link>
                                            <span className="text-xs text-slate-400">{c.employees_count} staff</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Positions */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                Positions
                                <span className="text-xs font-normal text-slate-400">{department.positions.length}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {department.positions.length === 0 ? (
                                <p className="text-sm text-slate-400">No positions defined.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {department.positions.map((p) => (
                                        <li key={p.id} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Briefcase size={12} className="text-slate-400" /> {p.name}
                                            </span>
                                            <span className="text-xs text-slate-400">{p.employees_count} staff</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
