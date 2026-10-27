<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceReview extends Model
{
    protected $fillable = [
        'servicio_id',
        'nombre',
        'email',
        'calificacion',
        'titulo',
        'comentario',
        'aprobada',
    ];

    protected function casts(): array
    {
        return ['calificacion' => 'integer', 'aprobada' => 'boolean'];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }
}
