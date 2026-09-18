<?php

use Illuminate\Support\Facades\Route;
use Modules\Performance\app\Http\Controllers\PerformanceCycleController;
use Modules\Performance\app\Http\Controllers\PerformanceGoalController;
use Modules\Performance\app\Http\Controllers\PerformanceReviewController;

Route::middleware(['auth', 'permission:performance.view'])->group(function () {
    Route::get('/performance', [PerformanceCycleController::class, 'index'])->name('performance.index');
    Route::get('/performance/cycles/{cycle}', [PerformanceCycleController::class, 'show'])->name('performance.cycles.show');
    Route::get('/performance/goals', [PerformanceGoalController::class, 'index'])->name('performance.goals.index');
    Route::get('/performance/cycles/{cycle}/employees/{employee}/review', [PerformanceReviewController::class, 'startOrShow'])->name('performance.review.start');
    Route::get('/performance/reviews/{review}', [PerformanceReviewController::class, 'show'])->name('performance.reviews.show');
});
Route::middleware(['auth', 'permission:performance.create'])->group(function () {
    Route::post('/performance/cycles', [PerformanceCycleController::class, 'store'])->name('performance.cycles.store');
    Route::post('/performance/goals', [PerformanceGoalController::class, 'store'])->name('performance.goals.store');
    Route::patch('/performance/goals/{goal}', [PerformanceGoalController::class, 'update'])->name('performance.goals.update');
    Route::delete('/performance/goals/{goal}', [PerformanceGoalController::class, 'destroy'])->name('performance.goals.destroy');
    Route::post('/performance/reviews/{review}/save', [PerformanceReviewController::class, 'save'])->name('performance.reviews.save');
    Route::post('/performance/reviews/{review}/submit', [PerformanceReviewController::class, 'submit'])->name('performance.reviews.submit');
});
Route::middleware(['auth', 'permission:performance.manage'])->group(function () {
    Route::post('/performance/cycles/{cycle}/close', [PerformanceCycleController::class, 'close'])->name('performance.cycles.close');
    Route::post('/performance/cycles/{cycle}/employees/{employee}/finalise', [PerformanceReviewController::class, 'finalise'])->name('performance.finalise');
});
