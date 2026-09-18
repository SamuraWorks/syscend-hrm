<?php

use Illuminate\Support\Facades\Route;
use Modules\SystemAdmin\app\Http\Controllers\AuditLogController;
use Modules\SystemAdmin\app\Http\Controllers\RolePermissionController;
use Modules\SystemAdmin\app\Http\Controllers\SystemSettingsController;
use Modules\SystemAdmin\app\Http\Controllers\UserManagementController;

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {

    Route::middleware('permission:admin.users')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserManagementController::class, 'create'])->name('users.create');
        Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
        Route::get('/users/{user}/edit', [UserManagementController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}/toggle-active', [UserManagementController::class, 'toggleActive'])->name('users.toggle-active');
        Route::patch('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');
    });

    Route::middleware('permission:admin.roles')->group(function () {
        Route::get('/roles', [RolePermissionController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RolePermissionController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RolePermissionController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RolePermissionController::class, 'destroy'])->name('roles.destroy');
    });

    Route::middleware('permission:admin.settings')->group(function () {
        Route::get('/settings', [SystemSettingsController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SystemSettingsController::class, 'update'])->name('settings.update');
        Route::post('/settings/upload-logo', [SystemSettingsController::class, 'uploadLogo'])->name('settings.upload-logo');
        Route::post('/settings/test-email', [SystemSettingsController::class, 'testEmail'])->name('settings.test-email');
        Route::post('/settings/backup-database', [SystemSettingsController::class, 'backupDatabase'])->name('settings.backup-database');
    });

    Route::middleware('permission:admin.audit-logs')->group(function () {
        Route::get('/audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');
        Route::get('/audit-log/export', [AuditLogController::class, 'export'])->name('audit-log.export');
    });
});
