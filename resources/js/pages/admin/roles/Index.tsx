import { router, useForm } from '@inertiajs/react';
import { Lock, Plus, Save, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleItem {
    id: number;
    name: string;
    users_count: number;
    is_core: boolean;
    permissions: string[];
}

interface PermissionItem {
    id: number;
    name: string;
}

interface Props {
    roles: RoleItem[];
    permissions: Record<string, PermissionItem[]>;
    coreRoles: string[];
}

// ─── Add Role Form ────────────────────────────────────────────────────────────

function AddRoleForm({ onClose }: { onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/roles', {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 rounded-lg p-4 mt-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">New Custom Role</p>
            <form onSubmit={submit} className="flex items-start gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Role name…"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="h-9 text-sm"
                        autoFocus
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <Button type="submit" size="sm" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                    {processing ? 'Creating…' : 'Create'}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={onClose}>Cancel</Button>
            </form>
        </div>
    );
}

// ─── Permission Matrix ────────────────────────────────────────────────────────

function PermissionMatrix({
    role,
    permissions,
}: {
    role: RoleItem;
    permissions: Record<string, PermissionItem[]>;
}) {
    const [selected, setSelected] = useState<string[]>(role.permissions ?? []);
    const [saving, setSaving] = useState(false);

    function toggle(permName: string) {
        setSelected((prev) =>
            prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName],
        );
    }

    function toggleModule(modulePerms: PermissionItem[]) {
        const names = modulePerms.map((p) => p.name);
        const allSelected = names.every((n) => selected.includes(n));
        if (allSelected) {
            setSelected((prev) => prev.filter((p) => !names.includes(p)));
        } else {
            setSelected((prev) => [...new Set([...prev, ...names])]);
        }
    }

    function save() {
        setSaving(true);
        router.put(`/admin/roles/${role.id}`, { permissions: selected }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    }

    const modules = Object.entries(permissions);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {role.is_core && <Lock size={13} className="text-amber-500" />}
                        {role.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selected.length} permission(s) assigned</p>
                </div>
                <Button size="sm" onClick={save} disabled={saving} className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                    <Save size={13} /> {saving ? 'Saving…' : 'Save Permissions'}
                </Button>
            </div>

            {modules.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No permissions defined yet.</p>
            ) : (
                <div className="space-y-3">
                    {modules.map(([moduleName, perms]) => {
                        const allChecked = perms.every((p) => selected.includes(p.name));
                        const someChecked = perms.some((p) => selected.includes(p.name));
                        return (
                            <div key={moduleName} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                {/* Module header */}
                                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={allChecked}
                                        ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                                        onChange={() => toggleModule(perms)}
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        {moduleName}
                                    </span>
                                    <span className="ml-auto text-xs text-slate-400">{perms.length} permission(s)</span>
                                </div>
                                {/* Permission checkboxes */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0">
                                    {perms.map((perm) => (
                                        <label
                                            key={perm.id}
                                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer border-b border-r border-slate-100 dark:border-slate-800"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(perm.name)}
                                                onChange={() => toggle(perm.name)}
                                                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                                            />
                                            <span className="truncate">{perm.name.split('.').slice(1).join('.') || perm.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RolesIndex({ roles, permissions, coreRoles }: Props) {
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(roles[0]?.id ?? null);
    const [showAddForm, setShowAddForm] = useState(false);

    const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

    function handleDelete(role: RoleItem) {
        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
        router.delete(`/admin/roles/${role.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <div className="space-y-5 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Shield size={22} className="text-blue-600" /> Roles & Permissions
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage access control for system roles</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                    {/* Left: Role list */}
                    <div className="lg:col-span-1">
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">Roles</CardTitle>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-xs gap-1 text-blue-600"
                                        onClick={() => setShowAddForm(!showAddForm)}
                                    >
                                        <Plus size={12} /> Add
                                    </Button>
                                </div>
                                {showAddForm && <AddRoleForm onClose={() => setShowAddForm(false)} />}
                            </CardHeader>
                            <CardContent className="p-0">
                                <ul>
                                    {roles.map((role) => (
                                        <li key={role.id}>
                                            <button
                                                onClick={() => setSelectedRoleId(role.id)}
                                                className={cn(
                                                    'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0',
                                                    role.id === selectedRoleId
                                                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30',
                                                )}
                                            >
                                                <span className="flex items-center gap-1.5 truncate">
                                                    {role.is_core && <Lock size={11} className="text-amber-500 flex-shrink-0" />}
                                                    {role.name}
                                                </span>
                                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                                                        <Users size={10} /> {role.users_count}
                                                    </span>
                                                    {!role.is_core && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(role); }}
                                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Permission matrix */}
                    <div className="lg:col-span-3">
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardContent className="p-5">
                                {selectedRole ? (
                                    <PermissionMatrix role={selectedRole} permissions={permissions} />
                                ) : (
                                    <div className="py-16 text-center text-slate-400">
                                        <Shield size={32} className="mx-auto mb-2 text-slate-300" />
                                        <p className="text-sm">Select a role to manage permissions</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
