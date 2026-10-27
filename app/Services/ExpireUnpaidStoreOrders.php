<?php

namespace App\Services;

use App\Models\StockMovement;
use App\Models\StoreOrder;
use App\Models\StoreProduct;
use Illuminate\Support\Facades\DB;

class ExpireUnpaidStoreOrders
{
    public function handle(): int
    {
        $expiredCount = 0;

        StoreOrder::query()
            ->whereIn('payment_status', ['pendiente', 'rechazado'])
            ->whereNotNull('payment_due_at')
            ->where('payment_due_at', '<=', now())
            ->select('id')
            ->orderBy('id')
            ->chunkById(100, function ($orders) use (&$expiredCount) {
                foreach ($orders as $candidate) {
                    if ($this->expireOrder($candidate->id)) {
                        $expiredCount++;
                    }
                }
            });

        return $expiredCount;
    }

    private function expireOrder(int $orderId): bool
    {
        return DB::transaction(function () use ($orderId) {
            $order = StoreOrder::query()->lockForUpdate()->findOrFail($orderId);
            if (
                ! in_array($order->payment_status, ['pendiente', 'rechazado'], true)
                || ! $order->payment_due_at
                || $order->payment_due_at->isFuture()
            ) {
                return false;
            }

            $items = $order->items()->get(['id', 'product_id', 'cantidad']);
            $productIds = $items->pluck('product_id')->filter()->unique()->sort()->values();
            $productsById = [];
            foreach ($productIds as $productId) {
                $productsById[$productId] = StoreProduct::query()
                    ->lockForUpdate()
                    ->find($productId);
            }

            foreach ($items as $item) {
                if (! $item->product_id || ! ($productsById[$item->product_id] ?? null)) {
                    continue;
                }

                $product = $productsById[$item->product_id];
                $product->stock += $item->cantidad;
                $product->save();
                StockMovement::create([
                    'product_id' => $product->id,
                    'order_id' => $order->id,
                    'tipo' => 'entrada',
                    'cantidad' => $item->cantidad,
                    'motivo' => "Pedido #{$order->id} vencido por falta de pago",
                ]);
            }

            $order->update([
                'estado' => 'cancelado',
                'payment_status' => 'expirado',
            ]);

            return true;
        });
    }
}
