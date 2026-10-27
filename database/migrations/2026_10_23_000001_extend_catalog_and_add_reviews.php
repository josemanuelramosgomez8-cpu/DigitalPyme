<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->boolean('activo')->default(true);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('service_subcategories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('service_categories')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('slug');
            $table->boolean('activo')->default(true);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
            $table->unique(['category_id', 'slug']);
        });

        Schema::table('servicios', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique();
            $table->text('descripcion_larga')->nullable();
            $table->json('incluye')->nullable();
            $table->string('etiqueta', 30)->nullable();
            $table->foreignId('category_id')->nullable()->constrained('service_categories')->nullOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('service_subcategories')->nullOnDelete();
        });

        Schema::table('portfolio_projects', function (Blueprint $table) {
            $table->string('etiqueta', 30)->nullable();
            $table->foreignId('related_service_id')->nullable()->constrained('servicios')->nullOnDelete();
        });

        Schema::create('service_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')->constrained('servicios')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('email');
            $table->unsignedTinyInteger('calificacion');
            $table->string('titulo')->nullable();
            $table->text('comentario');
            $table->boolean('aprobada')->default(false);
            $table->timestamps();
            $table->index(['servicio_id', 'aprobada']);
        });

        $usedSlugs = [];
        foreach (DB::table('servicios')->orderBy('id')->get() as $service) {
            $base = Str::slug($service->nombre) ?: 'servicio';
            $slug = $base;
            $suffix = 2;
            while (in_array($slug, $usedSlugs, true)) {
                $slug = "{$base}-{$suffix}";
                $suffix++;
            }
            $usedSlugs[] = $slug;

            $categorySlug = Str::slug($service->nombre) ?: "servicio-{$service->id}";
            $categoryId = DB::table('service_categories')->where('slug', $categorySlug)->value('id');
            if (!$categoryId) {
                $categoryId = DB::table('service_categories')->insertGetId([
                    'nombre' => $service->nombre,
                    'slug' => $categorySlug,
                    'activo' => true,
                    'orden' => $service->orden,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            DB::table('servicios')->where('id', $service->id)->update([
                'slug' => $slug,
                'category_id' => $categoryId,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('service_reviews');
        Schema::table('portfolio_projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('related_service_id');
            $table->dropColumn('etiqueta');
        });
        Schema::table('servicios', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
            $table->dropConstrainedForeignId('subcategory_id');
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'descripcion_larga', 'incluye', 'etiqueta']);
        });
        Schema::dropIfExists('service_subcategories');
        Schema::dropIfExists('service_categories');
    }
};
