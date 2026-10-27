<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_monthly_capacities', function (Blueprint $table) {
            $table->id();
            $table->date('month')->unique();
            $table->unsignedInteger('capacity')->default(10);
            $table->unsignedInteger('reserved')->default(0);
            $table->timestamps();
        });

        Schema::create('agenda_slots', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('time');
            $table->unsignedInteger('capacity')->default(1);
            $table->unsignedInteger('available')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['date', 'time']);
            $table->index(['date', 'active']);
        });

        Schema::create('agenda_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agenda_slot_id')->constrained('agenda_slots')->restrictOnDelete();
            $table->string('nombre');
            $table->string('email')->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('estado')->default('reservada');
            $table->timestamps();
            $table->index(['agenda_slot_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agenda_reservations');
        Schema::dropIfExists('agenda_slots');
        Schema::dropIfExists('project_monthly_capacities');
    }
};
