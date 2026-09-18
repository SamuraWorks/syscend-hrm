<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('resume_path')->nullable();
            $table->text('cover_letter')->nullable();
            $table->string('current_company')->nullable();
            $table->string('current_title')->nullable();
            $table->unsignedTinyInteger('experience_years')->default(0);
            $table->enum('stage', ['new', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected'])->default('new');
            $table->text('notes')->nullable();
            $table->unsignedTinyInteger('rating')->nullable(); // 1-5
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
