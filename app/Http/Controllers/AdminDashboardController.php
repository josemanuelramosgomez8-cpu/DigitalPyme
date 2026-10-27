<?php

namespace App\Http\Controllers;

use App\Models\AgendaReservation;
use App\Models\Cotizacion;
use App\Models\Lead;
use App\Models\Project;
use App\Models\ProjectMonthlyCapacity;
use App\Models\ProjectPayment;
use App\Models\StockMovement;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminDashboardController extends Controller
{
    public function show(Request $request)
    {
        $data = $request->validate([
            'month' => ['sometimes', 'date_format:Y-m'],
        ]);
        $month = Carbon::createFromFormat('!Y-m', $data['month'] ?? now()->format('Y-m'));
        $capacity = ProjectMonthlyCapacity::whereDate('month', $month->startOfMonth()->toDateString())->first();
        $monthStart = $month->copy()->startOfMonth();
        $monthEnd = $month->copy()->endOfMonth();
        $unitsSold = StockMovement::where('tipo', 'salida')
            ->whereNotNull('order_id')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->sum('cantidad');
        $unitsReceived = StockMovement::where('tipo', 'entrada')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->sum('cantidad');
        $unitsOut = StockMovement::where('tipo', 'salida')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->sum('cantidad');
        $currentStock = StoreProduct::sum('stock');
        $averageStock = (max(0, $currentStock - $unitsReceived + $unitsOut) + $currentStock) / 2;

        return response()->json([
            'leads_total' => Lead::count(),
            'leads_nuevos' => Lead::where('estado', 'nuevo')->count(),
            'cotizaciones_total' => Cotizacion::count(),
            'cotizaciones_pendientes' => Cotizacion::whereIn('estado', ['borrador', 'enviada'])->count(),
            'proyectos_total' => Project::count(),
            'proyectos_en_progreso' => Project::whereIn('estado', ['planificacion', 'en_progreso', 'revision'])->count(),
            'proyectos_por_estado' => Project::query()
                ->selectRaw('estado, count(*) as total')
                ->groupBy('estado')
                ->pluck('total', 'estado'),
            'pagos_por_verificar' => ProjectPayment::where('status', 'comprobante_enviado')->count(),
            'ingresos_confirmados' => ProjectPayment::where('status', 'pagado')->sum('amount'),
            'reservas_del_mes' => AgendaReservation::where('estado', 'reservada')
                ->whereHas('slot', fn ($query) => $query->whereBetween('date', [
                    $month->copy()->startOfMonth()->toDateString(),
                    $month->copy()->endOfMonth()->toDateString(),
                ]))
                ->count(),
            'cupos_proyecto' => $capacity ? [
                'capacidad' => $capacity->capacity,
                'reservados' => $capacity->reserved,
                'disponibles' => $capacity->available,
                'alerta_pocos_cupos' => $capacity->low,
            ] : null,
            'inventario' => [
                'productos_bajo_reorden' => StoreProduct::where('stock', '>', 0)->whereColumn('stock', '<=', 'punto_reorden')->count(),
                'productos_agotados' => StoreProduct::where('stock', 0)->count(),
                'unidades_vendidas' => (int) $unitsSold,
                'rotacion' => $averageStock > 0 ? round($unitsSold / $averageStock, 2) : 0,
            ],
        ]);
    }
}
