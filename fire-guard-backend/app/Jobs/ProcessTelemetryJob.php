<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use App\DTOs\TelemetryDTO;
use App\Models\EnvironmentalData;
use App\Models\Sector;
use App\Models\WildfireEvent;
use App\Models\Alert;
use App\Models\AIAnalysisLog;
use App\Models\Sensor;
use App\Services\RiskEvaluationService;
use App\Services\SectorResolverService;
use App\Models\ProjectArea;

class ProcessTelemetryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Retry & Backoff (Fault Tolerance) */
    public int $tries = 5;
    public array $backoff = [10, 30, 60, 120];

    /** Payload */
    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function handle(): void
    {
        Log::info('RAW PAYLOAD', $this->payload);

        /** ===============================
         * 1️⃣ Build DTO
         * =============================== */
        $telemetry = TelemetryDTO::fromArray($this->payload);

        Log::info('TELEMETRY DTO', [
            'sensor_id' => $telemetry->sensorId,
            'lat' => $telemetry->lat,
            'lng' => $telemetry->lng,
        ]);

        /** ===============================
         * 3️⃣ Resolve Sector (SINGLE SOURCE OF TRUTH)
         * =============================== */
        /* 
        $sectorId = null;

        if ($telemetry->lat !== null && $telemetry->lng !== null) {
            $sectorId = app(SectorResolverService::class)
                ->resolveByPoint($telemetry->lat, $telemetry->lng);
        }

        if (! $sectorId) {
            Log::warning('Telemetry outside all sectors', [
                'sensor_id' => $telemetry->sensorId,
                'lat' => $telemetry->lat,
                'lng' => $telemetry->lng,
            ]);
            return;
        }
*/
        $sensor = Sensor::find($telemetry->sensorId);

        if (! $sensor || ! $sensor->sector_id) {
            Log::warning('Telemetry for sensor without sector', [
                'sensor_id' => $telemetry->sensorId
            ]);
            return;
        }

        $sectorId = $sensor->sector_id;

        // Determine point to validate (prefer telemetry coords, fallback to sensor coords)
        $lat = $telemetry->lat ?? $sensor->lat;
        $lng = $telemetry->lng ?? $sensor->lng;

        if ($lat === null || $lng === null) {
            Log::warning('Telemetry missing coordinates; ignoring', [
                'sensor_id' => $telemetry->sensorId,
            ]);
            return;
        }

        // Enforce active project area
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();
        if (! $activeArea) {
            Log::warning('No active project area configured; ignoring telemetry', [
                'sensor_id' => $telemetry->sensorId,
            ]);
            return;
        }

        $insideProject = ProjectArea::where('id', $activeArea->id)
            ->whereRaw(
                "ST_Contains(boundary, ST_SetSRID(ST_Point(?, ?), 4326))",
                [$lng, $lat]
            )
            ->exists();

        if (! $insideProject) {
            Log::warning('Telemetry outside project area; ignoring', [
                'sensor_id' => $telemetry->sensorId,
                'lat' => $lat,
                'lng' => $lng,
            ]);
            return;
        }

        // Must be inside sector boundary
        $insideSector = Sector::where('sector_id', $sectorId)
            ->whereNotNull('boundary')
            ->whereRaw(
                "ST_Contains(boundary, ST_SetSRID(ST_Point(?, ?), 4326))",
                [$lng, $lat]
            )
            ->exists();

        if (! $insideSector) {
            Log::warning('Telemetry outside sector boundary; ignoring', [
                'sensor_id' => $telemetry->sensorId,
                'sector_id' => $sectorId,
                'lat' => $lat,
                'lng' => $lng,
            ]);
            return;
        }

        /** ===============================
         * 2️⃣ Store Environmental Data (idempotent)
         * =============================== */
        EnvironmentalData::firstOrCreate(
            [
                'sensor_id'   => $telemetry->sensorId,
                'recorded_at' => $telemetry->timestamp,
            ],
            [
                'temperature' => $telemetry->temperature,
                'humidity'    => $telemetry->humidity,
                'smoke_level' => $telemetry->smoke,
                'aqi'         => $telemetry->aqi,
            ]
        );


        /** ===============================
         * 4️⃣ Risk Evaluation
         * =============================== */
        $riskService = new RiskEvaluationService();

        $riskResult = $riskService->evaluate([
            'temperature' => $telemetry->temperature,
            'humidity'    => $telemetry->humidity,
            'smoke_level' => $telemetry->smoke,
        ]);

        /** ===============================
         * 5️⃣ Atomic Operations (Transaction)
         * =============================== */
        DB::transaction(function () use (
            $telemetry,
            $sectorId,
            $riskResult
        ) {

            /** 🔍 AI Analysis Log */
            AIAnalysisLog::create([
                'sensor_id'      => $telemetry->sensorId,
                'sector_id'      => $sectorId,
                'algorithm_name' => 'rule_based_v1',
                'input_data'     => [
                    'temperature' => $telemetry->temperature,
                    'humidity'    => $telemetry->humidity,
                    'smoke_level' => $telemetry->smoke,
                ],
                'risk_score' => $riskResult['risk_score'],
                'decision'   => $riskResult['decision'],
                'created_at' => now(),
            ]);

            /** 🔥 FIRE EVENT */
            if ($riskResult['decision'] === 'fire') {

                $event = WildfireEvent::where('sector_id', $sectorId)
                    ->where('status', 'Active')
                    ->first();

                if (! $event) {
                    $event = WildfireEvent::create([
                        'sector_id'    => $sectorId,
                        'detected_at'  => now(),
                        'status'       => 'Active',
                        'spread_level' => 'Low',
                        'notes'        => 'Auto-detected by system',
                    ]);
                }
                Alert::create([
                    'event_id'     => $event->event_id,
                    'sector_id'    => $sectorId,
                    'sensor_id'    => $telemetry->sensorId,
                    'alert_source' => 'system',
                    'alert_level'  => 'Critical',
                    'alert_type'   => 'Fire Detected',
                    'meta' => [
                        'temperature' => $telemetry->temperature,
                        'humidity'    => $telemetry->humidity,
                        'smoke'       => $telemetry->smoke,
                        'thresholds'  => [
                            'temperature' => 90,
                            'humidity'    => 20,
                            'smoke'       => 5,
                        ],
                    ],
                    'created_at' => now(),
                ]);
            }

            /** ⚠️ WARNING ALERT (no event) */
            if ($riskResult['decision'] === 'warning') {
                Alert::create([
                    'event_id'     => null,
                    'sector_id'    => $sectorId,
                    'sensor_id'    => $telemetry->sensorId,
                    'alert_source' => 'system',
                    'alert_level'  => 'Medium',
                    'alert_type'   => 'Risk Warning',
                    'meta' => [
                        'temperature' => $telemetry->temperature,
                        'humidity'    => $telemetry->humidity,
                        'smoke'       => $telemetry->smoke,
                    ],
                    'created_at' => now(),
                ]);
            }

            /** 🗺️ Update Sector Status */
            $newStatus = match ($riskResult['decision']) {
                'fire'    => 'Fire',
                'warning' => 'Warning',
                default   => 'Safe',
            };

            Sector::where('sector_id', $sectorId)
                ->update(['status' => $newStatus]);
        });

        /** ===============================
         * 6️⃣ Final Logging
         * =============================== */
        Log::info('Risk evaluated', [
            'sensor_id'  => $telemetry->sensorId,
            'sector_id'  => $sectorId,
            'risk_score' => $riskResult['risk_score'],
            'decision'   => $riskResult['decision'],
        ]);
    }
}
