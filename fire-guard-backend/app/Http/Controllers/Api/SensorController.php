<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sensor;
use App\Models\Sector;
use App\Models\EnvironmentalData;
use App\Models\ProjectArea;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
            'sector_id' => ['required', 'exists:sectors,sector_id'],
            'lat' => ['required', 'numeric', 'min:-90', 'max:90'],
            'lng' => ['required', 'numeric', 'min:-180', 'max:180'],
            'status' => ['nullable', 'string', 'in:active,offline,faulty'],
            'battery_level' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        // Enforce project area + sector containment
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();
        if (! $activeArea) {
            return response()->json(['message' => 'No active project area configured'], 409);
        }

        $sector = Sector::where('sector_id', $validated['sector_id'])->first();
        if (! $sector || ! $sector->boundary) {
            return response()->json(['message' => 'Sector boundary is not defined'], 422);
        }

        // Sensor point must be inside the sector boundary
        $insideSector = Sector::where('sector_id', $validated['sector_id'])
            ->whereRaw(
                "ST_Contains(boundary, ST_SetSRID(ST_Point(?, ?), 4326))",
                [$validated['lng'], $validated['lat']]
            )
            ->exists();

        if (! $insideSector) {
            return response()->json(['message' => 'Sensor location must be inside the selected sector'], 422);
        }

        // Sector must be inside the active project area
        $sectorInsideProject = Sector::where('sector_id', $validated['sector_id'])
            ->whereRaw(
                "ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                [$activeArea->id]
            )
            ->exists();

        if (! $sectorInsideProject) {
            return response()->json(['message' => 'Selected sector is outside the project area'], 422);
        }

        // Sensor point must be inside project area as well
        $insideProject = ProjectArea::where('id', $activeArea->id)
            ->whereRaw(
                "ST_Contains(boundary, ST_SetSRID(ST_Point(?, ?), 4326))",
                [$validated['lng'], $validated['lat']]
            )
            ->exists();

        if (! $insideProject) {
            return response()->json(['message' => 'Sensor location must be inside the project area'], 422);
        }

        $sensor = Sensor::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'sector_id' => $validated['sector_id'],
            'lat' => $validated['lat'],
            'lng' => $validated['lng'],
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
            'sector_id' => ['sometimes', 'required', 'exists:sectors,sector_id'],
            'lat' => ['sometimes', 'required', 'numeric', 'min:-90', 'max:90'],
            'lng' => ['sometimes', 'required', 'numeric', 'min:-180', 'max:180'],
            'status' => ['sometimes', 'string', 'in:active,offline,faulty'],
            'battery_level' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();
        if (! $activeArea) {
            return response()->json(['message' => 'No active project area configured'], 409);
        }

        $newSectorId = $validated['sector_id'] ?? $sensor->sector_id;
        $newLat = array_key_exists('lat', $validated) ? $validated['lat'] : $sensor->lat;
        $newLng = array_key_exists('lng', $validated) ? $validated['lng'] : $sensor->lng;

        if (! $newSectorId || $newLat === null || $newLng === null) {
            return response()->json(['message' => 'Sensor must have sector and coordinates'], 422);
        }

        $sector = Sector::where('sector_id', $newSectorId)->first();
        if (! $sector || ! $sector->boundary) {
            return response()->json(['message' => 'Sector boundary is not defined'], 422);
        }

        $insideSector = Sector::where('sector_id', $newSectorId)
            ->whereRaw(
                "ST_Contains(boundary, ST_SetSRID(ST_Point(?, ?), 4326))",
                [$newLng, $newLat]
            )
            ->exists();
        if (! $insideSector) {
            return response()->json(['message' => 'Sensor location must be inside the selected sector'], 422);
        }

        $sectorInsideProject = Sector::where('sector_id', $newSectorId)
            ->whereRaw(
                "ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                [$activeArea->id]
            )
            ->exists();
        if (! $sectorInsideProject) {
            return response()->json(['message' => 'Selected sector is outside the project area'], 422);
        }

        $insideProject = ProjectArea::where('id', $activeArea->id)
            ->whereRaw(
                "ST_Contains(boundary, ST_SetSRID(ST_Point(?, ?), 4326))",
                [$newLng, $newLat]
            )
            ->exists();
        if (! $insideProject) {
            return response()->json(['message' => 'Sensor location must be inside the project area'], 422);
        }

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
     * 📌 GET /sensors/geo
     * Sensors for map rendering (markers) - only within active project area
     */
    public function geo(): JsonResponse
    {
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();
        if (! $activeArea) {
            return response()->json([
                'message' => 'No active project area configured',
                'data' => [],
            ], 200);
        }

        $latestEnv = DB::table('environmental_data')
            ->selectRaw("DISTINCT ON (sensor_id) sensor_id, recorded_at, temperature, humidity, smoke_level, aqi")
            ->orderBy('sensor_id')
            ->orderByDesc('recorded_at');

        $rows = DB::table('sensors as s')
            ->join('sectors as sec', 'sec.sector_id', '=', 's.sector_id')
            ->leftJoinSub($latestEnv, 'ed', function ($join) {
                $join->on('ed.sensor_id', '=', 's.sensor_id');
            })
            ->whereNotNull('s.lat')
            ->whereNotNull('s.lng')
            ->whereNotNull('sec.boundary')
            ->whereRaw(
                "ST_Within(sec.boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                [$activeArea->id]
            )
            ->whereRaw(
                "ST_Contains((SELECT boundary FROM project_areas WHERE id = ?), ST_SetSRID(ST_Point(s.lng, s.lat), 4326))",
                [$activeArea->id]
            )
            ->select([
                's.sensor_id',
                's.name',
                's.type',
                's.status',
                's.battery_level',
                's.last_seen',
                's.lat',
                's.lng',
                's.sector_id',
                'sec.name as sector_name',
            ])
            ->addSelect([
                'ed.recorded_at as last_reading_at',
                'ed.temperature as last_temperature',
                'ed.humidity as last_humidity',
                'ed.smoke_level as last_smoke_level',
                'ed.aqi as last_aqi',
            ])
            ->orderBy('s.sensor_id')
            ->get();

        return response()->json($rows);
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
