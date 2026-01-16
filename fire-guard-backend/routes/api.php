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
Route::middleware('auth:sanctum')->get('/auth/permissions', [AuthController::class, 'getPermissions']);

Route::prefix('v1')->group(function () {
    Route::post('/telemetry', [TelemetryController::class, 'store']);
    Route::post('/gateway/telemetry', [GatewayTelemetryController::class, 'store']);
});

Route::middleware('auth:sanctum')->prefix('v1/alerts')->group(function () {

    Route::get('/', [AlertController::class, 'index'])->middleware('permission:view_alerts_center');
    Route::get('/{alert}', [AlertController::class, 'show'])->middleware('permission:view_alerts_center');
    Route::post('/{alert}/ack', [AlertController::class, 'ack'])->middleware('permission:view_alerts_center');
    Route::get('/stats/summary', [AlertController::class, 'stats'])->middleware('permission:view_dashboard');
});

Route::prefix('v1')->group(function () {
    Route::get('/sectors', [SectorController::class, 'index']);
    Route::post('/sectors', [SectorController::class, 'store']);
    Route::get('/sectors/geo', [SectorController::class, 'geo']);
    Route::get('/sensors/geo', [SensorController::class, 'geo']);
    Route::get('/project-areas/current', [ProjectAreaController::class, 'current']);
    Route::get('/map/alerts', [MapController::class, 'alerts']);
    Route::get('/map/historical-fires', [MapController::class, 'historicalFires']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/live-sensor-data', [DashboardController::class, 'liveSensorData']);
    Route::get('/dashboard/recent-alerts', [DashboardController::class, 'recentAlerts']);
    Route::get('/dashboard/risk-distribution', [DashboardController::class, 'riskDistribution']);
});

Route::middleware('auth:sanctum')->prefix('v1/sensors')->group(function () {
    Route::get('/', [SensorController::class, 'index'])->middleware('permission:view_sensor_management');
    Route::post('/', [SensorController::class, 'store'])->middleware('permission:view_sensor_management');
    Route::get('/stats/summary', [SensorController::class, 'stats'])->middleware('permission:view_dashboard');
    Route::get('/{sensor}', [SensorController::class, 'show'])->middleware('permission:view_sensor_management');
    Route::put('/{sensor}', [SensorController::class, 'update'])->middleware('permission:view_sensor_management');
    Route::delete('/{sensor}', [SensorController::class, 'destroy'])->middleware('permission:view_sensor_management');
    Route::get('/{sensor}/telemetry', [SensorController::class, 'telemetry'])->middleware('permission:view_sensor_management');
});

Route::middleware('auth:sanctum')->prefix('v1/gateways')->group(function () {
    Route::get('/', [GatewayController::class, 'index']);
    Route::post('/', [GatewayController::class, 'store']);
    Route::get('/{gateway}', [GatewayController::class, 'show']);
});

Route::middleware(['api'])->prefix('v1/gateways')->group(function () {
    Route::post('/telemetry', [GatewayController::class, 'receiveTelemetry']);
});

Route::post('/test/telemetry', function (Illuminate\Http\Request $request) {
    try {
        $data = $request->all();
        $riskService = app(\App\Services\RiskEvaluationService::class);

        $processedCount = 0;
        $alertsCreated = 0;

        foreach ($data['sensors'] ?? [] as $sensorData) {
            $sensorId = $sensorData['sensor_id'];

            \App\Models\EnvironmentalData::create([
                'sensor_id' => $sensorId,
                'temperature' => $sensorData['environment']['temperature'] ?? null,
                'humidity' => $sensorData['environment']['humidity'] ?? null,
                'smoke_level' => $sensorData['environment']['smoke'] ?? null,
                'recorded_at' => $sensorData['timestamp'] ?? now(),
            ]);

            \App\Models\Sensor::where('sensor_id', $sensorId)
                ->update([
                    'last_seen' => $sensorData['timestamp'] ?? now(),
                    'battery_level' => $sensorData['battery_level'] ?? null,
                ]);

            $riskEvaluation = $riskService->evaluateRisk($sensorData['environment']);

            \App\Models\AiAnalysisLog::create([
                'sensor_id' => $sensorId,
                'sector_id' => \App\Models\Sensor::find($sensorId)?->sector_id,
                'algorithm_name' => 'rule_based_v1',
                'input_data' => $sensorData['environment'],
                'risk_score' => $riskEvaluation['risk_score'],
                'decision' => $riskEvaluation['decision']
            ]);

            $sensor = \App\Models\Sensor::find($sensorId);
            if ($sensor && $sensor->sector_id) {
                try {
                    $riskService->updateSectorStatus($sensor->sector_id, $riskEvaluation['decision']);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Failed to update sector status: ' . $e->getMessage());
                }
            }

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

            if ($riskEvaluation['decision'] === 'fire' && $sensor && $sensor->sector_id) {
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
    Route::get('/analytics', [ReportController::class, 'analytics'])->middleware('permission:view_reports_analytics');
    Route::get('/export/{format}', [ReportController::class, 'export'])->middleware('permission:view_reports_analytics');
});

Route::middleware('auth:sanctum')->prefix('v1/roles')->group(function () {
    Route::get('/', [RoleController::class, 'index']);
    Route::post('/', [RoleController::class, 'store']);
    Route::put('/{role}', [RoleController::class, 'update']);
    Route::delete('/{role}', [RoleController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->prefix('v1/users')->group(function () {
    Route::get('/', [UserController::class, 'index'])->middleware('permission:manage_users');
    Route::post('/', [UserController::class, 'store'])->middleware('permission:manage_users');
    Route::get('/{user}', [UserController::class, 'show'])->middleware('permission:manage_users');
    Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:manage_users');
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:manage_users');
});

Route::middleware('auth:sanctum')->prefix('v1/settings')->group(function () {
    Route::get('/', [SettingsController::class, 'index']);
    Route::put('/', [SettingsController::class, 'update']);
});

Route::middleware('auth:sanctum')->prefix('v1/project-areas')->group(function () {
    Route::get('/', [ProjectAreaController::class, 'index']);
    Route::put('/current/boundary', [ProjectAreaController::class, 'updateCurrentBoundary']);
});

