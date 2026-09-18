<?php

use Illuminate\Support\Facades\Route;
use Modules\Training\app\Http\Controllers\TrainingCourseController;
use Modules\Training\app\Http\Controllers\TrainingEnrollmentController;
use Modules\Training\app\Http\Controllers\TrainingSessionController;

Route::middleware(['auth', 'permission:training.view'])->group(function () {
    Route::get('/training', [TrainingCourseController::class, 'index'])->name('training.index');
    Route::get('/training/sessions/{session}', [TrainingSessionController::class, 'show'])->name('training.sessions.show');
});
Route::middleware(['auth', 'permission:training.create'])->group(function () {
    Route::post('/training/courses', [TrainingCourseController::class, 'store'])->name('training.courses.store');
    Route::get('/training/courses/{course}/sessions/create', [TrainingSessionController::class, 'create'])->name('training.sessions.create');
    Route::post('/training/courses/{course}/sessions', [TrainingSessionController::class, 'store'])->name('training.sessions.store');
    Route::post('/training/sessions/{session}/enroll', [TrainingEnrollmentController::class, 'store'])->name('training.enrollments.store');
});
Route::middleware(['auth', 'permission:training.manage'])->group(function () {
    Route::patch('/training/courses/{course}', [TrainingCourseController::class, 'update'])->name('training.courses.update');
    Route::delete('/training/courses/{course}', [TrainingCourseController::class, 'destroy'])->name('training.courses.destroy');
    Route::patch('/training/sessions/{session}', [TrainingSessionController::class, 'update'])->name('training.sessions.update');
    Route::delete('/training/sessions/{session}', [TrainingSessionController::class, 'destroy'])->name('training.sessions.destroy');
    Route::patch('/training/enrollments/{enrollment}', [TrainingEnrollmentController::class, 'update'])->name('training.enrollments.update');
    Route::delete('/training/enrollments/{enrollment}', [TrainingEnrollmentController::class, 'destroy'])->name('training.enrollments.destroy');
});
