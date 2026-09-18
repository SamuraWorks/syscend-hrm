import { Link, router } from '@inertiajs/react';
import { Briefcase, Plus, Users } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Position {
    id: number; name: string; description: string | null;
    level: string | null; salary_min: string | null; salary_max: string | null;
    department: { id: number; name: string } | null;
    employees_count: number;
}

export default function PositionsIndex({
    positions,
    departments,
}: {
    positions: Position[];
    departments: { id: number; name: string }[];
}) {
    const [filterDept, setFilterDept] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const filtered = filterDept
        ? positions.filter((p) => String(p.department?.id) === filterDept)
        : positions;

    function handleDelete(id: number) {
        router.delete(`/positions/${id}`, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Positions</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{positions.length} positions across all departments</p>
                    </div>
                    <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                        <Link href="/positions/create">
                            <Plus size={14} /> Add Position
                        </Link>
                    </Button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3">
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-8 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filtered.length === 0 ? (
                        <CardContent className="flex flex-col items-center py-14 text-center">
                            <Briefcase size={32} className="text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-500">No positions found</p>
                        </CardContent>
                    ) : (
                        <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                    <th className="text-left px-5 py-3 font-medium text-slate-600 dark:text-slate-400">Position</th>
                                    <th className="text-left px-5 py-3 font-medium text-slate-600 dark:text-slate-400">Department</th>
                                    <th className="text-left px-5 py-3 font-medium text-slate-600 dark:text-slate-400">Level</th>
                                    <th className="text-left px-5 py-3 font-medium text-slate-600 dark:text-slate-400">Salary Range</th>
                                    <th className="text-left px-5 py-3 font-medium text-slate-600 dark:text-slate-400">
                                        <Users size={13} />
                                    </th>
                                    <th className="text-right px-5 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((pos) => (
                                    <tr key={pos.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-slate-900 dark:text-white">{pos.name}</p>
                                            {pos.description && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{pos.description}</p>}
                                        </td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                                            {pos.department ? (
                                                <Link href={`/departments/${pos.department.id}`} className="hover:text-blue-600">
                                                    {pos.department.name}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500">{pos.level || '—'}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">
                                            {pos.salary_min && pos.salary_max
                                                ? `Le ${Number(pos.salary_min).toLocaleString()} – Le ${Number(pos.salary_max).toLocaleString()}`
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500">{pos.employees_count}</td>
                                        <td className="px-5 py-3 text-right">
                                            {confirmDelete === pos.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs text-red-600">Delete?</span>
                                                    <button onClick={() => handleDelete(pos.id)} className="text-xs font-semibold text-red-600 hover:text-red-800">Yes</button>
                                                    <button onClick={() => setConfirmDelete(null)} className="text-xs text-slate-500">No</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/positions/${pos.id}/edit`} className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors">Edit</Link>
                                                    <button onClick={() => setConfirmDelete(pos.id)} className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table></div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
