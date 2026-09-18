<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->date('dob')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->string('nationality')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code')->nullable();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('reporting_manager_id')->nullable();
            $table->date('date_of_joining')->nullable();
            $table->enum('contract_type', ['Permanent', 'Contract', 'Temporary'])->default('Permanent');
            $table->enum('employment_status', ['Active', 'Inactive', 'On Leave', 'Terminated'])->default('Active');
            $table->decimal('salary', 12, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('reporting_manager_id')->references('id')->on('employees')->nullOnDelete();
        });

        // Add department head FK after employees table exists
        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('head_id')->references('id')->on('employees')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['head_id']);
        });
        Schema::dropIfExists('employees');
    }
};
