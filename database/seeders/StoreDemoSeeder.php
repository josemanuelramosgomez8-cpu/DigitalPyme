<?php

namespace Database\Seeders;

use App\Models\StoreProduct;
use Illuminate\Database\Seeder;

class StoreDemoSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['sku' => 'DEMO-TAZA-01', 'nombre' => 'Taza de demostración', 'descripcion' => 'Producto de ejemplo para probar inventario y fulfillment.', 'precio' => 35, 'stock' => 12, 'punto_reorden' => 4, 'ubicacion_almacen' => 'Pasillo A / Estante 1'],
            ['sku' => 'DEMO-LIBRETA-01', 'nombre' => 'Libreta de planificación', 'descripcion' => 'Artículo de muestra para probar el carrito y los niveles de stock.', 'precio' => 65, 'stock' => 8, 'punto_reorden' => 3, 'ubicacion_almacen' => 'Pasillo A / Estante 2'],
        ];

        foreach ($products as $attributes) {
            $initialStock = $attributes['stock'];
            unset($attributes['stock']);
            $product = StoreProduct::firstOrCreate(
                ['sku' => $attributes['sku']],
                [...$attributes, 'stock' => $initialStock, 'activo' => false],
            );
            if ($product->wasRecentlyCreated && $initialStock > 0) {
                $product->movements()->create([
                    'tipo' => 'entrada',
                    'cantidad' => $initialStock,
                    'motivo' => 'Stock inicial de tienda demo',
                ]);
            }
        }
    }
}
