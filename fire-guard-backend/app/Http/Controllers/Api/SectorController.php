<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use App\Models\ProjectArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SectorController extends Controller
{
    /**
     * 📌 GET /sectors
     * قائمة القطاعات
     */
    public function index(): JsonResponse
    {
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();

        $query = Sector::query()->orderBy('name');

        // Only sectors inside active project area should be selectable/visible.
        if ($activeArea) {
            $query->whereNotNull('boundary')
                ->whereRaw(
                    "ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                    [$activeArea->id]
                );
        }

        $sectors = $query->get(['sector_id', 'name']);

        return response()->json($sectors);
    }

    /**
     * 📌 GET /sectors/geo
     * Polygons for map rendering (GeoJSON)
     */
    public function geo(): JsonResponse
    {
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();

        $query = Sector::query()
            ->whereNotNull('boundary')
            ->orderBy('name');

        if ($activeArea) {
            $query->whereRaw(
                "ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                [$activeArea->id]
            );
        }

        $rows = $query
            ->select(['sector_id', 'project_area_id', 'name', 'status'])
            ->selectRaw("ST_AsGeoJSON(boundary)::json as boundary")
            ->get();

        return response()->json($rows);
    }
}
