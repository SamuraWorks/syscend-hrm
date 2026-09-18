<?php

use Illuminate\Support\Facades\Route;
use Modules\Recruitment\app\Http\Controllers\ApplicationController;
use Modules\Recruitment\app\Http\Controllers\InterviewController;
use Modules\Recruitment\app\Http\Controllers\JobController;
use Modules\Recruitment\app\Http\Controllers\PublicJobController;

// Public careers portal (no auth required)
Route::get('/careers', [PublicJobController::class, 'index'])->name('careers.index');
Route::get('/careers/{job}', [PublicJobController::class, 'show'])->name('careers.show');
Route::post('/careers/{job}/apply', [PublicJobController::class, 'apply'])->name('careers.apply');

Route::middleware(['auth', 'permission:recruitment.view'])->group(function () {
    Route::get('/recruitment', [JobController::class, 'index'])->name('recruitment.index');
    Route::get('/recruitment/{job}', [JobController::class, 'show'])->name('recruitment.show')->whereNumber('job');
});
Route::middleware(['auth', 'permission:recruitment.create'])->group(function () {
    Route::get('/recruitment/create', [JobController::class, 'create'])->name('recruitment.create');
    Route::post('/recruitment', [JobController::class, 'store'])->name('recruitment.store');
});
Route::middleware(['auth', 'permission:recruitment.edit'])->group(function () {
    Route::get('/recruitment/{job}/edit', [JobController::class, 'edit'])->name('recruitment.edit');
    Route::put('/recruitment/{job}', [JobController::class, 'update'])->name('recruitment.update');
    Route::patch('/recruitment/{job}/status', [JobController::class, 'updateStatus'])->name('recruitment.status');
    Route::patch('/applications/{application}/stage', [ApplicationController::class, 'updateStage'])->name('applications.stage');
    Route::patch('/applications/{application}/rating', [ApplicationController::class, 'updateRating'])->name('applications.rating');
    Route::patch('/applications/{application}/notes', [ApplicationController::class, 'updateNotes'])->name('applications.notes');
    Route::post('/applications/{application}/interviews', [InterviewController::class, 'store'])->name('interviews.store');
    Route::patch('/interviews/{interview}', [InterviewController::class, 'update'])->name('interviews.update');
    Route::delete('/interviews/{interview}', [InterviewController::class, 'destroy'])->name('interviews.destroy');
    Route::post('/recruitment/{job}/apply', [ApplicationController::class, 'store'])->name('recruitment.apply');
});
Route::middleware(['auth', 'permission:recruitment.delete'])->group(function () {
    Route::delete('/recruitment/{job}', [JobController::class, 'destroy'])->name('recruitment.destroy');
    Route::delete('/applications/{application}', [ApplicationController::class, 'destroy'])->name('applications.destroy');
});
