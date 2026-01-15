<?php

namespace Database\Seeders;

use App\Models\Gateway;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GatewaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Gateway::create([
            'name' => 'Forest Edge Gateway A',
            'latitude' => 33.52,
            'longitude' => 36.30,
            'status' => 'active',
        ]);
    }
}
