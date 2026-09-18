<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    public function test_api_login_issues_token_for_active_user(): void
    {
        $this->makeUser('api@test.com', 'Employee', true);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'api@test.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data' => ['token', 'user']]);

        $this->assertNotNull($response->json('data.token'));
    }

    public function test_api_login_rejects_wrong_credentials(): void
    {
        $this->makeUser('api@test.com', 'Employee', true);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'api@test.com',
            'password' => 'wrong-password',
        ])->assertStatus(422);
    }

    public function test_api_login_blocks_disabled_user(): void
    {
        $this->makeUser('disabled@test.com', 'Employee', false);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'disabled@test.com',
            'password' => 'password',
        ])->assertStatus(422);
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = $this->makeUser('me@test.com', 'Employee', true);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'me@test.com');
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }
}
