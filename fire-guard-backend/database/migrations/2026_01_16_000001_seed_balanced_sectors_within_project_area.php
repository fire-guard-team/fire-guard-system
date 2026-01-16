<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $activeProjectArea = DB::table('project_areas')
            ->where('is_active', true)
            ->orderBy('id')
            ->first(['id', 'name']);

        if (!$activeProjectArea) {
            return;
        }

        // Check if sectors already exist for this project area
        $existingSectors = DB::table('sectors')
            ->where('project_area_id', $activeProjectArea->id)
            ->whereNotNull('boundary')
            ->count();

        if ($existingSectors > 0) {
            return;
        }

        // Temporarily disable the trigger during insertion
        DB::statement('ALTER TABLE sectors DISABLE TRIGGER trg_enforce_sector_within_active_project_area');

        // Get project area bbox and area info
        $bbox = DB::selectOne("
            SELECT
                ST_XMin(boundary) as minx,
                ST_YMin(boundary) as miny,
                ST_XMax(boundary) as maxx,
                ST_YMax(boundary) as maxy,
                GREATEST(ST_Area(boundary::geography), 1) as area_m2
            FROM project_areas
            WHERE id = ?
        ", [$activeProjectArea->id]);

        if (!$bbox) {
            return;
        }

        $minx = (float) $bbox->minx;
        $miny = (float) $bbox->miny;
        $maxx = (float) $bbox->maxx;
        $maxy = (float) $bbox->maxy;
        $totalArea = (float) $bbox->area_m2;

        // Create a 4x4 grid for balanced sector distribution, then intersect with project boundary
        $rows = 4;
        $cols = 4;

        $dx = ($maxx - $minx) / $cols;
        $dy = ($maxy - $miny) / $rows;

        // Minimum sector area (filter tiny slivers)
        $minSectorArea = $totalArea / (4 * $rows * $cols); // Allow smaller sectors for edge areas

        $sectorNumber = 1;
        $sectorsData = [];

        for ($row = 0; $row < $rows; $row++) {
            for ($col = 0; $col < $cols; $col++) {
                $cellMinX = $minx + ($col * $dx);
                $cellMaxX = $minx + (($col + 1) * $dx);
                $cellMinY = $miny + ($row * $dy);
                $cellMaxY = $miny + (($row + 1) * $dy);

                // Create polygon for this cell
                $cellWkt = sprintf(
                    "POLYGON((%f %f, %f %f, %f %f, %f %f, %f %f))",
                    $cellMinX, $cellMinY,
                    $cellMaxX, $cellMinY,
                    $cellMaxX, $cellMaxY,
                    $cellMinX, $cellMaxY,
                    $cellMinX, $cellMinY
                );

                // Calculate intersection with project boundary and extract individual polygons
                $results = DB::select("
                    SELECT
                        ST_AsText((ST_Dump(ST_Intersection(
                            ST_SetSRID(ST_GeomFromText(?), 4326),
                            boundary
                        ))).geom) as polygon_wkt,
                        ST_Area((ST_Dump(ST_Intersection(
                            ST_SetSRID(ST_GeomFromText(?), 4326),
                            boundary
                        ))).geom::geography) as area_m2
                    FROM project_areas
                    WHERE id = ?
                    AND ST_Intersects(ST_SetSRID(ST_GeomFromText(?), 4326), boundary)
                ", [$cellWkt, $cellWkt, $activeProjectArea->id, $cellWkt]);

                foreach ($results as $result) {
                    if ($result->polygon_wkt && $result->area_m2 > $minSectorArea) {
                        // Make sure it's a POLYGON, not MULTIPOLYGON
                        if (str_starts_with($result->polygon_wkt, 'POLYGON')) {
                            $sectorsData[] = [
                                'project_area_id' => $activeProjectArea->id,
                                'name' => sprintf('Sector %02d', $sectorNumber),
                                'status' => 'Safe',
                                'boundary' => DB::raw("ST_GeomFromText('{$result->polygon_wkt}', 4326)"),
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                            $sectorNumber++;
                        }
                    }
                }
            }
        }

        // Insert all sectors at once
        if (!empty($sectorsData)) {
            DB::table('sectors')->insert($sectorsData);
        }

        // Re-enable the trigger
        DB::statement('ALTER TABLE sectors ENABLE TRIGGER trg_enforce_sector_within_active_project_area');
    }

    public function down(): void
    {
        // Temporarily disable trigger during deletion
        DB::statement('ALTER TABLE sectors DISABLE TRIGGER trg_enforce_sector_within_active_project_area');

        // Only delete auto-generated sectors for active project areas
        $activeProjectArea = DB::table('project_areas')
            ->where('is_active', true)
            ->orderBy('id')
            ->first(['id']);

        if ($activeProjectArea) {
            DB::table('sectors')
                ->where('project_area_id', $activeProjectArea->id)
                ->where('name', 'like', 'Sector %')
                ->delete();
        }

        // Re-enable the trigger
        DB::statement('ALTER TABLE sectors ENABLE TRIGGER trg_enforce_sector_within_active_project_area');
    }
};