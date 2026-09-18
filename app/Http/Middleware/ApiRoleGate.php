<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Ensures every authenticated API request has an active account
 * with at least one role assigned. Rejects bare / deactivated users.
 */
class ApiRoleGate
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been disabled or is inactive.',
            ], 403);
        }

        if ($user->getRoleNames()->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. No roles assigned to this account.',
            ], 403);
        }

        return $next($request);
    }
}
