<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectAreaController extends Controller
{
    /**
     * 📌 GET /project-areas
     * List project areas (metadata)
     */
    public function index(): JsonResponse
    {
        $areas = ProjectArea::query()
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get(['id', 'name', 'is_active', 'created_at', 'updated_at']);

        return response()->json($areas);
    }

    /**
     * 📌 GET /project-areas/current
     * Returns active project area boundary as GeoJSON + bbox
     */
    public function current(): JsonResponse
    {
        $area = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();

        if (! $area) {
            return response()->json([
                'message' => 'No active project area configured',
            ], 404);
        }

        $row = DB::table('project_areas')
            ->where('id', $area->id)
            ->selectRaw("id, name, is_active, ST_AsGeoJSON(boundary)::json as boundary_geojson")
            ->selectRaw("ST_XMin(boundary) as min_lng, ST_YMin(boundary) as min_lat, ST_XMax(boundary) as max_lng, ST_YMax(boundary) as max_lat")
            ->first();

        return response()->json([
            'id' => $row->id,
            'name' => $row->name,
            'is_active' => (bool) $row->is_active,
            'boundary' => $row->boundary_geojson,
            'bbox' => [
                'min_lat' => (float) $row->min_lat,
                'min_lng' => (float) $row->min_lng,
                'max_lat' => (float) $row->max_lat,
                'max_lng' => (float) $row->max_lng,
            ],
        ]);
    }

    /**
     * 📌 PUT /project-areas/current/boundary
     * Update active project area boundary from GeoJSON (geometry or feature)
     */
    public function updateCurrentBoundary(Request $request): JsonResponse
    {
        $area = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();
        if (! $area) {
            return response()->json(['message' => 'No active project area configured'], 404);
        }

        $validated = $request->validate([
            'boundary' => ['required'],
        ]);

        $boundary = $validated['boundary'];

        // Accept either Geometry or Feature
        if (is_array($boundary) && ($boundary['type'] ?? null) === 'Feature') {
            $boundary = $boundary['geometry'] ?? null;
        }

        if (! is_array($boundary) || ! isset($boundary['type'])) {
            return response()->json(['message' => 'Invalid GeoJSON boundary'], 422);
        }

        $type = $boundary['type'];
        if ($type !== 'Polygon') {
            return response()->json(['message' => 'Boundary must be a GeoJSON Polygon'], 422);
        }

        $geojson = json_encode($boundary, JSON_UNESCAPED_UNICODE);
        if (! $geojson) {
            return response()->json(['message' => 'Invalid GeoJSON boundary'], 422);
        }

        // Validate geometry in DB (SRID=4326, valid, not empty)
        $check = DB::selectOne(
            "SELECT
                ST_IsValid(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)) as is_valid,
                ST_IsEmpty(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)) as is_empty,
                ST_GeometryType(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)) as gtype
            ",
            [$geojson, $geojson, $geojson]
        );

        if (! $check || ! $check->is_valid || $check->is_empty || $check->gtype !== 'ST_Polygon') {
            return response()->json([
                'message' => 'Boundary geometry is invalid',
                'details' => [
                    'is_valid' => (bool) ($check->is_valid ?? false),
                    'is_empty' => (bool) ($check->is_empty ?? true),
                    'geometry_type' => $check->gtype ?? null,
                ],
            ], 422);
        }

        DB::statement(
            "UPDATE project_areas
             SET boundary = ST_SetSRID(ST_GeomFromGeoJSON(?), 4326),
                 updated_at = now()
             WHERE id = ?",
            [$geojson, $area->id]
        );

        return $this->current();
    }
}

