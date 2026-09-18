<?php

namespace Modules\SystemAdmin\app\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class SystemAdminServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');
        $this->registerRoutes();
    }

    protected function registerRoutes(): void
    {
        Route::middleware('web')->group(base_path('Modules/SystemAdmin/routes/web.php'));
    }
}
