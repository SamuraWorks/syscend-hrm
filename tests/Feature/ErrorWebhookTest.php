<?php

namespace Tests\Feature;

use App\Services\ErrorWebhook;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class ErrorWebhookTest extends TestCase
{
    private const WEBHOOK = 'https://hooks.example.com/test';

    protected function setUp(): void
    {
        parent::setUp();

        putenv('ERROR_WEBHOOK_URL='.self::WEBHOOK);
    }

    protected function tearDown(): void
    {
        putenv('ERROR_WEBHOOK_URL');
        putenv('ERROR_WEBHOOK_URL=');

        parent::tearDown();
    }

    public function test_notify_posts_exception_summary_to_webhook_in_production(): void
    {
        config(['app.env' => 'production']);

        Http::fake();

        ErrorWebhook::notify(new RuntimeException('boom in payroll'));

        Http::assertSent(fn ($request) => $request->url() === self::WEBHOOK
            && str_contains((string) $request['text'], 'boom in payroll')
            && str_contains((string) $request['text'], 'RuntimeException'));
    }

    public function test_notify_sends_nothing_when_not_in_production(): void
    {
        config(['app.env' => 'testing']);

        Http::fake();

        ErrorWebhook::notify(new RuntimeException('should stay silent'));

        Http::assertNothingSent();
    }
}
