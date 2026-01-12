<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGatewayTelemetryRequest;
use App\Models\Gateway;
use App\Models\GatewayHeartbeat;
use App\Jobs\ProcessTelemetryJob;
use App\Models\GatewayBufferedTelemetry;
use Illuminate\Http\JsonResponse;

class GatewayTelemetryController extends Controller
{

    public function store(StoreGatewayTelemetryRequest $request): JsonResponse
    {
        $data = $request->validated();

        // 1️⃣ تحميل الـ Gateway أولًا
        $gateway = Gateway::findOrFail($data['gateway_id']);

        $gateway->update([
            'last_seen' => now(),
            'status' => 'active',
        ]);

        // 2️⃣ تسجيل Heartbeat
        GatewayHeartbeat::create([
            'gateway_id' => $gateway->gateway_id,
            'received_sensors' => count($data['sensors']),
            'failed_sensors' => count($data['failed_nodes'] ?? []),
            'network_quality' => $data['network_quality'] ?? null,
            'received_at' => $data['received_at'],
        ]);

        $buffered = false;

        // 3️⃣ معالجة كل Sensor
        foreach ($data['sensors'] as $sensorPayload) {
            $telemetryPayload = [
                'sensor_id' => $sensorPayload['sensor_id'],
                'timestamp' => $sensorPayload['timestamp'],
                'environment' => $sensorPayload['environment'] ?? [],
                'location' => $sensorPayload['location'] ?? [],
                'device' => [
                    'gateway_id' => $gateway->gateway_id,
                    'network_quality' => $data['network_quality'] ?? null,
                ],
            ];

            // 🧱 Store & Forward
            if (! $this->internetAvailable()) {

                GatewayBufferedTelemetry::create([
                    'gateway_id' => $gateway->gateway_id,
                    'payload' => json_encode($telemetryPayload),
                    'received_at' => $data['received_at'], // ✅ مهم جدًا
                    'status' => 'pending',
                ]);

                $buffered = true;
                continue; // انتقل للحساس التالي
            }

            // 🚀 Dispatch Job
            ProcessTelemetryJob::dispatch($telemetryPayload);
        }

        if ($buffered) {
            return response()->json([
                'status' => 'stored',
                'message' => 'No internet. Telemetry buffered locally.',
            ], 202);
        }

        return response()->json([
            'status' => 'accepted',
            'message' => 'Gateway telemetry processed',
            'dispatched_sensors' => count($data['sensors']),
        ], 202);
    }

    private function internetAvailable(): bool
    {
        // محاكاة انقطاع الإنترنت
        // لاحقًا يمكن ربطها بـ ping أو health check
        return true; // أو false للاختبار
    }
}





/*
    public function store(StoreGatewayTelemetryRequest $request): JsonResponse
    {
        $data = $request->validated();

        // ===============================
        // STEP 1-B: Store & Forward
        // ===============================
        if (! $this->internetAvailable()) {

            GatewayBufferedTelemetry::create([
                'gateway_id' => $gateway->gateway_id,
                'payload' => json_encode($sensorPayload),
                'status' => 'pending',
            ]);

            return response()->json([
                'status' => 'stored',
                'message' => 'No internet. Telemetry stored locally.',
            ], 202);
        }

        // 1️⃣ تحديث حالة Gateway
        $gateway = Gateway::find($data['gateway_id']);
        $gateway->update([
            'last_seen' => now(),
            'status' => 'active',
        ]);

        // 2️⃣ تسجيل Heartbeat
        GatewayHeartbeat::create([
            'gateway_id' => $gateway->gateway_id,
            'received_sensors' => count($data['sensors']),
            'failed_sensors' => count($data['failed_nodes'] ?? []),
            'network_quality' => $data['network_quality'] ?? null,
            'received_at' => $data['received_at'],
        ]);



        // ===============================
        // 3️⃣ Dispatch Telemetry Jobs
        // ===============================
        foreach ($request->validated()['sensors'] as $sensorPayload) {

            $telemetryPayload = [
                'sensor_id' => $sensorPayload['sensor_id'],
                'timestamp' => $sensorPayload['timestamp'],
                'environment' => $sensorPayload['environment'] ?? [],
                'location' => $sensorPayload['location'] ?? [],
                'device' => [
                    'gateway_id' => $request->validated()['gateway_id'],
                    'network_quality' => $request->validated()['network_quality'] ?? null,
                ],
            ];

            ProcessTelemetryJob::dispatch($telemetryPayload);
        }


        return response()->json([
            'status' => 'accepted',
            'message' => 'Gateway telemetry processed',
            'dispatched_sensors' => count($data['sensors']),
        ], 202);
    }
*/