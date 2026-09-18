<?php

use Illuminate\Database\Migrations\Migration;
use Modules\SystemAdmin\app\Models\SystemSetting;

return new class extends Migration
{
    public function up(): void
    {
        SystemSetting::set('primary_color', '#2563eb');
    }

    public function down(): void
    {
        SystemSetting::where('key', 'primary_color')->delete();
    }
};
