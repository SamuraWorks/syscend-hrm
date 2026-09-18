<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Production-safe seeder.
 *
 * Seeds only what a live deployment needs:
 *   - roles & permissions
 *   - the purchase/product catalogue
 *   - an owner admin account (password from ADMIN_INITIAL_PASSWORD)
 *
 * NO demo employees/records are ever created. Run with:
 *   php artisan db:seed --class=Database\\Seeders\\ProductionSeeder --force
 */
class ProductionSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            PurchaseCatalogSeeder::class,
        ]);

        $email = env('ADMIN_EMAIL', 'admin@example.com');
        $password = env('ADMIN_INITIAL_PASSWORD');

        if (! $password || strlen($password) < 12) {
            $this->command?->error(
                'Set ADMIN_INITIAL_PASSWORD (>= 12 chars) in your environment before running the production seeder.'
            );

            return;
        }

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'System Administrator',
                'password' => Hash::make($password),
                'is_active' => true,
            ]
        );

        $admin->assignRole('Admin');
        $admin->forceFill(['is_active' => true])->save();

        $this->command?->info("Production admin ready: {$email}");
    }
}
