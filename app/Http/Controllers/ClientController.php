<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ClientController extends Controller
{
    public function convertLead(Request $request, Lead $lead)
    {
        if ($lead->client()->exists()) {
            return response()->json(['mensaje' => 'Este lead ya está asociado a un cliente.'], 409);
        }

        $datos = $request->validate([
            'email' => [
                Rule::requiredIf(blank($lead->email)),
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
        ]);

        $email = $datos['email'] ?? $lead->email;

        if (blank($email)) {
            throw ValidationException::withMessages([
                'email' => 'Se necesita un correo electrónico para crear el acceso del cliente.',
            ]);
        }

        if (User::where('email', $email)->exists()) {
            throw ValidationException::withMessages([
                'email' => 'Ese correo ya pertenece a una cuenta. Usa otro correo o revisa la cuenta existente.',
            ]);
        }

        $client = DB::transaction(function () use ($lead, $email) {
            $user = new User;
            $user->name = $lead->nombre;
            $user->email = $email;
            $user->password = Hash::make(Str::random(64));
            $user->is_client = true;
            $user->save();

            if ($lead->email !== $email) {
                $lead->update(['email' => $email]);
            }

            return Client::create([
                'user_id' => $user->id,
                'lead_id' => $lead->id,
                'nombre' => $lead->nombre,
                'empresa' => $lead->empresa,
            ]);
        });

        return response()->json($client->load('user:id,name,email'), 201);
    }

    public function index()
    {
        return response()->json(
            Client::query()->with('user:id,name,email')->latest()->get()
        );
    }
}
