<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Get all sectors that don't have sensors yet
        $sectorsWithoutSensors = DB::select("
            SELECT s.sector_id, s.name, s.boundary
            FROM sectors s
            LEFT JOIN sensors sen ON sen.sector_id = s.sector_id
            WHERE sen.sector_id IS NULL
            AND s.boundary IS NOT NULL
        ");

        echo "Found " . count($sectorsWithoutSensors) . " sectors without sensors\n";

        $sensorsData = [];
        $sensorTypes = ['Temperature', 'Humidity', 'Smoke', 'Multi-sensor'];

        foreach ($sectorsWithoutSensors as $sector) {
            // Get sector bounds
            $bounds = DB::selectOne("
                SELECT
                    ST_XMin(boundary) as minx,
                    ST_YMin(boundary) as miny,
                    ST_XMax(boundary) as maxx,
                    ST_YMax(boundary) as maxy
                FROM sectors
                WHERE sector_id = ?
            ", [$sector->sector_id]);

            if (!$bounds) continue;

            // Generate random point within sector bounds (approximate)
            $minx = (float) $bounds->minx;
            $miny = (float) $bounds->miny;
            $maxx = (float) $bounds->maxx;
            $maxy = (float) $bounds->maxy;

            // Generate 2-3 sensors per sector with random positions
            $numSensors = rand(2, 3);

            for ($i = 1; $i <= $numSensors; $i++) {
                // Generate random coordinates within bounds
                $lat = $miny + mt_rand(0, 1000) / 1000 * ($maxy - $miny);
                $lng = $minx + mt_rand(0, 1000) / 1000 * ($maxx - $minx);

                // Verify point is within sector
                $isWithin = DB::selectOne("
                    SELECT ST_Contains(boundary, ST_SetSRID(ST_Point(?, ?), 4326)) as is_within
                    FROM sectors WHERE sector_id = ?
                ", [$lng, $lat, $sector->sector_id])->is_within;

                if ($isWithin) {
                    $sensorsData[] = [
                        'name' => "Sensor {$sector->name}-{$i}",
                        'type' => $sensorTypes[array_rand($sensorTypes)],
                        'sector_id' => $sector->sector_id,
                        'lat' => $lat,
                        'lng' => $lng,
                        'status' => 'active',
                        'battery_level' => rand(70, 100),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        if (!empty($sensorsData)) {
            DB::table('sensors')->insert($sensorsData);
            echo "Added " . count($sensorsData) . " sensors to sectors\n";
        } else {
            echo "No sensors were added\n";
        }
    }

    public function down(): void
    {
        // Remove auto-generated sensors (those with names starting with "Sensor ")
        DB::table('sensors')
            ->where('name', 'like', 'Sensor %')
            ->delete();

        echo "Removed auto-generated sensors\n";
    }
};