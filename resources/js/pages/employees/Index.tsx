import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronLeft, ChevronRight, Download, Filter,
    Plus, Search, UserCheck, UserX, Users, X,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    employment_status: string;
    contract_type: string;
    date_of_joining: string | null;
    department: { id: number; name: string } | null;
    position: { id: number; name: string } | null;
}

interface Department { id: number; name: string }
interface Position   { id: number; name: string }

interface Props {
    employees: {
        data: Employee[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number;
            to: number;
        };
        links: { prev: string | null; next: string | null };
    };
    departments: Department[];
    positions: Position[];
    filters: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
    Active:      'bg-emerald-100 text-emerald-700',
    Inactive:    'bg-slate-100 text-slate-600',
    'On Leave':  'bg-amber-100 text-amber-700',
    Terminated:  'bg-red-100 text-red-600',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[status] ?? 'bg-slate-100 text-slate-600')}>
            {status}
        </span>
    );
}

function initials(emp: Employee) {
    return `${emp.first_name[0]}${emp.last_name[0]}`.toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeeIndex({ employees, departments, positions, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [showFilters, setShowFilters] = useState(false);

    function applySearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/employees', { ...filters, search }, { preserveState: true, replace: true });
    }

    function applyFilter(key: string, value: string) {
        router.get('/employees', { ...filters, [key]: value, page: 1 }, { preserveState: true, replace: true });
    }

    function clearFilter(key: string) {
        const updated = { ...filters };
        delete updated[key];
        router.get('/employees', updated, { preserveState: true, replace: true });
    }

    function clearAll() {
        setSearch('');
        router.get('/employees', {}, { preserveState: true, replace: true });
    }

    function buildExportUrl() {
        const params = new URLSearchParams();
        (['search', 'department', 'position', 'status', 'sort', 'direction', 'per_page'] as const).forEach((key) => {
            if (filters[key]) params.set(key, filters[key]);
        });
        return `/employees/export?${params.toString()}`;
    }

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <AppLayout>
            <div className="space-y-5 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {employees.meta.total} total employees
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={buildExportUrl()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <Download size={14} /> Export
                        </a>
                        <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                            <Link href="/employees/create">
                                <Plus size={14} /> Add Employee
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Search + filter bar */}
                <Card className="border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <form onSubmit={applySearch} className="flex-1 flex items-center gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Search name, email, ID…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 h-9 text-sm"
                                    />
                                </div>
                                <Button type="submit" size="sm" variant="secondary">Search</Button>
                            </form>

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={14} />
                                Filters
                                {hasFilters && <span className="ml-1 bg-blue-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">!</span>}
                            </Button>

                            {hasFilters && (
                                <button onClick={clearAll} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1">
                                    <X size={12} /> Clear all
                                </button>
                            )}
                        </div>

                        {/* Filter row */}
                        {showFilters && (
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 flex-wrap">
                                <select
                                    value={filters.department ?? ''}
                                    onChange={(e) => e.target.value ? applyFilter('department', e.target.value) : clearFilter('department')}
                                    className="text-sm border border-slate-200 rounded-lg px-3 h-8 bg-white text-slate-700"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.position ?? ''}
                                    onChange={(e) => e.target.value ? applyFilter('position', e.target.value) : clearFilter('position')}
                                    className="text-sm border border-slate-200 rounded-lg px-3 h-8 bg-white text-slate-700"
                                >
                                    <option value="">All Positions</option>
                                    {positions.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.status ?? ''}
                                    onChange={(e) => e.target.value ? applyFilter('status', e.target.value) : clearFilter('status')}
                                    className="text-sm border border-slate-200 rounded-lg px-3 h-8 bg-white text-slate-700"
                                >
                                    <option value="">All Statuses</option>
                                    {['Active', 'Inactive', 'On Leave', 'Terminated'].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Employee</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">ID</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Department</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Position</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={32} className="text-slate-300" />
                                                <p className="font-medium">No employees found</p>
                                                <p className="text-xs">Try adjusting your search or filters</p>
                                                <Link href="/employees/create">
                                                    <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-500">
                                                        <Plus size={14} className="mr-1.5" /> Add first employee
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    employees.data.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                                        >
                                            {/* Employee name + avatar */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                                                        {initials(emp)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{emp.first_name} {emp.last_name}</p>
                                                        <p className="text-xs text-slate-500">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{emp.employee_id}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{emp.department?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{emp.position?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                {emp.date_of_joining
                                                    ? new Date(emp.date_of_joining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge status={emp.employment_status} /></td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/employees/${emp.id}`}
                                                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/employees/${emp.id}/edit`}
                                                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {employees.meta.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                            <p className="text-sm text-slate-500">
                                Showing {employees.meta.from}–{employees.meta.to} of {employees.meta.total}
                            </p>
                            <div className="flex items-center gap-1">
                                {employees.links.prev && (
                                    <Link
                                        href={employees.links.prev}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <ChevronLeft size={12} /> Prev
                                    </Link>
                                )}
                                <span className="px-3 py-1.5 text-xs text-slate-500">
                                    Page {employees.meta.current_page} of {employees.meta.last_page}
                                </span>
                                {employees.links.next && (
                                    <Link
                                        href={employees.links.next}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Next <ChevronRight size={12} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
