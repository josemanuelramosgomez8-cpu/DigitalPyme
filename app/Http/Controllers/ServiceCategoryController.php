<?php

namespace App\Http\Controllers;

use App\Models\ServiceCategory;
use App\Models\ServiceSubcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ServiceCategoryController extends Controller
{
    public function publicIndex()
    {
        return response()->json(
            ServiceCategory::where('activo', true)
                ->with(['subcategories' => fn ($query) => $query->where('activo', true)])
                ->orderBy('orden')
                ->orderBy('id')
                ->get()
        );
    }

    public function index()
    {
        return response()->json(
            ServiceCategory::with('subcategories')->orderBy('orden')->orderBy('id')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140', 'unique:service_categories,slug'],
            'activo' => ['sometimes', 'boolean'],
            'orden' => ['sometimes', 'integer', 'min:0'],
        ]);

        $data['slug'] = $data['slug'] ?? (Str::slug($data['nombre'] ?? 'categoria') ?: 'categoria');
        Validator::make($data, ['slug' => ['required', 'string', 'max:140', 'unique:service_categories,slug']])->validate();

        return response()->json(ServiceCategory::create($data), 201);
    }

    public function update(Request $request, ServiceCategory $serviceCategory)
    {
        $data = $request->validate([
            'nombre' => ['sometimes', 'required', 'string', 'max:120'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:140', Rule::unique('service_categories', 'slug')->ignore($serviceCategory->id)],
            'activo' => ['sometimes', 'boolean'],
            'orden' => ['sometimes', 'integer', 'min:0'],
        ]);
        if (array_key_exists('slug', $data) && !$data['slug']) {
            $data['slug'] = Str::slug($data['nombre'] ?? $serviceCategory->nombre) ?: "categoria-{$serviceCategory->id}";
        }
        if (!array_key_exists('slug', $data) && $serviceCategory->slug === null) {
            $data['slug'] = Str::slug($data['nombre'] ?? $serviceCategory->nombre) ?: "categoria-{$serviceCategory->id}";
        }
        if (isset($data['slug'])) {
            Validator::make($data, [
                'slug' => ['required', 'string', 'max:140', Rule::unique('service_categories', 'slug')->ignore($serviceCategory->id)],
            ])->validate();
        }
        $serviceCategory->update($data);

        return response()->json($serviceCategory->load('subcategories'));
    }

    public function destroy(ServiceCategory $serviceCategory)
    {
        $serviceCategory->delete();

        return response()->json(['mensaje' => 'Categoría eliminada']);
    }

    public function storeSubcategory(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:service_categories,id'],
            'nombre' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'activo' => ['sometimes', 'boolean'],
            'orden' => ['sometimes', 'integer', 'min:0'],
        ]);
        $data['slug'] = $data['slug'] ?? (Str::slug($data['nombre'] ?? 'subcategoria') ?: 'subcategoria');
        Validator::make($data, ['slug' => [
            'required',
            'string',
            'max:140',
            Rule::unique('service_subcategories', 'slug')->where('category_id', $data['category_id']),
        ]])->validate();

        return response()->json(ServiceSubcategory::create($data), 201);
    }

    public function updateSubcategory(Request $request, ServiceSubcategory $serviceSubcategory)
    {
        $data = $request->validate([
            'category_id' => ['sometimes', 'required', 'exists:service_categories,id'],
            'nombre' => ['sometimes', 'required', 'string', 'max:120'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:140'],
            'activo' => ['sometimes', 'boolean'],
            'orden' => ['sometimes', 'integer', 'min:0'],
        ]);
        if (array_key_exists('slug', $data) && !$data['slug']) {
            $data['slug'] = Str::slug($data['nombre'] ?? $serviceSubcategory->nombre) ?: "subcategoria-{$serviceSubcategory->id}";
        }
        if (!array_key_exists('slug', $data) && $serviceSubcategory->slug === null) {
            $data['slug'] = Str::slug($data['nombre'] ?? $serviceSubcategory->nombre) ?: "subcategoria-{$serviceSubcategory->id}";
        }
        $categoryId = $data['category_id'] ?? $serviceSubcategory->category_id;
        if (isset($data['slug'])) {
            Validator::make($data, ['slug' => [
                'required',
                'string',
                'max:140',
                Rule::unique('service_subcategories', 'slug')->where('category_id', $categoryId)->ignore($serviceSubcategory->id),
            ]])->validate();
        }
        $serviceSubcategory->update($data);

        return response()->json($serviceSubcategory);
    }

    public function destroySubcategory(ServiceSubcategory $serviceSubcategory)
    {
        $serviceSubcategory->delete();

        return response()->json(['mensaje' => 'Subcategoría eliminada']);
    }
}
