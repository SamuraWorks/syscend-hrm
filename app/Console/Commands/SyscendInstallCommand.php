<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Commerce\app\Models\License;
use Modules\Commerce\app\Models\Organization;
use Modules\SystemAdmin\app\Models\SystemSetting;

class SyscendInstallCommand extends Command
{
    protected $signature = 'syscend:install
        {--organization= : Company / organization name}
        {--email= : Owner email}
        {--name= : Owner name}
        {--password= : Owner password (default: Admin@1234)}
        {--domain= : Production domain for this installation}
        {--license= : Existing license key to activate (default: generate a new one)}
        {--demo : Keep APP_MODE=demo (e.g. staging/preview)}
        {--no-branding : Skip applying organization branding}
        {--new-user : Create the owner account, requires --password}';

    protected $description = 'Provision a customer production installation: apply branding, create the owner admin, and activate the license (client handover).';

    public function handle(): int
    {
        $orgName = (string) $this->option('organization');
        $email = (string) $this->option('email');

        if ($orgName === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Both --organization and a valid --email are required.');

            return self::FAILURE;
        }

        DB::transaction(function () use ($orgName, $email) {
            $org = Organization::firstOrCreate(
                ['name' => $orgName],
                ['contact_email' => $email, 'country' => null],
            );

            if ($org->wasRecentlyCreated || $org->contact_email !== $email) {
                $org->update(['contact_email' => $email]);
            }

            if (! $this->option('no-branding')) {
                $this->applyBranding($org);
            }

            $this->createOwnerAccount($email);

            $license = $this->activateLicense($org);

            $this->switchToProduction();

            $this->newLine();
            $this->info('✓ Syscend-HRM production installation prepared for: '.$org->name);
            $this->info('  Owner account : '.$email);
            $this->line('');
            $this->line('  License key   : '.$license->license_key);
            $this->line('  Installation  : '.($license->installation_id ?? '—'));
            $this->newLine();
            $this->info('Deploy this codebase to the target server, then set these in .env:');
            $this->line('  APP_MODE=production');
            $this->line('  APP_URL=https://'.($this->option('domain') ?: 'your-domain.com'));
        });

        return self::SUCCESS;
    }

    private function applyBranding(Organization $org): void
    {
        $branding = array_filter([
            'logo_path' => $org->logo_path,
            'favicon_path' => $org->favicon_path,
            'primary_color' => $org->primary_color,
            'secondary_color' => $org->secondary_color,
            'login_background' => $org->login_background,
            'login_welcome' => $org->login_welcome,
            'footer_copyright' => $org->footer_copyright,
        ], fn ($value) => $value !== null && $value !== '');

        foreach ($branding as $key => $value) {
            SystemSetting::set($key, $value);
        }

        if ($org->short_name) {
            SystemSetting::set('app_name', $org->short_name);
        }

        $this->info('✓ Branding applied'.count($branding) ? ' ('.count($branding).' settings).' : ' (none configured).');
    }

    private function createOwnerAccount(string $email): void
    {
        $name = (string) ($this->option('name') ?: 'Administrator');
        $password = (string) ($this->option('password') ?: 'Admin@1234');

        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make($password)],
        );

        if (! $user->hasRole('Admin')) {
            $user->assignRole('Admin');
        }

        $this->info('✓ Owner admin ready: '.$email);
    }

    private function activateLicense(Organization $org): License
    {
        $domain = (string) ($this->option('domain') ?: 'production');

        $license = License::create([
            'license_key' => (string) ($this->option('license') ?: License::generateKey()),
            'organization_id' => $org->id,
            'license_type' => 'one-time',
            'status' => 'active',
            'issued_at' => now(),
            'installation_id' => md5($domain),
            'product' => 'Syscend-HRM',
        ]);

        $this->info('✓ License activated: '.$license->license_key);

        return $license;
    }

    private function switchToProduction(): void
    {
        if ($this->option('demo')) {
            return;
        }

        $envPath = base_path('.env');

        if (! file_exists($envPath)) {
            $this->warn('Skipped .env update: .env not found at '.$envPath);

            return;
        }

        $content = file_get_contents($envPath);

        if (preg_match('/^APP_MODE=.*$/m', $content, $m)) {
            if (str_contains($m[0], 'production')) {
                return;
            }
            $content = preg_replace('/^APP_MODE=.*$/m', 'APP_MODE=production', $content);
        } else {
            $content = rtrim($content).PHP_EOL.'APP_MODE=production'.PHP_EOL;
        }

        if ($domain = $this->option('domain')) {
            $content = preg_replace('/^APP_URL=.*$/m', 'APP_URL=https://'.$domain, $content);
        }

        file_put_contents($envPath, $content);
        $this->info('✓ .env set to APP_MODE=production');
    }
}
