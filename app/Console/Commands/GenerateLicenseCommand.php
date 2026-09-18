<?php

namespace App\Console\Commands;

use App\Services\LicenseService;
use Illuminate\Console\Command;

class GenerateLicenseCommand extends Command
{
    protected $signature = 'license:generate {holder} {expiry?} {--date=}';

    protected $description = 'Generate an HMAC-signed license key for an organisation.';

    public function handle(LicenseService $license): int
    {
        $holder = (string) $this->argument('holder');
        $date = $this->option('date') ?? $this->argument('expiry');

        if ($date === null) {
            $date = now()->addYear()->format('Y-m-d');
        }

        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $this->error('Expiry must be YYYY-MM-DD.');

            return self::FAILURE;
        }

        $key = $license->generate($holder, $date);

        $this->info('License key generated for: '.$holder);
        $this->info('Expires:                 '.$date);
        $this->newLine();
        $this->line($key);
        $this->newLine();
        $this->info('Set LICENSE_HOLDER and LICENSE_KEY in your environment (e.g. .env) to activate.');

        return self::SUCCESS;
    }
}
