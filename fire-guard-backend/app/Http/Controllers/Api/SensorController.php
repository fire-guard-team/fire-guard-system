<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sensor;
use App\Models\Sector;
use App\Models\EnvironmentalData;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class SensorController extends Controller
{
    /**
     * 📌 GET /sensors
     * قائمة المستشعرات + فلاتر
     */
    public function index(Request $request): JsonResponse
    {
        $query = Sensor::with('sector')
            ->orderByDesc('created_at');

        // 🔍 فلترة حسب الحالة
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 🔍 فلترة حسب النوع
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // 🔍 فلترة حسب القطاع
        if ($request->filled('sector_id')) {
            $query->where('sector_id', $request->sector_id);
        }

        return response()->json(
            $query->paginate(15)
        );
    }

    /**
     * 📌 GET /sensors/{sensor}
     * تفاصيل مستشعر واحد
     */
    public function show(Sensor $sensor): JsonResponse
    {
        $sensor->load('sector');

        return response()->json($sensor);
    }

    /**
     * 📌 POST /sensors
     * إضافة مستشعر جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:Temperature,Humidity,Smoke,Multi-sensor'],
            'sector_id' => ['nullable', 'exists:sectors,sector_id'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string', 'in:active,offline,faulty'],
            'battery_level' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $sensor = Sensor::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'sector_id' => $validated['sector_id'] ?? null,
            'lat' => $validated['lat'] ?? null,
            'lng' => $validated['lng'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'battery_level' => $validated['battery_level'] ?? null,
        ]);

        $sensor->load('sector');

        return response()->json($sensor, 201);
    }

    /**
     * 📌 PUT /sensors/{sensor}
     * تحديث مستشعر
     */
    public function update(Request $request, Sensor $sensor): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', 'string', 'in:Temperature,Humidity,Smoke,Multi-sensor'],
            'sector_id' => ['nullable', 'exists:sectors,sector_id'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'status' => ['sometimes', 'string', 'in:active,offline,faulty'],
            'battery_level' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $sensor->update($validated);
        $sensor->load('sector');

        return response()->json($sensor);
    }

    /**
     * 📌 DELETE /sensors/{sensor}
     * حذف مستشعر
     */
    public function destroy(Sensor $sensor): JsonResponse
    {
        $sensor->delete();

        return response()->json([
            'message' => 'Sensor deleted successfully'
        ]);
    }

    /**
     * 📌 GET /sensors/stats/summary
     * إحصائيات المستشعرات
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Sensor::count(),
            'active' => Sensor::where('status', 'active')->count(),
            'offline' => Sensor::where('status', 'offline')->count(),
            'faulty' => Sensor::where('status', 'faulty')->count(),
            'by_type' => [
                'Temperature' => Sensor::where('type', 'Temperature')->count(),
                'Humidity' => Sensor::where('type', 'Humidity')->count(),
                'Smoke' => Sensor::where('type', 'Smoke')->count(),
                'Multi-sensor' => Sensor::where('type', 'Multi-sensor')->count(),
            ],
        ]);
    }

    /**
     * 📌 GET /sensors/{sensor}/telemetry
     * البيانات التاريخية للمستشعر
     */
    public function telemetry(Request $request, Sensor $sensor): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['nullable', 'string', 'in:temperature,humidity,smoke'],
            'hours' => ['nullable', 'integer', 'min:1', 'max:168'], // Max 7 days (168 hours)
        ]);

        $hours = $validated['hours'] ?? 24;
        $dataType = $validated['type'] ?? null;

        $startDate = Carbon::now()->subHours($hours);

        $query = EnvironmentalData::where('sensor_id', $sensor->sensor_id)
            ->where('recorded_at', '>=', $startDate)
            ->orderBy('recorded_at', 'asc');

        $data = $query->get(['recorded_at', 'temperature', 'humidity', 'smoke_level']);

        // Format data for chart
        $chartData = $data->map(function ($item) use ($dataType, $sensor) {
            $timestamp = Carbon::parse($item->recorded_at);
            
            // Determine value based on sensor type and requested type
            $value = null;
            if ($dataType) {
                switch ($dataType) {
                    case 'temperature':
                        $value = $item->temperature;
                        break;
                    case 'humidity':
                        $value = $item->humidity;
                        break;
                    case 'smoke':
                        $value = $item->smoke_level;
                        break;
                }
            } else {
                // Auto-select based on sensor type
                switch ($sensor->type) {
                    case 'Temperature':
                        $value = $item->temperature;
                        break;
                    case 'Humidity':
                        $value = $item->humidity;
                        break;
                    case 'Smoke':
                        $value = $item->smoke_level;
                        break;
                    case 'Multi-sensor':
                        // Default to temperature for multi-sensor
                        $value = $item->temperature;
                        break;
                }
            }

            return [
                'time' => $timestamp->format('h:i A'),
                'timestamp' => $timestamp->toISOString(),
                'value' => $value,
                'temperature' => $item->temperature,
                'humidity' => $item->humidity,
                'smoke' => $item->smoke_level,
            ];
        })->filter(function ($item) {
            return $item['value'] !== null;
        })->values();

        return response()->json([
            'sensor_type' => $sensor->type,
            'data_type' => $dataType ?? $this->getDefaultDataType($sensor->type),
            'hours' => $hours,
            'data' => $chartData,
        ]);
    }

    private function getDefaultDataType(string $sensorType): string
    {
        return match ($sensorType) {
            'Temperature' => 'temperature',
            'Humidity' => 'humidity',
            'Smoke' => 'smoke',
            'Multi-sensor' => 'temperature',
            default => 'temperature',
        };
    }
}
