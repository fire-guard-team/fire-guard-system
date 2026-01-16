<?php

namespace App\Services;

use App\Models\Sector;
use App\Models\Sensor;
use App\Models\EnvironmentalData;

class RiskEvaluationService
{
    /**
     * تقييم المخاطر بناءً على بيانات البيئة
     */
    public function evaluateRisk(array $telemetry): array
    {
        $temperature = $telemetry['temperature'] ?? null;
        $humidity = $telemetry['humidity'] ?? null;
        $smokeLevel = $telemetry['smoke_level'] ?? null;

        $riskScore = 0;
        $decision = 'safe';
        $confidence = 0.0;

        // Temperature Risk (0-40 points)
        if ($temperature !== null) {
            if ($temperature > 90) {
                $riskScore += 40;
            } elseif ($temperature > 70) {
                $riskScore += 25;
            } elseif ($temperature > 50) {
                $riskScore += 10;
            }
        }

        // Humidity Risk (inverse relationship with fire risk) (0-20 points)
        if ($humidity !== null) {
            if ($humidity < 10) {
                $riskScore += 20;
            } elseif ($humidity < 20) {
                $riskScore += 15;
            } elseif ($humidity < 30) {
                $riskScore += 5;
            }
        }

        // Smoke Level Risk (0-40 points)
        if ($smokeLevel !== null) {
            if ($smokeLevel > 5.0) {
                $riskScore += 40;
                $decision = 'fire';
            } elseif ($smokeLevel > 2.0) {
                $riskScore += 25;
                $decision = 'warning';
            } elseif ($smokeLevel > 0.6) {
                $riskScore += 10;
                $decision = 'warning';
            }
        }

        // Combined Risk Logic
        if ($riskScore >= 70) {
            $decision = 'fire';
            $confidence = 0.9;
        } elseif ($riskScore >= 40) {
            $decision = 'warning';
            $confidence = 0.7;
        } elseif ($riskScore >= 20) {
            $decision = 'caution';
            $confidence = 0.5;
        } else {
            $decision = 'safe';
            $confidence = 0.8;
        }

        // Special cases
        if ($temperature !== null && $humidity !== null && $smokeLevel !== null) {
            // High temperature + Low humidity + Any smoke = High fire risk
            if ($temperature > 80 && $humidity < 20 && $smokeLevel > 0.3) {
                $decision = 'fire';
                $confidence = 0.95;
                $riskScore = max($riskScore, 85);
            }
        }

        return [
            'risk_score' => min($riskScore, 100),
            'decision' => $decision,
            'confidence' => $confidence,
            'factors' => [
                'temperature' => $temperature,
                'humidity' => $humidity,
                'smoke_level' => $smokeLevel
            ]
        ];
    }

    /**
     * تحديث حالة القطاع بناءً على تقييم المخاطر
     */
    public function updateSectorStatus(int $sectorId, string $decision): void
    {
        $status = match ($decision) {
            'fire' => 'Fire',
            'warning', 'caution' => 'Warning',
            default => 'Safe'
        };

        Sector::where('sector_id', $sectorId)->update([
            'status' => $status,
            'updated_at' => now()
        ]);
    }

    /**
     * الحصول على آخر قراءات sensor معين
     */
    public function getLatestSensorData(int $sensorId): ?array
    {
        $data = EnvironmentalData::where('sensor_id', $sensorId)
            ->orderBy('recorded_at', 'desc')
            ->first();

        return $data ? $data->toArray() : null;
    }

    /**
     * الحصول على متوسط القراءات لقطاع معين في آخر ساعة
     */
    public function getSectorAverageData(int $sectorId, int $hours = 1): array
    {
        $startTime = now()->subHours($hours);

        $averages = EnvironmentalData::join('sensors', 'environmental_data.sensor_id', '=', 'sensors.sensor_id')
            ->where('sensors.sector_id', $sectorId)
            ->where('environmental_data.recorded_at', '>=', $startTime)
            ->selectRaw('
                AVG(temperature) as avg_temperature,
                AVG(humidity) as avg_humidity,
                AVG(smoke_level) as avg_smoke_level,
                COUNT(*) as reading_count
            ')
            ->first();

        return $averages ? $averages->toArray() : [
            'avg_temperature' => null,
            'avg_humidity' => null,
            'avg_smoke_level' => null,
            'reading_count' => 0
        ];
    }
}