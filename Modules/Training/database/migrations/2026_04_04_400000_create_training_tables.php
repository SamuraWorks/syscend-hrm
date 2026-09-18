<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Training courses catalog
        Schema::create('training_courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();          // Technical, Soft Skills, Compliance, Leadership
            $table->enum('delivery_mode', ['online', 'in_person', 'hybrid'])->default('online');
            $table->unsignedSmallInteger('duration_hours')->default(0);
            $table->string('provider')->nullable();           // Internal / external vendor name
            $table->decimal('cost', 10, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // Training sessions (scheduled runs of a course)
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('training_courses')->cascadeOnDelete();
            $table->string('title');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('location')->nullable();
            $table->unsignedSmallInteger('max_participants')->default(0); // 0 = unlimited
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // Employee enrollments per session
        Schema::create('training_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('training_sessions')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->enum('status', ['enrolled', 'completed', 'dropped', 'failed'])->default('enrolled');
            $table->unsignedTinyInteger('score')->nullable();   // 0–100 assessment score
            $table->text('feedback')->nullable();                // Post-training feedback from employee
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['session_id', 'employee_id'], 'te_session_employee_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_enrollments');
        Schema::dropIfExists('training_sessions');
        Schema::dropIfExists('training_courses');
    }
};
