<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgendaReservation extends Model
{
    protected $fillable = [
        'agenda_slot_id',
        'nombre',
        'email',
        'telefono',
        'estado',
    ];

    public function slot(): BelongsTo
    {
        return $this->belongsTo(AgendaSlot::class, 'agenda_slot_id');
    }
}
