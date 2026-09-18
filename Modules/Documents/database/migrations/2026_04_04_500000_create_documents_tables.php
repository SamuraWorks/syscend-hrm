<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Company-level document templates / policies
        if (! Schema::hasTable('company_documents')) {
            Schema::create('company_documents', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('category');           // Policy, Contract, Compliance, Form, Other
                $table->text('description')->nullable();
                $table->string('file_path');          // stored path on disk
                $table->string('file_name');          // original filename
                $table->string('mime_type')->nullable();
                $table->unsignedBigInteger('file_size')->default(0); // bytes
                $table->enum('visibility', ['all', 'hr_only', 'managers'])->default('all');
                $table->date('expiry_date')->nullable();
                $table->enum('status', ['active', 'archived'])->default('active');
                $table->foreignId('uploaded_by')->constrained('users');
                $table->timestamps();
            });
        }

        // Employee-specific documents — extend existing table with missing columns if needed
        if (! Schema::hasTable('employee_documents')) {
            Schema::create('employee_documents', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
                $table->string('title');
                $table->string('category');
                $table->string('file_path');
                $table->string('file_name');
                $table->string('mime_type')->nullable();
                $table->unsignedBigInteger('file_size')->default(0);
                $table->date('expiry_date')->nullable();
                $table->enum('status', ['active', 'expired', 'archived'])->default('active');
                $table->foreignId('uploaded_by')->constrained('users');
                $table->timestamps();
            });
        }

        // Document acknowledgement — tracks who has read/accepted a company doc
        if (! Schema::hasTable('document_acknowledgements')) {
            Schema::create('document_acknowledgements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('document_id')->constrained('company_documents')->cascadeOnDelete();
                $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
                $table->timestamp('acknowledged_at');
                $table->timestamps();

                $table->unique(['document_id', 'employee_id'], 'da_doc_emp_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('document_acknowledgements');
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('company_documents');
    }
};
