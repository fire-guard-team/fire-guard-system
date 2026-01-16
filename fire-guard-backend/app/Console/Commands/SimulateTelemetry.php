<?php

namespace App\Console\Commands;

use App\Services\MockDataGenerator;
use Illuminate\Console\Command;

class SimulateTelemetry extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'telemetry:simulate
                            {gateway_id=1 : The gateway ID to simulate}
                            {--interval=60 : Interval between telemetry sends in seconds}
                            {--once : Send telemetry only once instead of continuously}';

    /**
     * The console command description.
     */
    protected $description = 'Simulate telemetry data from sensors to test the system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $gatewayId = (int) $this->argument('gateway_id');
        $interval = (int) $this->option('interval');
        $once = $this->option('once');

        $generator = new MockDataGenerator();

        if ($once) {
            $this->info('Generating one telemetry batch...');

            try {
                $telemetry = $generator->generateMockTelemetry($gatewayId);
                $result = $generator->sendToApi($telemetry);

                if ($result['success']) {
                    $this->info('✅ Telemetry sent successfully');
                    $this->info('Processed ' . (count($telemetry['sensors'] ?? [])) . ' sensors');
                } else {
                    $this->error('❌ Failed to send telemetry');
                    $this->error('Status: ' . $result['status']);
                    $this->error('Error: ' . ($result['error'] ?? 'Unknown error'));
                }
            } catch (\Exception $e) {
                $this->error('💥 Error: ' . $e->getMessage());
            }

            return;
        }

        // تشغيل مستمر
        $this->info("Starting continuous telemetry simulation...");
        $this->info("Gateway ID: {$gatewayId}");
        $this->info("Interval: {$interval} seconds");
        $this->info("Press Ctrl+C to stop");
        $this->newLine();

        try {
            $generator->startContinuousSimulation($gatewayId, $interval);
        } catch (\Exception $e) {
            $this->error('💥 Error: ' . $e->getMessage());
        }
    }
}