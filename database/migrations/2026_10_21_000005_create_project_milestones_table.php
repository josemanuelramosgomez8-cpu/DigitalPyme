<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->decimal('monto', 10, 2)->nullable();
            $table->string('estado')->default('pendiente');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->index(['project_id', 'id']);
        });

        Schema::table('project_documents', function (Blueprint $table) {
            $table->string('tipo')->default('documento')->after('original_name');
        });
    }

    public function down(): void
    {
        Schema::table('project_documents', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });

        Schema::dropIfExists('project_milestones');
    }
};
