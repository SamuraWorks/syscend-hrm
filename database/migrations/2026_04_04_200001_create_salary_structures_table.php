<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_structures', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('salary_structure_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_structure_id')->constrained()->cascadeOnDelete();
            $table->foreignId('salary_component_id')->constrained()->cascadeOnDelete();
            $table->decimal('override_value', 10, 2)->nullable();
            $table->timestamps();
            $table->unique(['salary_structure_id', 'salary_component_id'], 'ssc_structure_component_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_structure_components');
        Schema::dropIfExists('salary_structures');
    }
};
