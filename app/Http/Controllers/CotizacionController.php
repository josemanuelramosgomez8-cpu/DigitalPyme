<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Cotizacion;
use App\Models\Lead;
use App\Models\Project;
use App\Models\ProjectMonthlyCapacity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CotizacionController extends Controller
{
    public const ESTADOS = ['borrador', 'enviada', 'aceptada', 'rechazada'];

    public function index(Lead $lead)
    {
        return response()->json($lead->cotizaciones()->latest()->get());
    }

    public function store(Request $request, Lead $lead)
    {
        $datos = $request->validate([
            'servicio'    => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:2000',
            'monto'       => 'required|numeric|min:0|max:99999999',
        ]);
        $datos['estado'] = 'borrador';

        $cotizacion = DB::transaction(function () use ($lead, $datos) {
            $cotizacion = $lead->cotizaciones()->create($datos);

            if (in_array($lead->estado, ['nuevo', 'contactado'], true)) {
                $lead->update(['estado' => 'cotizado']);
            }

            return $cotizacion;
        });

        return response()->json($cotizacion, 201);
    }

    public function update(Request $request, Cotizacion $cotizacion)
    {
        $datos = $request->validate([
            'estado' => ['required', Rule::in(self::ESTADOS)],
        ]);

        $cotizacion = DB::transaction(function () use ($cotizacion, $datos) {
            $lead = $cotizacion->lead()->lockForUpdate()->firstOrFail();
            $cotizacion->update($datos);

            $tieneAceptada = $lead->cotizaciones()
                ->where('estado', 'aceptada')
                ->exists();

            if ($datos['estado'] === 'aceptada') {
                $client = $this->ensureClientForLead($lead);

                $month = now()->startOfMonth()->toDateString();
                $capacity = ProjectMonthlyCapacity::firstOrCreate(
                    ['month' => $month],
                    ['capacity' => 10, 'reserved' => 0],
                );
                $capacity = ProjectMonthlyCapacity::whereKey($capacity->id)->lockForUpdate()->firstOrFail();
                $projectExists = Project::where('cotizacion_id', $cotizacion->id)->exists();

                if (!$projectExists && $capacity->reserved >= $capacity->capacity) {
                    throw ValidationException::withMessages([
                        'capacidad' => 'No quedan cupos de proyectos disponibles para este mes.',
                    ]);
                }

                $project = Project::firstOrCreate(
                    ['cotizacion_id' => $cotizacion->id],
                    [
                        'client_id' => $client->id,
                        'nombre' => $cotizacion->servicio,
                        'descripcion' => $cotizacion->descripcion,
                        'estado' => 'planificacion',
                        'progreso' => 0,
                    ]
                );

                if ($project->wasRecentlyCreated) {
                    $capacity->increment('reserved');
                }
            }

            if ($tieneAceptada) {
                $lead->update(['estado' => 'ganado']);
            } elseif ($lead->estado === 'ganado') {
                $lead->update(['estado' => 'cotizado']);
            }

            return $cotizacion;
        });

        return response()->json($cotizacion);
    }

    private function ensureClientForLead(Lead $lead): Client
    {
        $client = $lead->client;

        if ($client) {
            return $client;
        }

        if (blank($lead->email)) {
            throw ValidationException::withMessages([
                'lead' => 'El lead necesita un correo electrónico para crear el acceso del cliente antes de aceptar la cotización.',
            ]);
        }

        $user = User::where('email', $lead->email)->first();

        if ($user) {
            if (!$user->is_client || $user->client) {
                throw ValidationException::withMessages([
                    'lead' => 'El correo del lead ya pertenece a otra cuenta. Convierte el lead en cliente con otro correo antes de aceptar.',
                ]);
            }
        } else {
            $user = new User;
            $user->name = $lead->nombre;
            $user->email = $lead->email;
            $user->password = Hash::make(Str::random(64));
            $user->is_client = true;
            $user->save();
        }

        return Client::create([
            'user_id' => $user->id,
            'lead_id' => $lead->id,
            'nombre' => $lead->nombre,
            'empresa' => $lead->empresa,
        ]);
    }
}