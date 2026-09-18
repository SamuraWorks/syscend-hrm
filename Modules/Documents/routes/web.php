<?php

use Illuminate\Support\Facades\Route;
use Modules\Documents\app\Http\Controllers\CompanyDocumentController;
use Modules\Documents\app\Http\Controllers\EmployeeDocumentController;

Route::middleware(['auth', 'permission:documents.view'])->group(function () {
    Route::get('/documents', [CompanyDocumentController::class, 'index'])->name('documents.index');
    Route::post('/documents/{document}/acknowledge', [CompanyDocumentController::class, 'acknowledge'])->name('documents.acknowledge');
});

// Download routes — open to all auth users (they only get their own files via SelfController)
Route::middleware(['auth'])->group(function () {
    Route::get('/documents/{document}/download', [CompanyDocumentController::class, 'download'])->name('documents.download');
    Route::get('/employee-documents/{document}/download', [EmployeeDocumentController::class, 'download'])->name('employee.documents.download');
});
Route::middleware(['auth', 'permission:documents.upload'])->group(function () {
    Route::post('/documents', [CompanyDocumentController::class, 'store'])->name('documents.store');
    Route::post('/employees/{employee}/documents', [EmployeeDocumentController::class, 'store'])->name('employee.documents.store');
    Route::patch('/documents/{document}', [CompanyDocumentController::class, 'update'])->name('documents.update');
});
Route::middleware(['auth', 'permission:documents.delete'])->group(function () {
    Route::delete('/documents/{document}', [CompanyDocumentController::class, 'destroy'])->name('documents.destroy');
    Route::delete('/employee-documents/{document}', [EmployeeDocumentController::class, 'destroy'])->name('employee.documents.destroy');
});
