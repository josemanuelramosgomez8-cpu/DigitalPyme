<?php

namespace App\Http\Controllers;

use App\Models\PortfolioProject;
use Illuminate\Http\Request;

class PortfolioProjectController extends Controller
{
    public function publicos()
    {
        return response()->json(
            PortfolioProject::where('activo', true)->orderBy('orden')->orderBy('id')->get()
        );
    }

    public function index()
    {
        return response()->json(
            PortfolioProject::orderBy('orden')->orderBy('id')->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255',
            'categoria' => 'required|string|max:255',
            'resultado' => 'required|string|max:255',
            'imagen' => 'required|string|max:2000',
            'imagen_alt' => 'nullable|string|max:255',
            'etiqueta' => ['nullable', \Illuminate\Validation\Rule::in(['Nuevo', 'Más vendido', '-20%', 'Destacado'])],
            'related_service_id' => 'nullable|exists:servicios,id',
            'activo' => 'sometimes|boolean',
            'orden' => 'sometimes|integer|min:0',
        ]);

        return response()->json(PortfolioProject::create($datos), 201);
    }

    public function update(Request $request, PortfolioProject $portfolioProject)
    {
        $datos = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'categoria' => 'sometimes|required|string|max:255',
            'resultado' => 'sometimes|required|string|max:255',
            'imagen' => 'sometimes|required|string|max:2000',
            'imagen_alt' => 'sometimes|nullable|string|max:255',
            'etiqueta' => ['sometimes', 'nullable', \Illuminate\Validation\Rule::in(['Nuevo', 'Más vendido', '-20%', 'Destacado'])],
            'related_service_id' => 'sometimes|nullable|exists:servicios,id',
            'activo' => 'sometimes|boolean',
            'orden' => 'sometimes|integer|min:0',
        ]);

        $portfolioProject->update($datos);

        return response()->json($portfolioProject);
    }

    public function destroy(PortfolioProject $portfolioProject)
    {
        $portfolioProject->delete();

        return response()->json(['mensaje' => 'Proyecto de portafolio eliminado']);
    }
}
