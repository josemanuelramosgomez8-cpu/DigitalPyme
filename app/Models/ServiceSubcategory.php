<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceSubcategory extends Model
{
    protected $fillable = ['category_id', 'nombre', 'slug', 'activo', 'orden'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'orden' => 'integer'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Servicio::class, 'subcategory_id');
    }
}
