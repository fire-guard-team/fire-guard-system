<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SensorTypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('sensor_types')->insert([
            [
                'type_name' => 'Environmental Multi-Sensor',
                'description' => 'Combined temperature, humidity, smoke, gas readings'
            ],
            [
                'type_name' => 'Temperature & Humidity Sensor',
                'description' => 'Basic environmental conditions sensor'
            ],
            [
                'type_name' => 'Smoke/Gas Sensor',
                'description' => 'Air quality and smoke detection'
            ],
        ]);
    }
}
