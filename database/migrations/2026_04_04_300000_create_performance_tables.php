<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Performance cycles (appraisal periods)
        Schema::create('performance_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['active', 'closed'])->default('active');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // Employee goals within a cycle
        Schema::create('performance_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('cycle_id')->constrained('performance_cycles')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('weight')->default(0); // 0-100, sum should equal 100 per employee/cycle
            $table->unsignedTinyInteger('progress')->default(0); // 0-100
            $table->enum('status', ['draft', 'active', 'completed'])->default('active');
            $table->date('due_date')->nullable();
            $table->timestamps();
        });

        // Review instances (self / manager / peer)
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('cycle_id')->constrained('performance_cycles')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('employees')->cascadeOnDelete();
            $table->enum('type', ['self', 'manager']);
            $table->enum('status', ['pending', 'submitted', 'finalised'])->default('pending');
            $table->text('overall_comments')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'cycle_id', 'type'], 'pr_employee_cycle_type_unique');
        });

        // Per-criteria line items within a review
        Schema::create('performance_review_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained('performance_reviews')->cascadeOnDelete();
            $table->string('criteria');
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('comments')->nullable();
            $table->timestamps();
        });

        // Final consolidated rating per employee per cycle
        Schema::create('performance_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('cycle_id')->constrained('performance_cycles')->cascadeOnDelete();
            $table->decimal('self_score', 4, 2)->nullable();
            $table->decimal('manager_score', 4, 2)->nullable();
            $table->decimal('final_score', 4, 2)->nullable();
            $table->string('rating_label')->nullable(); // Poor / Average / Good / Excellent
            $table->foreignId('finalised_by')->nullable()->constrained('users');
            $table->timestamp('finalised_at')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'cycle_id'], 'pr_rating_employee_cycle_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_ratings');
        Schema::dropIfExists('performance_review_items');
        Schema::dropIfExists('performance_reviews');
        Schema::dropIfExists('performance_goals');
        Schema::dropIfExists('performance_cycles');
    }
};
