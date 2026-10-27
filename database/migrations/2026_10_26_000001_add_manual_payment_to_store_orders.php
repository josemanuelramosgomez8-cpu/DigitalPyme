<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_orders', function (Blueprint $table) {
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('pagado');
            $table->string('receipt_path')->nullable();
            $table->string('receipt_original_name')->nullable();
            $table->string('receipt_mime_type')->nullable();
            $table->unsignedBigInteger('receipt_size')->nullable();
            $table->timestamp('receipt_uploaded_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('payment_due_at')->nullable();
            $table->index(['payment_status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('store_orders', function (Blueprint $table) {
            $table->dropIndex(['payment_status', 'created_at']);
            $table->dropColumn([
                'payment_method',
                'payment_status',
                'receipt_path',
                'receipt_original_name',
                'receipt_mime_type',
                'receipt_size',
                'receipt_uploaded_at',
                'paid_at',
                'payment_due_at',
            ]);
        });
    }
};
