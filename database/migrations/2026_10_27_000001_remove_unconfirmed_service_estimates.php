<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('servicios')
            ->where(function ($query) {
                $query->where(function ($query) {
                    $query->where('nombre', 'Páginas web')
                        ->where('precio_desde', 1800)
                        ->where('duracion', '2–4 semanas');
                })->orWhere(function ($query) {
                    $query->where('nombre', 'Tiendas en línea')
                        ->whereNull('precio_desde')
                        ->where('duracion', '4–6 semanas');
                })->orWhere(function ($query) {
                    $query->where('nombre', 'Branding')
                        ->where('precio_desde', 1200)
                        ->where('duracion', '2–3 semanas');
                })->orWhere(function ($query) {
                    $query->where('nombre', 'Marketing digital')
                        ->where('precio_desde', 900)
                        ->where('duracion', 'Plan mensual');
                })->orWhere(function ($query) {
                    $query->where('nombre', 'Mantenimiento')
                        ->where('precio_desde', 250)
                        ->where('duracion', 'Plan mensual');
                });
            })
            ->update([
                'precio_desde' => null,
                'duracion' => null,
            ]);
    }

    public function down(): void
    {
        // Confirmed business prices and timelines cannot be safely reconstructed.
    }
};
