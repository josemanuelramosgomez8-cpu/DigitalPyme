<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('reference')->unique();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('milestone_id')->nullable()->constrained('project_milestones')->nullOnDelete();
            $table->string('method', 30);
            $table->string('provider', 40)->nullable();
            $table->string('provider_reference')->nullable()->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('PEN');
            $table->string('status', 30)->default('pendiente');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['project_id', 'status']);
        });

        Schema::table('project_documents', function (Blueprint $table) {
            $table->foreignId('payment_id')->nullable()->after('project_id')->constrained('project_payments')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('project_documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_id');
        });

        Schema::dropIfExists('project_payments');
    }
};
