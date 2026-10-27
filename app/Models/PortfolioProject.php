<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioProject extends Model
{
    protected $fillable = [
        'nombre',
        'categoria',
        'resultado',
        'imagen',
        'imagen_alt',
        'etiqueta',
        'related_service_id',
        'activo',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'orden' => 'integer',
        ];
    }

    public function relatedService()
    {
        return $this->belongsTo(Servicio::class, 'related_service_id');
    }
}
