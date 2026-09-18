<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Null = yearly option not offered for this product. One-time price stays in `price`.
            $table->decimal('yearly_price', 12, 2)->nullable()->after('price');
        });

        Schema::table('purchase_request_items', function (Blueprint $table) {
            $table->string('term')->default('one-time')->after('line_total'); // one-time | yearly
            $table->unsignedInteger('period_months')->nullable()->after('term');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('yearly_price');
        });

        Schema::table('purchase_request_items', function (Blueprint $table) {
            $table->dropColumn(['term', 'period_months']);
        });
    }
};
