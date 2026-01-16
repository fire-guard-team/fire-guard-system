<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Approximate polygon covering targeted Syrian coastal forests:
        // Kasab (Syrian–Turkish border) + Jabal al-Akrad + northern rural Latakia.
        // NOTE: This is an initial approximation and can be refined later.
        $wkt = "POLYGON((35.90 35.99, 36.50 35.99, 36.60 35.70, 36.45 35.45, 35.95 35.45, 35.85 35.70, 35.90 35.99))";

        $exists = DB::table('project_areas')->where('name', 'Syrian Coastal Forests')->exists();
        if ($exists) {
            return;
        }

        DB::table('project_areas')->insert([
            'name' => 'Syrian Coastal Forests',
            'is_active' => true,
            'boundary' => DB::raw("ST_SetSRID(ST_GeomFromText('{$wkt}'), 4326)"),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('project_areas')->where('name', 'Syrian Coastal Forests')->delete();
    }
};

