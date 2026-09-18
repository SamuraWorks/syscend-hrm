<?php

namespace Modules\SystemAdmin\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\SystemAdmin\app\Models\AuditLog;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    /** Core roles that cannot be renamed or deleted. */
    private const CORE_ROLES = ['Admin', 'HR Manager', 'Manager', 'Employee', 'Recruiter', 'Finance', 'Syscend Admin'];

    public function index(): Response
    {
        // Customer Administrators never manage the internal Syscend role.
        $roles = Role::where('name', '!=', 'Syscend Admin')
            ->withCount('users')
            ->with('permissions')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users_count,
                'is_core' => in_array($role->name, self::CORE_ROLES),
                'permissions' => $role->permissions->pluck('name'),
            ]);

        // Group permissions by module prefix (e.g. "employees.view" → "employees").
        // Internal syscend.* permissions are never exposed to customer admins.
        $permissions = Permission::where('name', 'not like', 'syscend.%')
            ->orderBy('name')
            ->get()
            ->groupBy(function ($p) {
                $parts = explode('.', $p->name);

                return count($parts) > 1 ? $parts[0] : 'general';
            })
            ->map(fn ($group) => $group->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
            ])->values());

        return Inertia::render('admin/roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'coreRoles' => self::CORE_ROLES,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);

        if (! empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        AuditLog::log('created', 'Roles', "Created role: {$role->name}", Role::class, $role->id);

        return back()->with('success', "Role '{$role->name}' created.");
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($data['permissions'] ?? []);

        AuditLog::log('updated', 'Roles', "Updated permissions for role: {$role->name}", Role::class, $role->id);

        return back()->with('success', "Permissions for '{$role->name}' updated.");
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, self::CORE_ROLES)) {
            return back()->withErrors(['role' => 'Core roles cannot be deleted.']);
        }

        if ($role->users()->count() > 0) {
            return back()->withErrors(['role' => 'Cannot delete a role that has assigned users.']);
        }

        AuditLog::log('deleted', 'Roles', "Deleted role: {$role->name}");
        $role->delete();

        return back()->with('success', "Role '{$role->name}' deleted.");
    }
}
