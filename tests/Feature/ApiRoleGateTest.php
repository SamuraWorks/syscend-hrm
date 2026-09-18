<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ApiRoleGateTest extends TestCase
{
    public function test_roleless_user_is_blocked_from_api(): void
    {
        // Deliberately create a user with NO role.
        $user = User::factory()->create([
            'email' => 'roleless@test.com',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(403);
    }

    public function test_inactive_user_is_blocked_from_api(): void
    {
        $user = $this->makeUser('inactive@test.com', 'Employee', false);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(403);
    }

    public function test_active_roleful_user_passes_gate(): void
    {
        $user = $this->makeUser('ok@test.com', 'Employee', true);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk();
    }
}
