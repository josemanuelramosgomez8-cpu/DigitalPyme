<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 12, 2);
            $table->unsignedInteger('stock')->default(0);
            $table->string('estado_stock')->default('agotado');
            $table->unsignedInteger('punto_reorden')->default(0);
            $table->string('ubicacion_almacen')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->index(['activo', 'stock']);
        });

        Schema::create('store_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->restrictOnDelete();
            $table->string('estado')->default('recibido');
            $table->string('tipo_operacion')->default('in-house');
            $table->string('operador_logistico')->nullable();
            $table->string('metodo_envio');
            $table->string('ubicacion_entrega');
            $table->string('direccion_entrega');
            $table->string('codigo_rastreo')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('costo_envio', 12, 2);
            $table->decimal('total', 12, 2);
            $table->timestamp('enviado_at')->nullable();
            $table->timestamp('entregado_at')->nullable();
            $table->timestamps();
            $table->index(['client_id', 'estado']);
        });

        Schema::create('store_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('store_orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('store_products')->nullOnDelete();
            $table->string('sku');
            $table->string('nombre');
            $table->unsignedInteger('cantidad');
            $table->decimal('precio_unitario', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('store_products')->restrictOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('store_orders')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tipo');
            $table->unsignedInteger('cantidad');
            $table->string('motivo');
            $table->timestamps();
            $table->index(['product_id', 'created_at']);
        });

        Schema::create('store_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('store_orders')->restrictOnDelete();
            $table->string('estado')->default('solicitada');
            $table->text('motivo');
            $table->string('resolucion')->nullable();
            $table->text('notas_inspeccion')->nullable();
            $table->timestamp('inspeccionada_at')->nullable();
            $table->timestamp('resuelta_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_returns');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('store_order_items');
        Schema::dropIfExists('store_orders');
        Schema::dropIfExists('store_products');
    }
};
