<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreReturn extends Model
{
    public const ESTADOS = ['solicitada', 'aprobada', 'recibida', 'inspeccionada', 'resuelta'];
    public const RESOLUCIONES = ['reventa', 'reparacion', 'desecho', 'reembolso'];

    protected $fillable = [
        'order_id',
        'estado',
        'motivo',
        'resolucion',
        'notas_inspeccion',
        'inspeccionada_at',
        'resuelta_at',
    ];

    protected function casts(): array
    {
        return ['inspeccionada_at' => 'datetime', 'resuelta_at' => 'datetime'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(StoreOrder::class, 'order_id');
    }
}
