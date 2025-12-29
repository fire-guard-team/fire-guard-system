<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SensorsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sensors = [];

        for ($i = 1; $i <= 10; $i++) {

            $sensors[] = [
                'sensor_name'      => 'Sensor-' . $i,
                'device_id'        => 'DEV-SN-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'type_id'          => 1, 
                'sector_id'        => 1, 
                'latitude'         => 33.51000 + (0.001 * $i),
                'longitude'        => 36.29000 + (0.001 * $i),
                'battery_level'    => rand(60, 100),
                'status'           => 'Active',
                'last_heartbeat'   => now(),
                'installation_date' => now()->subDays(rand(1, 30)),
                'created_at'       => now(),
                'updated_at'       => now(),
            ];
        }

        DB::table('sensors')->insert($sensors);
    }
}
