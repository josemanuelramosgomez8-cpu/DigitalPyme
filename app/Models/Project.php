<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    public const ESTADOS = ['planificacion', 'en_progreso', 'revision', 'completado', 'pausado'];

    protected $fillable = [
        'client_id',
        'cotizacion_id',
        'nombre',
        'descripcion',
        'estado',
        'progreso',
        'fecha_inicio',
        'fecha_entrega',
    ];

    protected function casts(): array
    {
        return [
            'progreso' => 'integer',
            'fecha_inicio' => 'date:Y-m-d',
            'fecha_entrega' => 'date:Y-m-d',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ProjectMessage::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(ProjectPayment::class);
    }
}
