<?php

namespace Tests;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
    }

    protected function makeUser(string $email = 'test@example.com', string $role = 'Employee', bool $active = true): User
    {
        $user = User::factory()->create([
            'email' => $email,
            'password' => bcrypt('password'),
            'is_active' => $active,
        ]);

        $user->assignRole($role);

        return $user;
    }
}
