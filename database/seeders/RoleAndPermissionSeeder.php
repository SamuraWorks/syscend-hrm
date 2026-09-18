<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions per module
        $modules = [
            'employees' => ['view', 'create', 'edit', 'delete', 'export', 'import'],
            'departments' => ['view', 'create', 'edit', 'delete'],
            'attendance' => ['view', 'create', 'edit', 'mark'],
            'leaves' => ['view', 'apply', 'approve', 'reject', 'manage'],
            'recruitment' => ['view', 'create', 'edit', 'delete', 'manage'],
            'payroll' => ['view', 'process', 'approve', 'export'],
            'performance' => ['view', 'create', 'edit', 'manage'],
            'training' => ['view', 'create', 'edit', 'manage'],
            'documents' => ['view', 'upload', 'delete', 'manage'],
            'reports' => ['view', 'export'],
            'admin' => ['users', 'roles', 'settings', 'audit-logs'],
            'syscend' => ['access'],
        ];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "{$module}.{$action}"]);
            }
        }

        // Demo/HR roles must never inherit internal Syscend permissions — the
        // sales portal is a private operations area for the Syscend team only.
        $hrModules = array_filter($modules, fn (string $module) => $module !== 'syscend', ARRAY_FILTER_USE_KEY);

        // Create roles with permissions
        $roles = [
            'Admin' => array_merge(
                ...array_map(
                    fn ($module, $actions) => array_map(fn ($a) => "{$module}.{$a}", $actions),
                    array_keys($hrModules),
                    $hrModules
                )
            ),

            'HR Manager' => [
                'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
                'employees.export', 'employees.import',
                'departments.view', 'departments.create', 'departments.edit', 'departments.delete',
                'attendance.view', 'attendance.mark',
                'leaves.view', 'leaves.approve', 'leaves.reject', 'leaves.manage',
                'recruitment.view', 'recruitment.create', 'recruitment.edit', 'recruitment.manage',
                'payroll.view',
                'performance.view', 'performance.manage',
                'training.view', 'training.create', 'training.manage',
                'documents.view', 'documents.upload', 'documents.manage',
                'reports.view', 'reports.export',
            ],

            'Manager' => [
                'employees.view',
                'departments.view',
                'attendance.view', 'attendance.mark',
                'leaves.view', 'leaves.approve', 'leaves.reject',
                'recruitment.view',
                'performance.view', 'performance.create', 'performance.edit',
                'training.view',
                'documents.view',
                'reports.view',
            ],

            'Employee' => [
                'attendance.view', 'attendance.create',
                'leaves.view', 'leaves.apply',
                'performance.view',
                'training.view',
            ],

            'Recruiter' => [
                'employees.view',
                'recruitment.view', 'recruitment.create', 'recruitment.edit', 'recruitment.manage',
                'reports.view',
            ],

            'Finance' => [
                'employees.view',
                'payroll.view', 'payroll.process', 'payroll.approve', 'payroll.export',
                'reports.view', 'reports.export',
            ],

            'Syscend Admin' => [
                'syscend.access',
            ],
        ];

        foreach ($roles as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($permissions);
        }
    }
}
