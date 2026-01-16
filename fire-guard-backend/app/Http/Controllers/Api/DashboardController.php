<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Sector;
use App\Models\Sensor;
use App\Models\EnvironmentalData;
use App\Models\WildfireEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * 📊 GET /dashboard/stats
     * إحصائيات Dashboard الرئيسية
     */
    public function stats(): JsonResponse
    {
        $activeProjectArea = DB::table('project_areas')
            ->where('is_active', true)
            ->first();

        if (!$activeProjectArea) {
            return response()->json([
                'active_sectors' => 0,
                'total_alerts' => 0,
                'fire_risk_index' => 0.0,
                'system_status' => 'No active project area'
            ]);
        }

        // إحصائيات القطاعات
        $sectorStats = DB::table('sectors')
            ->whereRaw("ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))", [$activeProjectArea->id])
            ->selectRaw("
                COUNT(*) as total_sectors,
                SUM(CASE WHEN status = 'Fire' THEN 1 ELSE 0 END) as fire_sectors,
                SUM(CASE WHEN status = 'Warning' THEN 1 ELSE 0 END) as warning_sectors,
                SUM(CASE WHEN status = 'Safe' THEN 1 ELSE 0 END) as safe_sectors
            ")
            ->first();

        // إحصائيات التنبيهات
        $alertStats = DB::table('alerts')
            ->selectRaw("
                COUNT(*) as total_alerts,
                SUM(CASE WHEN acknowledged_at IS NULL THEN 1 ELSE 0 END) as active_alerts,
                SUM(CASE WHEN alert_level = 'Critical' THEN 1 ELSE 0 END) as critical_alerts
            ")
            ->first();

        // حساب Fire Risk Index
        $fireRiskIndex = $this->calculateFireRiskIndex($activeProjectArea->id);

        // تحديد حالة النظام
        $systemStatus = $this->getSystemStatus($sectorStats, $alertStats);

        return response()->json([
            'active_sectors' => $sectorStats->total_sectors ?? 0,
            'total_alerts' => $alertStats->total_alerts ?? 0,
            'fire_risk_index' => round($fireRiskIndex, 1),
            'system_status' => $systemStatus,
            'sector_breakdown' => [
                'fire' => $sectorStats->fire_sectors ?? 0,
                'warning' => $sectorStats->warning_sectors ?? 0,
                'safe' => $sectorStats->safe_sectors ?? 0
            ],
            'alert_breakdown' => [
                'active' => $alertStats->active_alerts ?? 0,
                'critical' => $alertStats->critical_alerts ?? 0
            ]
        ]);
    }

    /**
     * 📊 GET /dashboard/live-sensor-data
     * بيانات الحساسات الحية للـ Dashboard
     */
    public function liveSensorData(): JsonResponse
    {
        $activeProjectArea = DB::table('project_areas')
            ->where('is_active', true)
            ->first();

        if (!$activeProjectArea) {
            return response()->json(['data' => []]);
        }

        // جلب آخر قراءات لكل نوع حساس
        $sensorTypes = ['Temperature', 'Humidity', 'Smoke', 'Multi-sensor'];

        $liveData = [];

        foreach ($sensorTypes as $type) {
            $latestReading = DB::table('environmental_data as ed')
                ->join('sensors as s', 'ed.sensor_id', '=', 's.sensor_id')
                ->join('sectors as sec', 's.sector_id', '=', 'sec.sector_id')
                ->where('s.type', $type)
                ->whereRaw("ST_Within(sec.boundary, (SELECT boundary FROM project_areas WHERE id = ?))", [$activeProjectArea->id])
                ->select([
                    's.sensor_id',
                    's.name as sensor_name',
                    's.type',
                    'sec.name as sector_name',
                    'ed.temperature',
                    'ed.humidity',
                    'ed.smoke_level',
                    'ed.recorded_at'
                ])
                ->orderBy('ed.recorded_at', 'desc')
                ->first();

            if ($latestReading) {
                $value = $this->formatSensorValue($latestReading, $type);
                $status = $this->getSensorStatus($latestReading);

                $liveData[] = [
                    'id' => $latestReading->sensor_id,
                    'type' => $type,
                    'value' => $value,
                    'status' => $status,
                    'timestamp' => Carbon::parse($latestReading->recorded_at)->format('Y-m-d H:i:s'),
                    'sector' => $latestReading->sector_name
                ];
            }
        }

        return response()->json(['data' => $liveData]);
    }

    /**
     * 📊 GET /dashboard/recent-alerts
     * آخر التنبيهات للـ Dashboard
     */
    public function recentAlerts(): JsonResponse
    {
        $alerts = Alert::with(['sector', 'sensor'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->alert_id,
                    'title' => $this->generateAlertTitle($alert),
                    'level' => $alert->alert_level,
                    'date' => Carbon::parse($alert->created_at)->format('Y/m/d H:i'),
                    'description' => $alert->message,
                    'sector' => $alert->sector?->name ?? 'N/A',
                    'acknowledged' => $alert->acknowledged_at !== null
                ];
            });

        return response()->json(['data' => $alerts]);
    }

    /**
     * 🔄 GET /dashboard/risk-distribution
     * توزيع المخاطر للخريطة
     */
    public function riskDistribution(): JsonResponse
    {
        $activeProjectArea = DB::table('project_areas')
            ->where('is_active', true)
            ->first();

        if (!$activeProjectArea) {
            return response()->json(['data' => []]);
        }

        // حساب متوسط المخاطر لكل قطاع
        $sectorRisks = DB::table('environmental_data as ed')
            ->join('sensors as s', 'ed.sensor_id', '=', 's.sensor_id')
            ->join('sectors as sec', 's.sector_id', '=', 'sec.sector_id')
            ->whereRaw("ST_Within(sec.boundary, (SELECT boundary FROM project_areas WHERE id = ?))", [$activeProjectArea->id])
            ->where('ed.recorded_at', '>=', Carbon::now()->subHours(1))
            ->select([
                'sec.sector_id',
                'sec.name',
                'sec.status',
                DB::raw('AVG(ed.temperature) as avg_temp'),
                DB::raw('AVG(ed.humidity) as avg_humidity'),
                DB::raw('AVG(ed.smoke_level) as avg_smoke'),
                DB::raw('COUNT(ed.id) as reading_count')
            ])
            ->groupBy('sec.sector_id', 'sec.name', 'sec.status')
            ->get()
            ->map(function ($sector) {
                // حساب المخاطر والحالة بشكل متسق مع RiskEvaluationService
                $evaluation = $this->evaluateSectorRisk([
                    'temperature' => $sector->avg_temp,
                    'humidity' => $sector->avg_humidity,
                    'smoke_level' => $sector->avg_smoke
                ]);

                return [
                    'sector_id' => $sector->sector_id,
                    'name' => $sector->name,
                    'status' => $this->mapDecisionToStatus($evaluation['decision']),
                    'risk_score' => round($evaluation['risk_score'], 1),
                    'readings' => $sector->reading_count,
                    'last_updated' => Carbon::now()->format('H:i:s')
                ];
            });

        return response()->json(['data' => $sectorRisks]);
    }

    /**
     * حساب Fire Risk Index
     */
    private function calculateFireRiskIndex(int $projectAreaId): float
    {
        $hourAgo = Carbon::now()->subHours(1);

        $avgData = DB::table('environmental_data as ed')
            ->join('sensors as s', 'ed.sensor_id', '=', 's.sensor_id')
            ->join('sectors as sec', 's.sector_id', '=', 'sec.sector_id')
            ->whereRaw("ST_Within(sec.boundary, (SELECT boundary FROM project_areas WHERE id = ?))", [$projectAreaId])
            ->where('ed.recorded_at', '>=', $hourAgo)
            ->select([
                DB::raw('AVG(ed.temperature) as avg_temp'),
                DB::raw('AVG(ed.humidity) as avg_humidity'),
                DB::raw('AVG(ed.smoke_level) as avg_smoke')
            ])
            ->first();

        if (!$avgData || !$avgData->avg_temp) {
            return 0.0;
        }

        // حساب Fire Risk Index للمشروع بأكمله
        $evaluation = $this->evaluateSectorRisk([
            'temperature' => $avgData->avg_temp,
            'humidity' => $avgData->avg_humidity,
            'smoke_level' => $avgData->avg_smoke
        ]);

        // تحويل نقاط المخاطر (0-100) إلى Fire Risk Index (0-10)
        return round($evaluation['risk_score'] / 10, 1);
    }

    /**
     * تحديد حالة النظام
     */
    private function getSystemStatus($sectorStats, $alertStats): string
    {
        if (($alertStats->critical_alerts ?? 0) > 0) {
            return 'Critical Alerts Detected';
        }

        if (($sectorStats->fire_sectors ?? 0) > 0) {
            return 'Fire Detected';
        }

        if (($sectorStats->warning_sectors ?? 0) > 2) {
            return 'Multiple Warnings';
        }

        if (($alertStats->active_alerts ?? 0) > 0) {
            return 'Active Alerts';
        }

        return 'Normal Operations';
    }

    /**
     * تنسيق قيمة الحساس
     */
    private function formatSensorValue($reading, string $type): string
    {
        switch ($type) {
            case 'Temperature':
                return round($reading->temperature, 1) . ' °C';
            case 'Humidity':
                return round($reading->humidity, 1) . ' %';
            case 'Smoke':
                return round($reading->smoke_level, 2) . ' ppm';
            case 'Multi-sensor':
                return round($reading->temperature, 1) . ' °C';
            default:
                return 'N/A';
        }
    }

    /**
     * تحديد حالة الحساس
     */
    private function getSensorStatus($reading): string
    {
        if ($reading->temperature > 80) return 'critical';
        if ($reading->smoke_level > 2.0) return 'critical';
        if ($reading->humidity < 20) return 'elevated';
        if ($reading->temperature > 50) return 'elevated';
        return 'normal';
    }

    /**
     * إنشاء عنوان التنبيه
     */
    private function generateAlertTitle($alert): string
    {
        $sectorName = $alert->sector?->name ?? 'Unknown Sector';
        $sensorName = $alert->sensor?->name ?? 'Unknown Sensor';

        return "{$alert->alert_type} - {$sectorName} ({$sensorName})";
    }

    /**
     * تقييم مخاطر القطاع بناءً على متوسط القراءات (نفس منطق RiskEvaluationService)
     */
    private function evaluateSectorRisk(array $telemetry): array
    {
        $temperature = $telemetry['temperature'] ?? null;
        $humidity = $telemetry['humidity'] ?? null;
        $smokeLevel = $telemetry['smoke_level'] ?? null;

        $riskScore = 0;
        $decision = 'safe';

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
                if ($decision !== 'fire') $decision = 'warning';
            } elseif ($smokeLevel > 0.6) {
                $riskScore += 10;
                if ($decision === 'safe') $decision = 'warning';
            }
        }

        // Combined Risk Logic
        if ($riskScore >= 70) {
            $decision = 'fire';
        } elseif ($riskScore >= 40) {
            $decision = 'warning';
        } elseif ($riskScore >= 20) {
            $decision = 'caution';
        }

        // Special cases
        if ($temperature !== null && $humidity !== null && $smokeLevel !== null) {
            // High temperature + Low humidity + Any smoke = High fire risk
            if ($temperature > 80 && $humidity < 20 && $smokeLevel > 0.3) {
                $decision = 'fire';
                $riskScore = max($riskScore, 85);
            }
        }

        return [
            'risk_score' => min($riskScore, 100),
            'decision' => $decision
        ];
    }

    /**
     * تحويل قرار المخاطر إلى حالة القطاع
     */
    private function mapDecisionToStatus(string $decision): string
    {
        return match ($decision) {
            'fire' => 'Fire',
            'warning', 'caution' => 'Warning',
            default => 'Safe'
        };
    }
}