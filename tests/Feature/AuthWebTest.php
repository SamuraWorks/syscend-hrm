<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthWebTest extends TestCase
{
    public function test_web_login_succeeds_for_active_user(): void
    {
        $this->makeUser('hr@test.com', 'HR Manager', true);

        $response = $this->post('/login', [
            'email' => 'hr@test.com',
            'password' => 'password',
        ]);

        $response->assertRedirect();
        $this->assertAuthenticated();
    }

    public function test_web_login_rejects_wrong_credentials(): void
    {
        $this->makeUser('hr@test.com', 'HR Manager', true);

        $response = $this->post('/login', [
            'email' => 'hr@test.com',
            'password' => 'not-the-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_web_login_blocks_disabled_user(): void
    {
        $this->makeUser('disabled@test.com', 'Employee', false);

        $response = $this->post('/login', [
            'email' => 'disabled@test.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_web_login_requires_fields(): void
    {
        $this->post('/login', [])
            ->assertSessionHasErrors(['email', 'password']);
    }
}
