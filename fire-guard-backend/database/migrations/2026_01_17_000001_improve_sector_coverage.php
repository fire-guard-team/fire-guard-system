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

        // Get current sectors count
        $existingSectorsCount = DB::table('sectors')
            ->where('project_area_id', $activeProjectArea->id)
            ->count();

        echo "Found {$existingSectorsCount} existing sectors for {$activeProjectArea->name}\n";

        // Temporarily disable the trigger during operations
        DB::statement('ALTER TABLE sectors DISABLE TRIGGER trg_enforce_sector_within_active_project_area');

        // Delete existing auto-generated sectors
        $deletedCount = DB::table('sectors')
            ->where('project_area_id', $activeProjectArea->id)
            ->where('name', 'like', 'Sector %')
            ->delete();

        echo "Deleted {$deletedCount} auto-generated sectors\n";

        // Get project area geometry info
        $bbox = DB::selectOne("
            SELECT
                ST_XMin(boundary) as minx,
                ST_YMin(boundary) as miny,
                ST_XMax(boundary) as maxx,
                ST_YMax(boundary) as maxy,
                ST_Area(boundary::geography) as area_m2
            FROM project_areas
            WHERE id = ?
        ", [$activeProjectArea->id]);

        if (!$bbox) {
            echo "Could not get project area bbox\n";
            DB::statement('ALTER TABLE sectors ENABLE TRIGGER trg_enforce_sector_within_active_project_area');
            return;
        }

        $minx = (float) $bbox->minx;
        $miny = (float) $bbox->miny;
        $maxx = (float) $bbox->maxx;
        $maxy = (float) $bbox->maxy;
        $totalArea = (float) $bbox->area_m2;

        echo "Project area: {$totalArea} m²\n";

        // Target sector count based on area (roughly 1 sector per 50km²)
        $targetSectorCount = max(8, min(32, (int)($totalArea / 50000000)));
        echo "Target sector count: {$targetSectorCount}\n";

        // Use a recursive grid subdivision approach for guaranteed coverage
        $sectorsData = [];
        $sectorNumber = 1;

        // Start with a finer grid (6x6 = 36 cells) to ensure coverage
        $rows = 6;
        $cols = 6;

        $dx = ($maxx - $minx) / $cols;
        $dy = ($maxy - $miny) / $rows;

        // Minimum sector area (smaller than before to fill gaps)
        $minSectorArea = $totalArea / (4 * $rows * $cols); // Allow smaller sectors for edge areas

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

        echo "Created " . count($sectorsData) . " sectors from grid subdivision\n";

        // Check for remaining gaps and create additional sectors to fill them
        $this->fillGaps($activeProjectArea->id, $sectorsData, $sectorNumber);

        // Insert all sectors
        if (!empty($sectorsData)) {
            DB::table('sectors')->insert($sectorsData);
            echo "Inserted " . count($sectorsData) . " sectors\n";
        }

        // Re-enable the trigger
        DB::statement('ALTER TABLE sectors ENABLE TRIGGER trg_enforce_sector_within_active_project_area');

        echo "Sector creation completed\n";
    }

    private function fillGaps($projectAreaId, &$sectorsData, &$sectorNumber)
    {
        // Find uncovered areas
        $gaps = DB::select("
            SELECT ST_AsText(geom) as gap_wkt, ST_Area(geom::geography) as area_m2
            FROM (
                SELECT (ST_Dump(ST_Difference(
                    pa.boundary,
                    COALESCE(ST_Union(s.boundary), ST_GeomFromText('POLYGON EMPTY', 4326))
                ))).geom as geom
                FROM project_areas pa
                LEFT JOIN sectors s ON s.project_area_id = pa.id
                WHERE pa.id = ?
                GROUP BY pa.boundary
            ) gaps
            WHERE ST_Area(geom::geography) > 5000
        ", [$projectAreaId]);

        echo "Found " . count($gaps) . " significant gaps to fill\n";

        foreach ($gaps as $gap) {
            // Create a sector for this gap
            $sectorsData[] = [
                'project_area_id' => $projectAreaId,
                'name' => sprintf('Sector %02d', $sectorNumber),
                'status' => 'Safe',
                'boundary' => DB::raw("ST_GeomFromText('{$gap->gap_wkt}', 4326)"),
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $sectorNumber++;
        }
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