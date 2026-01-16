<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EnvironmentalData;
use App\Models\Gateway;
use App\Models\Sensor;
use App\Models\Sector;
use App\Services\RiskEvaluationService;
use App\Models\AiAnalysisLog;
use App\Models\Alert;
use App\Models\WildfireEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class GatewayController extends Controller
{
    protected RiskEvaluationService $riskService;

    public function __construct(RiskEvaluationService $riskService)
    {
        $this->riskService = $riskService;
    }

    /**
     * 📡 POST /gateways/telemetry
     * استقبال البيانات من الـ Gateway
     */
    public function receiveTelemetry(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'gateway_id' => 'required|exists:gateways,gateway_id',
            'network_quality' => 'nullable|string|in:excellent,good,fair,poor',
            'sensors' => 'required|array',
            'sensors.*.sensor_id' => 'required|exists:sensors,sensor_id',
            'sensors.*.timestamp' => 'required|date',
            'sensors.*.environment.temperature' => 'nullable|numeric|min:-50|max:100',
            'sensors.*.environment.humidity' => 'nullable|numeric|min:0|max:100',
            'sensors.*.environment.smoke' => 'nullable|numeric|min:0',
            'sensors.*.battery_level' => 'nullable|integer|min:0|max:100',
            'sensors.*.signal_strength' => 'nullable|integer|min:-120|max:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid telemetry data',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $gatewayId = $request->gateway_id;
            $sensors = $request->sensors;

            // تحديث آخر وقت رؤية للـ gateway
            Gateway::where('gateway_id', $gatewayId)->update([
                'last_seen' => now(),
                'status' => 'active'
            ]);

            $processedCount = 0;
            $alertsCreated = 0;

            foreach ($sensors as $sensorData) {
                $processedCount += $this->processSensorTelemetry($sensorData, $gatewayId);
            }

            DB::commit();

            return response()->json([
                'message' => 'Telemetry processed successfully',
                'processed_sensors' => $processedCount,
                'alerts_created' => $alertsCreated
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to process telemetry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * معالجة بيانات sensor واحد
     */
    private function processSensorTelemetry(array $sensorData, int $gatewayId): int
    {
        $sensorId = $sensorData['sensor_id'];
        $timestamp = Carbon::parse($sensorData['timestamp']);

        // الحصول على معلومات الـ sensor
        $sensor = Sensor::with('sector')->find($sensorId);
        if (!$sensor) {
            return 0;
        }

        // حفظ البيانات البيئية
        EnvironmentalData::create([
            'sensor_id' => $sensorId,
            'temperature' => $sensorData['environment']['temperature'] ?? null,
            'humidity' => $sensorData['environment']['humidity'] ?? null,
            'smoke_level' => $sensorData['environment']['smoke'] ?? null,
            'recorded_at' => $timestamp,
        ]);

        // تحديث معلومات الـ sensor
        $sensor->update([
            'last_seen' => $timestamp,
            'battery_level' => $sensorData['battery_level'] ?? $sensor->battery_level,
        ]);

        // تقييم المخاطر
        $riskEvaluation = $this->riskService->evaluateRisk($sensorData['environment']);

        // تسجيل التحليل
        AiAnalysisLog::create([
            'sensor_id' => $sensorId,
            'sector_id' => $sensor->sector_id,
            'algorithm_name' => 'rule_based_v1',
            'input_data' => $sensorData['environment'],
            'risk_score' => $riskEvaluation['risk_score'],
            'decision' => $riskEvaluation['decision']
        ]);

        // تحديث حالة القطاع
        if ($sensor->sector_id) {
            $this->riskService->updateSectorStatus($sensor->sector_id, $riskEvaluation['decision']);
        }

        // إنشاء تنبيه إذا لزم الأمر
        if ($riskEvaluation['decision'] !== 'safe') {
            $this->createAlert($sensor, $sensorData, $riskEvaluation);
        }

        // إنشاء حدث حريق إذا كان هناك حريق
        if ($riskEvaluation['decision'] === 'fire' && $sensor->sector_id) {
            $this->createFireEvent($sensor->sector_id, $sensorId, $sensorData, $riskEvaluation);
        }

        return 1;
    }

    /**
     * إنشاء تنبيه
     */
    private function createAlert(Sensor $sensor, array $sensorData, array $riskEvaluation): void
    {
        $alertLevel = match ($riskEvaluation['decision']) {
            'fire' => 'Critical',
            'warning' => 'High',
            'caution' => 'Medium',
            default => 'Low'
        };

        $alertType = match ($riskEvaluation['decision']) {
            'fire' => 'Fire Detected',
            'warning' => 'High Risk Warning',
            'caution' => 'Caution Alert',
            default => 'Low Risk Notice'
        };

        Alert::create([
            'sensor_id' => $sensor->sensor_id,
            'sector_id' => $sensor->sector_id,
            'alert_level' => $alertLevel,
            'alert_type' => $alertType,
            'message' => "Risk evaluation: {$riskEvaluation['decision']} (Score: {$riskEvaluation['risk_score']})",
            'meta' => [
                'temperature' => $sensorData['environment']['temperature'] ?? null,
                'humidity' => $sensorData['environment']['humidity'] ?? null,
                'smoke_level' => $sensorData['environment']['smoke'] ?? null,
                'risk_score' => $riskEvaluation['risk_score'],
                'confidence' => $riskEvaluation['confidence']
            ],
            'resolved_at' => null
        ]);
    }

    /**
     * إنشاء حدث حريق
     */
    private function createFireEvent(int $sectorId, int $sensorId, array $sensorData, array $riskEvaluation): void
    {
        // التحقق من عدم وجود حدث حريق نشط في نفس القطاع
        $activeFire = WildfireEvent::where('sector_id', $sectorId)
            ->whereNull('closed_at')
            ->exists();

        if (!$activeFire) {
            WildfireEvent::create([
                'sensor_id' => $sensorId,
                'sector_id' => $sectorId,
                'status' => 'active',
                'spread_level' => 'contained',
                'detected_at' => now(),
                'meta' => [
                    'temperature' => $sensorData['environment']['temperature'] ?? null,
                    'humidity' => $sensorData['environment']['humidity'] ?? null,
                    'smoke_level' => $sensorData['environment']['smoke'] ?? null,
                    'risk_score' => $riskEvaluation['risk_score']
                ]
            ]);
        }
    }

    /**
     * 📡 GET /gateways
     * قائمة الـ gateways
     */
    public function index(): JsonResponse
    {
        $gateways = Gateway::orderBy('name')->get();
        return response()->json($gateways);
    }

    /**
     * 📡 GET /gateways/{gateway}
     * تفاصيل gateway
     */
    public function show(Gateway $gateway): JsonResponse
    {
        return response()->json($gateway);
    }

    /**
     * 📡 POST /gateways
     * إضافة gateway جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|min:-90|max:90',
            'longitude' => 'nullable|numeric|min:-180|max:180',
            'status' => 'nullable|string|in:active,offline,degraded'
        ]);

        $gateway = Gateway::create([
            'name' => $validated['name'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'last_seen' => now()
        ]);

        return response()->json($gateway, 201);
    }
}