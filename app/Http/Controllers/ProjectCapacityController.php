<?php

namespace App\Http\Controllers;

use App\Models\ProjectMonthlyCapacity;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProjectCapacityController extends Controller
{
    public function show(Request $request)
    {
        $datos = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);
        $month = CarbonImmutable::createFromFormat('!Y-m', $datos['month'])->startOfMonth();
        $capacity = ProjectMonthlyCapacity::firstOrCreate(
            ['month' => $month->toDateString()],
            ['capacity' => 10, 'reserved' => 0],
        );

        return response()->json($this->format($capacity));
    }

    public function update(Request $request)
    {
        $datos = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'capacity' => 'required|integer|min:0|max:1000',
        ]);
        $month = CarbonImmutable::createFromFormat('!Y-m', $datos['month'])->startOfMonth();
        $capacity = ProjectMonthlyCapacity::firstOrCreate(
            ['month' => $month->toDateString()],
            ['capacity' => 10, 'reserved' => 0],
        );

        if ($datos['capacity'] < $capacity->reserved) {
            throw ValidationException::withMessages([
                'capacity' => 'La capacidad no puede ser menor al número de proyectos ya reservados.',
            ]);
        }

        $capacity->update(['capacity' => $datos['capacity']]);

        return response()->json($this->format($capacity->refresh()));
    }

    private function format(ProjectMonthlyCapacity $capacity): array
    {
        return [
            'month' => $capacity->month->format('Y-m'),
            'capacity' => $capacity->capacity,
            'reserved' => $capacity->reserved,
            'available' => $capacity->available,
            'alerta_pocos_cupos' => $capacity->low,
        ];
    }
}
