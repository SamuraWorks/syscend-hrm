<?php

use App\Http\Controllers\Employee\SelfController;
use App\Http\Controllers\Reports\DashboardController;
use App\Http\Controllers\Reports\PortalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('portal');
    }

    return Inertia::render('Home');
});

Route::middleware('auth')->group(function () {
    // Role portals — the home for every account after login
    Route::get('/portal', [PortalController::class, 'redirect'])->name('portal');
    Route::get('/portal/{portal}', [PortalController::class, 'show'])->name('portal.show');

    // Legacy full dashboard — retained for backward compatibility
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Self-service routes — any authenticated user, scoped to their own employee record
    Route::get('/my/payslips', [SelfController::class, 'payslips'])->name('my.payslips');
    Route::get('/my/documents', [SelfController::class, 'documents'])->name('my.documents');
});
