<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Products / Services (configurable pricing catalogue) ────────────────
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->string('category')->default('service');       // license | service
            $table->string('type')->default('other');             // license|deployment|training|onsite|migration|domain|custom|support|other
            $table->decimal('price', 12, 2)->default(0);          // configurable — never hard-coded in UI
            $table->string('currency', 8)->default('Le');
            $table->boolean('one_time')->default(true);           // one-time purchase classification
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ─── Branding templates (presets used by Syscend sales) ────────────────
        Schema::create('branding_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->string('primary_color', 20)->default('#2563eb');
            $table->string('secondary_color', 20)->nullable();
            $table->string('login_background', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── Customer organizations ─────────────────────────────────────────────
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_name', 80)->nullable();
            $table->string('industry')->nullable();
            $table->string('country')->nullable();
            $table->string('website')->nullable();
            $table->string('size')->nullable();                   // organization size range
            $table->string('contact_name')->nullable();
            $table->string('contact_position')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();

            // White-label branding configuration
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('primary_color', 20)->default('#2563eb');
            $table->string('secondary_color', 20)->nullable();
            $table->string('login_background', 20)->nullable();
            $table->text('login_welcome')->nullable();
            $table->string('footer_copyright')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ─── Purchase requests ──────────────────────────────────────────────────
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();            // SHRM-2026-0001
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('status')->default('draft');
            $table->string('currency', 8)->default('Le');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->text('payment_note')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('payment_confirmed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ─── Purchase request line items (price snapshot at order time) ────────
        Schema::create('purchase_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_request_id')->constrained('purchase_requests')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name');
            $table->string('category')->default('service');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->unsignedInteger('qty')->default(1);
            $table->decimal('line_total', 12, 2)->default(0);
            $table->timestamps();
        });

        // ─── Licenses ───────────────────────────────────────────────────────────
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->string('license_key', 60)->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('license_type')->default('one-time');
            $table->string('status')->default('pending');         // pending|active|suspended|expired|revoked
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('installation_id')->nullable();
            $table->string('product')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ─── Deployments ────────────────────────────────────────────────────────
        Schema::create('deployments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('license_id')->nullable()->constrained('licenses')->nullOnDelete();
            $table->string('status')->default('queued');
            $table->string('domain')->nullable();
            $table->boolean('ssl')->default(false);
            $table->json('server_details')->nullable();
            $table->json('steps')->nullable();                    // deployment step checklist
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployments');
        Schema::dropIfExists('licenses');
        Schema::dropIfExists('purchase_request_items');
        Schema::dropIfExists('purchase_requests');
        Schema::dropIfExists('organizations');
        Schema::dropIfExists('branding_templates');
        Schema::dropIfExists('products');
    }
};
