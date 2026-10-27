<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use App\Models\StockMovement;
use App\Models\StoreOrder;
use App\Models\StoreProduct;
use App\Models\StoreReturn;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class StoreLogisticsController extends Controller
{
    private const SHIPPING_KEYS = ['estandar', 'express', 'same_day'];

    public function publicProducts()
    {
        return response()->json(StoreProduct::query()
            ->where('activo', true)
            ->where('stock', '>', 0)
            ->orderBy('nombre')
            ->get(['id', 'sku', 'nombre', 'descripcion', 'categoria', 'precio', 'stock', 'image_path'])
            ->map(fn (StoreProduct $product) => [
                'id' => $product->id,
                'sku' => $product->sku,
                'nombre' => $product->nombre,
                'descripcion' => $product->descripcion,
                'categoria' => $product->categoria,
                'precio' => $product->precio,
                'stock' => $product->stock,
                'imagen_url' => $product->image_path ? url("/api/store/products/{$product->id}/image") : null,
            ]));
    }

    public function publicProductImage(StoreProduct $storeProduct)
    {
        abort_unless($storeProduct->image_path, 404);
        abort_unless(Storage::disk('local')->exists($storeProduct->image_path), 404, 'No se encontró la imagen.');

        return response()->file(Storage::disk('local')->path($storeProduct->image_path), [
            'Content-Type' => $storeProduct->image_mime_type,
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function shippingOptions()
    {
        $settings = SiteSetting::publicSettings()['coverage'];

        return response()->json([
            'methods' => $settings['shipping_methods'],
            'free_shipping_threshold' => $settings['free_shipping_threshold'],
        ]);
    }

    public function paymentOptions()
    {
        return response()->json($this->configuredPaymentOptions());
    }

    private function configuredPaymentOptions(): array
    {
        $bankTransfer = config('services.bank_transfer');
        $yapePlin = config('services.yape_plin');
        $bankEnabled = filled($bankTransfer['account']) || filled($bankTransfer['cci']);
        $yapeEnabled = (bool) $yapePlin['enabled'] && filled($yapePlin['phone']);

        return [
            'bank_transfer' => [
                'enabled' => $bankEnabled,
                'bank' => $bankEnabled ? $bankTransfer['bank'] : null,
                'holder' => $bankEnabled ? $bankTransfer['holder'] : null,
                'account' => $bankEnabled ? $bankTransfer['account'] : null,
                'cci' => $bankEnabled ? $bankTransfer['cci'] : null,
            ],
            'yape_plin' => [
                'enabled' => $yapeEnabled,
                'phone' => $yapeEnabled ? $yapePlin['phone'] : null,
                'holder' => $yapeEnabled ? $yapePlin['holder'] : null,
                'qr_url' => $yapeEnabled ? $yapePlin['qr_url'] : null,
            ],
        ];
    }

    public function checkout(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:store_products,id'],
            'items.*.cantidad' => ['required', 'integer', 'min:1', 'max:100'],
            'metodo_envio' => ['required', Rule::in(self::SHIPPING_KEYS)],
            'payment_method' => ['required', Rule::in(StoreOrder::PAYMENT_METHODS)],
            'ubicacion_entrega' => ['required', 'string', 'max:120'],
            'direccion_entrega' => ['required', 'string', 'max:255'],
            'tipo_operacion' => ['sometimes', Rule::in(['in-house', '3PL'])],
            'operador_logistico' => ['required_if:tipo_operacion,3PL', 'nullable', 'string', 'max:120'],
        ]);

        $coverage = SiteSetting::publicSettings()['coverage'];
        $shippingMethod = collect($coverage['shipping_methods'])->firstWhere('key', $data['metodo_envio']);
        if (!$shippingMethod || !$shippingMethod['enabled']) {
            throw ValidationException::withMessages(['metodo_envio' => 'La opción de envío seleccionada no está disponible.']);
        }
        $shippingZone = collect($coverage['shipping_zones'])->first(
            fn (array $zone) => Str::lower(trim($zone['location'])) === Str::lower(trim($data['ubicacion_entrega']))
        );
        $standardShippingMethod = collect($coverage['shipping_methods'])->firstWhere('key', 'estandar');
        if ($data['metodo_envio'] === 'same_day' && !Str::contains(Str::lower($data['ubicacion_entrega']), 'lima')) {
            throw ValidationException::withMessages(['metodo_envio' => 'El envío Same-day solo está disponible para Lima.']);
        }
        $paymentOptions = $this->configuredPaymentOptions();
        if (! $paymentOptions[$data['payment_method']]['enabled']) {
            throw ValidationException::withMessages([
                'payment_method' => 'El método de pago seleccionado todavía no está configurado.',
            ]);
        }

        $order = DB::transaction(function () use ($request, $data, $coverage, $shippingMethod, $shippingZone, $standardShippingMethod) {
            $lockedProducts = [];
            $subtotalCents = 0;
            $productIds = array_column($data['items'], 'product_id');
            sort($productIds, SORT_NUMERIC);
            $productsById = [];
            foreach ($productIds as $productId) {
                $productsById[$productId] = StoreProduct::query()
                    ->lockForUpdate()
                    ->findOrFail($productId);
            }

            foreach ($data['items'] as $item) {
                $product = $productsById[$item['product_id']];
                if (!$product->activo || $product->stock < $item['cantidad']) {
                    throw ValidationException::withMessages([
                        'items' => "Stock insuficiente para {$product->nombre}.",
                    ]);
                }
                $unitPriceCents = self::amountToCents($product->precio);
                $lockedProducts[] = [$product, $item['cantidad'], $unitPriceCents];
                $subtotalCents += $unitPriceCents * $item['cantidad'];
            }

            $zoneBaseCents = $shippingZone
                ? self::amountToCents($shippingZone['fee'])
                : self::amountToCents($standardShippingMethod['cost'] ?? $shippingMethod['cost']);
            $standardCostCents = self::amountToCents($standardShippingMethod['cost'] ?? $shippingMethod['cost']);
            $methodSurchargeCents = self::amountToCents($shippingMethod['cost']) - $standardCostCents;
            $shippingCostCents = $subtotalCents >= self::amountToCents($coverage['free_shipping_threshold'])
                ? 0
                : max(0, $zoneBaseCents + $methodSurchargeCents);
            $order = StoreOrder::create([
                'client_id' => $request->user()->client->id,
                'estado' => 'recibido',
                'payment_method' => $data['payment_method'],
                'payment_status' => 'pendiente',
                'payment_due_at' => now()->addHours(24),
                'tipo_operacion' => $data['tipo_operacion'] ?? 'in-house',
                'operador_logistico' => ($data['tipo_operacion'] ?? 'in-house') === '3PL' ? $data['operador_logistico'] : null,
                'metodo_envio' => $shippingMethod['key'],
                'ubicacion_entrega' => $data['ubicacion_entrega'],
                'direccion_entrega' => $data['direccion_entrega'],
                'subtotal' => self::centsToAmount($subtotalCents),
                'costo_envio' => self::centsToAmount($shippingCostCents),
                'total' => self::centsToAmount($subtotalCents + $shippingCostCents),
            ]);

            foreach ($lockedProducts as [$product, $quantity, $unitPriceCents]) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'sku' => $product->sku,
                    'nombre' => $product->nombre,
                    'cantidad' => $quantity,
                    'precio_unitario' => self::centsToAmount($unitPriceCents),
                    'subtotal' => self::centsToAmount($unitPriceCents * $quantity),
                ]);
                $product->stock -= $quantity;
                $product->save();
                StockMovement::create([
                    'product_id' => $product->id,
                    'order_id' => $order->id,
                    'tipo' => 'salida',
                    'cantidad' => $quantity,
                    'motivo' => "Venta del pedido #{$order->id}",
                ]);
            }

            return $order;
        });

        return response()->json($order->load([
            'items' => fn ($query) => $query->orderBy('id'),
        ]), 201);
    }

    private static function amountToCents(string|int|float $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', (string) $amount, 2), 2, '');

        return ((int) $whole * 100) + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }

    private static function centsToAmount(int $cents): string
    {
        return intdiv($cents, 100).'.'.str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
    }

    public function adminIndex(Request $request)
    {
        $data = $request->validate([
            'month' => ['sometimes', 'date_format:Y-m'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'products_page' => ['sometimes', 'integer', 'min:1'],
            'movements_page' => ['sometimes', 'integer', 'min:1'],
            'orders_page' => ['sometimes', 'integer', 'min:1'],
            'returns_page' => ['sometimes', 'integer', 'min:1'],
        ]);
        $month = Carbon::createFromFormat('!Y-m', $data['month'] ?? now()->format('Y-m'));
        $periodMovements = StockMovement::query()
            ->whereBetween('created_at', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()]);
        $unitsSold = (clone $periodMovements)
            ->where('tipo', 'salida')
            ->whereNotNull('order_id')
            ->whereHas('order', fn ($query) => $query->where('payment_status', 'pagado'))
            ->sum('cantidad');
        $unitsOut = (clone $periodMovements)->where('tipo', 'salida')->sum('cantidad');
        $unitsReceived = (clone $periodMovements)->where('tipo', 'entrada')->sum('cantidad');
        $currentStock = StoreProduct::sum('stock');
        $openingStock = max(0, $currentStock - $unitsReceived + $unitsOut);
        $averageStock = ($openingStock + $currentStock) / 2;
        $perPage = $data['per_page'] ?? 50;

        $products = StoreProduct::query()
            ->orderBy('nombre')
            ->orderBy('id')
            ->paginate($perPage, ['*'], 'products_page');
        $movements = StockMovement::with('product:id,sku,nombre')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'movements_page');
        $orders = StoreOrder::with(['client:id,nombre,empresa', 'items', 'returnRequest'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'orders_page');
        $returns = StoreReturn::with(['order:id,client_id,estado,total', 'order.client:id,nombre,empresa', 'order.items'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'returns_page');

        return response()->json([
            'products' => $products->items(),
            'movements' => $movements->items(),
            'orders' => $orders->items(),
            'returns' => $returns->items(),
            'pagination' => [
                'products' => $this->paginationMetadata($products),
                'movements' => $this->paginationMetadata($movements),
                'orders' => $this->paginationMetadata($orders),
                'returns' => $this->paginationMetadata($returns),
            ],
            'metrics' => [
                'low_stock' => StoreProduct::where('stock', '>', 0)->whereColumn('stock', '<=', 'punto_reorden')->count(),
                'out_of_stock' => StoreProduct::where('stock', 0)->count(),
                'units_sold' => (int) $unitsSold,
                'inventory_rotation' => $averageStock > 0 ? round($unitsSold / $averageStock, 2) : 0,
            ],
            'shipping' => SiteSetting::publicSettings()['coverage'],
        ]);
    }

    private function paginationMetadata(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
        ];
    }

    public function storeProduct(Request $request)
    {
        $data = $request->validate([
            'sku' => ['required', 'string', 'max:80', 'unique:store_products,sku'],
            'nombre' => ['required', 'string', 'max:180'],
            'descripcion' => ['nullable', 'string', 'max:3000'],
            'categoria' => ['nullable', 'string', 'max:120'],
            'precio' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999'],
            'stock' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'punto_reorden' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'ubicacion_almacen' => ['nullable', 'string', 'max:120'],
            'activo' => ['sometimes', 'boolean'],
        ]);

        $initialStock = (int) ($data['stock'] ?? 0);
        $product = DB::transaction(function () use ($request, $data, $initialStock) {
            $product = StoreProduct::create($data);
            if ($initialStock > 0) {
                $product->movements()->create([
                    'created_by' => $request->user()->id,
                    'tipo' => 'entrada',
                    'cantidad' => $initialStock,
                    'motivo' => 'Stock inicial del producto',
                ]);
            }

            return $product;
        });

        return response()->json($product, 201);
    }

    public function updateProduct(Request $request, StoreProduct $storeProduct)
    {
        $data = $request->validate([
            'sku' => ['sometimes', 'required', 'string', 'max:80', Rule::unique('store_products', 'sku')->ignore($storeProduct->id)],
            'nombre' => ['sometimes', 'required', 'string', 'max:180'],
            'descripcion' => ['nullable', 'string', 'max:3000'],
            'categoria' => ['nullable', 'string', 'max:120'],
            'precio' => ['sometimes', 'required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999'],
            'punto_reorden' => ['sometimes', 'required', 'integer', 'min:0', 'max:1000000'],
            'ubicacion_almacen' => ['nullable', 'string', 'max:120'],
            'activo' => ['sometimes', 'boolean'],
        ]);
        $storeProduct->update($data);

        return response()->json($storeProduct->refresh());
    }

    public function uploadProductImage(Request $request, StoreProduct $storeProduct)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
        $image = $request->file('image');
        $extension = $image->extension();
        $path = $image->storeAs(
            "store-products/{$storeProduct->id}",
            Str::uuid().'.'.$extension,
            'local',
        );
        if (! is_string($path) || $path === '') {
            abort(500, 'No se pudo guardar la imagen del producto.');
        }

        try {
            $previousPath = DB::transaction(function () use ($storeProduct, $image, $path) {
                $product = StoreProduct::query()->lockForUpdate()->findOrFail($storeProduct->id);
                $previousPath = $product->image_path;
                $product->update([
                    'image_path' => $path,
                    'image_mime_type' => $image->getMimeType() ?: 'application/octet-stream',
                ]);

                return $previousPath;
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        if ($previousPath && ! Storage::disk('local')->delete($previousPath)) {
            Log::warning('No se pudo eliminar la imagen anterior del producto.', [
                'product_id' => $storeProduct->id,
                'path' => $previousPath,
            ]);
        }

        return response()->json([
            'mensaje' => 'Imagen del producto actualizada.',
            'imagen_url' => url("/api/store/products/{$storeProduct->id}/image"),
        ]);
    }

    public function deleteProductImage(StoreProduct $storeProduct)
    {
        if (! $storeProduct->image_path) {
            return response()->json(['mensaje' => 'El producto no tenía imagen.']);
        }

        $path = $storeProduct->image_path;
        DB::transaction(function () use ($storeProduct) {
            $product = StoreProduct::query()->lockForUpdate()->findOrFail($storeProduct->id);
            $product->update(['image_path' => null, 'image_mime_type' => null]);
        });

        if (! Storage::disk('local')->delete($path)) {
            Log::warning('No se pudo eliminar el archivo de imagen del producto.', [
                'product_id' => $storeProduct->id,
                'path' => $path,
            ]);
        }

        return response()->json(['mensaje' => 'Imagen del producto eliminada.']);
    }

    public function deleteProduct(StoreProduct $storeProduct)
    {
        $storeProduct->update(['activo' => false]);

        return response()->json(['mensaje' => 'Producto desactivado; se conservó el historial de inventario.']);
    }

    public function addStockMovement(Request $request, StoreProduct $storeProduct)
    {
        $data = $request->validate([
            'tipo' => ['required', Rule::in(['entrada', 'salida'])],
            'cantidad' => ['required', 'integer', 'min:1', 'max:1000000'],
            'motivo' => ['required', 'string', 'max:255'],
        ]);

        $product = DB::transaction(function () use ($request, $storeProduct, $data) {
            $product = StoreProduct::query()->lockForUpdate()->findOrFail($storeProduct->id);
            if ($data['tipo'] === 'salida' && $product->stock < $data['cantidad']) {
                throw ValidationException::withMessages(['cantidad' => 'La salida supera el stock disponible.']);
            }
            $product->movements()->create([
                'created_by' => $request->user()->id,
                ...$data,
            ]);
            $product->stock += $data['tipo'] === 'entrada' ? $data['cantidad'] : -$data['cantidad'];
            $product->save();

            return $product->refresh();
        });

        return response()->json($product);
    }

    public function updateOrder(Request $request, StoreOrder $storeOrder)
    {
        $data = $request->validate([
            'estado' => ['sometimes', 'required', Rule::in(StoreOrder::ESTADOS)],
            'tipo_operacion' => ['sometimes', 'required', Rule::in(['in-house', '3PL'])],
            'operador_logistico' => ['nullable', 'string', 'max:120'],
            'codigo_rastreo' => ['nullable', 'string', 'max:120'],
        ]);

        $order = DB::transaction(function () use ($storeOrder, $data) {
            $order = StoreOrder::query()->lockForUpdate()->findOrFail($storeOrder->id);
            if (isset($data['estado']) && $data['estado'] !== $order->estado) {
                if ($order->payment_status !== 'pagado') {
                    throw ValidationException::withMessages(['estado' => 'Confirma el pago antes de preparar o enviar el pedido.']);
                }
                $currentIndex = array_search($order->estado, StoreOrder::ESTADOS, true);
                $nextState = $currentIndex === false ? null : (StoreOrder::ESTADOS[$currentIndex + 1] ?? null);
                if ($data['estado'] !== $nextState) {
                    throw ValidationException::withMessages(['estado' => 'El pedido debe avanzar un estado a la vez.']);
                }
            }
            $operation = $data['tipo_operacion'] ?? $order->tipo_operacion;
            if ($operation === '3PL' && blank($data['operador_logistico'] ?? $order->operador_logistico)) {
                throw ValidationException::withMessages(['operador_logistico' => 'Indica el operador logístico cuando el pedido es 3PL.']);
            }
            if (($data['estado'] ?? null) === 'enviado' && blank($data['codigo_rastreo'] ?? $order->codigo_rastreo)) {
                throw ValidationException::withMessages(['codigo_rastreo' => 'Registra el código de rastreo antes de marcar el pedido como enviado.']);
            }

            if (($data['estado'] ?? null) === 'enviado') $data['enviado_at'] = now();
            if (($data['estado'] ?? null) === 'entregado') $data['entregado_at'] = now();
            if ($operation !== '3PL') $data['operador_logistico'] = null;
            $order->update($data);

            return $order;
        });

        return response()->json($order->load(['client:id,nombre,empresa', 'items', 'returnRequest']));
    }

    public function uploadClientReceipt(Request $request, StoreOrder $storeOrder)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ]);
        $file = $request->file('file');
        $path = $file->store("store-orders/{$storeOrder->id}/receipts", 'local');
        if (! is_string($path) || $path === '') {
            abort(500, 'No se pudo guardar el comprobante.');
        }

        try {
            $previousPath = DB::transaction(function () use ($request, $storeOrder, $file, $path) {
                $order = StoreOrder::query()->lockForUpdate()->findOrFail($storeOrder->id);
                abort_unless($order->client_id === $request->user()->client->id, 404);
                if (! in_array($order->payment_status, ['pendiente', 'rechazado'], true)) {
                    throw ValidationException::withMessages([
                        'file' => 'Este pedido no admite otro comprobante.',
                    ]);
                }

                $previousPath = $order->receipt_path;
                $order->update([
                    'receipt_path' => $path,
                    'receipt_original_name' => Str::limit(basename($file->getClientOriginalName()), 180, ''),
                    'receipt_mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                    'receipt_size' => $file->getSize(),
                    'receipt_uploaded_at' => now(),
                    'payment_status' => 'comprobante_enviado',
                ]);

                return $previousPath;
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        if ($previousPath && ! Storage::disk('local')->delete($previousPath)) {
            Log::warning('No se pudo eliminar el comprobante reemplazado del pedido.', [
                'order_id' => $storeOrder->id,
                'path' => $previousPath,
            ]);
        }

        return response()->json([
            'mensaje' => 'Comprobante enviado. El pago quedará pendiente hasta que lo verifiquemos.',
            'payment_status' => 'comprobante_enviado',
            'receipt_original_name' => $storeOrder->refresh()->receipt_original_name,
        ], 201);
    }

    public function updatePaymentStatus(Request $request, StoreOrder $storeOrder)
    {
        $data = $request->validate([
            'payment_status' => ['required', Rule::in(['pagado', 'rechazado'])],
        ]);

        $order = DB::transaction(function () use ($storeOrder, $data) {
            $order = StoreOrder::query()->lockForUpdate()->findOrFail($storeOrder->id);
            if ($order->payment_status !== 'comprobante_enviado') {
                throw ValidationException::withMessages([
                    'payment_status' => 'Solo puedes revisar pedidos con comprobante enviado.',
                ]);
            }

            $order->update([
                'payment_status' => $data['payment_status'],
                'paid_at' => $data['payment_status'] === 'pagado' ? now() : null,
                'payment_due_at' => $data['payment_status'] === 'pagado' ? null : now()->addHours(24),
            ]);

            return $order;
        });

        return response()->json($order->load(['client:id,nombre,empresa', 'items', 'returnRequest']));
    }

    public function clientReceipt(Request $request, StoreOrder $storeOrder)
    {
        abort_unless($storeOrder->client_id === $request->user()->client->id, 404);

        return $this->downloadReceipt($storeOrder);
    }

    public function adminReceipt(StoreOrder $storeOrder)
    {
        return $this->downloadReceipt($storeOrder);
    }

    private function downloadReceipt(StoreOrder $order)
    {
        abort_unless($order->receipt_path && Storage::disk('local')->exists($order->receipt_path), 404, 'No se encontró el comprobante.');

        return Storage::disk('local')->download($order->receipt_path, $order->receipt_original_name, [
            'Content-Type' => $order->receipt_mime_type,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function updateReturn(Request $request, StoreReturn $storeReturn)
    {
        $data = $request->validate([
            'estado' => ['required', Rule::in(StoreReturn::ESTADOS)],
            'resolucion' => ['nullable', Rule::in(StoreReturn::RESOLUCIONES)],
            'notas_inspeccion' => ['nullable', 'string', 'max:3000'],
        ]);

        $return = DB::transaction(function () use ($request, $storeReturn, $data) {
            $return = StoreReturn::query()->lockForUpdate()->findOrFail($storeReturn->id);
            $currentIndex = array_search($return->estado, StoreReturn::ESTADOS, true);
            $nextState = $currentIndex === false ? null : (StoreReturn::ESTADOS[$currentIndex + 1] ?? null);
            if ($data['estado'] !== $nextState) {
                throw ValidationException::withMessages(['estado' => 'La devolución debe avanzar un estado a la vez.']);
            }
            if ($data['estado'] === 'resuelta' && empty($data['resolucion'])) {
                throw ValidationException::withMessages(['resolucion' => 'Selecciona la resolución de la devolución.']);
            }

            $return->update([
                ...$data,
                'inspeccionada_at' => $data['estado'] === 'inspeccionada' ? now() : $return->inspeccionada_at,
                'resuelta_at' => $data['estado'] === 'resuelta' ? now() : null,
            ]);
            if ($data['estado'] === 'resuelta' && $data['resolucion'] === 'reventa') {
                $order = $return->order()->with('items')->firstOrFail();
                $productIds = $order->items->pluck('product_id')->filter()->unique()->sort()->values();
                $productsById = [];
                foreach ($productIds as $productId) {
                    $product = StoreProduct::query()
                        ->lockForUpdate()
                        ->find($productId);
                    if ($product) {
                        $productsById[$productId] = $product;
                    }
                }

                foreach ($order->items as $item) {
                    if (!$item->product_id || !isset($productsById[$item->product_id])) {
                        continue;
                    }
                    $product = $productsById[$item->product_id];
                    $product->stock += $item->cantidad;
                    $product->save();
                    $product->movements()->create([
                        'created_by' => $request->user()->id,
                        'tipo' => 'entrada',
                        'cantidad' => $item->cantidad,
                        'motivo' => "Devolución #{$return->id} apta para reventa",
                    ]);
                }
            }

            return $return;
        });

        return response()->json($return->load(['order:id,client_id,estado,total', 'order.items']));
    }

    public function clientOrders(Request $request)
    {
        return response()->json($request->user()->client->storeOrders()
            ->with(['items', 'returnRequest'])
            ->latest()
            ->get());
    }

    public function clientReturn(Request $request, StoreOrder $storeOrder)
    {
        $data = $request->validate(['motivo' => ['required', 'string', 'min:10', 'max:2000']]);
        $return = DB::transaction(function () use ($request, $storeOrder, $data) {
            $order = StoreOrder::query()->lockForUpdate()->findOrFail($storeOrder->id);
            abort_unless($order->client_id === $request->user()->client->id, 404);
            if ($order->estado !== 'entregado') {
                throw ValidationException::withMessages(['pedido' => 'Solo puedes solicitar la devolución de un pedido entregado.']);
            }
            if ($order->returnRequest()->exists()) {
                abort(409, 'Este pedido ya tiene una solicitud de devolución.');
            }

            return $order->returnRequest()->create($data);
        });

        return response()->json($return, 201);
    }
}
