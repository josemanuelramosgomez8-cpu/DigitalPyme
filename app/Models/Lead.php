<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    protected $fillable = [
        'nombre',
        'empresa',
        'email',
        'telefono',
        'servicio',
        'mensaje',
        'inversion_estimada',
        'estado',
    ];

    protected function casts(): array
    {
        return ['inversion_estimada' => 'decimal:2'];
    }

    public function cotizaciones(): HasMany
    {
        return $this->hasMany(Cotizacion::class);
    }

    public function client(): HasOne
    {
        return $this->hasOne(Client::class);
    }
}