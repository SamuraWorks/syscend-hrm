<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ModuleSmokeTest extends TestCase
{
    private const PUBLIC_ROUTES = [
        '/', '/features', '/pricing', '/how-it-works', '/get-started',
        '/careers', '/contact', '/login',
    ];

    private const ADMIN_ROUTES = [
        '/portal',
        '/profile', '/profile/password',
        // Employee & Organization
        '/employees', '/employees/create',
        '/departments', '/departments/create',
        '/positions', '/positions/create',
        // Attendance
        '/attendance', '/shifts', '/shifts/create', '/holidays', '/holidays/create',
        // Leave
        '/leaves', '/leaves/calendar', '/leave/types', '/leave/types/create',
        // Recruitment
        '/recruitment', '/recruitment/create',
        // Payroll
        '/payroll', '/payroll/structures', '/payroll/structures/create',
        '/payroll/components', '/payroll/components/create',
        '/payroll/salaries', '/payroll/runs/create',
        // Performance
        '/performance', '/performance/goals',
        // Training
        '/training',
        // Documents
        '/documents',
        // Reports
        '/reports', '/reports/attendance', '/reports/headcount', '/reports/leave',
        '/reports/payroll', '/reports/performance', '/reports/training',
        // Admin / SystemAdmin
        '/admin/users', '/admin/users/create', '/admin/roles', '/admin/settings',
        '/admin/audit-log', '/admin/integrations',
        // Self-service
        '/my/payslips', '/my/documents',
    ];

    private const SYSCEND_ROUTES = [
        '/syscend', '/syscend/requests', '/syscend/organizations', '/syscend/licenses',
        '/syscend/payments', '/syscend/products', '/syscend/deployments',
        '/syscend/users', '/syscend/settings',
    ];

    public function test_public_pages_load_without_server_error(): void
    {
        $this->assertLoads(self::PUBLIC_ROUTES, null, 'guest');
    }

    public function test_admin_can_load_every_module_page(): void
    {
        $admin = $this->makeUser('smoke-admin@test.com', 'Admin');
        $this->assertLoads(self::ADMIN_ROUTES, $admin, 'Admin');
    }

    public function test_syscend_admin_can_load_every_ops_page(): void
    {
        $user = $this->makeUser('smoke-syscend@test.com', 'Syscend Admin');
        $this->assertLoads(self::SYSCEND_ROUTES, $user, 'Syscend Admin');
    }

    /**
     * @param  string[]  $uris
     */
    private function assertLoads(array $uris, ?User $user, string $who): void
    {
        $statuses = [];

        foreach ($uris as $uri) {
            $request = $user ? $this->actingAs($user) : $this;
            $statuses[$uri] = $request->get($uri)->getStatusCode();
        }

        $serverErrors = array_filter($statuses, fn (int $s) => $s >= 500);
        $notFound = array_filter($statuses, fn (int $s) => $s === 404);

        $this->assertSame([], $serverErrors, "[{$who}] server errors: ".json_encode($serverErrors));
        $this->assertSame([], $notFound, "[{$who}] not found: ".json_encode($notFound));
    }
}
