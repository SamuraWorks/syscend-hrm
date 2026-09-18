<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class MfaController extends Controller
{
    /**
     * Multi-factor authentication is not enabled in this deployment.
     *
     * Returns 501 so clients can degrade gracefully instead of pretending
     * the flow succeeds (previously every call returned a 200 "Not implemented").
     */
    private function unavailable(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Multi-factor authentication is not available in this deployment.',
        ], 501);
    }

    public function enable(): JsonResponse
    {
        return $this->unavailable();
    }

    public function verify(): JsonResponse
    {
        return $this->unavailable();
    }

    public function disable(): JsonResponse
    {
        return $this->unavailable();
    }

    public function backupCodes(): JsonResponse
    {
        return $this->unavailable();
    }
}
