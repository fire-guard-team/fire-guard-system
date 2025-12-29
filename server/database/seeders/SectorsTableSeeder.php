<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SectorsTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sectors')->insert([
            [
                'sector_name' => 'North Zone',
                'center_lat' => 33.510,
                'center_lng' => 36.290,
                'cluster_id' => 1,
                'status' => 'Safe',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sector_name' => 'South Zone',
                'center_lat' => 33.505,
                'center_lng' => 36.295,
                'cluster_id' => 1,
                'status' => 'Safe',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sector_name' => 'East Zone',
                'center_lat' => 33.515,
                'center_lng' => 36.300,
                'cluster_id' => 1,
                'status' => 'Safe',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sector_name' => 'West Zone',
                'center_lat' => 33.507,
                'center_lng' => 36.285,
                'cluster_id' => 1,
                'status' => 'Safe',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sector_name' => 'Central Zone',
                'center_lat' => 33.512,
                'center_lng' => 36.292,
                'cluster_id' => 1,
                'status' => 'Safe',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
