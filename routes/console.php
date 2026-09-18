<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled tasks (production only unless overridden)
|--------------------------------------------------------------------------
| Creates the crontab entry:  * * * * * cd /path/to/app && php artisan schedule:run
*/

// Nightly MySQL backup (written via `db:backup`, prunes to 7 latest).
Schedule::command('db:backup')
    ->dailyAt('02:00')
    ->environments(['production'])
    ->onFailure(function () {
        report(new RuntimeException('Nightly database backup failed.'));
    });

// Telescope keeps a rolling 7-day window of requests.
Schedule::command('telescope:prune --hours=168')
    ->daily()
    ->environments(['production']);

// Expire stale sessions daily (DB-backed sessions).
Schedule::command('session:gc')
    ->dailyAt('03:30')
    ->environments(['production']);

// Warm caches if the app uses config/routes caching.
Schedule::command('optimize')
    ->weeklyOn(1, '04:00')
    ->environments(['production']);
