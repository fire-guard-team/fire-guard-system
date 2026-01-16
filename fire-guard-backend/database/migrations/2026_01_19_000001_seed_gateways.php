<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // إضافة gateways للغابة الساحلية السورية
        $gateways = [
            [
                'name' => 'Kasab Gateway',
                'latitude' => 35.95,
                'longitude' => 35.98,
                'status' => 'active',
                'last_seen' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Latakia Gateway',
                'latitude' => 35.52,
                'longitude' => 35.78,
                'status' => 'active',
                'last_seen' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jabal al-Akrad Gateway',
                'latitude' => 35.65,
                'longitude' => 36.15,
                'status' => 'active',
                'last_seen' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('gateways')->insert($gateways);

        echo "Added " . count($gateways) . " gateways\n";
    }

    public function down(): void
    {
        DB::table('gateways')->whereIn('name', [
            'Kasab Gateway',
            'Latakia Gateway',
            'Jabal al-Akrad Gateway'
        ])->delete();

        echo "Removed seeded gateways\n";
    }
};