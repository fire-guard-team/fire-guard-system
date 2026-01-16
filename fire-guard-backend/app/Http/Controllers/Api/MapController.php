<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectArea;
use App\Models\Sector;
use App\Models\WildfireEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MapController extends Controller
{
    /**
     * 📌 GET /map/alerts
     * Map overlay for warnings + fires.
     */
    public function alerts(): JsonResponse
    {
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();
        if (! $activeArea) {
            return response()->json([
                'warnings' => [],
                'fires' => [],
            ]);
        }

        $base = Sector::query()
            ->whereNotNull('boundary')
            ->whereRaw(
                "ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                [$activeArea->id]
            )
            ->select(['sector_id', 'name', 'status'])
            ->selectRaw("ST_Y(ST_Centroid(boundary)) as center_lat")
            ->selectRaw("ST_X(ST_Centroid(boundary)) as center_lng")
            ->selectRaw("GREATEST(ST_Area(boundary::geography), 1) as area_m2");

        $warnings = (clone $base)
            ->where('status', 'Warning')
            ->get()
            ->map(function ($s) {
                $radius = (float) sqrt(((float) $s->area_m2) / pi());
                return [
                    'sector_id' => $s->sector_id,
                    'sector_name' => $s->name,
                    'type' => 'warning',
                    'center_lat' => (float) $s->center_lat,
                    'center_lng' => (float) $s->center_lng,
                    'radius_m' => max(250.0, min($radius, 5000.0)),
                ];
            })
            ->values();

        // Fire overlay: sectors with status Fire OR active wildfire event
        $fireSectors = (clone $base)
            ->where('status', 'Fire')
            ->get()
            ->keyBy('sector_id');

        $activeEvents = WildfireEvent::query()
            ->where('status', 'Active')
            ->whereNotNull('sector_id')
            ->get(['event_id', 'sector_id', 'detected_at', 'spread_level', 'status']);

        $fires = collect();

        foreach ($fireSectors as $sectorId => $s) {
            $radius = (float) sqrt(((float) $s->area_m2) / pi());
            $fires->push([
                'sector_id' => $sectorId,
                'sector_name' => $s->name,
                'type' => 'fire',
                'event' => $activeEvents->firstWhere('sector_id', $sectorId),
                'center_lat' => (float) $s->center_lat,
                'center_lng' => (float) $s->center_lng,
                'radius_m' => max(400.0, min($radius, 8000.0)),
            ]);
        }

        // Also include events even if sector status not updated (fallback)
        foreach ($activeEvents as $event) {
            if ($fireSectors->has($event->sector_id)) {
                continue;
            }

            $s = (clone $base)->where('sector_id', $event->sector_id)->first();
            if (! $s) {
                continue;
            }

            $radius = (float) sqrt(((float) $s->area_m2) / pi());
            $fires->push([
                'sector_id' => $event->sector_id,
                'sector_name' => $s->name,
                'type' => 'fire',
                'event' => $event,
                'center_lat' => (float) $s->center_lat,
                'center_lng' => (float) $s->center_lng,
                'radius_m' => max(400.0, min($radius, 8000.0)),
            ]);
        }

        return response()->json([
            'warnings' => $warnings,
            'fires' => $fires->values(),
        ]);
    }

    /**
     * 📌 GET /map/historical-fires
     * Map overlay for past wildfire events (centroids)
     */
    public function historicalFires(): JsonResponse
    {
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();
        if (! $activeArea) {
            return response()->json([]);
        }

        // Limit to recent 200 events
        $events = WildfireEvent::query()
            ->whereNotNull('sector_id')
            ->where(function ($q) {
                $q->where('status', '!=', 'Active')
                    ->orWhereNotNull('closed_at');
            })
            ->orderByDesc('detected_at')
            ->limit(200)
            ->get(['event_id', 'sector_id', 'detected_at', 'closed_at', 'status', 'spread_level']);

        if ($events->isEmpty()) {
            return response()->json([]);
        }

        $sectorIds = $events->pluck('sector_id')->unique()->values()->all();

        $centroids = DB::table('sectors')
            ->whereIn('sector_id', $sectorIds)
            ->whereNotNull('boundary')
            ->whereRaw(
                "ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                [$activeArea->id]
            )
            ->select('sector_id', 'name')
            ->selectRaw("ST_Y(ST_Centroid(boundary)) as center_lat")
            ->selectRaw("ST_X(ST_Centroid(boundary)) as center_lng")
            ->get()
            ->keyBy('sector_id');

        $rows = $events->map(function ($e) use ($centroids) {
            $c = $centroids->get($e->sector_id);
            if (! $c) {
                return null;
            }
            return [
                'event_id' => $e->event_id,
                'sector_id' => $e->sector_id,
                'sector_name' => $c->name,
                'status' => $e->status,
                'spread_level' => $e->spread_level,
                'detected_at' => $e->detected_at,
                'closed_at' => $e->closed_at,
                'lat' => (float) $c->center_lat,
                'lng' => (float) $c->center_lng,
            ];
        })->filter()->values();

        return response()->json($rows);
    }
}

