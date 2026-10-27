<?php

namespace App\Http\Controllers;

use App\Models\Testimonio;
use Illuminate\Http\Request;

class TestimonioController extends Controller
{
    public function publicos()
    {
        return response()->json(
            Testimonio::where('activo', true)->orderBy('orden')->orderBy('id')->get()
        );
    }

    public function index()
    {
        return response()->json(Testimonio::orderBy('orden')->orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'contenido' => 'required|string|max:2000',
            'autor' => 'required|string|max:255',
            'cargo' => 'required|string|max:255',
            'iniciales' => 'required|string|max:10',
            'resultado' => 'required|string|max:255',
            'resultado_descripcion' => 'required|string|max:255',
            'resultado_periodo' => 'required|string|max:255',
            'activo' => 'sometimes|boolean',
            'orden' => 'sometimes|integer|min:0',
        ]);

        return response()->json(Testimonio::create($datos), 201);
    }

    public function update(Request $request, Testimonio $testimonio)
    {
        $datos = $request->validate([
            'contenido' => 'sometimes|required|string|max:2000',
            'autor' => 'sometimes|required|string|max:255',
            'cargo' => 'sometimes|required|string|max:255',
            'iniciales' => 'sometimes|required|string|max:10',
            'resultado' => 'sometimes|required|string|max:255',
            'resultado_descripcion' => 'sometimes|required|string|max:255',
            'resultado_periodo' => 'sometimes|required|string|max:255',
            'activo' => 'sometimes|boolean',
            'orden' => 'sometimes|integer|min:0',
        ]);

        $testimonio->update($datos);

        return response()->json($testimonio);
    }

    public function destroy(Testimonio $testimonio)
    {
        $testimonio->delete();

        return response()->json(['mensaje' => 'Testimonio eliminado']);
    }
}
