<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClustersTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('clusters')->insert([
            [
                'cluster_name' => 'Main Forest Cluster',
                'description' => 'Primary monitored forest area',
                'center_lat' => 33.512,
                'center_lng' => 36.292,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
