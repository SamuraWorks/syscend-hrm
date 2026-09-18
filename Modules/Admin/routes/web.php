<?php

use Illuminate\Support\Facades\Route;
use Modules\Admin\app\Http\Controllers\NotificationController;
use Modules\Admin\app\Http\Controllers\SystemSettingController;

Route::middleware('auth')->group(function () {
    // Recaptcha / integration settings (legacy admin module)
    Route::get('/admin/integrations', [SystemSettingController::class, 'index'])->name('admin.integrations');
    Route::post('/admin/integrations', [SystemSettingController::class, 'update'])->name('admin.integrations.update');

    // Notifications
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markRead'])->name('notifications.markRead');
});
