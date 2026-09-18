<?php

use Illuminate\Support\Facades\Route;
use Modules\Organization\app\Http\Controllers\DepartmentController;
use Modules\Organization\app\Http\Controllers\PositionController;

Route::middleware(['auth', 'permission:departments.view'])->group(function () {
    Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::get('/departments/{department}', [DepartmentController::class, 'show'])->name('departments.show')->whereNumber('department');
    Route::get('/positions', [PositionController::class, 'index'])->name('positions.index');
});
Route::middleware(['auth', 'permission:departments.create'])->group(function () {
    Route::get('/departments/create', [DepartmentController::class, 'create'])->name('departments.create');
    Route::post('/departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::get('/positions/create', [PositionController::class, 'create'])->name('positions.create');
    Route::post('/positions', [PositionController::class, 'store'])->name('positions.store');
});
Route::middleware(['auth', 'permission:departments.edit'])->group(function () {
    Route::get('/departments/{department}/edit', [DepartmentController::class, 'edit'])->name('departments.edit');
    Route::put('/departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::get('/positions/{position}/edit', [PositionController::class, 'edit'])->name('positions.edit');
    Route::put('/positions/{position}', [PositionController::class, 'update'])->name('positions.update');
    Route::patch('/positions/{position}', [PositionController::class, 'update']);
});
Route::middleware(['auth', 'permission:departments.delete'])->group(function () {
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
    Route::delete('/positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');
});
