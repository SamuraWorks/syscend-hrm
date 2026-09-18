<?php

use Illuminate\Support\Facades\Route;
use Modules\Leave\app\Http\Controllers\LeaveController;
use Modules\Leave\app\Http\Controllers\LeaveTypeController;

Route::middleware(['auth', 'permission:leaves.view'])->group(function () {
    Route::get('/leaves', [LeaveController::class, 'index'])->name('leaves.index');
    Route::get('/leaves/calendar', [LeaveController::class, 'calendar'])->name('leaves.calendar');
    Route::resource('/leave/types', LeaveTypeController::class)->only(['index'])->parameters(['types' => 'type']);
});
Route::middleware(['auth', 'permission:leaves.apply'])->group(function () {
    Route::post('/leaves', [LeaveController::class, 'store'])->name('leaves.store');
    Route::post('/leaves/{leave}/cancel', [LeaveController::class, 'cancel'])->name('leaves.cancel');
});
Route::middleware(['auth', 'permission:leaves.approve'])->group(function () {
    Route::post('/leaves/{leave}/approve', [LeaveController::class, 'approve'])->name('leaves.approve');
});
Route::middleware(['auth', 'permission:leaves.reject'])->group(function () {
    Route::post('/leaves/{leave}/reject', [LeaveController::class, 'reject'])->name('leaves.reject');
});
Route::middleware(['auth', 'permission:leaves.manage'])->group(function () {
    Route::resource('/leave/types', LeaveTypeController::class)->except(['index', 'show'])->parameters(['types' => 'type']);
});
