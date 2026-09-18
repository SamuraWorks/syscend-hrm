<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');                               // Annual Leave, Sick Leave, etc.
            $table->string('code', 20)->unique();                 // AL, SL, ML, etc.
            $table->unsignedTinyInteger('days_allowed');          // days per year
            $table->boolean('is_paid')->default(true);
            $table->boolean('is_carry_forward')->default(false);
            $table->unsignedTinyInteger('max_carry_forward')->default(0);
            $table->boolean('allow_half_day')->default(true);
            $table->string('color', 7)->default('#3b82f6');
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
