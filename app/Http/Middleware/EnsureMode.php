<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restrict a route group to a specific installation mode.
 *
 * APP_MODE=demo (default) → public Syscend website, demo data, resettable.
 * APP_MODE=production → a customer's private branded installation (no public marketing/demo).
 */
class EnsureMode
{
    public function handle(Request $request, Closure $next, string $mode): Response
    {
        if (config('app.mode', 'demo') !== $mode) {
            abort(404);
        }

        return $next($request);
    }
}
