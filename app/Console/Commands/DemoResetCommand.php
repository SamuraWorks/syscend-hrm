<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DemoResetCommand extends Command
{
    protected $signature = 'demo:reset {--force : Skip the production confirmation prompt}';

    protected $description = 'Wipe all application data and re-seed a clean demo dataset (client handover).';

    /**
     * All application tables, wiped (truncated) before re-seeding.
     * Ordered alphabetically; FK checks are disabled around the truncation.
     */
    private const TABLES = [
        'attendances',
        'audit_logs',
        'company_documents',
        'departments',
        'document_acknowledgements',
        'employee_documents',
        'employee_salaries',
        'employees',
        'employment_history',
        'holidays',
        'interview_schedules',
        'job_applications',
        'job_postings',
        'leave_balances',
        'leave_requests',
        'leave_types',
        'model_has_permissions',
        'model_has_roles',
        'notifications',
        'password_reset_tokens',
        'payroll_runs',
        'payslip_lines',
        'payslips',
        'performance_cycles',
        'performance_goals',
        'performance_ratings',
        'performance_review_items',
        'performance_reviews',
        'permissions',
        'positions',
        'role_has_permissions',
        'roles',
        'salary_components',
        'salary_structure_components',
        'salary_structures',
        'sessions',
        'shifts',
        'system_settings',
        'training_courses',
        'training_enrollments',
        'training_sessions',
        'users',
    ];

    public function handle(): int
    {
        if (! $this->option('force')) {
            $this->alert('This command WIPES all application data (employees, payroll, leaves, users, settings) and re-seeds a clean demo dataset.');
            if (! $this->confirm('Continue?', false)) {
                $this->info('Cancelled.');

                return self::FAILURE;
            }
        }

        // Snapshot real Syscend team accounts (the vendor's own operations
        // logins, protected by the Syscend Admin role) so they can be restored
        // after the wipe without exposing plaintext passwords. Super admins are
        // not employees, so no employee record is preserved for them.
        $team = User::role('Syscend Admin')->get()->mapWithKeys(fn (User $u) => [
            $u->email => [
                'name' => $u->name,
                'phone' => $u->phone,
                'email_verified_at' => $u->email_verified_at,
                'password' => $u->password,
            ],
        ]);

        $count = $this->wipe();

        $this->line('');
        $this->info('Wiped '.$count.' app tables. Re-seeding demo data…');

        $this->call('db:seed', ['--force' => true]);

        foreach ($team as $email => $attrs) {
            // Recreate using the preserved hash via raw SQL so Eloquent's
            // 'hashed' cast never re-hashes an already-hashed password.
            $user = User::where('email', $email)->first();

            if (! $user) {
                $id = DB::table('users')->insertGetId([
                    'name' => $attrs['name'],
                    'email' => $email,
                    'phone' => $attrs['phone'],
                    'email_verified_at' => $attrs['email_verified_at'],
                    'password' => $attrs['password'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $user = User::find($id);
                $user->assignRole('Syscend Admin');
            } else {
                DB::table('users')->where('id', $user->id)->update([
                    'phone' => $attrs['phone'],
                    'password' => $attrs['password'],
                    'is_active' => true,
                ]);
                if (! $user->hasRole('Syscend Admin')) {
                    $user->assignRole('Syscend Admin');
                }
            }

            $this->info("Restored Syscend team account: {$email}");
        }

        $this->newLine();
        $this->info('Demo data reset complete.');
        $this->warn('Demo users use the password: Admin@1234');

        return self::SUCCESS;
    }

    private function wipe(): int
    {
        $tables = self::TABLES;

        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');
        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }
        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');

        return count($tables);
    }
}
