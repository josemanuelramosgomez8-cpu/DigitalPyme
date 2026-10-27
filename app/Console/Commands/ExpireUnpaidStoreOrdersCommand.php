<?php

namespace App\Console\Commands;

use App\Services\ExpireUnpaidStoreOrders;
use Illuminate\Console\Command;

class ExpireUnpaidStoreOrdersCommand extends Command
{
    protected $signature = 'store:expire-unpaid-orders';

    protected $description = 'Cancel unpaid store orders after their payment deadline and release reserved stock';

    public function handle(ExpireUnpaidStoreOrders $expireUnpaidStoreOrders): int
    {
        $count = $expireUnpaidStoreOrders->handle();
        $this->info("{$count} pedidos vencidos; stock reservado liberado.");

        return self::SUCCESS;
    }
}
