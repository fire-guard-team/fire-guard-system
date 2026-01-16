<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GatewayTelemetryController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ProjectAreaController;
use App\Http\Controllers\Api\MapController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TelemetryController;


Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);

Route::prefix('v1')->group(function () {
    Route::post('/telemetry', [TelemetryController::class, 'store']);
    Route::post('/gateway/telemetry', [GatewayTelemetryController::class, 'store']);
});

Route::middleware('auth:sanctum')->prefix('v1/alerts')->group(function () {

    Route::get('/', [AlertController::class, 'index']);          // قائمة + فلاتر
    Route::get('/{alert}', [AlertController::class, 'show']);    // تفاصيل
    Route::post('/{alert}/ack', [AlertController::class, 'ack']); // Acknowledge
    Route::get('/stats/summary', [AlertController::class, 'stats']); // Dashboard
});

// Public (read-only) map data
Route::prefix('v1')->group(function () {
    Route::get('/sectors', [SectorController::class, 'index']); // قائمة القطاعات داخل Project Area
    Route::post('/sectors', [SectorController::class, 'store']); // إضافة قطاع جديد
    Route::get('/sectors/geo', [SectorController::class, 'geo']); // polygons
    Route::get('/sensors/geo', [SensorController::class, 'geo']); // markers
    Route::get('/project-areas/current', [ProjectAreaController::class, 'current']); // active boundary
    Route::get('/map/alerts', [MapController::class, 'alerts']); // warnings + fires
    Route::get('/map/historical-fires', [MapController::class, 'historicalFires']); // past events

    // Dashboard APIs (Public for frontend)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']); // إحصائيات عامة
    Route::get('/dashboard/live-sensor-data', [DashboardController::class, 'liveSensorData']); // بيانات الحساسات الحية
    Route::get('/dashboard/recent-alerts', [DashboardController::class, 'recentAlerts']); // آخر التنبيهات
    Route::get('/dashboard/risk-distribution', [DashboardController::class, 'riskDistribution']); // توزيع المخاطر
});

Route::middleware('auth:sanctum')->prefix('v1/sensors')->group(function () {
    Route::get('/', [SensorController::class, 'index']);          // قائمة + فلاتر
    Route::post('/', [SensorController::class, 'store']);         // إضافة جديد
    Route::get('/stats/summary', [SensorController::class, 'stats']); // إحصائيات
    Route::get('/{sensor}', [SensorController::class, 'show']);   // تفاصيل
    Route::put('/{sensor}', [SensorController::class, 'update']); // تحديث
    Route::delete('/{sensor}', [SensorController::class, 'destroy']); // حذف
    Route::get('/{sensor}/telemetry', [SensorController::class, 'telemetry']); // البيانات التاريخية
});

Route::middleware('auth:sanctum')->prefix('v1/gateways')->group(function () {
    Route::get('/', [GatewayController::class, 'index']);         // قائمة الـ gateways
    Route::post('/', [GatewayController::class, 'store']);        // إضافة gateway جديد
    Route::get('/{gateway}', [GatewayController::class, 'show']); // تفاصيل gateway
});

// Endpoint بدون مصادقة للاختبار (في بيئة التطوير فقط)
Route::middleware(['api'])->prefix('v1/gateways')->group(function () {
    Route::post('/telemetry', [GatewayController::class, 'receiveTelemetry']); // استقبال البيانات
});

// Endpoint كامل للاختبار مع التحليل
Route::post('/test/telemetry', function (Illuminate\Http\Request $request) {
    try {
        $data = $request->all();
        $riskService = app(\App\Services\RiskEvaluationService::class);

        $processedCount = 0;
        $alertsCreated = 0;

        // معالجة كل sensor
        foreach ($data['sensors'] ?? [] as $sensorData) {
            $sensorId = $sensorData['sensor_id'];

            // حفظ البيانات البيئية
            \App\Models\EnvironmentalData::create([
                'sensor_id' => $sensorId,
                'temperature' => $sensorData['environment']['temperature'] ?? null,
                'humidity' => $sensorData['environment']['humidity'] ?? null,
                'smoke_level' => $sensorData['environment']['smoke'] ?? null,
                'recorded_at' => $sensorData['timestamp'] ?? now(),
            ]);

            // تحديث Sensor
            \App\Models\Sensor::where('sensor_id', $sensorId)
                ->update([
                    'last_seen' => $sensorData['timestamp'] ?? now(),
                    'battery_level' => $sensorData['battery_level'] ?? null,
                ]);

            // تحليل المخاطر
            $riskEvaluation = $riskService->evaluateRisk($sensorData['environment']);

            // تسجيل التحليل
            \App\Models\AiAnalysisLog::create([
                'sensor_id' => $sensorId,
                'sector_id' => \App\Models\Sensor::find($sensorId)?->sector_id,
                'algorithm_name' => 'rule_based_v1',
                'input_data' => $sensorData['environment'],
                'risk_score' => $riskEvaluation['risk_score'],
                'decision' => $riskEvaluation['decision']
            ]);

            // تحديث حالة القطاع (مع تعطيل الـ trigger مؤقتاً)
            $sensor = \App\Models\Sensor::find($sensorId);
            if ($sensor && $sensor->sector_id) {
                try {
                    $riskService->updateSectorStatus($sensor->sector_id, $riskEvaluation['decision']);
                } catch (\Exception $e) {
                    // تجاهل أخطاء الـ trigger للاختبار
                    \Illuminate\Support\Facades\Log::warning('Failed to update sector status: ' . $e->getMessage());
                }
            }

            // إنشاء تنبيه إذا لزم الأمر
            if ($riskEvaluation['decision'] !== 'safe') {
                \App\Models\Alert::create([
                    'sensor_id' => $sensorId,
                    'sector_id' => $sensor->sector_id ?? null,
                    'alert_source' => 'ai',
                    'alert_level' => match ($riskEvaluation['decision']) {
                        'fire' => 'Critical',
                        'warning' => 'High',
                        'caution' => 'Medium',
                        default => 'Low'
                    },
                    'alert_type' => match ($riskEvaluation['decision']) {
                        'fire' => 'Fire Detected',
                        'warning' => 'High Risk Warning',
                        'caution' => 'Caution Alert',
                        default => 'Low Risk Notice'
                    },
                    'message' => "Risk evaluation: {$riskEvaluation['decision']} (Score: {$riskEvaluation['risk_score']})",
                    'meta' => [
                        'temperature' => $sensorData['environment']['temperature'] ?? null,
                        'humidity' => $sensorData['environment']['humidity'] ?? null,
                        'smoke_level' => $sensorData['environment']['smoke'] ?? null,
                        'risk_score' => $riskEvaluation['risk_score'],
                        'confidence' => $riskEvaluation['confidence']
                    ]
                ]);
                $alertsCreated++;
            }

            // إنشاء حدث حريق إذا كان هناك حريق
            if ($riskEvaluation['decision'] === 'fire' && $sensor && $sensor->sector_id) {
                // التحقق من عدم وجود حدث حريق نشط في نفس القطاع
                $activeFire = \App\Models\WildfireEvent::where('sector_id', $sensor->sector_id)
                    ->whereNull('closed_at')
                    ->exists();

                if (!$activeFire) {
                    \App\Models\WildfireEvent::create([
                        'sensor_id' => $sensorId,
                        'sector_id' => $sensor->sector_id,
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

            $processedCount++;
        }

        return response()->json([
            'message' => 'Telemetry processed with analysis',
            'processed_sensors' => $processedCount,
            'alerts_created' => $alertsCreated
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

Route::middleware('auth:sanctum')->prefix('v1/reports')->group(function () {
    Route::get('/analytics', [ReportController::class, 'analytics']); // التقارير والتحليلات
    Route::get('/export/{format}', [ReportController::class, 'export']); // تصدير البيانات (csv, pdf, excel)
});

Route::middleware('auth:sanctum')->prefix('v1/roles')->group(function () {
    Route::get('/', [RoleController::class, 'index']); // قائمة الأدوار
    Route::post('/', [RoleController::class, 'store']); // إضافة دور
    Route::put('/{role}', [RoleController::class, 'update']); // تحديث دور
    Route::delete('/{role}', [RoleController::class, 'destroy']); // حذف دور
});

Route::middleware('auth:sanctum')->prefix('v1/users')->group(function () {
    Route::get('/', [UserController::class, 'index']);          // قائمة + فلاتر
    Route::post('/', [UserController::class, 'store']);         // إضافة جديد
    Route::get('/{user}', [UserController::class, 'show']);   // تفاصيل
    Route::put('/{user}', [UserController::class, 'update']); // تحديث
    Route::delete('/{user}', [UserController::class, 'destroy']); // حذف
});

Route::middleware('auth:sanctum')->prefix('v1/settings')->group(function () {
    Route::get('/', [SettingsController::class, 'index']); // get settings
    Route::put('/', [SettingsController::class, 'update']); // update settings
});

Route::middleware('auth:sanctum')->prefix('v1/project-areas')->group(function () {
    Route::get('/', [ProjectAreaController::class, 'index']); // list (admin)
    Route::put('/current/boundary', [ProjectAreaController::class, 'updateCurrentBoundary']); // update boundary (admin)
});

