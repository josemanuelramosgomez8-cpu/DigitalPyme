<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMilestone extends Model
{
    public const ESTADOS = ['pendiente', 'pendiente_aprobacion', 'aprobado'];

    protected $fillable = [
        'project_id',
        'titulo',
        'descripcion',
        'monto',
        'estado',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'approved_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
