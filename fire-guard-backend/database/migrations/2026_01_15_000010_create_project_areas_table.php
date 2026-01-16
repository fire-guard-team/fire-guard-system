<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ensure PostGIS exists (required for geometry types)
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');

        Schema::create('project_areas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Add geometry column with SRID 4326
        DB::statement('ALTER TABLE project_areas ADD COLUMN boundary geometry(POLYGON, 4326)');
    }

    public function down(): void
    {
        Schema::dropIfExists('project_areas');
    }
};

