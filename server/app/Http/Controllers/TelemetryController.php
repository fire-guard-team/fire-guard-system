<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Sensor;
use App\Models\EnvironmentalData;
use App\Jobs\ProcessTelemetryJob;
use Illuminate\Validation\ValidationException;

class TelemetryController extends Controller
{
    public function ingest(Request $request)
    {
        $data = $request->validate([
            'sensor_id'   => 'required|integer|exists:sensors,sensor_id',
            'timestamp'   => 'nullable|date',
            'lat'         => 'nullable|numeric',
            'lng'         => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
            'humidity'    => 'nullable|numeric',
            'smoke_level' => 'nullable|numeric',
            'aqi'         => 'nullable|numeric',
            'battery'     => 'nullable|integer',
            'rssi'        => 'nullable|integer',
        ]);

        $data['recorded_at'] = $data['timestamp'] ?? now();

        ProcessTelemetryJob::dispatch($data);

        return response()->json([
            'status' => 'accepted',
            'message' => 'Telemetry received and queued for processing'
        ], 202);
    }
}
