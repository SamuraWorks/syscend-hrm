<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name');                        // e.g. "Morning Shift"
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedTinyInteger('break_minutes')->default(0);
            $table->string('color', 7)->default('#3b82f6'); // hex for UI
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
