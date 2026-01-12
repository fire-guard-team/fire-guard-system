<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Gateway;

class CheckGatewayHealth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-gateway-health';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark gateways offline if no telemetry received';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $affected = Gateway::where('last_seen', '<', now()->subMinutes(10))
            ->where('status', '!=', 'offline')
            ->update(['status' => 'offline']);

        $this->info("Gateways marked offline: {$affected}");
    }
}
