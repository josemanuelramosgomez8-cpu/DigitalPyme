<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $demoProjects = [
            ['Miga Café', '+68% reservas online', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80'],
            ['Luma Care', '+52% leads calificados', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80'],
            ['Vivienda Mesa', '+3x más consultas', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80'],
            ['Norte Skin', '+41% conversiones', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'],
        ];

        foreach ($demoProjects as [$name, $result, $image]) {
            DB::table('portfolio_projects')
                ->where('nombre', $name)
                ->where('resultado', $result)
                ->where('imagen', $image)
                ->update(['activo' => false]);
        }

        DB::table('testimonios')
            ->where('autor', 'Valeria Castro')
            ->where('cargo', 'Fundadora, Miga Café')
            ->where('resultado', '+68%')
            ->where('resultado_descripcion', 'reservas online')
            ->where('resultado_periodo', 'en 3 meses')
            ->update(['activo' => false]);
    }

    public function down(): void
    {
        // Unverified portfolio content must not be re-published automatically.
    }
};
