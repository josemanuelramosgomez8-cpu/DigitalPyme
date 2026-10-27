<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceCategory extends Model
{
    protected $fillable = ['nombre', 'slug', 'activo', 'orden'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'orden' => 'integer'];
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(ServiceSubcategory::class, 'category_id')->orderBy('orden')->orderBy('id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Servicio::class, 'category_id');
    }
}
