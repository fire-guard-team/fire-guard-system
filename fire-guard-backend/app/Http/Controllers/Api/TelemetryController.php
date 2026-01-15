<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreTelemetryRequest;
use App\DTOs\TelemetryDTO;
use App\Jobs\ProcessTelemetryJob;
use Illuminate\Http\JsonResponse;


class TelemetryController extends Controller
{
    /**
     * Receive telemetry data from sensors / gateways
     */
    public function store(StoreTelemetryRequest $request): JsonResponse
    {
        // 1️⃣ تحويل البيانات إلى DTO
        $telemetry = TelemetryDTO::fromArray($request->validated());

        // 2️⃣ إرسال المعالجة إلى Queue
        ProcessTelemetryJob::dispatch($request->validated());
        // 3️⃣ إرجاع استجابة غير متزامنة
        return response()->json([
            'status' => 'accepted',
            'message' => 'Telemetry received and queued for processing'
        ], 202);
    }
}
