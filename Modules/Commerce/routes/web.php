<?php

use Illuminate\Support\Facades\Route;
use Modules\Commerce\app\Http\Controllers\CommercePublicController;
use Modules\Commerce\app\Http\Controllers\SyscendController;

/*
|--------------------------------------------------------------------------
| Commerce: Public purchasing + Syscend operations portal
|--------------------------------------------------------------------------
| Public marketing/purchasing is only reachable on the Syscend demo
| installation (APP_MODE=demo). On a customer production deployment these
| routes resolve to 404.
|
| The internal /syscend portal (payments, licenses, deployments, users) is a
| REAL operations tool for the Syscend team and works in any mode. It is
| protected by authentication + the syscend.access permission.
|
| The 'web' middleware group is already applied by CommerceServiceProvider.
*/

Route::middleware('mode:demo')->group(function () {

    // ─── Public marketing + purchasing ──────────────────────────────────────
    Route::get('/pricing', [CommercePublicController::class, 'pricing'])->name('commerce.pricing');
    Route::get('/features', [CommercePublicController::class, 'features'])->name('commerce.features');
    Route::get('/how-it-works', [CommercePublicController::class, 'howItWorks'])->name('commerce.how-it-works');
    Route::get('/contact', [CommercePublicController::class, 'contact'])->name('commerce.contact');

    Route::get('/get-started', [CommercePublicController::class, 'purchase'])->name('commerce.purchase');
    Route::post('/get-started/submit', [CommercePublicController::class, 'store'])->name('commerce.purchase.submit');
    Route::get('/purchase/{reference}/status', [CommercePublicController::class, 'status'])->name('commerce.purchase.status');
});

// ─── Syscend internal operations portal (real, works in any mode) ──────────
Route::middleware(['auth', 'permission:syscend.access'])->prefix('syscend')->name('syscend.')->group(function () {

    Route::get('/', [SyscendController::class, 'dashboard'])->name('dashboard');
    Route::get('/requests', [SyscendController::class, 'requests'])->name('requests');
    Route::get('/requests/{purchaseRequest}', [SyscendController::class, 'requestShow'])->name('requests.show');
    Route::post('/requests/{purchaseRequest}/{action}', [SyscendController::class, 'requestAction'])->name('requests.action');

    Route::get('/payments', [SyscendController::class, 'payments'])->name('payments');

    Route::get('/users', [SyscendController::class, 'users'])->name('users');

    Route::get('/organizations', [SyscendController::class, 'organizations'])->name('organizations');

    Route::get('/licenses', [SyscendController::class, 'licenses'])->name('licenses');
    Route::post('/licenses/{license}/{action}', [SyscendController::class, 'licenseAction'])->name('licenses.action');

    Route::get('/deployments', [SyscendController::class, 'deployments'])->name('deployments');
    Route::post('/deployments/{deployment}/steps', [SyscendController::class, 'deploymentSteps'])->name('deployments.steps');

    Route::get('/products', [SyscendController::class, 'products'])->name('products');
    Route::post('/products', [SyscendController::class, 'productStore'])->name('products.store');
    Route::put('/products/{product}', [SyscendController::class, 'productUpdate'])->name('products.update');
    Route::post('/products/{product}/toggle', [SyscendController::class, 'productToggle'])->name('products.toggle');

    Route::get('/settings', [SyscendController::class, 'settings'])->name('settings');
    Route::post('/settings', [SyscendController::class, 'settingsUpdate'])->name('settings.update');
});
