<?php

namespace App\Http\Controllers;

use App\Models\Cotizacion;
use App\Models\Lead;
use App\Models\Servicio;
use App\Support\SolicitudNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PublicQuoteController extends Controller
{
    public function store(Request $request, SolicitudNotifier $notifier)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255',
            'empresa' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|required_without:telefono',
            'telefono' => 'nullable|string|max:30|required_without:email',
            'servicios' => 'required|array|min:1|max:20',
            'servicios.*' => 'required|string|max:255|distinct',
            'mensaje' => 'nullable|string|max:2000',
        ]);

        $servicios = Servicio::query()
            ->where('activo', true)
            ->whereIn('nombre', $datos['servicios'])
            ->orderBy('orden')
            ->orderBy('id')
            ->get();

        if ($servicios->count() !== count($datos['servicios'])) {
            throw ValidationException::withMessages([
                'servicios' => 'Uno o más servicios ya no están disponibles. Actualiza la página e inténtalo nuevamente.',
            ]);
        }

        $montoCentimos = $servicios->sum(
            fn (Servicio $servicio) => $servicio->precio_desde === null
                ? 0
                : (int) round((float) $servicio->precio_desde * 100)
        );
        $monto = $montoCentimos / 100;
        $inversionEstimada = $servicios->contains(
            fn (Servicio $servicio) => $servicio->precio_desde !== null
        ) ? $monto : null;
        $serviciosDescripcion = $servicios
            ->map(function (Servicio $servicio) {
                $precio = $servicio->precio_desde === null
                    ? 'A cotizar'
                    : 'S/ '.number_format((float) $servicio->precio_desde, 2, '.', ',');

                return "- {$servicio->nombre}: {$precio}";
            })
            ->implode("\n");

        $descripcion = "Servicios seleccionados:\n{$serviciosDescripcion}";
        if (filled($datos['mensaje'] ?? null)) {
            $descripcion .= "\n\nDetalles del proyecto:\n".$datos['mensaje'];
        }

        [$lead, $cotizacion] = DB::transaction(function () use ($datos, $servicios, $descripcion, $monto, $inversionEstimada) {
            $lead = Lead::create([
                'nombre' => $datos['nombre'],
                'empresa' => $datos['empresa'] ?? null,
                'email' => $datos['email'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'servicio' => 'Propuesta personalizada',
                'mensaje' => $datos['mensaje'] ?? null,
            ]);

            $cotizacion = $lead->cotizaciones()->create([
                'servicio' => 'Proyecto personalizado',
                'descripcion' => $descripcion,
                'monto' => $monto,
            ]);

            $lead->update(['inversion_estimada' => $inversionEstimada]);

            return [$lead, $cotizacion];
        });

        $notificacion = $notifier->notify($lead, $cotizacion);

        return response()->json([
            'mensaje' => 'La solicitud de propuesta fue recibida correctamente.',
            'cotizacion_id' => $cotizacion->id,
            'inversion_estimada' => $inversionEstimada,
            'incluye_servicios_a_cotizar' => $servicios->contains(
                fn (Servicio $servicio) => $servicio->precio_desde === null
            ),
            ...$notificacion,
        ], 201);
    }
}
