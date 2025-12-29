<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

use App\Models\Sensor;
use App\Models\EnvironmentalData;
use App\Models\AIAnalysisLog;
use App\Models\WildfireEvent;
use App\Models\Alert;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessTelemetryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Number of times the job may be attempted. */
    public int $tries = 3;

    /** @var array */
    public $payload;

    /**
     * Create a new job instance.
     *
     * @param array $payload
     */
    public function __construct(array $payload)
    {
        $this->payload = $payload;
        // don't assign $this->tries here — it's declared above
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        DB::beginTransaction();
        try {
            $p = $this->payload;

            // 1) Update sensor last heartbeat & battery if provided
            $sensor = Sensor::find($p['sensor_id']);
            if (! $sensor) {
                DB::rollBack();
                return;
            }

            if (isset($p['battery'])) {
                $sensor->battery_level = $p['battery'];
            }
            $sensor->last_heartbeat = isset($p['timestamp']) ? Carbon::parse($p['timestamp']) : now();
            if (isset($p['lat']) && isset($p['lng'])) {
                $sensor->latitude = (float)$p['lat'];
                $sensor->longitude = (float)$p['lng'];
                // update geom via raw SQL (PostGIS)
                DB::statement("UPDATE sensors SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE sensor_id = ?", [
                    $sensor->longitude,
                    $sensor->latitude,
                    $sensor->sensor_id
                ]);
            }
            $sensor->save();

            // 2) Save environmental_data
            $env = EnvironmentalData::create([
                'sensor_id' => $sensor->sensor_id,
                'temperature' => $p['temperature'] ?? null,
                'humidity' => $p['humidity'] ?? null,
                'smoke_level' => $p['smoke_level'] ?? null,
                'aqi' => $p['aqi'] ?? null,
                'recorded_at' => $p['timestamp'] ?? now(),
                'fire_risk_score' => null, // computed below
            ]);

            // set geom for env data (if lat/lng provided) via raw SQL
            if (isset($p['lat']) && isset($p['lng'])) {
                DB::statement("UPDATE environmental_data SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE data_id = ?", [
                    (float)$p['lng'],
                    (float)$p['lat'],
                    $env->data_id
                ]);
            } else {
                // fallback: try to get sensor geom
                DB::statement("UPDATE environmental_data SET geom = sensors.geom FROM sensors WHERE environmental_data.sensor_id = sensors.sensor_id AND environmental_data.data_id = ?", [$env->data_id]);
            }

            // 3) Compute a simple heuristic risk score (replace with AI call later)
            $risk = $this->computeRiskScore($env->temperature, $env->humidity, $env->smoke_level);

            $env->fire_risk_score = $risk;
            $env->save();

            // 4) Log AI analysis (simple)
            $ai = AIAnalysisLog::create([
                'sensor_id' => $sensor->sensor_id,
                'sector_id' => $sensor->sector_id,
                'algorithm_name' => 'heuristic_v1',
                'input_data' => json_encode([
                    'temp' => $env->temperature,
                    'hum' => $env->humidity,
                    'smoke' => $env->smoke_level
                ]),
                'risk_result' => $risk,
                'decision' => $this->riskToDecision($risk),
                'created_at' => now(),
            ]);

            // 5) If risk passes threshold -> create event & alert
            $threshold = 60; // example threshold (0-100)
            if ($risk >= $threshold) {
                // create or update wildfire_event for the sector
                $event = WildfireEvent::create([
                    'sector_id' => $sensor->sector_id,
                    'detected_at' => now(),
                    'created_by' => null,
                    'status' => 'Active',
                    'spread_level' => 'Low',
                    'notes' => 'Auto-detected by heuristic_v1',
                    'created_at' => now()
                ]);

                // create alert
                Alert::create([
                    'event_id' => $event->event_id,
                    'sector_id' => $sensor->sector_id,
                    'sensor_id' => $sensor->sensor_id,
                    'alert_source' => 'sensor',
                    'alert_level' => 'High',
                    'created_at' => now(),
                ]);

                // TODO: broadcast event to dashboard channels (Event + Broadcasting)
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            // log and rethrow so job can be retried according to $tries/backoff
            Log::error('ProcessTelemetryJob failed: ' . $e->getMessage(), [
                'payload' => $this->payload,
                'exception' => (string) $e
            ]);
            throw $e;
        }
    }

    /**
     * Simple heuristic risk score
     */
    protected function computeRiskScore($temp, $hum, $smoke)
    {
        // Normalize inputs — handle nulls
        $t = is_null($temp) ? 0 : max(0, min(100, $temp));
        $h = is_null($hum) ? 50 : max(0, min(100, $hum));
        $s = is_null($smoke) ? 0 : max(0, min(100, $smoke * 10)); // scale smoke

        // Example weighted formula:
        // temp weight 0.5, smoke weight 0.4, humidity negative weight 0.1
        $score = ($t * 0.5) + ($s * 0.4) + ((100 - $h) * 0.1);

        // clamp 0-100
        return round(max(0, min(100, $score)), 2);
    }

    protected function riskToDecision($risk)
    {
        if ($risk >= 80) return 'fire';
        if ($risk >= 60) return 'suspicious';
        return 'no_fire';
    }
}
