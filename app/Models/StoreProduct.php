<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StoreProduct extends Model
{
    protected $fillable = [
        'sku',
        'nombre',
        'descripcion',
        'categoria',
        'precio',
        'stock',
        'punto_reorden',
        'ubicacion_almacen',
        'activo',
        'image_path',
        'image_mime_type',
    ];

    protected $appends = ['alerta_reorden', 'imagen_url'];

    protected $hidden = ['image_path'];

    protected static function booted(): void
    {
        static::saving(function (StoreProduct $product) {
            $product->estado_stock = $product->stock === 0 ? 'agotado' : 'disponible';
        });
    }

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'stock' => 'integer',
            'punto_reorden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function getAlertaReordenAttribute(): bool
    {
        return $this->stock > 0 && $this->stock <= $this->punto_reorden;
    }

    public function getImagenUrlAttribute(): ?string
    {
        return $this->image_path
            ? url("/api/store/products/{$this->id}/image?v=".($this->updated_at?->timestamp ?? time()))
            : null;
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(StoreOrderItem::class, 'product_id');
    }
}
