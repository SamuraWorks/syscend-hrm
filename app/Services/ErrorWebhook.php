<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Dependency-free error alerting.
 *
 * When ERROR_WEBHOOK_URL is set (e.g. a Slack/Teams/Discord webhook),
 * uncaught exceptions are POSTed there in production so a support channel
 * gets notified without needing a hosted error-tracking service.
 */
class ErrorWebhook
{
    public static function notify(Throwable $exception): void
    {
        $url = env('ERROR_WEBHOOK_URL');

        if (! $url || config('app.env') !== 'production') {
            return;
        }

        try {
            Http::timeout(5)
                ->post($url, [
                    'text' => sprintf(
                        '[%s] %s: %s in %s:%d',
                        config('app.env'),
                        get_class($exception),
                        $exception->getMessage(),
                        $exception->getFile(),
                        $exception->getLine()
                    ),
                ]);
        } catch (Throwable) {
            // Never let alerting itself break the request.
        }
    }
}
