<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgendaSlot extends Model
{
    protected $fillable = [
        'date',
        'time',
        'capacity',
        'available',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'active' => 'boolean',
            'capacity' => 'integer',
            'available' => 'integer',
        ];
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(AgendaReservation::class);
    }
}
