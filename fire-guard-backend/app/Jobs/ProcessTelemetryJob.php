<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\DTOs\TelemetryDTO;
/*use App\Models\Sensor;*/
use App\Models\Sector;
use App\Models\EnvironmentalData;
use App\Services\RiskEvaluationService;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\WildfireEvent;
use App\Models\Alert;



class ProcessTelemetryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $telemetry = TelemetryDTO::fromArray($this->payload);

        /*    // 1️⃣ تحميل الحساس
        $sensor = Sensor::find($telemetry->sensorId);

        if (! $sensor) {
            Log::warning('Telemetry received for unknown sensor', [
                'sensor_id' => $telemetry->sensorId
            ]);
            return;
        }*/

        // 2️⃣ تخزين البيانات البيئية
        EnvironmentalData::create([
            'sensor_id'    => $telemetry->sensorId,
            'temperature'  => $telemetry->temperature,
            'humidity'     => $telemetry->humidity,
            'smoke_level'  => $telemetry->smoke,
            'aqi'          => $telemetry->aqi,
            'recorded_at'  => $telemetry->timestamp,
        ]);

        // 3️⃣ تحليل المخاطر (Risk Evaluation)  ✅⬅️ هون الخطوة 2
        $riskService = new RiskEvaluationService();

        $riskResult = $riskService->evaluate([
            'temperature'  => $telemetry->temperature,
            'humidity'     => $telemetry->humidity,
            'smoke_level'  => $telemetry->smoke,
        ]);

        Log::info('AFTER RISK', $riskResult);

        try {
            if ($riskResult['decision'] === 'fire') {

                $event = WildfireEvent::where('sector_id', $telemetry->sectorId ?? null)
                    ->where('status', 'Active')
                    ->first();

                if (! $event) {
                    $event = WildfireEvent::create([
                        'sector_id'   => $telemetry->sectorId ?? null,
                        'detected_at' => now(),
                        'status'      => 'Active',
                        'spread_level' => 'Low',
                        'notes'       => 'Auto-detected by system',
                    ]);
                }

                Alert::create([
                    'event_id'     => $event->event_id,
                    'sector_id'    => $event->sector_id,
                    'sensor_id'    => $telemetry->sensorId,
                    'alert_source' => 'system',
                    'alert_level'  => 'High',
                    'created_at'   => now(),
                ]);
            }

            // ===============================
            // WARNING ALERT (بدون Event)
            // ===============================

            if ($riskResult['decision'] === 'warning') {

                Alert::create([
                    'event_id'     => null,
                    'sector_id'    => $telemetry->sectorId ?? null,
                    'sensor_id'    => $telemetry->sensorId,
                    'alert_source' => 'system',
                    'alert_level'  => 'Medium',
                    'created_at'   => now(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('EVENT/ALERT ERROR', [
                'message' => $e->getMessage()
            ]);
        }

        // ===============================
        // 4️⃣ تحديث حالة القطاع (Sector Status)
        // ===============================
        if ($telemetry->sectorId) {

            $newStatus = match ($riskResult['decision']) {
                'fire'    => 'Fire',
                'warning' => 'Warning',
                default   => 'Safe',
            };

            Sector::where('sector_id', $telemetry->sectorId)
                ->update(['status' => $newStatus]);
        }


        // ===============================
        // 5️⃣ Logging
        // ===============================
        Log::info('Risk evaluated', [
            'sensor_id'  => $telemetry->sensorId,
            'sector_id'  => $telemetry->sectorId,
            'risk_score' => $riskResult['risk_score'],
            'decision'   => $riskResult['decision'],
        ]);
    }
}
