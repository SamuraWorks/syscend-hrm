import { Link, router } from '@inertiajs/react';
import { ChevronRight, LayoutList, Pencil, Plus, Trash2 } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalaryStructure {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    components_count: number;
}

interface Props {
    structures: SalaryStructure[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StructuresIndex({ structures }: Props) {
    function handleDelete(id: number, name: string) {
        if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
            router.delete(`/payroll/structures/${id}`, { preserveScroll: true });
        }
    }

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Link
                        href="/payroll"
                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        Payroll
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                        Structures
                    </span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Salary Structures
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Group salary components into structures
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        asChild
                    >
                        <Link href="/payroll/structures/create">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Structure
                        </Link>
                    </Button>
                </div>

                {/* Table */}
                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            All Structures
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {structures.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <LayoutList className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    No salary structures yet.
                                </p>
                                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                                    Create your first structure to group salary components.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            {['Name', 'Code', 'Components', 'Active', 'Actions'].map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {structures.map((structure, idx) => (
                                            <tr
                                                key={structure.id}
                                                className={cn(
                                                    'border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40',
                                                    idx === structures.length - 1 && 'border-b-0',
                                                )}
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                                        {structure.name}
                                                    </p>
                                                    {structure.description && (
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                                                            {structure.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {structure.code}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    <span className="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 h-6 w-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        {structure.components_count}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                            structure.is_active
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                                                        )}
                                                    >
                                                        {structure.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                            asChild
                                                        >
                                                            <Link href={`/payroll/structures/${structure.id}/edit`}>
                                                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                            onClick={() => handleDelete(structure.id, structure.name)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
