<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_products', function (Blueprint $table) {
            $table->string('categoria', 120)->nullable()->index();
            $table->string('image_path')->nullable();
            $table->string('image_mime_type', 80)->nullable();
        });

        DB::table('store_products')
            ->whereIn('sku', ['DEMO-TAZA-01', 'DEMO-LIBRETA-01'])
            ->update(['activo' => false]);
    }

    public function down(): void
    {
        Schema::table('store_products', function (Blueprint $table) {
            $table->dropIndex(['categoria']);
            $table->dropColumn(['categoria', 'image_path', 'image_mime_type']);
        });
    }
};
