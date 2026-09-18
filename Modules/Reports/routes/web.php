<?php

use Illuminate\Support\Facades\Route;
use Modules\Reports\app\Http\Controllers\ReportController;

Route::middleware(['auth', 'permission:reports.view'])->prefix('reports')->name('reports.')->group(function () {
    Route::get('/', [ReportController::class, 'index'])->name('index');
    Route::get('/headcount', [ReportController::class, 'headcount'])->name('headcount');
    Route::get('/payroll', [ReportController::class, 'payroll'])->name('payroll');
    Route::get('/attendance', [ReportController::class, 'attendance'])->name('attendance');
    Route::get('/leave', [ReportController::class, 'leave'])->name('leave');
    Route::get('/training', [ReportController::class, 'training'])->name('training');
    Route::get('/performance', [ReportController::class, 'performance'])->name('performance');
});
