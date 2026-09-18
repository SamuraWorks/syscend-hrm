import { Link, router } from '@inertiajs/react';
import { Building2, ChevronRight, Plus, Users } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Department {
    id: number;
    name: string;
    description: string | null;
    cost_center: string | null;
    parent: { id: number; name: string } | null;
    head: { id: number; name: string } | null;
    employees_count: number;
}

export default function DepartmentsIndex({ departments }: { departments: Department[] }) {
    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{departments.length} departments</p>
                    </div>
                    <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                        <Link href="/departments/create">
                            <Plus size={14} /> Add Department
                        </Link>
                    </Button>
                </div>

                {/* List */}
                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    {departments.length === 0 ? (
                        <CardContent className="flex flex-col items-center py-14 text-center">
                            <Building2 size={32} className="text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-500">No departments yet</p>
                            <Link href="/departments/create">
                                <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-500">
                                    <Plus size={14} className="mr-1.5" /> Add first department
                                </Button>
                            </Link>
                        </CardContent>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {departments.map((dept) => (
                                <div
                                    key={dept.id}
                                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                                            <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-slate-900 dark:text-white text-sm">{dept.name}</p>
                                                {dept.parent && (
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <ChevronRight size={10} /> {dept.parent.name}
                                                    </span>
                                                )}
                                                {dept.cost_center && (
                                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                                        {dept.cost_center}
                                                    </span>
                                                )}
                                            </div>
                                            {dept.description && (
                                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">{dept.description}</p>
                                            )}
                                            {dept.head && (
                                                <p className="text-xs text-slate-400 mt-0.5">Head: {dept.head.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <Users size={13} className="text-slate-400" />
                                            {dept.employees_count}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/departments/${dept.id}`}
                                                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                href={`/departments/${dept.id}/edit`}
                                                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
